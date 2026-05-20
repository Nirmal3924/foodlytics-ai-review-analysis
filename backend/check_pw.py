from app.database import SessionLocal
from app.models.models import User
from app.services.auth_service import verify_password

db = SessionLocal()
u = db.query(User).filter_by(email="admin@gmail.com").first()
print("admin123:", verify_password("admin123", u.hashed_password))
print("admin@123:", verify_password("admin@123", u.hashed_password))
print("admin:", verify_password("admin", u.hashed_password))
