from app.core.security import verify_password
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.database.seed import SEED_COMPANIES, SEED_USERS, seed_companies, seed_users
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


def test_initial_users_remain_unassociated_with_any_company() -> None:
    async def _run() -> None:
        async with new_session() as session:
            repo = UserRepository(session)
            admin = await repo.get_by_email("admin@example.com")
            support1 = await repo.get_by_email("support1@example.com")

        assert admin is not None and admin.company_id is None
        assert support1 is not None and support1.company_id is None

    run_async(_run())


def test_companies_first_run_creates_five_companies_and_twentyfive_users() -> None:
    async def _run() -> None:
        companies_created, companies_skipped, users_created, users_skipped = await seed_companies(
            session_factory=session_factory_for_tests
        )

        async with new_session() as session:
            companies = await CompanyRepository(session).list()

        assert companies_created == 5
        assert companies_skipped == 0
        assert users_created == 25
        assert users_skipped == 0

        names = {company.name for company in companies}
        assert names == {spec["name"] for spec in SEED_COMPANIES}

    run_async(_run())


def test_companies_second_run_is_idempotent() -> None:
    async def _run() -> None:
        companies_created, companies_skipped, users_created, users_skipped = await seed_companies(
            session_factory=session_factory_for_tests
        )

        async with new_session() as session:
            companies = await CompanyRepository(session).list()
            users = await UserRepository(session).list()

        assert companies_created == 0
        assert companies_skipped == 5
        assert users_created == 0
        assert users_skipped == 25

        assert len(companies) == 5
        # 3 initial users (admin/support1/support2) + 25 company users = 28
        assert len(users) == 28

    run_async(_run())


def test_each_company_has_exactly_one_company_role_and_four_user_role() -> None:
    async def _run() -> None:
        async with new_session() as session:
            companies = await CompanyRepository(session).list()
            users = await UserRepository(session).list()

        roles_by_company: dict = {}
        for user in users:
            if user.company_id is not None:
                roles_by_company.setdefault(user.company_id, []).append(user.role)

        by_name = {company.name: company for company in companies}
        for spec in SEED_COMPANIES:
            company = by_name[spec["name"]]
            roles = roles_by_company.get(company.id, [])
            assert len(roles) == 5
            assert roles.count(UserRole.COMPANY) == 1
            assert roles.count(UserRole.USER) == 4

    run_async(_run())


def test_company_users_have_expected_roles_and_are_linked_to_their_company() -> None:
    async def _run() -> None:
        async with new_session() as session:
            acme = await CompanyRepository(session).get_by_name("Acme Solutions")
            company_contact = await UserRepository(session).get_by_email("acme.company@example.com")
            plain_user = await UserRepository(session).get_by_email("acme.user1@example.com")

        assert acme is not None
        assert company_contact is not None
        assert plain_user is not None

        assert company_contact.role == UserRole.COMPANY
        assert company_contact.company_id == acme.id

        assert plain_user.role == UserRole.USER
        assert plain_user.company_id == acme.id

    run_async(_run())


def test_company_user_passwords_are_hashed_and_verifiable() -> None:
    async def _run() -> None:
        async with new_session() as session:
            user = await UserRepository(session).get_by_email("acme.user1@example.com")

        assert user is not None
        assert user.password_hash != "Company123!"
        assert verify_password("Company123!", user.password_hash)
        assert not verify_password("wrong-password", user.password_hash)

    run_async(_run())
