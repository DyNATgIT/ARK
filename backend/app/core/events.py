"""Application lifecycle event handlers."""

import structlog
from redis.asyncio import Redis

from app.config import settings
from app.database.session import engine

logger = structlog.get_logger()

# Global Redis connection
redis_client: Redis | None = None


async def create_start_handler() -> None:
    """Handle application startup events."""
    global redis_client

    await logger.ainfo("application_starting", environment=settings.environment)

    # Initialize Redis connection
    try:
        redis_client = Redis.from_url(
            str(settings.redis_url),
            encoding="utf-8",
            decode_responses=True,
        )
        await redis_client.ping()
        await logger.ainfo("redis_connected", url=str(settings.redis_url))
    except Exception as e:
        await logger.awarning("redis_connection_failed", error=str(e))
        redis_client = None

    # Test database connection
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        await logger.ainfo("database_connected")
    except Exception as e:
        await logger.aerror("database_connection_failed", error=str(e))
        raise

    await logger.ainfo("application_started", version=settings.app_version)


async def create_stop_handler() -> None:
    """Handle application shutdown events."""
    global redis_client

    await logger.ainfo("application_stopping")

    # Close Redis connection
    if redis_client:
        await redis_client.close()
        await logger.ainfo("redis_disconnected")

    # Dispose database engine
    await engine.dispose()
    await logger.ainfo("database_disconnected")

    await logger.ainfo("application_stopped")


def get_redis() -> Redis | None:
    """Get Redis client instance."""
    return redis_client
