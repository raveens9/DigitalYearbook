"""rename_graduation_year_to_batch

Revision ID: 20b41b29dc57
Revises: 86ae60d7b260
Create Date: 2026-01-30 23:56:14.443567

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20b41b29dc57'
down_revision: Union[str, None] = '86ae60d7b260'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename graduation_year column to batch
    op.alter_column('users', 'graduation_year', new_column_name='batch')
    # Rename the index
    op.drop_index('ix_users_graduation_year', table_name='users')
    op.create_index('ix_users_batch', 'users', ['batch'])


def downgrade() -> None:
    # Reverse the changes
    op.alter_column('users', 'batch', new_column_name='graduation_year')
    op.drop_index('ix_users_batch', table_name='users')
    op.create_index('ix_users_graduation_year', 'users', ['graduation_year'])
