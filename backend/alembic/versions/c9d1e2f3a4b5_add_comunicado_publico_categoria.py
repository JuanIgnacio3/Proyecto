"""add comunicado es_publico and categoria

Revision ID: c9d1e2f3a4b5
Revises: 3c2b6717d491
Create Date: 2026-07-29 00:00:00.000000

Migracion aditiva: agrega la visibilidad publica opt-in y la categoria a
`comunicado`. Ningun registro existente se hace publico (server_default false).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c9d1e2f3a4b5'
down_revision: Union[str, None] = '3c2b6717d491'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'comunicado',
        sa.Column(
            'es_publico',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('false'),
        ),
    )
    op.add_column(
        'comunicado',
        sa.Column('categoria', sa.String(length=20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('comunicado', 'categoria')
    op.drop_column('comunicado', 'es_publico')
