import uuid
from datetime import datetime, timezone

from fastapi.testclient import TestClient

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

ADMIN_EMAIL = "companies-admin@example.com"
ADMIN_PASSWORD = "Admin123!"
SUPPORT_EMAIL = "companies-support@example.com"
SUPPORT_PASSWORD = "Support123!"
USER_EMAIL = "companies-user@example.com"
USER_PASSWORD = "User123!"


async def _override_get_session():
    async with session_factory_for_tests() as session:
        yield session


app.dependency_overrides[get_session] = _override_get_session
client = TestClient(app)

_admin_token = ""
_support_token = ""
_user_token = ""


def setup_module() -> None:
    reset_schema()

    async def _seed() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            now = datetime.now(timezone.utc)
            for email, password, role, name in [
                (ADMIN_EMAIL, ADMIN_PASSWORD, UserRole.ADMIN, "Companies Admin"),
                (SUPPORT_EMAIL, SUPPORT_PASSWORD, UserRole.SUPPORT, "Companies Support"),
                (USER_EMAIL, USER_PASSWORD, UserRole.USER, "Companies Plain User"),
            ]:
                await repo.create(
                    User(
                        id=uuid.uuid4(),
                        company_id=None,
                        name=name,
                        email=email,
                        password_hash=hash_password(password),
                        role=role,
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                )
            await session.commit()

    run_async(_seed())

    global _admin_token, _support_token, _user_token
    _admin_token = client.post(
        "/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    ).json()["access_token"]
    _support_token = client.post(
        "/api/v1/auth/login", json={"email": SUPPORT_EMAIL, "password": SUPPORT_PASSWORD}
    ).json()["access_token"]
    _user_token = client.post(
        "/api/v1/auth/login", json={"email": USER_EMAIL, "password": USER_PASSWORD}
    ).json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def _create_company(name: str = "Acme Inc.") -> dict:
    response = client.post("/api/v1/companies", json={"name": name}, headers=_auth(_admin_token))
    assert response.status_code == 201
    return response.json()


def _create_company_scoped_user(company_id: uuid.UUID, role: UserRole, email: str, password: str) -> str:
    """Create a COMPANY/USER-role user tied to `company_id` and return a login token."""

    async def _create() -> None:
        async with new_session() as session:
            now = datetime.now(timezone.utc)
            await UserRepository(session).create(
                User(
                    id=uuid.uuid4(),
                    company_id=company_id,
                    name="Scoped User",
                    email=email,
                    password_hash=hash_password(password),
                    role=role,
                    is_active=True,
                    created_at=now,
                    updated_at=now,
                )
            )
            await session.commit()

    run_async(_create())

    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return response.json()["access_token"]


# --- Authentication / authorization ------------------------------------------


def test_list_companies_without_token_returns_401() -> None:
    response = client.get("/api/v1/companies")

    assert response.status_code == 401


def test_list_companies_forbidden_for_user_role() -> None:
    response = client.get("/api/v1/companies", headers=_auth(_user_token))

    assert response.status_code == 403


def test_create_company_forbidden_for_user_role() -> None:
    response = client.post(
        "/api/v1/companies", json={"name": "Should Not Exist"}, headers=_auth(_user_token)
    )

    assert response.status_code == 403


def test_list_companies_allowed_for_support_role() -> None:
    response = client.get("/api/v1/companies", headers=_auth(_support_token))

    assert response.status_code == 200


# --- GET /companies ------------------------------------------------------------


def test_list_companies_returns_200() -> None:
    _create_company("List Co.")

    response = client.get("/api/v1/companies", headers=_auth(_admin_token))

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert any(company["name"] == "List Co." for company in response.json())


# --- POST /companies ----------------------------------------------------------


def test_create_company_returns_201_with_defaults() -> None:
    response = client.post(
        "/api/v1/companies", json={"name": "New Co."}, headers=_auth(_admin_token)
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "New Co."
    assert body["is_active"] is True
    assert "id" in body
    assert "created_at" in body
    assert "updated_at" in body


def test_create_company_invalid_request_returns_422() -> None:
    response = client.post("/api/v1/companies", json={}, headers=_auth(_admin_token))

    assert response.status_code == 422


# --- GET /companies/{id} ------------------------------------------------------


def test_get_company_returns_existing_company() -> None:
    created = _create_company("Gettable Co.")

    response = client.get(f"/api/v1/companies/{created['id']}", headers=_auth(_admin_token))

    assert response.status_code == 200
    assert response.json() == created


def test_get_company_returns_404_when_missing() -> None:
    response = client.get(f"/api/v1/companies/{uuid.uuid4()}", headers=_auth(_admin_token))

    assert response.status_code == 404
    assert response.json() == {"detail": "Company not found"}


def test_get_company_allowed_for_own_company_role_user() -> None:
    company = _create_company("Own Co. A")
    token = _create_company_scoped_user(
        uuid.UUID(company["id"]), UserRole.COMPANY, "owner-a@example.com", "Owner123!"
    )

    response = client.get(f"/api/v1/companies/{company['id']}", headers=_auth(token))

    assert response.status_code == 200
    assert response.json()["id"] == company["id"]


def test_get_company_allowed_for_own_company_plain_user() -> None:
    company = _create_company("Own Co. B")
    token = _create_company_scoped_user(
        uuid.UUID(company["id"]), UserRole.USER, "member-b@example.com", "Member123!"
    )

    response = client.get(f"/api/v1/companies/{company['id']}", headers=_auth(token))

    assert response.status_code == 200


def test_get_company_forbidden_for_a_different_company() -> None:
    company_a = _create_company("Isolated Co. A")
    company_b = _create_company("Isolated Co. B")
    token = _create_company_scoped_user(
        uuid.UUID(company_a["id"]), UserRole.USER, "outsider@example.com", "Outsider123!"
    )

    response = client.get(f"/api/v1/companies/{company_b['id']}", headers=_auth(token))

    assert response.status_code == 403


def test_get_company_forbidden_for_user_without_a_company() -> None:
    company = _create_company("Target Co. For No-Company User")

    response = client.get(f"/api/v1/companies/{company['id']}", headers=_auth(_user_token))

    assert response.status_code == 403


# --- PATCH /companies/{id} ----------------------------------------------------


def test_patch_company_updates_name() -> None:
    created = _create_company("Old Name")

    response = client.patch(
        f"/api/v1/companies/{created['id']}", json={"name": "New Name"}, headers=_auth(_admin_token)
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "New Name"
    assert body["is_active"] is True


def test_patch_company_updates_is_active() -> None:
    created = _create_company("Active Toggle Co.")

    response = client.patch(
        f"/api/v1/companies/{created['id']}",
        json={"is_active": False},
        headers=_auth(_support_token),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["is_active"] is False
    assert body["name"] == "Active Toggle Co."


def test_patch_company_preserves_fields_not_sent() -> None:
    created = _create_company("Preserve Co.")

    response = client.patch(
        f"/api/v1/companies/{created['id']}",
        json={"name": "Preserve Co. Updated"},
        headers=_auth(_admin_token),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Preserve Co. Updated"
    assert body["is_active"] == created["is_active"]
    assert body["id"] == created["id"]
    assert body["created_at"] == created["created_at"]


def test_patch_company_returns_404_when_missing() -> None:
    response = client.patch(
        f"/api/v1/companies/{uuid.uuid4()}", json={"name": "Nope"}, headers=_auth(_admin_token)
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Company not found"}


def test_patch_company_forbidden_for_user_role() -> None:
    created = _create_company("Protected Co.")

    response = client.patch(
        f"/api/v1/companies/{created['id']}",
        json={"name": "Hacked"},
        headers=_auth(_user_token),
    )

    assert response.status_code == 403
