import asyncio, time, sys
sys.path.insert(0, r'D:\LetsCode\SwasthSaarthi\backend')

from services.groq_pipeline import process_voice_pipeline

async def test():
    t = time.time()
    r = await process_voice_pipeline('hello namaste', 'test_user', 'en')
    ms = round((time.time() - t) * 1000)
    print(f"CASUAL ({ms}ms): {r['reply_en'][:100]}")

    t = time.time()
    r = await process_voice_pipeline('I have stomach pain and acidity for 3 days', 'test_user', 'en')
    ms = round((time.time() - t) * 1000)
    print(f"MEDICAL ({ms}ms): {r['reply_en'][:100]}")
    print(f"  Dosha: {r['dosha_imbalance']} | Urgency: {r['urgency']}")

asyncio.run(test())
