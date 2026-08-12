"""Soft-delete + reactivacion: DELETE desactiva (activo=False), el registro
permanece en el listado con su estado, y puede volver a activarse."""
from app.core.config import settings
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.grupo import Grupo

API = settings.API_V1_PREFIX


def test_grupo_soft_delete_y_reactivar(client, admin_headers, db_session, data):
    asignatura = data.grupo_prof.id_asignatura
    gid = client.post(
        f"{API}/grupos/",
        json={"name_grupo": "TMP-soft", "id_asignatura": asignatura},
        headers=admin_headers,
    ).json()["id_grupo"]

    # DELETE = desactivar (no elimina)
    assert client.delete(f"{API}/grupos/{gid}", headers=admin_headers).status_code == 204
    db_session.expire_all()
    assert db_session.get(Grupo, gid).activo is False

    # sigue en el listado, ahora marcado activo=False
    estados = {g["id_grupo"]: g["activo"] for g in client.get(f"{API}/grupos/", headers=admin_headers).json()}
    assert estados.get(gid) is False

    # reactivar via PUT {activo: true}
    assert client.put(f"{API}/grupos/{gid}", json={"activo": True}, headers=admin_headers).status_code == 200
    db_session.expire_all()
    assert db_session.get(Grupo, gid).activo is True


def test_evaluacion_soft_delete_y_reactivar(client, admin_headers, db_session, data):
    grupo = data.grupo_prof.id_grupo
    ev = client.post(
        f"{API}/evaluaciones/",
        json={"name_evaluacion": "TMP", "periodo": 1, "porcentaje": 10, "fecha": "2026-07-10", "id_grupo": grupo},
        headers=admin_headers,
    ).json()["id_evaluacion"]

    assert client.delete(f"{API}/evaluaciones/{ev}", headers=admin_headers).status_code == 204
    db_session.expire_all()
    assert db_session.get(Evaluacion, ev).activo is False

    assert client.put(f"{API}/evaluaciones/{ev}", json={"activo": True}, headers=admin_headers).status_code == 200
    db_session.expire_all()
    assert db_session.get(Evaluacion, ev).activo is True


def test_estudiante_desactivar_y_activar(client, admin_headers, db_session, data):
    est = data.est_prof.id_estudiante
    assert db_session.get(Estudiante, est).usuario.activo is True

    # DELETE = desactivar el usuario
    assert client.delete(f"{API}/estudiantes/{est}", headers=admin_headers).status_code == 204
    db_session.expire_all()
    assert db_session.get(Estudiante, est).usuario.activo is False

    # POST /activar = reactivar el usuario
    assert client.post(f"{API}/estudiantes/{est}/activar", headers=admin_headers).status_code == 204
    db_session.expire_all()
    assert db_session.get(Estudiante, est).usuario.activo is True
