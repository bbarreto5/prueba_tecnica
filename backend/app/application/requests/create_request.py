import uuid
from datetime import datetime, timezone

from app.application.requests.exceptions import CompanyAssignmentError, InvalidCompanyAssignmentError
from app.application.requests.schemas import RequestCreate
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.request import RequestStatus
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def create_request(
    data: RequestCreate,
    current_user: User,
    request_repository: RequestRepository,
    company_repository: CompanyRepository,
) -> Request:
    if current_user.role in (UserRole.COMPANY, UserRole.USER):
        # The client cannot pick a company other than the authenticated
        # user's own — never trust a client-supplied company_id here.
        if data.company_id is not None and data.company_id != current_user.company_id:
            raise CompanyAssignmentError("Cannot create a request for a different company")
        company_id = current_user.company_id
    else:
        # ADMIN/SUPPORT have no company of their own; they must specify one.
        company_id = data.company_id

    if company_id is None or await company_repository.get_by_id(company_id) is None:
        raise InvalidCompanyAssignmentError("company_id must reference an existing company")

    now = datetime.now(timezone.utc)
    request = Request(
        id=uuid.uuid4(),
        company_id=company_id,
        created_by=current_user.id,
        assigned_to=None,
        title=data.title,
        description=data.description,
        type=data.type,
        priority=data.priority,
        status=RequestStatus.PENDING,
        created_at=now,
        updated_at=now,
        resolved_at=None,
    )
    return await request_repository.create(request)
