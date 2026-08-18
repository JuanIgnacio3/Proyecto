"""Reporte integrado: desglose por materia/periodo/rubro con nota ponderada
(Examen + Tarea + Asistencia con su %)."""
API = "/api/v1"


def test_reporte_integrado_por_rubro(client, data, admin_headers):
    # Clase: prof + grupo_prof + Matematicas, con asistencia = 20%.
    clase = client.post(
        f"{API}/asignaciones/",
        headers=admin_headers,
        json={
            "id_profesor": data.prof.id_profesor,
            "id_grupo": data.grupo_prof.id_grupo,
            "id_asignatura": data.grupo_prof.id_asignatura,
            "porcentaje_asistencia": 20,
        },
    ).json()
    cid = clase["id_profesor_asignatura_grupo"]
    est = data.est_prof.id_estudiante

    # Evaluaciones: Examen 50%, Tarea 30% (rubros).
    examen = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Examen 1", "tipo": "Examen", "periodo": 1,
            "porcentaje": 50, "fecha": None, "id_profesor_asignatura_grupo": cid,
        },
    ).json()
    tarea = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Tarea 1", "tipo": "Tarea", "periodo": 1,
            "porcentaje": 30, "fecha": None, "id_profesor_asignatura_grupo": cid,
        },
    ).json()

    # Notas: Examen 80, Tarea 90.
    client.put(
        f"{API}/evaluaciones/{examen['id_evaluacion']}/notas",
        headers=admin_headers,
        json={"registros": [{"id_estudiante": est, "valor": 80}]},
    )
    client.put(
        f"{API}/evaluaciones/{tarea['id_evaluacion']}/notas",
        headers=admin_headers,
        json={"registros": [{"id_estudiante": est, "valor": 90}]},
    )

    # Asistencia periodo 1: 3 Presente, 1 Ausente -> 75%.
    for i, estado in enumerate(["Presente", "Presente", "Presente", "Ausente"]):
        client.put(
            f"{API}/asistencia/",
            headers=admin_headers,
            json={
                "id_profesor_asignatura_grupo": cid, "periodo": 1,
                "fecha": f"2026-07-1{i}",
                "registros": [{"id_estudiante": est, "estado": estado, "observacion": None}],
            },
        )

    # Periodo 2: Examen 100% con nota 90 -> nota_periodo = 90 (sin asistencia).
    examen2 = client.post(
        f"{API}/evaluaciones/",
        headers=admin_headers,
        json={
            "name_evaluacion": "Examen 2", "tipo": "Examen", "periodo": 2,
            "porcentaje": 100, "fecha": None, "id_profesor_asignatura_grupo": cid,
        },
    ).json()
    client.put(
        f"{API}/evaluaciones/{examen2['id_evaluacion']}/notas",
        headers=admin_headers,
        json={"registros": [{"id_estudiante": est, "valor": 90}]},
    )

    rep = client.get(f"{API}/reportes/estudiante/{est}", headers=admin_headers).json()
    materia = next(m for m in rep["materias"] if m["id_clase"] == cid)
    assert materia["porcentaje_asistencia"] == 20

    per = next(p for p in materia["periodos"] if p["periodo"] == 1)
    rubros = {r["tipo"]: r for r in per["rubros"]}
    assert rubros["Examen"]["peso"] == 50
    assert rubros["Examen"]["contribucion"] == 40  # 80 * 50/100
    assert rubros["Tarea"]["contribucion"] == 27  # 90 * 30/100
    assert per["asistencia"]["peso"] == 20
    assert per["asistencia"]["porcentaje_presente"] == 75  # 3 de 4
    assert per["asistencia"]["contribucion"] == 15  # 75 * 20/100
    assert per["peso_total"] == 100  # 50 + 30 + 20
    assert per["nota_periodo"] == 82  # 40 + 27 + 15

    per2 = next(p for p in materia["periodos"] if p["periodo"] == 2)
    assert per2["nota_periodo"] == 90
    # Nota final: promedio de los dos periodos -> (82 + 90) / 2 = 86.
    assert materia["nota_final"] == 86
