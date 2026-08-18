"""Modulo unico de gestion de cuentas de usuario (solo Administrador).

Lista todas las cuentas junto con su persona asociada (estudiante, profesor,
encargado o administrativo) y permite dos operaciones de administracion:
cambiar el rol y activar/desactivar la cuenta. La desactivacion se hace sobre
``usuario.activo``, que es la fuente de verdad que ya usa el resto del sistema.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.administrativo import Administrativo
from app.models.encargado import Encargado
from app.models.estudiante import Estudiante
from app.models.profesor import Profesor
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioAdminOut, UsuarioAdminUpdate

router = APIRouter()


def _persona_index(db: Session) -> dict[int, tuple[str, str]]:
    """Mapa id_usuario -> (tipo, nombre_completo) para todas las personas.

    Se arma con una consulta por tabla (cuatro en total) para no hacer N+1 al
    serializar la lista de cuentas.
    """
    index: dict[int, tuple[str, str]] = {}
    for e in db.query(Estudiante).all():
        index[e.id_usuario] = ("Estudiante", f"{e.name_estudiante} {e.sec_name_estudiante}")
    for p in db.query(Profesor).all():
        index[p.id_usuario] = ("Profesor", f"{p.name_profesor} {p.sec_name_profesor}")
    for en in db.query(Encargado).all():
        index[en.id_usuario] = ("Encargado", f"{en.name_encargado} {en.sec_name_encargado}")
    for a in db.query(Administrativo).all():
        index[a.id_usuario] = ("Administrativo", f"{a.name_administrativo} {a.sec_name_administrativo}")
    return index


def _rol_esperado(db: Session, usuario: Usuario) -> str:
    """El rol de un usuario debe coincidir con su tipo de persona. Las cuentas de
    sistema (sin persona) son Administrador."""
    if db.query(Estudiante.id_estudiante).filter(Estudiante.id_usuario == usuario.id_usuario).first():
        return "Estudiante"
    if db.query(Profesor.id_profesor).filter(Profesor.id_usuario == usuario.id_usuario).first():
        return "Profesor"
    if db.query(Encargado.id_encargado).filter(Encargado.id_usuario == usuario.id_usuario).first():
        return "Encargado"
    if (
        db.query(Administrativo.id_administrativo)
        .filter(Administrativo.id_usuario == usuario.id_usuario)
        .first()
    ):
        return "Administrativo"
    return "Administrador"


def _serialize(usuario: Usuario, index: dict[int, tuple[str, str]]) -> dict:
    # Una cuenta sin persona (p. ej. el admin del sistema) se muestra como
    # "Sistema" con el correo como nombre.
    tipo, nombre = index.get(usuario.id_usuario, ("Sistema", usuario.correo_institucional))
    return {
        "id_usuario": usuario.id_usuario,
        "correo_institucional": usuario.correo_institucional,
        "activo": usuario.activo,
        "rol": usuario.rol,
        "tipo": tipo,
        "nombre_completo": nombre,
    }


@router.get("/", response_model=list[UsuarioAdminOut])
def list_usuarios(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador")),
) -> list[dict]:
    index = _persona_index(db)
    usuarios = db.query(Usuario).order_by(Usuario.id_usuario).all()
    return [_serialize(u, index) for u in usuarios]


@router.put("/{id_usuario}", response_model=UsuarioAdminOut)
def update_usuario(
    id_usuario: int,
    payload: UsuarioAdminUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_roles("Administrador")),
) -> dict:
    usuario = db.get(Usuario, id_usuario)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        )

    # No permitir modificar la propia cuenta: evita que un admin se quite el rol
    # o se desactive a si mismo y quede la institucion sin administradores.
    if usuario.id_usuario == current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No podes modificar tu propia cuenta desde este modulo",
        )

    data = payload.model_dump(exclude_unset=True)

    if data.get("id_rol") is not None:
        rol = db.get(Rol, data["id_rol"])
        if rol is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El rol indicado no existe",
            )
        # El rol esta atado al tipo de persona: no se puede convertir de tipo
        # desde aqui (se perderian los datos propios del tipo). Para cambiar el
        # tipo se elimina y se vuelve a crear a la persona en su modulo.
        if rol.name_rol != _rol_esperado(db, usuario):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "El rol debe coincidir con el tipo de persona. Para cambiar el "
                    "tipo, elimina y vuelve a crear a la persona en su modulo."
                ),
            )
        usuario.id_rol = rol.id_rol

    if data.get("activo") is not None:
        usuario.activo = data["activo"]

    db.commit()
    db.refresh(usuario)
    return _serialize(usuario, _persona_index(db))
