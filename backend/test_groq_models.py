import requests, os
from dotenv import load_dotenv
load_dotenv()
import time

keys = {
    'primary': os.getenv('GROQ_API_KEY_PRIMARY'),
    'secondary': os.getenv('GROQ_API_KEY_SECONDARY'),
    'fallback': os.getenv('GROQ_API_KEY_FALLBACK'),
}

models_to_test = ['qwen/qwen3.6-27b', 'groq/compound', 'groq/compound-mini', 'openai/gpt-oss-20b']

for name, key in keys.items():
    print(f'\n=== {name.upper()} KEY ===')
    for model in models_to_test:
        try:
            t = time.time()
            r = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "Reply ONLY in JSON: {\"reply\":\"string\"}"},
                        {"role": "user", "content": "stomach pain acidity"}
                    ],
                    "max_tokens": 100,
                    "temperature": 0.2
                },
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                timeout=15
            )
            ms = round((time.time() - t) * 1000)
            if r.ok:
                txt = r.json()['choices'][0]['message']['content'][:60]
                print(f"  {model}: {ms}ms ✓ | {txt}")
            else:
                err = r.json().get('error', {}).get('message', r.text[:80])
                print(f"  {model}: {r.status_code} ✗ | {err[:80]}")
        except Exception as e:
            print(f"  {model}: ERROR | {str(e)[:60]}")
