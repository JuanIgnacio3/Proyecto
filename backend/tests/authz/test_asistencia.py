"""Conductual — Asistencia (Policy.GROUP, roles=Admin/Profesor).

La asistencia se toma por CLASE (asignacion profesor+materia+grupo). El grupo se
deriva de la clase, y el scope del profesor se valida contra ese grupo.
"""
from app.core.config import settings

API = settings.API_V1_PREFIX
FECHA = "2026-07-10"
PERIODO = 1


def _roster(client, headers, clase):
    return client.get(
        f"{API}/asistencia/",
        params={"id_profesor_asignatura_grupo": clase, "periodo": PERIODO, "fecha": FECHA},
        headers=headers,
    )


def test_admin_get_200(client, admin_headers, data):
    clase = data.asignacion_prof.id_profesor_asignatura_grupo
    assert _roster(client, admin_headers, clase).status_code == 200


def test_admin_put_200_y_persiste(client, admin_headers, data):
    clase = data.asignacion_prof.id_profesor_asignatura_grupo
    est = data.est_prof.id_estudiante
    payload = {
        "id_profesor_asignatura_grupo": clase,
        "periodo": PERIODO,
        "fecha": FECHA,
        "registros": [{"id_estudiante": est, "estado": "Presente", "observacion": None}],
    }
    r = client.put(f"{API}/asistencia/", json=payload, headers=admin_headers)
    assert r.status_code == 200
    reg = {x["id_estudiante"]: x["estado"] for x in _roster(client, admin_headers, clase).json()["registros"]}
    assert reg[est] == "Presente"


def test_profesor_clase_propia_200(client, prof_headers, data):
    clase = data.asignacion_prof.id_profesor_asignatura_grupo
    est = data.est_prof.id_estudiante
    assert _roster(client, prof_headers, clase).status_code == 200
    payload = {
        "id_profesor_asignatura_grupo": clase,
        "periodo": PERIODO,
        "fecha": FECHA,
        "registros": [{"id_estudiante": est, "estado": "Ausente", "observacion": None}],
    }
    assert client.put(f"{API}/asistencia/", json=payload, headers=prof_headers).status_code == 200


def test_profesor_clase_ajena_403(client, prof_headers, data):
    # Clase en un grupo que el profesor no imparte -> fuera de su alcance.
    clase = data.asignacion_otro.id_profesor_asignatura_grupo
    assert _roster(client, prof_headers, clase).status_code == 403
    payload = {"id_profesor_asignatura_grupo": clase, "periodo": PERIODO, "fecha": FECHA, "registros": []}
    assert client.put(f"{API}/asistencia/", json=payload, headers=prof_headers).status_code == 403


def test_rbac_encargado_y_estudiante_403(client, enc_headers, est_headers, data):
    clase = data.asignacion_prof.id_profesor_asignatura_grupo
    assert _roster(client, enc_headers, clase).status_code == 403
    assert _roster(client, est_headers, clase).status_code == 403


def test_mis_clases_scope(client, prof_headers, admin_headers, data):
    # El profesor solo ve su clase; el admin ve todas las activas.
    prof = client.get(f"{API}/asignaciones/mis-clases", headers=prof_headers).json()
    ids_prof = {c["id_profesor_asignatura_grupo"] for c in prof}
    assert ids_prof == {data.asignacion_prof.id_profesor_asignatura_grupo}

    admin = client.get(f"{API}/asignaciones/mis-clases", headers=admin_headers).json()
    ids_admin = {c["id_profesor_asignatura_grupo"] for c in admin}
    assert data.asignacion_prof.id_profesor_asignatura_grupo in ids_admin
    assert data.asignacion_otro.id_profesor_asignatura_grupo in ids_admin
