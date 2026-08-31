from app.application.notifications._shared import notification_task
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import request_returned


@notification_task
async def notify_request_returned(
    request: Request,
    actor: User,
    user_repository: UserRepository,
    email_service: EmailService,
) -> None:
    """Notify the request's creator that it was returned to the queue."""
    creator = await user_repository.get_by_id(request.created_by)
    if creator is None or creator.id == actor.id:
        return

    await email_service.send(
        creator.email,
        request_returned(recipient_name=creator.name, request=request),
    )
