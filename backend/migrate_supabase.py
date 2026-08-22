import os
import psycopg2
from dotenv import load_dotenv
from database import engine, Base
import models

load_dotenv()

print("=" * 70)
print("[+] CONNECTING TO LIVE SUPABASE POSTGRESQL DATABASE...")
print(f"    Host: db.pyxglijkywuhgrmiowdu.supabase.co:5432")
print("=" * 70)

try:
    # 1. Create all tables in Supabase Postgres
    print("\n[STEP 1] Creating all tables on Supabase Postgres schema...")
    Base.metadata.create_all(bind=engine)
    print("  [OK] Successfully created/verified tables: users, patients, patient_cases, documents, doctor_ratings")

    # 2. Check connection directly with psycopg2
    print("\n[STEP 2] Verifying direct psycopg2 connection to Supabase...")
    db_url = os.getenv("DATABASE_URL")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()[0]
    print(f"  [OK] Live PostgreSQL Version: {db_version}")
    
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = [t[0] for t in cursor.fetchall()]
    print(f"  [OK] Public Tables in Supabase Postgres: {tables}")
    conn.close()

    print("\n[SUCCESS] Live Supabase PostgreSQL connection and table creation complete!")
except Exception as e:
    print(f"[ERROR] Database connection failed: {e}")
