class RequestNotFoundError(Exception):
    """Raised when a request id doesn't match any existing request."""


class RequestAccessDeniedError(Exception):
    """Raised when the current user isn't allowed to view or act on the target request."""


class CompanyAssignmentError(Exception):
    """Raised when a COMPANY/USER tries to create a request for a company other than their own."""


class InvalidCompanyAssignmentError(Exception):
    """Raised when company_id is missing or doesn't reference an existing company."""


class InvalidStateTransitionError(Exception):
    """Raised when the request isn't in a state that allows the requested transition —
    including the case where a concurrent take/return/resolve/cancel won the race."""
