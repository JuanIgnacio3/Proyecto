from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.grupo import Grupo
from app.models.nota import Nota
from app.models.usuario import Usuario
from app.schemas.calificaciones import (
    EvaluacionCreate,
    EvaluacionOut,
    EvaluacionUpdate,
    NotasBatchIn,
    NotasRosterOut,
)

router = APIRouter()


def _ensure_grupo(db: Session, id_grupo: int) -> None:
    if db.get(Grupo, id_grupo) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="El grupo indicado no existe"
        )


def _get_evaluacion(db: Session, id_evaluacion: int) -> Evaluacion:
    evaluacion = db.get(Evaluacion, id_evaluacion)
    if evaluacion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluacion no encontrada"
        )
    return evaluacion


@router.get("/", response_model=list[EvaluacionOut])
def list_evaluaciones(
    id_grupo: int | None = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> list[Evaluacion]:
    query = db.query(Evaluacion)
    if id_grupo is not None:
        query = query.filter(Evaluacion.id_grupo == id_grupo)
    return query.order_by(Evaluacion.periodo, Evaluacion.id_evaluacion).all()


@router.post("/", response_model=EvaluacionOut, status_code=status.HTTP_201_CREATED)
def create_evaluacion(
    payload: EvaluacionCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> Evaluacion:
    _ensure_grupo(db, payload.id_grupo)
    evaluacion = Evaluacion(**payload.model_dump())
    db.add(evaluacion)
    db.commit()
    db.refresh(evaluacion)
    return evaluacion


@router.put("/{id_evaluacion}", response_model=EvaluacionOut)
def update_evaluacion(
    id_evaluacion: int,
    payload: EvaluacionUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> Evaluacion:
    evaluacion = _get_evaluacion(db, id_evaluacion)
    data = payload.model_dump(exclude_unset=True)
    if "id_grupo" in data and data["id_grupo"] is not None:
        _ensure_grupo(db, data["id_grupo"])
    for field, value in data.items():
        setattr(evaluacion, field, value)
    db.commit()
    db.refresh(evaluacion)
    return evaluacion


@router.delete("/{id_evaluacion}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evaluacion(
    id_evaluacion: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> None:
    evaluacion = _get_evaluacion(db, id_evaluacion)
    db.delete(evaluacion)
    db.commit()


@router.get("/{id_evaluacion}/notas", response_model=NotasRosterOut)
def get_notas(
    id_evaluacion: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> NotasRosterOut:
    evaluacion = _get_evaluacion(db, id_evaluacion)

    estudiantes = (
        db.query(Estudiante)
        .filter(Estudiante.id_grupo == evaluacion.id_grupo)
        .order_by(Estudiante.name_estudiante, Estudiante.sec_name_estudiante)
        .all()
    )
    notas_previas = {
        n.id_estudiante: n
        for n in db.query(Nota).filter(Nota.id_evaluacion == id_evaluacion).all()
    }

    registros = [
        {
            "id_estudiante": est.id_estudiante,
            "name_estudiante": est.name_estudiante,
            "sec_name_estudiante": est.sec_name_estudiante,
            "valor": float(notas_previas[est.id_estudiante].valor)
            if est.id_estudiante in notas_previas
            else None,
        }
        for est in estudiantes
    ]

    return NotasRosterOut(
        id_evaluacion=id_evaluacion,
        name_evaluacion=evaluacion.name_evaluacion,
        registros=registros,
    )


@router.put("/{id_evaluacion}/notas", response_model=NotasRosterOut)
def save_notas(
    id_evaluacion: int,
    payload: NotasBatchIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> NotasRosterOut:
    evaluacion = _get_evaluacion(db, id_evaluacion)

    estudiantes_validos = {
        e.id_estudiante
        for e in db.query(Estudiante.id_estudiante)
        .filter(Estudiante.id_grupo == evaluacion.id_grupo)
        .all()
    }
    existentes = {
        n.id_estudiante: n
        for n in db.query(Nota).filter(Nota.id_evaluacion == id_evaluacion).all()
    }

    for registro in payload.registros:
        if registro.id_estudiante not in estudiantes_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El estudiante {registro.id_estudiante} no pertenece a este grupo",
            )
        actual = existentes.get(registro.id_estudiante)
        if registro.valor is None:
            # sin nota: eliminar la existente si la habia
            if actual is not None:
                db.delete(actual)
        elif actual is None:
            db.add(
                Nota(
                    id_evaluacion=id_evaluacion,
                    id_estudiante=registro.id_estudiante,
                    valor=registro.valor,
                )
            )
        else:
            actual.valor = registro.valor

    db.commit()
    return get_notas(id_evaluacion, db=db, _=_)
