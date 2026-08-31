"""Unit tests for EmailService. No real network access: smtplib.SMTP is
monkeypatched with a small in-memory fake (see conftest docstring elsewhere
in the repo: no pytest-asyncio dependency, tests just run their coroutine
through asyncio.run)."""

import asyncio
import logging

from app.infrastructure.email.config import EmailConfig, load_email_config
from app.infrastructure.email.service import EmailService
from app.infrastructure.email.templates import EmailContent

_CONFIGURED = EmailConfig(
    host="smtp.example.com",
    port=587,
    user="notifications@example.com",
    password="secret",
    from_address="notifications@example.com",
    use_tls=True,
)

_CONTENT = EmailContent(subject="Hello", text="hello text", html="<p>hello</p>")


def run(coro):
    return asyncio.run(coro)


class _FakeSMTP:
    """Records every call made against it; used in place of smtplib.SMTP."""

    instances: list["_FakeSMTP"] = []

    def __init__(self, host, port, timeout=None):
        self.host = host
        self.port = port
        self.started_tls = False
        self.login_args: tuple | None = None
        self.sent: list[tuple] = []
        _FakeSMTP.instances.append(self)

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return False

    def starttls(self):
        self.started_tls = True

    def login(self, user, password):
        self.login_args = (user, password)

    def sendmail(self, from_addr, to_addrs, message):
        self.sent.append((from_addr, to_addrs, message))


class _RaisingSMTP(_FakeSMTP):
    def sendmail(self, from_addr, to_addrs, message):
        raise ConnectionRefusedError("smtp connection refused")


# --- EmailConfig -----------------------------------------------------------


def test_config_is_not_configured_when_blank() -> None:
    assert EmailConfig(host="", port=0, user="", password="", from_address="", use_tls=True).is_configured is False


def test_config_is_not_configured_when_partial() -> None:
    partial = EmailConfig(host="smtp.example.com", port=587, user="", password="", from_address="", use_tls=True)
    assert partial.is_configured is False


def test_config_is_configured_when_all_fields_present() -> None:
    assert _CONFIGURED.is_configured is True


def test_load_email_config_reads_from_environment(monkeypatch) -> None:
    monkeypatch.setenv("SMTP_HOST", "smtp.example.com")
    monkeypatch.setenv("SMTP_PORT", "2525")
    monkeypatch.setenv("SMTP_USER", "user@example.com")
    monkeypatch.setenv("SMTP_PASSWORD", "secret")
    monkeypatch.setenv("SMTP_FROM", "user@example.com")
    monkeypatch.setenv("SMTP_SECURE", "false")

    config = load_email_config()

    assert config.is_configured is True
    assert config.port == 2525
    assert config.use_tls is False


def test_load_email_config_disabled_when_env_missing(monkeypatch) -> None:
    for key in ("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "SMTP_SECURE"):
        monkeypatch.delenv(key, raising=False)

    assert load_email_config().is_configured is False


# --- EmailService.send ------------------------------------------------------


def test_send_does_nothing_when_not_configured(monkeypatch) -> None:
    import app.infrastructure.email.service as service_module

    _FakeSMTP.instances.clear()
    monkeypatch.setattr(service_module.smtplib, "SMTP", _FakeSMTP)

    disabled = EmailConfig(host="", port=0, user="", password="", from_address="", use_tls=True)
    service = EmailService(config=disabled)

    run(service.send("someone@example.com", _CONTENT))

    assert _FakeSMTP.instances == []


def test_send_delivers_through_smtp_when_configured(monkeypatch) -> None:
    import app.infrastructure.email.service as service_module

    _FakeSMTP.instances.clear()
    monkeypatch.setattr(service_module.smtplib, "SMTP", _FakeSMTP)

    service = EmailService(config=_CONFIGURED)
    run(service.send("someone@example.com", _CONTENT))

    assert len(_FakeSMTP.instances) == 1
    smtp = _FakeSMTP.instances[0]
    assert smtp.started_tls is True
    assert smtp.login_args == (_CONFIGURED.user, _CONFIGURED.password)
    assert len(smtp.sent) == 1
    from_addr, to_addrs, message = smtp.sent[0]
    assert from_addr == _CONFIGURED.from_address
    assert to_addrs == ["someone@example.com"]
    assert "Hello" in message


def test_send_failure_is_caught_and_logged_not_raised(monkeypatch, caplog) -> None:
    import app.infrastructure.email.service as service_module

    monkeypatch.setattr(service_module.smtplib, "SMTP", _RaisingSMTP)

    service = EmailService(config=_CONFIGURED)

    with caplog.at_level(logging.ERROR, logger=service_module.__name__):
        run(service.send("someone@example.com", _CONTENT))

    assert "Email notification failed" in caplog.text
    assert "someone@example.com" in caplog.text
    assert _CONFIGURED.password not in caplog.text
