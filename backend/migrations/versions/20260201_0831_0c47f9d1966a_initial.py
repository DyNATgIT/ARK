"""Initial

Revision ID: 0c47f9d1966a
Revises: 5ef3735b469f
Create Date: 2026-02-01 08:31:44.340916

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0c47f9d1966a'
down_revision: Union[str, None] = '5ef3735b469f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
