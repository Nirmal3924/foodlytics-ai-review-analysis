from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_model import User, UserRole
from app.schemas.user_schema import UserCreate, UserLogin, Token, UserOut
from app.schemas.otp_schema import (
    VerifySignupOTPRequest,
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest
)
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.services.otp_service import OTPService
from app.services.email_service import email_service

router = APIRouter()

def build_otp_response(message: str, email: str, sent_by_email: bool):
    if not sent_by_email:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP could not be sent by email. Please check SMTP configuration and try again."
        )
    return {
        "message": message,
        "email": email,
        "delivery": "email",
    }

# ── 1. USER REGISTRATION FLOW ─────────────────────────────
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new inactive user and send signup OTP."""
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered."
            )
        else:
            # Update unverified user details
            existing_user.name = data.name
            existing_user.password_hash = hash_password(data.password)
            existing_user.role = data.role
            db.commit()
            db.refresh(existing_user)
            new_user = existing_user
    else:
        # Create inactive user with is_verified = False
        new_user = User(
            name=data.name,
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role,
            is_verified=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    # Generate and store OTP in database
    otp = OTPService.create_otp_verification(
        db=db, 
        email=new_user.email, 
        otp_type="signup", 
        user_id=new_user.id
    )

    # Send OTP email automatically
    sent_by_email = await email_service.send_signup_otp(
        email=new_user.email, 
        name=new_user.name, 
        otp=otp
    )

    return build_otp_response(
        message="Registration successful! A secure 6-digit verification code has been sent to your email.",
        email=new_user.email,
        sent_by_email=sent_by_email,
    )


# Backwards-compatible alias for frontend calling /signup
@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(data: UserCreate, db: Session = Depends(get_db)):
    """Legacy endpoint mapping to the new secure registration flow."""
    return await register(data, db)


@router.post("/resend-signup-otp")
async def resend_signup_otp(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate and send a fresh signup OTP for an existing unverified account."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is already verified. Please sign in."
        )

    otp = OTPService.create_otp_verification(
        db=db,
        email=user.email,
        otp_type="signup",
        user_id=user.id
    )
    sent_by_email = await email_service.send_signup_otp(
        email=user.email,
        name=user.name,
        otp=otp
    )

    return build_otp_response(
        message="A new secure 6-digit verification code has been sent to your email.",
        email=user.email,
        sent_by_email=sent_by_email,
    )


# ── 2. VERIFY SIGNUP OTP ──────────────────────────────────
@router.post("/verify-signup-otp", response_model=Token)
async def verify_signup_otp(data: VerifySignupOTPRequest, db: Session = Depends(get_db)):
    """Verify signup OTP, activate user account, and return JWT."""
    # Retrieve user
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is already verified. Please sign in."
        )

    # Verify latest OTP (handles expiry, attempts, hash and marks verified)
    OTPService.verify_otp(db=db, email=data.email, otp=data.otp, otp_type="signup")

    # Mark user verified
    user.is_verified = True
    db.commit()
    db.refresh(user)

    # Generate JWT token after successful verification
    token = create_access_token({"sub": str(user.id), "role": user.role})
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


# ── 3. LOGIN SYSTEM ───────────────────────────────────────
@router.post("/login", response_model=Token)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login using email and password only (no OTP during normal login)."""
    user = db.query(User).filter(User.email == data.email).first()
    
    # Check credentials
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Prevent login if account is not verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not verified. Please verify your email first."
        )

    # Return JWT access token
    token = create_access_token({"sub": str(user.id), "role": user.role})
    
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


# ── 4. FORGOT PASSWORD FLOW ──────────────────────────────
@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate and send a secure password reset OTP."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # For security, we don't disclose if the user doesn't exist, but here we can return success
        # to prevent email enumeration or standard messaging. Let's return success message.
        return {
            "message": "If the email is registered, a password reset verification code has been sent."
        }

    # Generate, hash, and store reset OTP (expiry = 5 minutes)
    otp = OTPService.create_otp_verification(
        db=db, 
        email=user.email, 
        otp_type="reset", 
        user_id=user.id
    )

    # Send reset OTP email
    sent_by_email = await email_service.send_reset_password_otp(email=user.email, otp=otp)

    return build_otp_response(
        message="A secure 6-digit password reset verification code has been sent to your email.",
        email=user.email,
        sent_by_email=sent_by_email,
    )


# ── 5. VERIFY FORGOT PASSWORD OTP ─────────────────────────
@router.post("/verify-reset-otp")
async def verify_reset_otp(data: VerifyResetOTPRequest, db: Session = Depends(get_db)):
    """Verify password reset OTP."""
    # Check if user exists
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Verify reset OTP (handles expiry, attempts, hash and marks verified)
    OTPService.verify_otp(db=db, email=data.email, otp=data.otp, otp_type="reset")

    return {
        "message": "Verification successful! You are now authorized to reset your password.",
        "email": data.email
    }


# ── 6. RESET PASSWORD ─────────────────────────────────────
@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Hash new password and update database securely."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Update password securely
    user.password_hash = hash_password(data.new_password)
    db.commit()

    return {
        "message": "Your password has been successfully updated! You can now sign in with your new password."
    }
