import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.company import Company
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.request import RequestPriority, RequestStatus, RequestType
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from tests.infrastructure.database.conftest import new_session, reset_schema, run_async


def setup_module() -> None:
    reset_schema()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _make_company(name: str) -> Company:
    now = _now()
    return Company(id=uuid.uuid4(), name=name, is_active=True, created_at=now, updated_at=now)


def _make_user(email: str, role: UserRole, company_id: uuid.UUID | None = None) -> User:
    now = _now()
    return User(
        id=uuid.uuid4(),
        company_id=company_id,
        name=email,
        email=email,
        password_hash="hashed-secret",
        role=role,
        is_active=True,
        created_at=now,
        updated_at=now,
    )


def _make_request(
    company_id: uuid.UUID, created_by: uuid.UUID, assigned_to: uuid.UUID | None = None
) -> Request:
    now = _now()
    return Request(
        id=uuid.uuid4(),
        company_id=company_id,
        created_by=created_by,
        assigned_to=assigned_to,
        title="Server is down",
        description="The production server is not responding.",
        type=RequestType.INCIDENT,
        priority=RequestPriority.HIGH,
        status=RequestStatus.PENDING,
        created_at=now,
        updated_at=now,
        resolved_at=None,
    )


async def _seed_company_and_creator(session: AsyncSession) -> tuple[Company, User]:
    company = await CompanyRepository(session).create(_make_company("Request Co."))
    creator = await UserRepository(session).create(
        _make_user(f"creator-{uuid.uuid4().hex[:8]}@requestco.com", UserRole.COMPANY, company.id)
    )
    await session.commit()
    return company, creator


def test_create_and_get_by_id() -> None:
    async def _run() -> None:
        async with new_session() as session:
            company, creator = await _seed_company_and_creator(session)
            repo = RequestRepository(session)
            created = await repo.create(_make_request(company.id, creator.id))
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is not None
        assert fetched.company_id == company.id
        assert fetched.created_by == creator.id
        assert fetched.assigned_to is None
        assert fetched.status == RequestStatus.PENDING

    run_async(_run())


def test_list_by_company() -> None:
    async def _run() -> None:
        async with new_session() as session:
            company, creator = await _seed_company_and_creator(session)
            repo = RequestRepository(session)
            await repo.create(_make_request(company.id, creator.id))
            await repo.create(_make_request(company.id, creator.id))
            await session.commit()

            requests = await repo.list_by_company(company.id)

        assert len(requests) == 2
        assert all(r.company_id == company.id for r in requests)

    run_async(_run())


def test_update_assigns_support_and_resolves() -> None:
    async def _run() -> None:
        async with new_session() as session:
            company, creator = await _seed_company_and_creator(session)
            support = await UserRepository(session).create(
                _make_user(f"support-{uuid.uuid4().hex[:8]}@internal.com", UserRole.SUPPORT)
            )
            await session.commit()

            repo = RequestRepository(session)
            created = await repo.create(_make_request(company.id, creator.id))
            await session.commit()

            created.assigned_to = support.id
            created.status = RequestStatus.RESOLVED
            created.resolved_at = _now()
            updated = await repo.update(created)
            await session.commit()

        assert updated is not None
        assert updated.assigned_to == support.id
        assert updated.status == RequestStatus.RESOLVED
        assert updated.resolved_at is not None

    run_async(_run())


def test_delete() -> None:
    async def _run() -> None:
        async with new_session() as session:
            company, creator = await _seed_company_and_creator(session)
            repo = RequestRepository(session)
            created = await repo.create(_make_request(company.id, creator.id))
            await session.commit()

            await repo.delete(created.id)
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is None

    run_async(_run())


def test_company_id_foreign_key_is_enforced() -> None:
    async def _run() -> None:
        async with new_session() as session:
            _, creator = await _seed_company_and_creator(session)

        async with new_session() as session:
            repo = RequestRepository(session)
            with pytest.raises(IntegrityError):
                await repo.create(_make_request(uuid.uuid4(), creator.id))

    run_async(_run())
