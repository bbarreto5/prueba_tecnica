from app.domain.entities.company import Company
from app.domain.entities.message import Message
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.infrastructure.database.models.company import CompanyModel
from app.infrastructure.database.models.message import MessageModel
from app.infrastructure.database.models.request import RequestModel
from app.infrastructure.database.models.user import UserModel


def company_to_domain(model: CompanyModel) -> Company:
    return Company(
        id=model.id,
        name=model.name,
        is_active=model.is_active,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def company_to_model(entity: Company) -> CompanyModel:
    return CompanyModel(
        id=entity.id,
        name=entity.name,
        is_active=entity.is_active,
    )


def user_to_domain(model: UserModel) -> User:
    return User(
        id=model.id,
        company_id=model.company_id,
        name=model.name,
        email=model.email,
        password_hash=model.password_hash,
        role=model.role,
        is_active=model.is_active,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def user_to_model(entity: User) -> UserModel:
    return UserModel(
        id=entity.id,
        company_id=entity.company_id,
        name=entity.name,
        email=entity.email,
        password_hash=entity.password_hash,
        role=entity.role,
        is_active=entity.is_active,
    )


def request_to_domain(model: RequestModel) -> Request:
    return Request(
        id=model.id,
        company_id=model.company_id,
        created_by=model.created_by,
        assigned_to=model.assigned_to,
        title=model.title,
        description=model.description,
        type=model.type,
        priority=model.priority,
        status=model.status,
        created_at=model.created_at,
        updated_at=model.updated_at,
        resolved_at=model.resolved_at,
    )


def request_to_model(entity: Request) -> RequestModel:
    return RequestModel(
        id=entity.id,
        company_id=entity.company_id,
        created_by=entity.created_by,
        assigned_to=entity.assigned_to,
        title=entity.title,
        description=entity.description,
        type=entity.type,
        priority=entity.priority,
        status=entity.status,
        resolved_at=entity.resolved_at,
    )


def message_to_domain(model: MessageModel) -> Message:
    return Message(
        id=model.id,
        request_id=model.request_id,
        author_id=model.author_id,
        content=model.content,
        created_at=model.created_at,
    )


def message_to_model(entity: Message) -> MessageModel:
    return MessageModel(
        id=entity.id,
        request_id=entity.request_id,
        author_id=entity.author_id,
        content=entity.content,
    )
