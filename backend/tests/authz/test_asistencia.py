"""Conductual — Asistencia (Policy.GROUP, roles=Admin/Profesor).
Incluye la verificacion del bug corregido: PUT devuelve 200 y persiste."""
from app.core.config import settings

API = settings.API_V1_PREFIX
FECHA = "2026-07-10"


def _roster(client, headers, grupo):
    return client.get(f"{API}/asistencia/", params={"id_grupo": grupo, "fecha": FECHA}, headers=headers)


def test_admin_get_200(client, admin_headers, data):
    assert _roster(client, admin_headers, data.grupo_prof.id_grupo).status_code == 200


def test_admin_put_200_y_persiste(client, admin_headers, data):
    grupo = data.grupo_prof.id_grupo
    est = data.est_prof.id_estudiante
    payload = {"id_grupo": grupo, "fecha": FECHA,
               "registros": [{"id_estudiante": est, "estado": "Presente", "observacion": None}]}
    r = client.put(f"{API}/asistencia/", json=payload, headers=admin_headers)
    assert r.status_code == 200
    # persistencia: al releer, el estado guardado esta presente
    reg = {x["id_estudiante"]: x["estado"] for x in _roster(client, admin_headers, grupo).json()["registros"]}
    assert reg[est] == "Presente"


def test_profesor_grupo_propio_200(client, prof_headers, data):
    grupo = data.grupo_prof.id_grupo
    est = data.est_prof.id_estudiante
    assert _roster(client, prof_headers, grupo).status_code == 200
    payload = {"id_grupo": grupo, "fecha": FECHA,
               "registros": [{"id_estudiante": est, "estado": "Ausente", "observacion": None}]}
    assert client.put(f"{API}/asistencia/", json=payload, headers=prof_headers).status_code == 200


def test_profesor_grupo_ajeno_403(client, prof_headers, data):
    grupo = data.grupo_otro.id_grupo
    assert _roster(client, prof_headers, grupo).status_code == 403
    payload = {"id_grupo": grupo, "fecha": FECHA, "registros": []}
    assert client.put(f"{API}/asistencia/", json=payload, headers=prof_headers).status_code == 403


def test_rbac_encargado_y_estudiante_403(client, enc_headers, est_headers, data):
    grupo = data.grupo_prof.id_grupo
    assert _roster(client, enc_headers, grupo).status_code == 403
    assert _roster(client, est_headers, grupo).status_code == 403
