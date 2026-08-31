import functools
import logging
from collections.abc import Awaitable, Callable
from typing import TypeVar

from app.domain.entities.user import User

logger = logging.getLogger(__name__)

F = TypeVar("F", bound=Callable[..., Awaitable[None]])


def dedupe_users(users: list[User]) -> list[User]:
    """Keep the first occurrence of each distinct email (case-insensitive),
    so e.g. a COMPANY user creating their own request doesn't get two
    identical "request created" emails."""
    seen: set[str] = set()
    result: list[User] = []
    for user in users:
        key = user.email.strip().lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(user)
    return result


def notification_task(func: F) -> F:
    """Guarantee a notification use case never raises.

    Notifications run after the triggering business operation has already
    committed. A failure while resolving recipients (e.g. a repository
    error) must not surface as a 500 for an operation that already
    succeeded — same principle as the SMTP-failure handling inside
    EmailService.send() itself, just covering the rest of the notification
    path (recipient lookup, template building).
    """

    @functools.wraps(func)
    async def wrapper(*args: object, **kwargs: object) -> None:
        try:
            await func(*args, **kwargs)  # type: ignore[arg-type]
        except Exception:
            logger.error("Notification task failed: %s", func.__name__, exc_info=True)

    return wrapper  # type: ignore[return-value]
