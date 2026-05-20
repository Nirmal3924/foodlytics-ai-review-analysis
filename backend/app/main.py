from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import logging

load_dotenv()

from app.database import engine, Base
from app.routes import auth_routes, restaurants, admin, analysis

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Foodlytics API", version="1.0.0", description="Restaurant Analysis Platform API")


@app.on_event("startup")
def sync_database_schema():
    """Ensure city/area columns exist after manual DB resets."""
    try:
        from alter_db import run
        run()
    except Exception as exc:
        logger.warning("Schema sync skipped: %s", exc)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
        "http://localhost:5173", "http://localhost:5174",
        "http://127.0.0.1:3000", "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(restaurants.router, prefix="/api/restaurants", tags=["Restaurants"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/")
def root():
    return {"message": "Foodlytics API is running", "docs": "/docs"}
