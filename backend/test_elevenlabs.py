import requests, os
from dotenv import load_dotenv
load_dotenv()

key = os.getenv('ELEVENLABS_API_KEY', '')
print('Key present:', bool(key), '| First 8:', key[:8] if key else 'NONE')

r = requests.get('https://api.elevenlabs.io/v1/voices', headers={'xi-api-key': key})
print('Voices API Status:', r.status_code)

if r.ok:
    voices = r.json()['voices']
    for v in voices[:8]:
        vid = v.get('voice_id', '')
        name = v.get('name', '')
        labels = v.get('labels', {})
        print(f"  {vid} | {name} | {labels}")
else:
    print('ERROR:', r.text[:200])

# Test actual TTS
print('\n--- Testing TTS ---')
test_url = f"https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM"
resp = requests.post(test_url, json={
    "text": "Namaste! I am AyurSaarthi.",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
}, headers={"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": key}, timeout=10)
print('TTS Status:', resp.status_code, '| Bytes:', len(resp.content))
if resp.status_code != 200:
    print('TTS Error:', resp.text[:300])
