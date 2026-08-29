from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.request import Request
from app.infrastructure.database.mappers import request_to_domain, request_to_model
from app.infrastructure.database.models.request import RequestModel


class RequestRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, request: Request) -> Request:
        model = request_to_model(request)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return request_to_domain(model)

    async def get_by_id(self, request_id: UUID) -> Request | None:
        model = await self._session.get(RequestModel, request_id)
        return request_to_domain(model) if model else None

    async def list(self) -> list[Request]:
        result = await self._session.execute(select(RequestModel).order_by(RequestModel.created_at))
        return [request_to_domain(model) for model in result.scalars().all()]

    async def list_by_company(self, company_id: UUID) -> list[Request]:
        result = await self._session.execute(
            select(RequestModel)
            .where(RequestModel.company_id == company_id)
            .order_by(RequestModel.created_at)
        )
        return [request_to_domain(model) for model in result.scalars().all()]

    async def update(self, request: Request) -> Request | None:
        model = await self._session.get(RequestModel, request.id)
        if model is None:
            return None
        model.assigned_to = request.assigned_to
        model.title = request.title
        model.description = request.description
        model.type = request.type
        model.priority = request.priority
        model.status = request.status
        model.resolved_at = request.resolved_at
        await self._session.flush()
        await self._session.refresh(model)
        return request_to_domain(model)

    async def delete(self, request_id: UUID) -> None:
        model = await self._session.get(RequestModel, request_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()
