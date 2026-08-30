"""Shared authorization policy for the users module.

Kept separate from the individual use cases because both `get_user` and
`update_user` need the exact same "can current_user reach target_user"
check, and `create_user`/`update_user` need the exact same "which roles can
current_user assign" table.
"""

from app.domain.entities.user import User
from app.domain.enums.user import UserRole

# Which roles each authenticated role is allowed to create a user as, or
# promote/demote an existing user into.
CREATABLE_ROLES: dict[UserRole, frozenset[UserRole]] = {
    UserRole.ADMIN: frozenset({UserRole.ADMIN, UserRole.SUPPORT, UserRole.COMPANY, UserRole.USER}),
    UserRole.SUPPORT: frozenset({UserRole.COMPANY, UserRole.USER}),
    UserRole.COMPANY: frozenset({UserRole.USER}),
    UserRole.USER: frozenset(),
}


def can_access_user(current_user: User, target_user: User) -> bool:
    """Whether `current_user` may view or modify `target_user`.

    Shared by GET /users/{id} and PATCH /users/{id}, which use the exact
    same visibility rule:
      ADMIN   -> anyone
      SUPPORT -> COMPANY or USER targets only
      COMPANY -> USER targets in their own company only
      USER    -> never (blocked earlier, at the router, for every endpoint)
    """
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role == UserRole.SUPPORT:
        return target_user.role in (UserRole.COMPANY, UserRole.USER)
    if current_user.role == UserRole.COMPANY:
        return target_user.role == UserRole.USER and target_user.company_id == current_user.company_id
    return False
