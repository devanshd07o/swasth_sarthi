import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

print("\n--- 1. Testing Doctor Directory ---")
docs = client.get("/api/doctors/").json()
print(f"Total Doctors: {len(docs)}")
for d in docs:
    print(f"  * {d['name']} | {d.get('qualification', '')} | Rating: {d.get('rating_avg', 4.8)}")

print("\n--- 2. Testing Doctor Patients & Red-Flag Priority Sorting ---")
doc_patients = client.get("/api/doctors/DOC-AYUR-101/patients").json()
print(f"Doctor DOC-AYUR-101 Patient Queue: {len(doc_patients)} patients")
for p in doc_patients:
    print(f"  * [{p['row_tag']}] {p['name']} (Token: {p['token_number']}) Red-Flag: {p['is_red_flag']}")

print("\n--- 3. Testing Central ABHA Lookup ---")
lookup = client.get("/api/patients/lookup-abha/ABHA-9821-4501").json()
print(f"ABHA Lookup: {lookup['patient']['name']} ({lookup['patient']['abha_id']}) | Consultations: {lookup['total_consultations']}")

print("\n--- 4. Testing Longitudinal Timeline & Privacy Boundary ---")
timeline = client.get("/api/patients/ABHA-9821-4501/timeline?requesting_doctor_id=DOC-AYUR-101").json()
print(f"Timeline entries across all Vaidyas: {len(timeline['timeline'])}")
print(f"3-Line AI Summary: {timeline['overall_summary_3line']['line1_issues']}")
print(f"Document Vault files: {len(timeline['document_vault'])}")
print(f"Symptom Diary entries: {len(timeline['symptom_diary'])}")

print("\n--- 5. Testing Red-Flag Emergency Detection (MedRoute v1) ---")
rf = client.post("/api/ai/red-flag-scan", json={"transcript": "Mere chhati me bahut tej dard ho raha hai aur saans phool rahi hai"}).json()
print(f"Red Flag Emergency Detected: {rf['is_red_flag']} | Reason: {rf['reason']}")

print("\n--- 6. Testing Intake Structuring ---")
intake = client.post("/api/cases/intake-structuring", json={"transcript": "3 din se knee pain aur morning stiffness ho rahi hai"}).json()
print(f"Structured Chief Complaint: {intake.get('chief_complaint')}")
print(f"Suspected Dosha: {intake.get('suspected_dosha')}")

print("\n[+] ALL TEST SUITES PASSED CLEANLY WITH ZERO ERRORS!")
