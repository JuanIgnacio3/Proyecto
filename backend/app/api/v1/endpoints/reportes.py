from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import authz
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.nota import Nota
from app.models.profesor_asignatura_grupo import ProfesorAsignaturaGrupo
from app.models.usuario import Usuario
from app.schemas.reportes import (
    AsistenciaRubro,
    ConteoEstado,
    EstudianteDisponible,
    ItemNota,
    MateriaReporte,
    PeriodoReporte,
    ReporteEstudiante,
    RubroReporte,
)

router = APIRouter()

RUBROS = ("Examen", "Tarea", "Cotidiano")


@router.get("/estudiantes-disponibles", response_model=list[EstudianteDisponible])
def estudiantes_disponibles(
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(authz.require(authz.Policy.STUDENT, roles=())),
) -> list[EstudianteDisponible]:
    query = ctx.scope_estudiantes(db.query(Estudiante)).filter(
        Estudiante.usuario.has(Usuario.activo.is_(True))
    )
    estudiantes = query.order_by(
        Estudiante.name_estudiante, Estudiante.sec_name_estudiante
    ).all()

    return [
        EstudianteDisponible(
            id_estudiante=e.id_estudiante,
            name_estudiante=e.name_estudiante,
            sec_name_estudiante=e.sec_name_estudiante,
            grupo=e.grupo.name_grupo if e.grupo else None,
        )
        for e in estudiantes
    ]


def _periodo_reporte(
    periodo: int,
    evaluaciones: list[tuple[Evaluacion, float | None]],
    asistencia_estados: dict[str, int],
    peso_asistencia: float,
) -> PeriodoReporte:
    # Rubros: agrupar evaluaciones del periodo por tipo (solo los que tienen items).
    por_tipo: dict[str, list[tuple[Evaluacion, float | None]]] = {}
    for ev, valor in evaluaciones:
        if ev.periodo == periodo:
            por_tipo.setdefault(ev.tipo, []).append((ev, valor))

    rubros: list[RubroReporte] = []
    for tipo in RUBROS:
        evs = por_tipo.get(tipo)
        if not evs:
            continue
        items: list[ItemNota] = []
        peso = 0.0
        contrib_sum: float | None = None
        for ev, valor in evs:
            pct = float(ev.porcentaje)
            peso += pct
            contrib = round(float(valor) * pct / 100, 2) if valor is not None else None
            if contrib is not None:
                contrib_sum = (contrib_sum or 0.0) + contrib
            items.append(
                ItemNota(
                    id_evaluacion=ev.id_evaluacion,
                    name_evaluacion=ev.name_evaluacion,
                    porcentaje=pct,
                    fecha=ev.fecha,
                    valor=float(valor) if valor is not None else None,
                    contribucion=contrib,
                )
            )
        rubros.append(
            RubroReporte(
                tipo=tipo,
                peso=round(peso, 2),
                items=items,
                contribucion=round(contrib_sum, 2) if contrib_sum is not None else None,
            )
        )

    # Asistencia: solo "Ausente" resta; el resto (Presente/Tardia/Justificado) cuenta.
    total = sum(asistencia_estados.values())
    presentes = total - asistencia_estados.get("Ausente", 0)
    score = round(presentes / total * 100, 1) if total else None
    asist_contrib = (
        round(score * peso_asistencia / 100, 2)
        if score is not None and peso_asistencia
        else None
    )
    asistencia = AsistenciaRubro(
        peso=peso_asistencia,
        total_registros=total,
        presentes=presentes,
        porcentaje_presente=score,
        contribucion=asist_contrib,
        por_estado=[
            ConteoEstado(estado=e, cantidad=c) for e, c in asistencia_estados.items()
        ],
    )

    aportes = [r.contribucion for r in rubros if r.contribucion is not None]
    nota = None
    if aportes or asist_contrib is not None:
        nota = round(sum(aportes) + (asist_contrib or 0.0), 2)
    peso_total = round(sum(r.peso for r in rubros) + peso_asistencia, 2)

    return PeriodoReporte(
        periodo=periodo,
        rubros=rubros,
        asistencia=asistencia,
        peso_total=peso_total,
        nota_periodo=nota,
    )


@router.get("/estudiante/{id_estudiante}", response_model=ReporteEstudiante)
def reporte_estudiante(
    id_estudiante: int,
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(authz.require(authz.Policy.STUDENT, roles=())),
) -> ReporteEstudiante:
    ctx.assert_estudiante(id_estudiante)

    estudiante = db.get(Estudiante, id_estudiante)
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
        )

    materias: list[MateriaReporte] = []
    if estudiante.id_grupo is not None:
        clases = (
            db.query(ProfesorAsignaturaGrupo)
            .filter(
                ProfesorAsignaturaGrupo.id_grupo == estudiante.id_grupo,
                ProfesorAsignaturaGrupo.activo.is_(True),
            )
            .order_by(ProfesorAsignaturaGrupo.id_asignatura)
            .all()
        )
        for clase in clases:
            peso_asist = float(clase.porcentaje_asistencia)
            evaluaciones = (
                db.query(Evaluacion, Nota.valor)
                .outerjoin(
                    Nota,
                    (Nota.id_evaluacion == Evaluacion.id_evaluacion)
                    & (Nota.id_estudiante == id_estudiante),
                )
                .filter(
                    Evaluacion.id_profesor_asignatura_grupo
                    == clase.id_profesor_asignatura_grupo,
                    Evaluacion.activo.is_(True),
                )
                .order_by(Evaluacion.periodo, Evaluacion.id_evaluacion)
                .all()
            )
            asistencia_rows = (
                db.query(
                    Asistencia.periodo,
                    Asistencia.estado,
                    func.count(Asistencia.id_asistencia),
                )
                .filter(
                    Asistencia.id_estudiante == id_estudiante,
                    Asistencia.id_profesor_asignatura_grupo
                    == clase.id_profesor_asignatura_grupo,
                )
                .group_by(Asistencia.periodo, Asistencia.estado)
                .all()
            )

            periodos = sorted(
                {ev.periodo for ev, _ in evaluaciones}
                | {p for p, _, _ in asistencia_rows if p is not None}
            )
            periodo_reportes = [
                _periodo_reporte(
                    periodo,
                    evaluaciones,
                    {
                        estado: cant
                        for p, estado, cant in asistencia_rows
                        if p == periodo
                    },
                    peso_asist,
                )
                for periodo in periodos
            ]

            notas_periodo = [
                p.nota_periodo for p in periodo_reportes if p.nota_periodo is not None
            ]
            nota_final = (
                round(sum(notas_periodo) / len(notas_periodo), 2)
                if notas_periodo
                else None
            )

            materias.append(
                MateriaReporte(
                    id_clase=clase.id_profesor_asignatura_grupo,
                    materia=clase.asignatura.name_asignatura,
                    profesor=(
                        f"{clase.profesor.name_profesor} {clase.profesor.sec_name_profesor}"
                    ),
                    porcentaje_asistencia=peso_asist,
                    periodos=periodo_reportes,
                    nota_final=nota_final,
                )
            )

    return ReporteEstudiante(
        id_estudiante=estudiante.id_estudiante,
        name_estudiante=estudiante.name_estudiante,
        sec_name_estudiante=estudiante.sec_name_estudiante,
        grupo=estudiante.grupo.name_grupo if estudiante.grupo else None,
        materias=materias,
    )
