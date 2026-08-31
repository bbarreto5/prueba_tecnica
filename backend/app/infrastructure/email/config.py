import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class EmailConfig:
    """SMTP configuration loaded from environment variables.

    Every field may be blank: the application must keep working with email
    notifications disabled when SMTP isn't configured (or only partially
    configured) — see EmailService.is_enabled.
    """

    host: str
    port: int
    user: str
    password: str
    from_address: str
    use_tls: bool

    @property
    def is_configured(self) -> bool:
        return bool(self.host and self.port and self.user and self.password and self.from_address)


def load_email_config() -> EmailConfig:
    try:
        port = int(os.getenv("SMTP_PORT", ""))
    except ValueError:
        port = 0

    return EmailConfig(
        host=os.getenv("SMTP_HOST", ""),
        port=port,
        user=os.getenv("SMTP_USER", ""),
        password=os.getenv("SMTP_PASSWORD", ""),
        from_address=os.getenv("SMTP_FROM", ""),
        use_tls=os.getenv("SMTP_SECURE", "true").strip().lower() not in ("false", "0", ""),
    )
