"""
Session Memory Manager with Short Overview Summary + Last 2 Raw Turns.
Maintains session state, returns exact last 2 chat turns as-is, plus a concise Groq overview summary.
"""

import os
import json
import time
from typing import Dict, List, Tuple
from groq import Groq
from config import settings

SESSIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "DOCS", "patient_sessions")
os.makedirs(SESSIONS_DIR, exist_ok=True)

_SESSION_CACHE: Dict[str, dict] = {}


def _get_session_path(session_id: str) -> str:
    safe_id = "".join(c for c in session_id if c.isalnum() or c in ("-", "_")) or "default"
    return os.path.join(SESSIONS_DIR, f"{safe_id}.json")


def load_session(session_id: str) -> dict:
    if session_id in _SESSION_CACHE:
        return _SESSION_CACHE[session_id]

    file_path = _get_session_path(session_id)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _SESSION_CACHE[session_id] = data
                return data
        except Exception:
            pass

    new_session = {
        "session_id": session_id,
        "created_at": time.time(),
        "overview_summary": "",
        "turns": []
    }
    _SESSION_CACHE[session_id] = new_session
    return new_session


def save_session(session: dict):
    session_id = session.get("session_id", "default")
    _SESSION_CACHE[session_id] = session
    file_path = _get_session_path(session_id)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(session, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Session Memory Save Error]: {e}")


def get_session_context(session_id: str) -> Tuple[str, List[dict]]:
    """
    Returns:
      - overview_summary: Concise 1-2 sentence overview of previous conversations.
      - last_2_turns: Exact last 2 user+ai chat turns as-is.
    """
    session = load_session(session_id)
    summary = session.get("overview_summary", "")
    all_turns = session.get("turns", [])
    # Return exactly the last 2 conversation turns as-is
    last_2_turns = all_turns[-2:] if len(all_turns) >= 2 else all_turns
    return summary, last_2_turns


def add_turn_and_update_summary(session_id: str, user_text: str, ai_text: str):
    """
    Adds latest chat turn and generates a short Groq overview summary.
    """
    session = load_session(session_id)
    session["turns"].append({
        "user": user_text,
        "ai": ai_text,
        "timestamp": time.time()
    })
    # Keep last 10 turns
    if len(session["turns"]) > 10:
        session["turns"] = session["turns"][-10:]

    # Generate / update short overview summary via Groq
    try:
        key = settings.GROQ_API_KEY_SECONDARY or settings.GROQ_API_KEY_PRIMARY
        if key:
            client = Groq(api_key=key)
            prev_summary = session.get("overview_summary", "")
            
            # Format recent conversation for summary
            conversation_history = "\n".join(
                [f"User: {t.get('user', '')} | AI: {t.get('ai', '')}" for t in session["turns"][:-2]]
            )
            
            prompt = f"""
Previous Overview Summary: {prev_summary or "None"}
Past Conversation Dialogue:
{conversation_history or f"User: {user_text} | AI: {ai_text}"}

Write a very short (1-2 sentences max) clinical & conversational overview summary of this user's health complaints and key advised remedies.
Respond ONLY with the 1-2 sentence summary, no meta text.
"""
            resp = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=100
            )
            new_summary = resp.choices[0].message.content.strip()
            if new_summary:
                session["overview_summary"] = new_summary
    except Exception as e:
        print(f"[Groq Summary Error]: {e}")

    save_session(session)
