import uuid
from datetime import datetime, timezone
from uuid import UUID

from app.application.messages.exceptions import RequestClosedError
from app.application.messages.schemas import MessageCreate
from app.application.requests.authorization import can_access_request
from app.application.requests.exceptions import RequestAccessDeniedError, RequestNotFoundError
from app.domain.entities.message import Message
from app.domain.entities.user import User
from app.domain.enums.request import RequestStatus
from app.infrastructure.database.repositories.message_repository import MessageRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository

# The domain doesn't define a rule for this either way, so we apply the
# task's own recommended default: once a request is closed, the
# conversation is done — GET stays open, POST is rejected with 409.
_CLOSED_STATUSES = (RequestStatus.RESOLVED, RequestStatus.CANCELLED)


async def create_message(
    request_id: UUID,
    data: MessageCreate,
    current_user: User,
    request_repository: RequestRepository,
    message_repository: MessageRepository,
) -> Message:
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    # Same access check as GET/cancel on the request itself — reused, not
    # duplicated.
    if not can_access_request(current_user, request):
        raise RequestAccessDeniedError(str(request_id))

    if request.status in _CLOSED_STATUSES:
        raise RequestClosedError(str(request_id))

    # request_id always comes from the path, author_id always from the
    # authenticated user — MessageCreate exposes neither field, so there is
    # no way for the client to override them.
    message = Message(
        id=uuid.uuid4(),
        request_id=request_id,
        author_id=current_user.id,
        content=data.content,
        created_at=datetime.now(timezone.utc),
    )
    return await message_repository.create(message)
