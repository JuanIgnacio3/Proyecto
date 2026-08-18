"""Grupos: se crean con grado y sin materia (la materia se asigna por profesor)."""
API = "/api/v1"


def test_crear_grupo_con_grado_sin_materia(client, data, admin_headers):
    resp = client.post(
        f"{API}/grupos/",
        headers=admin_headers,
        json={"name_grupo": "8-2", "grado": "8vo"},
    )
    assert resp.status_code == 201
    cuerpo = resp.json()
    assert cuerpo["grado"] == "8vo"
    assert cuerpo["id_asignatura"] is None
    assert cuerpo["asignatura"] is None


def test_editar_grado_de_grupo(client, data, admin_headers):
    resp = client.put(
        f"{API}/grupos/{data.grupo_prof.id_grupo}",
        headers=admin_headers,
        json={"grado": "7mo"},
    )
    assert resp.status_code == 200
    assert resp.json()["grado"] == "7mo"


def test_listar_estudiantes_por_grupo(client, data, admin_headers):
    resp = client.get(
        f"{API}/estudiantes/?id_grupo={data.grupo_prof.id_grupo}", headers=admin_headers
    )
    assert resp.status_code == 200
    ids = {e["id_estudiante"] for e in resp.json()}
    # Solo el estudiante del grupo del profesor, no los de otros grupos.
    assert ids == {data.est_prof.id_estudiante}
