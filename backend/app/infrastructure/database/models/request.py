import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.domain.enums.request import RequestPriority, RequestStatus, RequestType

if TYPE_CHECKING:
    from app.infrastructure.database.models.company import CompanyModel
    from app.infrastructure.database.models.message import MessageModel
    from app.infrastructure.database.models.user import UserModel


class RequestModel(Base):
    __tablename__ = "requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[RequestType] = mapped_column(SAEnum(RequestType, name="request_type"), nullable=False)
    priority: Mapped[RequestPriority] = mapped_column(
        SAEnum(RequestPriority, name="request_priority"), nullable=False
    )
    status: Mapped[RequestStatus] = mapped_column(
        SAEnum(RequestStatus, name="request_status"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    company: Mapped["CompanyModel"] = relationship(back_populates="requests")
    creator: Mapped["UserModel"] = relationship(
        back_populates="created_requests", foreign_keys=[created_by]
    )
    assignee: Mapped["UserModel | None"] = relationship(
        back_populates="assigned_requests", foreign_keys=[assigned_to]
    )
    messages: Mapped[list["MessageModel"]] = relationship(
        back_populates="request", cascade="all, delete-orphan"
    )
