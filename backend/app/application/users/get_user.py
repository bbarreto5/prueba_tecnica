from uuid import UUID

from app.application.users.authorization import can_access_user
from app.application.users.exceptions import UserAccessDeniedError, UserNotFoundError
from app.domain.entities.user import User
from app.infrastructure.database.repositories.user_repository import UserRepository


async def get_user(target_id: UUID, current_user: User, user_repository: UserRepository) -> User:
    target = await user_repository.get_by_id(target_id)
    if target is None:
        raise UserNotFoundError(str(target_id))

    # Authorization is checked before the caller can do anything with the
    # fetched record — a 403 here never leaks the target's data.
    if not can_access_user(current_user, target):
        raise UserAccessDeniedError(str(target_id))

    return target
