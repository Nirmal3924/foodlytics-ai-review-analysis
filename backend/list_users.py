from app.database import SessionLocal
from app.models.models import User

db = SessionLocal()
users = db.query(User).all()
for u in users:
    print(u.id, u.email, u.role)
