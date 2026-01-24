"""Initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create postmortems table
    op.create_table(
        'postmortems',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('severity', sa.String(10), nullable=False),
        sa.Column('incident_date', sa.Date(), nullable=False),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(20), server_default='draft', nullable=False),
        sa.Column('slack_thread', sa.Text(), nullable=True),
        sa.Column('logs', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('impact', sa.Text(), nullable=True),
        sa.Column('root_cause', sa.Text(), nullable=True),
        sa.Column('five_whys', postgresql.JSONB(), server_default='[]', nullable=True),
        sa.Column('lessons_learned', postgresql.JSONB(), server_default='[]', nullable=True),
        sa.Column('generation_task_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
    )

    # Create timeline_events table
    op.create_table(
        'timeline_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('postmortem_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('postmortems.id', ondelete='CASCADE'), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('event', sa.Text(), nullable=False),
        sa.Column('actor', sa.String(255), nullable=True),
        sa.Column('order', sa.Integer(), server_default='0', nullable=False),
    )

    # Create action_items table
    op.create_table(
        'action_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('postmortem_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('postmortems.id', ondelete='CASCADE'), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('owner', sa.String(255), nullable=True),
        sa.Column('priority', sa.String(20), server_default='medium', nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
    )

    # Create indexes
    op.create_index('ix_postmortems_status', 'postmortems', ['status'])
    op.create_index('ix_postmortems_severity', 'postmortems', ['severity'])
    op.create_index('ix_postmortems_incident_date', 'postmortems', ['incident_date'])
    op.create_index('ix_timeline_events_postmortem_id', 'timeline_events', ['postmortem_id'])
    op.create_index('ix_action_items_postmortem_id', 'action_items', ['postmortem_id'])


def downgrade() -> None:
    op.drop_index('ix_action_items_postmortem_id')
    op.drop_index('ix_timeline_events_postmortem_id')
    op.drop_index('ix_postmortems_incident_date')
    op.drop_index('ix_postmortems_severity')
    op.drop_index('ix_postmortems_status')
    op.drop_table('action_items')
    op.drop_table('timeline_events')
    op.drop_table('postmortems')
