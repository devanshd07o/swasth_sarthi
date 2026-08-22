def score_hospital(hospital: dict, availability: dict, travel_time_minutes: float, patient_req: dict) -> dict:
    """
    Calculates MedRoute 100-Point Dynamic Hospital Match Score.
    """
    score = 0
    breakdown = {}

    # 1. Mandatory Facility Matching (40 points max)
    facility_score = 0
    if patient_req.get("requires_icu") and availability.get("icu_beds_available", 0) > 0:
        facility_score += 15
    elif not patient_req.get("requires_icu"):
        facility_score += 15

    if patient_req.get("requires_ventilator") and availability.get("ventilators_available", 0) > 0:
        facility_score += 15
    elif not patient_req.get("requires_ventilator"):
        facility_score += 15

    if patient_req.get("requires_trauma") and availability.get("trauma_facility"):
        facility_score += 10
    elif not patient_req.get("requires_trauma"):
        facility_score += 10

    score += facility_score
    breakdown["facility_match_score"] = facility_score

    # 2. Dynamic Resource Availability (30 points max)
    resource_score = 0
    icu_count = availability.get("icu_beds_available", 0)
    emerg_count = availability.get("emergency_beds_available", 0)
    
    resource_score += min(icu_count * 2, 10)
    resource_score += min(emerg_count, 10)
    
    if availability.get("blood_bank_available"):
        resource_score += 5
        
    req_spec = patient_req.get("required_specialist")
    specs_available = availability.get("specialists_available", [])
    if req_spec and req_spec in specs_available:
        resource_score += 5

    score += resource_score
    breakdown["resource_availability_score"] = resource_score

    # 3. Emergency Load (20 points max - Inverse load)
    load_scores = {"low": 20, "medium": 15, "high": 5, "critical": 0}
    load_score = load_scores.get(availability.get("emergency_load", "medium"), 10)
    score += load_score
    breakdown["emergency_load_score"] = load_score

    # 4. Travel Time Penalty (10 points max)
    if travel_time_minutes <= 10:
        travel_score = 10
    elif travel_time_minutes <= 20:
        travel_score = 7
    elif travel_time_minutes <= 30:
        travel_score = 4
    else:
        travel_score = 1

    score += travel_score
    breakdown["travel_time_score"] = travel_score

    final_score = min(round(score, 1), 100)

    return {
        "hospital_id": hospital.get("id"),
        "hospital_name": hospital.get("name"),
        "total_score": final_score,
        "eta_minutes": round(travel_time_minutes, 1),
        "distance_km": round(travel_time_minutes * 0.5, 1), # Simulated approx distance
        "icu_available": availability.get("icu_beds_available", 0),
        "ventilators_available": availability.get("ventilators_available", 0),
        "emergency_load": availability.get("emergency_load", "low"),
        "breakdown": breakdown
    }
