from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.notifications.notify_request_cancelled import (
    notify_request_cancelled,
)
from app.application.notifications.notify_request_created import notify_request_created
from app.application.notifications.notify_request_resolved import notify_request_resolved
from app.application.notifications.notify_request_returned import notify_request_returned
from app.application.notifications.notify_request_taken import notify_request_taken
from app.application.requests.cancel_request import cancel_request as cancel_request_use_case
from app.application.requests.create_request import create_request as create_request_use_case
from app.application.requests.exceptions import (
    CompanyAssignmentError,
    InvalidCompanyAssignmentError,
    InvalidStateTransitionError,
    RequestAccessDeniedError,
    RequestNotFoundError,
)
from app.application.requests.get_request import get_request as get_request_use_case
from app.application.requests.get_requests import get_requests as get_requests_use_case
from app.application.requests.resolve_request import resolve_request as resolve_request_use_case
from app.application.requests.return_request import return_request as return_request_use_case
from app.application.requests.schemas import RequestCreate, RequestResponse
from app.application.requests.take_request import take_request as take_request_use_case
from app.core.database import get_session
from app.domain.entities.user import User
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository
from app.infrastructure.database.repositories.user_repository import UserRepository
from app.infrastructure.email.service import EmailService, get_email_service
from app.presentation.api.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/requests", tags=["requests"])

# take/return/resolve are staff-only operations; ADMIN is included for full
# administrative capability, mirroring the same ADMIN-can-manage-everything
# precedent already used in the users/companies modules.
_require_support_staff = require_roles(UserRole.ADMIN, UserRole.SUPPORT)


def _forbidden() -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


def _not_found() -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")


def _invalid_company() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail="company_id must reference an existing company",
    )


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


@router.post(
    "",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a request",
    description=(
        "Creates a request in the PENDING state. COMPANY/USER requests are always scoped "
        "to the authenticated user's own company; ADMIN/SUPPORT must supply an existing "
        "company_id, since they don't belong to one themselves."
    ),
)
async def create_request(
    data: RequestCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> RequestResponse:
    try:
        request = await create_request_use_case(
            data, current_user, RequestRepository(session), CompanyRepository(session)
        )
        await session.commit()
    except CompanyAssignmentError as exc:
        await session.rollback()
        raise _forbidden() from exc
    except InvalidCompanyAssignmentError as exc:
        await session.rollback()
        raise _invalid_company() from exc
    except Exception:
        await session.rollback()
        raise
    await notify_request_created(request, current_user, UserRepository(session), email_service)
    return RequestResponse.model_validate(request)


@router.get(
    "",
    response_model=list[RequestResponse],
    summary="List requests",
    description=(
        "Returns the requests visible to the authenticated user: ADMIN/SUPPORT see every "
        "request, COMPANY/USER see only their own company's requests."
    ),
)
async def list_requests(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[RequestResponse]:
    requests = await get_requests_use_case(current_user, RequestRepository(session))
    return [RequestResponse.model_validate(request) for request in requests]


@router.get(
    "/{request_id}",
    response_model=RequestResponse,
    summary="Get a request",
    description="Returns a single request, provided the authenticated user is allowed to see it.",
)
async def get_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> RequestResponse:
    try:
        request = await get_request_use_case(request_id, current_user, RequestRepository(session))
    except RequestNotFoundError as exc:
        raise _not_found() from exc
    except RequestAccessDeniedError as exc:
        raise _forbidden() from exc
    return RequestResponse.model_validate(request)


@router.patch(
    "/{request_id}/cancel",
    response_model=RequestResponse,
    summary="Cancel a request",
    description="Cancels a PENDING or IN_PROGRESS request. Returns 409 if it's already RESOLVED or CANCELLED.",
)
async def cancel_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(get_current_user)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> RequestResponse:
    try:
        request = await cancel_request_use_case(request_id, current_user, RequestRepository(session))
        await session.commit()
    except RequestNotFoundError as exc:
        await session.rollback()
        raise _not_found() from exc
    except RequestAccessDeniedError as exc:
        await session.rollback()
        raise _forbidden() from exc
    except InvalidStateTransitionError as exc:
        await session.rollback()
        raise _conflict(str(exc)) from exc
    except Exception:
        await session.rollback()
        raise
    await notify_request_cancelled(request, current_user, UserRepository(session), email_service)
    return RequestResponse.model_validate(request)


@router.post(
    "/{request_id}/take",
    response_model=RequestResponse,
    summary="Take a request",
    description=(
        "SUPPORT (or ADMIN) claims a PENDING request: assigns it to themself and moves it to "
        "IN_PROGRESS. Returns 409 if it's no longer PENDING (already taken, resolved, or cancelled)."
    ),
)
async def take_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_support_staff)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> RequestResponse:
    try:
        request = await take_request_use_case(request_id, current_user, RequestRepository(session))
        await session.commit()
    except RequestNotFoundError as exc:
        await session.rollback()
        raise _not_found() from exc
    except InvalidStateTransitionError as exc:
        await session.rollback()
        raise _conflict(str(exc)) from exc
    except Exception:
        await session.rollback()
        raise
    await notify_request_taken(
        request, current_user, UserRepository(session), CompanyRepository(session), email_service
    )
    return RequestResponse.model_validate(request)


@router.post(
    "/{request_id}/return",
    response_model=RequestResponse,
    summary="Return a request",
    description=(
        "SUPPORT releases a request they hold back to PENDING with no assignee. ADMIN may "
        "return any IN_PROGRESS request. Returns 403 if the SUPPORT user isn't the current "
        "assignee, 409 if the request isn't IN_PROGRESS."
    ),
)
async def return_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_support_staff)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> RequestResponse:
    try:
        request = await return_request_use_case(request_id, current_user, RequestRepository(session))
        await session.commit()
    except RequestNotFoundError as exc:
        await session.rollback()
        raise _not_found() from exc
    except RequestAccessDeniedError as exc:
        await session.rollback()
        raise _forbidden() from exc
    except InvalidStateTransitionError as exc:
        await session.rollback()
        raise _conflict(str(exc)) from exc
    except Exception:
        await session.rollback()
        raise
    await notify_request_returned(request, current_user, UserRepository(session), email_service)
    return RequestResponse.model_validate(request)


@router.post(
    "/{request_id}/resolve",
    response_model=RequestResponse,
    summary="Resolve a request",
    description=(
        "SUPPORT marks a request they hold as RESOLVED. ADMIN may resolve any IN_PROGRESS "
        "request. Returns 403 if the SUPPORT user isn't the current assignee, 409 if the "
        "request isn't IN_PROGRESS."
    ),
)
async def resolve_request(
    request_id: UUID,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(_require_support_staff)],
    email_service: Annotated[EmailService, Depends(get_email_service)],
) -> RequestResponse:
    try:
        request = await resolve_request_use_case(request_id, current_user, RequestRepository(session))
        await session.commit()
    except RequestNotFoundError as exc:
        await session.rollback()
        raise _not_found() from exc
    except RequestAccessDeniedError as exc:
        await session.rollback()
        raise _forbidden() from exc
    except InvalidStateTransitionError as exc:
        await session.rollback()
        raise _conflict(str(exc)) from exc
    except Exception:
        await session.rollback()
        raise
    await notify_request_resolved(request, current_user, UserRepository(session), email_service)
    return RequestResponse.model_validate(request)
