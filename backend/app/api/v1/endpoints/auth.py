from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import ACCESS_COOKIE_NAME, get_current_user
from app.core.config import settings
from app.core.passwords import assert_password_ok
from app.core.ratelimit import login_rate_limit
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.usuario import Usuario
from app.schemas.auth import PasswordChangeIn
from app.schemas.token import Token
from app.schemas.usuario import UsuarioOut

router = APIRouter()


def _set_access_cookie(response: Response, token: str) -> None:
    """Guarda el JWT en una cookie httpOnly (no accesible por JavaScript)."""
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.post("/login", response_model=Token, dependencies=[Depends(login_rate_limit)])
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
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
    _set_access_cookie(response, access_token)
    # El token tambien se devuelve para clientes de API (curl/tests via Bearer);
    # el navegador usa exclusivamente la cookie httpOnly.
    return Token(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    """Cierra la sesion borrando la cookie httpOnly."""
    response.delete_cookie(ACCESS_COOKIE_NAME, path="/")


@router.get("/me", response_model=UsuarioOut)
def read_current_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    return current_user


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_my_password(
    payload: PasswordChangeIn,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contrasena actual es incorrecta",
        )
    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contrasena debe ser distinta de la actual",
        )
    assert_password_ok(payload.new_password)
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
