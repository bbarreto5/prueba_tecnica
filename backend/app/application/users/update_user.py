from uuid import UUID

from app.application.users.authorization import CREATABLE_ROLES, can_access_user
from app.application.users.exceptions import (
    CompanyAssignmentError,
    EmailAlreadyExistsError,
    InvalidCompanyAssignmentError,
    RoleNotAllowedError,
    UserAccessDeniedError,
    UserNotFoundError,
)
from app.application.users.schemas import UserUpdate
from app.core.security import hash_password
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository


async def update_user(
    target_id: UUID,
    data: UserUpdate,
    current_user: User,
    user_repository: UserRepository,
    company_repository: CompanyRepository,
) -> User:
    target = await user_repository.get_by_id(target_id)
    if target is None:
        raise UserNotFoundError(str(target_id))

    # Same base "can reach this user at all" check as GET, evaluated before
    # anything about the target is applied/returned.
    if not can_access_user(current_user, target):
        raise UserAccessDeniedError(str(target_id))

    new_role = target.role
    if data.role is not None and data.role != target.role:
        if data.role not in CREATABLE_ROLES[current_user.role]:
            raise RoleNotAllowedError(data.role.value)
        new_role = data.role

    if current_user.role == UserRole.COMPANY:
        # COMPANY can never move a user to a different company, even to its
        # own value being resent — only a genuine no-op is tolerated.
        if data.company_id is not None and data.company_id != target.company_id:
            raise CompanyAssignmentError("Cannot reassign company")
        new_company_id = target.company_id
    else:
        new_company_id = data.company_id if data.company_id is not None else target.company_id

    if new_role in (UserRole.ADMIN, UserRole.SUPPORT):
        new_company_id = None
    elif new_company_id is None or await company_repository.get_by_id(new_company_id) is None:
        raise InvalidCompanyAssignmentError("company_id must reference an existing company")

    if data.email is not None and data.email != target.email:
        existing = await user_repository.get_by_email(data.email)
        if existing is not None and existing.id != target.id:
            raise EmailAlreadyExistsError(data.email)
        target.email = data.email

    if data.name is not None:
        target.name = data.name
    if data.password is not None:
        target.password_hash = hash_password(data.password)

    target.role = new_role
    target.company_id = new_company_id

    updated = await user_repository.update(target)
    if updated is None:
        raise UserNotFoundError(str(target_id))
    return updated
