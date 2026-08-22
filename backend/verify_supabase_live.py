import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
print("=" * 75)
print("[+] LIVE SUPABASE POSTGRESQL (pyxglijkywuhgrmiowdu) DIRECT QUERY REPORT")
print("=" * 75)

conn = psycopg2.connect(db_url)
cursor = conn.cursor()

# 1. Row Counts Across All Tables
print("\n[STEP 1: ACTUAL ROW COUNTS IN LIVE SUPABASE POSTGRES]")
tables = ['users', 'patients', 'patient_cases', 'documents', 'doctor_ratings']
for tbl in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {tbl};")
    count = cursor.fetchone()[0]
    print(f"  * Table '{tbl}': {count} rows")

# 2. Doctors List Query
print("\n[STEP 2: REGISTERED VAIDYAS IN SUPABASE USERS TABLE]")
cursor.execute("SELECT name, qualification, rating_avg, rating_count, hospital_name FROM users WHERE role = 'doctor';")
for doc in cursor.fetchall():
    print(f"  * {doc[0]} | {doc[1]} | {doc[2]} ({doc[3]} reviews) | {doc[4]}")

# 3. Patients List Query (ABHA Master Keys)
print("\n[STEP 3: REGISTERED PATIENTS IN SUPABASE PATIENTS TABLE]")
cursor.execute("SELECT name, abha_id, age, gender, contact FROM patients;")
for pat in cursor.fetchall():
    print(f"  * {pat[0]} | ABHA ID: {pat[1]} | {pat[2]}Y/{pat[3].upper()} | Mobile: {pat[4]}")

# 4. Emergency Red-Flag Cases
print("\n[STEP 4: CLINICAL CASES & RED-FLAG STATUS IN PATIENT_CASES TABLE]")
cursor.execute("SELECT doctor_name, diagnosis_ayurvedic, is_red_flag, token_number, status FROM patient_cases ORDER BY is_red_flag DESC;")
for c in cursor.fetchall():
    flag_str = "[RED-FLAG EMERGENCY]" if c[2] else "[Routine Consultation]"
    print(f"  * {flag_str} {c[0]} -> {c[1]} (Token: {c[3]}, Status: {c[4]})")

conn.close()
print("\n" + "=" * 75)
print("[SUCCESS] LIVE SUPABASE POSTGRESQL DATABASE VERIFIED END-TO-END!")
print("=" * 75)
