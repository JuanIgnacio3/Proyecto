"""Asignaciones profesor-materia por grupo (remodelado de grupos, Fase 1).

Un grupo puede tener varios profesores, cada uno impartiendo una asignatura.
Es aditivo: convive con ``Grupo.id_asignatura`` y ``Profesor.id_grupo`` sin
alterarlos. La gestion (crear/desactivar) es solo de Administrador; la lectura
la comparten los roles de staff.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.asignatura import Asignatura
from app.models.grupo import Grupo
from app.models.profesor import Profesor
from app.models.profesor_asignatura_grupo import ProfesorAsignaturaGrupo
from app.models.usuario import Usuario
from app.schemas.profesor_asignatura_grupo import (
    AsignacionCreate,
    AsignacionOut,
    AsignacionUpdate,
)

router = APIRouter()


def _get(db: Session, id_asignacion: int) -> ProfesorAsignaturaGrupo:
    asignacion = db.get(ProfesorAsignaturaGrupo, id_asignacion)
    if asignacion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Asignacion no encontrada"
        )
    return asignacion


def _validar_referencias(db: Session, payload: AsignacionCreate) -> None:
    if db.get(Profesor, payload.id_profesor) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El profesor indicado no existe")
    if db.get(Grupo, payload.id_grupo) is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El grupo indicado no existe")
    asignatura = db.get(Asignatura, payload.id_asignatura)
    if asignatura is None or not asignatura.activo:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "La asignatura indicada no existe o esta inactiva"
        )


@router.get("/", response_model=list[AsignacionOut])
def list_asignaciones(
    id_grupo: int | None = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> list[ProfesorAsignaturaGrupo]:
    query = db.query(ProfesorAsignaturaGrupo)
    if id_grupo is not None:
        query = query.filter(ProfesorAsignaturaGrupo.id_grupo == id_grupo)
    return query.order_by(ProfesorAsignaturaGrupo.id_profesor_asignatura_grupo).all()


@router.get("/mis-clases", response_model=list[AsignacionOut])
def mis_clases(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(
        require_roles("Administrador", "Profesor", "Administrativo")
    ),
) -> list[ProfesorAsignaturaGrupo]:
    """Las clases (asignaciones activas) que puede gestionar el usuario: un
    profesor solo las suyas; Administrador/Administrativo, todas."""
    # Solo clases utilizables: la asignacion, su materia y su profesor activos.
    query = db.query(ProfesorAsignaturaGrupo).filter(
        ProfesorAsignaturaGrupo.activo.is_(True),
        ProfesorAsignaturaGrupo.asignatura.has(Asignatura.activo.is_(True)),
        ProfesorAsignaturaGrupo.profesor.has(
            Profesor.usuario.has(Usuario.activo.is_(True))
        ),
    )
    if current_user.rol.name_rol == "Profesor":
        profesor = (
            db.query(Profesor)
            .filter(Profesor.id_usuario == current_user.id_usuario)
            .first()
        )
        if profesor is None:
            return []
        query = query.filter(ProfesorAsignaturaGrupo.id_profesor == profesor.id_profesor)
    return query.order_by(
        ProfesorAsignaturaGrupo.id_grupo, ProfesorAsignaturaGrupo.id_asignatura
    ).all()


@router.post("/", response_model=AsignacionOut, status_code=status.HTTP_201_CREATED)
def create_asignacion(
    payload: AsignacionCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> ProfesorAsignaturaGrupo:
    _validar_referencias(db, payload)

    # Si ya existe la misma terna (profesor, grupo, asignatura), no se duplica:
    # si estaba desactivada se reactiva; si estaba activa es un conflicto.
    existente = (
        db.query(ProfesorAsignaturaGrupo)
        .filter_by(
            id_profesor=payload.id_profesor,
            id_grupo=payload.id_grupo,
            id_asignatura=payload.id_asignatura,
        )
        .first()
    )
    if existente is not None:
        if existente.activo:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ese profesor ya imparte esa materia en ese grupo",
            )
        existente.activo = True
        existente.porcentaje_asistencia = payload.porcentaje_asistencia
        db.commit()
        db.refresh(existente)
        return existente

    asignacion = ProfesorAsignaturaGrupo(
        id_profesor=payload.id_profesor,
        id_grupo=payload.id_grupo,
        id_asignatura=payload.id_asignatura,
        porcentaje_asistencia=payload.porcentaje_asistencia,
    )
    db.add(asignacion)
    db.commit()
    db.refresh(asignacion)
    return asignacion


@router.put("/{id_asignacion}", response_model=AsignacionOut)
def update_asignacion(
    id_asignacion: int,
    payload: AsignacionUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> ProfesorAsignaturaGrupo:
    asignacion = _get(db, id_asignacion)
    data = payload.model_dump(exclude_unset=True)
    if data.get("activo") is not None:
        asignacion.activo = data["activo"]
    if data.get("porcentaje_asistencia") is not None:
        asignacion.porcentaje_asistencia = data["porcentaje_asistencia"]
    db.commit()
    db.refresh(asignacion)
    return asignacion


@router.delete("/{id_asignacion}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asignacion(
    id_asignacion: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> None:
    asignacion = _get(db, id_asignacion)
    asignacion.activo = False
    db.commit()
