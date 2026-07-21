from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.asignatura import Asignatura
from app.models.grupo import Grupo
from app.models.usuario import Usuario
from app.schemas.asignatura import AsignaturaCreate, AsignaturaOut, AsignaturaUpdate

router = APIRouter()


@router.get("/", response_model=list[AsignaturaOut])
def list_asignaturas(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> list[Asignatura]:
    return db.query(Asignatura).order_by(Asignatura.id_asignatura).all()


@router.post("/", response_model=AsignaturaOut, status_code=status.HTTP_201_CREATED)
def create_asignatura(
    payload: AsignaturaCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Asignatura:
    asignatura = Asignatura(name_asignatura=payload.name_asignatura)
    db.add(asignatura)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una asignatura con ese nombre",
        ) from exc
    db.refresh(asignatura)
    return asignatura


@router.put("/{id_asignatura}", response_model=AsignaturaOut)
def update_asignatura(
    id_asignatura: int,
    payload: AsignaturaUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Asignatura:
    asignatura = db.get(Asignatura, id_asignatura)
    if asignatura is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(asignatura, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una asignatura con ese nombre",
        ) from exc
    db.refresh(asignatura)
    return asignatura


@router.delete("/{id_asignatura}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asignatura(
    id_asignatura: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> None:
    asignatura = db.get(Asignatura, id_asignatura)
    if asignatura is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asignatura no encontrada"
        )

    tiene_grupos = (
        db.query(Grupo).filter(Grupo.id_asignatura == id_asignatura).first() is not None
    )
    if tiene_grupos:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar: hay grupos asociados a esta asignatura",
        )

    db.delete(asignatura)
    db.commit()
