"""Sync DB schema with models and optionally backfill city/area from the metadata CSV."""
import csv
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/zomato_lens")
engine = create_engine(DATABASE_URL)

MIGRATIONS = [
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS city VARCHAR(100);",
    "ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS area VARCHAR(100);",
    "ALTER TABLE restaurants DROP COLUMN IF EXISTS location;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;",
    "UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL;",
]

CSV_PATH = Path(__file__).resolve().parent.parent / "data" / "Zomato Restaurant names and Metadata.csv"


def run(backfill_csv: bool = False):
    insp = inspect(engine)
    if not insp.has_table("restaurants"):
        print("restaurants table not found.")
        return

    with engine.connect() as conn:
        for sql in MIGRATIONS:
            conn.execute(text(sql))
        conn.commit()

        if backfill_csv and CSV_PATH.exists():
            print("Starting city/area CSV backfill...")
            updated = 0
            with CSV_PATH.open(encoding="utf-8", newline="") as f:
                for row in csv.DictReader(f):
                    name = (row.get("Name") or "").strip()
                    city = (row.get("City") or "").strip()
                    area = (row.get("Area") or "").strip()
                    if not name:
                        continue
                    result = conn.execute(
                        text(
                            "UPDATE restaurants SET city = :city, area = :area "
                            "WHERE name = :name"
                        ),
                        {"name": name, "city": city, "area": area},
                    )
                    updated += result.rowcount
            conn.commit()
            print(f"Backfilled city/area for {updated} rows from CSV.")
        elif backfill_csv:
            print(f"CSV not found at {CSV_PATH} — skipped backfill.")
        else:
            print("Skipping CSV backfill (only running quick migrations).")

    cols = [c["name"] for c in insp.get_columns("restaurants")]
    print("Done. columns:", cols)


if __name__ == "__main__":
    run(backfill_csv=True)
