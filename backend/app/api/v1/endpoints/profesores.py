from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.profesor import Profesor
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.profesor import ProfesorCreate, ProfesorOut, ProfesorUpdate

router = APIRouter()

ROL_PROFESOR = "Profesor"


@router.get("/", response_model=list[ProfesorOut])
def list_profesores(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> list[Profesor]:
    return (
        db.query(Profesor)
        .order_by(Profesor.id_profesor)
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.post("/", response_model=ProfesorOut, status_code=status.HTTP_201_CREATED)
def create_profesor(
    payload: ProfesorCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Profesor:
    rol_profesor = db.query(Rol).filter(Rol.name_rol == ROL_PROFESOR).first()
    if rol_profesor is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="El rol 'Profesor' no existe todavia, ejecute el seed primero",
        )

    usuario = Usuario(
        correo_institucional=payload.correo_institucional,
        id_rol=rol_profesor.id_rol,
        hashed_password=get_password_hash(payload.password),
        activo=True,
    )
    profesor = Profesor(
        usuario=usuario,
        name_profesor=payload.name_profesor,
        sec_name_profesor=payload.sec_name_profesor,
        birthdate_profesor=payload.birthdate_profesor,
        direction_profesor=payload.direction_profesor,
        phone_num_profesor=payload.phone_num_profesor,
        id_tipo_documento=payload.id_tipo_documento,
        num_documento_profesor=payload.num_documento_profesor,
        id_grupo=payload.id_grupo,
    )
    db.add(usuario)
    db.add(profesor)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Correo o numero de documento duplicado, o tipo de documento/grupo invalido",
        ) from exc
    db.refresh(profesor)
    return profesor


@router.get("/{id_profesor}", response_model=ProfesorOut)
def get_profesor(
    id_profesor: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> Profesor:
    profesor = db.get(Profesor, id_profesor)
    if profesor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    return profesor


@router.put("/{id_profesor}", response_model=ProfesorOut)
def update_profesor(
    id_profesor: int,
    payload: ProfesorUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Profesor:
    profesor = db.get(Profesor, id_profesor)
    if profesor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profesor, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Numero de documento duplicado, o tipo de documento/grupo invalido",
        ) from exc
    db.refresh(profesor)
    return profesor


@router.delete("/{id_profesor}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_profesor(
    id_profesor: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> None:
    profesor = db.get(Profesor, id_profesor)
    if profesor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )
    profesor.usuario.activo = False
    db.commit()
