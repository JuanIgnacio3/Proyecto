"""Conductual — Evaluaciones y Notas (Policy.GROUP, roles=Admin/Profesor).
Incluye la verificacion del bug corregido: PUT notas devuelve 200 y persiste."""
from app.core.config import settings

API = settings.API_V1_PREFIX
FECHA = "2026-07-10"


def _eval_payload(grupo_id, name="P1"):
    return {"name_evaluacion": name, "periodo": 1, "porcentaje": 20, "fecha": FECHA, "id_grupo": grupo_id}


def test_admin_ciclo_completo(client, admin_headers, data):
    grupo = data.grupo_prof.id_grupo
    est = data.est_prof.id_estudiante

    creada = client.post(f"{API}/evaluaciones/", json=_eval_payload(grupo), headers=admin_headers)
    assert creada.status_code == 201
    ev = creada.json()["id_evaluacion"]

    listado = client.get(f"{API}/evaluaciones/", headers=admin_headers)
    assert listado.status_code == 200
    assert any(e["id_evaluacion"] == ev for e in listado.json())

    assert client.put(f"{API}/evaluaciones/{ev}", json={"porcentaje": 25}, headers=admin_headers).status_code == 200
    assert client.get(f"{API}/evaluaciones/{ev}/notas", headers=admin_headers).status_code == 200
    assert client.put(f"{API}/evaluaciones/{ev}/notas",
                      json={"registros": [{"id_estudiante": est, "valor": 80}]},
                      headers=admin_headers).status_code == 200
    assert client.delete(f"{API}/evaluaciones/{ev}", headers=admin_headers).status_code == 204


def test_profesor_grupo_propio(client, prof_headers, data):
    grupo = data.grupo_prof.id_grupo
    est = data.est_prof.id_estudiante

    creada = client.post(f"{API}/evaluaciones/", json=_eval_payload(grupo, "Propia"), headers=prof_headers)
    assert creada.status_code == 201
    ev = creada.json()["id_evaluacion"]

    ids = {e["id_evaluacion"] for e in client.get(f"{API}/evaluaciones/", headers=prof_headers).json()}
    assert ids == {ev}  # scope: solo la del grupo propio

    assert client.get(f"{API}/evaluaciones/{ev}/notas", headers=prof_headers).status_code == 200
    assert client.put(f"{API}/evaluaciones/{ev}/notas",
                      json={"registros": [{"id_estudiante": est, "valor": 70}]},
                      headers=prof_headers).status_code == 200
    assert client.put(f"{API}/evaluaciones/{ev}", json={"porcentaje": 15}, headers=prof_headers).status_code == 200
    assert client.delete(f"{API}/evaluaciones/{ev}", headers=prof_headers).status_code == 204


def test_profesor_grupo_ajeno_403(client, admin_headers, prof_headers, data):
    grupo_otro = data.grupo_otro.id_grupo
    # admin crea una evaluacion en un grupo ajeno al profesor
    ev = client.post(f"{API}/evaluaciones/", json=_eval_payload(grupo_otro, "Ajena"), headers=admin_headers).json()["id_evaluacion"]

    assert client.post(f"{API}/evaluaciones/", json=_eval_payload(grupo_otro, "X"), headers=prof_headers).status_code == 403
    assert client.put(f"{API}/evaluaciones/{ev}", json={"porcentaje": 99}, headers=prof_headers).status_code == 403
    assert client.delete(f"{API}/evaluaciones/{ev}", headers=prof_headers).status_code == 403
    assert client.get(f"{API}/evaluaciones/{ev}/notas", headers=prof_headers).status_code == 403
    assert client.put(f"{API}/evaluaciones/{ev}/notas", json={"registros": []}, headers=prof_headers).status_code == 403


def test_rbac_encargado_y_estudiante_403(client, enc_headers, est_headers):
    assert client.get(f"{API}/evaluaciones/", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/evaluaciones/", headers=est_headers).status_code == 403


def test_bug_save_notas_200_y_persiste(client, admin_headers, data):
    grupo = data.grupo_prof.id_grupo
    est = data.est_prof.id_estudiante
    ev = client.post(f"{API}/evaluaciones/", json=_eval_payload(grupo), headers=admin_headers).json()["id_evaluacion"]

    r = client.put(f"{API}/evaluaciones/{ev}/notas",
                   json={"registros": [{"id_estudiante": est, "valor": 85}]},
                   headers=admin_headers)
    assert r.status_code == 200
    notas = {x["id_estudiante"]: x["valor"] for x in client.get(f"{API}/evaluaciones/{ev}/notas", headers=admin_headers).json()["registros"]}
    assert notas[est] == 85
