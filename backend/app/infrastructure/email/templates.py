"""Plain-data email templates: (subject, text, html) builders.

Kept free of SMTP/transport concerns (EmailService) and of recipient
selection (app.application.notifications) — a template only knows how to
render the data it's given.
"""

from dataclasses import dataclass
from datetime import datetime

from app.domain.entities.message import Message
from app.domain.entities.request import Request


@dataclass(frozen=True)
class EmailContent:
    subject: str
    text: str
    html: str


def _format_dt(value: datetime) -> str:
    return value.strftime("%Y-%m-%d %H:%M UTC")


def _html(title: str, greeting: str, *blocks: str) -> str:
    body = "".join(f"<p>{block}</p>" for block in blocks)
    return f"<html><body><h2>{title}</h2><p>{greeting}</p>{body}</body></html>"


def request_created(*, recipient_name: str, request: Request) -> EmailContent:
    subject = f"Nueva solicitud #{request.id}"
    greeting = f"Hola {recipient_name},"
    text = (
        f"{greeting}\n\n"
        "Se ha creado una nueva solicitud.\n\n"
        f"Solicitud: #{request.id}\n"
        f"Asunto: {request.title}\n"
        f"Estado: {request.status.value}\n"
        f"Fecha: {_format_dt(request.created_at)}\n\n"
        f"Descripción:\n{request.description}"
    )
    html = _html(
        "Nueva solicitud creada",
        greeting,
        "Se ha creado una nueva solicitud.",
        f"<b>Solicitud:</b> #{request.id}<br>"
        f"<b>Asunto:</b> {request.title}<br>"
        f"<b>Estado:</b> {request.status.value}<br>"
        f"<b>Fecha:</b> {_format_dt(request.created_at)}",
        f"<b>Descripción:</b><br>{request.description}",
    )
    return EmailContent(subject=subject, text=text, html=html)


def request_message(*, recipient_name: str, request: Request, message: Message, author_name: str) -> EmailContent:
    subject = f"Nuevo mensaje en solicitud #{request.id}"
    greeting = f"Hola {recipient_name},"
    text = (
        f"{greeting}\n\n"
        f"{author_name} escribió un nuevo mensaje en la solicitud #{request.id} ({request.title}).\n\n"
        f"Mensaje:\n{message.content}\n\n"
        f"Estado actual: {request.status.value}"
    )
    html = _html(
        "Nuevo mensaje",
        greeting,
        f"<b>{author_name}</b> escribió un nuevo mensaje en la solicitud "
        f"#{request.id} ({request.title}).",
        f"<b>Mensaje:</b><br>{message.content}",
        f"<b>Estado actual:</b> {request.status.value}",
    )
    return EmailContent(subject=subject, text=text, html=html)


def request_cancelled(*, recipient_name: str, request: Request) -> EmailContent:
    subject = f"Solicitud #{request.id} cancelada"
    greeting = f"Hola {recipient_name},"
    text = (
        f"{greeting}\n\n"
        "Solicitud cancelada.\n\n"
        f"Solicitud: #{request.id}\n"
        f"Asunto: {request.title}\n"
        f"Estado final: {request.status.value}\n"
        f"Fecha: {_format_dt(request.updated_at)}"
    )
    html = _html(
        "Solicitud cancelada",
        greeting,
        f"<b>Solicitud:</b> #{request.id}<br>"
        f"<b>Asunto:</b> {request.title}<br>"
        f"<b>Estado final:</b> {request.status.value}<br>"
        f"<b>Fecha:</b> {_format_dt(request.updated_at)}",
    )
    return EmailContent(subject=subject, text=text, html=html)


def request_taken(*, recipient_name: str, request: Request, company_name: str | None) -> EmailContent:
    subject = f"Solicitud #{request.id} asignada a soporte"
    greeting = f"Hola {recipient_name},"
    company_line = f"Empresa: {company_name}\n" if company_name else ""
    company_html = f"<b>Empresa:</b> {company_name}<br>" if company_name else ""
    text = (
        f"{greeting}\n\n"
        "Tu solicitud fue tomada por soporte.\n\n"
        f"Solicitud: #{request.id}\n"
        f"Asunto: {request.title}\n"
        f"{company_line}"
        f"Estado: {request.status.value}\n"
        f"Fecha: {_format_dt(request.updated_at)}"
    )
    html = _html(
        "Solicitud asignada a soporte",
        greeting,
        f"<b>Solicitud:</b> #{request.id}<br>"
        f"<b>Asunto:</b> {request.title}<br>"
        f"{company_html}"
        f"<b>Estado:</b> {request.status.value}<br>"
        f"<b>Fecha:</b> {_format_dt(request.updated_at)}",
    )
    return EmailContent(subject=subject, text=text, html=html)


def request_returned(*, recipient_name: str, request: Request) -> EmailContent:
    subject = f"Solicitud #{request.id} devuelta a la cola"
    greeting = f"Hola {recipient_name},"
    text = (
        f"{greeting}\n\n"
        "Tu solicitud volvió a la cola de soporte.\n\n"
        f"Solicitud: #{request.id}\n"
        f"Asunto: {request.title}\n"
        f"Estado: {request.status.value}\n"
        f"Fecha: {_format_dt(request.updated_at)}"
    )
    html = _html(
        "La solicitud volvió a la cola",
        greeting,
        f"<b>Solicitud:</b> #{request.id}<br>"
        f"<b>Asunto:</b> {request.title}<br>"
        f"<b>Estado:</b> {request.status.value}<br>"
        f"<b>Fecha:</b> {_format_dt(request.updated_at)}",
    )
    return EmailContent(subject=subject, text=text, html=html)


def request_resolved(*, recipient_name: str, request: Request) -> EmailContent:
    subject = f"Solicitud #{request.id} resuelta"
    greeting = f"Hola {recipient_name},"
    text = (
        f"{greeting}\n\n"
        "Tu solicitud fue resuelta.\n\n"
        f"Solicitud: #{request.id}\n"
        f"Asunto: {request.title}\n"
        f"Estado final: {request.status.value}\n"
        f"Fecha: {_format_dt(request.resolved_at) if request.resolved_at else _format_dt(request.updated_at)}"
    )
    html = _html(
        "Solicitud resuelta",
        greeting,
        f"<b>Solicitud:</b> #{request.id}<br>"
        f"<b>Asunto:</b> {request.title}<br>"
        f"<b>Estado final:</b> {request.status.value}<br>"
        f"<b>Fecha:</b> "
        f"{_format_dt(request.resolved_at) if request.resolved_at else _format_dt(request.updated_at)}",
    )
    return EmailContent(subject=subject, text=text, html=html)


def password_changed(*, recipient_name: str, changed_at: datetime) -> EmailContent:
    subject = "Contraseña actualizada"
    greeting = f"Hola {recipient_name},"
    text = (
        f"{greeting}\n\n"
        "Tu contraseña fue cambiada correctamente.\n\n"
        "Si no realizaste este cambio, contacta inmediatamente al administrador.\n\n"
        f"Fecha: {_format_dt(changed_at)}"
    )
    html = _html(
        "Tu contraseña fue actualizada",
        greeting,
        "Tu contraseña fue cambiada correctamente.",
        "Si no realizaste este cambio, contacta inmediatamente al administrador.",
        f"<b>Fecha:</b> {_format_dt(changed_at)}",
    )
    return EmailContent(subject=subject, text=text, html=html)
