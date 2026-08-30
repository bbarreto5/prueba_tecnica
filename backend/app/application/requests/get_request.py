from uuid import UUID

from app.application.requests.authorization import can_access_request
from app.application.requests.exceptions import RequestAccessDeniedError, RequestNotFoundError
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def get_request(
    request_id: UUID, current_user: User, request_repository: RequestRepository
) -> Request:
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    # Authorization is checked before the caller can do anything with the
    # fetched record — a 403 here never leaks the request's data.
    if not can_access_request(current_user, request):
        raise RequestAccessDeniedError(str(request_id))

    return request
