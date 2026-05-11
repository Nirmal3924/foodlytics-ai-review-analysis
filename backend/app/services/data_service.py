"""
Data ingestion service
Parses uploaded CSV files and populates the PostgreSQL database.
"""
import csv
from io import StringIO
from sqlalchemy.orm import Session
from app.models.models import Restaurant, Review


AREAS = [
    "Gachibowli", "Banjara Hills", "Jubilee Hills", "Hitech City",
    "Madhapur", "Kondapur", "Kukatpally", "Begumpet", "Ameerpet", "Secunderabad",
]


def _parse_cost(cost_str: str) -> int:
    try:
        return int(cost_str.replace(",", "").strip())
    except (ValueError, AttributeError):
        return 0


def _derive_location(name: str, link: str) -> str:
    # Heuristic: hash name into an area bucket (deterministic)
    return AREAS[hash(name) % len(AREAS)]


def _derive_category(avg_rating: float) -> str:
    if avg_rating >= 4.5:
        return "Top Restaurant"
    elif avg_rating >= 4.0:
        return "Popular"
    elif avg_rating >= 3.5:
        return "Hidden Gem"
    else:
        return "Overrated"


def ingest_restaurant_csv(file: StringIO, db: Session) -> tuple[int, int]:
    """
    Parse Zomato_Restaurant_names_and_Metadata.csv
    Columns: Name, Links, Cost, Collections, Cuisines, Timings
    """
    reader = csv.DictReader(file)
    inserted = 0
    skipped = 0

    for row in reader:
        name = row.get("Name", "").strip()
        if not name:
            skipped += 1
            continue
        exists = db.query(Restaurant).filter(Restaurant.name == name).first()
        if exists:
            skipped += 1
            continue

        restaurant = Restaurant(
            name=name,
            link=row.get("Links", "").strip(),
            cost=_parse_cost(row.get("Cost", "0")),
            collections=row.get("Collections", "").strip(),
            cuisines=row.get("Cuisines", "").strip(),
            timings=row.get("Timings", "").strip(),
            location=_derive_location(name, row.get("Links", "")),
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
    After ingestion, recalculate avg_rating and category per restaurant.
    """
    reader = csv.DictReader(file)
    inserted = 0
    skipped = 0
    updated_restaurants: set = set()

    for row in reader:
        restaurant_name = row.get("Restaurant", "").strip()
        if not restaurant_name:
            skipped += 1
            continue

        restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
        if not restaurant:
            skipped += 1
            continue

        rating_str = row.get("Rating", "").strip()
        try:
            rating = int(rating_str)
        except ValueError:
            rating = None

        review = Review(
            restaurant_id=restaurant.id,
            reviewer=row.get("Reviewer", "").strip(),
            review_text=row.get("Review", "").strip(),
            rating=rating,
            metadata_info=row.get("Metadata", "").strip(),
            review_time=row.get("Time", "").strip(),
            pictures=int(row.get("Pictures", "0") or "0"),
        )
        db.add(review)
        inserted += 1
        updated_restaurants.add(restaurant.id)

    db.commit()

    # Recalculate avg_rating and category for affected restaurants
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
