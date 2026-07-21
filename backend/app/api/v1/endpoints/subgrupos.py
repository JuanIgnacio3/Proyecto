from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.estudiante import Estudiante
from app.models.grupo import Grupo
from app.models.profesor import Profesor
from app.models.subgrupo import SubGrupo
from app.models.subgrupo_estudiante import SubGrupoEstudiante
from app.models.subgrupo_profesor import SubGrupoProfesor
from app.models.usuario import Usuario
from app.schemas.subgrupo import SubGrupoCreate, SubGrupoOut, SubGrupoUpdate

router = APIRouter()


def _serialize(sg: SubGrupo) -> dict:
    return {
        "id_subgrupo": sg.id_subgrupo,
        "name_subgrupo": sg.name_subgrupo,
        "tipo_subgrupo": sg.tipo_subgrupo,
        "id_grupo": sg.id_grupo,
        "grupo": sg.grupo,
        "profesores": [link.profesor for link in sg.profesores],
        "estudiantes": [link.estudiante for link in sg.estudiantes],
    }


def _ensure_grupo(db: Session, id_grupo: int) -> None:
    if db.get(Grupo, id_grupo) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El grupo indicado no existe",
        )


def _validate_ids(db: Session, model, id_column, ids: list[int], label: str) -> None:
    unique_ids = set(ids)
    if not unique_ids:
        return
    existentes = db.query(id_column).filter(id_column.in_(unique_ids)).count()
    if existentes != len(unique_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uno o mas {label} indicados no existen",
        )


@router.get("/", response_model=list[SubGrupoOut])
def list_subgrupos(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> list[dict]:
    subgrupos = db.query(SubGrupo).order_by(SubGrupo.id_subgrupo).all()
    return [_serialize(sg) for sg in subgrupos]


@router.post("/", response_model=SubGrupoOut, status_code=status.HTTP_201_CREATED)
def create_subgrupo(
    payload: SubGrupoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> dict:
    _ensure_grupo(db, payload.id_grupo)
    _validate_ids(db, Profesor, Profesor.id_profesor, payload.profesores_ids, "profesores")
    _validate_ids(db, Estudiante, Estudiante.id_estudiante, payload.estudiantes_ids, "estudiantes")

    subgrupo = SubGrupo(
        name_subgrupo=payload.name_subgrupo,
        tipo_subgrupo=payload.tipo_subgrupo,
        id_grupo=payload.id_grupo,
    )
    for id_profesor in set(payload.profesores_ids):
        subgrupo.profesores.append(SubGrupoProfesor(id_profesor=id_profesor))
    for id_estudiante in set(payload.estudiantes_ids):
        subgrupo.estudiantes.append(SubGrupoEstudiante(id_estudiante=id_estudiante))

    db.add(subgrupo)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo crear el subgrupo",
        ) from exc
    db.refresh(subgrupo)
    return _serialize(subgrupo)


@router.get("/{id_subgrupo}", response_model=SubGrupoOut)
def get_subgrupo(
    id_subgrupo: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> dict:
    subgrupo = db.get(SubGrupo, id_subgrupo)
    if subgrupo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subgrupo no encontrado"
        )
    return _serialize(subgrupo)


@router.put("/{id_subgrupo}", response_model=SubGrupoOut)
def update_subgrupo(
    id_subgrupo: int,
    payload: SubGrupoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> dict:
    subgrupo = db.get(SubGrupo, id_subgrupo)
    if subgrupo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subgrupo no encontrado"
        )

    data = payload.model_dump(exclude_unset=True)
    profesores_ids = data.pop("profesores_ids", None)
    estudiantes_ids = data.pop("estudiantes_ids", None)

    if "id_grupo" in data and data["id_grupo"] is not None:
        _ensure_grupo(db, data["id_grupo"])
    for field, value in data.items():
        setattr(subgrupo, field, value)

    if profesores_ids is not None:
        _validate_ids(db, Profesor, Profesor.id_profesor, profesores_ids, "profesores")
        target = set(profesores_ids)
        actuales = {link.id_profesor: link for link in subgrupo.profesores}
        for id_profesor, link in actuales.items():
            if id_profesor not in target:
                subgrupo.profesores.remove(link)
        for id_profesor in target:
            if id_profesor not in actuales:
                subgrupo.profesores.append(SubGrupoProfesor(id_profesor=id_profesor))

    if estudiantes_ids is not None:
        _validate_ids(db, Estudiante, Estudiante.id_estudiante, estudiantes_ids, "estudiantes")
        target = set(estudiantes_ids)
        actuales = {link.id_estudiante: link for link in subgrupo.estudiantes}
        for id_estudiante, link in actuales.items():
            if id_estudiante not in target:
                subgrupo.estudiantes.remove(link)
        for id_estudiante in target:
            if id_estudiante not in actuales:
                subgrupo.estudiantes.append(SubGrupoEstudiante(id_estudiante=id_estudiante))

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo actualizar el subgrupo",
        ) from exc
    db.refresh(subgrupo)
    return _serialize(subgrupo)


@router.delete("/{id_subgrupo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subgrupo(
    id_subgrupo: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> None:
    subgrupo = db.get(SubGrupo, id_subgrupo)
    if subgrupo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subgrupo no encontrado"
        )
    db.delete(subgrupo)
    db.commit()
