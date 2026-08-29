from app.core.security import verify_password
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.database.seed import SEED_USERS, seed_users
from tests.infrastructure.database.conftest import (
    new_session,
    reset_schema,
    run_async,
    session_factory_for_tests,
)


def setup_module() -> None:
    reset_schema()


def test_first_run_creates_one_admin_and_two_support() -> None:
    async def _run() -> None:
        created, skipped = await seed_users(session_factory=session_factory_for_tests)

        async with new_session() as session:
            repo = UserRepository(session)
            users = await repo.list()

        assert created == 3
        assert skipped == 0
        assert len(users) == 3

        by_email = {user.email: user for user in users}
        assert by_email["admin@example.com"].role == UserRole.ADMIN
        assert by_email["support1@example.com"].role == UserRole.SUPPORT
        assert by_email["support2@example.com"].role == UserRole.SUPPORT

    run_async(_run())


def test_second_run_is_idempotent() -> None:
    async def _run() -> None:
        created, skipped = await seed_users(session_factory=session_factory_for_tests)

        async with new_session() as session:
            users = await UserRepository(session).list()

        assert created == 0
        assert skipped == 3
        assert len(users) == 3

    run_async(_run())


def test_passwords_are_hashed_and_verifiable() -> None:
    async def _run() -> None:
        async with new_session() as session:
            admin = await UserRepository(session).get_by_email("admin@example.com")

        assert admin is not None
        admin_spec = next(spec for spec in SEED_USERS if spec["email"] == "admin@example.com")

        assert admin.password_hash != admin_spec["password_default"]
        assert verify_password(admin_spec["password_default"], admin.password_hash)
        assert not verify_password("wrong-password", admin.password_hash)

    run_async(_run())


def test_roles_are_assigned_correctly() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            admin = await repo.get_by_email("admin@example.com")
            support1 = await repo.get_by_email("support1@example.com")
            support2 = await repo.get_by_email("support2@example.com")

        assert admin is not None and admin.role == UserRole.ADMIN
        assert support1 is not None and support1.role == UserRole.SUPPORT
        assert support2 is not None and support2.role == UserRole.SUPPORT

    run_async(_run())
