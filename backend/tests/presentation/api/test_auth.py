import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import get_session
from app.core.security import hash_password
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.main import app
from tests.infrastructure.database.conftest import (
    new_session,
    reset_schema,
    run_async,
    session_factory_for_tests,
)

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "Admin123!"
SUPPORT_EMAIL = "support1@example.com"
SUPPORT_PASSWORD = "Support123!"


async def _override_get_session():
    async with session_factory_for_tests() as session:
        yield session


app.dependency_overrides[get_session] = _override_get_session
client = TestClient(app)


def setup_module() -> None:
    reset_schema()

    async def _seed() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            now = datetime.now(timezone.utc)
            await repo.create(
                User(
                    id=uuid.uuid4(),
                    company_id=None,
                    name="System Administrator",
                    email=ADMIN_EMAIL,
                    password_hash=hash_password(ADMIN_PASSWORD),
                    role=UserRole.ADMIN,
                    is_active=True,
                    created_at=now,
                    updated_at=now,
                )
            )
            await repo.create(
                User(
                    id=uuid.uuid4(),
                    company_id=None,
                    name="Support User 1",
                    email=SUPPORT_EMAIL,
                    password_hash=hash_password(SUPPORT_PASSWORD),
                    role=UserRole.SUPPORT,
                    is_active=True,
                    created_at=now,
                    updated_at=now,
                )
            )
            await session.commit()

    run_async(_seed())


def _make_token(claims: dict) -> str:
    return jwt.encode(claims, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


# --- POST /auth/login -------------------------------------------------------


def test_login_success() -> None:
    response = client.post(
        "/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert isinstance(body["access_token"], str) and body["access_token"]


def test_login_unknown_user_returns_401() -> None:
    response = client.post(
        "/api/v1/auth/login", json={"email": "nobody@example.com", "password": "whatever"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_wrong_password_returns_401() -> None:
    response = client.post(
        "/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_invalid_request_returns_422() -> None:
    response = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL})

    assert response.status_code == 422


def test_login_token_contains_expected_claims() -> None:
    response = client.post(
        "/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    token = response.json()["access_token"]

    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

    assert payload["role"] == "ADMIN"
    assert "sub" in payload
    assert "exp" in payload


# --- GET /auth/me ------------------------------------------------------------


def test_me_with_valid_token_returns_current_user() -> None:
    login_response = client.post(
        "/api/v1/auth/login", json={"email": SUPPORT_EMAIL, "password": SUPPORT_PASSWORD}
    )
    token = login_response.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == SUPPORT_EMAIL
    assert body["name"] == "Support User 1"
    assert body["role"] == "SUPPORT"
    assert "id" in body
    assert "password" not in body
    assert "password_hash" not in body


def test_me_without_token_returns_401() -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_me_with_invalid_token_returns_401() -> None:
    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
    )

    assert response.status_code == 401


def test_me_with_expired_token_returns_401() -> None:
    now = datetime.now(timezone.utc)
    expired_token = _make_token(
        {
            "sub": str(uuid.uuid4()),
            "role": "ADMIN",
            "company_id": None,
            "iat": now - timedelta(minutes=120),
            "exp": now - timedelta(minutes=60),
        }
    )

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})

    assert response.status_code == 401


def test_me_with_nonexistent_user_returns_401() -> None:
    now = datetime.now(timezone.utc)
    token = _make_token(
        {
            "sub": str(uuid.uuid4()),
            "role": "ADMIN",
            "company_id": None,
            "iat": now,
            "exp": now + timedelta(minutes=60),
        }
    )

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 401
