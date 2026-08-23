"""
SMS OTP delivery via Fast2SMS REST API.
Route: OTP (variables_values + route=otp + numbers)
Docs:  https://www.fast2sms.com/dev/bulkV2
"""
import os
import secrets
import logging
import requests
from config import settings

logger = logging.getLogger(__name__)

FAST2SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2"


def send_sms_otp(mobile_number: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP to mobile_number via Fast2SMS OTP route.

    Returns True on success, raises RuntimeError on failure so caller
    can surface the error to the API response instead of silently failing.
    """
    api_key = settings.FAST2SMS_API_KEY
    if not api_key:
        raise RuntimeError("FAST2SMS_API_KEY is not configured in environment variables.")

    # Strip spaces/dashes, take last 10 digits (handles +91 prefix)
    clean_number = "".join(filter(str.isdigit, mobile_number))
    if len(clean_number) > 10:
        clean_number = clean_number[-10:]

    if len(clean_number) != 10:
        raise RuntimeError(f"Invalid mobile number format: {mobile_number!r}. Must be a 10-digit Indian mobile number.")

    params = {
        "variables_values": otp_code,
        "route": "otp",
        "numbers": clean_number,
    }
    headers = {
        "Authorization": api_key,
        "accept": "application/json",
        "Content-Type": "application/json",
    }

    try:
        response = requests.get(
            FAST2SMS_API_URL,
            params=params,
            headers=headers,
            timeout=10,
        )
        data = response.json()
        logger.info("Fast2SMS response for %s: %s", clean_number[-4:].rjust(10, "*"), data)

        if data.get("return") is True:
            return True

        # Fast2SMS returns {"return": false, "message": [...]} on errors
        error_msgs = data.get("message", [])
        if isinstance(error_msgs, list):
            error_msgs = "; ".join(error_msgs)
        raise RuntimeError(f"Fast2SMS rejected OTP dispatch: {error_msgs}")

    except requests.RequestException as exc:
        logger.error("Fast2SMS network error: %s", exc)
        raise RuntimeError(f"SMS delivery failed due to network error: {exc}") from exc
