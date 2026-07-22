from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.comunicado import Comunicado
from app.models.usuario import Usuario
from app.schemas.comunicado import (
    ComunicadoCreate,
    ComunicadoOut,
    ComunicadoUpdate,
)

router = APIRouter()

ROLES_GESTION = ("Administrador", "Administrativo")

# Que audiencia le corresponde a cada rol que solo lee.
AUDIENCIA_POR_ROL = {
    "Estudiante": "Estudiantes",
    "Profesor": "Profesores",
    "Encargado": "Encargados",
}


def _serialize(c: Comunicado) -> dict:
    return {
        "id_comunicado": c.id_comunicado,
        "titulo": c.titulo,
        "cuerpo": c.cuerpo,
        "dirigido_a": c.dirigido_a,
        "fecha_publicacion": c.fecha_publicacion,
        "id_autor": c.id_autor,
        "autor_correo": c.autor.correo_institucional if c.autor else "",
    }


def _get(db: Session, id_comunicado: int) -> Comunicado:
    comunicado = db.get(Comunicado, id_comunicado)
    if comunicado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comunicado no encontrado"
        )
    return comunicado


@router.get("/", response_model=list[ComunicadoOut])
def list_comunicados(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> list[dict]:
    query = db.query(Comunicado)

    rol = current_user.rol.name_rol
    if rol not in ROLES_GESTION:
        # Solo lectura: los dirigidos a "Todos" o a la audiencia de su rol.
        audiencia = AUDIENCIA_POR_ROL.get(rol)
        if audiencia:
            query = query.filter(
                or_(Comunicado.dirigido_a == "Todos", Comunicado.dirigido_a == audiencia)
            )
        else:
            query = query.filter(Comunicado.dirigido_a == "Todos")

    comunicados = query.order_by(Comunicado.fecha_publicacion.desc()).all()
    return [_serialize(c) for c in comunicados]


@router.post("/", response_model=ComunicadoOut, status_code=status.HTTP_201_CREATED)
def create_comunicado(
    payload: ComunicadoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> dict:
    comunicado = Comunicado(
        titulo=payload.titulo,
        cuerpo=payload.cuerpo,
        dirigido_a=payload.dirigido_a,
        id_autor=current_user.id_usuario,
    )
    db.add(comunicado)
    db.commit()
    db.refresh(comunicado)
    return _serialize(comunicado)


@router.put("/{id_comunicado}", response_model=ComunicadoOut)
def update_comunicado(
    id_comunicado: int,
    payload: ComunicadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> dict:
    comunicado = _get(db, id_comunicado)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(comunicado, field, value)
    db.commit()
    db.refresh(comunicado)
    return _serialize(comunicado)


@router.delete("/{id_comunicado}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comunicado(
    id_comunicado: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles(*ROLES_GESTION)),
) -> None:
    comunicado = _get(db, id_comunicado)
    db.delete(comunicado)
    db.commit()
