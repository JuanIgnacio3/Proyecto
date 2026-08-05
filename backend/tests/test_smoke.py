"""Pruebas triviales que validan la infraestructura de la Fase 7.0:
salud de la app, aislamiento entre tests, dataset determinista y la cadena
completa de autenticacion (login + token Bearer)."""
from app.models.rol import Rol
from tests.conftest import TEST_PASSWORD


def test_health(client):
    """La app responde y el TestClient funciona."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# --- Aislamiento entre tests -------------------------------------------------
# Estos dos tests prueban que lo escrito en uno NO se filtra al otro: cada test
# arranca con la tabla vacia. Si el rollback por test fallara, el segundo veria
# la fila del primero.
def test_aislamiento_1(db_session):
    assert db_session.query(Rol).count() == 0
    db_session.add(Rol(name_rol="MARCADOR_AISLAMIENTO"))
    db_session.flush()
    assert db_session.query(Rol).count() == 1


def test_aislamiento_2(db_session):
    # Si el test anterior no se hubiera revertido, aqui habria 1 (o 5 con `data`).
    assert db_session.query(Rol).count() == 0


# --- Dataset determinista ----------------------------------------------------
def test_dataset_determinista(data, db_session):
    """El dataset sembrado tiene exactamente las entidades esperadas."""
    from app.models.encargado import Encargado
    from app.models.estudiante import Estudiante
    from app.models.grupo import Grupo
    from app.models.profesor import Profesor
    from app.models.subgrupo import SubGrupo
    from app.models.usuario import Usuario

    assert db_session.query(Rol).count() == 5
    assert db_session.query(Usuario).count() == 7  # 5 roles login + 2 estudiantes
    assert db_session.query(Estudiante).count() == 3
    assert db_session.query(Grupo).count() == 2
    assert db_session.query(Profesor).count() == 1
    assert db_session.query(Encargado).count() == 1
    assert db_session.query(SubGrupo).count() == 2
    # El profesor imparte el grupo propio via subgrupo (id_grupo directo None).
    assert data.prof.id_grupo is None
    assert data.subgrupo_prof.id_grupo == data.grupo_prof.id_grupo
    # El encargado esta vinculado exactamente a est_prof.
    assert [e.id_estudiante for e in data.enc.estudiantes] == [data.est_prof.id_estudiante]


# --- Cadena de autenticacion -------------------------------------------------
def test_login_devuelve_token(client, data):
    """El endpoint de login valida la contrasena y devuelve un token."""
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": data.user_admin.correo_institucional, "password": TEST_PASSWORD},
    )
    assert resp.status_code == 200
    assert resp.json()["access_token"]


def test_token_bearer_end_to_end(client, admin_headers, data):
    """Un token acunado por el fixture autentica y llega hasta la autorizacion:
    el administrador ve los 3 estudiantes del dataset."""
    resp = client.get("/api/v1/estudiantes/", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 3
