import asyncio
import uuid
from datetime import datetime, timezone

import httpx
from fastapi.testclient import TestClient
from httpx import ASGITransport

from app.core.database import get_session
from app.core.security import hash_password
from app.domain.entities.company import Company
from app.domain.entities.user import User
from app.domain.enums.request import RequestStatus
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.main import app
from tests.infrastructure.database.conftest import (
    new_session,
    reset_schema,
    run_async,
    session_factory_for_tests,
)
from tests.support import email_service as _email_service

ADMIN_EMAIL = "requests-admin@example.com"
ADMIN_PASSWORD = "Admin123!"
SUPPORT1_EMAIL = "requests-support1@example.com"
SUPPORT1_PASSWORD = "Support1123!"
SUPPORT2_EMAIL = "requests-support2@example.com"
SUPPORT2_PASSWORD = "Support2123!"
COMPANY_A_OWNER_EMAIL = "requests-companyA-owner@example.com"
COMPANY_A_OWNER_PASSWORD = "CompanyA123!"
COMPANY_B_OWNER_EMAIL = "requests-companyB-owner@example.com"
COMPANY_B_OWNER_PASSWORD = "CompanyB123!"
USER_A1_EMAIL = "requests-userA1@example.com"
USER_A1_PASSWORD = "UserA1123!"
USER_B1_EMAIL = "requests-userB1@example.com"
USER_B1_PASSWORD = "UserB1123!"


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
                Company(id=uuid.uuid4(), name="Requests Test Co. A", is_active=True, created_at=now, updated_at=now)
            )
            company_b = await company_repo.create(
                Company(id=uuid.uuid4(), name="Requests Test Co. B", is_active=True, created_at=now, updated_at=now)
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
                "support1": await _user(SUPPORT1_EMAIL, SUPPORT1_PASSWORD, UserRole.SUPPORT, None),
                "support2": await _user(SUPPORT2_EMAIL, SUPPORT2_PASSWORD, UserRole.SUPPORT, None),
                "company_a_owner": await _user(
                    COMPANY_A_OWNER_EMAIL, COMPANY_A_OWNER_PASSWORD, UserRole.COMPANY, company_a.id
                ),
                "company_b_owner": await _user(
                    COMPANY_B_OWNER_EMAIL, COMPANY_B_OWNER_PASSWORD, UserRole.COMPANY, company_b.id
                ),
                "user_a1": await _user(USER_A1_EMAIL, USER_A1_PASSWORD, UserRole.USER, company_a.id),
                "user_b1": await _user(USER_B1_EMAIL, USER_B1_PASSWORD, UserRole.USER, company_b.id),
            }
            await session.commit()
            return entities

    entities = run_async(_seed())
    for key, entity in entities.items():
        _ids[key] = str(entity.id)

    for key, email, password in [
        ("admin", ADMIN_EMAIL, ADMIN_PASSWORD),
        ("support1", SUPPORT1_EMAIL, SUPPORT1_PASSWORD),
        ("support2", SUPPORT2_EMAIL, SUPPORT2_PASSWORD),
        ("company_a_owner", COMPANY_A_OWNER_EMAIL, COMPANY_A_OWNER_PASSWORD),
        ("company_b_owner", COMPANY_B_OWNER_EMAIL, COMPANY_B_OWNER_PASSWORD),
        ("user_a1", USER_A1_EMAIL, USER_A1_PASSWORD),
        ("user_b1", USER_B1_EMAIL, USER_B1_PASSWORD),
    ]:
        response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        _tokens[key] = response.json()["access_token"]


def _create_request(
    token: str,
    company_id: str | None = None,
    title: str = "Server is down",
    type_: str = "INCIDENT",
    priority: str = "MEDIUM",
):
    payload = {
        "title": title,
        "description": "Something needs attention.",
        "type": type_,
        "priority": priority,
    }
    if company_id is not None:
        payload["company_id"] = company_id
    return client.post("/api/v1/requests", json=payload, headers=_auth(token))


# --- POST /requests -------------------------------------------------------------


def test_create_request_by_user_is_scoped_to_own_company() -> None:
    response = _create_request(_tokens["user_a1"])
    assert response.status_code == 201
    body = response.json()
    assert body["company_id"] == _ids["company_a"]
    assert body["created_by"] == _ids["user_a1"]
    assert body["status"] == "PENDING"
    assert body["assigned_to"] is None
    assert body["resolved_at"] is None


def test_create_request_by_company_is_scoped_to_own_company() -> None:
    response = _create_request(_tokens["company_a_owner"])
    assert response.status_code == 201
    assert response.json()["company_id"] == _ids["company_a"]


def test_create_request_user_cannot_target_another_company() -> None:
    response = _create_request(_tokens["user_a1"], company_id=_ids["company_b"])
    assert response.status_code == 403


def test_create_request_company_cannot_target_another_company() -> None:
    response = _create_request(_tokens["company_a_owner"], company_id=_ids["company_b"])
    assert response.status_code == 403


def test_create_request_admin_requires_company_id() -> None:
    response = _create_request(_tokens["admin"])
    assert response.status_code == 422

    response = _create_request(_tokens["admin"], company_id=_ids["company_a"])
    assert response.status_code == 201
    assert response.json()["company_id"] == _ids["company_a"]


def test_create_request_support_requires_company_id() -> None:
    response = _create_request(_tokens["support1"])
    assert response.status_code == 422

    response = _create_request(_tokens["support1"], company_id=_ids["company_b"])
    assert response.status_code == 201
    assert response.json()["company_id"] == _ids["company_b"]


def test_create_request_with_nonexistent_company_returns_422() -> None:
    response = _create_request(_tokens["admin"], company_id=str(uuid.uuid4()))
    assert response.status_code == 422


def test_create_request_invalid_enum_returns_422() -> None:
    response = _create_request(_tokens["user_a1"], type_="NOT_A_TYPE")
    assert response.status_code == 422


def test_create_request_missing_fields_returns_422() -> None:
    response = client.post("/api/v1/requests", json={"title": "Only a title"}, headers=_auth(_tokens["user_a1"]))
    assert response.status_code == 422


def test_create_request_without_token_returns_401() -> None:
    response = client.post("/api/v1/requests", json={})
    assert response.status_code == 401


# --- GET /requests ----------------------------------------------------------------


def test_list_requests_admin_sees_every_company() -> None:
    _create_request(_tokens["user_a1"], title="Admin-visible A")
    _create_request(_tokens["user_b1"], title="Admin-visible B")

    response = client.get("/api/v1/requests", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200
    company_ids = {r["company_id"] for r in response.json()}
    assert _ids["company_a"] in company_ids
    assert _ids["company_b"] in company_ids


def test_list_requests_support_sees_every_company() -> None:
    response = client.get("/api/v1/requests", headers=_auth(_tokens["support1"]))
    assert response.status_code == 200
    company_ids = {r["company_id"] for r in response.json()}
    assert _ids["company_a"] in company_ids
    assert _ids["company_b"] in company_ids


def test_list_requests_company_sees_only_its_own_company() -> None:
    response = client.get("/api/v1/requests", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 200
    body = response.json()
    assert len(body) > 0
    assert all(r["company_id"] == _ids["company_a"] for r in body)


def test_list_requests_user_sees_only_its_own_company() -> None:
    response = client.get("/api/v1/requests", headers=_auth(_tokens["user_b1"]))
    assert response.status_code == 200
    body = response.json()
    assert len(body) > 0
    assert all(r["company_id"] == _ids["company_b"] for r in body)


def test_list_requests_without_token_returns_401() -> None:
    assert client.get("/api/v1/requests").status_code == 401


# --- GET /requests/{id} -------------------------------------------------------------


def test_get_request_admin_can_view_any_company() -> None:
    request = _create_request(_tokens["user_b1"]).json()
    response = client.get(f"/api/v1/requests/{request['id']}", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200


def test_get_request_support_can_view_any_company() -> None:
    request = _create_request(_tokens["user_b1"]).json()
    response = client.get(f"/api/v1/requests/{request['id']}", headers=_auth(_tokens["support1"]))
    assert response.status_code == 200


def test_get_request_company_allowed_for_own_company() -> None:
    request = _create_request(_tokens["company_a_owner"]).json()
    response = client.get(f"/api/v1/requests/{request['id']}", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 200


def test_get_request_company_forbidden_for_other_company() -> None:
    request = _create_request(_tokens["company_b_owner"]).json()
    response = client.get(f"/api/v1/requests/{request['id']}", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 403


def test_get_request_user_allowed_for_own_company() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    response = client.get(f"/api/v1/requests/{request['id']}", headers=_auth(_tokens["user_a1"]))
    assert response.status_code == 200


def test_get_request_user_forbidden_for_other_company() -> None:
    request = _create_request(_tokens["user_b1"]).json()
    response = client.get(f"/api/v1/requests/{request['id']}", headers=_auth(_tokens["user_a1"]))
    assert response.status_code == 403


def test_get_request_returns_404_when_missing() -> None:
    response = client.get(f"/api/v1/requests/{uuid.uuid4()}", headers=_auth(_tokens["admin"]))
    assert response.status_code == 404
    assert response.json() == {"detail": "Request not found"}


# --- POST /requests/{id}/take -------------------------------------------------------


def test_take_request_by_support_succeeds() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    response = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "IN_PROGRESS"
    assert body["assigned_to"] == _ids["support1"]


def test_take_request_already_assigned_to_another_support_returns_409() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    first = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    assert first.status_code == 200

    second = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support2"]))
    assert second.status_code == 409


def test_take_request_same_support_is_idempotent() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    first = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    assert first.status_code == 200

    second = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    assert second.status_code == 200
    assert second.json()["assigned_to"] == _ids["support1"]


def test_take_request_admin_can_take() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    response = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200
    assert response.json()["assigned_to"] == _ids["admin"]


def test_take_request_forbidden_for_company_and_user() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    assert (
        client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["company_a_owner"])).status_code
        == 403
    )

    request2 = _create_request(_tokens["user_a1"]).json()
    assert (
        client.post(f"/api/v1/requests/{request2['id']}/take", headers=_auth(_tokens["user_a1"])).status_code == 403
    )


def test_take_request_cancelled_returns_409() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    cancel = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))
    assert cancel.status_code == 200

    response = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    assert response.status_code == 409


def test_take_request_returns_404_when_missing() -> None:
    response = client.post(f"/api/v1/requests/{uuid.uuid4()}/take", headers=_auth(_tokens["support1"]))
    assert response.status_code == 404


def test_take_request_concurrent_only_one_support_wins() -> None:
    request = _create_request(_tokens["user_a1"]).json()

    async def _run() -> list[int]:
        transport = ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as async_client:
            responses = await asyncio.gather(
                async_client.post(
                    f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"])
                ),
                async_client.post(
                    f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support2"])
                ),
            )
        return [response.status_code for response in responses]

    statuses = sorted(run_async(_run()))
    assert statuses == [200, 409]

    async def _verify() -> None:
        async with new_session() as session:
            updated = await RequestRepository(session).get_by_id(uuid.UUID(request["id"]))
        assert updated is not None
        assert updated.status == RequestStatus.IN_PROGRESS
        assert updated.assigned_to in (uuid.UUID(_ids["support1"]), uuid.UUID(_ids["support2"]))

    run_async(_verify())


# --- POST /requests/{id}/return -----------------------------------------------------


def test_return_request_by_owning_support_succeeds() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["support1"]))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "PENDING"
    assert body["assigned_to"] is None


def test_return_request_by_different_support_forbidden() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["support2"]))
    assert response.status_code == 403


def test_return_request_forbidden_for_company_and_user() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    assert (
        client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["company_a_owner"])).status_code
        == 403
    )
    assert (
        client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["user_a1"])).status_code == 403
    )


def test_return_request_admin_can_return_any() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200
    assert response.json()["assigned_to"] is None


def test_return_request_not_in_progress_returns_409() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["support1"]))
    assert response.status_code == 409


# --- POST /requests/{id}/resolve ----------------------------------------------------


def test_resolve_request_by_owning_support_succeeds() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "RESOLVED"
    assert body["resolved_at"] is not None
    assert body["assigned_to"] == _ids["support1"]


def test_resolve_request_by_different_support_forbidden() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support2"]))
    assert response.status_code == 403


def test_resolve_request_forbidden_for_company_and_user() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    assert (
        client.post(
            f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["company_a_owner"])
        ).status_code
        == 403
    )
    assert (
        client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["user_a1"])).status_code
        == 403
    )


def test_resolve_request_admin_can_resolve_any() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200
    assert response.json()["status"] == "RESOLVED"


def test_resolve_request_already_resolved_returns_409() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))

    response = client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))
    assert response.status_code == 409


def test_resolve_request_pending_returns_403_not_409() -> None:
    # Never taken: assigned_to is None, so the owning-support check fails
    # before the state check is even reached.
    request = _create_request(_tokens["user_a1"]).json()
    response = client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))
    assert response.status_code == 403


# --- PATCH /requests/{id}/cancel ----------------------------------------------------


def test_cancel_request_pending_by_owning_company_succeeds() -> None:
    request = _create_request(_tokens["company_a_owner"]).json()
    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 200
    assert response.json()["status"] == "CANCELLED"


def test_cancel_request_in_progress_by_admin_succeeds() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["admin"]))
    assert response.status_code == 200
    assert response.json()["status"] == "CANCELLED"


def test_cancel_request_support_can_cancel_any_company() -> None:
    request = _create_request(_tokens["user_b1"]).json()
    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["support1"]))
    assert response.status_code == 200


def test_cancel_request_user_can_cancel_own_company_request() -> None:
    request = _create_request(_tokens["company_a_owner"]).json()
    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))
    assert response.status_code == 200


def test_cancel_request_forbidden_for_other_company() -> None:
    request = _create_request(_tokens["user_b1"]).json()
    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["company_a_owner"]))
    assert response.status_code == 403


def test_cancel_request_already_cancelled_returns_409() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))

    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))
    assert response.status_code == 409


def test_cancel_request_already_resolved_returns_409() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))

    response = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))
    assert response.status_code == 409


def test_cancel_request_returns_404_when_missing() -> None:
    response = client.patch(f"/api/v1/requests/{uuid.uuid4()}/cancel", headers=_auth(_tokens["admin"]))
    assert response.status_code == 404


def test_cancel_request_without_token_returns_401() -> None:
    response = client.patch(f"/api/v1/requests/{uuid.uuid4()}/cancel")
    assert response.status_code == 401


# --- Full lifecycle -----------------------------------------------------------------


def test_full_lifecycle_create_take_resolve() -> None:
    request = _create_request(_tokens["user_a1"]).json()
    assert request["status"] == "PENDING"

    taken = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"])).json()
    assert taken["status"] == "IN_PROGRESS"
    assert taken["assigned_to"] == _ids["support1"]

    resolved = client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"])).json()
    assert resolved["status"] == "RESOLVED"
    assert resolved["resolved_at"] is not None


def test_full_lifecycle_create_take_return_take_again() -> None:
    request = _create_request(_tokens["user_a1"]).json()

    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    returned = client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["support1"])).json()
    assert returned["status"] == "PENDING"
    assert returned["assigned_to"] is None

    retaken = client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support2"])).json()
    assert retaken["status"] == "IN_PROGRESS"
    assert retaken["assigned_to"] == _ids["support2"]


# --- Email notifications --------------------------------------------------


def test_create_request_by_user_notifies_user_and_company() -> None:
    _email_service.sent.clear()
    request = _create_request(_tokens["user_a1"], title="Notif: user creates").json()

    subject = f"Nueva solicitud #{request['id']}"
    assert set(_email_service.sent) == {(USER_A1_EMAIL, subject), (COMPANY_A_OWNER_EMAIL, subject)}


def test_create_request_by_company_notifies_once_deduplicated() -> None:
    _email_service.sent.clear()
    request = _create_request(_tokens["company_a_owner"], title="Notif: company creates").json()

    subject = f"Nueva solicitud #{request['id']}"
    # The creator IS the company's only COMPANY-role user here, so a single
    # email is expected, not two identical ones.
    assert _email_service.sent == [(COMPANY_A_OWNER_EMAIL, subject)]


def test_create_request_without_company_recipients_notifies_only_creator() -> None:
    _email_service.sent.clear()
    request = _create_request(_tokens["admin"], company_id=_ids["company_a"], title="Notif: admin creates").json()

    subject = f"Nueva solicitud #{request['id']}"
    assert set(_email_service.sent) == {(ADMIN_EMAIL, subject), (COMPANY_A_OWNER_EMAIL, subject)}


def test_take_request_notifies_creator() -> None:
    request = _create_request(_tokens["user_a1"], title="Notif: take").json()
    _email_service.sent.clear()

    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))

    assert _email_service.sent == [(USER_A1_EMAIL, f"Solicitud #{request['id']} asignada a soporte")]


def test_take_request_by_creator_notifies_no_one() -> None:
    request = _create_request(_tokens["admin"], company_id=_ids["company_a"], title="Notif: admin self-take").json()
    _email_service.sent.clear()

    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["admin"]))

    assert _email_service.sent == []


def test_return_request_notifies_creator() -> None:
    request = _create_request(_tokens["user_a1"], title="Notif: return").json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    _email_service.sent.clear()

    client.post(f"/api/v1/requests/{request['id']}/return", headers=_auth(_tokens["support1"]))

    assert _email_service.sent == [(USER_A1_EMAIL, f"Solicitud #{request['id']} devuelta a la cola")]


def test_resolve_request_notifies_creator() -> None:
    request = _create_request(_tokens["user_a1"], title="Notif: resolve").json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    _email_service.sent.clear()

    client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))

    assert _email_service.sent == [(USER_A1_EMAIL, f"Solicitud #{request['id']} resuelta")]


def test_cancel_request_by_user_notifies_assigned_support() -> None:
    request = _create_request(_tokens["user_a1"], title="Notif: cancel with support").json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    _email_service.sent.clear()

    client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))

    assert _email_service.sent == [(SUPPORT1_EMAIL, f"Solicitud #{request['id']} cancelada")]


def test_cancel_request_without_assigned_support_sends_no_email() -> None:
    request = _create_request(_tokens["user_a1"], title="Notif: cancel pending").json()
    _email_service.sent.clear()

    client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))

    assert _email_service.sent == []


def test_cancel_request_by_support_sends_no_email() -> None:
    request = _create_request(_tokens["user_a1"], title="Notif: support cancels own").json()
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    _email_service.sent.clear()

    client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["support1"]))

    assert _email_service.sent == []
