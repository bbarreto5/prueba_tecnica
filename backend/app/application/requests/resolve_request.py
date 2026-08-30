from datetime import datetime, timezone
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


async def resolve_request(
    request_id: UUID, current_user: User, request_repository: RequestRepository
) -> Request:
    """Mark `request_id` as RESOLVED.

    Role gating (SUPPORT/ADMIN only) happens at the router. Here: a SUPPORT
    may only resolve a request currently assigned to themself; ADMIN may
    resolve any in-progress request (administrative override).
    """
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    if current_user.role == UserRole.SUPPORT and request.assigned_to != current_user.id:
        raise RequestAccessDeniedError(str(request_id))

    expected_assigned_to = None if current_user.role == UserRole.ADMIN else current_user.id
    updated = await request_repository.resolve_request(
        request_id,
        expected_assigned_to=expected_assigned_to,
        resolved_at=datetime.now(timezone.utc),
    )
    if updated is None:
        raise InvalidStateTransitionError("Request is not in a state that can be resolved")
    return updated
