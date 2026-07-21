from app.db.base_class import Base
from app.models import (  # noqa: F401
    Asignatura,
    Asistencia,
    Encargado,
    EncargadoEstudiante,
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
