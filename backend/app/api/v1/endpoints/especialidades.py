from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.especialidad import Especialidad
from app.models.usuario import Usuario
from app.schemas.especialidad import (
    EspecialidadCreate,
    EspecialidadOut,
    EspecialidadUpdate,
)

router = APIRouter()

ROLES_GESTION = ("Administrador", "Administrativo")


def _get(db: Session, id_especialidad: int) -> Especialidad:
    especialidad = db.get(Especialidad, id_especialidad)
    if especialidad is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Especialidad no encontrada"
        )
    return especialidad


@router.get("/", response_model=list[EspecialidadOut])
def list_especialidades(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[Especialidad]:
    return (
        db.query(Especialidad)
        .order_by(Especialidad.orden, Especialidad.id_especialidad)
        .all()
    )


@router.post("/", response_model=EspecialidadOut, status_code=status.HTTP_201_CREATED)
def create_especialidad(
    payload: EspecialidadCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> Especialidad:
    especialidad = Especialidad(**payload.model_dump())
    db.add(especialidad)
    db.commit()
    db.refresh(especialidad)
    return especialidad


@router.put("/{id_especialidad}", response_model=EspecialidadOut)
def update_especialidad(
    id_especialidad: int,
    payload: EspecialidadUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> Especialidad:
    especialidad = _get(db, id_especialidad)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(especialidad, field, value)
    db.commit()
    db.refresh(especialidad)
    return especialidad


@router.delete("/{id_especialidad}", status_code=status.HTTP_204_NO_CONTENT)
def delete_especialidad(
    id_especialidad: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> None:
    especialidad = _get(db, id_especialidad)
    db.delete(especialidad)
    db.commit()
