"""Politica de contrasenas: complejidad + verificacion de filtraciones (HIBP).

La verificacion de filtraciones usa el modelo k-anonymity de Have I Been Pwned:
se envia solo el prefijo (5 chars) del hash SHA-1, nunca la contrasena ni el hash
completo. Es fail-open: si el servicio no responde, no se bloquea al usuario.
"""
import hashlib
import logging
import urllib.error
import urllib.request

from fastapi import HTTPException, status

logger = logging.getLogger("app.passwords")

PASSWORD_MIN_LEN = 8
PASSWORD_MAX_LEN = 128

_HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/"
_HIBP_TIMEOUT = 3.0


def complexity_error(password: str) -> str | None:
    """Devuelve un mensaje si la contrasena no cumple la complejidad minima, o None."""
    if len(password) < PASSWORD_MIN_LEN:
        return f"La contrasena debe tener al menos {PASSWORD_MIN_LEN} caracteres."
    if len(password) > PASSWORD_MAX_LEN:
        return f"La contrasena no puede superar los {PASSWORD_MAX_LEN} caracteres."
    if not any(c.isalpha() for c in password):
        return "La contrasena debe incluir al menos una letra."
    if not any(c.isdigit() for c in password):
        return "La contrasena debe incluir al menos un numero."
    return None


def is_password_pwned(password: str) -> bool:
    """True si la contrasena aparece en filtraciones conocidas (HIBP, k-anonymity).

    Fail-open: ante cualquier error de red devuelve False para no bloquear al
    usuario por una caida del servicio externo.
    """
    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    try:
        request = urllib.request.Request(
            f"{_HIBP_RANGE_URL}{prefix}",
            headers={"User-Agent": "tcu-sistema-institucional", "Add-Padding": "true"},
        )
        with urllib.request.urlopen(request, timeout=_HIBP_TIMEOUT) as response:
            body = response.read().decode("utf-8")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:  # pragma: no cover
        logger.warning("HIBP no disponible; se omite la verificacion: %s", exc)
        return False

    for line in body.splitlines():
        line_suffix, _, count = line.partition(":")
        if line_suffix.strip().upper() == suffix and count.strip() not in ("0", ""):
            return True
    return False


def assert_password_ok(password: str) -> None:
    """Valida complejidad y que la contrasena no este filtrada. Lanza 400 si falla."""
    error = complexity_error(password)
    if error is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    if is_password_pwned(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta contrasena aparecio en filtraciones de datos conocidas; elige otra.",
        )
