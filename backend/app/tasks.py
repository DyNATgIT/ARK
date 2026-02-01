"""Celery task definitions for background processing."""

import asyncio
import structlog
from celery import Celery

from app.config import settings
from app.orchestrator.workflow_engine import workflow_engine

logger = structlog.get_logger()

# Initialize Celery app
celery_app = Celery(
    "onboarding_tasks",
    broker=str(settings.celery_broker_url),
    backend=str(settings.celery_result_backend),
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour
)


@celery_app.task(name="app.tasks.run_onboarding_workflow")
def run_onboarding_workflow(initial_state: dict) -> dict:
    """
    Celery task to execute the onboarding workflow LangGraph.

    This task runs the async workflow engine in a synchronous Celery worker.
    """
    logger.info("starting_onboarding_task", workflow_id=initial_state.get("workflow_id"))

    try:
        # Run the async workflow execution
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # If for some reason a loop is already running, use a different approach
            # but usually in a celery worker process it won't be.
            result = loop.run_until_complete(workflow_engine.execute(initial_state))
        else:
            result = asyncio.run(workflow_engine.execute(initial_state))

        logger.info("onboarding_task_completed", workflow_id=initial_state.get("workflow_id"))
        return result
    except Exception as e:
        logger.error(
            "onboarding_task_failed", workflow_id=initial_state.get("workflow_id"), error=str(e)
        )
        raise
