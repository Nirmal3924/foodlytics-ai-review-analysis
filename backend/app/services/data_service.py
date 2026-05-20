"""
Data ingestion service
Parses uploaded CSV files and populates the PostgreSQL database.
"""
import csv
from io import StringIO
from sqlalchemy.orm import Session
from app.models.models import Restaurant, Review


def _parse_cost(cost_str: str) -> int:
    try:
        return int(str(cost_str).replace(",", "").strip())
    except (ValueError, AttributeError):
        return 0


def _row_lookup(row: dict, *keys: str) -> str:
    """Read a CSV column case-insensitively."""
    lower = {k.lower().strip() if k else "": (v or "").strip() for k, v in row.items()}
    for key in keys:
        val = lower.get(key.lower(), "")
        if val:
            return val
    return ""


def _derive_category(avg_rating: float) -> str:
    if avg_rating >= 4.5:
        return "Top Restaurant"
    elif avg_rating >= 4.0:
        return "Popular"
    elif avg_rating >= 3.5:
        return "Hidden Gem"
    return "Overrated"


def ingest_restaurant_csv(file: StringIO, db: Session) -> tuple[int, int]:
    """
    Parse Zomato_Restaurant_names_and_Metadata.csv
    Columns: Name, Links, Cost, Collections, Cuisines, Timings, City, Area
    """
    reader = csv.DictReader(file)
    inserted = 0
    skipped = 0

    for row in reader:
        name = _row_lookup(row, "name")
        if not name:
            skipped += 1
            continue
        if db.query(Restaurant).filter(Restaurant.name == name).first():
            skipped += 1
            continue

        city = _row_lookup(row, "city")
        area = _row_lookup(row, "area")

        restaurant = Restaurant(
            name=name,
            link=_row_lookup(row, "links", "link"),
            cost=_parse_cost(row.get("Cost") or row.get("cost") or "0"),
            collections=_row_lookup(row, "collections"),
            cuisines=_row_lookup(row, "cuisines"),
            timings=_row_lookup(row, "timings"),
            city=city,
            area=area,
            avg_rating=0.0,
            review_count=0,
            category="Uncategorized",
        )
        db.add(restaurant)
        inserted += 1

    db.commit()
    return inserted, skipped


def ingest_reviews_csv(file: StringIO, db: Session) -> tuple[int, int]:
    """
    Parse Zomato_Restaurant_reviews.csv
    Columns: Restaurant, Reviewer, Review, Rating, Metadata, Time, Pictures
    """
    reader = csv.DictReader(file)
    inserted = 0
    skipped = 0
    updated_restaurants: set = set()

    for row in reader:
        restaurant_name = _row_lookup(row, "restaurant")
        if not restaurant_name:
            skipped += 1
            continue

        restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
        if not restaurant:
            skipped += 1
            continue

        rating_str = _row_lookup(row, "rating")
        try:
            rating = int(rating_str) if rating_str else None
        except ValueError:
            rating = None

        review = Review(
            restaurant_id=restaurant.id,
            reviewer=_row_lookup(row, "reviewer"),
            review_text=_row_lookup(row, "review"),
            rating=rating,
            metadata_info=_row_lookup(row, "metadata"),
            review_time=_row_lookup(row, "time"),
            pictures=int(_row_lookup(row, "pictures") or "0"),
        )
        db.add(review)
        inserted += 1
        updated_restaurants.add(restaurant.id)

    db.commit()

    for rid in updated_restaurants:
        _recalculate_restaurant_stats(rid, db)

    db.commit()
    return inserted, skipped


def _recalculate_restaurant_stats(restaurant_id: int, db: Session):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        return
    reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id,
        Review.rating.isnot(None)
    ).all()
    if reviews:
        avg = sum(r.rating for r in reviews) / len(reviews)
        restaurant.avg_rating = round(avg, 1)
        restaurant.review_count = len(reviews)
        restaurant.category = _derive_category(avg)
