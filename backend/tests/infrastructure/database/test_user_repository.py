import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy.exc import IntegrityError

from app.domain.entities.company import Company
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from tests.infrastructure.database.conftest import new_session, reset_schema, run_async


def setup_module() -> None:
    reset_schema()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _make_company(name: str = "Acme Inc.") -> Company:
    now = _now()
    return Company(id=uuid.uuid4(), name=name, is_active=True, created_at=now, updated_at=now)


def _make_user(
    email: str,
    role: UserRole = UserRole.USER,
    company_id: uuid.UUID | None = None,
) -> User:
    now = _now()
    return User(
        id=uuid.uuid4(),
        company_id=company_id,
        name="Jane Doe",
        email=email,
        password_hash="hashed-secret",
        role=role,
        is_active=True,
        created_at=now,
        updated_at=now,
    )


def test_create_admin_without_company() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            created = await repo.create(_make_user("admin@example.com", role=UserRole.ADMIN))
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is not None
        assert fetched.company_id is None
        assert fetched.role == UserRole.ADMIN

    run_async(_run())


def test_create_company_user_with_relationship() -> None:
    async def _run() -> None:
        async with new_session() as session:
            company = await CompanyRepository(session).create(_make_company("Relationship Co."))
            user = await UserRepository(session).create(
                _make_user("owner@relationship.co", role=UserRole.COMPANY, company_id=company.id)
            )
            await session.commit()

            fetched = await UserRepository(session).get_by_id(user.id)

        assert fetched is not None
        assert fetched.company_id == company.id

    run_async(_run())


def test_get_by_email() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            created = await repo.create(_make_user("lookup@example.com"))
            await session.commit()

            fetched = await repo.get_by_email("lookup@example.com")

        assert fetched is not None
        assert fetched.id == created.id

    run_async(_run())


def test_email_must_be_unique() -> None:
    async def _run() -> None:
        async with new_session() as session:
            await UserRepository(session).create(_make_user("duplicate@example.com"))
            await session.commit()

        async with new_session() as session:
            with pytest.raises(IntegrityError):
                await UserRepository(session).create(_make_user("duplicate@example.com"))

    run_async(_run())


def test_update() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            created = await repo.create(_make_user("update@example.com"))
            await session.commit()

            created.name = "Updated Name"
            created.is_active = False
            updated = await repo.update(created)
            await session.commit()

        assert updated is not None
        assert updated.name == "Updated Name"
        assert updated.is_active is False

    run_async(_run())


def test_delete() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            created = await repo.create(_make_user("delete@example.com"))
            await session.commit()

            await repo.delete(created.id)
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is None

    run_async(_run())
