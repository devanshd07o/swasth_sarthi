# 🌿 SWASTH SAARTHI / MEDIKIOSK (SIH26047)
## Comprehensive Technical System Architecture, Methodology & Clinical Workflow Documentation

---

## 1. Executive Summary & Core Idea

**SwasthSaarthi (MediKiosk)** is an Ayushman Bharat Digital Mission (ABDM) and Ministry of Ayush-compliant, AI-powered Smart Digital Health Kiosk and Clinical Decision Support System (CDSS). 

### Problem Statement:
Traditional Ayurvedic healthcare in India faces four primary bottlenecks:
1. **Unstructured & Vernacular Clinical Intakes**: Rural and elderly patients describe symptoms in colloquial regional Hindi/dialects, leading to communication gaps and loss of clinical nuances.
2. **Missing Longitudinal Health Records**: Patients carry fragmented physical papers (*parchaas*), lab reports, and radiology scans that get lost or damaged over time, breaking continuity of care.
3. **Absence of Real-time Emergency Triage in Ayush OPDs**: Critical red-flag medical emergencies (e.g., myocardial infarction, acute cerebrovascular events, acute dyspnea) are occasionally misdiagnosed as routine *vata/pitta* imbalances in non-integrated OPDs.
4. **Lack of Dual Taxonomy Discovery**: Patients struggle to find certified Ayurvedic Vaidyas based on specific colloquial symptoms or classical Ayurvedic specializations (*Kayachikitsa*, *Shalya Tantra*, *Panchakarma*).

### The SwasthSaarthi Solution:
A bi-directional digital bridge featuring:
- **Zero-Touch Voice AI Intake**: Groq Whisper STT + LLM clinical structuring in native vernacular.
- **ABDM-Compliant Central Identity**: 14-digit ABHA ID integration with DPDP Act 2023 cryptographic consent.
- **Ashtavidha Pariksha & AyurGen Clinical Engine**: Standardized 8-fold Ayurvedic diagnostic matrix mapped to classical formulations (*Yograj Guggulu*, *Mahasudarshan Ghanvati*, *Mahatiktaka Ghrita*, etc.) with strict *Anupana* and *Pathya-Apathya*.
- **MedRoute Red-Flag Triage Engine**: Sub-second emergency interceptor with automated hospital bed/ICU alerting.
- **Multimodal OCR Document Vault**: Digitization and automated entity extraction from historical physical prescriptions.

---

## 2. End-to-End System Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Client & Interface Layer (React 18 + TailwindCSS)"]
        UI_Voice["🎙️ Multilingual Voice Orb & STT"]
        UI_Patient["👤 Patient Portal (5-Step Intake & Vault)"]
        UI_Doctor["👨‍⚕️ Vaidya Clinical Console (Ashtavidha & CDSS)"]
        UI_Admin["🏥 MedRoute Triage & Bed Management"]
        UI_Super["🏛️ Ministry National Analytics Dashboard"]
    end

    subgraph APILayer ["FastAPI API & Triage Gateway (Python 3.11)"]
        AuthRouter["/api/auth (Role & ABHA Token Management)"]
        PatientRouter["/api/patients (Timeline & DPDP Consent)"]
        CaseRouter["/api/cases (Consultation & Clinical Structuring)"]
        DoctorRouter["/api/doctors (OPD Queues & Reviews)"]
        AIRouter["/api/ai (Chatbot & Speech Synthesis)"]
        EmergencyRouter["/api/emergency (Bed Triage & Ambulance Dispatch)"]
    end

    subgraph AIEngine ["AyurSaarthi AI Pipeline"]
        WhisperSTT["Groq Whisper Large v3 (Real-time STT)"]
        ClinicalLLM["Groq Llama-3.3 70B Versatile (Scribe & Entity Extractor)"]
        CDSS_Engine["Ayurveda Classical Formulation Matrix (NAMASTE / ICD-11)"]
        GeminiFlash["Google Gemini 1.5 Flash (Longitudinal Memory & Summaries)"]
        RedFlagInterceptor["MedRoute Red-Flag Interceptor (Zero-Latency Rule + AI)"]
        ElevenLabs["ElevenLabs Neural TTS (Empathetic Audio Scribe)"]
    end

    subgraph DataLayer ["Database & Storage (Supabase PostgreSQL)"]
        DB_Users["users (Doctors, Admins, Credentials)"]
        DB_Patients["patients (ABHA Identifiers, Profiles, Diaries)"]
        DB_Cases["patient_cases (Longitudinal Consultations, Prescriptions)"]
        DB_Docs["ocr_documents (Digitized Historical Parcha & Reports)"]
        DB_Emergency["emergency_cases & hospital_beds (Real-time Beds/ICU)"]
    end

    ClientLayer --> APILayer
    APILayer --> AIEngine
    APILayer --> DataLayer
```

---

## 3. Core Methodologies & Clinical Workflows

### 3.1 Patient Journey: The 5-Step Smart Intake Wizard

```mermaid
sequenceDiagram
    autonumber
    actor P as Patient
    participant Kiosk as MediKiosk UI
    participant API as FastAPI Backend
    participant AI as AI Scribe (Groq + Gemini)
    participant DB as Supabase PostgreSQL

    P->>Kiosk: Enters ABHA ID (or Registers New Profile)
    Kiosk->>API: GET /api/patients/lookup-abha/{abha_id}
    API->>DB: Query Patient + Consent + History
    DB-->>Kiosk: Return Patient Profile, DPDP Consent & Vault Docs

    P->>Kiosk: Step 2: Speaks symptoms in Hindi/English
    Kiosk->>API: POST /api/cases/intake-structuring (Spoken Audio/Text)
    API->>AI: Groq Whisper STT -> Llama-3.3 70B Clinical Structuring
    AI-->>API: Return Chief Complaint, HPI, Duration, Suspected Dosha, Red-Flag Status
    API-->>Kiosk: Display Structured Intake Sheet 1 Preview

    P->>Kiosk: Step 3: Attach Physical Prescription/Reports (OCR Vault)
    Kiosk->>API: POST /api/documents/upload-ocr
    API-->>Kiosk: Extracted Lab Values & Medication History Linked

    P->>Kiosk: Step 4: Discovers Vaidya & Pays Nominal ₹100 Anti-Spam Fee
    Kiosk->>API: POST /api/cases/ (Creates Consultation Token)
    API->>DB: Insert patient_case with token (e.g. OPD-108)
    DB-->>Kiosk: Token Allocated & Case Broadcast to Doctor OPD Queue

    Kiosk-->>P: Step 5: Active Token Displayed, Case Transmitted to Doctor
```

---

### 3.2 Doctor Journey: Vaidya Clinical Console & CDSS

```mermaid
sequenceDiagram
    autonumber
    actor Doc as Ayurvedic Vaidya
    participant Console as Doctor Dashboard
    participant API as FastAPI Backend
    participant CDSS as AyurGen CDSS Engine
    participant DB as Supabase PostgreSQL

    Doc->>Console: Logs in (DOC-AYUR-101)
    Console->>API: GET /api/doctors/DOC-AYUR-101/patients
    API->>DB: Fetch cases where doctor_id = DOC-AYUR-101
    Note over API,DB: Red-Flag Emergencies sorted to the TOP
    DB-->>Console: Display Isolated Patient OPD Queue

    Doc->>Console: Selects Patient (e.g. Ramesh Sharma)
    Console->>API: GET /api/patients/{patient_id}/timeline
    API-->>Console: Loads Longitudinal History, Past Consultations, OCR Documents

    Doc->>Console: Performs Ashtavidha Pariksha (Nadi, Mutra, Mala, Jihva, Shabda, Sparsha, Druk, Akruti)
    Doc->>Console: Selects Dosha Imbalance (e.g., Vata Vriddhi in Sandhi)
    Console->>CDSS: Query Classical Medicines for Condition + Prakriti
    CDSS-->>Console: Suggest Formulations (Yograj Guggulu, Dashmoola Taila, Rasna Saptak) + Anupana (Warm Milk/Kashaya)

    Doc->>Console: Reviews Pathya-Apathya & Digitally Signs Prescription
    Console->>API: PUT /api/cases/{case_id} (prescription_signed: true)
    API->>DB: Updates Case Record + Generates Encrypted ABHA FHIR Payload
    DB-->>Doc: Prescription Locked & Ready for PDF Generation / Patient Sync
```

---

## 4. Key Architectural Pillars

### 4.1 Strict Multi-Tenant Data Isolation
- **Patient Isolation**: Every patient session queries strictly via their verified `abha_id` or internal `patient_id`. Patients have access only to their own consultations, symptom logs, and OCR vault documents.
- **Doctor Queue Isolation**: The endpoint `GET /api/doctors/{doctor_id}/patients` queries `patient_cases` where `doctor_id == current_doctor.id`. Unrelated doctors cannot view other clinics' OPD queues.
- **DPDP Act 2023 Compliance**: Cryptographic consent timestamps are maintained with revocable data sharing boundaries. Private doctor notes (`private_notes`) remain strictly confidential to the authoring doctor.

---

### 4.2 Ashtavidha Pariksha Standardized Diagnostic Matrix
Ayurvedic diagnosis requires an objective 8-fold clinical examination:

| Pariksha (Fold) | Clinical Modality | Diagnostic Indicators Captured in SwasthSaarthi |
| :--- | :--- | :--- |
| **1. Nadi (Pulse)** | Radial Palpation | *Vata (Sarpa/Snake)*, *Pitta (Manduka/Frog)*, *Kapha (Hansa/Swan)*, Rate, Rhythm, Volume |
| **2. Mutra (Urine)** | Urological Inspection | Color (Pale/Yellow/Dark), Turbidity, Sensation (Burning/Normal), Frequency |
| **3. Mala (Stool)** | Gastrointestinal Assay | Consistency (Hard/Loose/Semi-solid), Floating status (*Sama* vs *Nirama*), Frequency |
| **4. Jihva (Tongue)** | Oral Examination | Coating (*Lipta/Saam*), Color, Tremors, Dryness, Papillae prominence |
| **5. Shabda (Voice/Speech)** | Acoustic Triage | Voice clarity, Hoarseness, Weakness, Cough resonance |
| **6. Sparsha (Touch/Skin)** | Tactile Assessment | Skin Temperature (Sheeta/Ushna), Dryness (Ruksha), Moisture (Snigdha), Texture |
| **7. Druk (Eyes/Vision)** | Ophthalmic Assessment | Sclera Color (Haridra/Pitta, Shweta/Kapha, Rakta), Clarity, Photophobia |
| **8. Akruti (Body Build)** | Morphological Analysis | Body constitution (Sthula/Krisha/Madhyama), Posture, Gait, Joint deformities |

---

### 4.3 MedRoute Red-Flag Interceptor & Emergency Protocol
1. **Zero-Latency Regex + Semantic Analysis**:
   - Real-time scanning for triggers: *Severe chest pain*, *heart attack*, *chhati me dard*, *saans phoolna*, *loss of consciousness*, *slurred speech*, *blood vomiting*.
2. **Dynamic Queue Priority Bypassing**:
   - Red-flag cases bypass standard routine token queues, receiving top-of-list emergency status with glowing visual alerts.
3. **Automated Bed & ICU Allocation**:
   - Direct integration with hospital admin dashboard (`/medroute-triage`), tracking ICU, Oxygen, and General bed availability across connected facilities.

---

### 4.4 Multimodal OCR Document Vault
- Physical prescriptions and lab reports uploaded by patients or scanned via kiosk hardware are processed through OCR entity extractors.
- Key medical parameters (e.g., *HbA1c*, *Serum Creatinine*, *Lipid Profile*, *X-Ray findings*) are extracted into structured JSON metadata and appended to the patient's central longitudinal record.

---

## 5. Technology Stack Summary

- **Frontend**: React 18 (Vite), TailwindCSS, Lucide Icons, Modern Glassmorphism UI.
- **Backend API**: FastAPI (Python 3.11), SQLAlchemy ORM, Pydantic v2.
- **Database**: PostgreSQL on Supabase (Scalable Cloud Instance with Connection Pooling).
- **AI & Speech Engine**:
  - **Groq Whisper Large v3**: Real-time Vernacular Speech-to-Text.
  - **Groq Llama-3.3 70B Versatile**: Clinical Structuring, Entity Extraction & Prescription Generation.
  - **Google Gemini 1.5 Flash**: Multi-visit Longitudinal Memory & Patient Summaries.
  - **ElevenLabs**: Empathetic Multilingual Voice Audio Feedback.
- **Security & Standards**: ABDM FHIR Standards, DPDP Act 2023, SHA-256 Checksums, TLS Encryption.

---

## 6. Repository & Live Deployment

- **GitHub Repository**: [https://github.com/devanshd07o/swasth_sarthi.git](https://github.com/devanshd07o/swasth_sarthi.git)
- **Local Development Server**: `http://localhost:3000/`
- **Backend API Docs**: `http://localhost:8000/docs`
