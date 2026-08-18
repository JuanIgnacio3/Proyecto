"""Fase 2: la evaluacion puede colgar de una asignacion profesor+materia.

El grupo se deriva de la asignacion y queda poblado (compatibilidad con el
scoping por grupo existente). La via legacy por id_grupo sigue funcionando.
"""
API = "/api/v1"


def _crear_asignacion(client, headers, data):
    return client.post(
        f"{API}/asignaciones/",
        headers=headers,
        json={
            "id_profesor": data.prof.id_profesor,
            "id_grupo": data.grupo_prof.id_grupo,
            "id_asignatura": data.grupo_prof.id_asignatura,
        },
    ).json()


def test_crear_evaluacion_desde_asignacion(client, data, admin_headers):
    asig = _crear_asignacion(client, admin_headers, data)

    resp = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Examen 1",
            "periodo": 1,
            "porcentaje": 25,
            "fecha": "2026-07-10",
            "id_profesor_asignatura_grupo": asig["id_profesor_asignatura_grupo"],
        },
    )
    assert resp.status_code == 201
    cuerpo = resp.json()
    # El grupo se derivo de la asignacion.
    assert cuerpo["id_grupo"] == data.grupo_prof.id_grupo
    assert cuerpo["id_profesor_asignatura_grupo"] == asig["id_profesor_asignatura_grupo"]
    # La evaluacion expone profesor + materia de la asignacion.
    assert cuerpo["asignacion"]["profesor"]["id_profesor"] == data.prof.id_profesor
    assert cuerpo["asignacion"]["asignatura"]["id_asignatura"] == data.grupo_prof.id_asignatura


def test_listar_evaluaciones_por_clase(client, data, admin_headers):
    # Clase A: prof + grupo_prof + materia base (Matematicas).
    asig = _crear_asignacion(client, admin_headers, data)
    ev = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Parcial",
            "periodo": 1,
            "porcentaje": 15,
            "fecha": None,
            "id_profesor_asignatura_grupo": asig["id_profesor_asignatura_grupo"],
        },
    ).json()

    # Listar por la clase A: incluye la evaluacion.
    en_clase = client.get(
        f"{API}/evaluaciones/?id_profesor_asignatura_grupo={asig['id_profesor_asignatura_grupo']}",
        headers=admin_headers,
    ).json()
    assert ev["id_evaluacion"] in {e["id_evaluacion"] for e in en_clase}

    # Clase B (asignacion del dataset, otra materia en el MISMO grupo): no la incluye.
    otra_clase = client.get(
        f"{API}/evaluaciones/?id_profesor_asignatura_grupo={data.asignacion_prof.id_profesor_asignatura_grupo}",
        headers=admin_headers,
    ).json()
    assert ev["id_evaluacion"] not in {e["id_evaluacion"] for e in otra_clase}


def test_crear_evaluacion_legacy_por_grupo_sigue_funcionando(client, data, admin_headers):
    resp = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Examen legacy",
            "periodo": 1,
            "porcentaje": 20,
            "fecha": "2026-07-10",
            "id_grupo": data.grupo_prof.id_grupo,
        },
    )
    assert resp.status_code == 201
    assert resp.json()["id_grupo"] == data.grupo_prof.id_grupo
    assert resp.json()["id_profesor_asignatura_grupo"] is None
    assert resp.json()["asignacion"] is None


def test_evaluacion_sin_grupo_ni_asignacion_es_422(client, data, admin_headers):
    resp = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={"name_evaluacion": "X", "periodo": 1, "porcentaje": 10, "fecha": None},
    )
    assert resp.status_code == 422


def test_asignacion_inexistente_es_400(client, data, admin_headers):
    resp = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "X",
            "periodo": 1,
            "porcentaje": 10,
            "fecha": None,
            "id_profesor_asignatura_grupo": 999999,
        },
    )
    assert resp.status_code == 400
