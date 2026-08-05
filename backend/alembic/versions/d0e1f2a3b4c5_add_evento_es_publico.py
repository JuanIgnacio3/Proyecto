"""add evento es_publico

Revision ID: d0e1f2a3b4c5
Revises: c9d1e2f3a4b5
Create Date: 2026-07-29 00:30:00.000000

Migracion aditiva: agrega la visibilidad publica opt-in a `evento`. Ningun
evento existente se hace publico (server_default false).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd0e1f2a3b4c5'
down_revision: Union[str, None] = 'c9d1e2f3a4b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'evento',
        sa.Column(
            'es_publico',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
        ),
    )


def downgrade() -> None:
    op.drop_column('evento', 'es_publico')
