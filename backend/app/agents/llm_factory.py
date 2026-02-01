"""LLM Factory for creating configured ChatModel instances."""

from typing import Literal

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI

from app.config import settings


class LLMFactory:
    """
    Factory for creating configured LLM instances.

    Centralizes LLM configuration and instantiation logic to ensure
    consistency across all agents.
    """

    @staticmethod
    def create(
        provider: Literal["openai", "anthropic", "azure"] | None = None,
        model: str | None = None,
        temperature: float | None = None,
        streaming: bool = True,
    ) -> BaseChatModel:
        """
        Create a configured chat model instance.

        Args:
            provider: LLM provider override (default: from settings)
            model: Model name override (default: from settings)
            temperature: Temperature override (default: from settings)
            streaming: Whether to enable streaming (default: True)

        Returns:
            Configured BaseChatModel instance
        """
        provider = provider or settings.llm_provider
        model = model or settings.llm_model
        temperature = temperature if temperature is not None else settings.llm_temperature

        if provider == "anthropic":
            return ChatAnthropic(
                model=model,
                temperature=temperature,
                anthropic_api_key=settings.anthropic_api_key,
                streaming=streaming,
                max_retries=3,
            )
        elif provider == "openai":
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=settings.openai_api_key,
                streaming=streaming,
                max_retries=3,
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")


# Default LLM instance for convenience
default_llm = LLMFactory.create()
