from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


from app.schemas.user_schema import UserRole, UserCreate, UserLogin, UserOut, Token
from app.schemas.otp_schema import ResetPasswordRequest as PasswordReset


# ── REVIEWS ───────────────────────────────────────────────
class ReviewOut(BaseModel):
    id: int
    reviewer: Optional[str]
    review_text: Optional[str]
    rating: Optional[int]
    review_time: Optional[str]

    class Config:
        from_attributes = True


# ── RESTAURANTS ───────────────────────────────────────────
class RestaurantBase(BaseModel):
    name: str
    link: Optional[str] = ""
    cost: Optional[int] = 0
    cuisines: Optional[str] = ""
    timings: Optional[str] = ""
    city: Optional[str] = ""
    area: Optional[str] = ""


class RestaurantCreate(RestaurantBase):
    collections: Optional[str] = ""
    avg_rating: Optional[float] = 0.0
    category: Optional[str] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str]
    link: Optional[str]
    cost: Optional[int]
    cuisines: Optional[str]
    timings: Optional[str]
    city: Optional[str]
    area: Optional[str]
    category: Optional[str]
    avg_rating: Optional[float]


class RestaurantOut(RestaurantBase):
    id: int
    avg_rating: float = 0.0
    review_count: int = 0
    category: Optional[str]
    sentiment_score: Optional[float]
    cluster_id: Optional[int]
    reviews: List[ReviewOut] = []

    class Config:
        from_attributes = True


class RestaurantList(BaseModel):
    restaurants: List[RestaurantOut]
    total: int
    page: int
    per_page: int


# ── ANALYSIS ──────────────────────────────────────────────
class AnalysisResult(BaseModel):
    total_restaurants: int
    avg_rating: float
    sentiment_breakdown: dict
    clusters: List[dict]
    top_keywords: List[dict]
    cuisine_performance: List[dict]


# ── ADMIN STATS ───────────────────────────────────────────
class AdminStats(BaseModel):
    total_restaurants: int
    total_reviews: int
    avg_rating: float
    top_rated_count: int
    hidden_gem_count: int
    rating_distribution: dict
    category_breakdown: dict
    data_start_date: Optional[datetime] = None
    data_end_date: Optional[datetime] = None


# ── AI RECOMMENDATIONS ────────────────────────────────────
class AIRecommendRequest(BaseModel):
    mood: Optional[str] = "Casual Hangout"
    cuisine: Optional[str] = "Any"
    budget: Optional[str] = "mid"
    city: Optional[str] = "Hyderabad"
    notes: Optional[str] = ""


class AIRestaurantPick(BaseModel):
    restaurant: RestaurantOut
    match_score: int
    reason: str


class AIChatRequest(BaseModel):
    query: str
    city: str


class AIFilters(BaseModel):
    mood: Optional[str] = None
    cuisine: Optional[str] = None
    budget: Optional[str] = None
    ambience: Optional[str] = None
    occasion: Optional[str] = None
    dining_type: Optional[str] = None
    timing: Optional[str] = None


class AIChatResponse(BaseModel):
    filters: AIFilters
    message: str
    restaurants: List[AIRestaurantPick]

