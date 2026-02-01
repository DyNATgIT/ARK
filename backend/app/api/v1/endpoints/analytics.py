"""
Analytics endpoints for dashboard metrics and reporting.
Provides comprehensive analytics data for onboarding workflows and system performance.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import logging

from app.core.exceptions import DatabaseError
from app.database.session import get_db
from app.models.database.onboarding_workflow import OnboardingWorkflow
from app.models.database.workflow_step import WorkflowStep
from app.models.database.customer import Customer
from app.models.schemas.common import PaginatedResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])


class OnboardingMetrics:
    """Pydantic model for onboarding metrics"""
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


class AnalyticsSummary:
    """Pydantic model for analytics summary"""
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


class TimeSeriesData:
    """Pydantic model for time series data"""
    
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


@router.get("/summary")
async def get_analytics_summary(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get comprehensive analytics summary for the last N days.
    
    Args:
        db: Database session
        days: Number of days to analyze (default: 30)
        
    Returns:
        Analytics summary including key metrics
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Total workflows in period
        total_workflows = db.query(func.count(OnboardingWorkflow.id)).filter(
            OnboardingWorkflow.created_at >= cutoff_date
        ).scalar() or 0
        
        # Completed workflows
        completed_workflows = db.query(func.count(OnboardingWorkflow.id)).filter(
            OnboardingWorkflow.created_at >= cutoff_date,
            OnboardingWorkflow.status == "completed"
        ).scalar() or 0
        
        # Failed workflows
        failed_workflows = db.query(func.count(OnboardingWorkflow.id)).filter(
            OnboardingWorkflow.created_at >= cutoff_date,
            OnboardingWorkflow.status == "failed"
        ).scalar() or 0
        
        # In-progress workflows
        in_progress_workflows = db.query(func.count(OnboardingWorkflow.id)).filter(
            OnboardingWorkflow.created_at >= cutoff_date,
            OnboardingWorkflow.status == "in_progress"
        ).scalar() or 0
        
        # Success rate
        success_rate = (
            (completed_workflows / total_workflows * 100) if total_workflows > 0 else 0
        )
        
        # Average completion time
        completed_wfs = db.query(OnboardingWorkflow).filter(
            OnboardingWorkflow.created_at >= cutoff_date,
            OnboardingWorkflow.status == "completed"
        ).all()
        
        avg_completion_minutes = 0
        if completed_wfs:
            total_minutes = sum(
                (wf.updated_at - wf.created_at).total_seconds() / 60
                for wf in completed_wfs if wf.updated_at
            )
            avg_completion_minutes = total_minutes / len(completed_wfs)
        
        # Pending approvals
        pending_workflows = db.query(func.count(OnboardingWorkflow.id)).filter(
            OnboardingWorkflow.created_at >= cutoff_date,
            OnboardingWorkflow.status == "pending_approval"
        ).scalar() or 0
        
        # Total unique customers
        total_customers = db.query(func.count(Customer.id)).filter(
            Customer.created_at >= cutoff_date
        ).scalar() or 0
        
        return {
            "period_days": days,
            "total_workflows": total_workflows,
            "completed_workflows": completed_workflows,
            "failed_workflows": failed_workflows,
            "in_progress_workflows": in_progress_workflows,
            "pending_approval_workflows": pending_workflows,
            "success_rate": round(success_rate, 2),
            "failure_rate": round((failed_workflows / total_workflows * 100) if total_workflows > 0 else 0, 2),
            "avg_completion_minutes": round(avg_completion_minutes, 2),
            "total_customers_onboarded": total_customers,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error generating analytics summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics summary")


@router.get("/trends")
async def get_analytics_trends(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365),
    granularity: str = Query("daily", regex="^(hourly|daily|weekly)$")
):
    """
    Get trends data for visualization over time.
    
    Args:
        db: Database session
        days: Number of days to analyze
        granularity: Time granularity for data points (hourly, daily, weekly)
        
    Returns:
        Time series data for trending metrics
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Build date grouping query
        workflows = db.query(
            func.date_trunc('day', OnboardingWorkflow.created_at).label('date'),
            func.count(OnboardingWorkflow.id).label('total'),
            func.sum(
                func.cast(
                    (OnboardingWorkflow.status == 'completed'),
                    type_=int
                )
            ).label('completed'),
            func.sum(
                func.cast(
                    (OnboardingWorkflow.status == 'failed'),
                    type_=int
                )
            ).label('failed')
        ).filter(
            OnboardingWorkflow.created_at >= cutoff_date
        ).group_by(
            func.date_trunc('day', OnboardingWorkflow.created_at)
        ).order_by(
            func.date_trunc('day', OnboardingWorkflow.created_at)
        ).all()
        
        trends = []
        for workflow_date, total, completed, failed in workflows:
            completed = completed or 0
            failed = failed or 0
            trends.append({
                "date": workflow_date.isoformat() if workflow_date else None,
                "total_workflows": total,
                "completed": completed,
                "failed": failed,
                "success_rate": round((completed / total * 100) if total > 0 else 0, 2),
                "failure_rate": round((failed / total * 100) if total > 0 else 0, 2)
            })
        
        return {
            "granularity": granularity,
            "period_days": days,
            "data_points": len(trends),
            "trends": trends
        }
    except Exception as e:
        logger.error(f"Error generating trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate trends data")


@router.get("/workflow-status-breakdown")
async def get_workflow_status_breakdown(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get breakdown of workflows by status.
    
    Args:
        db: Database session
        days: Number of days to analyze
        
    Returns:
        Count of workflows in each status
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        statuses = db.query(
            OnboardingWorkflow.status,
            func.count(OnboardingWorkflow.id).label('count')
        ).filter(
            OnboardingWorkflow.created_at >= cutoff_date
        ).group_by(
            OnboardingWorkflow.status
        ).all()
        
        total = sum(count for _, count in statuses)
        
        breakdown = []
        for status, count in statuses:
            percentage = (count / total * 100) if total > 0 else 0
            breakdown.append({
                "status": status,
                "count": count,
                "percentage": round(percentage, 2)
            })
        
        return {
            "period_days": days,
            "total_workflows": total,
            "breakdown": breakdown
        }
    except Exception as e:
        logger.error(f"Error getting workflow status breakdown: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get status breakdown")


@router.get("/workflow-types")
async def get_workflow_types_breakdown(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get breakdown of workflows by type.
    
    Args:
        db: Database session
        days: Number of days to analyze
        
    Returns:
        Count of workflows by type
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        types = db.query(
            OnboardingWorkflow.workflow_type,
            func.count(OnboardingWorkflow.id).label('count'),
            func.avg(
                func.extract('epoch', OnboardingWorkflow.updated_at - OnboardingWorkflow.created_at) / 60
            ).label('avg_duration')
        ).filter(
            OnboardingWorkflow.created_at >= cutoff_date
        ).group_by(
            OnboardingWorkflow.workflow_type
        ).all()
        
        breakdown = []
        total = sum(count for _, count, _ in types)
        
        for wf_type, count, avg_duration in types:
            percentage = (count / total * 100) if total > 0 else 0
            breakdown.append({
                "workflow_type": wf_type,
                "count": count,
                "percentage": round(percentage, 2),
                "avg_duration_minutes": round(avg_duration, 2) if avg_duration else 0
            })
        
        return {
            "period_days": days,
            "total_workflows": total,
            "breakdown": breakdown
        }
    except Exception as e:
        logger.error(f"Error getting workflow types breakdown: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get workflow types")


@router.get("/step-analytics")
async def get_step_analytics(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get analytics for individual workflow steps.
    
    Args:
        db: Database session
        days: Number of days to analyze
        
    Returns:
        Step-level metrics and performance data
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        steps = db.query(
            WorkflowStep.step_name,
            func.count(WorkflowStep.id).label('total_executions'),
            func.sum(
                func.cast(
                    (WorkflowStep.status == 'completed'),
                    type_=int
                )
            ).label('successful_executions'),
            func.sum(
                func.cast(
                    (WorkflowStep.status == 'failed'),
                    type_=int
                )
            ).label('failed_executions'),
            func.avg(
                func.extract('epoch', WorkflowStep.completed_at - WorkflowStep.started_at) / 60
            ).label('avg_duration')
        ).join(
            OnboardingWorkflow,
            WorkflowStep.workflow_id == OnboardingWorkflow.id
        ).filter(
            OnboardingWorkflow.created_at >= cutoff_date
        ).group_by(
            WorkflowStep.step_name
        ).order_by(
            desc(func.count(WorkflowStep.id))
        ).all()
        
        step_data = []
        for step_name, total, successful, failed, avg_duration in steps:
            successful = successful or 0
            failed = failed or 0
            success_rate = (successful / total * 100) if total > 0 else 0
            
            step_data.append({
                "step_name": step_name,
                "total_executions": total,
                "successful_executions": successful,
                "failed_executions": failed,
                "success_rate": round(success_rate, 2),
                "avg_duration_minutes": round(avg_duration, 2) if avg_duration else 0
            })
        
        return {
            "period_days": days,
            "total_steps": len(step_data),
            "steps": step_data
        }
    except Exception as e:
        logger.error(f"Error getting step analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get step analytics")


@router.get("/customer-analytics")
async def get_customer_analytics(
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=100)
):
    """
    Get analytics for customers and their onboarding progress.
    
    Args:
        db: Database session
        days: Number of days to analyze
        limit: Max number of customers to return
        
    Returns:
        Customer-level analytics
    """
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        customers = db.query(
            Customer.id,
            Customer.company_name,
            func.count(OnboardingWorkflow.id).label('workflow_count'),
            func.sum(
                func.cast(
                    (OnboardingWorkflow.status == 'completed'),
                    type_=int
                )
            ).label('completed_count'),
            func.avg(
                func.extract('epoch', OnboardingWorkflow.updated_at - OnboardingWorkflow.created_at) / 60
            ).label('avg_completion_time')
        ).join(
            OnboardingWorkflow,
            Customer.id == OnboardingWorkflow.customer_id,
            isouter=True
        ).filter(
            Customer.created_at >= cutoff_date
        ).group_by(
            Customer.id,
            Customer.company_name
        ).order_by(
            desc(func.count(OnboardingWorkflow.id))
        ).limit(limit).all()
        
        customer_data = []
        for customer_id, company_name, wf_count, completed, avg_time in customers:
            completed = completed or 0
            wf_count = wf_count or 0
            completion_rate = (completed / wf_count * 100) if wf_count > 0 else 0
            
            customer_data.append({
                "customer_id": str(customer_id),
                "company_name": company_name,
                "workflow_count": wf_count,
                "completed_count": completed,
                "completion_rate": round(completion_rate, 2),
                "avg_completion_minutes": round(avg_time, 2) if avg_time else 0
            })
        
        return {
            "period_days": days,
            "total_customers": len(customer_data),
            "customers": customer_data
        }
    except Exception as e:
        logger.error(f"Error getting customer analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get customer analytics")
