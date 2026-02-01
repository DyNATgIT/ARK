"""Agent registry for discovery and instantiation."""

from typing import Type

from app.agents.base_agent import BaseAgent


class AgentRegistry:
    """
    Registry for all specialized agents.

    Provides discovery and instantiation of agents by name.
    """

    _agents: dict[str, Type[BaseAgent]] = {}

    @classmethod
    def register(cls, name: str) -> callable:
        """
        Decorator to register an agent class.

        Usage:
            @AgentRegistry.register("legal")
            class LegalAgent(BaseAgent):
                ...
        """

        def decorator(agent_class: Type[BaseAgent]) -> Type[BaseAgent]:
            cls._agents[name] = agent_class
            return agent_class

        return decorator

    @classmethod
    def get(cls, name: str) -> Type[BaseAgent] | None:
        """Get an agent class by name."""
        return cls._agents.get(name)

    @classmethod
    def create(cls, name: str, **kwargs) -> BaseAgent | None:
        """Create an agent instance by name."""
        agent_class = cls.get(name)
        if agent_class:
            return agent_class(**kwargs)
        return None

    @classmethod
    def list_agents(cls) -> list[str]:
        """List all registered agent names."""
        return list(cls._agents.keys())

    @classmethod
    def get_all(cls) -> dict[str, Type[BaseAgent]]:
        """Get all registered agents."""
        return cls._agents.copy()
