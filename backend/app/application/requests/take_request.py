from uuid import UUID

from app.application.requests.exceptions import InvalidStateTransitionError, RequestNotFoundError
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.request import RequestStatus
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def take_request(
    request_id: UUID, current_user: User, request_repository: RequestRepository
) -> Request:
    """Assign `request_id` to `current_user` and move it to IN_PROGRESS.

    Role gating (SUPPORT/ADMIN only) happens at the router via require_roles;
    this use case only handles the state transition itself.
    """
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    # Re-taking a request you already hold is a harmless no-op, not an error.
    if request.status == RequestStatus.IN_PROGRESS and request.assigned_to == current_user.id:
        return request

    updated = await request_repository.take_request(request_id, current_user.id)
    if updated is None:
        # Either it was never PENDING, or another SUPPORT won the race.
        raise InvalidStateTransitionError("Request is not available to be taken")
    return updated
