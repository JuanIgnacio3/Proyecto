from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.public.calendar import router as public_calendar_router
from app.api.public.news import router as public_news_router
from app.api.public.specialties import router as public_specialties_router
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.ratelimit import RateLimited, public_rate_limit

configure_logging()

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_PREFIX}/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RateLimited)
async def _rate_limited_handler(request: Request, exc: RateLimited) -> JSONResponse:
    """Respuesta 429 con el envoltorio de error del contrato (docs/API_PUBLICA.md)."""
    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "rate_limited",
                "message": "Demasiadas solicitudes. Intente de nuevo mas tarde.",
                "status": 429,
            }
        },
        headers={"Retry-After": str(exc.retry_after)},
    )


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
# API publica (solo lectura, sin autenticacion), separada del router admin.
# Rate limiting basico por IP en toda la superficie publica.
_public = [Depends(public_rate_limit)]
app.include_router(
    public_news_router, prefix="/api/public/v1", tags=["public-news"], dependencies=_public
)
app.include_router(
    public_calendar_router, prefix="/api/public/v1", tags=["public-calendar"], dependencies=_public
)
app.include_router(
    public_specialties_router,
    prefix="/api/public/v1",
    tags=["public-specialties"],
    dependencies=_public,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
