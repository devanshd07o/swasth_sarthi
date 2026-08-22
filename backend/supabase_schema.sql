-- ==============================================================================
-- SWASTH SAARTHI / MEDIKIOSK (SIH26047) — SUPABASE POSTGRESQL SCHEMA
-- Fully matching locked central ABHA record architecture & DPDP compliance
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Doctors, Hospital Admins, Super Admins)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'doctor', 'patient', 'hospital_admin', 'super_admin'
    doctor_id VARCHAR(50) UNIQUE,
    qualification VARCHAR(150),
    registration_no VARCHAR(100),
    specializations JSONB DEFAULT '[]'::jsonb,
    symptom_tags JSONB DEFAULT '[]'::jsonb,
    rating_avg NUMERIC(3, 2) DEFAULT 4.8,
    rating_count INTEGER DEFAULT 12,
    hospital_name VARCHAR(150) DEFAULT 'All India Institute of Ayurveda (AIIA)',
    experience_years INTEGER DEFAULT 10,
    availability VARCHAR(100) DEFAULT 'Mon - Sat • 09:00 AM - 02:00 PM',
    consultation_fee INTEGER DEFAULT 100, -- Nominal Anti-Fake Registration Fee
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. PATIENTS TABLE (Central ABHA Record Identifier)
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    abha_id VARCHAR(50) UNIQUE NOT NULL, -- Central ABHA ID e.g. 'ABHA-9821-4501'
    uhid VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    address TEXT,
    medical_history TEXT,
    avatar_url TEXT,
    consent_given BOOLEAN DEFAULT true, -- DPDP Act Consent
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    symptom_diary JSONB DEFAULT '[]'::jsonb, -- [{date, symptom, severity, notes}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_patients_abha_id ON patients(abha_id);

-- 4. PATIENT CASES / VISITS (Consultation Timeline & Digital Prescriptions)
CREATE TABLE IF NOT EXISTS patient_cases (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    doctor_name VARCHAR(100),
    doctor_qualification VARCHAR(150),
    hospital_name VARCHAR(150),
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'completed', 'follow_up'
    token_number VARCHAR(30),
    is_red_flag BOOLEAN DEFAULT false, -- MedRoute Red-Flag Emergency Flag
    red_flag_reason TEXT,
    intake_data JSONB DEFAULT '{}'::jsonb, -- Spoken transcript, AI structured fields
    chief_complaints TEXT NOT NULL,
    history_present_illness TEXT,
    past_history TEXT,
    family_history TEXT,
    personal_history TEXT,
    dietary_lifestyle_habits TEXT,
    prakriti VARCHAR(50),
    vikriti VARCHAR(100),
    agni VARCHAR(50),
    koshtha VARCHAR(50),
    ashtavidha_pariksha JSONB DEFAULT '{}'::jsonb,
    vitals JSONB DEFAULT '{}'::jsonb,
    clinical_findings TEXT,
    lab_reports JSONB DEFAULT '[]'::jsonb,
    diagnosis_ayurvedic VARCHAR(150), -- Populated during doctor clinical consult
    diagnosis_modern VARCHAR(150),
    medicines JSONB DEFAULT '[]'::jsonb, -- [{name, category, dosage, duration, anupana}]
    anupana TEXT,
    pathya_apathya TEXT,
    private_notes TEXT, -- PRIVACY BOUNDARY: Visible ONLY to Authoring Doctor
    ai_case_summary_en TEXT,
    ai_case_summary_hi TEXT,
    ai_risk_factors JSONB DEFAULT '[]'::jsonb,
    ai_missing_fields JSONB DEFAULT '[]'::jsonb,
    ai_dosha_analysis JSONB DEFAULT '{}'::jsonb,
    audio_summary_url TEXT,
    follow_up_date VARCHAR(50),
    prescription_signed BOOLEAN DEFAULT false,
    prescription_signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cases_patient_id ON patient_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_cases_doctor_id ON patient_cases(doctor_id);
CREATE INDEX IF NOT EXISTS idx_cases_red_flag ON patient_cases(is_red_flag);

-- 5. DOCUMENTS TABLE (OCR Document Vault)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'Prescription', 'Lab Report', 'Discharge Summary'
    file_url TEXT,
    date VARCHAR(30),
    source_doctor_or_hospital VARCHAR(150),
    extracted_data JSONB DEFAULT '{}'::jsonb,
    summary TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_docs_patient_id ON documents(patient_id);

-- 6. DOCTOR RATINGS TABLE (Anonymous Verified Reviews)
CREATE TABLE IF NOT EXISTS doctor_ratings (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    doctor_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(id) ON DELETE CASCADE, -- Hidden on UI
    patient_hash VARCHAR(64) NOT NULL, -- Anonymous identifier
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    condition_treated VARCHAR(150),
    comment TEXT,
    verified_consultation BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ratings_doctor_id ON doctor_ratings(doctor_id);
