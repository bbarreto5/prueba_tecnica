
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


settings = Settings()
