from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class Message:
    id: UUID
    request_id: UUID
    author_id: UUID
    content: str
    created_at: datetime
