from datetime import datetime, timezone
from typing import Any, TypedDict
from uuid import UUID

import structlog
from langgraph.graph import StateGraph, END

from app.database.session import async_session_factory

logger = structlog.get_logger()


class OnboardingState(TypedDict):
    """
    State structure for the onboarding workflow.
    """

    # Customer information
    customer_id: str
    customer_data: dict[str, Any]

    # Workflow tracking
    workflow_id: str
    current_phase: str
    completed_phases: list[str]

    # Results from each phase
    intake_result: dict[str, Any]
    identity_result: dict[str, Any]
    legal_result: dict[str, Any]
    crm_result: dict[str, Any]
    training_result: dict[str, Any]
    provisioning_result: dict[str, Any]

    # Error handling
    errors: list[dict[str, Any]]
    requires_human_review: bool
    human_review_reason: str | None

    # Metadata
    messages: list[dict[str, Any]]
    context: dict[str, Any]


def create_initial_state(
    customer_id: str,
    workflow_id: str,
    customer_data: dict[str, Any],
) -> OnboardingState:
    """Create initial state for a new onboarding workflow."""
    return OnboardingState(
        customer_id=customer_id,
        customer_data=customer_data,
        workflow_id=workflow_id,
        current_phase="intake",
        completed_phases=[],
        intake_result={},
        identity_result={},
        legal_result={},
        crm_result={},
        training_result={},
        provisioning_result={},
        errors=[],
        requires_human_review=False,
        human_review_reason=None,
        messages=[],
        context={},
    )


class WorkflowEngine:
    """
    LangGraph-based workflow engine for orchestrating onboarding.
    """

    def __init__(self) -> None:
        """Initialize the workflow engine."""
        self.graph: StateGraph | None = None
        self._compiled = None

    def build_graph(self) -> StateGraph:
        """Build the onboarding workflow graph."""
        from app.orchestrator.graphs.onboarding_graph import build_onboarding_graph

        self.graph = build_onboarding_graph()
        return self.graph

    def compile(self) -> Any:
        """Compile the graph for execution."""
        if self.graph is None:
            self.build_graph()
        self._compiled = self.graph.compile()
        return self._compiled

    async def _update_persistence(self, workflow_id: str, node_name: str, state: OnboardingState):
        """Update database with current workflow state and step info."""
        from app.models.database.onboarding_workflow import OnboardingWorkflow, WorkflowStatus
        from app.models.database.workflow_step import WorkflowStep, StepStatus, StepType

        async with async_session_factory() as session:
            try:
                # Get workflow
                workflow_uuid = UUID(workflow_id)
                workflow = await session.get(OnboardingWorkflow, workflow_uuid)
                if not workflow:
                    return

                # Update workflow main status
                workflow.current_step = node_name
                workflow.state = dict(state)

                # Simple progress calculation
                total_phases = 6
                completed_count = len(state.get("completed_phases", []))
                workflow.completed_steps = completed_count
                workflow.progress_percentage = int((completed_count / total_phases) * 100)

                # Create or update step record
                # Note: This is an simplified version. In production, you'd want to track durations etc.
                step = WorkflowStep(
                    workflow_id=workflow_uuid,
                    step_name=node_name,
                    step_type=StepType.AGENT if node_name != "intake" else StepType.INTEGRATION,
                    sequence_order=completed_count,
                    status=StepStatus.COMPLETED,
                    completed_at=datetime.now(timezone.utc),
                    output_data=state.get(f"{node_name}_result", {}),
                )
                session.add(step)

                await session.commit()
            except Exception as e:
                logger.error("persistence_update_failed", error=str(e), workflow_id=workflow_id)
                await session.rollback()

    async def _finalize_workflow(self, workflow_id: str, final_state: OnboardingState):
        """Mark workflow as completed in database."""
        from app.models.database.onboarding_workflow import OnboardingWorkflow, WorkflowStatus

        async with async_session_factory() as session:
            try:
                workflow_uuid = UUID(workflow_id)
                workflow = await session.get(OnboardingWorkflow, workflow_uuid)
                if workflow:
                    if final_state.get("requires_human_review"):
                        workflow.status = WorkflowStatus.AWAITING_APPROVAL
                    else:
                        workflow.status = WorkflowStatus.COMPLETED
                        workflow.completed_at = datetime.now(timezone.utc)
                        workflow.progress_percentage = 100

                    await session.commit()
            except Exception as e:
                logger.error("workflow_finalization_failed", error=str(e), workflow_id=workflow_id)
                await session.rollback()

    async def execute(
        self,
        initial_state: OnboardingState,
        config: dict[str, Any] | None = None,
    ) -> OnboardingState:
        """Execute the workflow and persist progress."""
        if self._compiled is None:
            self.compile()

        workflow_id = initial_state.get("workflow_id")
        last_state = initial_state

        async for event in self._compiled.astream(initial_state, config=config or {}):
            for node_name, state_update in event.items():
                if node_name != "__metadata__":
                    # Combine existing state with update for persistence
                    last_state = {**last_state, **state_update}
                    await self._update_persistence(workflow_id, node_name, last_state)

        await self._finalize_workflow(workflow_id, last_state)
        return last_state

    async def stream(
        self,
        initial_state: OnboardingState,
        config: dict[str, Any] | None = None,
    ):
        """Stream workflow execution for real-time updates."""
        if self._compiled is None:
            self.compile()

        async for state in self._compiled.astream(initial_state, config=config or {}):
            yield state


# Global workflow engine instance
workflow_engine = WorkflowEngine()
