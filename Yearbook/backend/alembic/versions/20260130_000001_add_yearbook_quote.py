"""add yearbook quote

Revision ID: 20260130_000001
Revises: 0adad87e3030
Create Date: 2026-01-30 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260130_000001'
down_revision: Union[str, None] = '0adad87e3030'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add yearbook_quote column to users table
    op.add_column('users', sa.Column('yearbook_quote', sa.String(length=300), nullable=True))


def downgrade() -> None:
    # Remove yearbook_quote column from users table
    op.drop_column('users', 'yearbook_quote')
