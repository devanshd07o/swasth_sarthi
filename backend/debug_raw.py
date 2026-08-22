import asyncio, sys
sys.path.insert(0, r'D:\LetsCode\SwasthSaarthi\backend')

from services.groq_pipeline import _chat

# Test what raw output looks like from qwen
raw = _chat(
    messages=[
        {"role": "system", "content": "You are AyurSaarthi AI, warm health assistant. Reply in 1-2 sentences. Reply ONLY valid JSON."},
        {"role": "user", "content": 'Query: "hello namaste"\nReturn: {"reply_en":"...","reply_hi":"...","dosha_imbalance":null,"urgency":"Routine"}'}
    ],
    model="qwen/qwen3.6-27b",
    key_idx=1,
    max_tokens=350,
)
print("RAW OUTPUT:")
print(repr(raw))
print("\n---")
import json
try:
    parsed = json.loads(raw)
    print("PARSED OK:", parsed)
except Exception as e:
    print("JSON PARSE FAILED:", e)
