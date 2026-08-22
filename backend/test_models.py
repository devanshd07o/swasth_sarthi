import time
from groq import Groq
from config import settings

client = Groq(api_key=settings.GROQ_API_KEY_PRIMARY)

for model in ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound', 'groq/compound-mini']:
    try:
        t = time.time()
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an Ayurvedic expert. Return ONLY valid JSON: {\"reply_en\":\"...\",\"reply_hi\":\"...\",\"dosha_imbalance\":\"...\",\"urgency\":\"Routine\"}"},
                {"role": "user", "content": "I have morning stiffness in knees for 2 weeks. What remedies and herbs should I take?"}
            ],
            temperature=0.2,
            max_tokens=600
        )
        ms = round((time.time() - t) * 1000)
        content = resp.choices[0].message.content
        has_think = '<think>' in content
        print(f"MODEL: {model} | Time: {ms}ms | Has think: {has_think}")
        print(content[:250])
        print("=" * 60)
    except Exception as e:
        print(f"MODEL: {model} | ERROR: {e}")
