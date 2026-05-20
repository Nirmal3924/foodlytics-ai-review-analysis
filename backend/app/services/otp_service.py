import secrets
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.otp_model import OTPVerification
from app.config import settings

class OTPService:
    @staticmethod
    def generate_otp() -> str:
        """Generate a cryptographically secure 6-digit OTP using the secrets module."""
        return "".join(secrets.choice("0123456789") for _ in range(6))

    @staticmethod
    def hash_otp(otp: str) -> str:
        """Hash the OTP using SHA256."""
        return hashlib.sha256(otp.encode()).hexdigest()

    @classmethod
    def create_otp_verification(
        cls, db: Session, email: str, otp_type: str, user_id: int = None
    ) -> str:
        """Generate, hash, store in database, and return a fresh OTP."""
        # Deactivate all previous unverified OTPs for this email and type to prevent any reuse
        db.query(OTPVerification).filter(
            OTPVerification.email == email,
            OTPVerification.otp_type == otp_type,
            OTPVerification.is_verified == False
        ).update({"is_verified": True}, synchronize_session=False)
        db.commit()

        # Generate new OTP
        raw_otp = cls.generate_otp()
        hashed = cls.hash_otp(raw_otp)

        # Expiry time (5 minutes from now)
        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)

        otp_record = OTPVerification(
            user_id=user_id,
            email=email,
            otp_hash=hashed,
            otp_type=otp_type,
            expires_at=expires_at,
            is_verified=False,
            attempts=0
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)

        return raw_otp

    @classmethod
    def verify_otp(
        cls, db: Session, email: str, otp: str, otp_type: str
    ) -> bool:
        """Verify the latest OTP for email and otp_type.

        Checks expiry, attempts limit, and secure SHA256 hash comparison.
        """
        # Retrieve the latest active (unverified) OTP record
        record = db.query(OTPVerification).filter(
            OTPVerification.email == email,
            OTPVerification.otp_type == otp_type,
            OTPVerification.is_verified == False
        ).order_by(OTPVerification.created_at.desc()).first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active verification code found."
            )

        # Increment attempts counter immediately on check (to prevent concurrent race attacks)
        record.attempts += 1
        db.commit()

        # Check attempt threshold (limit is set to 3)
        if record.attempts > settings.OTP_MAX_ATTEMPTS:
            record.is_verified = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many incorrect OTP attempts. Please request a new code."
            )

        # Check expiration
        now = datetime.utcnow()
        expires_naive = record.expires_at.replace(tzinfo=None) if record.expires_at.tzinfo else record.expires_at
        if now > expires_naive:
            record.is_verified = True
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new one."
            )

        # Hash input and check matches
        hashed_input = cls.hash_otp(otp)
        if record.otp_hash != hashed_input:
            # Let them know how many attempts they have left
            remaining = settings.OTP_MAX_ATTEMPTS - record.attempts
            if remaining <= 0:
                record.is_verified = True
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Too many incorrect attempts. This OTP has been invalidated. Please request a new code."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification code. {remaining} attempt(s) remaining."
            )

        # Success! Mark OTP as verified/used to prevent replay attacks
        record.is_verified = True
        db.commit()
        return True
