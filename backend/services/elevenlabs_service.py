import os
import requests
import urllib.parse
from config import settings

ELEVENLABS_API_KEY = settings.ELEVENLABS_API_KEY or os.getenv("ELEVENLABS_API_KEY", "")
DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9"

def fetch_google_tts_audio(text: str, language: str = "en") -> bytes:
    """Fallback MP3 audio synthesis using Google Neural TTS engine."""
    try:
        tl = "hi" if language == "hi" else "en"
        # Split into ~150-char chunks for clean TTS processing
        words = text.split(" ")
        chunks = []
        curr = ""
        for w in words:
            if len(curr) + len(w) + 1 > 140:
                chunks.append(curr.strip())
                curr = w + " "
            else:
                curr += w + " "
        if curr.strip():
            chunks.append(curr.strip())

        all_audio = bytearray()
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        for chunk in chunks:
            if not chunk:
                continue
            q = urllib.parse.quote(chunk)
            url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl={tl}&client=tw-ob"
            res = requests.get(url, headers=headers, timeout=6)
            if res.status_code == 200 and len(res.content) > 0:
                all_audio.extend(res.content)

        return bytes(all_audio)
    except Exception as e:
        print(f"[Google TTS Fallback Exception]: {e}")
        return b""

# Global state for ElevenLabs Key Pool Rotation
_current_key_idx = 0
_exhausted_keys = set()

async def text_to_speech_audio(text: str, language: str = "en", voice_id: str = DEFAULT_VOICE_ID) -> bytes:
    """
    Synthesizes speech using ElevenLabs API (with smart round-robin multi-key pool rotation).
    Automatically skips exhausted/rate-limited keys and falls back to HD Google MP3 TTS.
    """
    global _current_key_idx, _exhausted_keys

    raw_keys = [
        settings.ELEVENLABS_API_KEY,
        settings.ELEVENLABS_API_KEY_SECONDARY,
        settings.ELEVENLABS_API_KEY_TERTIARY,
        settings.ELEVENLABS_API_KEY_QUATERNARY,
        settings.ELEVENLABS_API_KEY_QUINARY,
        settings.ELEVENLABS_API_KEY_SENARY,
        os.getenv("ELEVENLABS_API_KEY", "")
    ]
    # Filter valid non-empty unique keys
    unique_keys = list(dict.fromkeys([k.strip() for k in raw_keys if k and k.strip()]))

    if not unique_keys:
        print("[ElevenLabs Info] No API keys configured in pool. Falling back to HD Google TTS.")
        return fetch_google_tts_audio(text, language)

    # Enforce strictly female voices only - Default: Jessica (cgSgspJ2msm6clMCkdW9)
    FEMALE_VOICES = ["cgSgspJ2msm6clMCkdW9", "21m00Tcm4TlvDq8ikWAM", "EXAVITQu4vr4xnSDxMaL", "AZnzlk1XvdvUeBnXmlld"]
    chosen_voice = voice_id if (voice_id and voice_id in FEMALE_VOICES) else DEFAULT_VOICE_ID
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{chosen_voice}"

    # Try all unique keys starting from the current round-robin pointer
    total_keys = len(unique_keys)
    start_pointer = _current_key_idx % total_keys

    for offset in range(total_keys):
        idx = (start_pointer + offset) % total_keys
        key = unique_keys[idx]

        # Skip key if marked exhausted in current session
        if key in _exhausted_keys:
            print(f"[ElevenLabs Skip] Key #{idx+1} marked exhausted. Trying next key...")
            continue

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": key
        }
        payload = {
            "text": text,
            "model_id": "eleven_turbo_v2_5" if language == "en" else "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=8)
            if response.status_code == 200 and len(response.content) > 0:
                print(f"[ElevenLabs Pool Success] Audio synthesized using Key #{idx+1} (Pool size: {total_keys})")
                # Advance round-robin pointer for next call
                _current_key_idx = (idx + 1) % total_keys
                return response.content
            elif response.status_code in (401, 429, 402):
                print(f"[ElevenLabs Quota Exhausted] Key #{idx+1} status {response.status_code}: {response.text[:80]}")
                _exhausted_keys.add(key)
            else:
                print(f"[ElevenLabs Warning] Key #{idx+1} status {response.status_code}: {response.text[:80]}")
        except Exception as e:
            print(f"[ElevenLabs Exception] Key #{idx+1} error: {e}")

    # Fallback to HD Google MP3 TTS if all ElevenLabs keys are exhausted
    print("[ElevenLabs Pool] All ElevenLabs keys exhausted or failed. Falling back to HD Google TTS.")
    return fetch_google_tts_audio(text, language)

