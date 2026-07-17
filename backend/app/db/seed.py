from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.rol import Rol
from app.models.usuario import Usuario

BASE_ROLES = ["Administrador", "Profesor", "Estudiante", "Encargado"]
ADMIN_EMAIL = "admin@ctpsanpedrodebarva.ed.cr"
ADMIN_PASSWORD = "ChangeMe123!"


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
        print(f"Seed OK. Admin: {ADMIN_EMAIL} / password: {ADMIN_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
