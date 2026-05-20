from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models.user_model import User, UserRole

# Import implementations from the new modular utilities
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import (
    create_access_token,
    decode_token,
    get_current_user,
    require_admin,
    bearer_scheme
)

# Export for backward compatibility
__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_token",
    "get_current_user",
    "require_admin",
    "bearer_scheme",
    "User",
    "UserRole"
]
