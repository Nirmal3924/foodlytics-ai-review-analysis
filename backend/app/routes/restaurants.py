from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database import get_db
from app.models.models import Restaurant, Review
from app.schemas.schemas import RestaurantOut, RestaurantList, AIRecommendRequest, AIRestaurantPick, AIChatRequest, AIChatResponse
from app.services.auth_service import get_current_user
from app.services.ai_service import get_ai_recommendations, process_ai_chat
from app.models.models import User
from app.utils import is_open_now

router = APIRouter()


@router.get("/", response_model=RestaurantList)
def get_restaurants(
    search: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None),
    max_cost: Optional[int] = Query(None),
    min_cost: Optional[int] = Query(None),
    cuisine: Optional[str] = Query(None),
    open_now: Optional[bool] = Query(None),
    is_veg: Optional[bool] = Query(None),
    outdoor_seating: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)

    if search:
        query = query.filter(
            or_(
                Restaurant.name.ilike(f"%{search}%"),
                Restaurant.cuisines.ilike(f"%{search}%"),
                Restaurant.area.ilike(f"%{search}%"),
                Restaurant.city.ilike(f"%{search}%"),
            )
        )
    if area:
        query = query.filter(Restaurant.area == area)
    if city:
        query = query.filter(Restaurant.city == city)
    if category:
        query = query.filter(Restaurant.category == category)
    if min_rating is not None:
        query = query.filter(Restaurant.avg_rating >= min_rating)
    if max_cost is not None:
        query = query.filter(Restaurant.cost <= max_cost)
    if min_cost is not None:
        query = query.filter(Restaurant.cost >= min_cost)
    if cuisine:
        query = query.filter(Restaurant.cuisines.ilike(f"%{cuisine}%"))
    if open_now:
        # Basic filter first to avoid evaluating None timings
        query = query.filter(Restaurant.timings.isnot(None), Restaurant.timings != "")
    if is_veg:
        query = query.filter(
            or_(
                Restaurant.cuisines.ilike("%Vegetarian%"),
                Restaurant.cuisines.ilike("%Pure Veg%")
            )
        )
    if outdoor_seating:
        query = query.filter(Restaurant.collections.ilike("%Outdoor Seating%"))

    # Fetch all matching first to apply python-level filters and count accurately
    restaurants_query_result = query.order_by(Restaurant.avg_rating.desc(), Restaurant.id.asc()).all()
    
    if open_now:
        restaurants_query_result = [r for r in restaurants_query_result if is_open_now(r.timings)]

    total = len(restaurants_query_result)
    
    # Paginate
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_restaurants = restaurants_query_result[start_idx:end_idx]

    return RestaurantList(
        restaurants=paginated_restaurants,
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/top", response_model=list[RestaurantOut])
def get_top_restaurants(city: Optional[str] = Query(None), limit: int = Query(8, le=20), db: Session = Depends(get_db)):
    query = db.query(Restaurant).filter(Restaurant.avg_rating >= 4.5)
    if city:
        query = query.filter(Restaurant.city == city)
    return query.order_by(Restaurant.avg_rating.desc()).limit(limit).all()


@router.get("/hidden-gems", response_model=list[RestaurantOut])
def get_hidden_gems(city: Optional[str] = Query(None), limit: int = Query(8, le=20), db: Session = Depends(get_db)):
    query = db.query(Restaurant).filter(Restaurant.category == "Hidden Gem")
    if city:
        query = query.filter(Restaurant.city == city)
    return query.order_by(Restaurant.avg_rating.desc()).limit(limit).all()


@router.get("/overrated", response_model=list[RestaurantOut])
def get_overrated(city: Optional[str] = Query(None), limit: int = Query(8, le=20), db: Session = Depends(get_db)):
    query = db.query(Restaurant).filter(Restaurant.avg_rating < 3.2)
    if city:
        query = query.filter(Restaurant.city == city)
    return query.order_by(Restaurant.avg_rating.asc()).limit(limit).all()


@router.get("/areas", response_model=list[str])
def get_areas(db: Session = Depends(get_db)):
    rows = db.query(Restaurant.area).distinct().filter(Restaurant.area.isnot(None)).all()
    return sorted([r[0] for r in rows if r[0]])


@router.get("/cities", response_model=list[str])
def get_cities(db: Session = Depends(get_db)):
    rows = db.query(Restaurant.city).distinct().filter(Restaurant.city.isnot(None)).all()
    return sorted([r[0] for r in rows if r[0]])


@router.get("/cuisines", response_model=list[str])
def get_cuisines(db: Session = Depends(get_db)):
    rows = db.query(Restaurant.cuisines).all()
    all_cuisines = set()
    for row in rows:
        if row[0]:
            for c in row[0].split(","):
                all_cuisines.add(c.strip())
    return sorted(list(all_cuisines))


@router.get("/{restaurant_id}", response_model=RestaurantOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return r


@router.get("/{restaurant_id}/reviews")
def get_reviews(
    restaurant_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, le=50),
    db: Session = Depends(get_db)
):
    r = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    total = db.query(Review).filter(Review.restaurant_id == restaurant_id).count()
    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {"reviews": reviews, "total": total, "page": page, "per_page": per_page}


@router.post("/ai-recommend", response_model=List[AIRestaurantPick])
def ai_recommend(req: AIRecommendRequest, db: Session = Depends(get_db)):
    try:
        return get_ai_recommendations(req, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai-chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest, db: Session = Depends(get_db)):
    try:
        return process_ai_chat(req, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

