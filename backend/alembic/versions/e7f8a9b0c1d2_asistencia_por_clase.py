"""asistencia por clase (asignacion profesor+materia), no por grupo

Revision ID: e7f8a9b0c1d2
Revises: d6e7f8a9b0c1
Create Date: 2026-08-12 03:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e7f8a9b0c1d2'
down_revision: Union[str, None] = 'd6e7f8a9b0c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'asistencia',
        sa.Column('id_profesor_asignatura_grupo', sa.Integer(), nullable=True),
    )
    op.create_index(
        op.f('ix_asistencia_id_profesor_asignatura_grupo'),
        'asistencia', ['id_profesor_asignatura_grupo'],
    )
    op.create_foreign_key(
        'fk_asistencia_profesor_asignatura_grupo',
        'asistencia', 'profesor_asignatura_grupo',
        ['id_profesor_asignatura_grupo'], ['id_profesor_asignatura_grupo'],
    )
    # La unicidad pasa de (estudiante, grupo, fecha) a (estudiante, clase, fecha).
    op.drop_constraint('uq_asistencia', 'asistencia', type_='unique')
    op.create_unique_constraint(
        'uq_asistencia_clase',
        'asistencia',
        ['id_estudiante', 'id_profesor_asignatura_grupo', 'fecha'],
    )


def downgrade() -> None:
    op.drop_constraint('uq_asistencia_clase', 'asistencia', type_='unique')
    op.create_unique_constraint(
        'uq_asistencia', 'asistencia', ['id_estudiante', 'id_grupo', 'fecha']
    )
    op.drop_constraint(
        'fk_asistencia_profesor_asignatura_grupo', 'asistencia', type_='foreignkey'
    )
    op.drop_index(
        op.f('ix_asistencia_id_profesor_asignatura_grupo'), table_name='asistencia'
    )
    op.drop_column('asistencia', 'id_profesor_asignatura_grupo')
