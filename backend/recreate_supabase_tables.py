import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print("[+] Connecting to Supabase PostgreSQL database to apply fresh schema...")
conn = psycopg2.connect(db_url)
conn.autocommit = True
cursor = conn.cursor()

# 1. Drop existing tables if they have old mismatched schema
print("  - Dropping any old tables...")
cursor.execute("""
    DROP TABLE IF EXISTS doctor_ratings CASCADE;
    DROP TABLE IF EXISTS documents CASCADE;
    DROP TABLE IF EXISTS patient_cases CASCADE;
    DROP TABLE IF EXISTS patients CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
""")

# 2. Read and apply supabase_schema.sql
print("  - Executing supabase_schema.sql DDL...")
with open("supabase_schema.sql", "r", encoding="utf-8") as f:
    sql_script = f.read()

cursor.execute(sql_script)
print("  [OK] Successfully created all fresh tables in Supabase Postgres!")

# 3. Verify created tables & columns
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
""")
tables = [t[0] for t in cursor.fetchall()]
print(f"  [OK] Verified tables in Supabase Postgres: {tables}")

conn.close()
