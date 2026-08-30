from uuid import UUID

from app.application.requests.authorization import can_access_request
from app.application.requests.exceptions import RequestAccessDeniedError, RequestNotFoundError
from app.domain.entities.message import Message
from app.domain.entities.user import User
from app.infrastructure.database.repositories.message_repository import MessageRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository


async def get_request_messages(
    request_id: UUID,
    current_user: User,
    request_repository: RequestRepository,
    message_repository: MessageRepository,
) -> list[Message]:
    """List a request's messages, oldest first.

    Message visibility is entirely derived from request visibility: there is
    no separate authorization concept for messages, reusing the exact same
    can_access_request() policy already used by GET /requests/{id}.
    """
    request = await request_repository.get_by_id(request_id)
    if request is None:
        raise RequestNotFoundError(str(request_id))

    # Checked before any message data is fetched or returned.
    if not can_access_request(current_user, request):
        raise RequestAccessDeniedError(str(request_id))

    return await message_repository.list_by_request(request_id)
