from uuid import UUID

from app.application.requests.exceptions import (
    InvalidStateTransitionError,
    RequestAccessDeniedError,
    RequestNotFoundError,
)
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def return_request(
    request_id: UUID, current_user: User, request_repository: RequestRepository
) -> Request:
    """Release `request_id` back to PENDING with no assignee.

    Role gating (SUPPORT/ADMIN only) happens at the router. Here: a SUPPORT
    may only return a request currently assigned to themself; ADMIN may
    return any in-progress request (administrative override).
    """
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    if current_user.role == UserRole.SUPPORT and request.assigned_to != current_user.id:
        raise RequestAccessDeniedError(str(request_id))

    expected_assigned_to = None if current_user.role == UserRole.ADMIN else current_user.id
    updated = await request_repository.return_request(request_id, expected_assigned_to=expected_assigned_to)
    if updated is None:
        raise InvalidStateTransitionError("Request is not in a state that can be returned")
    return updated
