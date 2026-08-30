from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.mappers import user_to_domain, user_to_model
from app.infrastructure.database.models.user import UserModel


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, user: User) -> User:
        model = user_to_model(user)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return user_to_domain(model)

    async def get_by_id(self, user_id: UUID) -> User | None:
        model = await self._session.get(UserModel, user_id)
        return user_to_domain(model) if model else None

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(select(UserModel).where(UserModel.email == email))
        model = result.scalar_one_or_none()
        return user_to_domain(model) if model else None

    async def list(
        self,
        roles: list[UserRole] | None = None,
        company_id: UUID | None = None,
    ) -> list[User]:
        query = select(UserModel).order_by(UserModel.created_at)
        if roles:
            query = query.where(UserModel.role.in_(roles))
        if company_id is not None:
            query = query.where(UserModel.company_id == company_id)

        result = await self._session.execute(query)
        return [user_to_domain(model) for model in result.scalars().all()]

    async def update(self, user: User) -> User | None:
        model = await self._session.get(UserModel, user.id)
        if model is None:
            return None
        model.company_id = user.company_id
        model.name = user.name
        model.email = user.email
        model.password_hash = user.password_hash
        model.role = user.role
        model.is_active = user.is_active
        await self._session.flush()
        await self._session.refresh(model)
        return user_to_domain(model)

    async def delete(self, user_id: UUID) -> None:
        model = await self._session.get(UserModel, user_id)
        if model is not None:
            await self._session.delete(model)
            await self._session.flush()
