"""Conductual — Reportes (Policy.STUDENT, roles=() : cualquier autenticado, con scope)."""
from app.core.config import settings

API = settings.API_V1_PREFIX


def _ids(resp):
    return {r["id_estudiante"] for r in resp.json()}


def test_admin_ve_todos(client, admin_headers, data):
    r = client.get(f"{API}/reportes/estudiantes-disponibles", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 3


def test_profesor_propio_scope_y_200(client, prof_headers, data):
    est_prof = data.est_prof.id_estudiante
    r = client.get(f"{API}/reportes/estudiantes-disponibles", headers=prof_headers)
    assert r.status_code == 200
    assert _ids(r) == {est_prof}
    assert client.get(f"{API}/reportes/estudiante/{est_prof}", headers=prof_headers).status_code == 200


def test_profesor_ajeno_403(client, prof_headers, data):
    est_otro = data.est_otro.id_estudiante
    assert client.get(f"{API}/reportes/estudiante/{est_otro}", headers=prof_headers).status_code == 403


def test_encargado_solo_vinculados(client, enc_headers, data):
    est_prof = data.est_prof.id_estudiante
    est_otro = data.est_otro.id_estudiante
    r = client.get(f"{API}/reportes/estudiantes-disponibles", headers=enc_headers)
    assert r.status_code == 200
    assert _ids(r) == {est_prof}
    assert client.get(f"{API}/reportes/estudiante/{est_prof}", headers=enc_headers).status_code == 200
    assert client.get(f"{API}/reportes/estudiante/{est_otro}", headers=enc_headers).status_code == 403


def test_estudiante_solo_si_mismo(client, est_headers, data):
    est_self = data.est_self.id_estudiante
    est_prof = data.est_prof.id_estudiante
    r = client.get(f"{API}/reportes/estudiantes-disponibles", headers=est_headers)
    assert r.status_code == 200
    assert _ids(r) == {est_self}
    assert client.get(f"{API}/reportes/estudiante/{est_self}", headers=est_headers).status_code == 200
    assert client.get(f"{API}/reportes/estudiante/{est_prof}", headers=est_headers).status_code == 403
