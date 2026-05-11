"""
Command line helper for parsing restaurant timings from a CSV.

Example:
python backend/scripts/parse_timings_csv.py restaurants.csv restaurants_with_hours.csv --column Timings
"""
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.timings_parser import main


if __name__ == "__main__":
    main()
