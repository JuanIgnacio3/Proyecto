"""Conductual — Subgrupos (list/get: Policy.GROUP, roles=Admin/Profesor;
escrituras: RBAC solo Administrador). Verifica que la fuga de GET /{id} sigue cerrada."""
from app.core.config import settings

API = settings.API_V1_PREFIX


def test_admin_list_y_get(client, admin_headers, data):
    propio = data.subgrupo_prof.id_subgrupo
    ajeno = data.subgrupo_otro.id_subgrupo
    r = client.get(f"{API}/subgrupos/", headers=admin_headers)
    assert r.status_code == 200
    assert len(r.json()) == 2
    assert client.get(f"{API}/subgrupos/{propio}", headers=admin_headers).status_code == 200
    assert client.get(f"{API}/subgrupos/{ajeno}", headers=admin_headers).status_code == 200


def test_profesor_list_scope(client, prof_headers, data):
    propio = data.subgrupo_prof.id_subgrupo
    r = client.get(f"{API}/subgrupos/", headers=prof_headers)
    assert r.status_code == 200
    assert {s["id_subgrupo"] for s in r.json()} == {propio}


def test_profesor_get_propio_200(client, prof_headers, data):
    assert client.get(f"{API}/subgrupos/{data.subgrupo_prof.id_subgrupo}", headers=prof_headers).status_code == 200


def test_profesor_get_ajeno_403(client, prof_headers, data):
    # Fuga corregida en Fase 6: un subgrupo de otro grupo no debe ser visible.
    assert client.get(f"{API}/subgrupos/{data.subgrupo_otro.id_subgrupo}", headers=prof_headers).status_code == 403


def test_profesor_get_inexistente_404(client, prof_headers):
    assert client.get(f"{API}/subgrupos/999999", headers=prof_headers).status_code == 404


def test_fuga_permanece_cerrada_con_subgrupo_temporal(client, admin_headers, prof_headers, data):
    grupo_ajeno = data.grupo_otro.id_grupo
    # admin crea un subgrupo temporal en un grupo ajeno al profesor
    creado = client.post(
        f"{API}/subgrupos/",
        json={"name_subgrupo": "TMP-ajeno", "tipo_subgrupo": "Taller",
              "id_grupo": grupo_ajeno, "profesores_ids": [], "estudiantes_ids": []},
        headers=admin_headers,
    )
    assert creado.status_code == 201
    sid = creado.json()["id_subgrupo"]
    # el profesor NO puede leerlo -> 403 (la fuga permanece cerrada)
    assert client.get(f"{API}/subgrupos/{sid}", headers=prof_headers).status_code == 403


def test_rbac_encargado_y_estudiante_403(client, enc_headers, est_headers):
    assert client.get(f"{API}/subgrupos/", headers=enc_headers).status_code == 403
    assert client.get(f"{API}/subgrupos/", headers=est_headers).status_code == 403
