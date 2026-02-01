"""Onboarding workflow endpoints."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import raise_bad_request, raise_not_found
from app.database.session import get_db_session
from app.models.database.customer import Customer, CustomerType, CustomerStatus
from app.models.database.onboarding_workflow import OnboardingWorkflow, WorkflowStatus
from app.models.schemas.common import BaseResponse, PaginatedResponse
from app.models.schemas.onboarding import (
    ApprovalRequest,
    OnboardingCreate,
    OnboardingWizardCreate,
    OnboardingDetailResponse,
    OnboardingListItem,
    OnboardingResponse,
    OnboardingStats,
)
from app.orchestrator.workflow_engine import workflow_engine, create_initial_state
from app.tasks import run_onboarding_workflow

router = APIRouter()


@router.post("/wizard", response_model=BaseResponse[OnboardingResponse], status_code=201)
async def start_wizard_onboarding(
    wizard_data: OnboardingWizardCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[OnboardingResponse]:
    """
    Start a new onboarding workflow via the wizard.
    Creates both the customer and the workflow.
    """
    # Create customer
    name_parts = wizard_data.contact_name.split(" ", 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    customer = Customer(
        email=wizard_data.email,
        first_name=first_name,
        last_name=last_name,
        company_name=wizard_data.company_name,
        customer_type=CustomerType.BUSINESS,
        status=CustomerStatus.ONBOARDING,
        metadata={"tax_id": wizard_data.tax_id},
    )
    db.add(customer)
    await db.flush()

    # Create workflow
    workflow = OnboardingWorkflow(
        customer_id=customer.id,
        workflow_type=wizard_data.workflow_type,
        priority=wizard_data.priority,
        context=wizard_data.context,
        status=WorkflowStatus.IN_PROGRESS,
        total_steps=6,
    )
    db.add(workflow)
    await db.flush()
    await db.refresh(workflow)

    # Initialize and trigger orchestrator
    initial_state = create_initial_state(
        customer_id=str(customer.id),
        workflow_id=str(workflow.id),
        customer_data={
            "email": customer.email,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "company_name": customer.company_name,
            "tax_id": wizard_data.tax_id,
        },
    )

    # Run workflow in background via Celery
    run_onboarding_workflow.delay(initial_state)

    response_data = OnboardingResponse.model_validate(workflow)
    response_data.customer_name = customer.company_name

    return BaseResponse(
        message="Onboarding workflow initiated via wizard",
        data=response_data,
    )


@router.post("", response_model=BaseResponse[OnboardingResponse], status_code=201)
async def start_onboarding(
    onboarding_data: OnboardingCreate,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[OnboardingResponse]:
    """
    Start a new onboarding workflow for a customer.

    This creates a workflow instance and triggers the orchestration engine.
    """
    # Verify customer exists
    customer = await db.get(Customer, onboarding_data.customer_id)
    if not customer:
        raise_not_found("Customer", str(onboarding_data.customer_id))

    # Check if customer has an active workflow
    existing = await db.scalar(
        select(OnboardingWorkflow).where(
            and_(
                OnboardingWorkflow.customer_id == onboarding_data.customer_id,
                OnboardingWorkflow.status.in_(
                    [
                        WorkflowStatus.PENDING,
                        WorkflowStatus.IN_PROGRESS,
                        WorkflowStatus.AWAITING_INPUT,
                        WorkflowStatus.AWAITING_APPROVAL,
                    ]
                ),
            )
        )
    )
    if existing:
        raise_bad_request("Customer already has an active onboarding workflow")

    # Create workflow
    workflow = OnboardingWorkflow(
        customer_id=onboarding_data.customer_id,
        workflow_type=onboarding_data.workflow_type,
        priority=onboarding_data.priority,
        context=onboarding_data.context,
        status=WorkflowStatus.PENDING,
        total_steps=6,  # Will be updated by orchestrator
    )
    db.add(workflow)
    await db.flush()
    await db.refresh(workflow)

    # Initialize and trigger orchestrator
    initial_state = create_initial_state(
        customer_id=str(customer.id),
        workflow_id=str(workflow.id),
        customer_data={
            "email": customer.email,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "company_name": customer.company_name,
        },
    )

    # Trigger LangGraph workflow execution via Celery task
    run_onboarding_workflow.delay(initial_state)

    response_data = OnboardingResponse.model_validate(workflow)
    response_data.customer_name = customer.company_name

    return BaseResponse(
        message="Onboarding workflow started",
        data=response_data,
    )


@router.get("", response_model=PaginatedResponse[OnboardingListItem])
async def list_onboardings(
    db: AsyncSession = Depends(get_db_session),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: WorkflowStatus | None = None,
) -> PaginatedResponse[OnboardingListItem]:
    """List onboarding workflows with pagination and filtering."""
    query = select(OnboardingWorkflow, Customer.company_name).join(
        Customer, OnboardingWorkflow.customer_id == Customer.id
    )

    if status:
        query = query.where(OnboardingWorkflow.status == status)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(OnboardingWorkflow.created_at.desc())

    result = await db.execute(query)
    items = []
    for workflow, company_name in result.all():
        item = OnboardingListItem.model_validate(workflow)
        item.customer_name = company_name
        items.append(item)

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/stats", response_model=OnboardingStats)
async def get_onboarding_stats(
    db: AsyncSession = Depends(get_db_session),
) -> OnboardingStats:
    """Get onboarding statistics for the dashboard."""
    # Total workflows
    total = await db.scalar(select(func.count(OnboardingWorkflow.id))) or 0

    # Active workflows
    active = (
        await db.scalar(
            select(func.count(OnboardingWorkflow.id)).where(
                OnboardingWorkflow.status.in_(
                    [
                        WorkflowStatus.PENDING,
                        WorkflowStatus.IN_PROGRESS,
                        WorkflowStatus.AWAITING_INPUT,
                    ]
                )
            )
        )
        or 0
    )

    # Completed today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = (
        await db.scalar(
            select(func.count(OnboardingWorkflow.id)).where(
                and_(
                    OnboardingWorkflow.status == WorkflowStatus.COMPLETED,
                    OnboardingWorkflow.completed_at >= today_start,
                )
            )
        )
        or 0
    )

    # Pending approvals
    pending_approvals = (
        await db.scalar(
            select(func.count(OnboardingWorkflow.id)).where(
                OnboardingWorkflow.status == WorkflowStatus.AWAITING_APPROVAL
            )
        )
        or 0
    )

    # Calculate success rate
    completed = (
        await db.scalar(
            select(func.count(OnboardingWorkflow.id)).where(
                OnboardingWorkflow.status == WorkflowStatus.COMPLETED
            )
        )
        or 0
    )
    failed = (
        await db.scalar(
            select(func.count(OnboardingWorkflow.id)).where(
                OnboardingWorkflow.status == WorkflowStatus.FAILED
            )
        )
        or 0
    )
    success_rate = (completed / (completed + failed) * 100) if (completed + failed) > 0 else 100.0

    return OnboardingStats(
        total_workflows=total,
        active_workflows=active,
        completed_today=completed_today,
        avg_completion_time_minutes=25.5,  # TODO: Calculate from actual data
        success_rate=success_rate,
        pending_approvals=pending_approvals,
    )


@router.get("/{workflow_id}", response_model=BaseResponse[OnboardingDetailResponse])
async def get_onboarding(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[OnboardingDetailResponse]:
    """Get detailed onboarding workflow information."""
    result = await db.execute(
        select(OnboardingWorkflow)
        .where(OnboardingWorkflow.id == workflow_id)
        .options(selectinload(OnboardingWorkflow.steps), selectinload(OnboardingWorkflow.customer))
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise_not_found("Onboarding workflow", str(workflow_id))

    response_data = OnboardingDetailResponse.model_validate(workflow)
    response_data.customer_name = workflow.customer.company_name

    return BaseResponse(data=response_data)


@router.post("/{workflow_id}/approve", response_model=BaseResponse[OnboardingResponse])
async def approve_onboarding(
    workflow_id: UUID,
    approval: ApprovalRequest,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[OnboardingResponse]:
    """Approve or reject an onboarding workflow awaiting approval."""
    workflow = await db.get(OnboardingWorkflow, workflow_id)
    if not workflow:
        raise_not_found("Onboarding workflow", str(workflow_id))

    if workflow.status != WorkflowStatus.AWAITING_APPROVAL:
        raise_bad_request("Workflow is not awaiting approval")

    if approval.approved:
        workflow.status = WorkflowStatus.APPROVED
        workflow.approval_notes = approval.notes
        workflow.approved_at = datetime.now(timezone.utc)
        # TODO: Resume workflow execution
    else:
        workflow.status = WorkflowStatus.FAILED
        workflow.error_message = f"Rejected: {approval.notes}"

    await db.flush()
    await db.refresh(workflow)

    return BaseResponse(
        message="Approval processed",
        data=OnboardingResponse.model_validate(workflow),
    )


@router.post("/{workflow_id}/cancel", response_model=BaseResponse[OnboardingResponse])
async def cancel_onboarding(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db_session),
) -> BaseResponse[OnboardingResponse]:
    """Cancel an active onboarding workflow."""
    workflow = await db.get(OnboardingWorkflow, workflow_id)
    if not workflow:
        raise_not_found("Onboarding workflow", str(workflow_id))

    if workflow.is_terminal:
        raise_bad_request("Cannot cancel a completed workflow")

    workflow.status = WorkflowStatus.CANCELLED
    await db.flush()
    await db.refresh(workflow)

    return BaseResponse(
        message="Workflow cancelled",
        data=OnboardingResponse.model_validate(workflow),
    )
