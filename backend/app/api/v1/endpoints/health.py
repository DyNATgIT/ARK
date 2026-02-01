"""Health check endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.events import get_redis
from app.database.session import get_db_session
from app.models.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check(
    db: AsyncSession = Depends(get_db_session),
) -> HealthResponse:
    """
    Health check endpoint for monitoring.

    Checks database and Redis connectivity.
    """
    # Check database
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    # Check Redis
    redis_status = "connected"
    redis = get_redis()
    if redis:
        try:
            await redis.ping()
        except Exception:
            redis_status = "disconnected"
    else:
        redis_status = "not configured"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        version=settings.app_version,
        environment=settings.environment,
        database=db_status,
        redis=redis_status,
    )


@router.get("/health/ready")
async def readiness_check() -> dict[str, str]:
    """Kubernetes readiness probe endpoint."""
    return {"status": "ready"}


@router.get("/health/live")
async def liveness_check() -> dict[str, str]:
    """Kubernetes liveness probe endpoint."""
    return {"status": "alive"}
