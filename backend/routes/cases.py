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
    import json as _json
    import re as _re

    transcript = req.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    
    rf = check_red_flag(transcript)
    
    sys_prompt = (
        "You are an expert Ayurvedic clinical scribe for Ministry of Ayush OPD. "
        "Extract structured clinical intake facts from patient's spoken symptom statement. "
        "IGNORE any meta-comments or user feedback about the app or software. "
        "Output strictly valid JSON object with keys: "
        "chief_complaint (short standardized medical phrase max 10 words), "
        "hpi (2-3 sentences narrative), "
        "duration (standardized duration e.g. 3 days, 6 months), "
        "severity (Mild, Moderate, Severe, Critical), "
        "suspected_dosha (Vata, Pitta, Kapha, or combination), "
        "suggested_pathya (1-2 simple dietary dos), "
        "suggested_apathya (1-2 simple dietary don'ts)."
    )
    user_prompt = f"Patient Spoken Transcript: \"{transcript}\""
    
    parsed = None
    try:
        raw = _chat(
            messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}],
            model="openai/gpt-oss-120b",
            key_idx=0,
            max_tokens=1000
        )
        if raw:
            clean_raw = raw.replace("```json", "").replace("```", "").strip()
            clean_raw = clean_raw.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
            clean_raw = clean_raw.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
            match = _re.search(r"\{[\s\S]*\}", clean_raw)
            if match:
                clean_raw = match.group(0).strip()
            parsed = _json.loads(clean_raw)
    except Exception as err:
        print("[intake-structuring LLM parse error]:", err)

    if parsed and isinstance(parsed, dict) and parsed.get("chief_complaint"):
        parsed["is_red_flag"] = rf["is_red_flag"]
        parsed["red_flag_reason"] = rf["reason"]
        parsed["original_transcript"] = transcript
        return parsed

    structured = {
        "chief_complaint": transcript[:60],
        "hpi": f"Patient reports onset of symptoms: {transcript[:100]}...",
        "duration": "Recent onset",
        "severity": "Severe" if rf["is_red_flag"] else "Moderate",
        "suspected_dosha": "Vata-Pitta Imbalance",
        "suggested_pathya": "Warm water, light freshly cooked meals",
        "suggested_apathya": "Cold drinks, fried and heavily spiced food",
        "is_red_flag": rf["is_red_flag"],
        "red_flag_reason": rf["reason"],
        "original_transcript": transcript
    }
    return structured


@router.post("/analyse-gaps")
async def analyse_transcript_gaps(req: schemas.IntakeStructuringRequest):
    """
    Phase 1→2: Reads patient transcript, performs partial structuring to see what is already
    captured, and AI-generates targeted, condition-specific follow-up questions for missing clinical details.
    """
    import json as _json
    import re as _re

    transcript = req.transcript.strip()
    language = req.language or "en"
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")

    rf = check_red_flag(transcript)

    lang_instruction = (
        "Write all questions in natural Hindi (Devanagari script or Hinglish)."
        if language in ("hi", "sa") else
        "Write all questions in natural Marathi."
        if language == "mr" else
        "Write all questions in clear English."
    )

    sys_prompt = (
        "You are an expert Ayurvedic clinician at an AYUSH hospital OPD. "
        "A patient provided a spoken description of their symptoms. Read it carefully. "
        "1. Extract what is ALREADY clearly present into `partial_structure`: "
        "chief_complaint (string or null), duration (string or null), severity (Mild/Moderate/Severe/Critical or null), "
        "suspected_dosha (Vata/Pitta/Kapha or null). "
        "2. Identify what crucial clinical information is MISSING or incomplete for their specific condition "
        "(e.g., if joint pain: ask about swelling, morning stiffness, aggravate/relieve factors; "
        "if stomach problem: ask about appetite, acidity, bowel movements, timing after meals; "
        "if skin issue: ask about itching, spreading, food triggers; if headache: ask about location, vision issues, stress). "
        f"3. Generate 3 to 5 HYPER-SPECIFIC, TARGETED CLINICAL FOLLOW-UP QUESTIONS for this patient. {lang_instruction} "
        "Output strictly valid JSON object with format:\n"
        "{\n"
        '  "partial_structure": { "chief_complaint": "...", "duration": "...", "severity": "...", "suspected_dosha": "..." },\n'
        '  "gap_questions": [\n'
        '     { "field": "symptom_details", "question": "Specific question..." },\n'
        '     { "field": "triggers_relief", "question": "Specific question..." }\n'
        '  ]\n'
        "}"
    )
    user_prompt = f"Patient transcript: \"{transcript}\""

    parsed = None
    try:
        raw = _chat(
            messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}],
            model="openai/gpt-oss-120b",
            key_idx=0,
            max_tokens=600
        )
        if raw:
            # Clean raw response
            clean_raw = raw.replace("```json", "").replace("```", "").strip()
            clean_raw = clean_raw.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
            match = _re.search(r"\{[\s\S]*\}", clean_raw)
            if match:
                clean_raw = match.group(0).strip()
            parsed = _json.loads(clean_raw)
    except Exception as err:
        print("Analyse gaps LLM parse error:", err)

    if parsed and isinstance(parsed, dict):
        partial = parsed.get("partial_structure", {})
        raw_questions = parsed.get("gap_questions", [])
        suspected_dosha = partial.get("suspected_dosha") or parsed.get("suspected_dosha", None)

        normalized_questions = []
        for idx, item in enumerate(raw_questions):
            if isinstance(item, dict) and item.get("question"):
                normalized_questions.append({
                    "field": item.get("field", f"gap_{idx+1}"),
                    "question": item.get("question")
                })
            elif isinstance(item, str) and item.strip():
                normalized_questions.append({
                    "field": f"gap_{idx+1}",
                    "question": item.strip()
                })

        if normalized_questions:
            return {
                "partial_structure": partial,
                "gap_questions": normalized_questions[:6],
                "suspected_dosha": suspected_dosha,
                "is_red_flag": rf["is_red_flag"],
                "red_flag_reason": rf["reason"],
                "original_transcript": transcript
            }

    # Backup heuristic ONLY if LLM call fails completely
    partial = {"chief_complaint": transcript[:60], "duration": None, "severity": "Moderate"}
    if language in ("hi", "sa"):
        gap_questions = [
            {"field": "duration", "question": "यह तकलीफ आपको कितने दिनों या महीनों से हो रही है?"},
            {"field": "aggravating", "question": "किस काम या खाने-पीne से यह तकलीफ बढ़ती या कम होती है?"},
            {"field": "associated", "question": "क्या इसके साथ कोई अन्य लक्षण जैसे सूजन, बुखार या थकान महसूस होती है?"},
            {"field": "history", "question": "क्या पहले कभी ऐसी बीमारी या कोई पुरानी स्वास्थ्य समस्या रही है?"}
        ]
    else:
        gap_questions = [
            {"field": "duration", "question": "How long have you been experiencing these symptoms? (days/weeks)"},
            {"field": "aggravating", "question": "What specifically aggravates or relieves your symptoms?"},
            {"field": "associated", "question": "Do you have any associated symptoms like fever, swelling, or digestive trouble?"},
            {"field": "history", "question": "Any past medical history, chronic conditions, or ongoing medications?"}
        ]
    suspected_dosha = "Vata-Pitta Imbalance"

    return {
        "partial_structure": partial,
        "gap_questions": gap_questions,
        "suspected_dosha": suspected_dosha,
        "is_red_flag": rf["is_red_flag"],
        "red_flag_reason": rf["reason"],
        "original_transcript": transcript
    }


@router.post("/complete-structuring")
async def complete_full_structuring(req: schemas.CompleteStructuringRequest):
    """
    Phase 3→4: Takes original transcript + all Q&A gap answers and produces
    a final, complete, physician-ready structured clinical intake.
    """
    import json as _json
    import re as _re

    transcript = req.transcript.strip()
    qa_context = "\n".join([
        f"Q: {pair.question}\nA: {pair.answer}"
        for pair in req.qa_pairs if pair.answer and pair.answer.strip() not in ("—", "skipped", "")
    ])

    rf = check_red_flag(transcript + " " + qa_context)

    sys_prompt = (
        "You are a senior Ayurvedic clinician writing a formal OPD clinical intake record for AYUSH Hospital. "
        "Review the patient's original spoken statement AND their follow-up Q&A answers. "
        "Extract clinical facts. IGNORE any meta-comments or user feedback about the software/questions. "
        "Synthesize a clear, concise, physician-ready structured report. "
        "Output strictly a valid JSON object with ALL these keys:\n"
        "{\n"
        '  "chief_complaint": "precise medical complaint, max 10 words",\n'
        '  "hpi": "2-3 sentences narrative describing duration, onset, nature of pain/symptom, aggravating/relieving factors",\n'
        '  "duration": "standardized duration e.g. 3 days / 2 weeks",\n'
        '  "severity": "Mild / Moderate / Severe / Critical",\n'
        '  "aggravating_factors": "what worsens the condition",\n'
        '  "relieving_factors": "what provides relief",\n'
        '  "associated_symptoms": "other symptoms present",\n'
        '  "past_history": "past medical history or None reported",\n'
        '  "diet_lifestyle": "diet and daily routine facts",\n'
        '  "suspected_dosha": "Ayurvedic dosha classification (e.g. Vata-Kapha Vriddhi)",\n'
        '  "suggested_pathya": "2-3 dietary/lifestyle dos",\n'
        '  "suggested_apathya": "2-3 dietary/lifestyle don\'ts",\n'
        '  "clinical_summary": "3-4 sentences physician-ready comprehensive summary of the case",\n'
        '  "suggested_investigations": "1-3 relevant lab tests/scans or None required at this stage"\n'
        "}"
    )
    user_prompt = (
        f"Original patient statement:\n\"{transcript}\"\n\n"
        f"Follow-up answers:\n{qa_context if qa_context else 'No additional information provided.'}"
    )

    parsed = None
    try:
        raw = _chat(
            messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}],
            model="openai/gpt-oss-120b",
            key_idx=0,
            max_tokens=1500
        )
        if raw:
            clean_raw = raw.replace("```json", "").replace("```", "").strip()
            clean_raw = clean_raw.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
            clean_raw = clean_raw.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
            match = _re.search(r"\{[\s\S]*\}", clean_raw)
            if match:
                clean_raw = match.group(0).strip()
            parsed = _json.loads(clean_raw)
    except Exception as err:
        print("Complete structuring LLM parse error:", err)

    if parsed and isinstance(parsed, dict) and parsed.get("chief_complaint"):
        parsed["is_red_flag"] = rf["is_red_flag"]
        parsed["red_flag_reason"] = rf["reason"]
        parsed["original_transcript"] = transcript
        parsed["qa_pairs"] = [{"question": p.question, "answer": p.answer} for p in req.qa_pairs]
        return parsed

    # Fallback ONLY if AI service completely fails
    structured = {
        "chief_complaint": transcript[:60],
        "hpi": f"Patient presents with symptoms of {transcript[:80]}...",
        "duration": "Recent onset",
        "severity": "Severe" if rf["is_red_flag"] else "Moderate",
        "aggravating_factors": "Not specified",
        "relieving_factors": "Not specified",
        "associated_symptoms": "None reported",
        "past_history": "None reported",
        "diet_lifestyle": "Routine Indian diet",
        "suspected_dosha": "Vata-Pitta Imbalance",
        "suggested_pathya": "Warm water, light freshly cooked meals",
        "suggested_apathya": "Cold drinks, fried and heavily spiced food",
        "clinical_summary": f"Patient reports onset of symptoms: {transcript[:120]}. Recommended for OPD clinical evaluation.",
        "suggested_investigations": "Routine blood count / Routine OPD screening",
        "is_red_flag": rf["is_red_flag"],
        "red_flag_reason": rf["reason"],
        "original_transcript": transcript,
        "qa_pairs": [{"question": p.question, "answer": p.answer} for p in req.qa_pairs]
    }
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
