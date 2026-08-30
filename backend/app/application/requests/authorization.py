"""Shared authorization policy for the requests module.

Kept separate because `get_request` and `cancel_request` need the exact
same "can current_user reach this request" check.
"""

from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.user import UserRole


def can_access_request(current_user: User, request: Request) -> bool:
    """Whether `current_user` may view or cancel `request`.

    ADMIN and SUPPORT can reach any request. SUPPORT has no per-company
    scoping relationship in the current data model (SUPPORT users always
    have company_id=None), so it is treated as a global support role — see
    get_requests.py for the same documented decision applied to listing.
    COMPANY and USER are limited to requests belonging to their own company.
    """
    if current_user.role in (UserRole.ADMIN, UserRole.SUPPORT):
        return True
    return request.company_id == current_user.company_id
