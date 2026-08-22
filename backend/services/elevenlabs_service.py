import os
import requests
from config import settings

ELEVENLABS_API_KEY = settings.ELEVENLABS_API_KEY or os.getenv("ELEVENLABS_API_KEY", "")
# Default voice ID: Jessica (Young/Teen Indian & Multilingual Female Voice)
DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9"

async def text_to_speech_audio(text: str, language: str = "en", voice_id: str = DEFAULT_VOICE_ID) -> bytes:
    """
    Synthesizes speech using ElevenLabs API. Returns raw audio bytes (MP3 format).
    Falls back gracefully if API key is missing or quota is exceeded.
    """
    if not ELEVENLABS_API_KEY:
        print("[ElevenLabs] API Key not set. Voice synthesis fallback mode.")
        return b""

    chosen_voice = voice_id or DEFAULT_VOICE_ID
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{chosen_voice}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.content
        else:
            print(f"[ElevenLabs Error] Status {response.status_code}: {response.text}")
            return b""
    except Exception as e:
        print(f"[ElevenLabs Exception]: {e}")
        return b""
