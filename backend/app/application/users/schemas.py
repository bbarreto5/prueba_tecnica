from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.enums.user import UserRole


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole
    company_id: UUID | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    role: UserRole | None = None
    company_id: UUID | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    email: str
    role: UserRole
    company_id: UUID | None
