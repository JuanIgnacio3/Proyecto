"""Conductual — cierre de los huecos de autorizacion (post Fase 9.1).

Congela: /profesores solo Admin/Administrativo; /encargados escopado al profesor;
/catalogos/grupos escopado; gating a staff de stats/catalogos/especialidades;
y que los no-staff solo ven eventos publicos.
"""
from app.core.config import settings

API = settings.API_V1_PREFIX


# --- /profesores: solo Admin/Administrativo ---
def test_profesores_admin_y_administrativo_ok(client, admin_headers, adminv_headers):
    assert client.get(f"{API}/profesores/", headers=admin_headers).status_code == 200
    assert client.get(f"{API}/profesores/", headers=adminv_headers).status_code == 200


def test_profesores_profesor_encargado_estudiante_403(client, prof_headers, enc_headers, est_headers):
    assert client.get(f"{API}/profesores/", headers=prof_headers).status_code == 403
    assert client.get(f"{API}/profesores/", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/profesores/", headers=est_headers).status_code == 403


# --- /encargados: profesor solo los de sus estudiantes ---
def test_encargados_admin_ve_todos(client, admin_headers, data):
    ids = {e["id_encargado"] for e in client.get(f"{API}/encargados/", headers=admin_headers).json()}
    assert {data.enc.id_encargado, data.enc_otro.id_encargado} <= ids


def test_encargados_profesor_scope(client, prof_headers, data):
    enc, enc_otro = data.enc.id_encargado, data.enc_otro.id_encargado
    r = client.get(f"{API}/encargados/", headers=prof_headers)
    assert r.status_code == 200
    ids = {e["id_encargado"] for e in r.json()}
    assert ids == {enc}  # solo el vinculado a su estudiante; enc_otro queda fuera


def test_encargados_profesor_get_propio_200_ajeno_403(client, prof_headers, data):
    assert client.get(f"{API}/encargados/{data.enc.id_encargado}", headers=prof_headers).status_code == 200
    assert client.get(f"{API}/encargados/{data.enc_otro.id_encargado}", headers=prof_headers).status_code == 403


def test_encargados_rbac(client, enc_headers, est_headers):
    assert client.get(f"{API}/encargados/", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/encargados/", headers=est_headers).status_code == 403


# --- /catalogos/grupos escopado + gating de catalogos ---
def test_catalogos_grupos_profesor_scope(client, prof_headers, data):
    r = client.get(f"{API}/catalogos/grupos", headers=prof_headers)
    assert r.status_code == 200
    assert {g["id_grupo"] for g in r.json()} == {data.grupo_prof.id_grupo}


def test_catalogos_grupos_admin_todos(client, admin_headers):
    assert len(client.get(f"{API}/catalogos/grupos", headers=admin_headers).json()) == 2


def test_catalogos_gating_no_staff(client, enc_headers, est_headers):
    for path in ("/catalogos/grupos", "/catalogos/tipos-documento"):
        assert client.get(f"{API}{path}", headers=enc_headers).status_code == 403
        assert client.get(f"{API}{path}", headers=est_headers).status_code == 403


# --- /stats/dashboard: solo staff ---
def test_stats_staff_ok_no_staff_403(client, admin_headers, prof_headers, enc_headers, est_headers):
    assert client.get(f"{API}/stats/dashboard", headers=admin_headers).status_code == 200
    assert client.get(f"{API}/stats/dashboard", headers=prof_headers).status_code == 200
    assert client.get(f"{API}/stats/dashboard", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/stats/dashboard", headers=est_headers).status_code == 403


# --- /especialidades: solo staff ---
def test_especialidades_gating(client, admin_headers, enc_headers, est_headers):
    assert client.get(f"{API}/especialidades/", headers=admin_headers).status_code == 200
    assert client.get(f"{API}/especialidades/", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/especialidades/", headers=est_headers).status_code == 403


# --- /eventos: no-staff solo eventos publicos ---
def test_eventos_no_staff_solo_publicos(client, admin_headers, est_headers):
    pub = {"titulo": "Publico", "fecha_inicio": "2026-07-10", "tipo": "Actividad", "es_publico": True}
    priv = {"titulo": "Privado", "fecha_inicio": "2026-07-11", "tipo": "Reunion", "es_publico": False}
    assert client.post(f"{API}/eventos/", json=pub, headers=admin_headers).status_code == 201
    assert client.post(f"{API}/eventos/", json=priv, headers=admin_headers).status_code == 201
    # staff ve ambos
    assert len(client.get(f"{API}/eventos/", headers=admin_headers).json()) == 2
    # estudiante (no-staff) solo el publico
    est_eventos = client.get(f"{API}/eventos/", headers=est_headers).json()
    assert [e["es_publico"] for e in est_eventos] == [True]
