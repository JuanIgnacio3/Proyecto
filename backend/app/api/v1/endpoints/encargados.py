from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.encargado import Encargado
from app.models.encargado_estudiante import EncargadoEstudiante
from app.models.estudiante import Estudiante
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.encargado import EncargadoCreate, EncargadoOut, EncargadoUpdate

router = APIRouter()

ROL_ENCARGADO = "Encargado"


def _validate_estudiantes(db: Session, ids: list[int]) -> None:
    unique_ids = set(ids)
    if not unique_ids:
        return
    existentes = (
        db.query(Estudiante.id_estudiante)
        .filter(Estudiante.id_estudiante.in_(unique_ids))
        .count()
    )
    if existentes != len(unique_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uno o mas estudiantes indicados no existen",
        )


@router.get("/", response_model=list[EncargadoOut])
def list_encargados(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> list[Encargado]:
    return (
        db.query(Encargado)
        .order_by(Encargado.id_encargado)
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.post("/", response_model=EncargadoOut, status_code=status.HTTP_201_CREATED)
def create_encargado(
    payload: EncargadoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> Encargado:
    rol_encargado = db.query(Rol).filter(Rol.name_rol == ROL_ENCARGADO).first()
    if rol_encargado is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="El rol 'Encargado' no existe todavia, ejecute el seed primero",
        )

    _validate_estudiantes(db, payload.estudiantes_ids)

    usuario = Usuario(
        correo_institucional=payload.correo_institucional,
        id_rol=rol_encargado.id_rol,
        hashed_password=get_password_hash(payload.password),
        activo=True,
    )
    encargado = Encargado(
        usuario=usuario,
        name_encargado=payload.name_encargado,
        sec_name_encargado=payload.sec_name_encargado,
        id_tipo_documento=payload.id_tipo_documento,
        num_documento_encargado=payload.num_documento_encargado,
        phone_num_encargado=payload.phone_num_encargado,
        direction_encargado=payload.direction_encargado,
        parentesco=payload.parentesco,
    )
    for id_estudiante in set(payload.estudiantes_ids):
        encargado.estudiantes_link.append(
            EncargadoEstudiante(id_estudiante=id_estudiante)
        )

    db.add(usuario)
    db.add(encargado)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Correo o numero de documento duplicado, o tipo de documento invalido",
        ) from exc
    db.refresh(encargado)
    return encargado


@router.get("/{id_encargado}", response_model=EncargadoOut)
def get_encargado(
    id_encargado: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> Encargado:
    encargado = db.get(Encargado, id_encargado)
    if encargado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Encargado no encontrado"
        )
    return encargado


@router.put("/{id_encargado}", response_model=EncargadoOut)
def update_encargado(
    id_encargado: int,
    payload: EncargadoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> Encargado:
    encargado = db.get(Encargado, id_encargado)
    if encargado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Encargado no encontrado"
        )

    data = payload.model_dump(exclude_unset=True)
    estudiantes_ids = data.pop("estudiantes_ids", None)

    for field, value in data.items():
        setattr(encargado, field, value)

    if estudiantes_ids is not None:
        _validate_estudiantes(db, estudiantes_ids)
        target = set(estudiantes_ids)
        actuales = {link.id_estudiante: link for link in encargado.estudiantes_link}
        # quitar solo los que sobran y agregar solo los que faltan, para no
        # reinsertar un par (encargado, estudiante) que ya existe (unique)
        for id_estudiante, link in actuales.items():
            if id_estudiante not in target:
                encargado.estudiantes_link.remove(link)
        for id_estudiante in target:
            if id_estudiante not in actuales:
                encargado.estudiantes_link.append(
                    EncargadoEstudiante(id_estudiante=id_estudiante)
                )

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Numero de documento duplicado, o tipo de documento invalido",
        ) from exc
    db.refresh(encargado)
    return encargado


@router.delete("/{id_encargado}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_encargado(
    id_encargado: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> None:
    encargado = db.get(Encargado, id_encargado)
    if encargado is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Encargado no encontrado"
        )
    encargado.usuario.activo = False
    db.commit()
