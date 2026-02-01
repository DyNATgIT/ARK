"""Onboarding workflow Pydantic schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field

from app.models.database.onboarding_workflow import WorkflowPriority, WorkflowStatus
from app.models.database.workflow_step import StepStatus, StepType
from app.models.schemas.common import BaseSchema, IDSchema, TimestampSchema


class WorkflowStepResponse(IDSchema, TimestampSchema):
    """Workflow step response schema."""

    step_name: str
    step_type: StepType
    sequence_order: int
    agent_name: str | None
    tool_name: str | None
    status: StepStatus
    started_at: datetime | None
    completed_at: datetime | None
    duration_seconds: float | None
    error_message: str | None
    confidence_score: float | None


class OnboardingCreate(BaseSchema):
    """Schema for starting a new onboarding workflow."""

    customer_id: UUID
    workflow_type: str = "standard_onboarding"
    priority: WorkflowPriority = WorkflowPriority.NORMAL
    context: dict[str, Any] = Field(default_factory=dict)


class OnboardingWizardCreate(BaseSchema):
    """Schema for wizard-based onboarding (creates customer and workflow)."""

    company_name: str
    tax_id: str
    contact_name: str
    email: str
    workflow_type: str = "standard_onboarding"
    priority: WorkflowPriority = WorkflowPriority.NORMAL
    context: dict[str, Any] = Field(default_factory=dict)


class OnboardingResponse(IDSchema, TimestampSchema):
    """Onboarding workflow response schema."""

    customer_id: UUID
    customer_name: str | None = None
    workflow_type: str
    template_version: str
    status: WorkflowStatus
    priority: WorkflowPriority
    current_step: str | None
    completed_steps: int
    total_steps: int
    progress_percentage: int
    started_at: datetime | None
    completed_at: datetime | None
    estimated_completion: datetime | None
    requires_approval: bool
    error_message: str | None


class OnboardingDetailResponse(OnboardingResponse):
    """Detailed onboarding response with steps."""

    steps: list[WorkflowStepResponse] = []
    state: dict[str, Any] = {}
    context: dict[str, Any] = {}


class OnboardingStatusUpdate(BaseSchema):
    """Schema for updating workflow status."""

    status: WorkflowStatus
    notes: str | None = None


class ApprovalRequest(BaseSchema):
    """Schema for workflow approval."""

    approved: bool
    notes: str | None = None


class OnboardingListItem(IDSchema):
    """Minimal onboarding schema for list views."""

    customer_id: UUID
    customer_name: str | None = None
    workflow_type: str
    status: WorkflowStatus
    priority: WorkflowPriority
    progress_percentage: int
    started_at: datetime | None
    created_at: datetime


class OnboardingStats(BaseSchema):
    """Statistics for onboarding dashboard."""

    total_workflows: int
    active_workflows: int
    completed_today: int
    avg_completion_time_minutes: float
    success_rate: float
    pending_approvals: int
