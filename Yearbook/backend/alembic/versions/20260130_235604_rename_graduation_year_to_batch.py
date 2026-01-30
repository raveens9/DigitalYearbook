"""rename_graduation_year_to_batch

Revision ID: 86ae60d7b260
Revises: b207cafa9361
Create Date: 2026-01-30 23:56:04.286502

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86ae60d7b260'
down_revision: Union[str, None] = 'b207cafa9361'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
