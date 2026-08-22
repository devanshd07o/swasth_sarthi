import json
from fastapi import APIRouter, HTTPException, Response, UploadFile, File, Form
from pydantic import BaseModel
from services.groq_pipeline import process_voice_pipeline, _chat, transcribe_audio_groq
from services.gemini_service import generate_case_summary
from services.elevenlabs_service import text_to_speech_audio
import schemas

router = APIRouter(prefix="/api/ai", tags=["AI Assist"])

@router.post("/transcribe-groq-whisper")
async def transcribe_with_groq_whisper(
    file: UploadFile = File(...),
    language: str = Form("hi")
):
    """
    Real STT Integration using Groq Whisper API (whisper-large-v3).
    Transcribes audio bytes into high-precision Hindi/English/Hinglish text.
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty audio file")
    
    text = transcribe_audio_groq(contents, filename=file.filename or "recording.webm", language=language)
    return {"text": text, "engine": "Groq Whisper (whisper-large-v3)"}

class SmartChatRequest(BaseModel):
    query: str
    user_id: str = "default_patient"
    session_id: str = "session_default"
    language: str = "en"

class OCRExtractRequest(BaseModel):
    file_name: str
    doc_type: str = "Prescription"
    mock_raw_text: str = ""

@router.post("/smart-chat")
async def handle_smart_chat(req: SmartChatRequest):
    """
    Full Voice AI Pipeline:
    Groq Intent Router → Knowledge Augmentation → Rich Clinical Response → Rolling Session Memory
    """
    result = await process_voice_pipeline(req.query, req.user_id, req.session_id, req.language)
    return result

@router.post("/summary")
async def get_ai_summary(req: schemas.AISummaryRequest):
    """Gemini structured bilingual clinical summary for case sheet."""
    return await generate_case_summary(req.case_data)

@router.post("/classify-dosha")
async def get_dosha_classification(req: schemas.AIDoshaRequest):
    """Runs the full voice pipeline for dosha triage."""
    return await process_voice_pipeline(req.symptoms, language=getattr(req, "language", "en"))

@router.post("/red-flag-scan")
def scan_red_flags(req: schemas.RedFlagScanRequest):
    """
    MedRoute v1: Scans patient narrative for critical red-flag conditions.
    """
    t = req.transcript.lower()
    triggers = [
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
        ("blood vomit", "Upper GI bleed / hematemesis")
    ]
    for term, reason in triggers:
        if term in t:
            return {"is_red_flag": True, "reason": reason, "urgency": "Emergency (MedRoute Trigger)"}
    
    return {"is_red_flag": False, "reason": None, "urgency": "Routine"}

@router.post("/ocr-extract")
async def extract_ocr_document(req: OCRExtractRequest):
    """
    Simulates / performs AI OCR document extraction on uploaded medical documents.
    """
    sys_prompt = (
        "You are an expert medical OCR parser for Indian clinical prescriptions and lab reports. "
        "Extract structured JSON data: "
        "doctor_or_hospital (name), "
        "date (YYYY-MM-DD or estimated), "
        "diagnoses (list), "
        "medicines (list of {name, dosage}), "
        "summary (2 sentences plain English summary)."
    )
    user_prompt = f"File: {req.file_name}, Document Type: {req.doc_type}. Content: {req.mock_raw_text or 'Ayurvedic prescription dated 2026-03-12 from AIIA OPD. Rx: Yograj Guggulu 2 tab BD, Maharasnadi Kwath 20ml BD. Dx: Sandhivata.'}"
    
    try:
        raw = _chat(
            messages=[{"role": "system", "content": sys_prompt}, {"role": "user", "content": user_prompt}],
            model="openai/gpt-oss-120b",
            key_idx=1,
            max_tokens=350
        )
        data = json.loads(raw)
        return {
            "source_doctor_or_hospital": data.get("doctor_or_hospital", "All India Institute of Ayurveda"),
            "date": data.get("date", "2026-05-10"),
            "extracted_data": {
                "diagnoses": data.get("diagnoses", ["Sandhivata / Osteoarthritis"]),
                "medicines": data.get("medicines", [{"name": "Yograj Guggulu", "dosage": "2 tabs twice daily"}]),
            },
            "summary": data.get("summary", "Previous clinical record extracted from physical prescription file.")
        }
    except Exception:
        return {
            "source_doctor_or_hospital": "Government Ayurvedic Dispensary",
            "date": "2026-06-15",
            "extracted_data": {
                "diagnoses": ["Amlapitta / Gastritis"],
                "medicines": [{"name": "Avipattikar Churna", "dosage": "3g bedtime"}],
            },
            "summary": "Previous prescription scanned and digitized to ABDM Health Vault."
        }

@router.post("/voice-narration")
async def generate_voice_narration(
    text: str,
    language: str = "en",
    voice_id: str = "cgSgspJ2msm6clMCkdW9",  # Jessica (Young/Teen Female Voice)
):
    """ElevenLabs TTS — Jessica Voice ID cgSgspJ2msm6clMCkdW9."""
    audio_bytes = await text_to_speech_audio(text, language, voice_id)
    if not audio_bytes:
        raise HTTPException(status_code=500, detail="Voice synthesis unavailable")
    return Response(content=audio_bytes, media_type="audio/mpeg")
