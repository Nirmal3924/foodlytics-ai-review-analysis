from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    user = "user"
    admin = "admin"


# ── AUTH ──────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.user


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.user


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


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
    location: Optional[str] = ""


class RestaurantCreate(RestaurantBase):
    collections: Optional[str] = ""


class RestaurantUpdate(BaseModel):
    name: Optional[str]
    link: Optional[str]
    cost: Optional[int]
    cuisines: Optional[str]
    timings: Optional[str]
    location: Optional[str]
    category: Optional[str]
    avg_rating: Optional[float]


class RestaurantOut(RestaurantBase):
    id: int
    avg_rating: float
    review_count: int
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
