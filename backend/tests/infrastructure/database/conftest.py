"""Shared async test-database plumbing for the repository tests.

No pytest-asyncio dependency is added: each test wraps its body in
``run_async`` (a thin ``asyncio.run`` helper) instead, keeping
requirements.txt unchanged.
"""

import asyncio
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Coroutine, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.infrastructure.database.models import (  # noqa: F401
    CompanyModel,
    MessageModel,
    RequestModel,
    UserModel,
)

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://localhost:5432/incidents_test",
)

_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
_session_factory = async_sessionmaker(_engine, expire_on_commit=False)

T = TypeVar("T")


def run_async(coro: "Coroutine[object, object, T]") -> T:
    return asyncio.run(coro)


async def _reset_schema_async() -> None:
    async with _engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)


def reset_schema() -> None:
    """Wipe and recreate every table; called once per test module."""
    run_async(_reset_schema_async())


@asynccontextmanager
async def new_session() -> AsyncIterator[AsyncSession]:
    async with _session_factory() as session:
        yield session
