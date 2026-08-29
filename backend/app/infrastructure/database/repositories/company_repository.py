from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.company import Company
from app.infrastructure.database.mappers import company_to_domain, company_to_model
from app.infrastructure.database.models.company import CompanyModel


class CompanyRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, company: Company) -> Company:
        model = company_to_model(company)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return company_to_domain(model)

    async def get_by_id(self, company_id: UUID) -> Company | None:
        model = await self._session.get(CompanyModel, company_id)
        return company_to_domain(model) if model else None

    async def list(self) -> list[Company]:
        result = await self._session.execute(select(CompanyModel).order_by(CompanyModel.created_at))
        return [company_to_domain(model) for model in result.scalars().all()]

    async def update(self, company: Company) -> Company | None:
        model = await self._session.get(CompanyModel, company.id)
        if model is None:
            return None
        model.name = company.name
        model.is_active = company.is_active
        await self._session.flush()
        await self._session.refresh(model)
        return company_to_domain(model)

    async def delete(self, company_id: UUID) -> None:
        model = await self._session.get(CompanyModel, company_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()
