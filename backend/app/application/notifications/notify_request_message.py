from app.application.notifications._shared import notification_task
from app.domain.entities.message import Message
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import request_message


@notification_task
async def notify_request_message(
    request: Request,
    message: Message,
    author: User,
    user_repository: UserRepository,
    email_service: EmailService,
) -> None:
    """USER/COMPANY -> notify the assigned SUPPORT, if any.
    SUPPORT -> notify the request's creator.
    ADMIN -> no one: notifications are for the USER <-> SUPPORT exchange, and
    an ADMIN posting doesn't map to either side of it.
    """
    recipient: User | None = None

    if author.role in (UserRole.USER, UserRole.COMPANY):
        if request.assigned_to is not None:
            recipient = await user_repository.get_by_id(request.assigned_to)
    elif author.role in (UserRole.SUPPORT, UserRole.ADMIN):
        recipient = await user_repository.get_by_id(request.created_by)
    
    if recipient is None or recipient.id == author.id:
        return
    
    await email_service.send(
        recipient.email,
        request_message(recipient_name=recipient.name, request=request, message=message, author_name=author.name),
    )
