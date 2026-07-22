from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.estudiante import Estudiante
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.estudiante import EstudianteCreate, EstudianteOut, EstudianteUpdate

router = APIRouter()

ROL_ESTUDIANTE = "Estudiante"


@router.get("/", response_model=list[EstudianteOut])
def list_estudiantes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> list[Estudiante]:
    return (
        db.query(Estudiante)
        .order_by(Estudiante.id_estudiante)
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.post("/", response_model=EstudianteOut, status_code=status.HTTP_201_CREATED)
def create_estudiante(
    payload: EstudianteCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> Estudiante:
    rol_estudiante = db.query(Rol).filter(Rol.name_rol == ROL_ESTUDIANTE).first()
    if rol_estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="El rol 'Estudiante' no existe todavia, ejecute el seed primero",
        )

    usuario = Usuario(
        correo_institucional=payload.correo_institucional,
        id_rol=rol_estudiante.id_rol,
        hashed_password=get_password_hash(payload.password),
        activo=True,
    )
    estudiante = Estudiante(
        usuario=usuario,
        name_estudiante=payload.name_estudiante,
        sec_name_estudiante=payload.sec_name_estudiante,
        birthdate_estudiante=payload.birthdate_estudiante,
        direction_estudiante=payload.direction_estudiante,
        phone_num_estudiante=payload.phone_num_estudiante,
        id_tipo_documento=payload.id_tipo_documento,
        num_documento_estudiante=payload.num_documento_estudiante,
        id_grupo=payload.id_grupo,
    )
    db.add(usuario)
    db.add(estudiante)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Correo o numero de documento duplicado, o tipo de documento/grupo invalido",
        ) from exc
    db.refresh(estudiante)
    return estudiante


@router.get("/{id_estudiante}", response_model=EstudianteOut)
def get_estudiante(
    id_estudiante: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> Estudiante:
    estudiante = db.get(Estudiante, id_estudiante)
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
        )
    return estudiante


@router.put("/{id_estudiante}", response_model=EstudianteOut)
def update_estudiante(
    id_estudiante: int,
    payload: EstudianteUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> Estudiante:
    estudiante = db.get(Estudiante, id_estudiante)
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(estudiante, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Numero de documento duplicado, o tipo de documento/grupo invalido",
        ) from exc
    db.refresh(estudiante)
    return estudiante


@router.delete("/{id_estudiante}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_estudiante(
    id_estudiante: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Administrativo")),
) -> None:
    estudiante = db.get(Estudiante, id_estudiante)
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
        )
    estudiante.usuario.activo = False
    db.commit()
