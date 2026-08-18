"""Asignaciones profesor-materia por grupo (Fase 1 del remodelado de grupos)."""


def _crear(client, headers, id_profesor, id_grupo, id_asignatura):
    return client.post(
        "/api/v1/asignaciones/",
        headers=headers,
        json={
            "id_profesor": id_profesor,
            "id_grupo": id_grupo,
            "id_asignatura": id_asignatura,
        },
    )


def test_admin_crea_y_lista_asignacion(client, data, admin_headers):
    resp = _crear(
        client, admin_headers,
        data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura,
    )
    assert resp.status_code == 201
    cuerpo = resp.json()
    assert cuerpo["activo"] is True
    assert cuerpo["profesor"]["id_profesor"] == data.prof.id_profesor
    assert cuerpo["asignatura"]["id_asignatura"] == data.grupo_prof.id_asignatura

    listado = client.get(
        f"/api/v1/asignaciones/?id_grupo={data.grupo_prof.id_grupo}",
        headers=admin_headers,
    )
    assert listado.status_code == 200
    ids = {a["id_profesor_asignatura_grupo"] for a in listado.json()}
    assert cuerpo["id_profesor_asignatura_grupo"] in ids


def test_no_duplica_asignacion_activa(client, data, admin_headers):
    _crear(client, admin_headers, data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura)
    dup = _crear(client, admin_headers, data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura)
    assert dup.status_code == 409


def test_desactivar_y_reactivar_asignacion(client, data, admin_headers):
    creada = _crear(
        client, admin_headers,
        data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura,
    ).json()
    pag_id = creada["id_profesor_asignatura_grupo"]

    baja = client.delete(f"/api/v1/asignaciones/{pag_id}", headers=admin_headers)
    assert baja.status_code == 204

    # Sigue en la lista pero inactiva.
    listado = client.get(
        f"/api/v1/asignaciones/?id_grupo={data.grupo_prof.id_grupo}", headers=admin_headers
    ).json()
    la = next(a for a in listado if a["id_profesor_asignatura_grupo"] == pag_id)
    assert la["activo"] is False

    # Recrear la misma terna la reactiva en vez de duplicar.
    recreada = _crear(
        client, admin_headers,
        data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura,
    )
    assert recreada.status_code == 201
    assert recreada.json()["activo"] is True
    assert recreada.json()["id_profesor_asignatura_grupo"] == pag_id


def test_varias_materias_por_grupo(client, data, admin_headers):
    otra = client.post(
        "/api/v1/asignaturas/", headers=admin_headers, json={"name_asignatura": "Ciencias"}
    ).json()

    _crear(client, admin_headers, data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura)
    _crear(client, admin_headers, data.prof.id_profesor, data.grupo_prof.id_grupo, otra["id_asignatura"])

    listado = client.get(
        f"/api/v1/asignaciones/?id_grupo={data.grupo_prof.id_grupo}", headers=admin_headers
    ).json()
    materias = {a["id_asignatura"] for a in listado}
    # Las dos materias recien asignadas estan presentes (ademas de la del dataset).
    assert data.grupo_prof.id_asignatura in materias
    assert otra["id_asignatura"] in materias


def test_no_admin_no_puede_crear(client, data, prof_headers):
    resp = _crear(
        client, prof_headers,
        data.prof.id_profesor, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura,
    )
    assert resp.status_code == 403


def test_profesor_puede_listar(client, data, prof_headers):
    resp = client.get("/api/v1/asignaciones/", headers=prof_headers)
    assert resp.status_code == 200


def test_referencia_invalida_devuelve_400(client, data, admin_headers):
    resp = _crear(client, admin_headers, 999999, data.grupo_prof.id_grupo, data.grupo_prof.id_asignatura)
    assert resp.status_code == 400
