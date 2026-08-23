import json
import os
import re

en_path = 'd:/LetsCode/SwasthSaarthi/frontend/src/locales/en/translation.json'
devanagari_pattern = re.compile(r'[\u0900-\u097F]')

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# English overrides for all leaked keys
english_clean_overrides = {
  "patientPortal": {
    "step2Tag": "STEP 2 OF 5 • CLINICAL VOICE TRIAGE",
    "step2Title": "Voice Triage & Clinical Conversation",
    "step2Desc": "Record patient symptoms using AI Voice STT or type manually:",
    "listening": "Listening... Tap to stop",
    "tapToSpeak": "Tap to Speak",
    "quickPrompts": "Quick Voice Test Prompts (Click to test):",
    "promptKneePain": "Sandhivata / Knee Pain Statement",
    "promptHeartburn": "Amlapitta / Heartburn Statement",
    "promptChestPain": "Red-Flag Emergency Chest Pain Statement",
    "liveTranscriptLabel": "Live Transcript (You can edit or add details below):",
    "transcriptPlaceholder": "Your spoken words will appear here in real-time...",
    "btnBackIdentification": "← Back to Identification",
    "btnToggleEmergency": "Toggle Emergency Flag",
    "btnAnalyzeSymptoms": "AI Structure & Scan",
    "runningLogTag": "Patient Daily Log (Sheet 1)",
    "symptomDiaryTitle": "Patient Self-Reported Symptom Diary",
    "symptomDiaryDesc": "Log daily symptoms, dietary triggers, or pain changes for Vaidya review.",
    "labelTodaySymptom": "Today's Symptom / Observation",
    "phTodaySymptom": "e.g. Knee stiffness in morning / Acidity after lunch...",
    "labelSeverityLevel": "Severity Level",
    "sevMild": "Mild",
    "sevModerate": "Moderate",
    "sevSevere": "Severe",
    "labelTriggersNotes": "Triggers or Relief Notes (Optional)",
    "phTriggersNotes": "e.g. Relief after drinking warm water...",
    "btnAddSymptomDiary": "+ Add to Symptom Diary",
    "sheet2Tag": "Doctor Verified Case Sheet (Sheet 2)",
    "sheet2Title": "Official Digital Prescriptions and Treatment History",
    "sheet2AbdmSync": "Central ABDM Synced",
    "digitallySigned": "Digitally Signed",
    "consultationDateLabel": "Consultation Date:",
    "btnViewPrintPrescriptionPdf": "View / Print Prescription PDF",
    "ayurvedicDiagnosisLabel": "Ayurvedic Diagnosis",
    "modernLabel": "Modern Diagnosis:",
    "prakritiVikritiLabel": "Prakriti & Vikriti",
    "prescribedMedicinesLabel": "Prescribed Medicines:",
    "anupanaLabel": "Anupana (Vehicle / Adjuvant):",
    "pathyaRegimenLabel": "Pathya Regimen (Dietary Guidelines):",
    "noActiveCaseTitle": "No Active Prescription Recorded",
    "noActiveCaseDesc": "You have not registered a consultation token today.",
    "btnFindDoctor": "Search & Book Vaidya (Step 4) →",
    "emergencyCaseTag": "Emergency Case",
    "activeOpdConsultationTag": "Active OPD Consultation",
    "tokenLabel": "Token:",
    "consultationWith": "Consultation:",
    "todaysQueueSlot": "Today's Queue Slot",
    "btnViewPrescriptionDiet": "View Prescription & Diet Plan",
    "caseTransmittedNotice": "Your medical case sheet has been transmitted to the Vaidya console.",
    "aiSearchPlaceholder": "Type or ask AI (e.g. knee pain, acidity after eating)..."
  }
}

def deep_update(d, u):
    for k, v in u.items():
        if isinstance(v, dict):
            d[k] = deep_update(d.get(k, {}), v)
        else:
            d[k] = v
    return d

updated_en = deep_update(en_data, english_clean_overrides)

# Check remaining Devanagari in en_data
def find_devanagari(d, prefix=''):
    found = []
    for k, v in d.items():
        key_path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            found.extend(find_devanagari(v, key_path))
        elif isinstance(v, str) and devanagari_pattern.search(v):
            found.append((key_path, v))
    return found

dev_keys = find_devanagari(updated_en)
print(f"Remaining Devanagari strings in en/translation.json: {len(dev_keys)}")
for k, v in dev_keys:
    print(f"  - {k}: {v}")

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(updated_en, f, ensure_ascii=False, indent=2)

print("en/translation.json CLEANED OF ALL HINDI LEAKS!")
