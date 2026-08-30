class UserNotFoundError(Exception):
    """Raised when a user id doesn't match any existing user."""


class UserAccessDeniedError(Exception):
    """Raised when the current user isn't allowed to view/modify the target user."""


class RoleNotAllowedError(Exception):
    """Raised when the current user isn't allowed to create/assign the given role."""


class CompanyAssignmentError(Exception):
    """Raised when a COMPANY user tries to assign a company_id other than their own."""


class InvalidCompanyAssignmentError(Exception):
    """Raised when company_id is missing for a role that requires one, present for a
    role that must not have one, or doesn't reference an existing company."""


class EmailAlreadyExistsError(Exception):
    """Raised when the email is already used by another user."""
