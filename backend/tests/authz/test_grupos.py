"""Conductual — Grupos (list: Policy.GROUP, roles=Admin/Profesor/Administrativo;
escrituras: RBAC solo Administrador)."""
from app.core.config import settings

API = settings.API_V1_PREFIX


def test_admin_list_todos(client, admin_headers, data):
    r = client.get(f"{API}/grupos/", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_profesor_list_scope(client, prof_headers, data):
    grupo = data.grupo_prof.id_grupo
    r = client.get(f"{API}/grupos/", headers=prof_headers)
    assert r.status_code == 200
    assert {g["id_grupo"] for g in r.json()} == {grupo}


def test_administrativo_ve_todos(client, adminv_headers, data):
    r = client.get(f"{API}/grupos/", headers=adminv_headers)
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_rbac_encargado_y_estudiante_403(client, enc_headers, est_headers):
    assert client.get(f"{API}/grupos/", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/grupos/", headers=est_headers).status_code == 403


def test_escritura_solo_admin(client, admin_headers, prof_headers, data):
    asignatura = data.grupo_prof.id_asignatura
    payload = {"name_grupo": "TMP-grupo", "id_asignatura": asignatura}
    # profesor no puede crear (RBAC admin-only)
    assert client.post(f"{API}/grupos/", json=payload, headers=prof_headers).status_code == 403
    # admin si (se revierte por el rollback del test)
    assert client.post(f"{API}/grupos/", json=payload, headers=admin_headers).status_code == 201
