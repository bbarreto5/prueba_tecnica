from app.application.auth.schemas import LoginRequest, LoginResponse
from app.core.security import create_access_token, verify_password
from app.infrastructure.database.repositories.user_repository import UserRepository


class InvalidCredentialsError(Exception):
    """Raised when the email/password pair doesn't match an active user."""


async def login(request: LoginRequest, user_repository: UserRepository) -> LoginResponse:
    user = await user_repository.get_by_email(request.email)

    if user is None or not user.is_active or not verify_password(request.password, user.password_hash):
        raise InvalidCredentialsError("Incorrect email or password")

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role.value,
            "company_id": str(user.company_id) if user.company_id else None,
        }
    )
    return LoginResponse(access_token=access_token, token_type="bearer")
