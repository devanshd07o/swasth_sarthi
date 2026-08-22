import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.scoring_service import score_hospital

router = APIRouter(prefix="/api/emergency", tags=["MedRoute Emergency Routing"])

class EmergencyRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    patient_condition: str
    requires_icu: bool = False
    requires_ventilator: bool = False
    requires_trauma: bool = False
    requires_blood_bank: bool = False
    required_specialist: Optional[str] = None

# Realistic Sample Hospitals Data for Delhi NCR
SAMPLE_HOSPITALS = [
    {
        "id": "h1",
        "name": "AIIMS Delhi",
        "lat": 28.5672, "lng": 77.2100,
        "category": "government",
        "phone": "011-26588500",
        "availability": {"icu_beds_available": 12, "emergency_beds_available": 25, "ventilators_available": 6, "trauma_facility": True, "blood_bank_available": True, "emergency_load": "medium", "specialists_available": ["cardiologist", "neurologist", "trauma_surgeon"]}
    },
    {
        "id": "h2",
        "name": "Safdarjung Hospital",
        "lat": 28.5685, "lng": 77.1986,
        "category": "government",
        "phone": "011-26165060",
        "availability": {"icu_beds_available": 2, "emergency_beds_available": 8, "ventilators_available": 1, "trauma_facility": True, "blood_bank_available": True, "emergency_load": "high", "specialists_available": ["trauma_surgeon", "orthopedic"]}
    },
    {
        "id": "h3",
        "name": "Max Super Speciality Hospital Saket",
        "lat": 28.5244, "lng": 77.2167,
        "category": "private",
        "phone": "011-26515050",
        "availability": {"icu_beds_available": 8, "emergency_beds_available": 15, "ventilators_available": 4, "trauma_facility": True, "blood_bank_available": True, "emergency_load": "low", "specialists_available": ["cardiologist", "neurologist", "pulmonologist"]}
    },
    {
        "id": "h4",
        "name": "Indraprastha Apollo Hospital",
        "lat": 28.5486, "lng": 77.2930,
        "category": "private",
        "phone": "011-71791090",
        "availability": {"icu_beds_available": 0, "emergency_beds_available": 4, "ventilators_available": 0, "trauma_facility": True, "blood_bank_available": True, "emergency_load": "critical", "specialists_available": ["cardiologist"]}
    },
    {
        "id": "h5",
        "name": "Fortis Memorial Research Institute Gurugram",
        "lat": 28.4753, "lng": 77.0847,
        "category": "private",
        "phone": "0124-4921021",
        "availability": {"icu_beds_available": 10, "emergency_beds_available": 20, "ventilators_available": 5, "trauma_facility": True, "blood_bank_available": True, "emergency_load": "low", "specialists_available": ["cardiologist", "neurologist", "orthopedic"]}
    }
]

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.post("/find-best-hospitals")
def find_best_hospitals(req: EmergencyRequest):
    scored = []
    
    for h in SAMPLE_HOSPITALS:
        dist_km = calculate_haversine_distance(req.pickup_lat, req.pickup_lng, h["lat"], h["lng"])
        travel_time_min = (dist_km / 35.0) * 60.0 + 3.0 # Approx 35 km/h urban speed + 3 min delay
        
        score_res = score_hospital(h, h["availability"], travel_time_min, req.model_dump())
        score_res["lat"] = h["lat"]
        score_res["lng"] = h["lng"]
        score_res["phone"] = h["phone"]
        score_res["category"] = h["category"]
        scored.append(score_res)
        
    scored.sort(key=lambda x: x["total_score"], reverse=True)
    return {
        "pickup_location": {"lat": req.pickup_lat, "lng": req.pickup_lng},
        "total_evaluated": len(scored),
        "recommended_hospitals": scored
    }
