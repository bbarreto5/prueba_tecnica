from uuid import UUID

from app.application.requests.authorization import can_access_request
from app.application.requests.exceptions import (
    InvalidStateTransitionError,
    RequestAccessDeniedError,
    RequestNotFoundError,
)
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def cancel_request(
    request_id: UUID, current_user: User, request_repository: RequestRepository
) -> Request:
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    # Same visibility scope as GET: ADMIN/SUPPORT any request, COMPANY/USER
    # only their own company's — cancelling something you can't even see
    # isn't allowed either.
    if not can_access_request(current_user, request):
        raise RequestAccessDeniedError(str(request_id))

    updated = await request_repository.cancel_request(request_id)
    if updated is None:
        raise InvalidStateTransitionError(
            "Request cannot be cancelled from its current state (already RESOLVED or CANCELLED)"
        )
    return updated
