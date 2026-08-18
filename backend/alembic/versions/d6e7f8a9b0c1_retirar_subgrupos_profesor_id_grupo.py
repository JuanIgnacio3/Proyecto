"""retirar subgrupos y profesor.id_grupo (Fase 3 final)

El scope del profesor pasa a derivarse de ProfesorAsignaturaGrupo, por lo que
los subgrupos y el vinculo directo Profesor.id_grupo dejan de usarse.

Revision ID: d6e7f8a9b0c1
Revises: c5d6e7f8a9b0
Create Date: 2026-08-12 02:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd6e7f8a9b0c1'
down_revision: Union[str, None] = 'c5d6e7f8a9b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tablas hijas primero (FKs), luego la tabla base.
    op.drop_table('subgrupo_profesor')
    op.drop_table('subgrupo_estudiante')
    op.drop_table('subgrupo')
    # El vinculo directo profesor->grupo ya no existe (se usa la asignacion).
    op.drop_column('profesor', 'id_grupo')


def downgrade() -> None:
    op.add_column(
        'profesor',
        sa.Column('id_grupo', sa.Integer(), nullable=True),
    )
    op.create_index(op.f('ix_profesor_id_grupo'), 'profesor', ['id_grupo'])
    op.create_foreign_key(
        'fk_profesor_grupo', 'profesor', 'grupo', ['id_grupo'], ['id_grupo']
    )

    op.create_table(
        'subgrupo',
        sa.Column('id_subgrupo', sa.Integer(), nullable=False),
        sa.Column('name_subgrupo', sa.String(length=100), nullable=False),
        sa.Column('tipo_subgrupo', sa.String(length=50), nullable=False),
        sa.Column('id_grupo', sa.Integer(), nullable=False),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.ForeignKeyConstraint(['id_grupo'], ['grupo.id_grupo']),
        sa.PrimaryKeyConstraint('id_subgrupo'),
    )
    op.create_table(
        'subgrupo_profesor',
        sa.Column('id_subgrupo_profesor', sa.Integer(), nullable=False),
        sa.Column('id_profesor', sa.Integer(), nullable=False),
        sa.Column('id_subgrupo', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['id_profesor'], ['profesor.id_profesor']),
        sa.ForeignKeyConstraint(['id_subgrupo'], ['subgrupo.id_subgrupo']),
        sa.PrimaryKeyConstraint('id_subgrupo_profesor'),
        sa.UniqueConstraint('id_profesor', 'id_subgrupo', name='uq_subgrupo_profesor'),
    )
    op.create_table(
        'subgrupo_estudiante',
        sa.Column('id_subgrupo_estudiante', sa.Integer(), nullable=False),
        sa.Column('id_estudiante', sa.Integer(), nullable=False),
        sa.Column('id_subgrupo', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['id_estudiante'], ['estudiante.id_estudiante']),
        sa.ForeignKeyConstraint(['id_subgrupo'], ['subgrupo.id_subgrupo']),
        sa.PrimaryKeyConstraint('id_subgrupo_estudiante'),
        sa.UniqueConstraint('id_estudiante', 'id_subgrupo', name='uq_subgrupo_estudiante'),
    )
