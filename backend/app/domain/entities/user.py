from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.domain.enums.user import UserRole


@dataclass
class User:
    id: UUID
    company_id: UUID | None
    name: str
    email: str
    password_hash: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
