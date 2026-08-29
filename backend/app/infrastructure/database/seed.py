"""Idempotent seed of the initial development users.

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
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
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


async def run() -> None:
    print("Starting database seed...\n")
    created, skipped = await seed_users()
    print("\nSeed completed successfully.")
    print(f"Created: {created}")
    print(f"Skipped: {skipped}")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
