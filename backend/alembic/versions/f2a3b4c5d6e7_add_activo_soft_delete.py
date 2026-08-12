"""add activo (soft-delete) to structural entities

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-08-11 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f2a3b4c5d6e7'
down_revision: Union[str, None] = 'e1f2a3b4c5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = (
    'asignatura',
    'grupo',
    'subgrupo',
    'evaluacion',
    'especialidad',
    'evento',
    'comunicado',
)


def upgrade() -> None:
    for table in _TABLES:
        op.add_column(
            table,
            sa.Column(
                'activo',
                sa.Boolean(),
                nullable=False,
                server_default=sa.text('true'),
            ),
        )


def downgrade() -> None:
    for table in _TABLES:
        op.drop_column(table, 'activo')
