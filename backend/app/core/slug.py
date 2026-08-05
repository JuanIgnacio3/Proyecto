"""Helpers de slug para la API publica.

El slug no se almacena: se deriva de forma determinista desde el titulo y el id,
de modo que sea estable (el id es inmutable) y reproducible.
"""
import re
import unicodedata


def slugify(value: str) -> str:
    """Convierte un texto a kebab-case ASCII (sin tildes ni simbolos)."""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_str = normalized.encode("ascii", "ignore").decode("ascii").lower()
    ascii_str = re.sub(r"[^a-z0-9]+", "-", ascii_str)
    return ascii_str.strip("-")


def resource_slug(titulo: str, resource_id: int) -> str:
    """`kebab-case(titulo)-id`. Slug determinista y estable para la API publica
    (Noticias, Calendario, ...). Si el titulo no deja base, usa solo el id."""
    base = slugify(titulo)
    return f"{base}-{resource_id}" if base else str(resource_id)
