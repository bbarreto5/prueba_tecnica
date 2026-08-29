from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Company:
    id: UUID
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
