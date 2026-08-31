from app.application.notifications._shared import notification_task
from app.domain.entities.user import User
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import password_changed


@notification_task
async def notify_password_changed(user: User, email_service: EmailService) -> None:
    """Notify a user that their own password was changed."""
    await email_service.send(
        user.email,
        password_changed(recipient_name=user.name, changed_at=user.updated_at),
    )
