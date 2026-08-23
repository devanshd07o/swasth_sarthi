import json
import os
import re

en_path = 'd:/LetsCode/SwasthSaarthi/frontend/src/locales/en/translation.json'
devanagari_pattern = re.compile(r'[\u0900-\u097F]+')

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Replacements for Hindi phrases in en/translation.json
replacements = {
  "गुनगुना पानी (Lukewarm Water) / शहद (Honey)": "Lukewarm Water / Honey",
  "घुटने में दर्द": "Knee Pain",
  "एकीकृत डिजिटल स्वास्थ्य रिकॉर्ड • रीयल-टाइम वॉइस ट्रियाज • रेड-फ्लैग मेडरूट सिस्टम": "Integrated Digital Health Records • Real-Time Voice Triage • Red-Flag MedRoute System",
  "पूर्व परामर्श वैद्य • निरंतर उपचार सेवा": "Previous Consulting Doctor • Continuity of Care",
  "પ્રોફાઇલ અને સમીક્ષાઓ જુઓ": "View Profile & Reviews",
  "ગંભીરતા:": "Severity:",
  "સહાયક": "Assistant",
  "સાંજ": "Evening",
  "સવાર": "Morning",
  "બપોર": "Afternoon"
}

def clean_dict(d):
    for k, v in d.items():
        if isinstance(v, dict):
            clean_dict(v)
        elif isinstance(v, str):
            if devanagari_pattern.search(v):
                # Replace known phrases
                for raw, clean in replacements.items():
                    v = v.replace(raw, clean)
                # Remove any leftover Devanagari characters
                v = devanagari_pattern.sub('', v).strip()
                d[k] = v if v else "Clinical Details"

clean_dict(en_data)

# Re-verify
dev_remaining = []
def check_dev(d, prefix=''):
    for k, v in d.items():
        key_path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            check_dev(v, key_path)
        elif isinstance(v, str) and devanagari_pattern.search(v):
            dev_remaining.append(key_path)

check_dev(en_data)

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print(f"Purge complete. Remaining Devanagari in en/translation.json: {len(dev_remaining)}")
