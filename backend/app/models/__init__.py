from app.models.rol import Rol
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario
from app.models.asignatura import Asignatura
from app.models.grupo import Grupo
from app.models.estudiante import Estudiante
from app.models.profesor import Profesor
from app.models.subgrupo import SubGrupo
from app.models.subgrupo_profesor import SubGrupoProfesor
from app.models.subgrupo_estudiante import SubGrupoEstudiante
from app.models.encargado import Encargado
from app.models.encargado_estudiante import EncargadoEstudiante
from app.models.asistencia import Asistencia
from app.models.evaluacion import Evaluacion
from app.models.nota import Nota
from app.models.administrativo import Administrativo
from app.models.comunicado import Comunicado

__all__ = [
    "Rol",
    "TipoDocumento",
    "Usuario",
    "Asignatura",
    "Grupo",
    "Estudiante",
    "Profesor",
    "SubGrupo",
    "SubGrupoProfesor",
    "SubGrupoEstudiante",
    "Encargado",
    "EncargadoEstudiante",
    "Asistencia",
    "Evaluacion",
    "Nota",
    "Administrativo",
    "Comunicado",
]
