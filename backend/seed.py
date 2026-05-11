#!/usr/bin/env python3
"""
seed.py — One-time script to load the CSVs into PostgreSQL.

Usage:
  python seed.py \
    --restaurants path/to/Zomato_Restaurant_names_and_Metadata.csv \
    --reviews     path/to/Zomato_Restaurant_reviews.csv

The script also creates a default admin user (admin@gmail.com / admin123).
"""
import argparse
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.models import User, UserRole
from app.services.auth_service import hash_password
from app.services.data_service import ingest_restaurant_csv, ingest_reviews_csv


def main():
    parser = argparse.ArgumentParser(description="Seed Zomato data into PostgreSQL")
    parser.add_argument("--restaurants", required=True, help="Path to restaurant metadata CSV")
    parser.add_argument("--reviews", required=True, help="Path to restaurant reviews CSV")
    args = parser.parse_args()

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Create default users ──────────────────────────────────────────────
        if not db.query(User).filter(User.email == "admin@gmail.com").first():
            admin = User(
                name="Admin User",
                email="admin@gmail.com",
                hashed_password=hash_password("admin@123"),
                role=UserRole.admin,
            )
            db.add(admin)
            print("✓ Created admin user: admin@gmail.com / admin@123")

        if not db.query(User).filter(User.email == "user@gmail.com").first():
            demo_user = User(
                name="Demo User",
                email="user@gmail.com",
                hashed_password=hash_password("user@123"),
                role=UserRole.user,
            )
            db.add(demo_user)
            print("✓ Created demo user: user@gmail.com / User@123")

        db.commit()

        # ── Ingest restaurant metadata ────────────────────────────────────────
        print(f"\nIngesting restaurants from: {args.restaurants}")
        with open(args.restaurants, "r", encoding="utf-8") as f:
            from io import StringIO
            content = f.read()
            ins, skp = ingest_restaurant_csv(StringIO(content), db)
        print(f"  ✓ Inserted: {ins}  Skipped (duplicates): {skp}")

        # ── Ingest reviews ───────────────────────────────────────────────────
        print(f"\nIngesting reviews from: {args.reviews}")
        with open(args.reviews, "r", encoding="utf-8") as f:
            content = f.read()
            ins, skp = ingest_reviews_csv(StringIO(content), db)
        print(f"  ✓ Inserted: {ins}  Skipped: {skp}")

        print("\n Seeding complete. Start the server with:")
        print("   uvicorn app.main:app --reload --port 8000")

    finally:
        db.close()


if __name__ == "__main__":
    main()
