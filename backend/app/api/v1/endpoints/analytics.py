"""Analytics endpoints for dashboard metrics and reporting."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, desc, select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import logging

from app.database.session import get_db_session
from app.models.database.onboarding_workflow import OnboardingWorkflow
from app.models.database.workflow_step import WorkflowStep
from app.models.database.customer import Customer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
async def get_analytics_summary(
    session: AsyncSession = Depends(get_db_session),
    days: int = Query(30, ge=1, le=365)
):
    """Get comprehensive analytics summary for the last N days."""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        total_result = await session.execute(
            select(func.count(OnboardingWorkflow.id)).where(
                OnboardingWorkflow.created_at >= cutoff_date
            )
        )
        total_workflows = total_result.scalar() or 0
        
        completed_result = await session.execute(
            select(func.count(OnboardingWorkflow.id)).where(
                and_(
                    OnboardingWorkflow.created_at >= cutoff_date,
                    OnboardingWorkflow.status == "completed"
                )
            )
        )
        completed_workflows = completed_result.scalar() or 0
        
        failed_result = await session.execute(
            select(func.count(OnboardingWorkflow.id)).where(
                and_(
                    OnboardingWorkflow.created_at >= cutoff_date,
                    OnboardingWorkflow.status == "failed"
                )
            )
        )
        failed_workflows = failed_result.scalar() or 0
        
        in_progress_result = await session.execute(
            select(func.count(OnboardingWorkflow.id)).where(
                and_(
                    OnboardingWorkflow.created_at >= cutoff_date,
                    OnboardingWorkflow.status == "in_progress"
                )
            )
        )
        in_progress_workflows = in_progress_result.scalar() or 0
        
        pending_result = await session.execute(
            select(func.count(OnboardingWorkflow.id)).where(
                and_(
                    OnboardingWorkflow.created_at >= cutoff_date,
                    OnboardingWorkflow.status == "awaiting_approval"
                )
            )
        )
        pending_workflows = pending_result.scalar() or 0
        
        success_rate = (
            (completed_workflows / total_workflows * 100) if total_workflows > 0 else 0
        )
        
        customer_result = await session.execute(
            select(func.count(Customer.id)).where(
                Customer.created_at >= cutoff_date
            )
        )
        total_customers = customer_result.scalar() or 0
        
        return {
            "period_days": days,
            "total_workflows": total_workflows,
            "completed_workflows": completed_workflows,
            "failed_workflows": failed_workflows,
            "in_progress_workflows": in_progress_workflows,
            "pending_approval_workflows": pending_workflows,
            "success_rate": round(success_rate, 2),
            "failure_rate": round((failed_workflows / total_workflows * 100) if total_workflows > 0 else 0, 2),
            "avg_completion_minutes": 0,
            "total_customers_onboarded": total_customers,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics")


@router.get("/trends")
async def get_analytics_trends(
    session: AsyncSession = Depends(get_db_session),
    days: int = Query(30, ge=1, le=365),
    granularity: str = Query("daily", regex="^(hourly|daily|weekly)$")
):
    """Get trends data for visualization over time."""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        trends_result = await session.execute(
            select(
                func.date(OnboardingWorkflow.created_at).label('date'),
                func.count(OnboardingWorkflow.id).label('total'),
            ).where(OnboardingWorkflow.created_at >= cutoff_date)
            .group_by(func.date(OnboardingWorkflow.created_at))
            .order_by(func.date(OnboardingWorkflow.created_at))
        )
        
        trends = []
        for trend_date, total in trends_result.all():
            trends.append({
                "date": trend_date.isoformat() if trend_date else None,
                "total_workflows": total,
                "completed": 0,
                "failed": 0,
                "success_rate": 0,
                "failure_rate": 0
            })
        
        return {
            "granularity": granularity,
            "period_days": days,
            "data_points": len(trends),
            "trends": trends
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed")


@router.get("/workflow-status-breakdown")
async def get_workflow_status_breakdown(
    session: AsyncSession = Depends(get_db_session),
    days: int = Query(30, ge=1, le=365)
):
    """Get breakdown of workflows by status."""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        statuses_result = await session.execute(
            select(
                OnboardingWorkflow.status,
                func.count(OnboardingWorkflow.id).label('count')
            ).where(OnboardingWorkflow.created_at >= cutoff_date)
            .group_by(OnboardingWorkflow.status)
        )
        
        total = 0
        breakdown = []
        for status, count in statuses_result.all():
            total += count
            breakdown.append({
                "status": status,
                "count": count,
                "percentage": 0
            })
        
        for item in breakdown:
            item["percentage"] = round((item["count"] / total * 100) if total > 0 else 0, 2)
        
        return {
            "period_days": days,
            "total_workflows": total,
            "breakdown": breakdown
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed")


@router.get("/workflow-types")
async def get_workflow_types_breakdown(
    session: AsyncSession = Depends(get_db_session),
    days: int = Query(30, ge=1, le=365)
):
    """Get breakdown of workflows by type."""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        types_result = await session.execute(
            select(
                OnboardingWorkflow.workflow_type,
                func.count(OnboardingWorkflow.id).label('count'),
            ).where(OnboardingWorkflow.created_at >= cutoff_date)
            .group_by(OnboardingWorkflow.workflow_type)
        )
        
        total = 0
        breakdown = []
        for wf_type, count in types_result.all():
            total += count
            breakdown.append({
                "workflow_type": wf_type,
                "count": count,
                "percentage": 0,
                "avg_duration_minutes": 0
            })
        
        for item in breakdown:
            item["percentage"] = round((item["count"] / total * 100) if total > 0 else 0, 2)
        
        return {
            "period_days": days,
            "total_workflows": total,
            "breakdown": breakdown
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed")


@router.get("/step-analytics")
async def get_step_analytics(
    session: AsyncSession = Depends(get_db_session),
    days: int = Query(30, ge=1, le=365)
):
    """Get analytics for individual workflow steps."""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        steps_result = await session.execute(
            select(
                WorkflowStep.step_name,
                func.count(WorkflowStep.id).label('total_executions'),
            ).join(OnboardingWorkflow)
            .where(OnboardingWorkflow.created_at >= cutoff_date)
            .group_by(WorkflowStep.step_name)
            .order_by(desc(func.count(WorkflowStep.id)))
        )
        
        step_data = []
        for step_name, total in steps_result.all():
            step_data.append({
                "step_name": step_name,
                "total_executions": total,
                "successful_executions": 0,
                "failed_executions": 0,
                "success_rate": 0,
                "avg_duration_minutes": 0
            })
        
        return {
            "period_days": days,
            "total_steps": len(step_data),
            "steps": step_data
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed")


@router.get("/customer-analytics")
async def get_customer_analytics(
    session: AsyncSession = Depends(get_db_session),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=100)
):
    """Get analytics for customers and their onboarding progress."""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        customers_result = await session.execute(
            select(
                Customer.id,
                Customer.company_name,
                func.count(OnboardingWorkflow.id).label('workflow_count'),
            ).join(OnboardingWorkflow, Customer.id == OnboardingWorkflow.customer_id, isouter=True)
            .where(Customer.created_at >= cutoff_date)
            .group_by(Customer.id, Customer.company_name)
            .order_by(desc(func.count(OnboardingWorkflow.id)))
            .limit(limit)
        )
        
        customer_data = []
        for customer_id, company_name, wf_count in customers_result.all():
            customer_data.append({
                "customer_id": str(customer_id),
                "company_name": company_name,
                "workflow_count": wf_count or 0,
                "completed_count": 0,
                "completion_rate": 0,
                "avg_completion_minutes": 0
            })
        
        return {
            "period_days": days,
            "total_customers": len(customer_data),
            "customers": customer_data
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed")
