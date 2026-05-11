# Foodlytics — Full-Stack Restaurant Analysis Platform

A production-ready restaurant analytics web application built on **React + FastAPI + PostgreSQL**, powered by real restaurant data from Hyderabad (105 restaurants, 10,000 reviews).

---

## Architecture Overview

```
zomato_app/
├── backend/                   # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── main.py            # App entry point, CORS, routers
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── models/
│   │   │   └── models.py      # User, Restaurant, Review ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py     # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── auth.py        # POST /api/auth/login|signup
│   │   │   ├── restaurants.py # GET  /api/restaurants/*
│   │   │   ├── admin.py       # CRUD + file upload (admin-only)
│   │   │   └── analysis.py    # Sentiment + clustering trigger
│   │   └── services/
│   │       ├── auth_service.py     # JWT, bcrypt, role guards
│   │       ├── analysis_service.py # Lexicon sentiment + K-Means
│   │       └── data_service.py     # CSV ingestion logic
│   ├── seed.py                # One-time DB seed from CSVs
│   └── requirements.txt
│
└── frontend/                  # React 18 + Vite
    ├── index.html             # Chart.js CDN included here
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx            # Router (login → user|admin)
    │   ├── context/
    │   │   └── AuthContext.jsx    # JWT storage, login/logout
    │   ├── services/
    │   │   └── api.js             # Typed API service layer
    │   ├── pages/
    │   │   ├── LoginPage.jsx      # Unified login/signup
    │   │   ├── UserDashboard.jsx  # Homepage sections + search
    │   │   └── AdminDashboard.jsx # Admin shell + sidebar
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── FiltersBar.jsx
    │       ├── RestaurantCard.jsx
    │       ├── RestaurantModal.jsx # Detail view + paginated reviews
    │       ├── AdminSidebar.jsx
    │       └── admin/
    │           ├── AdminOverview.jsx  # Charts + top-10 table
    │           ├── AdminUpload.jsx    # Drag-and-drop CSV upload
    │           ├── AdminAnalysis.jsx  # Sentiment + clustering UI
    │           └── AdminManage.jsx    # Full CRUD table
```

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1 — PostgreSQL setup

```bash
psql -U postgres
CREATE DATABASE zomato_lens;
\q
```

---

### 2 — Backend setup

```bash
cd zomato_app/backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp ../.env.example .env
# Edit .env → set DATABASE_URL and SECRET_KEY

# Seed the database with CSV data
python seed.py \
  --restaurants path/to/Zomato_Restaurant_names_and_Metadata.csv \
  --reviews     path/to/Zomato_Restaurant_reviews.csv

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API docs will be available at: **http://localhost:8000/docs**

---

### 3 — Frontend setup

```bash
cd zomato_app/frontend

npm install
npm run dev
```

App will be available at: **http://localhost:3000**

---

## Default Credentials

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@gmail.com      | admin123   |
| User  | user@zomato.com      | User@123   |

*(Created automatically by `seed.py`)*

---

## API Reference

### Authentication
| Method | Endpoint            | Description              | Auth     |
|--------|---------------------|--------------------------|----------|
| POST   | /api/auth/signup    | Register new user        | Public   |
| POST   | /api/auth/login     | Login (returns JWT)      | Public   |

### Restaurants (User)
| Method | Endpoint                           | Description                        |
|--------|------------------------------------|-------------------------------------|
| GET    | /api/restaurants                   | List all (search, filter, paginate) |
| GET    | /api/restaurants/top               | Top-rated (≥ 4.5★)                 |
| GET    | /api/restaurants/hidden-gems       | Hidden Gem category                 |
| GET    | /api/restaurants/overrated         | Below 3.2★                         |
| GET    | /api/restaurants/{id}              | Single restaurant detail            |
| GET    | /api/restaurants/{id}/reviews      | Paginated reviews                   |
| GET    | /api/restaurants/locations         | Distinct location list              |

### Admin (JWT required, role=admin)
| Method | Endpoint                           | Description               |
|--------|------------------------------------|---------------------------|
| GET    | /api/admin/stats                   | Dashboard statistics       |
| GET    | /api/admin/restaurants             | Paginated restaurant list  |
| POST   | /api/admin/restaurants             | Create restaurant          |
| PUT    | /api/admin/restaurants/{id}        | Update restaurant          |
| DELETE | /api/admin/restaurants/{id}        | Delete restaurant          |
| POST   | /api/admin/upload/restaurants      | Upload restaurant CSV      |
| POST   | /api/admin/upload/reviews          | Upload reviews CSV         |
| GET    | /api/admin/users                   | List all users             |

### Analysis (JWT required, role=admin)
| Method | Endpoint             | Description                                |
|--------|----------------------|--------------------------------------------|
| POST   | /api/analysis/run    | Trigger background sentiment + clustering  |
| GET    | /api/analysis/status | Poll analysis progress                     |
| GET    | /api/analysis/results| Fetch completed analysis results           |

---

## Feature Details

### User Features
- **Sign up / Sign in** with JWT authentication
- **Homepage sections**: Top Restaurants (4.5+★), Hidden Gems, Overrated
- **Real-time search** (debounced 300ms) across name, cuisine, location
- **4-way filter panel**: Location · Min Rating · Category · Price range
- **Restaurant detail modal**: stats, timings, sentiment score, paginated reviews

### Admin Features
- **Dashboard**: live stats tiles, rating distribution bar chart, category doughnut chart, top-10 table
- **Upload**: drag-and-drop CSV upload for both data files → stored in PostgreSQL
- **Analysis** (one click):
  - Lexicon-based sentiment scoring per review (positive/negative word weights + negation handling)
  - K-Means clustering (k=4) on `[avg_rating, cost_normalized]` — pure Python, no sklearn dependency
  - Top keyword extraction from positive reviews
  - Cuisine-level average rating breakdown
  - Cost vs. Rating scatter chart
- **Manage**: paginated CRUD table — create, edit, delete restaurants with modal form

### Analysis Engine
- **Sentiment**: lexicon approach with ~80 positive/negative keywords, intensifier multipliers (×1.5), and negation detection. Score normalised to 0–1.
- **Clustering**: pure-Python K-Means with seeded random centroids and Euclidean distance. 50 iterations max. Cluster labels derived from centroid `(avg_rating, avg_cost)` values.
- Both algorithms run as a **FastAPI BackgroundTask** so the UI stays responsive.

---

## Technology Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18, Vite, CSS Modules             |
| Charts      | Chart.js 4 (CDN)                        |
| Backend     | FastAPI, Uvicorn                        |
| Database    | PostgreSQL 14+, SQLAlchemy 2            |
| Auth        | JWT (python-jose), bcrypt (passlib)     |
| Analysis    | Pure Python (no ML framework required)  |

---

## Production Notes

1. **Change `SECRET_KEY`** in `.env` before deploying.
2. **CORS**: Update `allow_origins` in `backend/app/main.py` to your production domain.
3. **Database migrations**: Use Alembic (`alembic init alembic`, `alembic revision --autogenerate`, `alembic upgrade head`).
4. **Static files**: Run `npm run build` in the frontend directory and serve the `dist/` folder via Nginx or a CDN.
5. **Analysis at scale**: Swap `analysis_service.py` lexicon with `transformers` (e.g. `distilbert-base-uncased-finetuned-sst-2-english`) and replace K-Means with `sklearn.cluster.KMeans` for better accuracy.
