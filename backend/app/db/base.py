from app.db.base_class import Base
from app.models import (  # noqa: F401
    Administrativo,
    Asignatura,
    Asistencia,
    Encargado,
    EncargadoEstudiante,
    Estudiante,
    Evaluacion,
    Grupo,
    Nota,
    Profesor,
    Rol,
    SubGrupo,
    SubGrupoEstudiante,
    SubGrupoProfesor,
    TipoDocumento,
    Usuario,
)

__all__ = ["Base"]
