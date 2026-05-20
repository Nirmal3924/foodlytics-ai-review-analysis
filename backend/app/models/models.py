from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


from app.models.user_model import User, UserRole
from app.models.otp_model import OTPVerification


class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    link = Column(String(500))
    cost = Column(Integer, default=0)
    collections = Column(Text)
    cuisines = Column(String(300))
    timings = Column(String(300))
    city = Column(String(100))
    area = Column(String(100))
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    category = Column(String(50))
    sentiment_score = Column(Float)
    cluster_id = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    reviewer = Column(String(200))
    review_text = Column(Text)
    rating = Column(Integer)
    metadata_info = Column(String(200))
    review_time = Column(String(50))
    pictures = Column(Integer, default=0)
    restaurant = relationship("Restaurant", back_populates="reviews")
