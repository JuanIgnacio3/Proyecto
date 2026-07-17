from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.grupo import Grupo
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario
from app.schemas.catalogos import GrupoOut, TipoDocumentoOut

router = APIRouter()


@router.get("/tipos-documento", response_model=list[TipoDocumentoOut])
def list_tipos_documento(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[TipoDocumento]:
    return db.query(TipoDocumento).order_by(TipoDocumento.id_tipo_documento).all()


@router.get("/grupos", response_model=list[GrupoOut])
def list_grupos(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> list[Grupo]:
    return db.query(Grupo).order_by(Grupo.id_grupo).all()
