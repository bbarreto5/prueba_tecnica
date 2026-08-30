from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository


async def get_users(current_user: User, user_repository: UserRepository) -> list[User]:
    """List the users `current_user` is allowed to see.

    The filter is derived entirely from `current_user` — never from
    client-supplied query parameters — so a request can't widen its own
    visibility. USER never reaches this use case: the router blocks it
    with require_roles() before it gets here.
    """
    if current_user.role == UserRole.ADMIN:
        return await user_repository.list()

    if current_user.role == UserRole.SUPPORT:
        return await user_repository.list(roles=[UserRole.COMPANY, UserRole.USER])

    # COMPANY
    return await user_repository.list(roles=[UserRole.USER], company_id=current_user.company_id)
