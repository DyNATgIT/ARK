"""LangGraph workflow engine and state management."""

from typing import Any, Literal, TypedDict

from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field


class OnboardingState(TypedDict):
    """
    State structure for the onboarding workflow.

    This is the central state that flows through all nodes
    in the LangGraph workflow.
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

    Manages the state machine and execution of the onboarding workflow
    through various phases handled by specialized agents.
    """

    def __init__(self) -> None:
        """Initialize the workflow engine."""
        self.graph: StateGraph | None = None
        self._compiled = None

    def build_graph(self) -> StateGraph:
        """
        Build the onboarding workflow graph.

        Returns a StateGraph with all nodes and edges configured.
        """
        from app.orchestrator.graphs.onboarding_graph import build_onboarding_graph

        self.graph = build_onboarding_graph()
        return self.graph

    def compile(self) -> Any:
        """Compile the graph for execution."""
        if self.graph is None:
            self.build_graph()
        self._compiled = self.graph.compile()
        return self._compiled

    async def execute(
        self,
        initial_state: OnboardingState,
        config: dict[str, Any] | None = None,
    ) -> OnboardingState:
        """
        Execute the workflow with the given initial state.

        Args:
            initial_state: Starting state for the workflow
            config: Optional configuration for execution

        Returns:
            Final state after workflow completion
        """
        if self._compiled is None:
            self.compile()

        result = await self._compiled.ainvoke(initial_state, config=config or {})
        return result

    async def stream(
        self,
        initial_state: OnboardingState,
        config: dict[str, Any] | None = None,
    ):
        """
        Stream workflow execution for real-time updates.

        Yields state updates as the workflow progresses.
        """
        if self._compiled is None:
            self.compile()

        async for state in self._compiled.astream(initial_state, config=config or {}):
            yield state


# Global workflow engine instance
workflow_engine = WorkflowEngine()
