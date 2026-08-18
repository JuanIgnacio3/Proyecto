from app.db.base_class import Base
from app.models import (  # noqa: F401
    Administrativo,
    Asignatura,
    Asistencia,
    Comunicado,
    Encargado,
    Especialidad,
    Evento,
    EncargadoEstudiante,
    Estudiante,
    Evaluacion,
    Grupo,
    Nota,
    Profesor,
    ProfesorAsignaturaGrupo,
    Rol,
    TipoDocumento,
    Usuario,
)

__all__ = ["Base"]
