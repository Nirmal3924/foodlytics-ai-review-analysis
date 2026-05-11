from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Restaurant, Review, User
from app.schemas.schemas import AnalysisResult
from app.services.auth_service import require_admin
from app.services.analysis_service import (
    run_sentiment_analysis,
    run_clustering,
    get_top_keywords,
    get_cuisine_performance
)

router = APIRouter()

_analysis_status = {"running": False, "completed": False, "progress": 0}


@router.post("/run")
def trigger_analysis(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    if _analysis_status["running"]:
        return {"message": "Analysis already in progress", "status": _analysis_status}
    _analysis_status.update({"running": True, "completed": False, "progress": 0})
    background_tasks.add_task(run_full_analysis, db)
    return {"message": "Analysis started", "status": _analysis_status}


@router.get("/status")
def get_analysis_status(_: User = Depends(require_admin)):
    return _analysis_status


@router.get("/results", response_model=AnalysisResult)
def get_analysis_results(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    total = db.query(Restaurant).count()
    avg = db.query(func.avg(Restaurant.avg_rating)).scalar() or 0.0

    # Sentiment breakdown (based on ratings)
    all_reviews = db.query(Review.rating).all()
    ratings = [r[0] for r in all_reviews if r[0] is not None]
    sentiment = {
        "very_positive": sum(1 for r in ratings if r == 5),
        "positive": sum(1 for r in ratings if r == 4),
        "neutral": sum(1 for r in ratings if r == 3),
        "negative": sum(1 for r in ratings if r == 2),
        "very_negative": sum(1 for r in ratings if r == 1),
    }

    # Clusters
    clusters = []
    for cluster_id in range(4):
        rests = db.query(Restaurant).filter(Restaurant.cluster_id == cluster_id).all()
        if rests:
            cluster_avg_rating = sum(r.avg_rating for r in rests) / len(rests)
            cluster_avg_cost = sum(r.cost for r in rests) / len(rests)
            clusters.append({
                "cluster_id": cluster_id,
                "count": len(rests),
                "avg_rating": round(cluster_avg_rating, 2),
                "avg_cost": round(cluster_avg_cost),
                "label": _cluster_label(cluster_avg_rating, cluster_avg_cost),
                "restaurants": [r.name for r in rests[:3]]
            })

    return AnalysisResult(
        total_restaurants=total,
        avg_rating=round(avg, 2),
        sentiment_breakdown=sentiment,
        clusters=clusters,
        top_keywords=get_top_keywords(db),
        cuisine_performance=get_cuisine_performance(db)
    )


def _cluster_label(avg_rating: float, avg_cost: float) -> str:
    if avg_rating >= 4.2 and avg_cost > 1200:
        return "Premium Dining"
    elif avg_rating >= 4.0 and avg_cost <= 700:
        return "Budget Gems"
    elif avg_rating >= 3.8:
        return "Popular Mid-Range"
    else:
        return "Disappointing"


def run_full_analysis(db: Session):
    """Background task: runs sentiment + clustering on all data."""
    try:
        _analysis_status["progress"] = 10
        restaurants = db.query(Restaurant).all()

        _analysis_status["progress"] = 30
        for r in restaurants:
            r.sentiment_score = run_sentiment_analysis(r, db)

        _analysis_status["progress"] = 60
        run_clustering(restaurants, db)

        _analysis_status["progress"] = 90
        db.commit()

        _analysis_status.update({"running": False, "completed": True, "progress": 100})
    except Exception as e:
        _analysis_status.update({"running": False, "completed": False, "progress": 0, "error": str(e)})
