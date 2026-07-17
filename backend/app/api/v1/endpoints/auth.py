from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.token import Token
from app.schemas.usuario import UsuarioOut

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> Token:
    user = (
        db.query(Usuario)
        .filter(Usuario.correo_institucional == form_data.username)
        .first()
    )
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contrasena incorrectos",
        )
    if not user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo"
        )

    access_token = create_access_token(subject=str(user.id_usuario))
    return Token(access_token=access_token)


@router.get("/me", response_model=UsuarioOut)
def read_current_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    return current_user
