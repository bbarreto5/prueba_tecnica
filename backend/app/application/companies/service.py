import uuid
from datetime import datetime, timezone

from app.application.companies.schemas import CompanyCreate, CompanyUpdate
from app.domain.entities.company import Company
from app.infrastructure.database.repositories.company_repository import CompanyRepository


class CompanyNotFoundError(Exception):
    """Raised when a company id doesn't match any existing company."""


async def list_companies(repository: CompanyRepository) -> list[Company]:
    return await repository.list()


async def get_company(company_id: uuid.UUID, repository: CompanyRepository) -> Company:
    company = await repository.get_by_id(company_id)
    if company is None:
        raise CompanyNotFoundError(str(company_id))
    return company


async def create_company(data: CompanyCreate, repository: CompanyRepository) -> Company:
    now = datetime.now(timezone.utc)
    company = Company(
        id=uuid.uuid4(),
        name=data.name,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    return await repository.create(company)


async def update_company(
    company_id: uuid.UUID, data: CompanyUpdate, repository: CompanyRepository
) -> Company:
    company = await repository.get_by_id(company_id)
    if company is None:
        raise CompanyNotFoundError(str(company_id))

    if data.name is not None:
        company.name = data.name
    if data.is_active is not None:
        company.is_active = data.is_active

    # updated_at is bumped automatically by the model's onupdate=func.now()
    # when the repository flushes this change.
    updated = await repository.update(company)
    if updated is None:
        raise CompanyNotFoundError(str(company_id))
    return updated
