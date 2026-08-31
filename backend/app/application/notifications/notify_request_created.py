from app.application.notifications._shared import dedupe_users, notification_task
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import request_created


@notification_task
async def notify_request_created(
    request: Request,
    creator: User,
    user_repository: UserRepository,
    email_service: EmailService,
) -> None:
    """Notify the creator and the request's company.

    The Company entity has no email of its own — "notifying the company"
    means every COMPANY-role user of that company, per the current data
    model. Recipients are deduplicated: a COMPANY user creating their own
    request would otherwise match both groups.
    """
    company_users = await user_repository.list(roles=[UserRole.COMPANY], company_id=request.company_id)
    recipients = dedupe_users([creator, *company_users])

    for recipient in recipients:
        await email_service.send(
            recipient.email,
            request_created(recipient_name=recipient.name, request=request),
        )
