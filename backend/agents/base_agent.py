from abc import ABC, abstractmethod
from typing import Any

import structlog
from langchain_core.language_models import BaseChatModel
from pydantic import BaseModel, Field

from app.agents.llm_factory import LLMFactory

logger = structlog.get_logger()


class AgentState(BaseModel):
    """Base state for all agents."""

    messages: list[dict[str, Any]] = Field(default_factory=list)
    context: dict[str, Any] = Field(default_factory=dict)
    current_step: str = ""
    error: str | None = None
    completed: bool = False


class AgentResult(BaseModel):
    """Result from agent execution."""

    success: bool
    data: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None
    confidence_score: float = 1.0
    tokens_used: int = 0
    tool_calls: list[str] = Field(default_factory=list)


class BaseAgent(ABC):
    """
    Abstract base class for all specialized agents.

    Defines the common interface and lifecycle for agents in the
    Customer Onboarding Orchestrator.
    """

    def __init__(
        self,
        name: str,
        description: str,
        llm: BaseChatModel | None = None,
        max_retries: int = 3,
        timeout_seconds: int = 300,
    ) -> None:
        """Initialize the base agent."""
        self.name = name
        self.description = description
        self.llm = llm or LLMFactory.create()
        self.max_retries = max_retries
        self.timeout_seconds = timeout_seconds
        self.tools: list[Any] = []
        self._is_initialized = False

    @abstractmethod
    async def initialize(self) -> None:
        """
        Initialize the agent.

        This should set up the LLM, register tools, and prepare
        any resources needed for execution.
        """
        pass

    @abstractmethod
    async def execute(self, task: dict[str, Any], state: AgentState) -> AgentResult:
        """
        Execute the agent's main task.

        Args:
            task: The task description and parameters
            state: Current agent state

        Returns:
            AgentResult with execution results
        """
        pass

    @abstractmethod
    def get_tools(self) -> list[Any]:
        """Return the list of tools available to this agent."""
        pass

    async def handle_error(self, error: Exception, state: AgentState) -> AgentResult:
        """
        Handle errors during execution.

        Default implementation logs the error and returns a failed result.
        Override for custom error handling.
        """
        await logger.aerror(
            "agent_error",
            agent=self.name,
            error=str(error),
            state=state.model_dump(),
        )
        return AgentResult(
            success=False,
            error=str(error),
            confidence_score=0.0,
        )

    async def cleanup(self) -> None:
        """
        Clean up resources after execution.

        Override to implement custom cleanup logic.
        """
        pass

    async def run(self, task: dict[str, Any], state: AgentState | None = None) -> AgentResult:
        """
        Main entry point for running the agent.

        Handles initialization, execution, error handling, and cleanup.
        """
        if state is None:
            state = AgentState()

        if not self._is_initialized:
            await self.initialize()
            self._is_initialized = True

        await logger.ainfo(
            "agent_started",
            agent=self.name,
            task_type=task.get("type", "unknown"),
        )

        try:
            result = await self.execute(task, state)
            await logger.ainfo(
                "agent_completed",
                agent=self.name,
                success=result.success,
                confidence=result.confidence_score,
            )
            return result
        except Exception as e:
            return await self.handle_error(e, state)
        finally:
            await self.cleanup()

    def __repr__(self) -> str:
        """String representation of the agent."""
        return f"{self.__class__.__name__}(name={self.name})"
