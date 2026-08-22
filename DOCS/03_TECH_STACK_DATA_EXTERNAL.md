# SwasthSaarthi — Tech Stack, External APIs & Data Guide
## (Setup instructions for Maps, Gemini, CSV Data, Hospital Portal)

---

## PART 1: GOOGLE MAPS IMPLEMENTATION

### Step 1: Get Your API Key
1. Go to: https://console.cloud.google.com/
2. Create new project → "SwasthSaarthi"
3. Enable these APIs:
   - **Maps JavaScript API** (for displaying maps in React)
   - **Directions API** (for routing ambulance to hospital)
   - **Places API** (optional, for hospital search by name)
   - **Geocoding API** (optional, for address to coordinates)
4. Create API Key → Restrict to your domain (localhost during development)

### Step 2: React Frontend Map Setup

```bash
npm install @react-google-maps/api
```

```jsx
// src/components/Map.jsx
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

const LIBRARIES = ['places'];
const MAP_CENTER = { lat: 28.6139, lng: 77.2090 }; // Delhi, India

export function EmergencyMap({ ambulances, hospitals, selectedRoute }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      zoom={12}
      center={MAP_CENTER}
      mapContainerStyle={{ width: '100%', height: '600px' }}
      options={{
        styles: mapDarkStyle, // Dark theme for dashboard look
        disableDefaultUI: false,
      }}
    >
      {/* Ambulance markers — Red */}
      {ambulances.map(amb => (
        <Marker
          key={amb.id}
          position={{ lat: amb.latitude, lng: amb.longitude }}
          icon={{
            url: '/icons/ambulance.png',
            scaledSize: new window.google.maps.Size(40, 40),
          }}
          title={`Ambulance: ${amb.vehicle_number}`}
        />
      ))}

      {/* Hospital markers — Green/Red based on availability */}
      {hospitals.map(h => (
        <Marker
          key={h.id}
          position={{ lat: h.latitude, lng: h.longitude }}
          icon={{
            url: h.availability.icu_beds_available > 0 ? '/icons/hospital-green.png' : '/icons/hospital-red.png',
            scaledSize: new window.google.maps.Size(35, 35),
          }}
          title={`${h.name} | ICU: ${h.availability.icu_beds_available}`}
        />
      ))}

      {/* Route from ambulance to selected hospital */}
      {selectedRoute && (
        <DirectionsRenderer
          directions={selectedRoute}
          options={{
            polylineOptions: {
              strokeColor: '#FF6B35',
              strokeWeight: 5,
              strokeOpacity: 0.9,
            },
          }}
        />
      )}
    </GoogleMap>
  );
}
```

### Step 3: Get Route (Travel Time + Distance)

```jsx
// In your emergency request component
const getRoute = async (ambulanceLat, ambulanceLng, hospitalLat, hospitalLng) => {
  const directionsService = new window.google.maps.DirectionsService();
  
  try {
    const result = await directionsService.route({
      origin: { lat: ambulanceLat, lng: ambulanceLng },
      destination: { lat: hospitalLat, lng: hospitalLng },
      travelMode: window.google.maps.TravelMode.DRIVING,
      drivingOptions: {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS
      }
    });

    const leg = result.routes[0].legs[0];
    return {
      directions: result,
      duration: leg.duration_in_traffic?.text || leg.duration.text,  // With traffic!
      duration_seconds: leg.duration_in_traffic?.value || leg.duration.value,
      distance: leg.distance.text,
    };
  } catch (error) {
    console.error('Directions error:', error);
  }
};
```

---

## PART 2: GEMINI API SETUP

### Get Gemini API Key
1. Go to: https://aistudio.google.com/
2. Click "Get API Key" → Create API Key
3. Copy the key → add to `.env` file:

```env
GEMINI_API_KEY=AIza...your_key_here
REACT_APP_GOOGLE_MAPS_KEY=AIza...your_maps_key
```

### Python Backend Setup

```bash
pip install google-generativeai
```

```python
# backend/services/gemini_service.py
import google.generativeai as genai
import json
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# USE CASE 1: Generate clinical case summary (AyurSaarthi)
async def generate_case_summary(case: dict) -> dict:
    prompt = f"""
You are a certified Ayurvedic clinical assistant AI.
Generate a structured summary for this patient case.

Patient: {case.get('patient_name')}, Age {case.get('age')}, {case.get('gender')}
Chief Complaints: {case.get('chief_complaints')}
Prakriti: {case.get('prakriti')} | Vikriti: {case.get('vikriti')}
Agni: {case.get('agni')} | Koshtha: {case.get('koshtha')}
Clinical Findings: {case.get('clinical_findings')}
Diagnosis: {case.get('diagnosis')}
Treatment: {case.get('treatment_plan')}

Respond ONLY in valid JSON (no markdown, no explanation):
{{
  "summary_en": "3-sentence clinical summary in English",
  "summary_hi": "Same summary in Hindi",
  "risk_factors": ["list", "of", "risks"],
  "missing_fields": ["any important missing information"],
  "followup_recommendation": "specific follow-up timeline and what to monitor"
}}
"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    # Clean any accidental markdown
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


# USE CASE 2: Classify emergency symptoms (MedRoute)
async def classify_emergency(symptoms: str, patient_age: int) -> dict:
    prompt = f"""
You are an emergency triage AI assistant.
Patient age: {patient_age}
Reported condition: {symptoms}

Classify this emergency and respond ONLY in valid JSON:
{{
  "severity": "critical|severe|moderate|mild",
  "emergency_type": "cardiac|trauma|neurological|respiratory|obstetric|other",
  "requires_icu": true|false,
  "requires_ventilator": true|false,
  "requires_trauma_care": true|false,
  "requires_blood_bank": true|false,
  "recommended_specialist": "cardiologist|neurologist|orthopedic|general|etc",
  "confidence": 0.0 to 1.0
}}
"""
    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json","").replace("```","").strip()
    return json.loads(text)


# USE CASE 3: Detect missing fields (AyurSaarthi)
async def detect_missing_fields(case_data: dict) -> list:
    filled_fields = [k for k, v in case_data.items() if v]
    empty_fields = [k for k, v in case_data.items() if not v]
    
    prompt = f"""
In an Ayurvedic patient case, these fields are filled: {filled_fields}
These fields are empty: {empty_fields}

Which empty fields are CLINICALLY IMPORTANT and should be filled?
Respond ONLY as a JSON array of field names: ["field1", "field2"]
"""
    response = model.generate_content(prompt)
    text = response.text.strip().replace("```json","").replace("```","").strip()
    return json.loads(text)
```

### React Frontend: Speech-to-Text with Gemini

```jsx
// src/components/SpeechInput.jsx
// Using Web Speech API (built into Chrome — free, no API key needed for basic)
import { useState } from 'react';

export function SpeechInput({ onTranscript, language = 'hi-IN' }) {
  const [isListening, setIsListening] = useState(false);
  
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language; // 'hi-IN' for Hindi, 'en-IN' for English
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      onTranscript(transcript);
    };
    
    recognition.start();
    setIsListening(true);
    return recognition;
  };

  return (
    <button
      onClick={startListening}
      className={`mic-btn ${isListening ? 'pulse-red' : ''}`}
    >
      🎤 {isListening ? 'Listening...' : 'Speak (Hindi/English)'}
    </button>
  );
}
```

---

## PART 3: CSV HOSPITAL DATA — REAL DATASETS

### Option A: data.gov.in (Government of India — FREE)
**URL**: https://data.gov.in/catalog/directory-hospitals

Download: "Directory of Government Hospitals" CSV
- Contains: Hospital name, address, district, state, beds, specialities
- Coverage: Pan-India, ~5000+ hospitals

**Problem**: No GPS coordinates → Use Geocoding API to add them
**Solution**: Run this script to add coordinates from address:

```python
# scripts/geocode_hospitals.py
import pandas as pd
import requests
import time

df = pd.read_csv('hospitals_raw.csv')
MAPS_KEY = "your_google_maps_api_key"

def geocode(address, city, state):
    query = f"{address}, {city}, {state}, India"
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={query}&key={MAPS_KEY}"
    r = requests.get(url).json()
    if r['results']:
        loc = r['results'][0]['geometry']['location']
        return loc['lat'], loc['lng']
    return None, None

df['latitude'] = None
df['longitude'] = None
for i, row in df.iterrows():
    lat, lng = geocode(row['address'], row['city'], row['state'])
    df.at[i, 'latitude'] = lat
    df.at[i, 'longitude'] = lng
    time.sleep(0.1)  # Respect API rate limits

df.to_csv('hospitals_with_coords.csv', index=False)
```

---

### Option B: Kaggle Dataset (Quickest for Hackathon)
**URL**: https://www.kaggle.com/datasets/vikasgautam18/indian-hospitals

Contains: Hospital name, city, type, beds, specialities
Already has some coordinate data.

---

### Option C: Custom Synthetic Dataset (Recommended for Demo — FASTEST)

Use this ready-to-use CSV for Delhi NCR (20 hospitals, realistic data):

```csv
id,name,address,city,latitude,longitude,category,specializations,phone
1,AIIMS Delhi,Ansari Nagar East,Delhi,28.5672,77.2100,government,"trauma,cardiac,neuro,ortho",011-26588500
2,Safdarjung Hospital,Ring Road,Delhi,28.5685,77.1986,government,"trauma,cardiac,emergency",011-26165060
3,Max Super Speciality Hospital,Saket,Delhi,28.5244,77.2167,private,"cardiac,neuro,trauma",011-26515050
4,Apollo Hospital,Sarita Vihar,Delhi,28.5486,77.2930,private,"cardiac,ortho,emergency",011-71791090
5,Ram Manohar Lohia Hospital,Baba Kharak Singh Marg,Delhi,28.6339,77.2090,government,"emergency,trauma",011-23365525
6,Sir Ganga Ram Hospital,Rajinder Nagar,Delhi,28.6432,77.1897,private,"cardiac,neuro,ortho",011-25750000
7,Fortis Memorial Research,Gurugram,Gurugram,28.4753,77.0847,private,"cardiac,neuro,trauma",0124-4921021
8,Medanta The Medicity,Sector 38,Gurugram,28.4366,77.0463,private,"cardiac,neuro,emergency",0124-4141414
9,BLK Super Speciality,Pusa Road,Delhi,28.6455,77.1666,private,"cardiac,renal,emergency",011-30403040
10,Moolchand Hospital,Lala Lajpat Rai Marg,Delhi,28.5700,77.2300,private,"ortho,emergency,trauma",011-42000000
11,Hindu Rao Hospital,Malkaganj,Delhi,28.6783,77.2137,government,"emergency,trauma,general"],011-23936801
12,GTB Hospital,Dilshad Garden,Delhi,28.6794,77.3121,government,"trauma,emergency,burns"],011-22584343
13,Lok Nayak Hospital,Jawaharlal Nehru Marg,Delhi,28.6406,77.2406,government,"emergency,trauma,cardiac"],011-23232400
14,ESIC Model Hospital,Basaidarapur,Delhi,28.6312,77.1375,government,"emergency,ortho,general"],011-25195678
15,Indraprastha Apollo,Jasola Vihar,Delhi,28.5486,77.2930,private,"cardiac,neuro,trauma"],011-71791090
16,Rockland Hospital,Dwarka,Delhi,28.5872,77.0595,private,"cardiac,emergency,general"],011-47474747
17,Metro Hospital,Noida,Noida,28.5700,77.3200,private,"cardiac,ortho,emergency"],0120-4545555
18,Kailash Hospital,Noida Sector 71,Noida,28.5953,77.3680,private,"emergency,general,ortho"],0120-2400100
19,Yashoda Hospital,Ghaziabad,Ghaziabad,28.6692,77.4538,private,"emergency,cardiac,neuro"],0120-6759000
20,Columbia Asia,Palam Vihar Gurugram,Gurugram,28.5013,77.0220,private,"cardiac,emergency,ortho"],0124-4614700
```

**Simulated Availability Data** (randomize these in seed script):

```python
# scripts/seed_data.py
import random
import psycopg2
from datetime import datetime

SPECIALISTS = ['cardiologist', 'neurologist', 'orthopedic', 'trauma_surgeon', 
               'anesthesiologist', 'pulmonologist', 'nephrologist']
LOAD_LEVELS = ['low', 'medium', 'high', 'critical']

def seed_availability(hospital_id):
    return {
        'hospital_id': hospital_id,
        'icu_beds_available': random.randint(0, 15),
        'emergency_beds_available': random.randint(2, 30),
        'ventilators_available': random.randint(0, 10),
        'trauma_facility': random.choice([True, True, False]),  # 67% have it
        'blood_bank_available': random.choice([True, True, True, False]),  # 75%
        'emergency_load': random.choice(LOAD_LEVELS),
        'specialists_available': random.sample(SPECIALISTS, random.randint(2, 5)),
        'operational_status': True,
        'last_updated': datetime.now()
    }
```

---

## PART 4: HOSPITAL PORTAL — HOW HOSPITALS CONNECT

### Problem
You cannot get live ICU availability from real hospitals during hackathon.

### Solution: Three-Tier Approach

**Tier 1: Hospital Self-Update Portal (Build This)**
- Hospital admin logs in → updates ICU, beds, ventilators manually
- Like how a hotel updates room availability on Booking.com

**Tier 2: Simulated Auto-Updates (For Demo)**
- A background Python script randomly updates hospital availability every 30 seconds
- Shows "live" data changing on dashboard

```python
# scripts/simulate_live_data.py
import asyncio
import random
import asyncpg

async def simulate_updates():
    conn = await asyncpg.connect('postgresql://localhost/swasthsaarthi')
    
    while True:
        # Pick random hospital
        hospital_id = random.randint(1, 20)
        
        # Simulate: ICU patient admitted (beds decrease)
        await conn.execute("""
            UPDATE hospital_availability
            SET icu_beds_available = GREATEST(0, icu_beds_available + $1),
                emergency_load = $2,
                last_updated = NOW()
            WHERE hospital_id = $3
        """, random.randint(-2, 1), 
            random.choice(['low', 'medium', 'high']),
            hospital_id)
        
        print(f"Updated hospital {hospital_id}")
        await asyncio.sleep(15)  # Update every 15 seconds

asyncio.run(simulate_updates())
```

**Tier 3: Hospital API Integration (Future Scope)**
- Real hospitals provide APIs via their HIS (Hospital Information Systems)
- Example: Narayana Health has such APIs
- Mention this in presentation as "production roadmap"

### Hospital Portal UI (React)

```jsx
// src/pages/HospitalPortal.jsx
export function HospitalPortal() {
  const [form, setForm] = useState({
    icu_beds_available: 0,
    emergency_beds_available: 0,
    ventilators_available: 0,
    trauma_facility: false,
    blood_bank_available: false,
    emergency_load: 'low',
    specialists_available: []
  });

  const handleSubmit = async () => {
    await fetch('/api/hospital/availability/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    alert('Hospital availability updated!');
  };

  return (
    <div className="portal">
      <h2>Update Hospital Availability</h2>
      
      <label>ICU Beds Available: </label>
      <input type="number" value={form.icu_beds_available} 
        onChange={e => setForm({...form, icu_beds_available: +e.target.value})} />
      
      <label>Emergency Beds Available: </label>
      <input type="number" value={form.emergency_beds_available}
        onChange={e => setForm({...form, emergency_beds_available: +e.target.value})} />

      <label>Ventilators Available: </label>
      <input type="number" value={form.ventilators_available}
        onChange={e => setForm({...form, ventilators_available: +e.target.value})} />
      
      <label>Emergency Load: </label>
      <select value={form.emergency_load}
        onChange={e => setForm({...form, emergency_load: e.target.value})}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      
      <label><input type="checkbox" checked={form.trauma_facility}
        onChange={e => setForm({...form, trauma_facility: e.target.checked})} />
        Trauma Facility Active</label>
      
      <label><input type="checkbox" checked={form.blood_bank_available}
        onChange={e => setForm({...form, blood_bank_available: e.target.checked})} />
        Blood Bank Available</label>
      
      <button onClick={handleSubmit}>Update Now</button>
    </div>
  );
}
```

---

## PART 5: FULL TECH STACK SUMMARY

| Component | Technology | Cost | Notes |
|---|---|---|---|
| Backend | FastAPI (Python) | Free | Async, fast, great for AI |
| Database | PostgreSQL | Free | Reliable, JSONB support |
| Real-time | Socket.IO | Free | Ambulance live tracking |
| Cache | Redis | Free | Fast availability reads |
| Map Display | Google Maps JS API | Free tier: $200/month credit | More than enough for demo |
| Route Calculation | Google Directions API | Included in above | Real traffic data |
| AI - Case Summary | Gemini 1.5 Flash | Free tier: 15 RPM | Generous free limit |
| AI - Symptoms | Gemini 1.5 Flash | Same | |
| Speech-to-Text | Web Speech API (Chrome) | Free | No API key needed |
| Frontend | React.js + Tailwind | Free | |
| Hospital Data | data.gov.in OR custom CSV | Free | |
| Hosting (demo) | Localhost / ngrok | Free | ngrok for public demo URL |

**Total API Cost for Hackathon Demo: ₹0** (all within free tiers)

---

## PART 6: AMBULANCE SIMULATOR (For Live Demo)

Since you don't have real ambulances, simulate movement:

```javascript
// In React dashboard — simulates ambulance moving toward hospital
const simulateAmbulance = (startLat, startLng, endLat, endLng, steps = 20) => {
  const latStep = (endLat - startLat) / steps;
  const lngStep = (endLng - startLng) / steps;
  let step = 0;
  
  const interval = setInterval(() => {
    if (step >= steps) {
      clearInterval(interval);
      return;
    }
    const newLat = startLat + (latStep * step);
    const newLng = startLng + (lngStep * step);
    
    // Update ambulance position on map
    socket.emit('ambulance_location_update', {
      ambulance_id: 'AMB-001',
      lat: newLat,
      lng: newLng,
      status: 'on_call'
    });
    step++;
  }, 1000); // Move every 1 second
};
```

---

## PART 7: NGROK — Share Demo with Judges Remotely

```bash
# Install ngrok
npm install -g ngrok

# Expose your local backend
ngrok http 8000

# Expose your frontend  
ngrok http 3000

# You get URLs like: https://abc123.ngrok.io
# Share with judges — they can test on their phones too!
```

---

## PART 8: PRESENTATION SLIDE OUTLINE (10 Slides)

1. **Title Slide**: SwasthSaarthi — From Emergency Call to Continuity of Care
2. **Problem**: Two unsolved problems in Indian healthcare
3. **Solution**: One integrated platform (MedRoute + AyurSaarthi under SwasthSaarthi)
4. **How MedRoute Works**: Scoring algorithm diagram
5. **How AyurSaarthi Works**: Patient journey with Gemini AI
6. **System Architecture**: Full tech diagram
7. **Live Demo Screenshots**: Map, hospital ranking, case form
8. **Data & AI**: Hospital CSV data + Gemini prompts + scoring weights
9. **Social Impact**: How many lives can this save, AYUSH digitization
10. **Roadmap**: Real hospital HIS integration, national ambulance network, ML-based ETA

---

*All external services use free tiers. Setup time: ~2 hours for all API keys and database.*
