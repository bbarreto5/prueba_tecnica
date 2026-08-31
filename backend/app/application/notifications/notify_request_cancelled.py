from app.application.notifications._shared import notification_task
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import request_cancelled


@notification_task
async def notify_request_cancelled(
    request: Request,
    actor: User,
    user_repository: UserRepository,
    email_service: EmailService,
) -> None:
    """Only a USER/COMPANY-initiated cancellation notifies the assigned
    SUPPORT — a SUPPORT/ADMIN cancelling their own queue item has no one new
    to tell. No assignee -> no email."""
    if actor.role not in (UserRole.USER, UserRole.COMPANY) or request.assigned_to is None:
        return

    support = await user_repository.get_by_id(request.assigned_to)
    if support is None:
        return

    await email_service.send(
        support.email,
        request_cancelled(recipient_name=support.name, request=request),
    )
