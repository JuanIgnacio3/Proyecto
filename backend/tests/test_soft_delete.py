"""Soft-delete: DELETE desactiva (activo=False) en vez de eliminar. El registro
desaparece de los listados pero permanece en la base de datos."""
from app.core.config import settings
from app.models.evaluacion import Evaluacion
from app.models.grupo import Grupo

API = settings.API_V1_PREFIX


def test_grupo_delete_es_soft(client, admin_headers, db_session, data):
    asignatura = data.grupo_prof.id_asignatura
    gid = client.post(
        f"{API}/grupos/",
        json={"name_grupo": "TMP-soft", "id_asignatura": asignatura},
        headers=admin_headers,
    ).json()["id_grupo"]

    assert client.delete(f"{API}/grupos/{gid}", headers=admin_headers).status_code == 204

    # ya no aparece en el listado...
    ids = {g["id_grupo"] for g in client.get(f"{API}/grupos/", headers=admin_headers).json()}
    assert gid not in ids
    # ...pero sigue en la BD, solo desactivado
    row = db_session.get(Grupo, gid)
    assert row is not None
    assert row.activo is False


def test_evaluacion_delete_es_soft(client, admin_headers, db_session, data):
    grupo = data.grupo_prof.id_grupo
    ev = client.post(
        f"{API}/evaluaciones/",
        json={
            "name_evaluacion": "TMP",
            "periodo": 1,
            "porcentaje": 10,
            "fecha": "2026-07-10",
            "id_grupo": grupo,
        },
        headers=admin_headers,
    ).json()["id_evaluacion"]

    assert client.delete(f"{API}/evaluaciones/{ev}", headers=admin_headers).status_code == 204

    ids = {e["id_evaluacion"] for e in client.get(f"{API}/evaluaciones/", headers=admin_headers).json()}
    assert ev not in ids
    row = db_session.get(Evaluacion, ev)
    assert row is not None
    assert row.activo is False
