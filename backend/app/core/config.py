
import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration loaded from environment variables."""

    app_name: str = os.getenv(
        "APP_NAME",
        "Incident & Request Management API",
    )

    environment: str = os.getenv(
        "ENVIRONMENT",
        "development",
    )

    database_url: str = os.getenv("DATABASE_URL", "")

    if not database_url:
        raise ValueError("DATABASE_URL environment variable is required")

    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    if not jwt_secret_key:
        raise ValueError("JWT_SECRET_KEY environment variable is required")


settings = Settings()
