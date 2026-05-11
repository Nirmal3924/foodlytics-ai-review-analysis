from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Restaurant, Review, User
from app.schemas.schemas import RestaurantCreate, RestaurantUpdate, RestaurantOut, AdminStats
from app.services.auth_service import require_admin
from app.services.data_service import ingest_restaurant_csv, ingest_reviews_csv
import io

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    total_restaurants = db.query(Restaurant).count()
    total_reviews = db.query(Review).count()
    avg_rating = db.query(func.avg(Restaurant.avg_rating)).scalar() or 0.0
    data_start_date = db.query(func.min(Restaurant.created_at)).scalar()
    data_end_date = db.query(func.max(Restaurant.created_at)).scalar()

    top_rated = db.query(Restaurant).filter(Restaurant.avg_rating >= 4.5).count()
    hidden_gems = db.query(Restaurant).filter(Restaurant.category == "Hidden Gem").count()

    # Rating distribution buckets
    all_ratings = [r[0] for r in db.query(Restaurant.avg_rating).all() if r[0]]
    rating_dist = {
        "below_3": sum(1 for r in all_ratings if r < 3),
        "3_to_3_5": sum(1 for r in all_ratings if 3 <= r < 3.5),
        "3_5_to_4": sum(1 for r in all_ratings if 3.5 <= r < 4),
        "4_to_4_5": sum(1 for r in all_ratings if 4 <= r < 4.5),
        "above_4_5": sum(1 for r in all_ratings if r >= 4.5),
    }

    # Category breakdown
    cat_rows = db.query(Restaurant.category, func.count()).group_by(Restaurant.category).all()
    cat_breakdown = {row[0]: row[1] for row in cat_rows if row[0]}

    return AdminStats(
        total_restaurants=total_restaurants,
        total_reviews=total_reviews,
        avg_rating=round(avg_rating, 2),
        top_rated_count=top_rated,
        hidden_gem_count=hidden_gems,
        rating_distribution=rating_dist,
        category_breakdown=cat_breakdown,
        data_start_date=data_start_date,
        data_end_date=data_end_date
    )


@router.post("/upload/restaurants")
async def upload_restaurants(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    content = await file.read()
    inserted, skipped = ingest_restaurant_csv(io.StringIO(content.decode("utf-8")), db)
    return {"message": f"Upload complete", "inserted": inserted, "skipped": skipped}


@router.post("/upload/reviews")
async def upload_reviews(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    content = await file.read()
    inserted, skipped = ingest_reviews_csv(io.StringIO(content.decode("utf-8")), db)
    return {"message": f"Upload complete", "inserted": inserted, "skipped": skipped}


@router.post("/restaurants", response_model=RestaurantOut)
def create_restaurant(
    data: RestaurantCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    r = Restaurant(**data.dict())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.put("/restaurants/{restaurant_id}", response_model=RestaurantOut)
def update_restaurant(
    restaurant_id: int,
    data: RestaurantUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(r, field, value)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/restaurants/{restaurant_id}")
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    db.delete(r)
    db.commit()
    return {"message": f"Restaurant '{r.name}' deleted successfully"}


@router.get("/restaurants", response_model=list[RestaurantOut])
def admin_list_restaurants(
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    return (
        db.query(Restaurant)
        .order_by(Restaurant.avg_rating.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "created_at": u.created_at} for u in users]
