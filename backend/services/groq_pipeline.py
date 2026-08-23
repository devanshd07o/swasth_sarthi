"""
AyurSaarthi Voice AI Pipeline — Clinical Grade with Smart Intent Routing & Focused Context.

Architecture:
  Stage 1: Intent router (Hinglish/Hindi/English symptom aware)
  Stage 2: Clinical responder (Full focus on current query, severity inquiry, home remedies, specialist guidance)
  Stage 3: Background session rolling summary & permanent memory

Zero question bleeding. Zero generic bot disclaimers.
"""

import json
import asyncio
import threading
from groq import Groq
from config import settings
from services.ayurveda_knowledge import AYURVEDA_KNOWLEDGE_BASE
from services.gemini_service import read_patient_memory, append_patient_memory
from services.session_memory import get_session_context, add_turn_and_update_summary

# ─── Key Pool ────────────────────────────────────────────────────────────────
_KEY_POOL = [
    k for k in [
        settings.GROQ_API_KEY_PRIMARY,
        settings.GROQ_API_KEY_SECONDARY,
        settings.GROQ_API_KEY_FALLBACK,
    ] if k and k.strip()
]

_MODEL_POOL = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
]

def _client(idx: int = 0) -> Groq:
    if not _KEY_POOL:
        raise ValueError("No Groq API key configured.")
    key = _KEY_POOL[idx % len(_KEY_POOL)]
    return Groq(api_key=key)

def _extract_json(text: str) -> str:
    """Extract clean JSON object from raw response."""
    import re
    if not text:
        return ""
    text = text.replace("```json", "").replace("```", "").strip()
    text = text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    match = re.search(r"\{[\s\S]*\}", text)
    return match.group(0).strip() if match else text.strip()

def _chat(messages: list, model: str = "openai/gpt-oss-120b", key_idx: int = 0, max_tokens: int = 1500) -> str:
    """Sync Groq call with multi-key rotation and multi-model fallback."""
    models_to_try = [model] + [m for m in _MODEL_POOL if m != model]
    
    for m in models_to_try:
        for attempt in range(len(_KEY_POOL) or 1):
            try:
                client = _client(key_idx + attempt)
                resp = client.chat.completions.create(
                    model=m,
                    messages=messages,
                    temperature=0.25,
                    max_tokens=max_tokens,
                )
                content = resp.choices[0].message.content
                if content and content.strip():
                    return _extract_json(content)
            except Exception as e:
                msg = str(e).lower()
                print(f"[Groq Chat Warning] model={m}, key_idx={key_idx+attempt}: {e}")
                if "rate" in msg or "429" in msg:
                    continue
                break  # Try next model if model error
    return ""

def transcribe_audio_groq(audio_bytes: bytes, filename: str = "audio.webm", language: str = None) -> str:
    """Transcribes real spoken audio via Groq Whisper API (whisper-large-v3)."""
    for attempt in range(3):
        try:
            client = _client(attempt)
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_bytes),
                model="whisper-large-v3",
                response_format="json",
                language=language if language in ["hi", "en"] else None,
                temperature=0.0
            )
            return transcription.text.strip()
        except Exception as e:
            print(f"[Groq Whisper STT Error attempt {attempt+1}]: {e}")
            continue
    return ""

# ─── Local KB Keyword Lookup ─────────────────────────────────────────────────
def _kb_snippet(query: str) -> str:
    """Return top 3 KB lines matching query keywords."""
    words = set(query.lower().split())
    scored = []
    for line in AYURVEDA_KNOWLEDGE_BASE.splitlines():
        line = line.strip()
        if len(line) < 25:
            continue
        hits = sum(1 for w in words if w in line.lower())
        if hits:
            scored.append((hits, line))
    scored.sort(key=lambda x: -x[0])
    return " ".join(l for _, l in scored[:3])

# ─── Stage 1 — Fast Intent Classifier ────────────────────────────────────────
def _classify(query: str, session_summary: str) -> dict:
    q_lower = query.lower()
    
    # Common Hinglish, Hindi, and English symptom terms
    symptom_keywords = [
        "dard", "pain", "pet", "stomach", "sar", "sir", "headache", "ghutna", "knee", "joint",
        "acidity", "gas", "jalan", "vomit", "ulti", "fever", "bukhar", "khansi", "cough",
        "cold", "zukam", "stiff", "loose", "dast", "swelling", "sujan", "skin", "rash",
        "khujli", "itch", "chakkar", "dizzy", "fatigue", "thakan", "kamzori", "digestion",
        "pachan", "kabz", "constipation", "amla", "pitta", "vata", "kapha", "medicine", "dawa",
        "upchar", "remedy", "food", "diet", "kya khau", "kya khana", "bimar"
    ]
    if any(k in q_lower for k in symptom_keywords):
        return {"intent": "medical"}

    raw = _chat(
        messages=[
            {
                "role": "system",
                "content": (
                    "Classify user query for an Ayurvedic doctor platform into: "
                    "'medical' (if user asks about any symptom, pain, illness, remedy, medicine, body part in Hindi/Hinglish/English), "
                    "'emergency' (severe chest pain, bleeding, unconsciousness), or "
                    "'casual' (ONLY for pure greetings like hello, hi, how are you, who are you). "
                    "Respond strictly in JSON: {\"intent\":\"casual|medical|emergency\"}"
                )
            },
            {
                "role": "user",
                "content": f"User Query: \"{query}\""
            }
        ],
        model="openai/gpt-oss-20b",
        key_idx=0,
        max_tokens=60,
    )
    try:
        return json.loads(raw)
    except Exception:
        return {"intent": "medical" if any(k in q_lower for k in symptom_keywords) else "casual"}

# ─── Stage 2 — Clinical Response Generator ───────────────────────────────────
def _respond(query: str, intent: str, session_summary: str, recent_turns: list, memory: str) -> dict:
    persona_core = (
        "CORE IDENTITY & VOICE PERSONA (CHATGPT / GEMINI VOICE MODE STYLE):\n"
        "- You are 'आयुसारथी' (AyurSaarthi), a highly intelligent, natural, and caring young female Ayurvedic Doctor & Health Companion for the Ministry of Ayush, India.\n"
        "- CONVERSATIONAL FLUIDITY (LIKE GEMINI / CHATGPT VOICE):\n"
        "  * Speak in spontaneous, natural, spoken dialogue — never sound scripted, formulaic, or robotic.\n"
        "  * DO NOT force questions artificially in every turn. Only ask a gentle follow-up if it genuinely adds value to the diagnosis or conversation.\n"
        "  * If user asks a direct question (e.g. 'Can I drink milk?', 'What is Triphala?'), answer directly and clearly.\n"
        "  * If user shares a symptom, explain the Ayurvedic perspective simply and give practical, soothing home remedies.\n"
        "  * Length: 1-3 natural spoken sentences (around 25-45 words). Easy to listen to on voice.\n"
        "- CONTINUITY: Build seamlessly on the ongoing conversation without repeating already mentioned remedies or greetings.\n"
        "- HINDI GRAMMAR: Always speak in natural, everyday first-person feminine Hindi ('सकती हूँ', 'बताती हूँ', 'मैं समझती हूँ'). Never use robotic slashes ('सकता/सकती').\n"
        "- NEVER echo the user's question back ('Based on your query...').\n"
        "- NEVER say 'मैं ठीक हूँ' unless the user explicitly asked how you are ('kaise ho' / 'how are you').\n"
    )

    if intent == "emergency":
        sys = (
            f"{persona_core}\n"
            "EMERGENCY PROTOCOL:\n"
            "Calmly and urgently advise calling 112 or visiting the nearest emergency medical facility immediately. "
            "Output strictly valid JSON with keys: reply_en, reply_hi, dosha_imbalance, urgency."
        )
        usr = f'Query: "{query}"\nReturn JSON: {{"reply_en":"...","reply_hi":"...","dosha_imbalance":null,"urgency":"Emergency"}}'

    elif intent == "medical":
        kb = _kb_snippet(query)
        history_str = "\n".join([f"User: {t.get('user', '')} | AI: {t.get('ai', '')}" for t in recent_turns]) if recent_turns else "None"
        
        sys = (
            f"{persona_core}\n"
            "AYURVEDIC CLINICAL ADVICE & DIAGNOSIS GUIDELINES:\n"
            "1. EMPATHY & REMEDY: Offer immediate soothing empathy and 1-2 practical Ayurvedic home remedies / Dosha insights.\n"
            "2. MANDATORY SEVERITY & DURATION INQUIRY: If the patient is sharing a new symptom or pain, ALWAYS ask about severity (दर्द कितना तेज़ है? / How intense is the pain?) and duration (कब से हो रहा है? / Since when have you had this?).\n"
            "3. SPECIALIST ADVICE: If the condition seems chronic or severe, advise consulting an Ayurvedic specialist (e.g. Kayachikitsa / Panchakarma physician).\n"
            "4. Keep the entire reply to 2-3 short, clear sentences (around 30-45 words). Output strictly valid JSON."
        )
        usr = f"""
Patient Background: {memory[:200] if memory else "None"}
Ongoing Discussion Context: {session_summary or "New consultation turn"}
Recent Conversation History (Avoid repeating these):
{history_str}

Ayurveda Clinical Reference:
{kb or "Apply Tridosha and Agni principles."}

USER QUERY: "{query}"

Respond strictly in valid JSON format:
{{
  "reply_en": "Natural 2-3 sentence clinical response in English with remedies and severity+duration inquiry",
  "reply_hi": "सटीक और मधुर 2-3 वाक्यों का हिंदी संवाद (घरेलू उपाय + दर्द कितना तेज़ है और कब से हो रहा है पूछें)",
  "dosha_imbalance": "e.g. Pitta / Vata / Kapha Imbalance",
  "urgency": "Routine | Urgent | Emergency"
}}
"""
    else:
        history_str = "\n".join([f"User: {t.get('user', '')} | AI: {t.get('ai', '')}" for t in recent_turns]) if recent_turns else "None"
        sys = (
            f"{persona_core}\n"
            "CASUAL / GENERAL CONVERSATION:\n"
            "- Speak naturally, casually, and warmly like a friendly companion.\n"
            "- If asked 'kaise ho', greet warmly ('नमस्ते! मैं बहुत बढ़िया हूँ, आप कैसे हैं?'). Otherwise respond naturally to what was said.\n"
            "- Output strictly valid JSON."
        )
        usr = f"""
Session Summary: {session_summary or "None"}
Recent History: {history_str}
Query: "{query}"

Return JSON:
{{
  "reply_en": "Natural conversational reply in English as AyurSaarthi",
  "reply_hi": "आयुसारथी के रूप में स्वाभाविक और आत्मीय हिंदी संवाद",
  "dosha_imbalance": null,
  "urgency": "Routine"
}}
"""

    raw = _chat(
        messages=[{"role": "system", "content": sys}, {"role": "user", "content": usr}],
        model="openai/gpt-oss-120b",
        key_idx=1,
        max_tokens=1200,
    )

    try:
        data = json.loads(raw)
        if data.get("reply_en") and data.get("reply_hi"):
            return data
    except Exception:
        pass

    # Dynamic Intelligent Query-Specific Fallback
    q_lower = query.lower()
    if any(k in q_lower for k in ["pet", "stomach", "gas", "acidity", "kabz", "digestion", "pachan"]):
        return {
            "reply_en": "I understand your digestion concern. Drinking warm water with cumin seeds can help soothe your stomach. Are you experiencing acidity or bloating?",
            "reply_hi": "मैं आपकी पाचन संबंधी समस्या समझ सकती हूँ। गुनगुने पानी में जीरा उबालकर पीना पेट के लिए लाभकारी है। क्या आपको गैस या एसिडिटी की शिकायत है?",
            "dosha_imbalance": "Pitta-Vata Imbalance",
            "urgency": "Routine",
        }
    elif any(k in q_lower for k in ["sar", "sir", "headache", "head"]):
        return {
            "reply_en": "Headaches often stem from stress or Pitta imbalance. Applying cool Brahmi or coconut oil to your scalp can bring relief. How long have you had this headache?",
            "reply_hi": "सिरदर्द अक्सर तनाव या पित्त बढ़ने से होता है। नारियल तेल या ब्राह्मी तेल से सिर की हल्की मालिश करने से राहत मिलती है। यह दर्द कब से हो रहा है?",
            "dosha_imbalance": "Pitta Imbalance",
            "urgency": "Routine",
        }
    elif any(k in q_lower for k in ["ghutna", "joint", "knee", "jod"]):
        return {
            "reply_en": "Joint discomfort is closely linked with Vata aggravation. Gently massaging warm sesame oil onto the joints provides great relief. Is the pain constant or during movement?",
            "reply_hi": "जोड़ों में दर्द वात असंतुलन का मुख्य लक्षण है। तिल के तेल को हल्का गुनगुना करके जोड़ों की मालिश करने से काफी आराम मिलता है। क्या दर्द चलने-फिरने पर बढ़ता है?",
            "dosha_imbalance": "Vata Imbalance",
            "urgency": "Routine",
        }
    elif intent == "medical":
        return {
            "reply_en": "I understand your health query. To guide you accurately, could you tell me a bit more about your symptoms, their duration, and severity?",
            "reply_hi": "मैं आपकी स्वास्थ्य संबंधी बात समझ रही हूँ। आपको सही मार्गदर्शन देने के लिए, क्या आप मुझे अपने लक्षणों और वे कब से हैं, इसके बारे में थोड़ा और बता सकते हैं?",
            "dosha_imbalance": "Tridosha Assessment",
            "urgency": "Routine",
        }
    else:
        return {
            "reply_en": "Namaste! I am AyurSaarthi, your dedicated Ayurvedic health guide. Feel free to ask me about any symptoms, remedies, or lifestyle habits.",
            "reply_hi": "नमस्ते! मैं आयुसारथी हूँ, आपकी आयुर्वेदिक स्वास्थ्य साथी। आप मुझसे किसी भी लक्षण, घरेलू उपचार या स्वास्थ्य संबंधी सवाल पूछ सकते हैं।",
            "dosha_imbalance": None,
            "urgency": "Routine",
        }

# ─── Stage 3 — Background Memory & Session Updater ───────────────────────────
def _background_session_update(query: str, reply_en: str, user_id: str, session_id: str):
    """Updates rolling session summary and permanent health facts."""
    try:
        # 1. Update session history + rolling summary
        add_turn_and_update_summary(session_id, query, reply_en)

        # 2. Extract permanent medical fact if relevant
        if any(k in query.lower() for k in ["pain", "stiff", "ache", "since", "year", "month", "diabet", "pressur", "allerg", "dard", "pet"]):
            raw = _chat(
                messages=[
                    {"role": "system", "content": "Extract ONE short concrete medical fact (symptom+duration or diagnosis). No greetings. Output JSON: {\"fact\":\"...\"}"},
                    {"role": "user", "content": f'Query: "{query}"'}
                ],
                model="openai/gpt-oss-20b",
                key_idx=2,
                max_tokens=80,
            )
            try:
                fact_json = json.loads(raw)
                fact = fact_json.get("fact", "").strip()
                if fact and len(fact) > 8 and "?" not in fact:
                    append_patient_memory(user_id, fact)
            except Exception:
                pass
    except Exception as e:
        print(f"[Background Session Update Error]: {e}")

# ─── PUBLIC API ───────────────────────────────────────────────────────────────
async def process_voice_pipeline(
    query: str,
    user_id: str = "default_patient",
    session_id: str = "session_default",
    language: str = "en",
) -> dict:
    """
    3-Stage Clinical Pipeline with Rolling Session Memory.
    """
    query = query.strip()
    if not query:
        return {
            "type": "casual",
            "reply_en": "Namaste! I am AyurSaarthi AI. Please speak or type your symptoms.",
            "reply_hi": "नमस्ते! मैं आयुसारथी AI हूँ। कृपया अपने लक्षण बताएं या लिखें।",
            "dosha_imbalance": None,
            "urgency": "Routine",
            "session_id": session_id,
        }

    # Fetch longitudinal memory + active rolling session summary
    patient_memory = read_patient_memory(user_id)
    session_summary, recent_turns = get_session_context(session_id)

    loop = asyncio.get_event_loop()

    # Stage 1: Classify intent with symptom keywords & context
    classification = await loop.run_in_executor(None, _classify, query, session_summary)
    intent = classification.get("intent", "medical" if any(w in query.lower() for w in ["dard", "pain", "pet", "stomach", "khana", "dawa"]) else "casual")

    # Stage 2: Generate rich clinical response focused on CURRENT query
    result = await loop.run_in_executor(None, _respond, query, intent, session_summary, recent_turns, patient_memory)

    reply_en = result.get("reply_en", "")

    # Stage 3: Background thread for session rolling summary & permanent memory
    threading.Thread(
        target=_background_session_update,
        args=(query, reply_en, user_id, session_id),
        daemon=True
    ).start()

    return {
        "type":            intent,
        "reply_en":        reply_en,
        "reply_hi":        result.get("reply_hi", ""),
        "dosha_imbalance": result.get("dosha_imbalance"),
        "urgency":         result.get("urgency", "Routine"),
        "session_summary": session_summary,
    }
