"""
Auth routes — Real OTP delivery via Fast2SMS (SMS) and Gmail SMTP (Email).

OTP Session Store: in-memory dict (sufficient for hackathon/single-process).
For multi-process production, replace with Redis using REDIS_URL.

Session format:
  OTP_SESSIONS[session_id] = {
      "otp": "xxxxxx",
      "identifier": "...",
      "role": "patient|doctor",
      "user_data": {...},
      "channel": "sms|email",
      "expires_at": datetime,
  }

Demo profiles (1-click presets) NEVER reach this file — they are handled
purely on the frontend (handlePatientDemoPreset / handleDoctorDemoPreset)
and bypass the entire OTP system.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import logging
from config import settings
from jose import jwt
import random

logger = logging.getLogger(__name__)

# ── Random Demographic Pools ──────────────────────────────────────────────────
DEMO_BLOOD_GROUPS = ['A+', 'B+', 'O+', 'AB+', 'O-']
DEMO_PRAKRITIS = ['Vata-Pitta', 'Kapha-Pitta', 'Pitta-Vata', 'Tridoshaja']
FEMALE_AVATARS = [
    '/avatars/priya_deshmukh.png',
    '/avatars/sunita_sharma.png'
]
MALE_AVATARS = [
    '/avatars/rajesh_kumar.jpeg'
]

# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/send-otp
# ─────────────────────────────────────────────────────────────────────────────

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM
OTP_EXPIRY_MINUTES = 5

# In-memory OTP session store
OTP_SESSIONS: dict[str, dict] = {}


def _generate_otp() -> str:
    """Cryptographically random 6-digit OTP string."""
    return str(secrets.randbelow(900000) + 100000)


def _generate_session_id() -> str:
    return secrets.token_urlsafe(24)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _mask_identifier(identifier: str) -> str:
    """Returns a masked version for display: 98****0100 or a****@gmail.com."""
    if "@" in identifier:
        local, domain = identifier.split("@", 1)
        masked_local = local[:1] + "****"
        return f"{masked_local}@{domain}"
    if len(identifier) >= 10:
        return identifier[:2] + "****" + identifier[-4:]
    return identifier[-4:].rjust(len(identifier), "*")


def _is_email(identifier: str) -> bool:
    return "@" in identifier and "." in identifier.split("@")[-1]


def _is_abha(identifier: str) -> bool:
    upper = identifier.upper()
    return upper.startswith("ABHA") or (upper.count("-") >= 2 and not upper.startswith("DOC"))


def _is_doctor_id(identifier: str) -> bool:
    upper = identifier.upper()
    return upper.startswith("DOC") or "AYUSH" in upper


def _is_mobile(identifier: str) -> bool:
    digits = "".join(filter(str.isdigit, identifier))
    return len(digits) == 10


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/send-otp
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/send-otp")
def send_auth_otp(payload: dict, db: Session = Depends(get_db)):
    identifier = payload.get("identifier", "").strip()
    role = payload.get("role", "patient").lower()
    requested_channel = payload.get("channel", "").lower()  # "email" | "sms"

    if not identifier:
        raise HTTPException(status_code=400, detail="Identifier (Mobile / ABHA ID / Doctor ID / Email) is required.")

    # Determine channel explicitly: Email takes absolute precedence if requested or format is email
    if requested_channel == "email" or _is_email(identifier):
        channel = "email"
    elif requested_channel == "sms" or _is_mobile(identifier):
        channel = "sms"
    else:
        channel = "email" if settings.GMAIL_ADDRESS else "sms"

    # ── Lookup user in DB / demo fallback ──────────────────────────────────
    user_data = None
    delivery_target: str | None = None  # actual mobile or email to OTP to

    if role == "patient":
        if _is_abha(identifier):
            patient = db.query(models.Patient).filter(models.Patient.abha_id == identifier).first()
        elif _is_email(identifier):
            patient = db.query(models.Patient).filter(models.Patient.email == identifier).first() if hasattr(models.Patient, "email") else None
        else:
            patient = db.query(models.Patient).filter(models.Patient.contact == identifier).first()

        if patient:
            user_data = {
                "id": patient.id,
                "name": patient.name,
                "abha_id": patient.abha_id,
                "contact": patient.contact,
                "age": patient.age,
                "gender": patient.gender,
                "blood_group": patient.blood_group,
                "role": "patient",
            }

    elif role == "doctor":
        doctor = db.query(models.Doctor).filter(
            (models.Doctor.registration_no == identifier) | (models.Doctor.id == identifier)
        ).first()

        if not doctor and _is_mobile(identifier):
            doctor = db.query(models.Doctor).filter(models.Doctor.contact == identifier).first() if hasattr(models.Doctor, "contact") else None

        if doctor:
            user_data = {
                "id": doctor.id,
                "doctor_id": doctor.id,
                "name": doctor.name,
                "qualification": doctor.qualification,
                "hospital_name": doctor.hospital_name,
                "role": "doctor",
            }

    # ── Fallback demo / email credentials ───────────────────────────────────
    if not user_data:
        if _is_email(identifier):
            name_part = identifier.split("@")[0].replace(".", " ").replace("_", " ").title()
            chosen_gender = random.choice(["male", "female"])
            avatar = random.choice(FEMALE_AVATARS) if chosen_gender == "female" else random.choice(MALE_AVATARS)
            rand_id = f"ABHA-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
            user_data = {
                "id": rand_id,
                "abha_id": rand_id,
                "name": name_part or "Verified Citizen",
                "email": identifier,
                "contact": f"+91 {random.randint(9100000000, 9999999999)}",
                "age": random.randint(24, 55),
                "gender": chosen_gender,
                "blood_group": random.choice(DEMO_BLOOD_GROUPS),
                "prakriti": random.choice(DEMO_PRAKRITIS),
                "avatar_url": avatar,
                "role": role,
            }
        elif role == "patient" and identifier in ("9821450100", "ABHA-9821-4501"):
            user_data = {
                "id": "ABHA-9821-4501",
                "abha_id": "ABHA-9821-4501",
                "name": "Ramesh Sharma",
                "contact": "9821450100",
                "age": 42,
                "gender": "male",
                "blood_group": "B+",
                "role": "patient",
            }
        elif role == "doctor" and identifier in ("DOC-AYUR-101", "9876543210"):
            user_data = {
                "id": "DOC-AYUR-101",
                "doctor_id": "DOC-AYUR-101",
                "name": "Dr. Rajesh Vaidya",
                "qualification": "BAMS, MD (Kayachikitsa)",
                "hospital_name": "All India Institute of Ayurveda (AIIA), New Delhi",
                "role": "doctor",
            }

    if not user_data:
        return {
            "status": "not_registered",
            "is_registered": False,
            "message": "Mobile / ABHA ID / Email not found in central registry. Please register as a new patient.",
        }

    # ── Resolve delivery target based on determined channel ────────────────
    if channel == "email":
        if _is_email(identifier):
            delivery_target = identifier
        elif settings.GMAIL_ADDRESS:
            delivery_target = settings.GMAIL_ADDRESS
        else:
            delivery_target = f"{identifier.lower().replace('-', '')}@gmail.com"
    else:  # channel == "sms"
        if _is_mobile(identifier):
            delivery_target = identifier
        elif user_data and user_data.get("contact"):
            delivery_target = user_data["contact"]
        else:
            delivery_target = "9876543210"

    # ── Generate real OTP ───────────────────────────────────────────────────
    otp_code = _generate_otp()
    session_id = _generate_session_id()
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    # Store in session memory
    OTP_SESSIONS[session_id] = {
        "otp": otp_code,
        "identifier": identifier,
        "role": role,
        "user_data": user_data,
        "channel": channel,
        "delivery_target": delivery_target,
        "expires_at": expires_at,
    }

    # ── Dispatch OTP ────────────────────────────────────────────────────────
    try:
        if channel == "sms":
            send_sms_otp(delivery_target, otp_code)
        elif channel == "email":
            send_email_otp(delivery_target, otp_code)
    except RuntimeError as exc:
        # Remove the session so user can retry cleanly
        OTP_SESSIONS.pop(session_id, None)
        logger.error("OTP dispatch error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    masked = _mask_identifier(delivery_target)
    channel_label = "mobile number" if channel == "sms" else "email address"

    return {
        "status": "success",
        "is_registered": True,
        "session_id": session_id,
        "channel": channel,
        "masked_target": masked,
        "message": f"OTP sent to your {channel_label} {masked}. Valid for {OTP_EXPIRY_MINUTES} minutes.",
        "user_preview": user_data,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/verify-otp
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/verify-otp")
def verify_auth_otp(payload: dict, db: Session = Depends(get_db)):
    session_id = payload.get("session_id", "").strip()
    otp = payload.get("otp", "").strip()
    role = payload.get("role", "patient")

    if not otp:
        raise HTTPException(status_code=400, detail="OTP code is required.")
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required. Please request a new OTP.")

    session = OTP_SESSIONS.get(session_id)

    if not session:
        raise HTTPException(
            status_code=400,
            detail="OTP session not found or already used. Please request a new OTP.",
        )

    if datetime.utcnow() > session["expires_at"]:
        OTP_SESSIONS.pop(session_id, None)
        raise HTTPException(
            status_code=400,
            detail="OTP has expired (valid for 5 minutes). Please request a new OTP.",
        )

    if otp != session["otp"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP code. Please check your SMS/email and enter the correct 6-digit code.",
        )

    # Valid — consume session (one-time use)
    user_obj = session["user_data"]
    OTP_SESSIONS.pop(session_id, None)

    # Accept user_data override from client if present (for registration wizard)
    client_user_data = payload.get("user_data")
    if client_user_data and isinstance(client_user_data, dict) and client_user_data.get("name"):
        user_obj = {**user_obj, **client_user_data}

    token = create_access_token({
        "sub": user_obj.get("name"),
        "role": user_obj.get("role", role),
        "user_id": user_obj.get("id"),
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_obj,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login/admin  (unchanged — Admin uses ID+Password, no OTP)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/login/admin")
def login_admin(payload: dict, db: Session = Depends(get_db)):
    admin_id = payload.get("admin_id", "").strip()
    password = payload.get("password", "").strip()

    if not admin_id or not password:
        raise HTTPException(status_code=400, detail="Admin ID and password are required.")

    role = "super_admin" if "SUPER" in admin_id.upper() else "hospital_admin"
    user_obj = {
        "id": admin_id,
        "name": f"Admin ({admin_id})",
        "email": f"{admin_id.lower()}@ayush.gov.in",
        "role": role,
        "hospital_name": payload.get("hospital_name") or "All India Institute of Ayurveda (AIIA)",
    }

    token = create_access_token({"sub": admin_id, "role": role, "user_id": admin_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_obj,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register  (legacy, kept for compatibility)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/register")
def register_user(user_in: dict, db: Session = Depends(get_db)):
    email = (user_in.get("email") or "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered.")

    user = models.User(
        name=user_in.get("name", ""),
        email=email,
        password_hash=user_in.get("password", ""),
        role=user_in.get("role", "patient"),
        hospital_name=user_in.get("hospital_name", ""),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
