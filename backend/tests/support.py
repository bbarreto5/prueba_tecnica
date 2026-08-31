"""Shared test doubles that must be singletons across the whole test run.

`app.dependency_overrides` lives on the single, process-wide FastAPI `app`
instance: if every test module registered its own EmailService fake, only
the last-imported module's override would actually be wired into `app` for
the rest of the suite, silently orphaning the others. Importing the same
`email_service` object here from every test module (Python caches the
module on first import) avoids that.
"""

from app.infrastructure.email.service import get_email_service
from app.main import app


class RecordingEmailService:
    """Records (to_email, subject) instead of actually sending, so tests can
    assert on notification recipients without a real SMTP server."""

    def __init__(self) -> None:
        self.sent: list[tuple[str, str]] = []

    @property
    def is_enabled(self) -> bool:
        return True

    async def send(self, to_email: str, content) -> None:
        self.sent.append((to_email, content.subject))


email_service = RecordingEmailService()
app.dependency_overrides[get_email_service] = lambda: email_service
