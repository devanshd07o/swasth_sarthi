import os
from supabase import create_client

SUPABASE_URL = "https://pyxglijkywuhgrmiowdu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGdsaWpreXd1aGdybWlvd2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzM3OTEwNywiZXhwIjoyMTAyOTU1MTA3fQ.xkSxKiSoNS0bpDcqbErtk02JJ7X0fddESwJTVI81TLI"

print("[+] Connecting to Supabase Project: pyxglijkywuhgrmiowdu...")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

try:
    # 1. Test Storage Bucket creation / access
    buckets = supabase.storage.list_buckets()
    print(f"  [OK] Supabase Storage connected! Buckets: {[b.name for b in buckets]}")

    # Create 'prescriptions' and 'documents' buckets if they don't exist
    existing_bucket_names = [b.name for b in buckets]
    if "prescriptions" not in existing_bucket_names:
        supabase.storage.create_bucket("prescriptions", options={"public": True})
        print("  [OK] Created 'prescriptions' public storage bucket in Supabase!")
    else:
        print("  [OK] 'prescriptions' bucket exists.")

    if "documents" not in existing_bucket_names:
        supabase.storage.create_bucket("documents", options={"public": True})
        print("  [OK] Created 'documents' public storage bucket in Supabase!")
    else:
        print("  [OK] 'documents' bucket exists.")

    print("\n[SUCCESS] Supabase Client & Storage successfully connected and verified!")
except Exception as e:
    print(f"[ERROR] Supabase connection error: {e}")
