from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import authz
from app.api.deps import require_roles
from app.db.session import get_db
from app.models.grupo import Grupo
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario
from app.schemas.catalogos import GrupoOut, TipoDocumentoOut

router = APIRouter()


@router.get("/tipos-documento", response_model=list[TipoDocumentoOut])
def list_tipos_documento(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor", "Administrativo")),
) -> list[TipoDocumento]:
    return db.query(TipoDocumento).order_by(TipoDocumento.id_tipo_documento).all()


@router.get("/grupos", response_model=list[GrupoOut])
def list_grupos(
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(
        authz.require(
            authz.Policy.GROUP,
            roles=("Administrador", "Profesor", "Administrativo"),
        )
    ),
) -> list[Grupo]:
    return (
        ctx.scope_grupos(db.query(Grupo))
        .filter(Grupo.activo.is_(True))
        .order_by(Grupo.id_grupo)
        .all()
    )
