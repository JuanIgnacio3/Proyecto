"""grupo: agregar grado y hacer la materia opcional

Revision ID: c5d6e7f8a9b0
Revises: b4c5d6e7f8a9
Create Date: 2026-08-12 01:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c5d6e7f8a9b0'
down_revision: Union[str, None] = 'b4c5d6e7f8a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('grupo', sa.Column('grado', sa.String(length=20), nullable=True))
    op.create_index(op.f('ix_grupo_grado'), 'grupo', ['grado'])
    # La materia deja de ser obligatoria: ahora se asigna por profesor.
    op.alter_column('grupo', 'id_asignatura', existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column('grupo', 'id_asignatura', existing_type=sa.Integer(), nullable=False)
    op.drop_index(op.f('ix_grupo_grado'), table_name='grupo')
    op.drop_column('grupo', 'grado')
