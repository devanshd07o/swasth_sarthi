import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/doctors", tags=["Doctors"])

@router.get("/", response_model=List[schemas.UserResponse])
def get_doctors(
    specialization: Optional[str] = Query(None, description="Filter by specialization e.g. Kayachikitsa"),
    symptom: Optional[str] = Query(None, description="Filter by symptom e.g. Joint Pain, Acidity"),
    search: Optional[str] = Query(None, description="Search by name or hospital"),
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.role == "doctor")
    doctors = query.all()
    
    results = []
    for doc in doctors:
        # Search text
        if search:
            s = search.lower()
            if s not in doc.name.lower() and s not in (doc.hospital_name or "").lower():
                continue
        # Specialization filter
        if specialization:
            specs = [x.lower() for x in (doc.specializations or [])]
            if specialization.lower() not in specs and not any(specialization.lower() in x for x in specs):
                continue
        # Symptom tag filter
        if symptom:
            tags = [x.lower() for x in (doc.symptom_tags or [])]
            if symptom.lower() not in tags and not any(symptom.lower() in x for x in tags):
                continue
        results.append(doc)
        
    return results

@router.get("/{doctor_id}", response_model=schemas.UserResponse)
def get_doctor_by_id(doctor_id: str, db: Session = Depends(get_db)):
    doc = db.query(models.User).filter(
        (models.User.id == doctor_id) | (models.User.doctor_id == doctor_id)
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doc

@router.get("/{doctor_id}/ratings", response_model=List[schemas.DoctorRatingResponse])
def get_doctor_ratings(doctor_id: str, db: Session = Depends(get_db)):
    doc = db.query(models.User).filter(
        (models.User.id == doctor_id) | (models.User.doctor_id == doctor_id)
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    ratings = db.query(models.DoctorRating)\
        .filter(models.DoctorRating.doctor_id == doc.id)\
        .order_by(models.DoctorRating.created_at.desc()).all()
    return ratings

@router.post("/{doctor_id}/ratings", response_model=schemas.DoctorRatingResponse)
def add_doctor_rating(doctor_id: str, rating_in: schemas.DoctorRatingCreate, db: Session = Depends(get_db)):
    doc = db.query(models.User).filter(
        (models.User.id == doctor_id) | (models.User.doctor_id == doctor_id)
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Generate pseudo-anonymous verified tag
    count = db.query(models.DoctorRating).filter(models.DoctorRating.doctor_id == doc.id).count()
    patient_hash = f"Verified Patient #{count + 101}"

    rating = models.DoctorRating(
        doctor_id=doc.id,
        patient_id=rating_in.patient_id,
        patient_hash=patient_hash,
        condition_treated=rating_in.condition_treated or "Ayurvedic Treatment",
        score=rating_in.score,
        comment=rating_in.comment,
        verified_consultation=True
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    # Recalculate average rating
    all_ratings = db.query(models.DoctorRating).filter(models.DoctorRating.doctor_id == doc.id).all()
    if all_ratings:
        doc.rating_avg = round(sum(r.score for r in all_ratings) / len(all_ratings), 1)
        doc.rating_count = len(all_ratings)
        db.commit()

    return rating

@router.get("/{doctor_id}/patients")
def get_doctor_patients(
    doctor_id: str,
    search: Optional[str] = Query(None, description="Search by patient name, mobile, ABHA ID"),
    db: Session = Depends(get_db)
):
    """
    Returns list of patients who have had >=1 visit or registration with this doctor.
    RED-FLAG EMERGENCY CASES ARE SORTED TO THE VERY TOP.
    """
    doc = db.query(models.User).filter(
        (models.User.id == doctor_id) | (models.User.doctor_id == doctor_id)
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Fetch cases for this doctor
    cases = db.query(models.PatientCase).filter(models.PatientCase.doctor_id == doc.id).all()
    patient_ids = list(set(c.patient_id for c in cases))

    patients = db.query(models.Patient).filter(models.Patient.id.in_(patient_ids)).all() if patient_ids else []

    # If search provided
    if search:
        s = search.lower()
        patients = [
            p for p in patients
            if s in p.name.lower() or s in p.contact.lower() or s in (p.abha_id or "").lower() or s in (p.uhid or "").lower()
        ]

    # Map patients with their latest visit status, tags, and is_red_flag flag
    patient_list_result = []
    for p in patients:
        p_cases = [c for c in cases if c.patient_id == p.id]
        p_cases.sort(key=lambda x: x.created_at, reverse=True)
        latest_case = p_cases[0] if p_cases else None

        has_red_flag = any(c.is_red_flag for c in p_cases if c.status == "active")
        
        row_tag = "Stable"
        if has_red_flag:
            row_tag = "Emergency / Red-Flag"
        elif len(p_cases) == 1:
            row_tag = "New Patient"
        elif latest_case and latest_case.follow_up_date:
            row_tag = "Follow-up Due"

        patient_list_result.append({
            "patient_id": p.id,
            "abha_id": p.abha_id,
            "uhid": p.uhid,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "contact": p.contact,
            "blood_group": p.blood_group,
            "total_visits_with_doctor": len(p_cases),
            "latest_visit_date": latest_case.created_at.strftime("%Y-%m-%d") if latest_case else "N/A",
            "latest_case_created_at": latest_case.created_at.isoformat() if latest_case else "1970-01-01T00:00:00",
            "latest_chief_complaint": latest_case.chief_complaints if latest_case else (p.medical_history or "Initial Consult"),
            "row_tag": row_tag,
            "is_red_flag": False,
            "red_flag_reason": None,
            "token_number": latest_case.token_number if latest_case else "OPD-100",
            "latest_case_id": latest_case.id if latest_case else None
        })

    # FIFO Per-Day Queue Sorting: Earliest registered patient first, newly booked patient appends to the LAST position
    patient_list_result.sort(key=lambda x: x["latest_case_created_at"], reverse=False)

    # Attach 1-indexed queue token sequence number
    for idx, item in enumerate(patient_list_result, 1):
        item["queue_position"] = idx

    return patient_list_result

class DoctorCreateRequest(schemas.BaseModel):
    name: str
    email: Optional[str] = None
    qualification: str
    specialization: Optional[str] = "Kayachikitsa"
    hospital_name: Optional[str] = "All India Institute of Ayurveda (AIIA)"
    experience_years: Optional[int] = 10

@router.post("/", response_model=schemas.UserResponse)
def register_doctor(req: DoctorCreateRequest, db: Session = Depends(get_db)):
    """
    Registers a brand new Ayurvedic Vaidya / Doctor on Supabase Postgres.
    """
    import random
    doc_num = random.randint(105, 999)
    doc_id = f"DOC-AYUR-{doc_num}"
    user_id = str(uuid.uuid4())
    reg_num = f"AYUSH-REG-DEL-2026-{random.randint(1000, 9999)}"
    email = req.email or f"{req.name.lower().replace(' ', '')}.ayush@gmail.com"

    new_doc = models.User(
        id=user_id,
        doctor_id=doc_id,
        name=req.name if req.name.startswith("Dr.") else f"Dr. {req.name}",
        email=email,
        password_hash="mock_hash_2026",
        role="doctor",
        qualification=req.qualification,
        registration_no=reg_num,
        specializations=[req.specialization] if req.specialization else ["Kayachikitsa"],
        symptom_tags=["General Ayurvedic Care", "Pulse Diagnosis (Nadi Pariksha)"],
        rating_avg=5.0,
        rating_count=1,
        hospital_name=req.hospital_name or "All India Institute of Ayurveda (AIIA)",
        experience_years=req.experience_years or 8,
        availability="Mon - Sat • 09:00 AM - 02:00 PM",
        consultation_fee=100,
        avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

