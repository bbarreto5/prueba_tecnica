from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.domain.enums.request import RequestPriority, RequestStatus, RequestType


@dataclass
class Request:
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
