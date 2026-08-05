"""Conductual — Estudiantes (Policy.STUDENT, roles=Admin/Profesor/Administrativo)."""
from app.core.config import settings

API = settings.API_V1_PREFIX


def test_admin_list_todos(client, admin_headers, data):
    r = client.get(f"{API}/estudiantes/", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 3


def test_admin_get_200(client, admin_headers, data):
    est = data.est_prof.id_estudiante
    assert client.get(f"{API}/estudiantes/{est}", headers=admin_headers).status_code == 200


def test_profesor_list_scope(client, prof_headers, data):
    est_prof = data.est_prof.id_estudiante
    r = client.get(f"{API}/estudiantes/", headers=prof_headers)
    assert r.status_code == 200
    assert {e["id_estudiante"] for e in r.json()} == {est_prof}


def test_profesor_get_propio_200(client, prof_headers, data):
    assert client.get(f"{API}/estudiantes/{data.est_prof.id_estudiante}", headers=prof_headers).status_code == 200


def test_profesor_get_ajeno_403(client, prof_headers, data):
    assert client.get(f"{API}/estudiantes/{data.est_otro.id_estudiante}", headers=prof_headers).status_code == 403


def test_rbac_encargado_403(client, enc_headers):
    assert client.get(f"{API}/estudiantes/", headers=enc_headers).status_code == 403


def test_rbac_estudiante_403(client, est_headers):
    assert client.get(f"{API}/estudiantes/", headers=est_headers).status_code == 403
