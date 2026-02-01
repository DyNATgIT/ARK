"""Onboarding workflow database model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.database.customer import Customer
    from app.models.database.workflow_step import WorkflowStep


class WorkflowStatus(str, enum.Enum):
    """Workflow lifecycle status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    AWAITING_INPUT = "awaiting_input"
    AWAITING_APPROVAL = "awaiting_approval"
    APPROVED = "approved"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WorkflowPriority(str, enum.Enum):
    """Workflow priority level."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class OnboardingWorkflow(BaseModel):
    """Represents an onboarding workflow instance for a customer."""

    __tablename__ = "onboarding_workflows"

    # Customer reference
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True
    )

    # Workflow metadata
    workflow_type: Mapped[str] = mapped_column(String(100), default="standard_onboarding")
    template_version: Mapped[str] = mapped_column(String(50), default="1.0.0")

    # Status tracking
    status: Mapped[WorkflowStatus] = mapped_column(
        Enum(WorkflowStatus), default=WorkflowStatus.PENDING, index=True
    )
    priority: Mapped[WorkflowPriority] = mapped_column(
        Enum(WorkflowPriority), default=WorkflowPriority.NORMAL
    )

    # Progress tracking
    current_step: Mapped[str | None] = mapped_column(String(100), nullable=True)
    completed_steps: Mapped[int] = mapped_column(Integer, default=0)
    total_steps: Mapped[int] = mapped_column(Integer, default=0)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0)

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_completion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # State management (LangGraph state)
    state: Mapped[dict] = mapped_column(JSONB, default=dict)
    context: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Error handling
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    max_retries: Mapped[int] = mapped_column(Integer, default=3)

    # Human intervention
    requires_approval: Mapped[bool] = mapped_column(default=False)
    approved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    approval_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="workflows")
    steps: Mapped[list["WorkflowStep"]] = relationship(
        "WorkflowStep", back_populates="workflow", order_by="WorkflowStep.sequence_order"
    )

    @property
    def is_active(self) -> bool:
        """Check if workflow is currently active."""
        return self.status in [
            WorkflowStatus.PENDING,
            WorkflowStatus.IN_PROGRESS,
            WorkflowStatus.AWAITING_INPUT,
            WorkflowStatus.AWAITING_APPROVAL,
        ]

    @property
    def is_terminal(self) -> bool:
        """Check if workflow has reached a terminal state."""
        return self.status in [
            WorkflowStatus.COMPLETED,
            WorkflowStatus.FAILED,
            WorkflowStatus.CANCELLED,
        ]
