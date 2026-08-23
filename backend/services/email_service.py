"""
Email OTP delivery via Gmail SMTP using an App Password.
Never uses the real Gmail account password — only App Passwords
generated from Google Account → Security → 2-Step → App Passwords.
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config import settings

logger = logging.getLogger(__name__)

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def send_email_otp(email_address: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP to email_address via Gmail SMTP.

    Returns True on success, raises RuntimeError on failure.
    """
    gmail_address = settings.GMAIL_ADDRESS
    gmail_app_password = settings.GMAIL_APP_PASSWORD

    if not gmail_address or not gmail_app_password:
        raise RuntimeError(
            "GMAIL_ADDRESS and GMAIL_APP_PASSWORD must be set in environment variables. "
            "Generate an App Password from Google Account → Security → 2-Step Verification → App Passwords."
        )

    subject = "SwasthSaarthi — Your Verification Code"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:32px;">
        <tr>
          <td>
            <div style="text-align:center;margin-bottom:24px;">
              <span style="font-size:28px;">🌿</span>
              <h2 style="margin:8px 0 4px;color:#12372A;font-size:20px;">SwasthSaarthi</h2>
              <p style="color:#64748b;font-size:13px;margin:0;">ABDM Secure Health Platform</p>
            </div>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:24px;" />
            <p style="color:#334155;font-size:14px;margin:0 0 8px;">Your one-time verification code is:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;font-size:36px;font-weight:900;letter-spacing:10px;color:#12372A;background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:12px 24px;font-family:monospace;">{otp_code}</span>
            </div>
            <p style="color:#475569;font-size:13px;margin:0 0 4px;">⏱️ This code is valid for <strong>5 minutes</strong>.</p>
            <p style="color:#475569;font-size:13px;margin:0 0 24px;">If you did not request this code, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin-bottom:16px;" />
            <p style="color:#94a3b8;font-size:11px;margin:0;text-align:center;">SwasthSaarthi — Powered by ABDM &amp; Ayurveda AI</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"SwasthSaarthi <{gmail_address}>"
    msg["To"] = email_address
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(gmail_address, gmail_app_password)
            server.sendmail(gmail_address, email_address, msg.as_string())
        logger.info("Email OTP sent to %s", email_address)
        return True

    except smtplib.SMTPAuthenticationError as exc:
        logger.error("Gmail SMTP authentication failed: %s", exc)
        raise RuntimeError(
            "Gmail authentication failed. Ensure GMAIL_APP_PASSWORD is a valid App Password "
            "(not your regular password). Generate one at myaccount.google.com → Security → App Passwords."
        ) from exc
    except smtplib.SMTPException as exc:
        logger.error("Gmail SMTP error: %s", exc)
        raise RuntimeError(f"Email OTP delivery failed: {exc}") from exc
    except Exception as exc:
        logger.error("Unexpected email error: %s", exc)
        raise RuntimeError(f"Unexpected error sending email OTP: {exc}") from exc
