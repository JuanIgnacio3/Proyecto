from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.evento import Evento
from app.models.usuario import Usuario
from app.schemas.evento import EventoCreate, EventoOut, EventoUpdate

router = APIRouter()

ROLES_GESTION = ("Administrador", "Administrativo")


def _get(db: Session, id_evento: int) -> Evento:
    evento = db.get(Evento, id_evento)
    if evento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado"
        )
    return evento


@router.get("/", response_model=list[EventoOut])
def list_eventos(
    anio: int | None = None,
    mes: int | None = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[Evento]:
    query = db.query(Evento)
    if anio is not None:
        from sqlalchemy import extract

        query = query.filter(extract("year", Evento.fecha_inicio) == anio)
        if mes is not None:
            query = query.filter(extract("month", Evento.fecha_inicio) == mes)
    return query.order_by(Evento.fecha_inicio, Evento.id_evento).all()


@router.post("/", response_model=EventoOut, status_code=status.HTTP_201_CREATED)
def create_evento(
    payload: EventoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> Evento:
    evento = Evento(**payload.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@router.put("/{id_evento}", response_model=EventoOut)
def update_evento(
    id_evento: int,
    payload: EventoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> Evento:
    evento = _get(db, id_evento)
    data = payload.model_dump(exclude_unset=True)

    fecha_inicio = data.get("fecha_inicio", evento.fecha_inicio)
    fecha_fin = data.get("fecha_fin", evento.fecha_fin)
    if fecha_fin is not None and fecha_fin < fecha_inicio:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La fecha de fin no puede ser anterior a la de inicio",
        )

    for field, value in data.items():
        setattr(evento, field, value)
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{id_evento}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evento(
    id_evento: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> None:
    evento = _get(db, id_evento)
    db.delete(evento)
    db.commit()
