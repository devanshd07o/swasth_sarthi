import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.gemini_service import generate_case_summary
from services.groq_pipeline import _chat

router = APIRouter(prefix="/api/cases", tags=["Patient Cases / Consultations"])

# ─── Red Flag Emergency Scanner ───────────────────────────────────────────────
def check_red_flag(text: str) -> dict:
    t = (text or "").lower()
    red_flag_terms = [
        ("chest pain", "Severe acute chest pain / suspected cardiac event"),
        ("heart attack", "Suspected acute coronary syndrome"),
        ("chhati me", "Severe retrosternal chest pain"),
        ("chhati mein", "Severe retrosternal chest pain"),
        ("seene me dard", "Severe retrosternal chest pain"),
        ("seene mein dard", "Severe retrosternal chest pain"),
        ("saans lene me", "Acute respiratory distress"),
        ("saans phool", "Acute respiratory distress / dyspnea"),
        ("difficulty breathing", "Severe dyspnea / respiratory emergency"),
        ("breathless", "Acute respiratory distress"),
        ("stroke", "Suspected cerebrovascular accident / stroke symptoms"),
        ("face drooping", "Neurological deficit"),
        ("slurred speech", "Acute speech impairment"),
        ("unconscious", "Loss of consciousness / syncope"),
        ("behosh", "Altered mental status / syncope"),
        ("heavy bleeding", "Acute hemorrhage / uncontrolled bleeding"),
        ("khoon girna", "Active hemorrhage"),
        ("blood vomit", "Upper GI bleed / hematemesis"),
        ("high fever with convulsion", "Febrile seizures / neurological crisis")
    ]
    for term, reason in red_flag_terms:
        if term in t:
            return {"is_red_flag": True, "reason": reason}
    return {"is_red_flag": False, "reason": None}

@router.post("/intake-structuring")
async def structure_voice_intake(req: schemas.IntakeStructuringRequest):
    """
    Takes patient spoken transcript and structures it into Chief Complaint,
    HPI, Duration, Severity, and performs Red-Flag Emergency Scan.
    """
    transcript = req.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    
    # 1. Red Flag Scan
    rf = check_red_flag(transcript)
    
    # 2. AI Structuring (Chief Complaint, Duration, Severity, Dosha clue)
    sys_prompt = (
        "You are an expert Ayurvedic clinical scribe for Ministry of Ayush OPD. "
        "Extract structured clinical intake facts from patient's spoken symptom statement. "
        "Output strictly valid JSON with keys: "
        "chief_complaint (short standardized medical phrase), "
        "hpi (1-2 sentences narrative), "
        "duration (e.g. 3 days, 6 months), "
        "severity (Mild, Moderate, Severe, Critical), "
        "suspected_dosha (Vata, Pitta, Kapha, or combination), "
        "suggested_pathya (1-2 simple dietary dos), "
        "suggested_apathya (1-2 simple dietary don'ts)."
    )
    user_prompt = f"Patient Spoken Transcript: \"{transcript}\""
    
    try:
        raw = _chat(
            messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}],
            model="openai/gpt-oss-120b",
            key_idx=0,
            max_tokens=400
        )
        import json
        structured = json.loads(raw)
    except Exception:
        # Fallback heuristic structuring
        structured = {
            "chief_complaint": transcript[:60] + "...",
            "hpi": f"Patient reports: {transcript}",
            "duration": "Recent onset",
            "severity": "Severe" if rf["is_red_flag"] else "Moderate",
            "suspected_dosha": "Vata-Pitta Imbalance",
            "suggested_pathya": "Warm water, light freshly cooked meals",
            "suggested_apathya": "Cold drinks, fried and heavily spiced food"
        }
    
    structured["is_red_flag"] = rf["is_red_flag"]
    structured["red_flag_reason"] = rf["reason"]
    structured["original_transcript"] = transcript

    return structured

@router.post("/", response_model=schemas.PatientCaseResponse)
async def create_patient_case(
    case_in: schemas.PatientCaseCreate,
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(
        (models.Patient.id == case_in.patient_id) | (models.Patient.abha_id == case_in.patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    case_dict = case_in.model_dump()
    case_dict["patient_id"] = patient.id

    # If doctor_id provided, populate doctor info
    if case_dict.get("doctor_id"):
        doc = db.query(models.User).filter(
            (models.User.id == case_dict["doctor_id"]) | (models.User.doctor_id == case_dict["doctor_id"])
        ).first()
        if doc:
            case_dict["doctor_id"] = doc.id
            case_dict["doctor_name"] = doc.name
            case_dict["doctor_qualification"] = doc.qualification
            case_dict["hospital_name"] = doc.hospital_name
    
    # Auto-generate OPD Token
    case_count = db.query(models.PatientCase).count()
    case_dict["token_number"] = f"OPD-{case_count + 101:03d}"

    # Auto check red flag if chief complaints provided
    if case_dict.get("chief_complaints"):
        rf = check_red_flag(case_dict["chief_complaints"])
        if rf["is_red_flag"]:
            case_dict["is_red_flag"] = True
            case_dict["red_flag_reason"] = rf["reason"]

    # Default diagnosis if not yet entered by doctor
    if not case_dict.get("diagnosis_ayurvedic"):
        case_dict["diagnosis_ayurvedic"] = "Awaiting Doctor OPD Examination"

    # Generate initial Gemini summary
    summary_input = {
        **case_dict,
        "patient_name": patient.name,
        "age": patient.age
    }
    summary_data = await generate_case_summary(summary_input)
    case_dict["ai_case_summary_en"] = summary_data.get("summary_en")
    case_dict["ai_case_summary_hi"] = summary_data.get("summary_hi")
    case_dict["ai_risk_factors"] = summary_data.get("risk_factors")
    case_dict["ai_missing_fields"] = summary_data.get("missing_fields")

    patient_case = models.PatientCase(**case_dict)
    db.add(patient_case)
    db.commit()
    db.refresh(patient_case)
    return patient_case

@router.get("/patient/{patient_id}", response_model=List[schemas.PatientCaseResponse])
def get_cases_for_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        (models.Patient.id == patient_id) | (models.Patient.abha_id == patient_id)
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    return db.query(models.PatientCase)\
        .filter(models.PatientCase.patient_id == patient.id)\
        .order_by(models.PatientCase.created_at.desc()).all()

@router.get("/{case_id}", response_model=schemas.PatientCaseResponse)
def get_case_by_id(case_id: str, db: Session = Depends(get_db)):
    case_item = db.query(models.PatientCase).filter(models.PatientCase.id == case_id).first()
    if not case_item:
        raise HTTPException(status_code=404, detail="Case record not found")
    return case_item

@router.put("/{case_id}", response_model=schemas.PatientCaseResponse)
async def update_patient_case(
    case_id: str,
    case_update: schemas.PatientCaseCreate,
    db: Session = Depends(get_db)
):
    case_item = db.query(models.PatientCase).filter(models.PatientCase.id == case_id).first()
    if not case_item:
        raise HTTPException(status_code=404, detail="Case record not found")
    
    update_data = case_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(case_item, key, value)
        
    patient = case_item.patient
    full_data = {
        "chief_complaints": case_item.chief_complaints,
        "history_present_illness": case_item.history_present_illness,
        "past_history": case_item.past_history,
        "prakriti": case_item.prakriti,
        "vikriti": case_item.vikriti,
        "agni": case_item.agni,
        "koshtha": case_item.koshtha,
        "vitals": case_item.vitals,
        "clinical_findings": case_item.clinical_findings,
        "diagnosis_ayurvedic": case_item.diagnosis_ayurvedic,
        "diagnosis_modern": case_item.diagnosis_modern,
        "medicines": case_item.medicines,
        "pathya_apathya": case_item.pathya_apathya,
        "patient_name": patient.name if patient else "N/A",
        "age": patient.age if patient else 30
    }
    summary_data = await generate_case_summary(full_data)
    case_item.ai_case_summary_en = summary_data.get("summary_en")
    case_item.ai_case_summary_hi = summary_data.get("summary_hi")
    case_item.ai_risk_factors = summary_data.get("risk_factors")
    case_item.ai_missing_fields = summary_data.get("missing_fields")

    db.commit()
    db.refresh(case_item)
    return case_item

@router.put("/{case_id}/sign", response_model=schemas.PatientCaseResponse)
def sign_and_prescribe(case_id: str, db: Session = Depends(get_db)):
    """
    1-Click 'Sign & Prescribe' action.
    Locks the prescription, timestamps it, and pushes it live to the patient portal & timeline.
    """
    case_item = db.query(models.PatientCase).filter(models.PatientCase.id == case_id).first()
    if not case_item:
        raise HTTPException(status_code=404, detail="Case record not found")
    case_item.prescription_signed = True
    case_item.prescription_signed_at = datetime.utcnow()
    case_item.status = "completed"
    
    db.commit()
    db.refresh(case_item)
    return case_item

@router.get("/{case_id}/pdf")
def download_prescription_pdf(case_id: str, db: Session = Depends(get_db)):
    """
    Generates and returns the official AYUSH e-prescription PDF file.
    """
    from fastapi.responses import FileResponse
    from services.pdf_generator import generate_prescription_pdf
    
    case_item = db.query(models.PatientCase).filter(models.PatientCase.id == case_id).first()
    if not case_item:
        raise HTTPException(status_code=404, detail="Case record not found")
    
    patient = case_item.patient
    case_dict = {
        "id": case_item.id,
        "doctor_name": case_item.doctor_name or "Dr. Rajesh Vaidya",
        "doctor_qualification": case_item.doctor_qualification or "BAMS, MD (Kayachikitsa)",
        "hospital_name": case_item.hospital_name or "All India Institute of Ayurveda",
        "prakriti": case_item.prakriti,
        "diagnosis_ayurvedic": case_item.diagnosis_ayurvedic,
        "diagnosis_modern": case_item.diagnosis_modern,
        "chief_complaints": case_item.chief_complaints,
        "medicines": case_item.medicines or [],
        "anupana": case_item.anupana or "Warm Water",
        "pathya_apathya": case_item.pathya_apathya,
        "follow_up_date": str(case_item.follow_up_date or "After 30 days"),
        "prescription_signed_at": str(case_item.prescription_signed_at or datetime.utcnow()),
        "created_at": str(case_item.created_at or datetime.utcnow())
    }
    pat_dict = {
        "name": patient.name if patient else "Ramesh Sharma",
        "abha_id": patient.abha_id if patient else "ABHA-9821-4501",
        "age": patient.age if patient else 52,
        "gender": patient.gender if patient else "male",
        "contact": patient.contact if patient else "+91 9876543210"
    }
    pdf_path = generate_prescription_pdf(case_dict, pat_dict)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path)
    )
