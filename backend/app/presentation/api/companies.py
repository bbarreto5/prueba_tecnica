from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.application.companies.service import CompanyNotFoundError
from app.application.companies.service import create_company as create_company_use_case
from app.application.companies.service import get_company as get_company_use_case
from app.application.companies.service import list_companies as list_companies_use_case
from app.application.companies.service import update_company as update_company_use_case
from app.core.database import get_session
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.presentation.api.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/companies", tags=["companies"])

_require_admin_or_support = require_roles(UserRole.ADMIN, UserRole.SUPPORT)


async def _require_own_company_or_staff(
    company_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Allow ADMIN/SUPPORT for any company; COMPANY/USER only for their own."""
    if current_user.role in (UserRole.ADMIN, UserRole.SUPPORT):
        return current_user
    if current_user.role in (UserRole.COMPANY, UserRole.USER) and current_user.company_id == company_id:
        return current_user
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


@router.get("", response_model=list[CompanyResponse])
async def list_companies(
    session: Annotated[AsyncSession, Depends(get_session)],
    _current_user: Annotated[User, Depends(_require_admin_or_support)],
) -> list[CompanyResponse]:
    companies = await list_companies_use_case(CompanyRepository(session))
    return [CompanyResponse.model_validate(company) for company in companies]


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    data: CompanyCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _current_user: Annotated[User, Depends(_require_admin_or_support)],
) -> CompanyResponse:
    try:
        company = await create_company_use_case(data, CompanyRepository(session))
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    _current_user: Annotated[User, Depends(_require_own_company_or_staff)],
) -> CompanyResponse:
    try:
        company = await get_company_use_case(company_id, CompanyRepository(session))
    except CompanyNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
        ) from exc
    return CompanyResponse.model_validate(company)


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: UUID,
    data: CompanyUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _current_user: Annotated[User, Depends(_require_admin_or_support)],
) -> CompanyResponse:
    try:
        company = await update_company_use_case(company_id, data, CompanyRepository(session))
        await session.commit()
    except CompanyNotFoundError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
        ) from exc
    except Exception:
        await session.rollback()
        raise
    return CompanyResponse.model_validate(company)
