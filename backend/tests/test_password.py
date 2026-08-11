"""Cambio de contrasena del usuario autenticado (PUT /auth/me/password)."""
from app.core.config import settings
from tests.conftest import TEST_PASSWORD

API = settings.API_V1_PREFIX
NUEVA = "NuevaClave123"


def test_current_incorrecta_400(client, admin_headers):
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": "incorrecta", "new_password": NUEVA},
        headers=admin_headers,
    )
    assert r.status_code == 400


def test_nueva_igual_actual_400(client, admin_headers):
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": TEST_PASSWORD},
        headers=admin_headers,
    )
    assert r.status_code == 400


def test_nueva_muy_corta_422(client, admin_headers):
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": "corta"},
        headers=admin_headers,
    )
    assert r.status_code == 422


def test_sin_token_401(client):
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": NUEVA},
    )
    assert r.status_code == 401


def test_cambio_ok_y_relogin(client, admin_headers, data):
    email = data.user_admin.correo_institucional
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": NUEVA},
        headers=admin_headers,
    )
    assert r.status_code == 204
    # la nueva contrasena funciona; la anterior ya no
    assert client.post(f"{API}/auth/login", data={"username": email, "password": NUEVA}).status_code == 200
    assert client.post(f"{API}/auth/login", data={"username": email, "password": TEST_PASSWORD}).status_code == 401


def test_complejidad_sin_numero_400(client, admin_headers):
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": "SoloLetrasSinNumero"},
        headers=admin_headers,
    )
    assert r.status_code == 400


def test_complejidad_sin_letra_400(client, admin_headers):
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": "12345678901"},
        headers=admin_headers,
    )
    assert r.status_code == 400


def test_contrasena_filtrada_400(client, admin_headers, monkeypatch):
    # simula que HIBP reporta la contrasena como filtrada
    monkeypatch.setattr("app.core.passwords.is_password_pwned", lambda password: True)
    r = client.put(
        f"{API}/auth/me/password",
        json={"current_password": TEST_PASSWORD, "new_password": NUEVA},
        headers=admin_headers,
    )
    assert r.status_code == 400
