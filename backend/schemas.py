from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ─── User & Doctor Schemas ────────────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "doctor" # doctor, patient, hospital_admin, super_admin
    qualification: Optional[str] = "BAMS, MD (Kayachikitsa)"
    registration_no: Optional[str] = "AYUSH-REG-2018-8841"
    specializations: Optional[List[str]] = ["Kayachikitsa", "Panchakarma"]
    symptom_tags: Optional[List[str]] = ["Joint Pain", "Ghutna Dard", "Digestive"]
    rating_avg: Optional[float] = 4.8
    rating_count: Optional[int] = 24
    hospital_name: Optional[str] = "All India Institute of Ayurveda (AIIA)"
    experience_years: Optional[int] = 12
    availability: Optional[str] = "Mon - Sat • 09:00 AM - 02:00 PM"
    consultation_fee: Optional[int] = 100
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    doctor_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ─── Doctor Rating Schemas ────────────────────────────────────────────────────
class DoctorRatingCreate(BaseModel):
    doctor_id: str
    patient_id: str # Used internally
    score: int = Field(5, ge=1, le=5)
    comment: Optional[str] = None
    condition_treated: Optional[str] = "Ayurvedic Care"

class DoctorRatingResponse(BaseModel):
    id: str
    doctor_id: str
    patient_hash: str
    condition_treated: str
    score: int
    comment: Optional[str]
    verified_consultation: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ─── Patient Schemas ──────────────────────────────────────────────────────────
class SymptomDiaryEntry(BaseModel):
    id: Optional[str] = None
    date: str
    symptom: str
    severity: Optional[str] = "Moderate" # Mild, Moderate, Severe
    notes: Optional[str] = None

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    contact: str
    blood_group: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    avatar_url: Optional[str] = None
    consent_given: bool = True

class PatientCreate(PatientBase):
    abha_id: Optional[str] = None # Auto-generated if not provided
    uhid: Optional[str] = None

class PatientResponse(PatientBase):
    id: str
    abha_id: str
    uhid: Optional[str] = None
    consent_timestamp: Optional[datetime] = None
    symptom_diary: Optional[List[Dict[str, Any]]] = []
    created_at: datetime
    class Config:
        from_attributes = True

# ─── Document OCR Vault Schemas ───────────────────────────────────────────────
class DocumentCreate(BaseModel):
    patient_id: str
    file_name: str
    file_type: str = "Prescription"
    date: Optional[str] = None
    source_doctor_or_hospital: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None
    summary: Optional[str] = None

class DocumentResponse(DocumentCreate):
    id: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

# ─── Patient Case / Visit Schemas ─────────────────────────────────────────────
class PatientCaseCreate(BaseModel):
    patient_id: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_qualification: Optional[str] = None
    hospital_name: Optional[str] = None
    status: Optional[str] = "active" # active, completed, follow_up
    token_number: Optional[str] = "OPD-101"
    is_red_flag: Optional[bool] = False
    red_flag_reason: Optional[str] = None
    
    intake_data: Optional[Dict[str, Any]] = None
    chief_complaints: Optional[str] = None
    history_present_illness: Optional[str] = None
    past_history: Optional[str] = None
    family_history: Optional[str] = None
    personal_history: Optional[str] = None
    dietary_lifestyle_habits: Optional[str] = None
    
    prakriti: Optional[str] = None
    vikriti: Optional[str] = None
    agni: Optional[str] = None
    koshtha: Optional[str] = None
    ashtavidha_pariksha: Optional[Dict[str, Any]] = None
    
    vitals: Optional[Dict[str, Any]] = None
    clinical_findings: Optional[str] = None
    lab_reports: Optional[List[str]] = None
    
    diagnosis_ayurvedic: Optional[str] = None
    diagnosis_modern: Optional[str] = None
    medicines: Optional[List[Dict[str, Any]]] = None
    anupana: Optional[str] = None
    pathya_apathya: Optional[str] = None
    follow_up_date: Optional[str] = None
    
    private_notes: Optional[str] = None # Confidential to doctor

class PatientCaseResponse(PatientCaseCreate):
    id: str
    prescription_signed: bool = False
    prescription_signed_at: Optional[datetime] = None
    ai_case_summary_en: Optional[str] = None
    ai_case_summary_hi: Optional[str] = None
    ai_risk_factors: Optional[List[str]] = None
    ai_missing_fields: Optional[List[str]] = None
    ai_dosha_analysis: Optional[Dict[str, Any]] = None
    audio_summary_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# ─── AI Service & Intake Schemas ──────────────────────────────────────────────
class IntakeStructuringRequest(BaseModel):
    transcript: str
    patient_id: Optional[str] = None
    language: Optional[str] = "en"

class RedFlagScanRequest(BaseModel):
    transcript: str

class AISummaryRequest(BaseModel):
    case_data: Dict[str, Any]

class AIDoshaRequest(BaseModel):
    symptoms: str
    age: Optional[int] = 30

