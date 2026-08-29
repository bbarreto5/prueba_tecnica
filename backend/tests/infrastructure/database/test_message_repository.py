import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.company import Company
from app.domain.entities.message import Message
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.request import RequestPriority, RequestStatus, RequestType
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.message_repository import MessageRepository
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


def _make_request(company_id: uuid.UUID, created_by: uuid.UUID) -> Request:
    now = _now()
    return Request(
        id=uuid.uuid4(),
        company_id=company_id,
        created_by=created_by,
        assigned_to=None,
        title="Need help",
        description="I have a question about billing.",
        type=RequestType.QUESTION,
        priority=RequestPriority.LOW,
        status=RequestStatus.PENDING,
        created_at=now,
        updated_at=now,
        resolved_at=None,
    )


def _make_message(request_id: uuid.UUID, author_id: uuid.UUID, content: str = "Hello, can you help?") -> Message:
    return Message(id=uuid.uuid4(), request_id=request_id, author_id=author_id, content=content, created_at=_now())


async def _seed_request(session: AsyncSession) -> tuple[Request, User]:
    company = await CompanyRepository(session).create(_make_company("Message Co."))
    author = await UserRepository(session).create(
        _make_user(f"author-{uuid.uuid4().hex[:8]}@messageco.com", UserRole.COMPANY, company.id)
    )
    request = await RequestRepository(session).create(_make_request(company.id, author.id))
    await session.commit()
    return request, author


def test_create_and_get_by_id() -> None:
    async def _run() -> None:
        async with new_session() as session:
            request, author = await _seed_request(session)
            repo = MessageRepository(session)
            created = await repo.create(_make_message(request.id, author.id))
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is not None
        assert fetched.request_id == request.id
        assert fetched.author_id == author.id

    run_async(_run())


def test_list_by_request() -> None:
    async def _run() -> None:
        async with new_session() as session:
            request, author = await _seed_request(session)
            repo = MessageRepository(session)
            await repo.create(_make_message(request.id, author.id, "First"))
            await repo.create(_make_message(request.id, author.id, "Second"))
            await session.commit()

            messages = await repo.list_by_request(request.id)

        assert [m.content for m in messages] == ["First", "Second"]

    run_async(_run())


def test_delete() -> None:
    async def _run() -> None:
        async with new_session() as session:
            request, author = await _seed_request(session)
            repo = MessageRepository(session)
            created = await repo.create(_make_message(request.id, author.id))
            await session.commit()

            await repo.delete(created.id)
            await session.commit()

            fetched = await repo.get_by_id(created.id)

        assert fetched is None

    run_async(_run())


def test_messages_are_deleted_when_request_is_deleted() -> None:
    async def _run() -> None:
        async with new_session() as session:
            request, author = await _seed_request(session)
            message_repo = MessageRepository(session)
            await message_repo.create(_make_message(request.id, author.id))
            await session.commit()

            await RequestRepository(session).delete(request.id)
            await session.commit()

            remaining = await message_repo.list_by_request(request.id)

        assert remaining == []

    run_async(_run())
