from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.auth.login import InvalidCredentialsError
from app.application.auth.login import login as login_use_case
from app.application.auth.schemas import CurrentUserResponse, LoginRequest, LoginResponse
from app.core.database import get_session
from app.domain.entities.user import User
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.presentation.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> LoginResponse:
    try:
        return await login_use_case(credentials, UserRepository(session))
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        ) from exc


@router.get("/me", response_model=CurrentUserResponse)
async def read_current_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> CurrentUserResponse:
    return CurrentUserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
    )
