import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import get_session
from app.core.security import hash_password, verify_password
from app.domain.entities.company import Company
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.main import app
from tests.infrastructure.database.conftest import (
    new_session,
    reset_schema,
    run_async,
    session_factory_for_tests,
)

ADMIN_EMAIL = "users-admin@example.com"
ADMIN_PASSWORD = "Admin123!"
SUPPORT_EMAIL = "users-support@example.com"
SUPPORT_PASSWORD = "Support123!"
COMPANY_A_OWNER_EMAIL = "users-companyA-owner@example.com"
COMPANY_A_OWNER_PASSWORD = "CompanyA123!"
COMPANY_B_OWNER_EMAIL = "users-companyB-owner@example.com"
COMPANY_B_OWNER_PASSWORD = "CompanyB123!"
USER_A1_EMAIL = "users-userA1@example.com"
USER_A1_PASSWORD = "UserA1123!"
USER_B1_EMAIL = "users-userB1@example.com"
USER_B1_PASSWORD = "UserB1123!"
PLAIN_USER_EMAIL = "users-plain@example.com"
PLAIN_USER_PASSWORD = "Plain123!"


async def _override_get_session():
    async with session_factory_for_tests() as session:
        yield session


app.dependency_overrides[get_session] = _override_get_session
client = TestClient(app)

_ids: dict = {}
_tokens: dict = {}


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def setup_module() -> None:
    reset_schema()

    async def _seed() -> dict:
        async with new_session() as session:
            company_repo = CompanyRepository(session)
            user_repo = UserRepository(session)
            now = datetime.now(timezone.utc)

            company_a = await company_repo.create(
                Company(id=uuid.uuid4(), name="Users Test Co. A", is_active=True, created_at=now, updated_at=now)
            )
            company_b = await company_repo.create(
                Company(id=uuid.uuid4(), name="Users Test Co. B", is_active=True, created_at=now, updated_at=now)
            )

            async def _user(email: str, password: str, role: UserRole, company_id) -> User:
                return await user_repo.create(
                    User(
                        id=uuid.uuid4(),
                        company_id=company_id,
                        name=email,
                        email=email,
                        password_hash=hash_password(password),
                        role=role,
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                )

            entities = {
                "company_a": company_a,
                "company_b": company_b,
                "admin": await _user(ADMIN_EMAIL, ADMIN_PASSWORD, UserRole.ADMIN, None),
                "support": await _user(SUPPORT_EMAIL, SUPPORT_PASSWORD, UserRole.SUPPORT, None),
                "company_a_owner": await _user(
                    COMPANY_A_OWNER_EMAIL, COMPANY_A_OWNER_PASSWORD, UserRole.COMPANY, company_a.id
                ),
                "company_b_owner": await _user(
                    COMPANY_B_OWNER_EMAIL, COMPANY_B_OWNER_PASSWORD, UserRole.COMPANY, company_b.id
                ),
                "user_a1": await _user(USER_A1_EMAIL, USER_A1_PASSWORD, UserRole.USER, company_a.id),
                "user_b1": await _user(USER_B1_EMAIL, USER_B1_PASSWORD, UserRole.USER, company_b.id),
                "plain_user": await _user(PLAIN_USER_EMAIL, PLAIN_USER_PASSWORD, UserRole.USER, None),
            }
            await session.commit()
            return entities

    entities = run_async(_seed())
    for key, entity in entities.items():
        _ids[key] = str(entity.id)

    for key, email, password in [
        ("admin", ADMIN_EMAIL, ADMIN_PASSWORD),
        ("support", SUPPORT_EMAIL, SUPPORT_PASSWORD),
        ("company_a_owner", COMPANY_A_OWNER_EMAIL, COMPANY_A_OWNER_PASSWORD),
        ("company_b_owner", COMPANY_B_OWNER_EMAIL, COMPANY_B_OWNER_PASSWORD),
        ("user_a1", USER_A1_EMAIL, USER_A1_PASSWORD),
        ("user_b1", USER_B1_EMAIL, USER_B1_PASSWORD),
        ("plain_user", PLAIN_USER_EMAIL, PLAIN_USER_PASSWORD),
    ]:
        response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        _tokens[key] = response.json()["access_token"]


def _post_user(token: str, email: str, role: str, company_id: str | None = None) -> "object":
    payload = {"name": "New Person", "email": email, "password": "NewPass123!", "role": role}
    if company_id is not None:
        payload["company_id"] = company_id
    return client.post("/api/v1/users", json=payload, headers=_auth(token))


def _make_target(email: str, role: str, company_id: str | None = None) -> dict:
    response = _post_user(_tokens["admin"], email, role, company_id)
    assert response.status_code == 201
    return response.json()


# --- GET /users ---------------------------------------------------------------


def test_list_users_without_token_returns_401() -> None:
    assert client.get("/api/v1/users").status_code == 401


def test_list_users_forbidden_for_plain_user() -> None:
    response = client.get("/api/v1/users", headers=_auth(_tokens["plain_user"]))
    assert response.status_code == 403


def test_list_users_admin_sees_every_role() -> None:
    response = client.get("/api/v1/users", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200
    roles = {user["role"] for user in response.json()}
    assert roles == {"ADMIN", "SUPPORT", "COMPANY", "USER"}


def test_list_users_support_sees_only_company_and_user() -> None:
    response = client.get("/api/v1/users", headers=_auth(_tokens["support"]))
    assert response.status_code == 200
    roles = {user["role"] for user in response.json()}
    assert roles <= {"COMPANY", "USER"}


def test_list_users_company_sees_only_its_own_users() -> None:
    response = client.get("/api/v1/users", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 200
    body = response.json()
    ids = {user["id"] for user in body}
    assert _ids["user_a1"] in ids
    assert _ids["user_b1"] not in ids
    assert all(user["role"] == "USER" for user in body)
    assert all(user["company_id"] == _ids["company_a"] for user in body)


# --- GET /users/{id} -----------------------------------------------------------


def test_get_user_admin_can_view_any_role() -> None:
    for key in ["admin", "support", "company_a_owner", "user_a1"]:
        response = client.get(f"/api/v1/users/{_ids[key]}", headers=_auth(_tokens["admin"]))
        assert response.status_code == 200


def test_get_user_support_can_view_company_and_user() -> None:
    for key in ["company_a_owner", "user_a1"]:
        response = client.get(f"/api/v1/users/{_ids[key]}", headers=_auth(_tokens["support"]))
        assert response.status_code == 200


def test_get_user_support_forbidden_for_admin_and_support() -> None:
    for key in ["admin", "support"]:
        response = client.get(f"/api/v1/users/{_ids[key]}", headers=_auth(_tokens["support"]))
        assert response.status_code == 403


def test_get_user_company_allowed_for_own_user() -> None:
    response = client.get(f"/api/v1/users/{_ids['user_a1']}", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 200
    assert response.json()["id"] == _ids["user_a1"]


def test_get_user_company_forbidden_for_other_companys_user() -> None:
    response = client.get(f"/api/v1/users/{_ids['user_b1']}", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 403


def test_get_user_company_forbidden_for_company_support_and_admin() -> None:
    for key in ["company_b_owner", "support", "admin"]:
        response = client.get(f"/api/v1/users/{_ids[key]}", headers=_auth(_tokens["company_a_owner"]))
        assert response.status_code == 403


def test_get_user_forbidden_for_plain_user() -> None:
    response = client.get(f"/api/v1/users/{_ids['admin']}", headers=_auth(_tokens["plain_user"]))
    assert response.status_code == 403


def test_get_user_returns_404_when_missing() -> None:
    response = client.get(f"/api/v1/users/{uuid.uuid4()}", headers=_auth(_tokens["admin"]))
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found"}


def test_get_user_never_exposes_password_fields() -> None:
    response = client.get(f"/api/v1/users/{_ids['user_a1']}", headers=_auth(_tokens["admin"]))
    body = response.json()
    assert "password" not in body
    assert "password_hash" not in body


# --- POST /users ----------------------------------------------------------------


def test_create_user_forbidden_for_plain_user() -> None:
    response = _post_user(_tokens["plain_user"], "user-tries-create@example.com", "USER", _ids["company_a"])
    assert response.status_code == 403


def test_create_user_admin_can_create_every_role() -> None:
    assert _post_user(_tokens["admin"], "new-admin@example.com", "ADMIN").status_code == 201
    assert _post_user(_tokens["admin"], "new-support@example.com", "SUPPORT").status_code == 201

    response = _post_user(_tokens["admin"], "new-company@example.com", "COMPANY", _ids["company_a"])
    assert response.status_code == 201
    assert response.json()["company_id"] == _ids["company_a"]

    response = _post_user(_tokens["admin"], "new-user@example.com", "USER", _ids["company_a"])
    assert response.status_code == 201


def test_create_user_support_cannot_create_admin_or_support() -> None:
    assert _post_user(_tokens["support"], "support-tries-admin@example.com", "ADMIN").status_code == 403
    assert _post_user(_tokens["support"], "support-tries-support@example.com", "SUPPORT").status_code == 403


def test_create_user_support_can_create_company_and_user() -> None:
    response = _post_user(_tokens["support"], "support-creates-company@example.com", "COMPANY", _ids["company_a"])
    assert response.status_code == 201

    response = _post_user(_tokens["support"], "support-creates-user@example.com", "USER", _ids["company_a"])
    assert response.status_code == 201


def test_create_user_company_forbidden_for_admin_support_company() -> None:
    for role in ["ADMIN", "SUPPORT", "COMPANY"]:
        response = _post_user(
            _tokens["company_a_owner"], f"companyA-tries-{role.lower()}@example.com", role, _ids["company_a"]
        )
        assert response.status_code == 403


def test_create_user_company_can_create_user_scoped_to_its_own_company() -> None:
    response = _post_user(_tokens["company_a_owner"], "companyA-new-user@example.com", "USER")
    assert response.status_code == 201
    body = response.json()
    assert body["role"] == "USER"
    assert body["company_id"] == _ids["company_a"]


def test_create_user_company_cannot_assign_a_different_company() -> None:
    response = _post_user(
        _tokens["company_a_owner"], "companyA-tries-other-company@example.com", "USER", _ids["company_b"]
    )
    assert response.status_code == 403


def test_create_user_duplicate_email_returns_409() -> None:
    response = _post_user(_tokens["admin"], ADMIN_EMAIL, "USER", _ids["company_a"])
    assert response.status_code == 409


def test_create_user_company_role_without_company_id_returns_422() -> None:
    response = _post_user(_tokens["admin"], "no-company-for-company-role@example.com", "COMPANY")
    assert response.status_code == 422


def test_create_user_with_nonexistent_company_returns_422() -> None:
    response = _post_user(_tokens["admin"], "ghost-company-user@example.com", "USER", str(uuid.uuid4()))
    assert response.status_code == 422


def test_create_user_invalid_request_returns_422() -> None:
    response = client.post(
        "/api/v1/users", json={"name": "Missing Fields"}, headers=_auth(_tokens["admin"])
    )
    assert response.status_code == 422


def test_create_user_response_never_exposes_password_fields() -> None:
    response = _post_user(_tokens["admin"], "no-password-leak@example.com", "USER", _ids["company_a"])
    body = response.json()
    assert "password" not in body
    assert "password_hash" not in body


# --- PATCH /users/{id} -----------------------------------------------------------


def test_patch_user_forbidden_for_plain_user() -> None:
    response = client.patch(
        f"/api/v1/users/{_ids['user_a1']}", json={"name": "x"}, headers=_auth(_tokens["plain_user"])
    )
    assert response.status_code == 403


def test_patch_user_admin_can_modify_anyone() -> None:
    target = _make_target("patch-target-1@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}", json={"name": "Renamed"}, headers=_auth(_tokens["admin"])
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Renamed"


def test_patch_user_admin_can_change_role_freely_and_company_id_is_cleared() -> None:
    target = _make_target("patch-target-2@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}", json={"role": "SUPPORT"}, headers=_auth(_tokens["admin"])
    )
    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "SUPPORT"
    assert body["company_id"] is None


def test_patch_user_support_can_modify_company_and_user() -> None:
    company_target = _make_target("patch-target-3@example.com", "COMPANY", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{company_target['id']}",
        json={"name": "Support Edited Company"},
        headers=_auth(_tokens["support"]),
    )
    assert response.status_code == 200

    user_target = _make_target("patch-target-4@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{user_target['id']}",
        json={"name": "Support Edited User"},
        headers=_auth(_tokens["support"]),
    )
    assert response.status_code == 200


def test_patch_user_support_forbidden_for_admin_and_support() -> None:
    response = client.patch(
        f"/api/v1/users/{_ids['admin']}", json={"name": "x"}, headers=_auth(_tokens["support"])
    )
    assert response.status_code == 403

    response = client.patch(
        f"/api/v1/users/{_ids['support']}", json={"name": "x"}, headers=_auth(_tokens["support"])
    )
    assert response.status_code == 403


def test_patch_user_support_cannot_promote_user_to_admin_or_support() -> None:
    target = _make_target("patch-role-1@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}", json={"role": "ADMIN"}, headers=_auth(_tokens["support"])
    )
    assert response.status_code == 403

    target = _make_target("patch-role-2@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}", json={"role": "SUPPORT"}, headers=_auth(_tokens["support"])
    )
    assert response.status_code == 403


def test_patch_user_company_can_modify_own_user() -> None:
    target = _make_target("patch-target-5@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}",
        json={"name": "Company Edited"},
        headers=_auth(_tokens["company_a_owner"]),
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Company Edited"


def test_patch_user_company_forbidden_for_other_companys_user() -> None:
    response = client.patch(
        f"/api/v1/users/{_ids['user_b1']}", json={"name": "x"}, headers=_auth(_tokens["company_a_owner"])
    )
    assert response.status_code == 403


def test_patch_user_company_forbidden_for_company_support_admin() -> None:
    for key in ["company_b_owner", "support", "admin"]:
        response = client.patch(
            f"/api/v1/users/{_ids[key]}", json={"name": "x"}, headers=_auth(_tokens["company_a_owner"])
        )
        assert response.status_code == 403


def test_patch_user_company_cannot_change_user_role() -> None:
    for role in ["COMPANY", "SUPPORT", "ADMIN"]:
        target = _make_target(f"patch-role-company-{role.lower()}@example.com", "USER", _ids["company_a"])
        response = client.patch(
            f"/api/v1/users/{target['id']}", json={"role": role}, headers=_auth(_tokens["company_a_owner"])
        )
        assert response.status_code == 403


def test_patch_user_company_cannot_change_company_id() -> None:
    target = _make_target("patch-company-1@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}",
        json={"company_id": _ids["company_b"]},
        headers=_auth(_tokens["company_a_owner"]),
    )
    assert response.status_code == 403


def test_patch_user_company_resending_same_company_id_is_a_noop() -> None:
    target = _make_target("patch-company-2@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}",
        json={"company_id": _ids["company_a"], "name": "Still fine"},
        headers=_auth(_tokens["company_a_owner"]),
    )
    assert response.status_code == 200
    assert response.json()["company_id"] == _ids["company_a"]


def test_patch_user_returns_404_when_missing() -> None:
    response = client.patch(
        f"/api/v1/users/{uuid.uuid4()}", json={"name": "x"}, headers=_auth(_tokens["admin"])
    )
    assert response.status_code == 404


def test_patch_user_preserves_fields_not_sent() -> None:
    target = _make_target("patch-target-6@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}", json={"name": "Only Name Changed"}, headers=_auth(_tokens["admin"])
    )
    body = response.json()
    assert body["name"] == "Only Name Changed"
    assert body["email"] == target["email"]
    assert body["role"] == target["role"]
    assert body["company_id"] == target["company_id"]


def test_patch_user_password_is_hashed_and_never_returned() -> None:
    target = _make_target("patch-target-7@example.com", "USER", _ids["company_a"])
    response = client.patch(
        f"/api/v1/users/{target['id']}", json={"password": "NewSecret123!"}, headers=_auth(_tokens["admin"])
    )
    assert response.status_code == 200
    body = response.json()
    assert "password" not in body
    assert "password_hash" not in body

    async def _check() -> None:
        async with new_session() as session:
            user = await UserRepository(session).get_by_id(uuid.UUID(target["id"]))
        assert user is not None
        assert user.password_hash != "NewSecret123!"
        assert verify_password("NewSecret123!", user.password_hash)

    run_async(_check())


# --- Security -----------------------------------------------------------------


def test_no_jwt_returns_401_on_every_endpoint() -> None:
    assert client.get("/api/v1/users").status_code == 401
    assert client.post("/api/v1/users", json={}).status_code == 401
    assert client.get(f"/api/v1/users/{_ids['user_a1']}").status_code == 401
    assert client.patch(f"/api/v1/users/{_ids['user_a1']}", json={}).status_code == 401


def test_invalid_jwt_returns_401() -> None:
    response = client.get("/api/v1/users", headers=_auth("not-a-real-token"))
    assert response.status_code == 401


def test_expired_jwt_returns_401() -> None:
    now = datetime.now(timezone.utc)
    expired_token = jwt.encode(
        {
            "sub": _ids["admin"],
            "role": "ADMIN",
            "company_id": None,
            "iat": now - timedelta(minutes=120),
            "exp": now - timedelta(minutes=60),
        },
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    response = client.get("/api/v1/users", headers=_auth(expired_token))
    assert response.status_code == 401


def test_jwt_for_nonexistent_user_returns_401() -> None:
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "role": "ADMIN",
            "company_id": None,
            "iat": now,
            "exp": now + timedelta(minutes=60),
        },
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    response = client.get("/api/v1/users", headers=_auth(token))
    assert response.status_code == 401
