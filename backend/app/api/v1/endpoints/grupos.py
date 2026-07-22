from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.asignatura import Asignatura
from app.models.estudiante import Estudiante
from app.models.grupo import Grupo
from app.models.profesor import Profesor
from app.models.subgrupo import SubGrupo
from app.models.usuario import Usuario
from app.schemas.grupo import GrupoCreate, GrupoOut, GrupoUpdate

router = APIRouter()


def _ensure_asignatura(db: Session, id_asignatura: int) -> None:
    if db.get(Asignatura, id_asignatura) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La asignatura indicada no existe",
        )


@router.get("/", response_model=list[GrupoOut])
def list_grupos(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> list[Grupo]:
    return db.query(Grupo).order_by(Grupo.id_grupo).all()


@router.post("/", response_model=GrupoOut, status_code=status.HTTP_201_CREATED)
def create_grupo(
    payload: GrupoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Grupo:
    _ensure_asignatura(db, payload.id_asignatura)
    grupo = Grupo(name_grupo=payload.name_grupo, id_asignatura=payload.id_asignatura)
    db.add(grupo)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo crear el grupo",
        ) from exc
    db.refresh(grupo)
    return grupo


@router.put("/{id_grupo}", response_model=GrupoOut)
def update_grupo(
    id_grupo: int,
    payload: GrupoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Grupo:
    grupo = db.get(Grupo, id_grupo)
    if grupo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Grupo no encontrado"
        )

    data = payload.model_dump(exclude_unset=True)
    if "id_asignatura" in data and data["id_asignatura"] is not None:
        _ensure_asignatura(db, data["id_asignatura"])

    for field, value in data.items():
        setattr(grupo, field, value)

    db.commit()
    db.refresh(grupo)
    return grupo


@router.delete("/{id_grupo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grupo(
    id_grupo: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> None:
    grupo = db.get(Grupo, id_grupo)
    if grupo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Grupo no encontrado"
        )

    referenciado = (
        db.query(Estudiante).filter(Estudiante.id_grupo == id_grupo).first() is not None
        or db.query(Profesor).filter(Profesor.id_grupo == id_grupo).first() is not None
        or db.query(SubGrupo).filter(SubGrupo.id_grupo == id_grupo).first() is not None
    )
    if referenciado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar: hay estudiantes, profesores o subgrupos asociados",
        )

    db.delete(grupo)
    db.commit()
