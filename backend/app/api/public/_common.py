"""Infraestructura compartida por los endpoints de la API publica.

Solo funciones simples y constantes que se repiten en varios endpoints
(paginacion y envoltorio de error). Sin clases ni framework.
"""
from fastapi.responses import JSONResponse

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 50


def error_response(status_code: int, code: str, message: str) -> JSONResponse:
    """Envoltorio de error uniforme del contrato (docs/API_PUBLICA.md)."""
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "status": status_code}},
    )


def validate_pagination(page: int, page_size: int) -> tuple[int, JSONResponse | None]:
    """Valida page/page_size. Devuelve (page_size_recortado, error_o_None).

    - page < 1        -> error 400
    - page_size < 1   -> error 400
    - page_size > MAX -> se recorta (no es error), segun el contrato.
    """
    if page < 1:
        return page_size, error_response(
            400, "bad_request", "El parametro 'page' debe ser mayor o igual a 1."
        )
    if page_size < 1:
        return page_size, error_response(
            400, "bad_request", "El parametro 'page_size' debe ser mayor o igual a 1."
        )
    if page_size > MAX_PAGE_SIZE:
        page_size = MAX_PAGE_SIZE
    return page_size, None


def count_pages(total: int, page_size: int) -> int:
    """Numero total de paginas para `total` registros."""
    return (total + page_size - 1) // page_size if total else 0
