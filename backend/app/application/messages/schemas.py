from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class MessageCreate(BaseModel):
    content: str

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("content must not be empty or whitespace-only")
        return value


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    request_id: UUID
    author_id: UUID
    content: str
    created_at: datetime
