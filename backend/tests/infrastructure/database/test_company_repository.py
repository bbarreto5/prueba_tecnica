import uuid
from datetime import datetime, timezone

from app.domain.entities.company import Company
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from tests.infrastructure.database.conftest import new_session, reset_schema, run_async


def setup_module() -> None:
    reset_schema()


def _make_company(name: str = "Acme Inc.") -> Company:
    now = datetime.now(timezone.utc)
    return Company(id=uuid.uuid4(), name=name, is_active=True, created_at=now, updated_at=now)


def test_create_and_get_by_id() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = CompanyRepository(session)
            created = await repo.create(_make_company())
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is not None
        assert fetched.id == created.id
        assert fetched.name == "Acme Inc."
        assert fetched.is_active is True

    run_async(_run())


def test_get_by_id_returns_none_when_missing() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = CompanyRepository(session)
            fetched = await repo.get_by_id(uuid.uuid4())

        assert fetched is None

    run_async(_run())


def test_list() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = CompanyRepository(session)
            await repo.create(_make_company("Company A"))
            await repo.create(_make_company("Company B"))
            await session.commit()

            companies = await repo.list()

        assert len(companies) >= 2

    run_async(_run())


def test_update() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = CompanyRepository(session)
            created = await repo.create(_make_company("Old Name"))
            await session.commit()

            created.name = "New Name"
            created.is_active = False
            updated = await repo.update(created)
            await session.commit()

        assert updated is not None
        assert updated.name == "New Name"
        assert updated.is_active is False

    run_async(_run())


def test_delete() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = CompanyRepository(session)
            created = await repo.create(_make_company("To Delete"))
            await session.commit()

            await repo.delete(created.id)
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is None

    run_async(_run())
