from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.auth.get_current_user import (
    InvalidTokenError,
    UserNotFoundError,
)
from app.application.auth.get_current_user import get_current_user as get_current_user_use_case
from app.core.database import get_session
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository

_bearer_scheme = HTTPBearer(auto_error=False)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    if credentials is None:
        raise _UNAUTHORIZED

    try:
        return await get_current_user_use_case(credentials.credentials, UserRepository(session))
    except (InvalidTokenError, UserNotFoundError) as exc:
        raise _UNAUTHORIZED from exc


def require_roles(*allowed_roles: UserRole):
    """Build a dependency that only lets the given roles through.

    Requires authentication first (via get_current_user); an authenticated
    user whose role isn't in `allowed_roles` gets 403, not 401.
    """

    async def dependency(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return current_user

    return dependency
