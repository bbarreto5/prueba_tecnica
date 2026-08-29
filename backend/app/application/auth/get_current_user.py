from uuid import UUID

from app.core.security import TokenError, decode_access_token
from app.domain.entities.user import User
from app.infrastructure.database.repositories.user_repository import UserRepository


class InvalidTokenError(Exception):
    """Raised when the bearer token is missing, malformed, expired, or invalid."""


class UserNotFoundError(Exception):
    """Raised when the token is valid but no matching active user exists."""


async def get_current_user(token: str, user_repository: UserRepository) -> User:
    try:
        payload = decode_access_token(token)
    except TokenError as exc:
        raise InvalidTokenError("Invalid or expired token") from exc

    subject = payload.get("sub")
    if not subject:
        raise InvalidTokenError("Token is missing the 'sub' claim")

    try:
        user_id = UUID(subject)
    except ValueError as exc:
        raise InvalidTokenError("Token contains an invalid subject") from exc

    user = await user_repository.get_by_id(user_id)
    if user is None or not user.is_active:
        raise UserNotFoundError("User not found")

    return user
