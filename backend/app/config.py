import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")

class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    _mail_password = os.getenv("MAIL_PASSWORD") or os.getenv("EMAIL_PASS", "")
    if os.getenv("MAIL_SERVER", "smtp.gmail.com") == "smtp.gmail.com":
        _mail_password = _mail_password.replace(" ", "")

    # ── Database ──
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:1234@localhost:5432/zomato_lens"
    )

    # ── JWT Authentication ──
    SECRET_KEY: str = os.getenv("SECRET_KEY", "zomato-lens-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # ── Mail Configuration ──
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME") or os.getenv("EMAIL_USER", "")
    MAIL_PASSWORD: str = _mail_password
    MAIL_FROM: str = os.getenv("MAIL_FROM") or os.getenv("EMAIL_FROM", "")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Foodlytics")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() in ("true", "1", "yes")
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() in ("true", "1", "yes")

    # ── Security Limits ──
    OTP_EXPIRY_MINUTES: int = 5
    OTP_MAX_ATTEMPTS: int = 3

settings = Settings()
