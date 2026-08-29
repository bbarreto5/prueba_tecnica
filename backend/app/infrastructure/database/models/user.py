import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.domain.enums.user import UserRole

if TYPE_CHECKING:
    from app.infrastructure.database.models.company import CompanyModel
    from app.infrastructure.database.models.message import MessageModel
    from app.infrastructure.database.models.request import RequestModel


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, name="user_role"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    company: Mapped["CompanyModel | None"] = relationship(back_populates="users")
    created_requests: Mapped[list["RequestModel"]] = relationship(
        back_populates="creator", foreign_keys="RequestModel.created_by"
    )
    assigned_requests: Mapped[list["RequestModel"]] = relationship(
        back_populates="assignee", foreign_keys="RequestModel.assigned_to"
    )
    messages: Mapped[list["MessageModel"]] = relationship(back_populates="author")
