from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SUPPORT = "SUPPORT"
    COMPANY = "COMPANY"
    USER = "USER"


""" class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE" """
