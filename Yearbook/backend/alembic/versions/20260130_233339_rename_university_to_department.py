"""rename_university_to_department

Revision ID: b207cafa9361
Revises: 20260130_000001
Create Date: 2026-01-30 23:33:39.044913

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b207cafa9361'
down_revision: Union[str, None] = '20260130_000001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename university column to department
    op.alter_column('users', 'university', new_column_name='department')
    # Rename the index
    op.drop_index('ix_users_university', table_name='users')
    op.create_index('ix_users_department', 'users', ['department'])


def downgrade() -> None:
    # Reverse the changes
    op.alter_column('users', 'department', new_column_name='university')
    op.drop_index('ix_users_department', table_name='users')
    op.create_index('ix_users_university', 'users', ['university'])
