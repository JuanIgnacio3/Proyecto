from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.estudiante import Estudiante
from app.models.grupo import Grupo
from app.models.usuario import Usuario
from app.schemas.matricula import (
    EstudianteMatricula,
    MatriculaMasiva,
    MatriculaUpdate,
)

router = APIRouter()


def _ensure_grupo(db: Session, id_grupo: int) -> None:
    if db.get(Grupo, id_grupo) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="El grupo indicado no existe"
        )


def _to_item(est: Estudiante) -> EstudianteMatricula:
    return EstudianteMatricula(
        id_estudiante=est.id_estudiante,
        name_estudiante=est.name_estudiante,
        sec_name_estudiante=est.sec_name_estudiante,
        num_documento_estudiante=est.num_documento_estudiante,
        id_grupo=est.id_grupo,
        grupo=est.grupo.name_grupo if est.grupo else None,
    )


def _estudiantes_activos(db: Session):
    return db.query(Estudiante).join(Usuario, Estudiante.id_usuario == Usuario.id_usuario).filter(
        Usuario.activo.is_(True)
    )


@router.get("/sin-grupo", response_model=list[EstudianteMatricula])
def estudiantes_sin_grupo(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> list[EstudianteMatricula]:
    estudiantes = (
        _estudiantes_activos(db)
        .filter(Estudiante.id_grupo.is_(None))
        .order_by(Estudiante.name_estudiante, Estudiante.sec_name_estudiante)
        .all()
    )
    return [_to_item(e) for e in estudiantes]


@router.get("/grupo/{id_grupo}", response_model=list[EstudianteMatricula])
def estudiantes_de_grupo(
    id_grupo: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> list[EstudianteMatricula]:
    _ensure_grupo(db, id_grupo)
    estudiantes = (
        _estudiantes_activos(db)
        .filter(Estudiante.id_grupo == id_grupo)
        .order_by(Estudiante.name_estudiante, Estudiante.sec_name_estudiante)
        .all()
    )
    return [_to_item(e) for e in estudiantes]


@router.put("/estudiante/{id_estudiante}", response_model=EstudianteMatricula)
def matricular_estudiante(
    id_estudiante: int,
    payload: MatriculaUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> EstudianteMatricula:
    estudiante = db.get(Estudiante, id_estudiante)
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
        )
    if payload.id_grupo is not None:
        _ensure_grupo(db, payload.id_grupo)

    estudiante.id_grupo = payload.id_grupo
    db.commit()
    db.refresh(estudiante)
    return _to_item(estudiante)


@router.post("/masiva", response_model=list[EstudianteMatricula])
def matricula_masiva(
    payload: MatriculaMasiva,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> list[EstudianteMatricula]:
    _ensure_grupo(db, payload.id_grupo)

    ids = set(payload.estudiantes_ids)
    estudiantes = db.query(Estudiante).filter(Estudiante.id_estudiante.in_(ids)).all()
    if len(estudiantes) != len(ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uno o mas estudiantes no existen",
        )

    for est in estudiantes:
        est.id_grupo = payload.id_grupo
    db.commit()
    for est in estudiantes:
        db.refresh(est)
    return [_to_item(e) for e in estudiantes]
