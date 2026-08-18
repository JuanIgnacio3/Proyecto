"""Modulo de gestion de usuarios (solo Administrador): listar, cambiar rol,
activar/desactivar, con las salvaguardas de la propia cuenta."""


def test_list_usuarios_admin_incluye_tipo_y_nombre(client, data, admin_headers):
    resp = client.get("/api/v1/usuarios/", headers=admin_headers)
    assert resp.status_code == 200
    filas = resp.json()

    # Se listan todas las cuentas sembradas.
    por_correo = {u["correo_institucional"]: u for u in filas}
    assert "admin@test.cr" in por_correo
    assert "est@test.cr" in por_correo

    # La cuenta del estudiante trae su tipo y nombre de la persona asociada.
    est = por_correo["est@test.cr"]
    assert est["tipo"] == "Estudiante"
    assert est["nombre_completo"].startswith("Est")
    assert est["rol"]["name_rol"] == "Estudiante"


def test_list_usuarios_prohibido_para_no_admin(client, data, prof_headers):
    resp = client.get("/api/v1/usuarios/", headers=prof_headers)
    assert resp.status_code == 403


def test_no_permite_cambiar_a_otro_tipo(client, data, admin_headers):
    # user_est es un Estudiante: cambiarlo a Profesor cruzaria de tipo -> 400.
    nuevo_rol = data.roles["Profesor"].id_rol
    resp = client.put(
        f"/api/v1/usuarios/{data.user_est.id_usuario}",
        headers=admin_headers,
        json={"id_rol": nuevo_rol},
    )
    assert resp.status_code == 400


def test_rol_igual_al_tipo_es_ok(client, data, admin_headers):
    # Reasignar el mismo rol que corresponde al tipo no es un cambio de tipo.
    mismo_rol = data.roles["Estudiante"].id_rol
    resp = client.put(
        f"/api/v1/usuarios/{data.user_est.id_usuario}",
        headers=admin_headers,
        json={"id_rol": mismo_rol},
    )
    assert resp.status_code == 200
    assert resp.json()["rol"]["name_rol"] == "Estudiante"


def test_desactivar_y_reactivar_usuario(client, data, admin_headers):
    uid = data.user_enc.id_usuario

    desactivar = client.put(
        f"/api/v1/usuarios/{uid}", headers=admin_headers, json={"activo": False}
    )
    assert desactivar.status_code == 200
    assert desactivar.json()["activo"] is False

    reactivar = client.put(
        f"/api/v1/usuarios/{uid}", headers=admin_headers, json={"activo": True}
    )
    assert reactivar.status_code == 200
    assert reactivar.json()["activo"] is True


def test_no_puede_modificar_su_propia_cuenta(client, data, admin_headers):
    resp = client.put(
        f"/api/v1/usuarios/{data.user_admin.id_usuario}",
        headers=admin_headers,
        json={"activo": False},
    )
    assert resp.status_code == 400


def test_rol_inexistente_devuelve_400(client, data, admin_headers):
    resp = client.put(
        f"/api/v1/usuarios/{data.user_est.id_usuario}",
        headers=admin_headers,
        json={"id_rol": 999999},
    )
    assert resp.status_code == 400
