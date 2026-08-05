"""Rate limiting basico, en memoria y sin dependencias externas.

Ventana deslizante por IP. Pensado como proteccion de primera linea contra
fuerza bruta (login) y abuso de la API publica.

Limitaciones conocidas (ver docs/DEPLOYMENT.md):
- El estado vive en memoria del proceso: con varios workers cada uno lleva su
  propio conteo, por lo que el limite efectivo se multiplica por el numero de
  workers. Para limites estrictos use el rate limiting del reverse proxy
  (Nginx `limit_req`) o un backend compartido (Redis).
- Confia en `X-Forwarded-For` cuando esta presente: valido solo detras de un
  reverse proxy de confianza (el despliegue recomendado).
"""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import Request

_hits: dict[str, deque[float]] = defaultdict(deque)


class RateLimited(Exception):
    """Se supero el limite de solicitudes. `retry_after` en segundos."""

    def __init__(self, retry_after: int) -> None:
        self.retry_after = retry_after
        super().__init__("rate limited")


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _hit(key: str, max_requests: int, window_seconds: int) -> None:
    now = time.monotonic()
    bucket = _hits[key]
    threshold = now - window_seconds
    while bucket and bucket[0] <= threshold:
        bucket.popleft()
    if len(bucket) >= max_requests:
        raise RateLimited(int(window_seconds - (now - bucket[0])) + 1)
    bucket.append(now)


def login_rate_limit(request: Request) -> None:
    """Protege el login: 10 intentos por minuto por IP."""
    _hit(f"login:{_client_ip(request)}", max_requests=10, window_seconds=60)


def public_rate_limit(request: Request) -> None:
    """Protege la API publica: 120 solicitudes por minuto por IP."""
    _hit(f"public:{_client_ip(request)}", max_requests=120, window_seconds=60)
