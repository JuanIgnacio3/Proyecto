"""Sesion basada en cookie httpOnly: login la fija, /me autentica solo con la
cookie (sin header Authorization) y logout la borra."""
from app.core.config import settings
from tests.conftest import TEST_PASSWORD

API = settings.API_V1_PREFIX


def test_login_fija_cookie_y_autentica(client, data):
    email = data.user_admin.correo_institucional
    resp = client.post(f"{API}/auth/login", data={"username": email, "password": TEST_PASSWORD})
    assert resp.status_code == 200
    assert "access_token" in resp.cookies

    # /auth/me funciona SOLO con la cookie del cliente (no se envia Bearer aqui).
    me = client.get(f"{API}/auth/me")
    assert me.status_code == 200
    assert me.json()["correo_institucional"] == email


def test_logout_borra_cookie(client, data):
    email = data.user_admin.correo_institucional
    client.post(f"{API}/auth/login", data={"username": email, "password": TEST_PASSWORD})
    assert client.get(f"{API}/auth/me").status_code == 200

    assert client.post(f"{API}/auth/logout").status_code == 204
    assert client.get(f"{API}/auth/me").status_code == 401


def test_me_sin_credenciales_401(client):
    assert client.get(f"{API}/auth/me").status_code == 401
