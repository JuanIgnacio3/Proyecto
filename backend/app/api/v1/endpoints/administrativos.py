from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.administrativo import Administrativo
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.administrativo import (
    AdministrativoCreate,
    AdministrativoOut,
    AdministrativoUpdate,
)

router = APIRouter()

ROL_ADMINISTRATIVO = "Administrativo"


@router.get("/", response_model=list[AdministrativoOut])
def list_administrativos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> list[Administrativo]:
    return (
        db.query(Administrativo)
        .order_by(Administrativo.id_administrativo)
        .offset(skip)
        .limit(min(limit, 200))
        .all()
    )


@router.post("/", response_model=AdministrativoOut, status_code=status.HTTP_201_CREATED)
def create_administrativo(
    payload: AdministrativoCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Administrativo:
    rol = db.query(Rol).filter(Rol.name_rol == ROL_ADMINISTRATIVO).first()
    if rol is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="El rol 'Administrativo' no existe todavia, ejecute el seed primero",
        )

    usuario = Usuario(
        correo_institucional=payload.correo_institucional,
        id_rol=rol.id_rol,
        hashed_password=get_password_hash(payload.password),
        activo=True,
    )
    administrativo = Administrativo(
        usuario=usuario,
        name_administrativo=payload.name_administrativo,
        sec_name_administrativo=payload.sec_name_administrativo,
        id_tipo_documento=payload.id_tipo_documento,
        num_documento_administrativo=payload.num_documento_administrativo,
        phone_num_administrativo=payload.phone_num_administrativo,
        direction_administrativo=payload.direction_administrativo,
        cargo=payload.cargo,
    )
    db.add(usuario)
    db.add(administrativo)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Correo o numero de documento duplicado, o tipo de documento invalido",
        ) from exc
    db.refresh(administrativo)
    return administrativo


@router.get("/{id_administrativo}", response_model=AdministrativoOut)
def get_administrativo(
    id_administrativo: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Administrativo:
    administrativo = db.get(Administrativo, id_administrativo)
    if administrativo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Administrativo no encontrado"
        )
    return administrativo


@router.put("/{id_administrativo}", response_model=AdministrativoOut)
def update_administrativo(
    id_administrativo: int,
    payload: AdministrativoUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> Administrativo:
    administrativo = db.get(Administrativo, id_administrativo)
    if administrativo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Administrativo no encontrado"
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(administrativo, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Numero de documento duplicado, o tipo de documento invalido",
        ) from exc
    db.refresh(administrativo)
    return administrativo


@router.delete("/{id_administrativo}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_administrativo(
    id_administrativo: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> None:
    administrativo = db.get(Administrativo, id_administrativo)
    if administrativo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Administrativo no encontrado"
        )
    administrativo.usuario.activo = False
    db.commit()
