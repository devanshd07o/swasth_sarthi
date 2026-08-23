import json
import os

locales_dir = 'd:/LetsCode/SwasthSaarthi/frontend/src/locales'

all_missing_keys_en = {
  "admin": {
    "activityBulkSync": "Bulk Patient Records Sync Completed",
    "activityComplianceAlert": "ABDM Compliance & Audit Check Passed",
    "activityNewHospital": "New AYUSH Hospital Onboarded: AIIMS New Delhi",
    "activitySyncRegion": "Regional Node Synced: Northern AYUSH Grid",
    "activitySystemAdmin": "System Administrator",
    "activitySystemUpdate": "MedRoute Routing Algorithm Updated v2.4",
    "activityTime1": "5 mins ago",
    "activityTime2": "18 mins ago",
    "activityTime3": "42 mins ago",
    "activityTime4": "1 hour ago",
    "activityTitle": "Real-Time AYUSH Grid Activity Stream",
    "ambulanceLabel": "Active MedRoute Ambulances",
    "bannerPill": "Ministry of Ayush • National Command Grid",
    "bannerSubtitle": "Live Monitoring of AYUSH OPD EHRs, Hospital Bed Inventories, & Emergency MedRoute ICU Ambulances",
    "bannerTitle": "National AYUSH Analytics & Emergency Command Portal",
    "bedsSuffix": "Beds",
    "colBeds": "Available Beds",
    "colCity": "City / State",
    "colHospitalName": "Hospital Name",
    "colIcu": "ICU Beds",
    "colRegistryId": "Registry ID",
    "colStatus": "AYUSH Status",
    "load": "Load",
    "matchScore": "Match Score",
    "medRouteCalculating": "Calculating MedRoute Routing...",
    "medRouteEmpty": "Click 'Run Emergency Routing' to find optimal ICU hospitals.",
    "medRouteMapTitle": "Live Emergency ICU Bed Routing Grid",
    "medRoutePill": "MedRoute Dispatch Grid",
    "medRouteRun": "Run Emergency Routing",
    "medRouteSubtitle": "Algorithmic matching of ICU beds, ventilators, and ambulances for critical red-flag patients.",
    "medRouteTitle": "MedRoute Emergency ICU Dispatch",
    "noResults": "No registered hospitals match search filter.",
    "rankedTitle": "Ranked ICU Hospital Dispatch List",
    "registrySearch": "Filter hospitals by name, city, or registry ID...",
    "registryTitle": "National AYUSH Hospital Registry",
    "roleDoctor": "Ayurvedic Physician / Staff",
    "roleHospitalAdmin": "Hospital Resource Administrator",
    "rolePatient": "Patient / Citizen",
    "roleSuperAdmin": "Ministry Super Admin",
    "scoringLabel": "Scoring Matrix",
    "settingsEmail": "Email Address",
    "settingsFullName": "Full Name",
    "settingsHospital": "Hospital / Facility Name",
    "settingsLanguage": "Interface Language",
    "settingsRole": "Current System Role",
    "settingsRoleLabel": "System Access Level",
    "settingsSaveBtn": "Save User Settings",
    "settingsSaved": "Settings saved successfully!",
    "settingsSubtitle": "Manage your profile, language preferences, and portal notifications.",
    "settingsTitle": "User & Account Settings",
    "statAiAccuracy": "99.4%",
    "statAiAccuracyDesc": "Ashtavidha AI Accuracy",
    "statCaseSheets": "1,248",
    "statCaseSheetsDesc": "Digital Case Sheets Issued",
    "statEmergencyNodes": "48",
    "statEmergencyNodesDesc": "MedRoute Emergency Nodes",
    "statTotalHospitals": "342",
    "statTotalHospitalsDesc": "Registered AYUSH Hospitals",
    "statusActive": "Active Node",
    "triageBloodBank": "Blood Bank Available",
    "triageIcu": "ICU Bed Availability",
    "triageTitle": "Emergency Resource Triage Criteria",
    "triageTrauma": "24/7 Trauma Care Unit",
    "triageVentilator": "Ventilator Capacity",
    "unitsSuffix": "Units"
  },
  "aiChat": {
    "analyzing": "AyurSaarthi AI is analyzing symptoms...",
    "inputPromptLabel": "Voice or Text Clinical Query",
    "micLabel": "Speech Input",
    "placeholder": "e.g. I have knee joint pain and morning stiffness for 6 months...",
    "reset": "Reset Conversation",
    "subtitle": "Ayurvedic Clinical Triage & Guidance System",
    "title": "AyurSaarthi Voice AI Assistant"
  },
  "audio": {
    "listenVoice": "Listen AI Voice",
    "stopVoice": "Stop AI Voice Narration"
  },
  "auth": {
    "adminError": "Please enter a valid Admin Registration ID",
    "adminIdLabel": "Admin Registration ID / Email",
    "adminRequired": "Admin credentials required",
    "adminTabHeading": "Ministry & Hospital Admin Command Portal",
    "btnAdminLogin": "Login to Admin Portal →",
    "btnRegisterNew": "+ Register Brand New ABHA Account",
    "btnSendOtp": "Send 6-Digit OTP →",
    "btnTryDifferent": "Try Different Login Option",
    "btnVerifyOtp": "Verify OTP & Enter Portal →",
    "changeNumber": "Change Mobile / ID",
    "codeSentToEmail": "Verification code sent to registered email",
    "codeSentToMobile": "Verification code sent to mobile"
  },
  "common": {
    "cancel": "Cancel"
  }
}

def deep_update(d, u):
    for k, v in u.items():
        if isinstance(v, dict):
            d[k] = deep_update(d.get(k, {}), v)
        else:
            d[k] = v
    return d

en_path = os.path.join(locales_dir, 'en', 'translation.json')
with open(en_path, 'r', encoding='utf-8') as f:
    en_json = json.load(f)

updated_en = deep_update(en_json, all_missing_keys_en)

with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(updated_en, f, ensure_ascii=False, indent=2)

print("ALL ADMIN, AI CHAT, AUDIO & AUTH KEYS INJECTED INTO EN TRANSLATIONS!")
