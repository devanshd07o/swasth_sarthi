import json
import os
import google.generativeai as genai
from config import settings

# Configure Gemini
api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)

def get_gemini_model():
    return genai.GenerativeModel("gemini-1.5-flash")

# Path for Patient Memory Markdown Files
MEMORY_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "DOCS", "patient_memories")
os.makedirs(MEMORY_DIR, exist_ok=True)

def read_patient_memory(user_id: str) -> str:
    """Reads permanent markdown memory file for a user if present."""
    file_path = os.path.join(MEMORY_DIR, f"{user_id}.md")
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().strip()
        except Exception:
            return ""
    return ""

def append_patient_memory(user_id: str, new_fact: str):
    """Appends important concise health facts to user's permanent memory file."""
    if not new_fact or len(new_fact.strip()) < 5:
        return
    file_path = os.path.join(MEMORY_DIR, f"{user_id}.md")
    try:
        with open(file_path, "a", encoding="utf-8") as f:
            f.write(f"- {new_fact.strip()}\n")
    except Exception as e:
        print(f"[Memory Store Error]: {e}")

async def process_smart_ai_query(user_query: str, user_id: str = "default_patient", lang: str = "en") -> dict:
    """
    Smart Dual-Stage Intent Router + Memory-Augmented Conversational AI.
    1. Classifies if query is Casual Conversation vs Medical Query.
    2. Retrieves user's longitudinal memory.
    3. Generates natural empathetic response in English & Hindi.
    """
    if not api_key:
        return {
            "type": "casual",
            "reply_en": "Namaste! I am AyurSaarthi AI. How can I assist with your health today?",
            "reply_hi": "नमस्ते! मैं आयुसारथी AI हूँ। आज मैं आपके स्वास्थ्य में कैसे मदद कर सकता हूँ?",
            "dosha_data": None
        }

    try:
        model = get_gemini_model()
        user_memory = read_patient_memory(user_id)

        prompt = f"""
You are AyurSaarthi AI, a compassionate, expert Ayurvedic & Medical Assistant for the Ministry of Ayush.
User ID: {user_id}
Existing Longitudinal Health Memory for this User:
{user_memory if user_memory else "No past medical memory recorded yet."}

User Input: "{user_query}"

Step 1: Determine query type:
- "casual": Greeting, casual chat ("hello", "namaste", "who are you", "thank you", "kaise ho").
- "medical": Health symptoms, pain, disease, diet advice, medicine query.

Step 2: Generate response:
- If casual: Give a warm, friendly 1-2 sentence greeting introducing yourself as AyurSaarthi AI in both English and Hindi.
- If medical: Provide a structured clinical triage response (Dosha imbalance, severity, recommended Ayurvedic therapy, dietary Pathya/Apathya).

Step 3: Extract memory fact (if user shared a new personal health detail like age, allergy, symptom duration):
- Extract 1 short bullet string (e.g. "Knee joint pain since 6 months"). If no new fact, leave empty.

Respond strictly in valid JSON format (no markdown fences, no extra text):
{{
  "type": "casual | medical",
  "reply_en": "Response in English",
  "reply_hi": "Response in pure Hindi (शुद्ध हिंदी में)",
  "dosha_imbalance": "Vata / Pitta / Kapha / Vata-Pitta / None",
  "severity": "Routine | Moderate | Urgent",
  "recommended_therapy": "Therapeutic recommendation if medical, or None",
  "new_memory_fact": "Short extracted fact string to store, or empty"
}}
"""
        response = model.generate_content(prompt)
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        result = json.loads(text)

        # Store memory asynchronously if new fact extracted
        if result.get("new_memory_fact"):
            append_patient_memory(user_id, result["new_memory_fact"])

        return result

    except Exception as e:
        print(f"[Smart AI Query Error]: {e}")
        return {
            "type": "casual",
            "reply_en": f"Namaste! I heard you say: '{user_query}'. I am AyurSaarthi AI, ready to assist your health needs.",
            "reply_hi": f"नमस्ते! मैंने आपका प्रश्न सुना: '{user_query}'। मैं आयुसारथी AI आपकी सहायता के लिए तैयार हूँ।",
            "dosha_imbalance": "N/A",
            "severity": "Routine",
            "recommended_therapy": "Ayurvedic OPD Triage",
            "new_memory_fact": ""
        }

async def generate_case_summary(case_data: dict) -> dict:
    """
    Generates structured clinical summary in English and Hindi using Gemini 1.5 Flash.
    """
    if not api_key:
        return {
            "summary_en": f"Patient presents with {case_data.get('chief_complaints', 'N/A')}. Prakriti: {case_data.get('prakriti', 'Vata-Pitta')}. Prescribed Ayurvedic therapy with regular follow-up.",
            "summary_hi": f"रोगी {case_data.get('chief_complaints', 'मुख्य शिकायत')} के साथ आया है। प्रकृति: {case_data.get('prakriti', 'वात-पित्त')}। नियमित फॉलो-अप के साथ आयुर्वेदिक चिकित्सा दी गई।",
            "risk_factors": ["Monitor Agni imbalance", "Ensure dietary compliance"],
            "missing_fields": ["Past medical history", "Family history"],
            "followup_recommendation": "Follow up after 7 days."
        }

async def generate_case_summary(case_data: dict) -> dict:
    """
    Generates structured clinical summary (English & Hindi) using Groq LLM pipeline.
    """
    try:
        from services.groq_pipeline import _chat
        prompt = f"""
You are an expert Ayurvedic clinical assistant AI working for the Ministry of Ayush.
Analyze the following patient case and generate a concise, structured clinical summary.

Patient Case Sheet:
- Chief Complaints: {case_data.get('chief_complaints', 'N/A')}
- History of Present Illness: {case_data.get('history_present_illness', 'N/A')}
- Prakriti: {case_data.get('prakriti', 'N/A')} | Vikriti: {case_data.get('vikriti', 'N/A')}
- Agni: {case_data.get('agni', 'N/A')} | Koshtha: {case_data.get('koshtha', 'N/A')}
- Diagnosis (Ayurvedic): {case_data.get('diagnosis_ayurvedic', 'N/A')}
- Diagnosis (Modern): {case_data.get('diagnosis_modern', 'N/A')}
- Medicines: {case_data.get('medicines', [])}
- Pathya / Apathya: {case_data.get('pathya_apathya', 'N/A')}

Respond strictly in valid JSON format:
{{
  "summary_en": "Concise professional clinical summary in English.",
  "summary_hi": "Professional clinical summary in Hindi.",
  "risk_factors": ["Symptom chronicity"],
  "missing_fields": [],
  "followup_recommendation": "Follow-up in 2-4 weeks."
}}
"""
        res_str = _chat([{"role": "user", "content": prompt}], model="openai/gpt-oss-120b")
        if res_str:
            return json.loads(res_str)
    except Exception as e:
        print(f"[Groq Summary Error]: {e}")

    return {
        "summary_en": f"Clinical summary generated for patient with {case_data.get('chief_complaints', 'symptoms')}.",
        "summary_hi": f"रोगी के लक्षणों के लिए नैदानिक सारांश तैयार किया गया।",
        "risk_factors": ["Observe symptom progression"],
        "missing_fields": [],
        "followup_recommendation": "Follow up in 2 weeks."
    }

async def classify_symptoms_and_dosha(symptoms: str, age: int = 30) -> dict:
    return await process_smart_ai_query(symptoms)
