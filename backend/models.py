import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    doctor_id = Column(String(50), unique=True, nullable=True) # e.g. "DOC-AYUR-101"
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="doctor") # doctor, patient, hospital_admin, super_admin
    qualification = Column(String(150), default="BAMS, MD (Kayachikitsa)")
    registration_no = Column(String(100), default="AYUSH-REG-2018-8841")
    specializations = Column(JSON, default=lambda: ["Kayachikitsa", "Panchakarma"])
    symptom_tags = Column(JSON, default=lambda: ["General", "Digestive", "Joints"])
    rating_avg = Column(Float, default=4.8)
    rating_count = Column(Integer, default=24)
    hospital_name = Column(String(150), default="All India Institute of Ayurveda (AIIA)")
    experience_years = Column(Integer, default=12)
    availability = Column(String(100), default="Mon - Sat • 09:00 AM - 02:00 PM")
    consultation_fee = Column(Integer, default=100) # Government fixed nominal anti-spam fee
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("PatientCase", back_populates="doctor")
    ratings = relationship("DoctorRating", back_populates="doctor", cascade="all, delete-orphan")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=generate_uuid)
    abha_id = Column(String(50), unique=True, nullable=False, index=True) # Central ABHA ID e.g. ABHA-9821-4501
    uhid = Column(String(50), nullable=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False) # male, female, other
    contact = Column(String(20), nullable=False)
    blood_group = Column(String(10), nullable=True)
    address = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    consent_given = Column(Boolean, default=True) # Mock DPDP consent
    consent_timestamp = Column(DateTime, default=datetime.utcnow)
    symptom_diary = Column(JSON, default=list) # [{id, date, symptom, severity, notes}]
    created_at = Column(DateTime, default=datetime.utcnow)

    cases = relationship("PatientCase", back_populates="patient", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="patient", cascade="all, delete-orphan")

class PatientCase(Base):
    __tablename__ = "patient_cases"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=True)
    doctor_name = Column(String(100), nullable=True)
    doctor_qualification = Column(String(150), nullable=True)
    hospital_name = Column(String(150), nullable=True)
    status = Column(String(30), default="active") # active, completed, follow_up
    token_number = Column(String(30), default="OPD-101")
    
    # Red-Flag Triage Trigger (MedRoute v1 scope)
    is_red_flag = Column(Boolean, default=False)
    red_flag_reason = Column(Text, nullable=True)

    # 1. Intake Data (Converse voice transcript & structuring)
    intake_data = Column(JSON, nullable=True) # {transcript, chief_complaint, hpi, duration, severity}
    chief_complaints = Column(Text, nullable=True)
    history_present_illness = Column(Text, nullable=True)
    past_history = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    personal_history = Column(Text, nullable=True)
    dietary_lifestyle_habits = Column(Text, nullable=True)
    
    # 2. Ayurvedic Specific Assessment (Open to all consulting doctors)
    prakriti = Column(String(100), nullable=True) # Vata, Pitta, Kapha or combinations
    vikriti = Column(String(100), nullable=True)
    agni = Column(String(50), nullable=True) # Sama, Manda, Tikshna, Vishama
    koshtha = Column(String(50), nullable=True) # Krushta, Mridu, Madhyama
    ashtavidha_pariksha = Column(JSON, nullable=True) # Nadi, Mutra, Mala, Jihva, etc.
    
    # 3. Clinical Exam & Vitals (Open)
    vitals = Column(JSON, nullable=True) # {bp, pulse, temp, spo2, rr}
    clinical_findings = Column(Text, nullable=True)
    lab_reports = Column(JSON, nullable=True)
    
    # 4. Diagnosis & Treatment Records (Open to all doctors)
    diagnosis_ayurvedic = Column(Text, nullable=True)
    diagnosis_modern = Column(Text, nullable=True)
    medicines = Column(JSON, nullable=True) # [{name, category, dosage, duration, anupana}]
    anupana = Column(String(150), nullable=True)
    pathya_apathya = Column(Text, nullable=True)
    follow_up_date = Column(String(20), nullable=True)

    # 5. Confidential Privacy Boundary (Doctor ONLY)
    private_notes = Column(Text, nullable=True) # Strictly visible ONLY to doctor who authored it

    # 6. Prescription Status
    prescription_signed = Column(Boolean, default=False)
    prescription_signed_at = Column(DateTime, nullable=True)
    
    # 7. AI Summaries & Analytics
    ai_case_summary_en = Column(Text, nullable=True)
    ai_case_summary_hi = Column(Text, nullable=True)
    ai_risk_factors = Column(JSON, nullable=True)
    ai_missing_fields = Column(JSON, nullable=True)
    ai_dosha_analysis = Column(JSON, nullable=True)
    audio_summary_url = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="cases")
    doctor = relationship("User", back_populates="cases")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), default="Prescription") # Lab Report, Prescription, Discharge Summary, X-Ray
    date = Column(String(50), nullable=True)
    source_doctor_or_hospital = Column(String(150), nullable=True)
    extracted_data = Column(JSON, nullable=True) # {diagnoses, medicines, findings}
    summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="documents")

class DoctorRating(Base):
    __tablename__ = "doctor_ratings"

    id = Column(String, primary_key=True, default=generate_uuid)
    doctor_id = Column(String, ForeignKey("users.id"), nullable=False)
    patient_id = Column(String, nullable=False) # Hidden from public, used for fraud check
    patient_hash = Column(String(50), default="Verified Patient") # Public pseudo-anonymous tag
    condition_treated = Column(String(100), default="General Consultation")
    score = Column(Integer, default=5) # 1 to 5
    comment = Column(Text, nullable=True)
    verified_consultation = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("User", back_populates="ratings")

