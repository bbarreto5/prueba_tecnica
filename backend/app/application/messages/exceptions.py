class RequestClosedError(Exception):
    """Raised when trying to add a message to a RESOLVED or CANCELLED request.

    RequestNotFoundError and RequestAccessDeniedError are intentionally not
    redefined here: message access is entirely derived from request access,
    so the use cases import and reuse those from app.application.requests
    directly instead of duplicating a parallel set of exception types.
    """
