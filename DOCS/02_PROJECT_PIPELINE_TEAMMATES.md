# SwasthSaarthi — Complete Project Pipeline
## (Share this with ALL teammates before starting)

---

## WHAT IS SwasthSaarthi?

SwasthSaarthi is ONE platform with TWO powerful sub-modules:

```
┌─────────────────────────────────────────────────────────┐
│                    SWASTH SAARTHI                       │
│              "Swasth ka Saarthi — Your Health Guide"    │
├─────────────────────────┬───────────────────────────────┤
│   MODULE 1: MedRoute    │   MODULE 2: AyurSaarthi       │
│   Emergency Ambulance   │   AI Clinical Case-Taking     │
│   Routing Engine        │   for AYUSH/Ayurveda          │
├─────────────────────────┴───────────────────────────────┤
│         SHARED: Hospitals DB + Patient DB + Auth        │
└─────────────────────────────────────────────────────────┘
```

---

## WHY BOTH PROJECTS TOGETHER?

| Reason | Explanation |
|---|---|
| **Continuity of Care** | Emergency doesn't end at the hospital. AyurSaarthi continues the patient's care after MedRoute brings them there |
| **Shared Hospital Data** | Both modules use same hospital DB. MedRoute reads availability; AyurSaarthi adds case records to same hospital |
| **Higher SIH Score** | Solving TWO problem statements in one platform = massive innovation bonus |
| **Real-World Flow** | Patient calls ambulance → MedRoute finds best hospital → AyurSaarthi starts their digital case file |
| **Demo Power** | You can show a full story: from emergency call → routing → case creation → treatment |
| **Gemini AI** | One AI engine (Gemini) powers BOTH: symptom classification for routing + case summarization for doctors |

---

## FULL SYSTEM ARCHITECTURE

```
                    ┌─────────────────┐
                    │   PATIENT/USER  │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
   ┌───────────────┐ ┌──────────────┐ ┌──────────────────┐
   │  Ambulance    │ │  Doctor's    │ │  Hospital Admin  │
   │  Mobile App   │ │  Web App     │ │  Portal          │
   │  (React Native│ │  (React.js)  │ │  (React.js)      │
   └───────┬───────┘ └──────┬───────┘ └────────┬─────────┘
           │                │                  │
           └────────────────┼──────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   FastAPI Backend  │
                  │   (Python)         │
                  │   REST APIs +      │
                  │   WebSockets       │
                  └─────────┬──────────┘
                            │
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  PostgreSQL  │ │    Redis     │ │  Gemini API  │
   │  Main DB     │ │  Real-time   │ │  (Google AI) │
   │              │ │  Cache       │ │              │
   └──────────────┘ └──────────────┘ └──────────────┘
           │
   ┌───────▼───────┐     ┌─────────────────────┐
   │ Google Maps   │     │  Google Speech API   │
   │ Directions    │     │  (Voice → Text)      │
   │ API           │     └─────────────────────┘
   └───────────────┘
```

---

## HOW THE TWO MODULES CONNECT — DATA FLOW

### FLOW 1: Emergency (MedRoute in action)

```
STEP 1: Patient needs ambulance
        ↓
STEP 2: Ambulance driver opens mobile app
        → Enters: patient condition, requires ICU? ventilator? blood bank? trauma?
        ↓
STEP 3: MedRoute backend runs scoring algorithm
        → Fetches all hospitals from DB
        → Checks real-time availability (Redis cache)
        → Calls Google Maps API for travel time to each
        → Scores each hospital (0-100 points)
        ↓
STEP 4: Top 3 hospitals shown to driver on map
        → Optimal route drawn
        → ETA shown
        → Driver confirms destination
        ↓
STEP 5: Dashboard updates in real-time
        → Hospital gets notified: "Patient arriving in 12 min, needs ICU"
        → AyurSaarthi automatically creates a blank patient case at that hospital
        ↓
STEP 6: Patient arrives → Doctor opens AyurSaarthi
        → Continues patient's digital case record
```

### FLOW 2: OPD Consultation (AyurSaarthi in action)

```
STEP 1: Patient walks in to Ayurvedic clinic
        ↓
STEP 2: Receptionist registers patient (or doctor does it)
        ↓
STEP 3: Doctor starts consultation
        → Speaks into mic → Speech-to-Text converts to text
        → System fills case fields automatically
        ↓
STEP 4: Doctor completes Prakriti/Vikriti assessment
        (Vata/Pitta/Kapha dominance)
        ↓
STEP 5: AI (Gemini) detects missing fields
        → "You haven't entered dietary history"
        → Suggests based on Prakriti
        ↓
STEP 6: Doctor records diagnosis + treatment
        ↓
STEP 7: Gemini generates structured case summary
        → In English + Hindi
        → Includes risk factors, follow-up date suggestion
        ↓
STEP 8: Patient returns for follow-up
        → Doctor sees full longitudinal timeline
        → Previous symptoms, treatments, investigations
```

---

## 3-DAY SPRINT PLAN

### DAY 1 — Saturday, Aug 22 (Foundation)
**Goal: Backend + Database + Data running**

| Time | Task | Who |
|---|---|---|
| 9 AM | Clone repo, project setup, install dependencies | All |
| 10 AM | PostgreSQL schema + migrations (Alembic) | Backend Dev 1 |
| 10 AM | Hospital CSV import script | Backend Dev 2 |
| 11 AM | FastAPI: Hospital CRUD APIs | Backend Dev 1 |
| 11 AM | FastAPI: Emergency request API | Backend Dev 2 |
| 12 PM | Redis setup for real-time availability caching | Backend Dev 1 |
| 2 PM | Google Maps API key setup + route calculation | Backend Dev 2 |
| 2 PM | React project setup + Tailwind + routing | Frontend Dev 1 |
| 3 PM | Hospital Availability update portal (React) | Frontend Dev 1 |
| 3 PM | Gemini API setup + test case summary | AI Dev |
| 4 PM | JWT Auth: Login for doctor, hospital admin, ambulance | Backend Dev 1 |
| 5 PM | Seed database with 20 hospitals + 5 ambulances | Backend Dev 2 |
| 6 PM | Test all Day 1 APIs with Postman | All |
| **END OF DAY 1** | Working backend with hospital data, APIs, auth | ✅ |

---

### DAY 2 — Sunday, Aug 23 (Core Features)
**Goal: Main features working end-to-end**

| Time | Task | Who |
|---|---|---|
| 9 AM | MedRoute Scoring Engine (Python algorithm) | AI Dev |
| 9 AM | React: Map component with hospital markers | Frontend Dev 1 |
| 10 AM | Socket.IO: Ambulance real-time location | Backend Dev 1 |
| 10 AM | React: Emergency request form + hospital ranking list | Frontend Dev 2 |
| 11 AM | Google Maps: Draw route on map | Frontend Dev 1 |
| 11 AM | AyurSaarthi: Patient registration + case form | Frontend Dev 2 |
| 12 PM | Gemini: Speech-to-text integration | AI Dev |
| 2 PM | Gemini: Auto case summary generation | AI Dev |
| 2 PM | Gemini: Missing field detection | AI Dev |
| 3 PM | Prakriti/Vikriti assessment UI (radio buttons + dosha guide) | Frontend Dev 1 |
| 3 PM | Patient longitudinal timeline view | Frontend Dev 2 |
| 4 PM | Hospital admin: Real-time availability update UI | Frontend Dev 1 |
| 5 PM | Integrate: Emergency request → auto-create case in AyurSaarthi | Backend Dev 1 |
| 6 PM | End-to-end test: Full emergency flow | All |
| **END OF DAY 2** | Both modules working independently + connected | ✅ |

---

### DAY 3 — Monday, Aug 24 (Polish + Demo)
**Goal: Demo-ready, bug-free, presentation done**

| Time | Task | Who |
|---|---|---|
| 9 AM | Fix bugs from Day 2 testing | Dev Team |
| 10 AM | Hindi language support (i18next setup) | Frontend Dev 2 |
| 10 AM | Ambulance simulator: Auto-moves markers on map | AI Dev |
| 11 AM | Demo scenario preparation (scripted walkthrough) | PM / Lead |
| 12 PM | UI polish: Colors, fonts, responsive design | Frontend Dev 1 |
| 1 PM | Prepare presentation slides (10 slides) | PM |
| 2 PM | Load all real hospital CSV data | Backend Dev 2 |
| 3 PM | Video demo recording (backup) | PM |
| 4 PM | Final system test with full demo script | All |
| 5 PM | Buffer / Final fixes | All |
| **END OF DAY 3** | Everything working, demo scripted, slides ready | ✅ |

---

## TEAM ROLES

| Person | Primary Role | Modules |
|---|---|---|
| Dev 1 (Backend Lead) | FastAPI APIs, Database, Auth, Socket.IO | MedRoute backend, Auth |
| Dev 2 (Backend) | Scoring engine, CSV import, Google Maps API | MedRoute engine |
| Dev 3 (Frontend Lead) | React map dashboard, route display | MedRoute frontend |
| Dev 4 (Frontend) | Case form, hospital portal, timeline | AyurSaarthi frontend |
| Dev 5 (AI Lead) | Gemini integration, speech-to-text, scoring | AI services |
| Dev 6 (PM/Lead) | Architecture, demo script, slides, integration testing | All |

*(Adjust based on actual team size)*

---

## DEMO SCRIPT (Practice This)

**Scene 1: The Emergency**
> "A critical trauma patient is in Delhi. The nearest hospital — Apollo — has no ICU bed available."

- Show map with ambulance marker moving
- Show "Request Emergency Hospital" form
- Enter: ICU required ✓, Ventilator required ✓, Trauma facility ✓
- Click "Find Best Hospital"

**Scene 2: Smart Routing**
> "MedRoute evaluates 20 hospitals. Apollo scores 32/100 (no ICU). AIIMS scores 87/100."

- Show ranking list with scores
- Show route drawn on Google Maps to AIIMS
- Show ETA: "14 minutes"

**Scene 3: Hospital Gets Notified**
> "AIIMS hospital admin dashboard gets real-time alert: Patient incoming, needs ICU + ventilator."

- Show hospital portal with notification
- Admin marks ICU bed as reserved

**Scene 4: Case Created Automatically**
> "As ambulance confirms destination, AyurSaarthi creates a patient case at AIIMS."

- Switch to doctor view
- Show pre-filled emergency case with patient requirements

**Scene 5: AyurSaarthi in OPD**
> "Later, for an Ayurvedic consultation, doctor uses voice to fill the case."

- Show speech-to-text: Doctor speaks in Hindi → fields fill automatically
- Show Prakriti assessment form
- Show Gemini generating case summary in English + Hindi
- Show patient timeline with full history

---

## MODULE CONNECTION MAP

```
MedRoute creates Emergency Case
          ↓
AyurSaarthi receives case_id
          ↓
Doctor continues in AyurSaarthi
          ↓
Full longitudinal record stored
          ↓
Analytics dashboard shows patterns
```

---

## KEY METRICS TO SHOW IN DEMO

- Hospital score comparison: Nearest vs. Recommended
- Time saved vs. conventional routing
- Number of hospitals evaluated in real-time
- AI accuracy for symptom classification
- Fields auto-detected as missing by Gemini

---

## GITHUB REPO STRUCTURE

```
swasthsaarthi/
├── backend/
│   ├── main.py               (FastAPI app)
│   ├── models/               (SQLAlchemy models)
│   ├── routes/
│   │   ├── emergency.py      (MedRoute APIs)
│   │   ├── cases.py          (AyurSaarthi APIs)
│   │   ├── hospitals.py
│   │   └── auth.py
│   ├── services/
│   │   ├── gemini_service.py (All Gemini AI calls)
│   │   ├── maps_service.py   (Google Maps calls)
│   │   └── scoring.py        (Hospital ranking algorithm)
│   ├── data/
│   │   └── hospitals.csv     (Seed data)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     (MedRoute map dashboard)
│   │   │   ├── CaseForm.jsx      (AyurSaarthi case taking)
│   │   │   ├── HospitalPortal.jsx
│   │   │   └── PatientTimeline.jsx
│   │   ├── components/
│   │   │   ├── Map.jsx
│   │   │   ├── HospitalCard.jsx
│   │   │   ├── SpeechInput.jsx
│   │   │   └── PrakritiForm.jsx
│   │   └── services/
│   │       └── api.js
│   └── package.json
├── mobile/                   (React Native — ambulance app)
└── README.md
```

---

## QUICK COMMANDS TO GET STARTED

```bash
# Backend setup
cd backend
pip install fastapi uvicorn sqlalchemy psycopg2 redis google-generativeai python-jose
uvicorn main:app --reload

# Frontend setup
cd frontend
npm install
npm run dev

# Database
createdb swasthsaarthi
alembic upgrade head
python seed_data.py
```

---

*Read this fully before starting. Every team member must know the full flow.*
