"""API v1 router aggregator."""

from fastapi import APIRouter

from app.api.v1.endpoints import analytics, customers, health, onboarding

api_router = APIRouter()

# Health check endpoints (no prefix)
api_router.include_router(health.router, tags=["Health"])

# Business endpoints
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["Onboarding"])
api_router.include_router(analytics.router, tags=["Analytics"])
