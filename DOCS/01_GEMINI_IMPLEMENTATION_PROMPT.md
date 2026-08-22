# SwasthSaarthi — Gemini Implementation Prompt
## (Paste this entire document into Gemini AI Studio / Gemini Code Assist)

---

## PROJECT OVERVIEW FOR GEMINI

I am building **SwasthSaarthi** — an integrated AI-powered healthcare platform with two sub-modules:

1. **MedRoute**: Real-time emergency ambulance routing engine that finds the most suitable hospital (not just the nearest one) based on patient requirements, hospital resource availability, travel time, and emergency load.

2. **AyurSaarthi**: AI-assisted digital patient case-taking platform for Ayurveda/AYUSH practitioners, with speech-to-text, multilingual support, Prakriti/Vikriti assessment, and AI case summaries.

**Both modules share a common hospital database, user authentication, and patient record system.**

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend (Web) | React.js + Tailwind CSS |
| Frontend (Mobile) | React Native |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Real-time | Socket.IO + WebSockets |
| Cache | Redis |
| Maps | Google Maps JavaScript API + Directions API |
| AI Engine | **Google Gemini API** (gemini-1.5-flash) |
| Speech-to-Text | Google Cloud Speech-to-Text OR Gemini audio input |
| Storage | Firebase Storage / Cloudinary |
| Auth | JWT + Role-Based Access Control (RBAC) |

---

## DATABASE SCHEMA

Please generate SQL schema for PostgreSQL with the following tables:

### hospitals
```sql
- id (UUID, PK)
- name (VARCHAR)
- address (TEXT)
- city (VARCHAR)
- district (VARCHAR)
- state (VARCHAR)
- latitude (FLOAT)
- longitude (FLOAT)
- category (ENUM: government, private, trust)
- phone (VARCHAR)
- email (VARCHAR)
- specializations (TEXT[])  -- array of specialties
- created_at (TIMESTAMP)
```

### hospital_availability (dynamic, updates every 15 min)
```sql
- id (UUID, PK)
- hospital_id (UUID, FK -> hospitals)
- icu_beds_available (INT)
- emergency_beds_available (INT)
- ventilators_available (INT)
- trauma_facility (BOOLEAN)
- blood_bank_available (BOOLEAN)
- emergency_load (ENUM: low, medium, high, critical)
- specialists_available (TEXT[])
- operational_status (BOOLEAN)
- last_updated (TIMESTAMP)
```

### ambulances
```sql
- id (UUID, PK)
- vehicle_number (VARCHAR)
- driver_name (VARCHAR)
- driver_phone (VARCHAR)
- status (ENUM: available, on_call, returning, maintenance)
- current_latitude (FLOAT)
- current_longitude (FLOAT)
- last_updated (TIMESTAMP)
```

### emergency_requests
```sql
- id (UUID, PK)
- ambulance_id (UUID, FK)
- patient_name (VARCHAR)
- patient_age (INT)
- emergency_type (VARCHAR)
- severity (ENUM: critical, severe, moderate, mild)
- requires_icu (BOOLEAN)
- requires_ventilator (BOOLEAN)
- requires_trauma (BOOLEAN)
- requires_blood_bank (BOOLEAN)
- required_specialist (VARCHAR)
- pickup_latitude (FLOAT)
- pickup_longitude (FLOAT)
- assigned_hospital_id (UUID, FK)
- status (ENUM: pending, en_route, arrived, completed)
- created_at (TIMESTAMP)
```

### patients
```sql
- id (UUID, PK)
- name (VARCHAR)
- age (INT)
- gender (ENUM: male, female, other)
- phone (VARCHAR)
- address (TEXT)
- blood_group (VARCHAR)
- created_at (TIMESTAMP)
```

### patient_cases (AyurSaarthi clinical records)
```sql
- id (UUID, PK)
- patient_id (UUID, FK)
- doctor_id (UUID, FK)
- hospital_id (UUID, FK)
- chief_complaints (TEXT)
- present_illness (TEXT)
- past_history (TEXT)
- family_history (TEXT)
- personal_history (TEXT)
- dietary_habits (TEXT)
- prakriti (VARCHAR)           -- Vata/Pitta/Kapha or combinations
- vikriti (VARCHAR)
- agni (VARCHAR)
- koshtha (VARCHAR)
- vital_signs (JSONB)
- clinical_findings (TEXT)
- investigation_reports (TEXT[])
- diagnosis (TEXT)
- treatment_plan (TEXT)
- medicines (JSONB)
- follow_up_date (DATE)
- ai_case_summary (TEXT)       -- Gemini generated
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### users (doctors, hospital staff, ambulance drivers)
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (ENUM: doctor, hospital_admin, ambulance_driver, super_admin)
- hospital_id (UUID, FK, nullable)
- language_preference (VARCHAR DEFAULT 'en')
- created_at (TIMESTAMP)
```

---

## FASTAPI BACKEND — ENDPOINTS TO GENERATE

### Module 1: MedRoute (Emergency Routing)

**POST /api/emergency/request**
- Input: ambulance_id, patient details, emergency requirements (icu, ventilator, trauma, blood_bank, specialist)
- Logic:
  1. Get ambulance current GPS location
  2. Fetch all hospitals with matching capabilities from hospital_availability
  3. For each candidate hospital, call Google Maps Directions API to get travel time
  4. Run scoring algorithm (see below)
  5. Return ranked list of top 3 hospitals with scores, ETA, route

**Scoring Algorithm:**
```python
def score_hospital(hospital, availability, travel_time_minutes, patient_requirements):
    score = 0
    
    # Facility matching (40 points)
    if patient_requirements.requires_icu and availability.icu_beds_available > 0:
        score += 20
    if patient_requirements.requires_ventilator and availability.ventilators_available > 0:
        score += 10
    if patient_requirements.requires_trauma and availability.trauma_facility:
        score += 10
    
    # Resource availability (30 points)
    score += min(availability.icu_beds_available * 2, 10)
    score += min(availability.emergency_beds_available, 10)
    if availability.blood_bank_available:
        score += 5
    if patient_requirements.required_specialist in availability.specialists_available:
        score += 5
    
    # Emergency load (20 points — inverse)
    load_scores = {'low': 20, 'medium': 15, 'high': 5, 'critical': 0}
    score += load_scores.get(availability.emergency_load, 0)
    
    # Travel time penalty (10 points)
    if travel_time_minutes <= 10:
        score += 10
    elif travel_time_minutes <= 20:
        score += 7
    elif travel_time_minutes <= 30:
        score += 4
    else:
        score += 1
    
    return score
```

**GET /api/emergency/hospitals/nearby**
- Input: latitude, longitude, radius_km
- Returns list of hospitals with current availability

**PATCH /api/ambulance/{id}/location**
- Real-time location update from ambulance app
- Updates Redis cache for fast retrieval

**GET /api/emergency/{request_id}/status**
- Returns current status, assigned hospital, ETA

---

### Module 2: AyurSaarthi (Clinical Case Taking)

**POST /api/patients**
- Create new patient profile

**POST /api/cases**
- Create new patient case/consultation
- After creation, trigger Gemini API to generate case summary

**PUT /api/cases/{id}**
- Update case (add clinical findings, diagnosis, treatment)

**GET /api/cases/patient/{patient_id}**
- Full longitudinal history for a patient

**POST /api/cases/{id}/speech-to-text**
- Accept audio file
- Send to Google Speech-to-Text / Gemini audio
- Return structured text parsed into case fields

**POST /api/cases/{id}/ai-summary**
- Call Gemini API with full case data
- Return structured summary

**GET /api/cases/similar**
- Input: symptoms, prakriti
- Use vector similarity to find similar previous cases
- Return top 5 matches

---

### Module 3: Hospital Portal

**POST /api/hospital/availability/update**
- Hospital staff updates ICU, beds, ventilator, specialist availability
- Requires hospital_admin role JWT
- Updates both PostgreSQL and Redis cache

**GET /api/hospital/{id}/dashboard**
- Full dashboard data: incoming emergencies, current load, resources

---

## GEMINI API INTEGRATION CODE

Generate this FastAPI service using Google Gemini API:

```python
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")

async def generate_case_summary(case_data: dict) -> str:
    prompt = f"""
    You are an experienced Ayurvedic clinical assistant. 
    Analyze the following patient case and generate a structured clinical summary in both English and Hindi.
    
    Patient Details:
    - Name: {case_data['patient_name']}, Age: {case_data['age']}
    - Chief Complaints: {case_data['chief_complaints']}
    - Present Illness: {case_data['present_illness']}
    - Prakriti: {case_data['prakriti']}
    - Vikriti: {case_data['vikriti']}
    - Agni: {case_data['agni']}
    - Vital Signs: {case_data['vital_signs']}
    - Clinical Findings: {case_data['clinical_findings']}
    - Diagnosis: {case_data['diagnosis']}
    - Treatment: {case_data['treatment_plan']}
    
    Generate:
    1. A 3-sentence clinical summary
    2. Key risk factors identified
    3. Missing fields that should be completed (if any)
    4. Suggested follow-up timeline
    
    Format as JSON with keys: summary_en, summary_hi, risk_factors, missing_fields, followup_suggestion
    """
    response = model.generate_content(prompt)
    return response.text

async def classify_symptoms(symptoms_text: str) -> dict:
    prompt = f"""
    You are an Ayurvedic symptom classifier.
    Classify the following symptoms and suggest likely Dosha imbalance.
    Symptoms: {symptoms_text}
    
    Return JSON with keys: 
    - dosha_imbalance (Vata/Pitta/Kapha/combination)
    - severity (mild/moderate/severe)
    - recommended_specialist
    - urgency (routine/urgent/emergency)
    """
    response = model.generate_content(prompt)
    return response.text

async def detect_missing_fields(case_data: dict) -> list:
    prompt = f"""
    Review this Ayurvedic patient case and list critically missing information.
    Case data: {case_data}
    
    Return a JSON array of missing field names that a practitioner should fill.
    """
    response = model.generate_content(prompt)
    return response.text
```

---

## REACT FRONTEND — COMPONENTS TO GENERATE

### MedRoute Dashboard (React + Leaflet/Google Maps)

Generate a React component with:
1. **Live Map**: Show ambulances (red markers), hospitals (blue/green markers based on availability)
2. **Emergency Request Form**: Dropdown for emergency type, checkboxes for ICU/ventilator/trauma/blood bank
3. **Hospital Rankings Panel**: Ranked list with score bar, ETA, available resources
4. **Route Display**: Draw the optimal route on map when hospital is selected
5. **Real-time Updates**: Socket.IO connection for ambulance location updates

### AyurSaarthi Case Form (React)

Generate a multi-step form with:
- Step 1: Patient registration (name, age, gender, contact)
- Step 2: Chief complaints + present illness (with speech-to-text mic button)
- Step 3: Prakriti/Vikriti assessment (radio buttons for Vata/Pitta/Kapha combinations)
- Step 4: Clinical examination (vital signs, findings)
- Step 5: Diagnosis + Treatment
- Step 6: AI Summary display (Gemini generated)

Language toggle: English / Hindi (use i18next)

### Hospital Availability Portal

Generate a React dashboard for hospital admins:
- Number inputs for ICU beds, emergency beds, ventilators
- Toggles for trauma facility, blood bank, operational status
- Dropdown for emergency load (low/medium/high/critical)
- Multi-select for available specialists
- "Update Availability" button that calls PATCH /api/hospital/availability/update

---

## GOOGLE MAPS INTEGRATION

```javascript
// In React component
const calculateRoute = async (origin, destinationHospital) => {
  const directionsService = new window.google.maps.DirectionsService();
  const result = await directionsService.route({
    origin: { lat: origin.lat, lng: origin.lng },
    destination: { lat: destinationHospital.latitude, lng: destinationHospital.longitude },
    travelMode: window.google.maps.TravelMode.DRIVING,
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: 'bestguess'
    }
  });
  return {
    route: result.routes[0],
    duration: result.routes[0].legs[0].duration.text,
    distance: result.routes[0].legs[0].distance.text
  };
};
```

---

## SOCKET.IO REAL-TIME SETUP

```python
# FastAPI + Socket.IO backend
from fastapi_socketio import SocketManager

sio = SocketManager(app=app)

@sio.on("ambulance_location_update")
async def handle_location(sid, data):
    # Update Redis
    await redis.setex(
        f"ambulance:{data['ambulance_id']}",
        60,  # expires in 60 seconds
        json.dumps({"lat": data["lat"], "lng": data["lng"], "status": data["status"]})
    )
    # Broadcast to dashboard
    await sio.emit("ambulance_moved", data, room="dashboard")

@sio.on("hospital_update")
async def handle_hospital_update(sid, data):
    await sio.emit("hospital_availability_changed", data, room="dashboard")
```

---

## ENVIRONMENT VARIABLES NEEDED

```env
DATABASE_URL=postgresql://user:pass@localhost/swasthsaarthi
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_maps_api_key_here
JWT_SECRET=your_jwt_secret
GOOGLE_SPEECH_API_KEY=your_speech_api_key
```

---

## SAMPLE DATA SEEDING SCRIPT

Generate a Python script to seed the database with:
- 20 hospitals across Delhi NCR (use realistic coordinates)
- Each hospital with random but realistic availability data
- 5 ambulances with simulated positions
- 3 demo users (1 doctor, 1 hospital_admin, 1 ambulance_driver)
- 2 sample patient cases with full Ayurvedic data

---

## WHAT TO BUILD FIRST (Priority Order)

1. Database schema + migrations (Alembic)
2. Hospital seeding script with CSV data
3. FastAPI endpoints: hospital availability, emergency request
4. Gemini API: case summary + symptom classification
5. React: MedRoute map dashboard
6. React: AyurSaarthi case form
7. Socket.IO: real-time ambulance tracking
8. Hospital portal: availability update UI
9. Google Maps: route drawing
10. Auth: JWT login for doctor / hospital admin / ambulance driver

---
*This document is the complete specification for SwasthSaarthi. Generate code module by module as requested.*
