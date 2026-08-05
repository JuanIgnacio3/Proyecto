"""Infraestructura de pruebas (Fase 7.0).

Estrategia de aislamiento:
  - Base PostgreSQL **exclusiva para tests** (``tcu_test``), derivada de la URL de
    la app cambiando solo el nombre de la base. Se crea al inicio de la sesion y
    nunca toca la base de desarrollo (``tcu_db``).
  - Esquema creado una sola vez por sesion (drop_all + create_all).
  - **Aislamiento por test**: cada test corre dentro de una transaccion externa
    con SAVEPOINT (``join_transaction_mode="create_savepoint"``). Los ``commit``
    que hagan los endpoints liberan el savepoint y abren otro, manteniendo intacta
    la transaccion externa, que se revierte al terminar el test. Nada persiste
    entre tests -> cada uno arranca con la base vacia.
  - El dataset determinista se siembra por test (dentro de la transaccion que se
    revierte), de modo que todos los tests parten del mismo estado reproducible.

El ``TestClient`` inyecta la sesion del test sustituyendo la dependencia
``get_db``, por lo que la app y los tests comparten exactamente la misma sesion.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash
from app.db.base import Base  # importa todos los modelos -> metadata completa
from app.db.session import get_db
from app.main import app
from app.models.asignatura import Asignatura
from app.models.encargado import Encargado
from app.models.encargado_estudiante import EncargadoEstudiante
from app.models.estudiante import Estudiante
from app.models.grupo import Grupo
from app.models.profesor import Profesor
from app.models.rol import Rol
from app.models.subgrupo import SubGrupo
from app.models.subgrupo_profesor import SubGrupoProfesor
from app.models.tipo_documento import TipoDocumento
from app.models.usuario import Usuario

from fastapi.testclient import TestClient

TEST_DB_NAME = "tcu_test"
TEST_PASSWORD = "Test1234!"

BASE_ROLES = ["Administrador", "Profesor", "Estudiante", "Encargado", "Administrativo"]


def _test_database_url() -> str:
    """URL de la base de test: la de la app con el nombre cambiado a ``tcu_test``.
    Puede sobreescribirse por completo con la variable ``TEST_DATABASE_URL``."""
    override = os.getenv("TEST_DATABASE_URL")
    if override:
        return override
    # OJO: str(URL) enmascara la contrasena como "***" en SQLAlchemy 2.0; hay que
    # renderizarla con hide_password=False para no romper la autenticacion.
    return make_url(settings.DATABASE_URL).set(database=TEST_DB_NAME).render_as_string(
        hide_password=False
    )


def _ensure_test_database() -> None:
    """Crea la base ``tcu_test`` si no existe. Se conecta a la base de la app
    (``tcu_db``) en modo AUTOCOMMIT solo para ejecutar ``CREATE DATABASE``."""
    maintenance = create_engine(settings.DATABASE_URL, isolation_level="AUTOCOMMIT")
    try:
        with maintenance.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": TEST_DB_NAME},
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{TEST_DB_NAME}"'))
    finally:
        maintenance.dispose()


@pytest.fixture(scope="session")
def engine():
    """Motor contra la base de test, con el esquema recreado desde cero."""
    _ensure_test_database()
    eng = create_engine(_test_database_url(), pool_pre_ping=True)
    Base.metadata.drop_all(eng)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    eng.dispose()


@pytest.fixture
def db_session(engine):
    """Sesion aislada por test: transaccion externa + SAVEPOINT, revertida al final."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    """TestClient que usa la sesion del test (sustituye la dependencia get_db)."""

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Dataset determinista
# ---------------------------------------------------------------------------
@dataclass
class Dataset:
    """Referencias a las entidades sembradas. Los tests deben usar estos objetos
    (nunca ids hardcodeados: las secuencias de Postgres no se revierten)."""

    roles: dict[str, Rol]
    tipo_documento: TipoDocumento
    grupo_prof: Grupo  # grupo que imparte el profesor (via subgrupo)
    grupo_otro: Grupo  # grupo ajeno al profesor
    est_prof: Estudiante  # estudiante del grupo del profesor
    est_otro: Estudiante  # estudiante de un grupo ajeno
    est_self: Estudiante  # estudiante asociado al usuario con rol Estudiante
    prof: Profesor
    enc: Encargado
    subgrupo_prof: SubGrupo  # subgrupo del grupo del profesor (propio)
    subgrupo_otro: SubGrupo  # subgrupo de un grupo ajeno
    user_admin: Usuario
    user_prof: Usuario
    user_enc: Usuario
    user_est: Usuario
    user_adminv: Usuario


@pytest.fixture
def data(db_session) -> Dataset:
    """Siembra un dataset minimo y determinista que cubre los 5 roles y los
    escenarios de autorizacion (propio/ajeno/vinculado)."""
    s = db_session
    password = get_password_hash(TEST_PASSWORD)  # un solo hash reutilizado

    roles = {name: Rol(name_rol=name) for name in BASE_ROLES}
    s.add_all(roles.values())
    tipo = TipoDocumento(name_tipo_documento="Cedula de identidad")
    asignatura = Asignatura(name_asignatura="Matematicas")
    s.add_all([tipo, asignatura])
    s.flush()

    grupo_prof = Grupo(name_grupo="7-1", id_asignatura=asignatura.id_asignatura)
    grupo_otro = Grupo(name_grupo="7-2", id_asignatura=asignatura.id_asignatura)
    s.add_all([grupo_prof, grupo_otro])
    s.flush()

    def make_user(correo: str, rol: str) -> Usuario:
        user = Usuario(
            correo_institucional=correo,
            id_rol=roles[rol].id_rol,
            hashed_password=password,
            activo=True,
        )
        s.add(user)
        return user

    user_admin = make_user("admin@test.cr", "Administrador")
    user_prof = make_user("prof@test.cr", "Profesor")
    user_enc = make_user("enc@test.cr", "Encargado")
    user_est = make_user("est@test.cr", "Estudiante")
    user_adminv = make_user("adminv@test.cr", "Administrativo")
    # Usuarios propios de los estudiantes que no inician sesion en los tests
    # (el esquema exige id_usuario no nulo por estudiante).
    user_est_prof = make_user("est_prof@test.cr", "Estudiante")
    user_est_otro = make_user("est_otro@test.cr", "Estudiante")
    s.flush()

    # Profesor SIN grupo directo: se vincula por subgrupo (mismo patron real).
    prof = Profesor(
        id_usuario=user_prof.id_usuario,
        name_profesor="Prof",
        sec_name_profesor="Test",
        birthdate_profesor=date(1990, 1, 1),
        id_tipo_documento=tipo.id_tipo_documento,
        num_documento_profesor="P-0001",
        id_grupo=None,
    )
    s.add(prof)
    s.flush()

    def make_estudiante(user: Usuario, doc: str, grupo: Grupo) -> Estudiante:
        est = Estudiante(
            id_usuario=user.id_usuario,
            name_estudiante="Est",
            sec_name_estudiante=doc,
            birthdate_estudiante=date(2012, 1, 1),
            id_tipo_documento=tipo.id_tipo_documento,
            num_documento_estudiante=doc,
            id_grupo=grupo.id_grupo,
        )
        s.add(est)
        return est

    est_prof = make_estudiante(user_est_prof, "E-0001", grupo_prof)
    est_otro = make_estudiante(user_est_otro, "E-0002", grupo_otro)
    est_self = make_estudiante(user_est, "E-0003", grupo_otro)
    s.flush()

    subgrupo_prof = SubGrupo(name_subgrupo="Lab", tipo_subgrupo="Taller", id_grupo=grupo_prof.id_grupo)
    subgrupo_otro = SubGrupo(name_subgrupo="LabOtro", tipo_subgrupo="Taller", id_grupo=grupo_otro.id_grupo)
    s.add_all([subgrupo_prof, subgrupo_otro])
    s.flush()
    # El profesor imparte el subgrupo del grupo propio -> sus grupos = {grupo_prof}.
    s.add(SubGrupoProfesor(id_profesor=prof.id_profesor, id_subgrupo=subgrupo_prof.id_subgrupo))

    enc = Encargado(
        id_usuario=user_enc.id_usuario,
        name_encargado="Enc",
        sec_name_encargado="Test",
        id_tipo_documento=tipo.id_tipo_documento,
        num_documento_encargado="EN-0001",
        parentesco="Madre",
    )
    s.add(enc)
    s.flush()
    # El encargado esta vinculado solo a est_prof (ve exactamente a ese estudiante).
    s.add(EncargadoEstudiante(id_encargado=enc.id_encargado, id_estudiante=est_prof.id_estudiante))
    s.flush()

    return Dataset(
        roles=roles,
        tipo_documento=tipo,
        grupo_prof=grupo_prof,
        grupo_otro=grupo_otro,
        est_prof=est_prof,
        est_otro=est_otro,
        est_self=est_self,
        prof=prof,
        enc=enc,
        subgrupo_prof=subgrupo_prof,
        subgrupo_otro=subgrupo_otro,
        user_admin=user_admin,
        user_prof=user_prof,
        user_enc=user_enc,
        user_est=user_est,
        user_adminv=user_adminv,
    )


# ---------------------------------------------------------------------------
# Autenticacion: cabeceras Bearer por rol (token acunado directamente)
# ---------------------------------------------------------------------------
def auth_headers_for(user: Usuario) -> dict[str, str]:
    """Cabecera Authorization con un JWT valido para el usuario dado."""
    token = create_access_token(subject=str(user.id_usuario))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(data) -> dict[str, str]:
    return auth_headers_for(data.user_admin)


@pytest.fixture
def prof_headers(data) -> dict[str, str]:
    return auth_headers_for(data.user_prof)


@pytest.fixture
def enc_headers(data) -> dict[str, str]:
    return auth_headers_for(data.user_enc)


@pytest.fixture
def est_headers(data) -> dict[str, str]:
    return auth_headers_for(data.user_est)


@pytest.fixture
def adminv_headers(data) -> dict[str, str]:
    return auth_headers_for(data.user_adminv)
