from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.message import Message
from app.infrastructure.database.mappers import message_to_domain, message_to_model
from app.infrastructure.database.models.message import MessageModel


class MessageRepository:
    """Messages have no `updated_at` in the domain entity, so they are treated
    as immutable once created: this repository intentionally has no update()."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, message: Message) -> Message:
        model = message_to_model(message)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return message_to_domain(model)

    async def get_by_id(self, message_id: UUID) -> Message | None:
        model = await self._session.get(MessageModel, message_id)
        return message_to_domain(model) if model else None

    async def list_by_request(self, request_id: UUID) -> list[Message]:
        result = await self._session.execute(
            select(MessageModel)
            .where(MessageModel.request_id == request_id)
            .order_by(MessageModel.created_at)
        )
        return [message_to_domain(model) for model in result.scalars().all()]

    async def delete(self, message_id: UUID) -> None:
        model = await self._session.get(MessageModel, message_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()
