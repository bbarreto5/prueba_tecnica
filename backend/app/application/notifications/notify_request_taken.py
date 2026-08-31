from app.application.notifications._shared import notification_task
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import request_taken


@notification_task
async def notify_request_taken(
    request: Request,
    support: User,
    user_repository: UserRepository,
    company_repository: CompanyRepository,
    email_service: EmailService,
) -> None:
    """Notify the request's creator that SUPPORT/ADMIN took it, including the
    company name for context."""
    creator = await user_repository.get_by_id(request.created_by)
    if creator is None or creator.id == support.id:
        return

    company = await company_repository.get_by_id(request.company_id)
    await email_service.send(
        creator.email,
        request_taken(
            recipient_name=creator.name,
            request=request,
            company_name=company.name if company is not None else None,
        ),
    )
