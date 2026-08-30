import uuid
from datetime import datetime, timezone

from app.application.users.authorization import CREATABLE_ROLES
from app.application.users.exceptions import (
    CompanyAssignmentError,
    EmailAlreadyExistsError,
    InvalidCompanyAssignmentError,
    RoleNotAllowedError,
)
from app.application.users.schemas import UserCreate
from app.core.security import hash_password
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository


async def create_user(
    data: UserCreate,
    current_user: User,
    user_repository: UserRepository,
    company_repository: CompanyRepository,
) -> User:
    if data.role not in CREATABLE_ROLES[current_user.role]:
        raise RoleNotAllowedError(data.role.value)

    if current_user.role == UserRole.COMPANY:
        # A COMPANY user can only ever create USER accounts inside their own
        # company; the client is not allowed to pick a different one.
        if data.company_id is not None and data.company_id != current_user.company_id:
            raise CompanyAssignmentError("Cannot assign a company other than your own")
        company_id = current_user.company_id
    else:
        company_id = data.company_id

    if data.role in (UserRole.ADMIN, UserRole.SUPPORT):
        company_id = None
    elif company_id is None or await company_repository.get_by_id(company_id) is None:
        raise InvalidCompanyAssignmentError("company_id must reference an existing company")

    if await user_repository.get_by_email(data.email) is not None:
        raise EmailAlreadyExistsError(data.email)

    now = datetime.now(timezone.utc)
    user = User(
        id=uuid.uuid4(),
        company_id=company_id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    return await user_repository.create(user)
