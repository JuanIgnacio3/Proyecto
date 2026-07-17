from app.db.base_class import Base
from app.models import (  # noqa: F401
    Asignatura,
    Estudiante,
    Grupo,
    Profesor,
    Rol,
    SubGrupo,
    SubGrupoEstudiante,
    SubGrupoProfesor,
    TipoDocumento,
    Usuario,
)

__all__ = ["Base"]
