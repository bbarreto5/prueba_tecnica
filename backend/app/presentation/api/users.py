from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.notifications.notify_password_changed import notify_password_changed
from app.application.users.create_user import create_user as create_user_use_case
from app.application.users.exceptions import (
    CompanyAssignmentError,
    EmailAlreadyExistsError,
    InvalidCompanyAssignmentError,
    RoleNotAllowedError,
    UserAccessDeniedError,
    UserNotFoundError,
)
from app.application.users.get_user import get_user as get_user_use_case
from app.application.users.get_users import get_users as get_users_use_case
from app.application.users.schemas import UserCreate, UserResponse, UserUpdate
from app.application.users.update_user import update_user as update_user_use_case
from app.core.database import get_session
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService, get_email_service
from app.presentation.api.dependencies import require_roles

router = APIRouter(prefix="/users", tags=["users"])

# USER is blocked from every endpoint in this router; the finer-grained
# ADMIN/SUPPORT/COMPANY distinctions are enforced in the application layer,
# where target-specific context (role, company) is available.
_require_staff_or_company = require_roles(UserRole.ADMIN, UserRole.SUPPORT, UserRole.COMPANY)


def _forbidden() -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


def _invalid_company() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail="company_id must reference an existing company",
    )


def _email_conflict() -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")


@router.get("", response_model=list[UserResponse])
async def list_users(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_staff_or_company)],
) -> list[UserResponse]:
    users = await get_users_use_case(current_user, UserRepository(session))
    return [UserResponse.model_validate(user) for user in users]


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_staff_or_company)],
) -> UserResponse:
    try:
        user = await create_user_use_case(
            data, current_user, UserRepository(session), CompanyRepository(session)
        )
        await session.commit()
    except (RoleNotAllowedError, CompanyAssignmentError) as exc:
        await session.rollback()
        raise _forbidden() from exc
    except InvalidCompanyAssignmentError as exc:
        await session.rollback()
        raise _invalid_company() from exc
    except EmailAlreadyExistsError as exc:
        await session.rollback()
        raise _email_conflict() from exc
    except Exception:
        await session.rollback()
        raise
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_staff_or_company)],
) -> UserResponse:
    try:
        user = await get_user_use_case(user_id, current_user, UserRepository(session))
    except UserNotFoundError as exc:
        raise _not_found() from exc
    except UserAccessDeniedError as exc:
        raise _forbidden() from exc
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_staff_or_company)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> UserResponse:
    try:
        user = await update_user_use_case(
            user_id, data, current_user, UserRepository(session), CompanyRepository(session)
        )
        await session.commit()
    except UserNotFoundError as exc:
        await session.rollback()
        raise _not_found() from exc
    except UserAccessDeniedError as exc:
        await session.rollback()
        raise _forbidden() from exc
    except (RoleNotAllowedError, CompanyAssignmentError) as exc:
        await session.rollback()
        raise _forbidden() from exc
    except InvalidCompanyAssignmentError as exc:
        await session.rollback()
        raise _invalid_company() from exc
    except EmailAlreadyExistsError as exc:
        await session.rollback()
        raise _email_conflict() from exc
    except Exception:
        await session.rollback()
        raise
    if data.password is not None:
        await notify_password_changed(user, email_service)
    return UserResponse.model_validate(user)
