from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.request import Request
from app.domain.enums.request import RequestStatus
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

    # -- State transitions --------------------------------------------------
    #
    # Each of these is a single conditional `UPDATE ... WHERE <expected state>`
    # statement: Postgres locks the matching row before evaluating the WHERE
    # clause, so if two requests race to change the same row, whichever
    # commits its UPDATE first "wins" and the second one's WHERE clause no
    # longer matches (rowcount 0). This closes the classic
    # read-then-write race without any explicit SELECT ... FOR UPDATE or
    # application-level locking.

    async def take_request(self, request_id: UUID, assigned_to: UUID) -> Request | None:
        result = await self._session.execute(
            update(RequestModel)
            .where(RequestModel.id == request_id, RequestModel.status == RequestStatus.PENDING)
            .values(assigned_to=assigned_to, status=RequestStatus.IN_PROGRESS)
        )
        if result.rowcount == 0:
            return None
        return await self._refetch(request_id)

    async def return_request(self, request_id: UUID, *, expected_assigned_to: UUID | None) -> Request | None:
        conditions = [RequestModel.id == request_id, RequestModel.status == RequestStatus.IN_PROGRESS]
        if expected_assigned_to is not None:
            conditions.append(RequestModel.assigned_to == expected_assigned_to)

        result = await self._session.execute(
            update(RequestModel).where(*conditions).values(assigned_to=None, status=RequestStatus.PENDING)
        )
        if result.rowcount == 0:
            return None
        return await self._refetch(request_id)

    async def resolve_request(
        self, request_id: UUID, *, expected_assigned_to: UUID | None, resolved_at: datetime
    ) -> Request | None:
        conditions = [RequestModel.id == request_id, RequestModel.status == RequestStatus.IN_PROGRESS]
        if expected_assigned_to is not None:
            conditions.append(RequestModel.assigned_to == expected_assigned_to)

        result = await self._session.execute(
            update(RequestModel)
            .where(*conditions)
            .values(status=RequestStatus.RESOLVED, resolved_at=resolved_at)
        )
        if result.rowcount == 0:
            return None
        return await self._refetch(request_id)

    async def cancel_request(self, request_id: UUID) -> Request | None:
        result = await self._session.execute(
            update(RequestModel)
            .where(
                RequestModel.id == request_id,
                RequestModel.status.in_([RequestStatus.PENDING, RequestStatus.IN_PROGRESS]),
            )
            .values(status=RequestStatus.CANCELLED)
        )
        if result.rowcount == 0:
            return None
        return await self._refetch(request_id)

    async def _refetch(self, request_id: UUID) -> Request | None:
        # populate_existing forces a fresh read: the row was just changed by
        # a Core-style UPDATE, which does not update any already-loaded ORM
        # object's attributes on its own.
        model = await self._session.get(RequestModel, request_id, populate_existing=True)
        return request_to_domain(model) if model else None
