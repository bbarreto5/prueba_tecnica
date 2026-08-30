from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.enums.request import RequestPriority, RequestStatus, RequestType


class RequestCreate(BaseModel):
    title: str
    description: str
    type: RequestType
    priority: RequestPriority
    # Required for ADMIN/SUPPORT (who have no company of their own).
    # Ignored/forced for COMPANY/USER, who can only create requests for
    # their own company — see create_request.py.
    company_id: UUID | None = None


class RequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    company_id: UUID
    created_by: UUID
    assigned_to: UUID | None
    title: str
    description: str
    type: RequestType
    priority: RequestPriority
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
