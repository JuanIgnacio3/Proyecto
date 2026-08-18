"""add profesor_asignatura_grupo (grupos: varios profesores con su materia)

Revision ID: a3f1c2d4e5b6
Revises: f2a3b4c5d6e7
Create Date: 2026-08-12 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3f1c2d4e5b6'
down_revision: Union[str, None] = 'f2a3b4c5d6e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'profesor_asignatura_grupo',
        sa.Column('id_profesor_asignatura_grupo', sa.Integer(), nullable=False),
        sa.Column('id_profesor', sa.Integer(), nullable=False),
        sa.Column('id_grupo', sa.Integer(), nullable=False),
        sa.Column('id_asignatura', sa.Integer(), nullable=False),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.ForeignKeyConstraint(['id_profesor'], ['profesor.id_profesor']),
        sa.ForeignKeyConstraint(['id_grupo'], ['grupo.id_grupo']),
        sa.ForeignKeyConstraint(['id_asignatura'], ['asignatura.id_asignatura']),
        sa.PrimaryKeyConstraint('id_profesor_asignatura_grupo'),
        sa.UniqueConstraint(
            'id_profesor', 'id_grupo', 'id_asignatura',
            name='uq_profesor_asignatura_grupo',
        ),
    )
    op.create_index(
        op.f('ix_profesor_asignatura_grupo_id_profesor'),
        'profesor_asignatura_grupo', ['id_profesor'],
    )
    op.create_index(
        op.f('ix_profesor_asignatura_grupo_id_grupo'),
        'profesor_asignatura_grupo', ['id_grupo'],
    )
    op.create_index(
        op.f('ix_profesor_asignatura_grupo_id_asignatura'),
        'profesor_asignatura_grupo', ['id_asignatura'],
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_profesor_asignatura_grupo_id_asignatura'),
        table_name='profesor_asignatura_grupo',
    )
    op.drop_index(
        op.f('ix_profesor_asignatura_grupo_id_grupo'),
        table_name='profesor_asignatura_grupo',
    )
    op.drop_index(
        op.f('ix_profesor_asignatura_grupo_id_profesor'),
        table_name='profesor_asignatura_grupo',
    )
    op.drop_table('profesor_asignatura_grupo')
