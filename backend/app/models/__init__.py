from app.models.rol import Rol
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario
from app.models.asignatura import Asignatura
from app.models.grupo import Grupo
from app.models.estudiante import Estudiante
from app.models.profesor import Profesor
from app.models.profesor_asignatura_grupo import ProfesorAsignaturaGrupo
from app.models.encargado import Encargado
from app.models.encargado_estudiante import EncargadoEstudiante
from app.models.asistencia import Asistencia
from app.models.evaluacion import Evaluacion
from app.models.nota import Nota
from app.models.administrativo import Administrativo
from app.models.comunicado import Comunicado
from app.models.evento import Evento
from app.models.especialidad import Especialidad

__all__ = [
    "Rol",
    "TipoDocumento",
    "Usuario",
    "Asignatura",
    "Grupo",
    "Estudiante",
    "Profesor",
    "ProfesorAsignaturaGrupo",
    "Encargado",
    "EncargadoEstudiante",
    "Asistencia",
    "Evaluacion",
    "Nota",
    "Administrativo",
    "Comunicado",
    "Evento",
    "Especialidad",
]
