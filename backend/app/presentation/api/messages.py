from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.messages.create_message import create_message as create_message_use_case
from app.application.messages.exceptions import RequestClosedError
from app.application.messages.get_request_messages import (
    get_request_messages as get_request_messages_use_case,
)
from app.application.messages.schemas import MessageCreate, MessageResponse
from app.application.requests.exceptions import RequestAccessDeniedError, RequestNotFoundError
from app.core.database import get_session
from app.domain.entities.user import User
from app.infrastructure.database.repositories.message_repository import MessageRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository
from app.presentation.api.dependencies import get_current_user

router = APIRouter(prefix="/requests/{request_id}/messages", tags=["messages"])


def _forbidden() -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")


def _closed_conflict() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Cannot add messages to a resolved or cancelled request",
    )


@router.get(
    "",
    response_model=list[MessageResponse],
    summary="List a request's messages",
    description=(
        "Returns a request's messages, oldest first. Visibility is derived entirely from "
        "access to the request itself: ADMIN/SUPPORT can reach any request, COMPANY/USER "
        "only their own company's."
    ),
)
async def list_request_messages(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[MessageResponse]:
    try:
        messages = await get_request_messages_use_case(
            request_id, current_user, RequestRepository(session), MessageRepository(session)
        )
    except RequestNotFoundError as exc:
        raise _not_found() from exc
    except RequestAccessDeniedError as exc:
        raise _forbidden() from exc
    return [MessageResponse.model_validate(message) for message in messages]


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a message to a request",
    description=(
        "Creates a message authored by the current user on the given request (request_id "
        "from the path, author from the JWT — never from the body). Returns 409 if the "
        "request is already RESOLVED or CANCELLED."
    ),
)
async def create_request_message(
    request_id: UUID,
    data: MessageCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> MessageResponse:
    try:
        message = await create_message_use_case(
            request_id, data, current_user, RequestRepository(session), MessageRepository(session)
        )
        await session.commit()
    except RequestNotFoundError as exc:
        await session.rollback()
        raise _not_found() from exc
    except RequestAccessDeniedError as exc:
        await session.rollback()
        raise _forbidden() from exc
    except RequestClosedError as exc:
        await session.rollback()
        raise _closed_conflict() from exc
    except Exception:
        await session.rollback()
        raise
    return MessageResponse.model_validate(message)
