"""Add revoked column to refresh_tokens.

Revision ID: 085a36509309
Revises: 8bea25b9af8a
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '085a36509309'
down_revision: Union[str, Sequence[str], None] = '8bea25b9af8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'refresh_tokens',
        sa.Column(
            'revoked',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column('refresh_tokens', 'revoked')
