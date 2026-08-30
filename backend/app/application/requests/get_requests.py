from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def get_requests(current_user: User, request_repository: RequestRepository) -> list[Request]:
    """List the requests `current_user` is allowed to see.

    ADMIN sees every request. SUPPORT also sees every request: the current
    data model has no relationship that scopes a SUPPORT user to specific
    companies (SUPPORT users always have company_id=None), so per the task's
    own fallback instruction, SUPPORT is treated as a global support role —
    this is a documented decision, not an oversight. COMPANY and USER only
    ever see requests belonging to their own company.
    """
    if current_user.role in (UserRole.ADMIN, UserRole.SUPPORT):
        return await request_repository.list()
    return await request_repository.list_by_company(current_user.company_id)
