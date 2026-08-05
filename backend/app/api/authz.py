"""Autorizacion por datos (row-level). Unica fuente de verdad del backend.

Arquitectura (docs/AUTHZ.md):
  - RBAC (require_roles / authz.require roles) decide QUE modulo entra un usuario.
  - AuthZ (este modulo) decide QUE registros puede ver o modificar.

API objetivo — un contexto por request con metodos semanticos de dominio:

    ctx: AuthzContext = Depends(authz.require(Policy.STUDENT, roles=("Administrador","Profesor")))
    query = ctx.scope_estudiantes(db.query(Estudiante))
    ctx.assert_grupo(id_grupo)

Los routers nunca ven columnas, joins, .in_() ni ids permitidos: todo eso vive aqui.

Politica (aprobada):
  - Administrador: acceso total.
  - Administrativo: acceso total (comportamiento ACTUAL preservado; restringirlo
    es una decision de negocio PENDIENTE).
  - Profesor: solo sus grupos (union del grupo directo y los de sus subgrupos) y
    los estudiantes de esos grupos.
  - Encargado: solo los estudiantes vinculados por EncargadoEstudiante.
  - Estudiante: solo su propia informacion.

API publica: este modulo expone unicamente `Policy`, `AuthzContext` y `require`.
Todo lo demas (resolucion de perfil/grupos, scoping por columnas) es implementacion
interna, con prefijo `_`.
"""
from __future__ import annotations

from enum import Enum

from fastapi import Depends, HTTPException, status
from sqlalchemy import false, select
from sqlalchemy.orm import Query, Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.encargado import Encargado
from app.models.encargado_estudiante import EncargadoEstudiante
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.grupo import Grupo
from app.models.profesor import Profesor
from app.models.subgrupo import SubGrupo
from app.models.subgrupo_profesor import SubGrupoProfesor
from app.models.usuario import Usuario


class Policy(str, Enum):
    """Clase de autorizacion de un recurso (docs/AUTHZ.md, Parte 2)."""

    PUBLIC = "PUBLIC"
    UNSCOPED = "UNSCOPED"
    GROUP = "GROUP"
    STUDENT = "STUDENT"
    GUARDIAN = "GUARDIAN"


# Roles con acceso total a los datos. Administrativo se mantiene aqui para
# PRESERVAR el comportamiento actual; acotarlo es una decision de negocio pendiente.
ROLES_ACCESO_TOTAL = {"Administrador", "Administrativo"}

_FORBIDDEN = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="No tiene permiso para acceder a este recurso",
)

_UNSET: object = object()


def _grupos_de_profesor(db: Session, profesor: Profesor) -> set[int]:
    """UNICO lugar que resuelve la dualidad del modelo Profesor.id_grupo +
    SubGrupoProfesor: los grupos que imparte un profesor = union del grupo directo
    y los grupos de sus subgrupos. Si el modelo cambia, solo cambia esta funcion."""
    grupos: set[int] = set()
    if profesor.id_grupo is not None:
        grupos.add(profesor.id_grupo)
    filas = (
        db.query(SubGrupo.id_grupo)
        .join(SubGrupoProfesor, SubGrupoProfesor.id_subgrupo == SubGrupo.id_subgrupo)
        .filter(SubGrupoProfesor.id_profesor == profesor.id_profesor)
    )
    grupos.update(g for (g,) in filas)
    return grupos


class AuthzContext:
    """Contexto de autorizacion por request.

    Resuelve el perfil y los grupos del actor UNA sola vez (memoizacion) y expone
    una API semantica de dominio. Es la unica fuente de verdad de la autorizacion.
    """

    def __init__(self, db: Session, user: Usuario, policy: Policy = Policy.UNSCOPED) -> None:
        self._db = db
        self.user = user
        self.policy = policy
        self._prof: object = _UNSET
        self._enc: object = _UNSET
        self._est: object = _UNSET
        self._grupos: set[int] | None = None

    # ---- Estado del actor (memoizado) ----
    @property
    def _acceso_total(self) -> bool:
        return self.user.rol.name_rol in ROLES_ACCESO_TOTAL

    def _profesor(self) -> Profesor | None:
        if self._prof is _UNSET:
            self._prof = (
                self._db.query(Profesor)
                .filter(Profesor.id_usuario == self.user.id_usuario)
                .first()
            )
        return self._prof  # type: ignore[return-value]

    def _encargado(self) -> Encargado | None:
        if self._enc is _UNSET:
            self._enc = (
                self._db.query(Encargado)
                .filter(Encargado.id_usuario == self.user.id_usuario)
                .first()
            )
        return self._enc  # type: ignore[return-value]

    def _estudiante(self) -> Estudiante | None:
        if self._est is _UNSET:
            self._est = (
                self._db.query(Estudiante)
                .filter(Estudiante.id_usuario == self.user.id_usuario)
                .first()
            )
        return self._est  # type: ignore[return-value]

    def _grupos_de_actor(self) -> set[int]:
        if self._grupos is None:
            profesor = self._profesor()
            self._grupos = _grupos_de_profesor(self._db, profesor) if profesor else set()
        return self._grupos

    # ---- Privados reutilizados (GROUP) ----
    def _scope_by_groups(self, query: Query, group_col) -> Query:
        if self._acceso_total:
            return query
        grupos = self._grupos_de_actor()
        if not grupos:
            return query.filter(false())
        return query.filter(group_col.in_(grupos))

    def _assert_group(self, id_grupo: int) -> None:
        if self._acceso_total:
            return
        if id_grupo in self._grupos_de_actor():
            return
        raise _FORBIDDEN

    # ---- API publica: GROUP ----
    def scope_grupos(self, query: Query) -> Query:
        return self._scope_by_groups(query, Grupo.id_grupo)

    def scope_subgrupos(self, query: Query) -> Query:
        return self._scope_by_groups(query, SubGrupo.id_grupo)

    def scope_evaluaciones(self, query: Query) -> Query:
        return self._scope_by_groups(query, Evaluacion.id_grupo)

    def scope_asistencia(self, query: Query) -> Query:
        return self._scope_by_groups(query, Asistencia.id_grupo)

    def assert_grupo(self, id_grupo: int) -> None:
        self._assert_group(id_grupo)

    def assert_subgrupo(self, id_subgrupo: int) -> None:
        if self._acceso_total:
            return
        subgrupo = self._db.get(SubGrupo, id_subgrupo)
        if subgrupo is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subgrupo no encontrado"
            )
        self._assert_group(subgrupo.id_grupo)

    def assert_evaluacion(self, id_evaluacion: int) -> None:
        if self._acceso_total:
            return
        evaluacion = self._db.get(Evaluacion, id_evaluacion)
        if evaluacion is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Evaluacion no encontrada"
            )
        self._assert_group(evaluacion.id_grupo)

    # ---- API publica: STUDENT ----
    def scope_estudiantes(self, query: Query) -> Query:
        if self._acceso_total:
            return query
        profesor = self._profesor()
        if profesor is not None:
            grupos = self._grupos_de_actor()
            if not grupos:
                return query.filter(false())
            return query.filter(Estudiante.id_grupo.in_(grupos))
        encargado = self._encargado()
        if encargado is not None:
            vinculados = select(EncargadoEstudiante.id_estudiante).where(
                EncargadoEstudiante.id_encargado == encargado.id_encargado
            )
            return query.filter(Estudiante.id_estudiante.in_(vinculados))
        estudiante = self._estudiante()
        if estudiante is not None:
            return query.filter(Estudiante.id_estudiante == estudiante.id_estudiante)
        return query.filter(false())

    def assert_estudiante(self, id_estudiante: int) -> None:
        if self._acceso_total:
            return
        permitido = self.scope_estudiantes(
            self._db.query(Estudiante.id_estudiante).filter(
                Estudiante.id_estudiante == id_estudiante
            )
        ).first()
        if permitido is None:
            raise _FORBIDDEN

    # ---- API publica: GUARDIAN (dormante hasta decision de negocio) ----
    def scope_guardians(self, query: Query) -> Query:
        if self._acceso_total:
            return query
        profesor = self._profesor()
        if profesor is not None:
            grupos = self._grupos_de_actor()
            if not grupos:
                return query.filter(false())
            de_mis_estudiantes = (
                select(EncargadoEstudiante.id_encargado)
                .join(Estudiante, Estudiante.id_estudiante == EncargadoEstudiante.id_estudiante)
                .where(Estudiante.id_grupo.in_(grupos))
            )
            return query.filter(Encargado.id_encargado.in_(de_mis_estudiantes))
        return query.filter(false())

    def assert_guardian(self, id_encargado: int) -> None:
        if self._acceso_total:
            return
        permitido = self.scope_guardians(
            self._db.query(Encargado.id_encargado).filter(
                Encargado.id_encargado == id_encargado
            )
        ).first()
        if permitido is None:
            raise _FORBIDDEN


def require(policy: Policy, roles: tuple[str, ...] = ()):
    """Dependencia-fabrica: declara la politica del endpoint, aplica el RBAC floor
    y devuelve un AuthzContext memoizado.

        ctx: AuthzContext = Depends(authz.require(Policy.GROUP, roles=("Administrador","Profesor")))
    """

    def dependency(
        db: Session = Depends(get_db),
        user: Usuario = Depends(get_current_user),
    ) -> AuthzContext:
        if roles and user.rol.name_rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta accion",
            )
        return AuthzContext(db, user, policy)

    return dependency
