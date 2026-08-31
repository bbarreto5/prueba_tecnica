import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.infrastructure.email.config import EmailConfig, load_email_config
from app.infrastructure.email.templates import EmailContent

logger = logging.getLogger(__name__)


class EmailService:
    """Centralized email sending: checks configuration, builds the MIME
    message and sends it over SMTP. Never raises — a failure here must
    never break the business operation that already succeeded (see the
    call sites in app.application.notifications)."""

    def __init__(self, config: EmailConfig | None = None) -> None:
        self._config = config or load_email_config()

    @property
    def is_enabled(self) -> bool:
        return self._config.is_configured

    async def send(self, to_email: str, content: EmailContent) -> None:
        if not self.is_enabled:
            return

        try:
            await asyncio.to_thread(self._send_sync, to_email, content)
        except Exception:
            # SMTP_PASSWORD/credentials are never part of `content` or of this
            # log line — only the recipient and subject are.
            logger.error(
                "Email notification failed: recipient=%s subject=%r",
                to_email,
                content.subject,
                exc_info=True,
            )

    def _send_sync(self, to_email: str, content: EmailContent) -> None:
        message = MIMEMultipart("alternative")
        message["Subject"] = content.subject
        message["From"] = self._config.from_address
        message["To"] = to_email
        message.attach(MIMEText(content.text, "plain"))
        message.attach(MIMEText(content.html, "html"))

        if self._config.use_tls:
            with smtplib.SMTP(
                self._config.host,
                self._config.port,
                timeout=10,
            ) as smtp:
                smtp.starttls()
                smtp.login(
                    self._config.user,
                    self._config.password,
                )
                smtp.sendmail(
                    self._config.from_address,
                    [to_email],
                    message.as_string(),
                )
        else:
            with smtplib.SMTP_SSL(
                self._config.host,
                self._config.port,
                timeout=10,
            ) as smtp:
                smtp.login(
                    self._config.user,
                    self._config.password,
                )
                smtp.sendmail(
                    self._config.from_address,
                    [to_email],
                    message.as_string(),
                )


def get_email_service() -> EmailService:
    return EmailService()
