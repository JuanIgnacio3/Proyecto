"""add especialidad

Revision ID: e1f2a3b4c5d6
Revises: d0e1f2a3b4c5
Create Date: 2026-07-29 01:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'e1f2a3b4c5d6'
down_revision: Union[str, None] = 'd0e1f2a3b4c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'especialidad',
        sa.Column('id_especialidad', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=120), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=False),
        sa.Column('nivel', sa.String(length=80), nullable=False),
        sa.Column('salida_laboral', sa.Text(), nullable=True),
        sa.Column('imagen', sa.String(length=255), nullable=True),
        sa.Column('es_publico', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('orden', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.PrimaryKeyConstraint('id_especialidad'),
    )


def downgrade() -> None:
    op.drop_table('especialidad')
