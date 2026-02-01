"""Workflow step database model."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.database.base import BaseModel

if TYPE_CHECKING:
    from app.models.database.onboarding_workflow import OnboardingWorkflow


class StepStatus(str, enum.Enum):
    """Step execution status."""

    PENDING = "pending"
    RUNNING = "running"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class StepType(str, enum.Enum):
    """Type of workflow step."""

    AGENT = "agent"
    INTEGRATION = "integration"
    HUMAN = "human"
    CONDITION = "condition"
    PARALLEL = "parallel"
    NOTIFICATION = "notification"


class WorkflowStep(BaseModel):
    """Individual step within a workflow execution."""

    __tablename__ = "workflow_steps"

    # Workflow reference
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("onboarding_workflows.id"), nullable=False, index=True
    )

    # Step identification
    step_name: Mapped[str] = mapped_column(String(100), nullable=False)
    step_type: Mapped[StepType] = mapped_column(Enum(StepType), nullable=False)
    sequence_order: Mapped[int] = mapped_column(Integer, nullable=False)

    # Agent information (if applicable)
    agent_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tool_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status
    status: Mapped[StepStatus] = mapped_column(
        Enum(StepStatus), default=StepStatus.PENDING, index=True
    )

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Input/Output
    input_data: Mapped[dict] = mapped_column(JSONB, default=dict)
    output_data: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Error handling
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)

    # LLM metrics (if agent step)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    llm_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Relationships
    workflow: Mapped["OnboardingWorkflow"] = relationship(
        "OnboardingWorkflow", back_populates="steps"
    )
