from uuid import UUID

from pydantic import BaseModel

from app.domain.enums.user import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    role: UserRole
