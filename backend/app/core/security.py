import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from app.core.config import settings

_ALGORITHM = "sha256"
_ITERATIONS = 260_000
_SALT_BYTES = 16


def hash_password(password: str) -> str:
    """Hash a plaintext password using PBKDF2-HMAC-SHA256 with a random salt."""
    salt = os.urandom(_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac(_ALGORITHM, password.encode("utf-8"), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${salt.hex()}${derived.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    """Check a plaintext password against a hash produced by hash_password()."""
    try:
        algorithm, iterations_str, salt_hex, hash_hex = password_hash.split("$")
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(hash_hex)
    derived = hashlib.pbkdf2_hmac(_ALGORITHM, password.encode("utf-8"), salt, int(iterations_str))
    return hmac.compare_digest(derived, expected)


class TokenError(Exception):
    """Raised when a JWT is missing, malformed, expired, or has an invalid signature."""


def create_access_token(claims: dict[str, Any]) -> str:
    """Encode `claims` into a signed JWT with a standard expiration claim."""
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {**claims, "iat": now, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    """Verify signature and expiration, returning the decoded claims."""
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise TokenError("Invalid or expired token") from exc
