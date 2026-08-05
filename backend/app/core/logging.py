"""Configuracion de logging para produccion.

Formato estructurado y consistente (timestamp ISO, nivel, logger, mensaje)
sobre la salida estandar, alineado con los loggers de uvicorn. El nivel se
controla con la variable de entorno LOG_LEVEL.
"""
from __future__ import annotations

import logging
from logging.config import dictConfig

from app.core.config import settings

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_DATE_FORMAT = "%Y-%m-%dT%H:%M:%S%z"


def configure_logging() -> None:
    level = settings.LOG_LEVEL.upper()
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {"format": _LOG_FORMAT, "datefmt": _DATE_FORMAT},
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "default",
                    "stream": "ext://sys.stdout",
                },
            },
            "root": {"handlers": ["console"], "level": level},
            "loggers": {
                # Unifica el formato de uvicorn con el de la aplicacion.
                "uvicorn": {"handlers": ["console"], "level": level, "propagate": False},
                "uvicorn.error": {
                    "handlers": ["console"],
                    "level": level,
                    "propagate": False,
                },
                "uvicorn.access": {
                    "handlers": ["console"],
                    "level": level,
                    "propagate": False,
                },
            },
        }
    )
    logging.getLogger("app").info("Logging configurado (nivel=%s)", level)
