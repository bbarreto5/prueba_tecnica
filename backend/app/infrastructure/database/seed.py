"""Idempotent seed of initial development data: users, and companies with
their associated users.

Run from `backend/` with:

    python -m app.infrastructure.database.seed
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.database import async_session_factory
from app.core.security import hash_password
from app.domain.entities.company import Company
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository

SEED_USERS = [
    {
        "email": "admin@example.com",
        "name": "System Administrator",
        "role": UserRole.ADMIN,
        "password_env": "SEED_ADMIN_PASSWORD",
        "password_default": "Admin123!",
    },
    {
        "email": "support1@example.com",
        "name": "Support User 1",
        "role": UserRole.SUPPORT,
        "password_env": "SEED_SUPPORT_PASSWORD",
        "password_default": "Support123!",
    },
    {
        "email": "support2@example.com",
        "name": "Support User 2",
        "role": UserRole.SUPPORT,
        "password_env": "SEED_SUPPORT_PASSWORD",
        "password_default": "Support123!",
    },
]

# Each company gets exactly 5 users: 1 with role=COMPANY (the company's
# primary contact) and 4 with role=USER. Users are matched across runs by
# email; companies are matched by name (the closest thing to a natural
# identifier CompanyModel has — there is no unique constraint on it, so this
# check is the only thing preventing duplicate companies with the same name).
SEED_COMPANIES = [
    {
        "name": "Acme Solutions",
        "users": [
            {"email": "acme.company@example.com", "name": "John Doe", "role": UserRole.COMPANY},
            {"email": "acme.user1@example.com", "name": "Jane Smith", "role": UserRole.USER},
            {"email": "acme.user2@example.com", "name": "Michael Brown", "role": UserRole.USER},
            {"email": "acme.user3@example.com", "name": "Emily Davis", "role": UserRole.USER},
            {"email": "acme.user4@example.com", "name": "Daniel Wilson", "role": UserRole.USER},
        ],
    },
    {
        "name": "TechNova Industries",
        "users": [
            {"email": "technova.company@example.com", "name": "Olivia Martinez", "role": UserRole.COMPANY},
            {"email": "technova.user1@example.com", "name": "James Anderson", "role": UserRole.USER},
            {"email": "technova.user2@example.com", "name": "Sophia Taylor", "role": UserRole.USER},
            {"email": "technova.user3@example.com", "name": "Benjamin Thomas", "role": UserRole.USER},
            {"email": "technova.user4@example.com", "name": "Camila Rodriguez", "role": UserRole.USER},
        ],
    },
    {
        "name": "Global Services Corp",
        "users": [
            {"email": "global.company@example.com", "name": "Mateo Gonzalez", "role": UserRole.COMPANY},
            {"email": "global.user1@example.com", "name": "Valentina Perez", "role": UserRole.USER},
            {"email": "global.user2@example.com", "name": "Lucas Fernandez", "role": UserRole.USER},
            {"email": "global.user3@example.com", "name": "Isabella Ramirez", "role": UserRole.USER},
            {"email": "global.user4@example.com", "name": "Gabriel Torres", "role": UserRole.USER},
        ],
    },
    {
        "name": "Andes Digital",
        "users": [
            {"email": "andes.company@example.com", "name": "Sofia Castro", "role": UserRole.COMPANY},
            {"email": "andes.user1@example.com", "name": "Diego Morales", "role": UserRole.USER},
            {"email": "andes.user2@example.com", "name": "Valeria Ortiz", "role": UserRole.USER},
            {"email": "andes.user3@example.com", "name": "Andres Silva", "role": UserRole.USER},
            {"email": "andes.user4@example.com", "name": "Paula Reyes", "role": UserRole.USER},
        ],
    },
    {
        "name": "Caribbean Logistics",
        "users": [
            {"email": "caribbean.company@example.com", "name": "Carlos Mendez", "role": UserRole.COMPANY},
            {"email": "caribbean.user1@example.com", "name": "Laura Jimenez", "role": UserRole.USER},
            {"email": "caribbean.user2@example.com", "name": "Roberto Diaz", "role": UserRole.USER},
            {"email": "caribbean.user3@example.com", "name": "Natalia Vega", "role": UserRole.USER},
            {"email": "caribbean.user4@example.com", "name": "Diego Herrera", "role": UserRole.USER},
        ],
    },
]


async def seed_users(
    session_factory: async_sessionmaker[AsyncSession] = async_session_factory,
) -> tuple[int, int]:
    """Create the seed users that don't already exist (matched by email).

    Returns (created_count, skipped_count).
    """
    created = 0
    skipped = 0

    async with session_factory() as session:
        try:
            repo = UserRepository(session)

            for spec in SEED_USERS:
                if await repo.get_by_email(spec["email"]) is not None:
                    print(f"→ {spec['email']} already exists")
                    skipped += 1
                    continue

                password = os.getenv(spec["password_env"], spec["password_default"])
                now = datetime.now(timezone.utc)
                await repo.create(
                    User(
                        id=uuid.uuid4(),
                        company_id=None,
                        name=spec["name"],
                        email=spec["email"],
                        password_hash=hash_password(password),
                        role=spec["role"],
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                )
                print(f"✓ Created {spec['email']}")
                created += 1

            await session.commit()
        except Exception:
            await session.rollback()
            raise

    return created, skipped


async def seed_companies(
    session_factory: async_sessionmaker[AsyncSession] = async_session_factory,
) -> tuple[int, int, int, int]:
    """Create the seed companies and their associated users that don't
    already exist (companies matched by name, users matched by email).

    Returns (companies_created, companies_skipped, users_created, users_skipped).
    """
    companies_created = 0
    companies_skipped = 0
    users_created = 0
    users_skipped = 0

    async with session_factory() as session:
        try:
            company_repo = CompanyRepository(session)
            user_repo = UserRepository(session)

            print("\nCompanies:")
            company_ids: dict[str, uuid.UUID] = {}
            for spec in SEED_COMPANIES:
                existing = await company_repo.get_by_name(spec["name"])
                if existing is not None:
                    print(f"→ {spec['name']} already exists")
                    companies_skipped += 1
                    company_ids[spec["name"]] = existing.id
                    continue

                now = datetime.now(timezone.utc)
                company = await company_repo.create(
                    Company(
                        id=uuid.uuid4(),
                        name=spec["name"],
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                )
                print(f"✓ Created {spec['name']}")
                companies_created += 1
                company_ids[spec["name"]] = company.id

            print("\nCompany users:")
            password = os.getenv("SEED_COMPANY_USER_PASSWORD", "Company123!")
            for spec in SEED_COMPANIES:
                company_id = company_ids[spec["name"]]

                for user_spec in spec["users"]:
                    if await user_repo.get_by_email(user_spec["email"]) is not None:
                        print(f"→ {user_spec['email']} already exists")
                        users_skipped += 1
                        continue

                    now = datetime.now(timezone.utc)
                    await user_repo.create(
                        User(
                            id=uuid.uuid4(),
                            company_id=company_id,
                            name=user_spec["name"],
                            email=user_spec["email"],
                            password_hash=hash_password(password),
                            role=user_spec["role"],
                            is_active=True,
                            created_at=now,
                            updated_at=now,
                        )
                    )
                    print(f"✓ Created {user_spec['email']} → {spec['name']}")
                    users_created += 1

            await session.commit()
        except Exception:
            await session.rollback()
            raise

    return companies_created, companies_skipped, users_created, users_skipped


async def run() -> None:
    print("Starting database seed...\n")

    print("Users:")
    await seed_users()

    companies_created, companies_skipped, users_created, users_skipped = await seed_companies()

    print("\nSeed completed successfully.\n")
    print(f"Companies created: {companies_created}")
    print(f"Companies skipped: {companies_skipped}")
    print()
    print(f"Users created: {users_created}")
    print(f"Users skipped: {users_skipped}")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
