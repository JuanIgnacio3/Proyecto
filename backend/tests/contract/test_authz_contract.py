"""Suite ESTRUCTURAL — congela el contrato de autorizacion.

La unidad de verdad es el ENDPOINT (la funcion FastAPI y la dependencia declarada
en su firma), no la URL: las rutas cambian (prefijos, versionado) mas que la
semantica del endpoint. El test inspecciona ``app.routes``, localiza la funcion por
``(modulo, nombre)`` y verifica la dependencia de autorizacion realmente declarada.

La clasificacion viene de un REGISTRO EXPLICITO recurso -> politica (abajo), no de
un mapa de URLs. Si el codigo se desvia del diseno aprobado, el test falla.
"""
import pytest
from fastapi.routing import APIRoute

from app.api import deps
from app.api.authz import Policy
from app.main import app

# --- Registro explicito: recurso (modulo, funcion) -> politica esperada --------
# Endpoints protegidos por DATOS: deben declarar authz.require(policy, roles).
DATA_SCOPED: dict[tuple[str, str], tuple[Policy, set[str]]] = {
    ("app.api.v1.endpoints.reportes", "estudiantes_disponibles"): (Policy.STUDENT, set()),
    ("app.api.v1.endpoints.reportes", "reporte_estudiante"): (Policy.STUDENT, set()),
    ("app.api.v1.endpoints.estudiantes", "list_estudiantes"): (Policy.STUDENT, {"Administrador", "Profesor", "Administrativo"}),
    ("app.api.v1.endpoints.estudiantes", "get_estudiante"): (Policy.STUDENT, {"Administrador", "Profesor", "Administrativo"}),
    ("app.api.v1.endpoints.asistencia", "get_roster"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.asistencia", "save_roster"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.calificaciones", "list_evaluaciones"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.calificaciones", "create_evaluacion"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.calificaciones", "update_evaluacion"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.calificaciones", "delete_evaluacion"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.calificaciones", "get_notas"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.calificaciones", "save_notas"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.grupos", "list_grupos"): (Policy.GROUP, {"Administrador", "Profesor", "Administrativo"}),
    ("app.api.v1.endpoints.subgrupos", "list_subgrupos"): (Policy.GROUP, {"Administrador", "Profesor"}),
    ("app.api.v1.endpoints.subgrupos", "get_subgrupo"): (Policy.GROUP, {"Administrador", "Profesor"}),
}

# Endpoints SOLO-RBAC (escrituras admin/administrativo): usan require_roles, NUNCA
# authz.require (no aplican scoping por datos).
RBAC_ONLY: dict[tuple[str, str], set[str]] = {
    ("app.api.v1.endpoints.estudiantes", "create_estudiante"): {"Administrador", "Administrativo"},
    ("app.api.v1.endpoints.estudiantes", "update_estudiante"): {"Administrador", "Administrativo"},
    ("app.api.v1.endpoints.estudiantes", "deactivate_estudiante"): {"Administrador", "Administrativo"},
    ("app.api.v1.endpoints.estudiantes", "activate_estudiante"): {"Administrador", "Administrativo"},
    ("app.api.v1.endpoints.grupos", "create_grupo"): {"Administrador"},
    ("app.api.v1.endpoints.grupos", "update_grupo"): {"Administrador"},
    ("app.api.v1.endpoints.grupos", "delete_grupo"): {"Administrador"},
    ("app.api.v1.endpoints.subgrupos", "create_subgrupo"): {"Administrador"},
    ("app.api.v1.endpoints.subgrupos", "update_subgrupo"): {"Administrador"},
    ("app.api.v1.endpoints.subgrupos", "delete_subgrupo"): {"Administrador"},
}

# Modulos migrados a AuthzContext: todo endpoint suyo debe estar clasificado.
MIGRATED_MODULES = {
    "app.api.v1.endpoints.reportes",
    "app.api.v1.endpoints.estudiantes",
    "app.api.v1.endpoints.asistencia",
    "app.api.v1.endpoints.calificaciones",
    "app.api.v1.endpoints.grupos",
    "app.api.v1.endpoints.subgrupos",
}


# --- Utilidades de introspeccion ----------------------------------------------
def _closure_vars(func) -> dict:
    """Variables libres capturadas por un closure (policy/roles/role_names)."""
    if getattr(func, "__closure__", None) is None:
        return {}
    return dict(zip(func.__code__.co_freevars, (c.cell_contents for c in func.__closure__)))


def _is_authz_require(call) -> bool:
    return (
        getattr(call, "__module__", "") == "app.api.authz"
        and getattr(call, "__qualname__", "").startswith("require.")
    )


def _is_require_roles(call) -> bool:
    return (
        getattr(call, "__module__", "") == "app.api.deps"
        and getattr(call, "__qualname__", "").startswith("require_roles.")
    )


def _iter_dependants(dependant):
    yield dependant
    for sub in dependant.dependencies:
        yield from _iter_dependants(sub)


def _auth_calls(route):
    """Devuelve (dependencia authz.require, dependencia require_roles) de una ruta."""
    authz_require = rbac = None
    for dep in _iter_dependants(route.dependant):
        call = dep.call
        if _is_authz_require(call):
            authz_require = call
        elif _is_require_roles(call):
            rbac = call
    return authz_require, rbac


def _uses_current_user(route) -> bool:
    return any(dep.call is deps.get_current_user for dep in _iter_dependants(route.dependant))


def _routes_by_key() -> dict[tuple[str, str], list]:
    result: dict[tuple[str, str], list] = {}
    for route in app.routes:
        if isinstance(route, APIRoute):
            ep = route.endpoint
            result.setdefault((ep.__module__, ep.__name__), []).append(route)
    return result


ROUTES = _routes_by_key()


# --- Tests de contrato ---------------------------------------------------------
@pytest.mark.parametrize("key,expected", list(DATA_SCOPED.items()), ids=lambda k: k if isinstance(k, str) else None)
def test_data_scoped_declara_policy_y_roles(key, expected):
    routes = ROUTES.get(key)
    assert routes, f"Endpoint no encontrado en app.routes: {key}"
    assert len(routes) == 1, f"Se esperaba una sola ruta para {key}"
    authz_require, rbac = _auth_calls(routes[0])

    assert authz_require is not None, f"{key} debe declarar authz.require(...)"
    assert rbac is None, f"{key} es data-scoped; no debe usar require_roles (el floor va en authz.require)"

    cvars = _closure_vars(authz_require)
    expected_policy, expected_roles = expected
    assert cvars.get("policy") == expected_policy, f"{key}: policy declarada != esperada"
    assert set(cvars.get("roles") or ()) == expected_roles, f"{key}: roles declarados != esperados"


@pytest.mark.parametrize("key,expected_roles", list(RBAC_ONLY.items()))
def test_rbac_only_usa_solo_require_roles(key, expected_roles):
    routes = ROUTES.get(key)
    assert routes, f"Endpoint no encontrado en app.routes: {key}"
    assert len(routes) == 1
    authz_require, rbac = _auth_calls(routes[0])

    assert authz_require is None, f"{key} es RBAC-only; no debe usar authz.require"
    assert rbac is not None, f"{key} debe usar require_roles(...)"
    cvars = _closure_vars(rbac)
    assert set(cvars.get("role_names") or ()) == expected_roles, f"{key}: roles RBAC != esperados"


def test_ningun_endpoint_migrado_sin_contrato():
    """Todo endpoint de los routers migrados debe estar clasificado (data o rbac).
    Detecta endpoints nuevos que se colaran sin declarar su politica."""
    clasificados = set(DATA_SCOPED) | set(RBAC_ONLY)
    faltantes = []
    for route in app.routes:
        if isinstance(route, APIRoute) and route.endpoint.__module__ in MIGRATED_MODULES:
            key = (route.endpoint.__module__, route.endpoint.__name__)
            if key not in clasificados:
                faltantes.append(key)
    assert not faltantes, f"Endpoints migrados sin contrato declarado: {faltantes}"


def test_health_es_publico():
    """Un endpoint publico representativo no debe exigir autenticacion."""
    routes = ROUTES.get(("app.main", "health"))
    assert routes and len(routes) == 1
    authz_require, rbac = _auth_calls(routes[0])
    assert authz_require is None and rbac is None
    assert not _uses_current_user(routes[0]), "health no debe depender de get_current_user"
