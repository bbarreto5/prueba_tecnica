from enum import Enum


class RequestType(str, Enum):
    INCIDENT = "INCIDENT"
    QUESTION = "QUESTION"
    REQUEST = "REQUEST"


class RequestPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class RequestStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"
