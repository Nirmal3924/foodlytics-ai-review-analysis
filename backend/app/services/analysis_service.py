"""
Analysis Service
────────────────
Sentiment analysis uses a lexicon-based approach (no heavy ML dependency).
Clustering uses a pure-Python K-Means on [avg_rating, cost_normalized].
For production, swap in scikit-learn / transformers as needed.
"""
from sqlalchemy.orm import Session
from app.models.models import Restaurant, Review
from collections import Counter
import math
import random


# ── SENTIMENT LEXICON ─────────────────────────────────────────────────────────
POSITIVE_WORDS = {
    "excellent", "amazing", "awesome", "fantastic", "great", "good", "best",
    "love", "delicious", "tasty", "wonderful", "superb", "outstanding", "perfect",
    "friendly", "polite", "clean", "fresh", "recommend", "must", "try", "enjoyed",
    "happy", "satisfied", "pleasant", "nice", "helpful", "prompt", "courteous",
    "beautiful", "gorgeous", "cozy", "comfortable", "value", "worth",
}
NEGATIVE_WORDS = {
    "bad", "worst", "terrible", "horrible", "awful", "pathetic", "disgusting",
    "rude", "slow", "cold", "stale", "overpriced", "disappointing", "poor",
    "waste", "dirty", "unhygienic", "disgusting", "never", "avoid", "wrong",
    "late", "unprofessional", "tasteless", "bland", "raw", "burnt", "oily",
}
INTENSIFIERS = {"very", "so", "extremely", "absolutely", "really", "super", "highly"}
NEGATORS = {"not", "no", "never", "didn't", "don't", "doesn't", "wasn't", "isn't", "hardly"}


def lexicon_sentiment(text: str) -> float:
    """Returns a score 0.0–1.0 (0=very negative, 1=very positive)."""
    if not text:
        return 0.5
    words = text.lower().split()
    score = 0.0
    i = 0
    while i < len(words):
        w = words[i].strip(".,!?\"'")
        negated = i > 0 and words[i - 1].strip(".,!?\"'") in NEGATORS
        intensified = i > 0 and words[i - 1].strip(".,!?\"'") in INTENSIFIERS
        multiplier = 1.5 if intensified else 1.0
        if w in POSITIVE_WORDS:
            score += (-1.5 if negated else 1.0) * multiplier
        elif w in NEGATIVE_WORDS:
            score += (1.5 if negated else -1.0) * multiplier
        i += 1
    # Normalise to 0–1
    clamped = max(-5, min(5, score))
    return round((clamped + 5) / 10, 3)


def run_sentiment_analysis(restaurant: Restaurant, db: Session) -> float:
    """Compute aggregate sentiment score for a restaurant from its reviews."""
    reviews = db.query(Review).filter(Review.restaurant_id == restaurant.id).all()
    if not reviews:
        return 0.5
    scores = [lexicon_sentiment(r.review_text or "") for r in reviews]
    return round(sum(scores) / len(scores), 3)


# ── K-MEANS CLUSTERING ────────────────────────────────────────────────────────
def _euclidean(a: list, b: list) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def _kmeans(points: list, k: int = 4, iterations: int = 50) -> list:
    """Returns list of cluster assignments (0-indexed) for each point."""
    if not points:
        return []
    random.seed(42)
    centroids = random.sample(points, k)
    assignments = [0] * len(points)

    for _ in range(iterations):
        # Assign
        new_assignments = [
            min(range(k), key=lambda c: _euclidean(p, centroids[c]))
            for p in points
        ]
        if new_assignments == assignments:
            break
        assignments = new_assignments
        # Recompute centroids
        for c in range(k):
            cluster_pts = [points[i] for i, a in enumerate(assignments) if a == c]
            if cluster_pts:
                centroids[c] = [
                    sum(p[dim] for p in cluster_pts) / len(cluster_pts)
                    for dim in range(len(cluster_pts[0]))
                ]
    return assignments


def run_clustering(restaurants: list, db: Session):
    """Assign cluster IDs to all restaurants using K-Means on [rating, cost]."""
    if not restaurants:
        return
    max_cost = max(r.cost for r in restaurants) or 1
    points = [
        [r.avg_rating / 5.0, r.cost / max_cost]
        for r in restaurants
    ]
    assignments = _kmeans(points, k=4)
    for r, cluster_id in zip(restaurants, assignments):
        r.cluster_id = cluster_id


# ── KEYWORD EXTRACTION ────────────────────────────────────────────────────────
STOP_WORDS = {
    "i", "me", "my", "the", "a", "an", "and", "or", "but", "in", "on", "at",
    "to", "for", "of", "with", "is", "was", "are", "were", "be", "been", "have",
    "had", "has", "it", "its", "this", "that", "we", "they", "he", "she", "you",
    "their", "our", "your", "from", "by", "as", "so", "if", "would", "could",
    "will", "there", "here", "not", "no", "do", "did", "does", "just", "also",
    "very", "really", "quite", "get", "got", "go", "went", "went", "come",
    "came", "one", "two", "three", "time", "day", "place", "went", "us",
}


def get_top_keywords(db: Session, limit: int = 15) -> list:
    positive_reviews = (
        db.query(Review.review_text)
        .filter(Review.rating >= 4)
        .limit(2000)
        .all()
    )
    counter = Counter()
    for (text,) in positive_reviews:
        if not text:
            continue
        words = text.lower().split()
        for w in words:
            w = w.strip(".,!?\"'()[]")
            if len(w) > 3 and w not in STOP_WORDS:
                counter[w] += 1
    return [{"word": w, "count": c} for w, c in counter.most_common(limit)]


# ── CUISINE PERFORMANCE ───────────────────────────────────────────────────────
def get_cuisine_performance(db: Session) -> list:
    restaurants = db.query(Restaurant.cuisines, Restaurant.avg_rating).all()
    cuisine_ratings: dict = {}
    for cuisines_str, rating in restaurants:
        if not cuisines_str or not rating:
            continue
        for cuisine in cuisines_str.split(","):
            cuisine = cuisine.strip()
            if cuisine not in cuisine_ratings:
                cuisine_ratings[cuisine] = []
            cuisine_ratings[cuisine].append(rating)

    result = [
        {
            "cuisine": cuisine,
            "avg_rating": round(sum(ratings) / len(ratings), 2),
            "count": len(ratings),
        }
        for cuisine, ratings in cuisine_ratings.items()
        if len(ratings) >= 2
    ]
    return sorted(result, key=lambda x: x["avg_rating"], reverse=True)[:12]
