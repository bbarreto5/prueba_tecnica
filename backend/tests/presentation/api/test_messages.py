import uuid
from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.core.database import get_session
from app.core.security import hash_password
from app.domain.entities.company import Company
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.request import RequestPriority, RequestStatus, RequestType
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

ADMIN_EMAIL = "messages-admin@example.com"
ADMIN_PASSWORD = "Admin123!"
SUPPORT1_EMAIL = "messages-support1@example.com"
SUPPORT1_PASSWORD = "Support1123!"
COMPANY_A_OWNER_EMAIL = "messages-companyA-owner@example.com"
COMPANY_A_OWNER_PASSWORD = "CompanyA123!"
COMPANY_B_OWNER_EMAIL = "messages-companyB-owner@example.com"
COMPANY_B_OWNER_PASSWORD = "CompanyB123!"
USER_A1_EMAIL = "messages-userA1@example.com"
USER_A1_PASSWORD = "UserA1123!"
USER_B1_EMAIL = "messages-userB1@example.com"
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
            request_repo = RequestRepository(session)
            now = datetime.now(timezone.utc)

            company_a = await company_repo.create(
                Company(id=uuid.uuid4(), name="Messages Test Co. A", is_active=True, created_at=now, updated_at=now)
            )
            company_b = await company_repo.create(
                Company(id=uuid.uuid4(), name="Messages Test Co. B", is_active=True, created_at=now, updated_at=now)
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

            admin = await _user(ADMIN_EMAIL, ADMIN_PASSWORD, UserRole.ADMIN, None)
            support1 = await _user(SUPPORT1_EMAIL, SUPPORT1_PASSWORD, UserRole.SUPPORT, None)
            company_a_owner = await _user(
                COMPANY_A_OWNER_EMAIL, COMPANY_A_OWNER_PASSWORD, UserRole.COMPANY, company_a.id
            )
            company_b_owner = await _user(
                COMPANY_B_OWNER_EMAIL, COMPANY_B_OWNER_PASSWORD, UserRole.COMPANY, company_b.id
            )
            user_a1 = await _user(USER_A1_EMAIL, USER_A1_PASSWORD, UserRole.USER, company_a.id)
            user_b1 = await _user(USER_B1_EMAIL, USER_B1_PASSWORD, UserRole.USER, company_b.id)

            async def _request(company_id, created_by) -> Request:
                return await request_repo.create(
                    Request(
                        id=uuid.uuid4(),
                        company_id=company_id,
                        created_by=created_by,
                        assigned_to=None,
                        title="Shared test request",
                        description="Something needs attention.",
                        type=RequestType.INCIDENT,
                        priority=RequestPriority.MEDIUM,
                        status=RequestStatus.PENDING,
                        created_at=now,
                        updated_at=now,
                        resolved_at=None,
                    )
                )

            request_a = await _request(company_a.id, user_a1.id)
            request_b = await _request(company_b.id, user_b1.id)

            await session.commit()
            return {
                "company_a": company_a,
                "company_b": company_b,
                "admin": admin,
                "support1": support1,
                "company_a_owner": company_a_owner,
                "company_b_owner": company_b_owner,
                "user_a1": user_a1,
                "user_b1": user_b1,
                "request_a": request_a,
                "request_b": request_b,
            }

    entities = run_async(_seed())
    for key, entity in entities.items():
        _ids[key] = str(entity.id)

    for key, email, password in [
        ("admin", ADMIN_EMAIL, ADMIN_PASSWORD),
        ("support1", SUPPORT1_EMAIL, SUPPORT1_PASSWORD),
        ("company_a_owner", COMPANY_A_OWNER_EMAIL, COMPANY_A_OWNER_PASSWORD),
        ("company_b_owner", COMPANY_B_OWNER_EMAIL, COMPANY_B_OWNER_PASSWORD),
        ("user_a1", USER_A1_EMAIL, USER_A1_PASSWORD),
        ("user_b1", USER_B1_EMAIL, USER_B1_PASSWORD),
    ]:
        response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        _tokens[key] = response.json()["access_token"]


def _post_message(token: str, request_id: str, content: str = "The issue persists.", extra: dict | None = None):
    payload = {"content": content, **(extra or {})}
    return client.post(f"/api/v1/requests/{request_id}/messages", json=payload, headers=_auth(token))


def _get_messages(token: str, request_id: str):
    return client.get(f"/api/v1/requests/{request_id}/messages", headers=_auth(token))


def _new_request(owner_token: str, title: str = "Msg test request") -> dict:
    response = client.post(
        "/api/v1/requests",
        json={"title": title, "description": "x", "type": "INCIDENT", "priority": "LOW"},
        headers=_auth(owner_token),
    )
    assert response.status_code == 201
    return response.json()


# --- GET /requests/{id}/messages ---------------------------------------------------


def test_get_messages_admin_can_view_any_request() -> None:
    response = _get_messages(_tokens["admin"], _ids["request_b"])
    assert response.status_code == 200


def test_get_messages_support_can_view_any_request() -> None:
    # SUPPORT has no per-company scoping relationship in the current data
    # model (documented in app/application/requests/authorization.py), so
    # it always has access here — there is no "SUPPORT forbidden" case to
    # test under the reused policy.
    response = _get_messages(_tokens["support1"], _ids["request_b"])
    assert response.status_code == 200


def test_get_messages_company_allowed_for_own_request() -> None:
    response = _get_messages(_tokens["company_a_owner"], _ids["request_a"])
    assert response.status_code == 200


def test_get_messages_company_forbidden_for_other_company_request() -> None:
    response = _get_messages(_tokens["company_a_owner"], _ids["request_b"])
    assert response.status_code == 403


def test_get_messages_user_allowed_for_own_request() -> None:
    response = _get_messages(_tokens["user_a1"], _ids["request_a"])
    assert response.status_code == 200


def test_get_messages_user_forbidden_for_other_company_request() -> None:
    response = _get_messages(_tokens["user_a1"], _ids["request_b"])
    assert response.status_code == 403


def test_get_messages_without_token_returns_401() -> None:
    response = client.get(f"/api/v1/requests/{_ids['request_a']}/messages")
    assert response.status_code == 401


def test_get_messages_invalid_token_returns_401() -> None:
    response = _get_messages("not-a-real-token", _ids["request_a"])
    assert response.status_code == 401


def test_get_messages_returns_404_when_request_missing() -> None:
    response = _get_messages(_tokens["admin"], str(uuid.uuid4()))
    assert response.status_code == 404
    assert response.json() == {"detail": "Request not found"}


def test_get_messages_are_ordered_oldest_first() -> None:
    request = _new_request(_tokens["user_a1"], "Ordering test request")
    _post_message(_tokens["user_a1"], request["id"], "First")
    _post_message(_tokens["admin"], request["id"], "Second")
    _post_message(_tokens["user_a1"], request["id"], "Third")

    response = _get_messages(_tokens["user_a1"], request["id"])
    assert response.status_code == 200
    contents = [message["content"] for message in response.json()]
    assert contents == ["First", "Second", "Third"]


# --- POST /requests/{id}/messages ---------------------------------------------------


def test_post_message_admin_can_post_on_any_request() -> None:
    response = _post_message(_tokens["admin"], _ids["request_b"])
    assert response.status_code == 201
    body = response.json()
    assert body["request_id"] == _ids["request_b"]
    assert body["author_id"] == _ids["admin"]
    assert body["content"] == "The issue persists."


def test_post_message_support_can_post_on_any_request() -> None:
    response = _post_message(_tokens["support1"], _ids["request_b"])
    assert response.status_code == 201
    assert response.json()["author_id"] == _ids["support1"]


def test_post_message_company_allowed_for_own_request() -> None:
    response = _post_message(_tokens["company_a_owner"], _ids["request_a"])
    assert response.status_code == 201
    assert response.json()["author_id"] == _ids["company_a_owner"]


def test_post_message_company_forbidden_for_other_company_request() -> None:
    response = _post_message(_tokens["company_a_owner"], _ids["request_b"])
    assert response.status_code == 403


def test_post_message_user_allowed_for_own_request() -> None:
    response = _post_message(_tokens["user_a1"], _ids["request_a"])
    assert response.status_code == 201
    assert response.json()["author_id"] == _ids["user_a1"]


def test_post_message_user_forbidden_for_other_company_request() -> None:
    response = _post_message(_tokens["user_a1"], _ids["request_b"])
    assert response.status_code == 403


def test_post_message_without_token_returns_401() -> None:
    response = client.post(f"/api/v1/requests/{_ids['request_a']}/messages", json={"content": "x"})
    assert response.status_code == 401


def test_post_message_returns_404_when_request_missing() -> None:
    response = _post_message(_tokens["admin"], str(uuid.uuid4()))
    assert response.status_code == 404


def test_post_message_empty_content_returns_422() -> None:
    response = _post_message(_tokens["user_a1"], _ids["request_a"], content="")
    assert response.status_code == 422


def test_post_message_whitespace_only_content_returns_422() -> None:
    response = _post_message(_tokens["user_a1"], _ids["request_a"], content="     ")
    assert response.status_code == 422


def test_post_message_missing_content_returns_422() -> None:
    response = client.post(
        f"/api/v1/requests/{_ids['request_a']}/messages", json={}, headers=_auth(_tokens["user_a1"])
    )
    assert response.status_code == 422


# --- Security: server-determined author/request, never the client ------------------


def test_post_message_ignores_client_supplied_author_id() -> None:
    response = _post_message(
        _tokens["user_a1"],
        _ids["request_a"],
        content="Trying to impersonate",
        extra={"author_id": _ids["admin"]},
    )
    assert response.status_code == 201
    assert response.json()["author_id"] == _ids["user_a1"]


def test_post_message_ignores_client_supplied_request_id() -> None:
    response = _post_message(
        _tokens["user_a1"],
        _ids["request_a"],
        content="Trying to redirect",
        extra={"request_id": _ids["request_b"]},
    )
    assert response.status_code == 201
    assert response.json()["request_id"] == _ids["request_a"]


def test_post_message_ignores_client_supplied_company_id() -> None:
    response = _post_message(
        _tokens["user_a1"],
        _ids["request_a"],
        content="Trying to switch company",
        extra={"company_id": _ids["company_b"]},
    )
    assert response.status_code == 201
    # MessageResponse doesn't even expose a company_id — it isn't a field on
    # the message; it's only ever derived from the request.
    assert "company_id" not in response.json()


# --- Closed requests (RESOLVED / CANCELLED) -----------------------------------------


def test_post_message_returns_409_when_request_resolved() -> None:
    request = _new_request(_tokens["user_a1"], "Resolved request for messages")
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))

    response = _post_message(_tokens["user_a1"], request["id"])
    assert response.status_code == 409


def test_post_message_returns_409_when_request_cancelled() -> None:
    request = _new_request(_tokens["user_a1"], "Cancelled request for messages")
    cancel = client.patch(f"/api/v1/requests/{request['id']}/cancel", headers=_auth(_tokens["user_a1"]))
    assert cancel.status_code == 200

    response = _post_message(_tokens["user_a1"], request["id"])
    assert response.status_code == 409


def test_get_messages_still_works_on_resolved_request() -> None:
    request = _new_request(_tokens["user_a1"], "Resolved request still readable")
    _post_message(_tokens["user_a1"], request["id"], "Before resolving")
    client.post(f"/api/v1/requests/{request['id']}/take", headers=_auth(_tokens["support1"]))
    client.post(f"/api/v1/requests/{request['id']}/resolve", headers=_auth(_tokens["support1"]))

    response = _get_messages(_tokens["user_a1"], request["id"])
    assert response.status_code == 200
    assert len(response.json()) == 1


# --- Cross-company isolation ---------------------------------------------------------


def test_company_isolation_between_two_companies() -> None:
    request_a = _new_request(_tokens["user_a1"], "Isolation A")
    request_b = _new_request(_tokens["user_b1"], "Isolation B")
    _post_message(_tokens["user_a1"], request_a["id"], "A1")
    _post_message(_tokens["user_a1"], request_a["id"], "A2")
    _post_message(_tokens["user_b1"], request_b["id"], "B1")
    _post_message(_tokens["user_b1"], request_b["id"], "B2")

    own = _get_messages(_tokens["company_a_owner"], request_a["id"])
    assert own.status_code == 200
    assert {m["content"] for m in own.json()} == {"A1", "A2"}

    other = _get_messages(_tokens["company_a_owner"], request_b["id"])
    assert other.status_code == 403

    other_post = _post_message(_tokens["company_a_owner"], request_b["id"])
    assert other_post.status_code == 403
