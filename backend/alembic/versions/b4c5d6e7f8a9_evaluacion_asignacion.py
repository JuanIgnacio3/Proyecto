"""evaluacion cuelga de la asignacion profesor-materia (Fase 2)

Revision ID: b4c5d6e7f8a9
Revises: a3f1c2d4e5b6
Create Date: 2026-08-12 00:30:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b4c5d6e7f8a9'
down_revision: Union[str, None] = 'a3f1c2d4e5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'evaluacion',
        sa.Column('id_profesor_asignatura_grupo', sa.Integer(), nullable=True),
    )
    op.create_index(
        op.f('ix_evaluacion_id_profesor_asignatura_grupo'),
        'evaluacion', ['id_profesor_asignatura_grupo'],
    )
    op.create_foreign_key(
        'fk_evaluacion_profesor_asignatura_grupo',
        'evaluacion', 'profesor_asignatura_grupo',
        ['id_profesor_asignatura_grupo'], ['id_profesor_asignatura_grupo'],
    )


def downgrade() -> None:
    op.drop_constraint(
        'fk_evaluacion_profesor_asignatura_grupo', 'evaluacion', type_='foreignkey'
    )
    op.drop_index(
        op.f('ix_evaluacion_id_profesor_asignatura_grupo'), table_name='evaluacion'
    )
    op.drop_column('evaluacion', 'id_profesor_asignatura_grupo')
