"""rubros de evaluacion, % de asistencia por clase y periodo en asistencia

Revision ID: f8a9b0c1d2e3
Revises: e7f8a9b0c1d2
Create Date: 2026-08-12 04:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f8a9b0c1d2e3'
down_revision: Union[str, None] = 'e7f8a9b0c1d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'evaluacion',
        sa.Column('tipo', sa.String(length=20), nullable=False, server_default='Examen'),
    )
    op.add_column(
        'profesor_asignatura_grupo',
        sa.Column(
            'porcentaje_asistencia',
            sa.Numeric(precision=5, scale=2),
            nullable=False,
            server_default='0',
        ),
    )
    op.add_column('asistencia', sa.Column('periodo', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_asistencia_periodo'), 'asistencia', ['periodo'])


def downgrade() -> None:
    op.drop_index(op.f('ix_asistencia_periodo'), table_name='asistencia')
    op.drop_column('asistencia', 'periodo')
    op.drop_column('profesor_asignatura_grupo', 'porcentaje_asistencia')
    op.drop_column('evaluacion', 'tipo')
