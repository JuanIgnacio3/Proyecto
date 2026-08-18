"""Un usuario desactivado desaparece de los desplegables/consumidores (activo=true),
pero sigue visible en la vista de gestion (sin filtro)."""
API = "/api/v1"


def test_estudiante_desactivado_se_filtra_en_activos(client, data, admin_headers, db_session):
    data.est_prof.usuario.activo = False
    db_session.commit()
    db_session.expire_all()

    todos = client.get(f"{API}/estudiantes/", headers=admin_headers).json()
    assert data.est_prof.id_estudiante in {e["id_estudiante"] for e in todos}

    activos = client.get(f"{API}/estudiantes/?activo=true", headers=admin_headers).json()
    assert data.est_prof.id_estudiante not in {e["id_estudiante"] for e in activos}


def test_profesor_desactivado_se_filtra_en_activos(client, data, admin_headers, db_session):
    data.prof.usuario.activo = False
    db_session.commit()
    db_session.expire_all()

    todos = client.get(f"{API}/profesores/", headers=admin_headers).json()
    assert data.prof.id_profesor in {p["id_profesor"] for p in todos}

    activos = client.get(f"{API}/profesores/?activo=true", headers=admin_headers).json()
    assert data.prof.id_profesor not in {p["id_profesor"] for p in activos}


def test_materia_inactiva_se_filtra_y_no_se_asigna(client, data, admin_headers):
    otra = client.post(
        f"{API}/asignaturas/", headers=admin_headers, json={"name_asignatura": "Filosofia"}
    ).json()
    client.delete(f"{API}/asignaturas/{otra['id_asignatura']}", headers=admin_headers)

    activas = client.get(f"{API}/asignaturas/?activo=true", headers=admin_headers).json()
    assert otra["id_asignatura"] not in {a["id_asignatura"] for a in activas}
    # La gestion sigue viendola (sin filtro).
    todas = client.get(f"{API}/asignaturas/", headers=admin_headers).json()
    assert otra["id_asignatura"] in {a["id_asignatura"] for a in todas}

    # No se puede asignar una materia inactiva a un grupo.
    resp = client.post(
        f"{API}/asignaciones/",
        headers=admin_headers,
        json={
            "id_profesor": data.prof.id_profesor,
            "id_grupo": data.grupo_prof.id_grupo,
            "id_asignatura": otra["id_asignatura"],
        },
    )
    assert resp.status_code == 400


def test_estudiante_desactivado_no_entra_al_roster_de_notas(client, data, admin_headers, db_session):
    # Evaluacion del grupo del estudiante desactivado.
    ev = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Q1",
            "periodo": 1,
            "porcentaje": 10,
            "fecha": None,
            "id_grupo": data.grupo_prof.id_grupo,
        },
    ).json()

    data.est_prof.usuario.activo = False
    db_session.commit()
    db_session.expire_all()

    roster = client.get(
        f"{API}/evaluaciones/{ev['id_evaluacion']}/notas", headers=admin_headers
    ).json()
    ids = {r["id_estudiante"] for r in roster["registros"]}
    assert data.est_prof.id_estudiante not in ids
