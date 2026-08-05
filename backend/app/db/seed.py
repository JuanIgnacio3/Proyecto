import logging
import os

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.asignatura import Asignatura
from app.models.grupo import Grupo
from app.models.rol import Rol
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario

logger = logging.getLogger("app.seed")

BASE_ROLES = ["Administrador", "Profesor", "Estudiante", "Encargado", "Administrativo"]
BASE_TIPOS_DOCUMENTO = ["Cedula de identidad", "DIMEX", "Cedula de residencia", "Pasaporte"]

# Credenciales del administrador inicial. Configurables por entorno para no
# incrustar contrasenas en el codigo: en produccion defina SEED_ADMIN_EMAIL y
# SEED_ADMIN_PASSWORD antes de ejecutar el seed.
ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@ctpsanpedrodebarva.ed.cr")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "ChangeMe123!")


def seed() -> None:
    db = SessionLocal()
    try:
        roles_by_name = {}
        for name in BASE_ROLES:
            rol = db.query(Rol).filter(Rol.name_rol == name).first()
            if rol is None:
                rol = Rol(name_rol=name)
                db.add(rol)
                db.flush()
            roles_by_name[name] = rol

        for name in BASE_TIPOS_DOCUMENTO:
            tipo = db.query(TipoDocumento).filter(TipoDocumento.name_tipo_documento == name).first()
            if tipo is None:
                db.add(TipoDocumento(name_tipo_documento=name))

        asignatura = db.query(Asignatura).filter(Asignatura.name_asignatura == "Matematicas").first()
        if asignatura is None:
            asignatura = Asignatura(name_asignatura="Matematicas")
            db.add(asignatura)
            db.flush()

        grupo = db.query(Grupo).filter(Grupo.name_grupo == "7-1").first()
        if grupo is None:
            db.add(Grupo(name_grupo="7-1", id_asignatura=asignatura.id_asignatura))

        admin = (
            db.query(Usuario).filter(Usuario.correo_institucional == ADMIN_EMAIL).first()
        )
        if admin is None:
            admin = Usuario(
                correo_institucional=ADMIN_EMAIL,
                id_rol=roles_by_name["Administrador"].id_rol,
                hashed_password=get_password_hash(ADMIN_PASSWORD),
                activo=True,
            )
            db.add(admin)

        db.commit()
        logger.info("Seed completado. Administrador inicial: %s", ADMIN_EMAIL)
        if ADMIN_PASSWORD == "ChangeMe123!":
            logger.warning(
                "El administrador usa la contrasena por defecto. Cambiela de "
                "inmediato o defina SEED_ADMIN_PASSWORD antes del seed."
            )
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
    seed()
