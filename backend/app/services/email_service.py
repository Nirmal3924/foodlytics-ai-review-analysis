import logging
from pathlib import Path
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema
from app.config import settings

logger = logging.getLogger("app.email_service")

# Resolve template paths
TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

class EmailService:
    def __init__(self):
        # Configure FastMail
        # If no SMTP configured, we'll operate in console-fallback mode
        self.is_smtp_configured = bool(
            settings.MAIL_USERNAME and 
            settings.MAIL_PASSWORD and 
            settings.MAIL_SERVER
        )
        
        if self.is_smtp_configured:
            self.mail_config = ConnectionConfig(
                MAIL_USERNAME=settings.MAIL_USERNAME,
                MAIL_PASSWORD=settings.MAIL_PASSWORD,
                MAIL_FROM=settings.MAIL_FROM or settings.MAIL_USERNAME,
                MAIL_PORT=settings.MAIL_PORT,
                MAIL_SERVER=settings.MAIL_SERVER,
                MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
                MAIL_STARTTLS=settings.MAIL_STARTTLS,
                MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
                USE_CREDENTIALS=True
            )
            self.fm = FastMail(self.mail_config)
            logger.info("Email service initialized in SMTP mode.")
        else:
            self.fm = None
            logger.warning(
                "MAIL_USERNAME, MAIL_PASSWORD, or MAIL_SERVER not configured. "
                "Email service is running in CONSOLE FALLBACK mode. "
                "OTPs will be logged directly to the server terminal."
            )

    async def _send_html_email(self, email: str, subject: str, html_content: str, otp_code: str, fallback_msg: str) -> bool:
        """Send an email and return True only when SMTP delivery succeeds."""
        if self.is_smtp_configured and self.fm:
            try:
                message = MessageSchema(
                    subject=subject,
                    recipients=[email],
                    body=html_content,
                    subtype="html"
                )
                await self.fm.send_message(message)
                logger.info(f"Successfully sent email '{subject}' to {email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP: {e}. Falling back to terminal log.")
        
        # Console Fallback Log
        print("=" * 60)
        print(" FOODLYTICS EMAIL FALLBACK LOG ")
        print("=" * 60)
        print(f"Recipient: {email}")
        print(f"Subject:   {subject}")
        print(f"OTP Code:   [{otp_code}]")
        print(f"Message:   {fallback_msg}")
        print("=" * 60)
        logger.info(f"[CONSOLE FALLBACK] OTP Code is: {otp_code} (Sent to {email})")
        return False

    async def send_signup_otp(self, email: str, name: str, otp: str):
        """Send signup OTP verification email."""
        template_path = TEMPLATES_DIR / "signup_otp.html"
        
        # Load and render template
        if template_path.exists():
            with open(template_path, "r", encoding="utf-8") as f:
                content = f.read()
            html_content = content.replace("{{ name }}", name).replace("{{ otp }}", otp)
        else:
            html_content = f"<h3>Welcome to Foodlytics, {name}!</h3><p>Your signup verification code is: <b>{otp}</b></p>"
            
        return await self._send_html_email(
            email=email,
            subject="Verify your Foodlytics Account",
            html_content=html_content,
            otp_code=otp,
            fallback_msg=f"Welcome {name}! Your signup OTP is {otp}."
        )

    async def send_reset_password_otp(self, email: str, otp: str):
        """Send password reset verification email."""
        template_path = TEMPLATES_DIR / "reset_password_otp.html"
        
        # Load and render template
        if template_path.exists():
            with open(template_path, "r", encoding="utf-8") as f:
                content = f.read()
            html_content = content.replace("{{ otp }}", otp)
        else:
            html_content = f"<h3>Reset Your Foodlytics Password</h3><p>Your password reset verification code is: <b>{otp}</b></p>"
            
        return await self._send_html_email(
            email=email,
            subject="Foodlytics - Reset Your Password",
            html_content=html_content,
            otp_code=otp,
            fallback_msg=f"Your password reset OTP is {otp}."
        )

email_service = EmailService()
