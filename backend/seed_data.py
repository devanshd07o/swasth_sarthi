import uuid
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
import models

def seed_database(force=False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if doctors already exist
    existing_user = db.query(models.User).first()
    if existing_user and not force:
        print("[+] Database already populated with clinical records. Instant startup ready.")
        db.close()
        return

    # Clean previous demo rows to cleanly re-populate rich data
    db.query(models.DoctorRating).delete()
    db.query(models.Document).delete()
    db.query(models.PatientCase).delete()
    db.query(models.Patient).delete()
    db.query(models.User).delete()
    db.commit()

    print("[+] Seeding 100% complete, rich Ayurvedic clinical practice data (Doctors, Patients, Avatars, Pariksha, Timeline, Vault, Ratings)...")
    
    # ─── 1. Ayurvedic Vaidyas / Doctors with High-Res Avatars ───────────────────
    doc1 = models.User(
        doctor_id="DOC-AYUR-101",
        name="Dr. Rajesh Vaidya",
        email="doctor@ayursaarthi.in",
        password_hash="doctor123",
        role="doctor",
        qualification="BAMS, MD (Kayachikitsa — Internal Medicine)",
        registration_no="AYUSH-REG-DEL-2012-4412",
        specializations=["Kayachikitsa", "Panchakarma", "Rasayana"],
        symptom_tags=["Joint Pain", "Ghutna Dard", "Arthritis", "Sandhivata", "Digestion", "Acidity", "Back Pain"],
        rating_avg=4.9,
        rating_count=38,
        hospital_name="All India Institute of Ayurveda (AIIA), New Delhi",
        experience_years=14,
        availability="Mon - Sat • 09:00 AM - 02:00 PM",
        consultation_fee=100,
        avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
    )

    doc2 = models.User(
        doctor_id="DOC-AYUR-102",
        name="Dr. Ananya Sharma",
        email="ananya.sharma@ayursaarthi.in",
        password_hash="doctor123",
        role="doctor",
        qualification="BAMS, MD (Panchakarma Detox & Skin)",
        registration_no="AYUSH-REG-RAJ-2016-8921",
        specializations=["Panchakarma", "Twacha Roga (Dermatology)", "Agada Tantra"],
        symptom_tags=["Skin / Twacha", "Khujli", "Psoriasis", "Eczema", "Detox", "Vamana", "Virechana", "Acidity"],
        rating_avg=4.8,
        rating_count=29,
        hospital_name="National Institute of Ayurveda (NIA), Jaipur",
        experience_years=9,
        availability="Mon - Fri • 10:00 AM - 04:00 PM",
        consultation_fee=100,
        avatar_url="https://images.unsplash.com/photo-1594824813589-3221dbb80b7d?w=150&auto=format&fit=crop&q=80"
    )

    doc3 = models.User(
        doctor_id="DOC-AYUR-103",
        name="Dr. Vikramaditya Shastri",
        email="vikram.shastri@ayursaarthi.in",
        password_hash="doctor123",
        role="doctor",
        qualification="BAMS, MS (Shalya Tantra — Ayurvedic Surgery & Wound Care)",
        registration_no="AYUSH-REG-UP-2010-1120",
        specializations=["Shalya Tantra", "Kshara Sutra", "Marma Chikitsa"],
        symptom_tags=["Anorectal", "Piles", "Fistula", "Wounds", "Chronic Joint Pain", "Sports Injury", "Knee Pain"],
        rating_avg=4.9,
        rating_count=45,
        hospital_name="Faculty of Ayurveda, BHU, Varanasi",
        experience_years=16,
        availability="Tue - Sun • 09:30 AM - 01:30 PM",
        consultation_fee=100,
        avatar_url="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
    )

    doc4 = models.User(
        doctor_id="DOC-AYUR-104",
        name="Dr. Meera Nambiar",
        email="meera.nambiar@ayursaarthi.in",
        password_hash="doctor123",
        role="doctor",
        qualification="BAMS, MD (Kaumarbhritya & Rasayana Chikitsa)",
        registration_no="AYUSH-REG-KER-2015-7734",
        specializations=["Kaumarbhritya", "Rasayana (Geriatrics & Immunity)", "Manasa Roga"],
        symptom_tags=["Stress / Tanav", "Insomnia / Neend", "Child Health", "Immunity", "Fatigue", "General Weakness"],
        rating_avg=4.9,
        rating_count=52,
        hospital_name="Kottakkal Arya Vaidya Sala Hospital, Kerala",
        experience_years=11,
        availability="Mon - Sat • 08:30 AM - 01:00 PM",
        consultation_fee=100,
        avatar_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
    )

    db.add_all([doc1, doc2, doc3, doc4])
    db.commit()
    db.refresh(doc1)
    db.refresh(doc2)
    db.refresh(doc3)
    db.refresh(doc4)

    # ─── 2. Patients with Central ABHA IDs & Avatars ────────────────────────────
    p1 = models.Patient(
        abha_id="ABHA-9821-4501",
        uhid="ABHA-9821-4501",
        name="Ramesh Sharma",
        age=52,
        gender="male",
        contact="+91 9821450100",
        blood_group="B+",
        address="Sector 14, Dwarka, New Delhi",
        medical_history="Hypertension for 5 years, Mild Joint Pain",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        consent_given=True,
        consent_timestamp=datetime.utcnow() - timedelta(days=90),
        symptom_diary=[
            {
                "id": str(uuid.uuid4()),
                "date": "2026-08-20 08:30",
                "symptom": "Right knee stiffness in morning for 20 minutes",
                "severity": "Moderate",
                "notes": "Relief after warm sesame oil massage."
            }
        ]
    )
    
    p2 = models.Patient(
        abha_id="ABHA-3412-8902",
        uhid="ABHA-3412-8902",
        name="Sunita Sharma",
        age=36,
        gender="female",
        contact="+91 9876543210",
        blood_group="O+",
        address="Rajinder Nagar, New Delhi",
        medical_history="Hyperacidity, Indigestion, GERD",
        avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        consent_given=True,
        consent_timestamp=datetime.utcnow() - timedelta(days=60),
        symptom_diary=[
            {
                "id": str(uuid.uuid4()),
                "date": "2026-08-22 22:15",
                "symptom": "Retrosternal heartburn after spicy dinner",
                "severity": "Severe",
                "notes": "Drank 1 glass cold milk, acidity subsided."
            }
        ]
    )

    p3 = models.Patient(
        abha_id="ABHA-3344-1102",
        uhid="ABHA-3344-1102",
        name="Priya Deshmukh",
        age=29,
        gender="female",
        contact="+91 9123456789",
        blood_group="A+",
        address="Bandra, Mumbai, Maharashtra",
        medical_history="Skin itching, Eczematous patches, Insomnia",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        consent_given=True,
        consent_timestamp=datetime.utcnow() - timedelta(days=30),
        symptom_diary=[
            {
                "id": str(uuid.uuid4()),
                "date": "2026-08-21 16:30",
                "symptom": "Mild erythema on inner elbows after sun exposure",
                "severity": "Moderate",
                "notes": "Applied Shatadhauta Ghrita locally."
            }
        ]
    )

    p4 = models.Patient(
        abha_id="ABHA-9988-1234",
        uhid="ABHA-9988-1234",
        name="Priya Patel",
        age=29,
        gender="female",
        contact="+91 9711223344",
        blood_group="AB+",
        address="Vasant Kunj, New Delhi",
        medical_history="Skin itching, Eczematous patches on forearms, Pitta dominance",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        consent_given=True,
        consent_timestamp=datetime.utcnow() - timedelta(days=15),
        symptom_diary=[
            {
                "id": str(uuid.uuid4()),
                "date": "2026-08-21 16:30",
                "symptom": "Mild erythema on inner elbows after sun exposure",
                "severity": "Moderate",
                "notes": "Applied Shatadhauta Ghrita locally."
            }
        ]
    )

    # 5th Patient: Acute Emergency Red-Flag Case for MedRoute Demo
    p5 = models.Patient(
        abha_id="ABHA-7700-9999",
        uhid="ABHA-7700-9999",
        name="Kailash Chandra",
        age=61,
        gender="male",
        contact="+91 9899001122",
        blood_group="O+",
        address="Laxmi Nagar, East Delhi",
        medical_history="Chronic Ischemic Heart Disease, Dyslipidemia",
        avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        consent_given=True,
        consent_timestamp=datetime.utcnow() - timedelta(hours=2),
        symptom_diary=[]
    )

    db.add_all([p1, p2, p3, p4, p5])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)
    db.refresh(p3)
    db.refresh(p4)
    db.refresh(p5)

    # ─── 3. Detailed Consultations / Cases with 100% Filled Clinical Fields ─────
    # Case 1: Ramesh Sharma (Dr. Rajesh Vaidya - Knee Osteoarthritis)
    c1 = models.PatientCase(
        patient_id=p1.id,
        doctor_id=doc1.id,
        doctor_name=doc1.name,
        doctor_qualification=doc1.qualification,
        hospital_name=doc1.hospital_name,
        status="completed",
        token_number="OPD-042",
        is_red_flag=False,
        chief_complaints="Janu Shoola (Knee joint pain), Morning stiffness for 45 mins, Right knee crepitus",
        history_present_illness="Gradual onset of right knee pain since 6 months, aggravated during cold winter mornings and stair climbing. Relieved by hot water bag application.",
        past_history="No past trauma, fracture, or surgical interventions. Known hypertensive controlled on Amlodipine 5mg.",
        family_history="Maternal history of severe osteoarthritis and early mobility restriction.",
        personal_history="Sedentary desk job 8-10 hours daily. Irregular sleep cycle.",
        dietary_lifestyle_habits="Cold refrigerated water with meals, fermented food (Idli/Dosa 3x/week), late night dinners.",
        prakriti="Vata-Kapha Dominant",
        vikriti="Vata Vriddhi with Ama accumulation",
        agni="Vishama Agni (Irregular Appetite)",
        koshtha="Krushta Koshtha (Hard Bowel movements)",
        ashtavidha_pariksha={
            "nadi": "Vata-Vaha Nadi (Fast, Thready, Sarpagati)",
            "mutra": "Samyak (Normal pale yellow, frequency 4-5 times)",
            "mala": "Baddhatva (Hard stools, occasional constipation)",
            "jihva": "Saama (White coating indicating endotoxin / Ama)",
            "shabda": "Spashta (Clear voice, unhurried)",
            "sparsha": "Rooksha & Sheeta (Dry & Cold knee joints)",
            "drik": "Prakrita (Normal vision, slight pallor)",
            "aakriti": "Madhyama (Medium body frame, mild abdominal adiposity)"
        },
        vitals={"bp": "130/85 mmHg", "pulse": "76 bpm", "temp": "98.4 F", "spo2": "98%", "rr": "18/min"},
        clinical_findings="Crepitus palpable on active flexion of right knee. Tenderness on medial joint line. Active flexion restricted beyond 110 degrees. No joint effusion.",
        diagnosis_ayurvedic="Sandhivata (Osteoarthritis of Right Knee)",
        diagnosis_modern="Knee Osteoarthritis Grade II",
        medicines=[
            {"name": "Yograj Guggulu", "category": "Guggulu", "dosage": "2 tablets twice daily", "duration": "30 days", "anupana": "Warm Water"},
            {"name": "Rasnasaptak Kwath", "category": "Kwath", "dosage": "20 ml twice daily before meals", "duration": "30 days", "anupana": "Equal warm water"},
            {"name": "Ksheerabala Taila (101)", "category": "Taila", "dosage": "Local application on right knee joint followed by hot fomentation", "duration": "30 days", "anupana": "External"}
        ],
        anupana="गुनगुना पानी (Lukewarm Water) / रास्नासप्तक क्वाथ",
        pathya_apathya="Pathya: Warm freshly cooked soup, Garlic (Lashuna), Sesame oil massage, hot water bath, light walking. Apathya: Cold aerated drinks, Night curd, Chickpeas (Chana), Heavy physical lifting, exposure to cold wind.",
        follow_up_date="2026-09-20",
        private_notes="Patient is mildly anxious about needing knee replacement surgery. Reassured that Janu Basti and conservative Ayurvedic management will restore joint lubrication.",
        prescription_signed=True,
        prescription_signed_at=datetime.utcnow() - timedelta(days=90),
        ai_case_summary_en="Ramesh Sharma (52M) diagnosed with Sandhivata (Osteoarthritis Grade II) due to Vata-Kapha imbalance. Prescribed Yograj Guggulu & Rasnasaptak Kwath with Janu Basti recommendation.",
        ai_case_summary_hi="रमेश शर्मा (52 वर्ष) को वात-कफ असंतुलन जन्य संधिवात का निदान हुआ। योगराज गुग्गुलु और रास्नासप्तक क्वाथ के साथ जानु बस्ती की सलाह दी गई।",
        ai_risk_factors=["Cartilage degeneration risk if weight bearing increases"],
        ai_missing_fields=["Serum Uric Acid level report"],
        ai_dosha_analysis={"Vata": "High (+42%)", "Pitta": "Normal", "Kapha": "Elevated (+18%)"}
    )

    # Case 2: Ramesh Sharma Visit 2 (Dr. Vikramaditya Shastri - Second Opinion)
    c2 = models.PatientCase(
        patient_id=p1.id,
        doctor_id=doc3.id,
        doctor_name=doc3.name,
        doctor_qualification=doc3.qualification,
        hospital_name=doc3.hospital_name,
        status="completed",
        token_number="OPD-088",
        is_red_flag=False,
        chief_complaints="Follow-up on right knee stiffness. Pain reduced by 50% after Yograj Guggulu. Inquired about Marma Therapy.",
        history_present_illness="Patient reports 50% improvement in pain. Morning stiffness reduced from 45 mins to 15 mins.",
        past_history="Prior treatment by Dr. Rajesh Vaidya at AIIA (Yograj Guggulu & Rasnasaptak Kwath).",
        prakriti="Vata-Kapha",
        vikriti="Vata Shamana in progress",
        agni="Sama Agni (Normalized Appetite)",
        koshtha="Madhyama Koshtha",
        ashtavidha_pariksha={
            "nadi": "Vata-Shamana Nadi (Soft, Rhythmic)",
            "mutra": "Prakrita (Normal)",
            "mala": "Nirama (Soft, regular daily)",
            "jihva": "Nirama (Pink, minimal coating)",
            "shabda": "Prakrita",
            "sparsha": "Ushna & Snigdha",
            "drik": "Prakrita",
            "aakriti": "Madhyama"
        },
        vitals={"bp": "124/80 mmHg", "pulse": "72 bpm", "temp": "98.6 F", "spo2": "99%", "rr": "16/min"},
        clinical_findings="Crepitus significantly reduced. Knee flexion improved to 130 degrees. No swelling.",
        diagnosis_ayurvedic="Sandhivata (Improving Phase)",
        diagnosis_modern="Knee Osteoarthritis Grade II - Conservative Recovery",
        medicines=[
            {"name": "Shallaki Capsule (Boswellia)", "category": "Capsule", "dosage": "1 cap twice daily after meals", "duration": "45 days", "anupana": "Warm Water"},
            {"name": "Mahanarayan Taila", "category": "Taila", "dosage": "Daily gentle Abhyanga on lower limbs", "duration": "45 days", "anupana": "External"}
        ],
        anupana="दूध (Warm Milk) with a pinch of Haldi",
        pathya_apathya="Pathya: Continue Janu Marma stimulation, dry ginger tea, gentle stretching. Apathya: Strenuous squatting, dry foods, cold exposure.",
        follow_up_date="2026-10-15",
        private_notes="CONFIDENTIAL NOTE: Patient responded very well to conservative Marma stimulation (Janu Marma). Advised avoidance of knee replacement surgery.",
        prescription_signed=True,
        prescription_signed_at=datetime.utcnow() - timedelta(days=35),
        ai_case_summary_en="Follow-up consultation with Dr. Vikramaditya Shastri. Pain improved by 50%. Transitioned to Shallaki and Marma therapy.",
        ai_case_summary_hi="डॉ. विक्रमादित्य शास्त्री के साथ फॉलो-अप। दर्द में 50% सुधार। शल्लकी एवं मर्म चिकित्सा जारी रखने की सलाह।",
        ai_risk_factors=["Watch for winter flare-ups"],
        ai_missing_fields=[],
        ai_dosha_analysis={"Vata": "Decreasing (-25%)", "Pitta": "Normal", "Kapha": "Normal"}
    )

    # Case 3: Sunita Devi (Dr. Rajesh Vaidya - GERD / Amlapitta)
    c3 = models.PatientCase(
        patient_id=p2.id,
        doctor_id=doc1.id,
        doctor_name=doc1.name,
        doctor_qualification=doc1.qualification,
        hospital_name=doc1.hospital_name,
        status="completed",
        token_number="OPD-055",
        is_red_flag=False,
        chief_complaints="Urdhvaga Amlapitta (Hyperacidity, Sour Belching, Retrosternal burning after meals)",
        history_present_illness="Suffering from recurrent heartburn, nausea, and sour taste in mouth for 8 months. Aggravated by tea on empty stomach and spicy curries.",
        past_history="Over-the-counter Pantoprazole taken for 3 months with temporary relief only.",
        family_history="Father had peptic ulcer history.",
        personal_history="Late sleeping habit (1 AM), excessive tea consumption (5 cups daily).",
        dietary_lifestyle_habits="Spicy fried snacks, tomatoes, vinegar, irregular lunch timing.",
        prakriti="Pitta-Vata Dominant",
        vikriti="Pitta Vriddhi with Ushna-Tikshna Guna increase",
        agni="Tikshna Agni (Hyper-metabolism)",
        koshtha="Mridu Koshtha",
        ashtavidha_pariksha={
            "nadi": "Pitta-Vaha Nadi (Mandookagati / Jumping, Rapid)",
            "mutra": "Peeta Varna (Deep yellow, burning micturition)",
            "mala": "Dravata (Loose stools 2-3 times daily)",
            "jihva": "Rakta & Saama (Red edges, slight yellow coating)",
            "shabda": "Tivra (Sharp, irritable)",
            "sparsha": "Ushna (Warm skin temperature)",
            "drik": "Rakta (Mild conjunctival congestion)",
            "aakriti": "Krisha (Lean build)"
        },
        vitals={"bp": "118/76 mmHg", "pulse": "84 bpm", "temp": "98.8 F", "spo2": "99%", "rr": "18/min"},
        clinical_findings="Epigastric tenderness on deep palpation. No organomegaly.",
        diagnosis_ayurvedic="Urdhvaga Amlapitta (Acid Peptic Disorder)",
        diagnosis_modern="Gastroesophageal Reflux Disease (GERD)",
        medicines=[
            {"name": "Avipattikar Churna", "category": "Churna", "dosage": "3 grams twice daily before food", "duration": "21 days", "anupana": "Coconut Water / Cold Milk"},
            {"name": "Kamadudha Rasa (Mukta Yukta)", "category": "Rasa", "dosage": "1 tablet twice daily", "duration": "21 days", "anupana": "Honey"},
            {"name": "Sutashekhara Rasa", "category": "Rasa", "dosage": "1 tablet twice daily after meals", "duration": "21 days", "anupana": "Gulkand"}
        ],
        anupana="नारियल पानी (Fresh Coconut Water) / मिश्री युक्त दूध",
        pathya_apathya="Pathya: Munakka (Raisins), Pomegranate (Dadima), Old Rice, Barley, Gulkand, Coriander water. Apathya: Tea, Coffee, Green chilies, Mustard oil, Sour curd, Night vigil (Ratri Jagaran).",
        follow_up_date="2026-09-10",
        private_notes="Counselled patient on strict circadian rhythm (Nidra). Advised stopping bed tea completely.",
        prescription_signed=True,
        prescription_signed_at=datetime.utcnow() - timedelta(days=20),
        ai_case_summary_en="Sunita Devi (44F) presented with severe Urdhvaga Amlapitta (GERD). Prescribed Avipattikar Churna & Kamadudha Rasa with Pitta-pacifying diet.",
        ai_case_summary_hi="सुनीता देवी (44 वर्ष) को तीव्र अम्लपित्त (GERD) का निदान। अविपत्तिकर चूर्ण और कामदुधा रस के साथ पित्तशामक आहार की सलाह दी गई।",
        ai_risk_factors=["Gastric ulceration risk if sour diet continues"],
        ai_missing_fields=["Upper GI Endoscopy report"],
        ai_dosha_analysis={"Vata": "Normal", "Pitta": "Severe (+58%)", "Kapha": "Normal"}
    )

    # Case 4: Kailash Chandra (EMERGENCY RED-FLAG CASE)
    c4 = models.PatientCase(
        patient_id=p5.id,
        doctor_id=doc1.id,
        doctor_name=doc1.name,
        doctor_qualification=doc1.qualification,
        hospital_name=doc1.hospital_name,
        status="active",
        token_number="EMERG-001",
        is_red_flag=True,
        red_flag_reason="CRITICAL: Patient reported sudden crushing chest pain radiating to left jaw with profuse cold sweating (Suspected Acute Coronary Syndrome).",
        intake_data={
            "transcript": "Mere chhati me bahut tej dard ho raha hai aur saans lene me takleef ho rahi hai, pasina aa raha hai",
            "chief_complaint": "Severe acute retrosternal chest pain with diaphoresis & dyspnea",
            "duration": "45 minutes",
            "severity": "Critical Emergency",
            "red_flag_triggered": True
        },
        chief_complaints="Crushing chest pain radiating to left shoulder and jaw, severe breathlessness, cold clammy skin",
        vitals={"bp": "165/105 mmHg", "pulse": "112 bpm", "temp": "97.8 F", "spo2": "91%", "rr": "26/min"},
        clinical_findings="Patient in acute distress. Diaphoretic. S3 gallop audible. Immediate ICU/Emergency ECG triage required.",
        diagnosis_ayurvedic="Hridshoola (Acute Cardiac Ischemia / Angina Pectoris)",
        diagnosis_modern="Acute Coronary Syndrome / STEMI Suspect",
        medicines=[
            {"name": "Prabhakar Vati", "category": "Vati", "dosage": "1 tab sublingual with honey (emergency supportive)", "duration": "Immediate", "anupana": "Honey"},
            {"name": "Arjuna Ksheerapaka", "category": "Kwath", "dosage": "30 ml emergency decoction", "duration": "Immediate", "anupana": "Warm"}
        ],
        anupana="शहद (Honey)",
        pathya_apathya="Immediate complete bed rest, zero physical exertion, high-flow oxygen support.",
        follow_up_date="Immediate ICU Admission",
        private_notes="EMERGENCY TRIAGE: Priority 1 case. Immediate 12-lead ECG dispatched, cardiologist and ICU team alerted via MedRoute.",
        prescription_signed=False,
        ai_case_summary_en="CRITICAL EMERGENCY: 61M presenting with acute crushing chest pain (Hridshoola). Bypassed standard queue to top of Doctor console.",
        ai_case_summary_hi="अति गंभीर आपातकाल: 61 वर्षीय पुरुष में तीव्र हृदशूल। सामान्य कतार को बाईपास करके डॉक्टर कंसोल के शीर्ष पर प्राथमिकता दी गई।"
    )

    # Case 5: Amitabh Verma (Dr. Rajesh Vaidya - Prameha / Type 2 Diabetes)
    c5 = models.PatientCase(
        patient_id=p3.id,
        doctor_id=doc1.id,
        doctor_name=doc1.name,
        doctor_qualification=doc1.qualification,
        hospital_name=doc1.hospital_name,
        status="completed",
        token_number="OPD-071",
        is_red_flag=False,
        chief_complaints="Prameha (Type 2 Diabetes), Post-prandial lethargy, Polyuria at night (3-4 times), Dryness of palate",
        history_present_illness="Diagnosed with Type 2 Diabetes 2 years ago. HbA1c 7.8%. Experiencing chronic fatigue and mental stress from corporate work.",
        past_history="Metformin 500mg once daily. Mild dyslipidemia.",
        family_history="Both parents are diabetic.",
        personal_history="High stress IT managerial role, 10 hours screen time.",
        dietary_lifestyle_habits="Excess carbohydrate intake, sweets during meetings, sedentary routine.",
        prakriti="Kapha-Pitta Dominant",
        vikriti="Kapha-Meda Dhatu Vriddhi, Kleda Sanchaya",
        agni="Manda Agni (Slow Metabolism)",
        koshtha="Madhyama Koshtha",
        ashtavidha_pariksha={
            "nadi": "Kapha-Vaha Nadi (Manda, Gambhira / Slow, Deep)",
            "mutra": "Prabhuta & Avila (Excess volume, turbid urine)",
            "mala": "Samyak",
            "jihva": "Picchila & Saama (Sticky white coating)",
            "shabda": "Gambhira",
            "sparsha": "Snigdha & Sheeta (Oily, cool skin)",
            "drik": "Prakrita",
            "aakriti": "Sthula (Overweight BMI 27.4)"
        },
        vitals={"bp": "128/82 mmHg", "pulse": "74 bpm", "temp": "98.2 F", "spo2": "99%", "rr": "16/min"},
        clinical_findings="Acanthosis nigricans on nape of neck. Mild central obesity. Fasting Blood Sugar 142 mg/dL.",
        diagnosis_ayurvedic="Kaphaja Prameha (Madhumeha)",
        diagnosis_modern="Type 2 Diabetes Mellitus with Metabolic Syndrome",
        medicines=[
            {"name": "Nishamalaki Churna", "category": "Churna", "dosage": "3 grams twice daily before food", "duration": "45 days", "anupana": "Warm Water"},
            {"name": "Chandraprabha Vati", "category": "Vati", "dosage": "2 tablets twice daily", "duration": "45 days", "anupana": "Lukewarm Water"},
            {"name": "Asanadi Kashayam", "category": "Kwath", "dosage": "15 ml with 45 ml boiled warm water twice daily", "duration": "45 days", "anupana": "Warm Water"}
        ],
        anupana="मेथी दाना पानी (Fenugreek Seed Water) / गुनगुना पानी",
        pathya_apathya="Pathya: Barley (Yava), Bitter gourd (Karela), Jamun seeds, Amla, Green gram (Moong), 45-min brisk walking. Apathya: Sugar, Refined flour (Maida), Potatoes, Day sleep (Diva Swapna), Fried food.",
        follow_up_date="2026-10-05",
        private_notes="Advised continuous glucose monitoring. Good compliance expected. Suggested stress reduction via Pranayama (Bhramari).",
        prescription_signed=True,
        prescription_signed_at=datetime.utcnow() - timedelta(days=28),
        ai_case_summary_en="Amitabh Verma (38M) diagnosed with Kaphaja Prameha (Type 2 DM). Prescribed Nishamalaki & Chandraprabha Vati with Kapha-reducing regimen.",
        ai_case_summary_hi="अमिताभ वर्मा (38 वर्ष) को कफज प्रमेह (डायबिटीज) का निदान। निशामलकी और चंद्रप्रभा वटी के साथ यव प्रधान आहार की सलाह दी गई।"
    )

    # Case 6: Priya Patel (Dr. Ananya Sharma - Twacha Roga / Eczema)
    c6 = models.PatientCase(
        patient_id=p4.id,
        doctor_id=doc2.id,
        doctor_name=doc2.name,
        doctor_qualification=doc2.qualification,
        hospital_name=doc2.hospital_name,
        status="completed",
        token_number="OPD-033",
        is_red_flag=False,
        chief_complaints="Twacha Kandu (Severe Itching), Erythematous dry scaly patches on both forearms & neck, Aggravated in humid heat",
        history_present_illness="Suffering from recurrent eczema flare-ups since 1 year. Topical steroid creams provided temporary relief with rebound flaring.",
        past_history="Allergic rhinitis in childhood.",
        prakriti="Pitta-Kapha",
        vikriti="Rakta Dhatu Dushti with Pitta-Kapha imbalance",
        agni="Tikshna Agni",
        koshtha="Mridu Koshtha",
        ashtavidha_pariksha={
            "nadi": "Pitta-Kapha Nadi (Sarpagati / Wavy)",
            "mutra": "Peeta Varna",
            "mala": "Dravata",
            "jihva": "Rakta & Alpa Saama",
            "shabda": "Prakrita",
            "sparsha": "Ushna, Rooksha & Khara (Dry, scaly patches)",
            "drik": "Prakrita",
            "aakriti": "Madhyama"
        },
        vitals={"bp": "114/72 mmHg", "pulse": "78 bpm", "temp": "98.6 F", "spo2": "99%", "rr": "18/min"},
        clinical_findings="Lichenified erythematous plaques on flexor aspect of forearms with excoriation marks. No secondary bacterial infection.",
        diagnosis_ayurvedic="Vicharchika (Twacha Roga / Eczema)",
        diagnosis_modern="Atopic Eczema / Subacute Dermatitis",
        medicines=[
            {"name": "Mahatiktaka Ghrita", "category": "Ghrita", "dosage": "10 ml early morning on empty stomach with warm water", "duration": "30 days", "anupana": "Warm Water"},
            {"name": "Khadirarishta", "category": "Arishta", "dosage": "20 ml after meals with equal water", "duration": "30 days", "anupana": "Water"},
            {"name": "Shatadhauta Ghrita (External)", "category": "Ghrita", "dosage": "Gentle local application on dry lesions 3 times daily", "duration": "30 days", "anupana": "External"}
        ],
        anupana="उबला हुआ गुनगुना पानी (Boiled Lukewarm Water)",
        pathya_apathya="Pathya: Neem patra swarasa, Bitter gourd, Old barley, Moong soup, Coconut oil for bathing. Apathya: Fermented items, Seafood, Sour fruits (Citrus), Curd (Dahi), Synthetic clothing, Hot water on skin.",
        follow_up_date="2026-09-18",
        private_notes="Advised gentle Virechana Panchakarma next month after Snehapana completion.",
        prescription_signed=True,
        prescription_signed_at=datetime.utcnow() - timedelta(days=12),
        ai_case_summary_en="Priya Patel (29F) diagnosed with Vicharchika (Eczema) due to Rakta-Pitta dushti. Prescribed Mahatiktaka Ghrita and Khadirarishta with Shatadhauta Ghrita.",
        ai_case_summary_hi="प्रिया पटेल (29 वर्ष) को रक्त-पित्त दृष्टि जन्य विचर्चिका (एक्जिमा) का निदान। महातिक्तक घृत और खदिरारिष्ट की सलाह दी गई।"
    )

    # Case 7: Sunita Devi Visit 2 (Dr. Meera Nambiar - Manasa Roga & Insomnia)
    c7 = models.PatientCase(
        patient_id=p2.id,
        doctor_id=doc4.id,
        doctor_name=doc4.name,
        doctor_qualification=doc4.qualification,
        hospital_name=doc4.hospital_name,
        status="completed",
        token_number="OPD-092",
        is_red_flag=False,
        chief_complaints="Anidra (Chronic Insomnia - difficulty falling asleep for 2-3 hours), Restlessness, Head heaviness",
        history_present_illness="Stress-induced sleep deprivation. GERD symptoms improved by 70%, but sleep latency remains prolonged.",
        past_history="Under treatment by Dr. Rajesh Vaidya for Amlapitta.",
        prakriti="Pitta-Vata",
        vikriti="Vata-Pitta Vriddhi in Manovaha Srotas",
        agni="Sama Agni",
        koshtha="Madhyama",
        ashtavidha_pariksha={
            "nadi": "Vata-Pitta Nadi (Chanchala / Restless)",
            "mutra": "Prakrita",
            "mala": "Samyak",
            "jihva": "Nirama",
            "shabda": "Prakrita",
            "sparsha": "Snigdha",
            "drik": "Klanta (Tired eyes, dark circles)",
            "aakriti": "Krisha"
        },
        vitals={"bp": "120/78 mmHg", "pulse": "70 bpm", "temp": "98.4 F", "spo2": "99%", "rr": "16/min"},
        clinical_findings="Clear sensorium. Mild peri-orbital puffiness and dark circles. No neurological deficits.",
        diagnosis_ayurvedic="Anidra & Chinta (Insomnia & Anxiety Neurosis)",
        diagnosis_modern="Chronic Sleep Onset Insomnia",
        medicines=[
            {"name": "Brahmi Vati (Gold)", "category": "Vati", "dosage": "1 tablet twice daily after meals", "duration": "30 days", "anupana": "Warm Milk"},
            {"name": "Ashwagandharishta", "category": "Arishta", "dosage": "20 ml before sleeping with equal water", "duration": "30 days", "anupana": "Warm Water"},
            {"name": "Ksheerabala Taila (Shirodhara / Padabhyanga)", "category": "Taila", "dosage": "Foot sole massage (Padabhyanga) before sleeping", "duration": "30 days", "anupana": "External"}
        ],
        anupana="गुनगुना गाय का दूध (Warm Cow Milk with Nutmeg / Jaiphal)",
        pathya_apathya="Pathya: Warm foot bath before bed, Padabhyanga with Ksheerabala taila, Chamomile / Brahmi tea, screen off by 10 PM. Apathya: Evening tea/coffee, Thriller movies before bed, Late dinner.",
        follow_up_date="2026-09-30",
        private_notes="Patient taught 4-7-8 Yogic breathing. Padabhyanga has immediate calming effect on Vata.",
        prescription_signed=True,
        prescription_signed_at=datetime.utcnow() - timedelta(days=8),
        ai_case_summary_en="Sunita Devi (44F) consulted Dr. Meera Nambiar for chronic Anidra (Insomnia). Prescribed Brahmi Vati, Ashwagandharishta & Padabhyanga.",
        ai_case_summary_hi="सुनीता देवी (44 वर्ष) को अनिद्रा एवं चिंता का निदान। ब्राह्मी वटी, अश्वगंधारिष्ट एवं पादाभ्यंग की सलाह दी गई।"
    )

    db.add_all([c1, c2, c3, c4, c5, c6, c7])
    db.commit()

    # ─── 4. Scanned OCR Documents in Document Vault ─────────────────────────────
    d1 = models.Document(
        patient_id=p1.id,
        file_name="AIIA_OPD_Prescription_2026.pdf",
        file_type="Prescription",
        date="2026-05-24",
        source_doctor_or_hospital="All India Institute of Ayurveda (AIIA)",
        extracted_data={
            "doctor": "Dr. Rajesh Vaidya",
            "hospital": "AIIA New Delhi",
            "diagnoses": ["Sandhivata", "Osteoarthritis Right Knee Grade II"],
            "medicines": ["Yograj Guggulu", "Rasnasaptak Kwath", "Ksheerabala Taila"],
            "dosha": "Vata Vriddhi"
        },
        summary="AIIA OPD Digital prescription by Dr. Rajesh Vaidya for Sandhivata management."
    )

    d2 = models.Document(
        patient_id=p1.id,
        file_name="Knee_Digital_XRay_Right_AP_LAT.pdf",
        file_type="Diagnostic Report",
        date="2026-05-20",
        source_doctor_or_hospital="City Care Diagnostic & Imaging Centre",
        extracted_data={
            "modality": "Digital X-Ray Right Knee (Weight Bearing)",
            "findings": "Medial joint compartment space narrowing, subchondral sclerosis, early osteophyte formation.",
            "impression": "Consistent with Grade II Osteoarthritis."
        },
        summary="Right Knee X-Ray confirming Grade II Osteoarthritis with medial space reduction."
    )

    d3 = models.Document(
        patient_id=p2.id,
        file_name="Upper_GI_Endoscopy_Summary.pdf",
        file_type="Discharge Summary",
        date="2026-07-10",
        source_doctor_or_hospital="Apollo Digestive Health Centre",
        extracted_data={
            "procedure": "Upper GI Video Endoscopy",
            "findings": "Erythematous mucosa in antrum, lax lower esophageal sphincter (LES).",
            "impression": "Grade A Reflux Esophagitis / Non-Ulcer Dyspepsia."
        },
        summary="Endoscopy showing mucosal erythema and acid reflux changes."
    )

    d4 = models.Document(
        patient_id=p3.id,
        file_name="Diabetic_Profile_HbA1c_Report.pdf",
        file_type="Diagnostic Report",
        date="2026-07-28",
        source_doctor_or_hospital="Dr. Lal PathLabs, Noida",
        extracted_data={
            "fasting_glucose": "142 mg/dL",
            "post_prandial": "210 mg/dL",
            "hba1c": "7.8%",
            "lipid_profile": "Triglycerides 190 mg/dL, HDL 42 mg/dL"
        },
        summary="Comprehensive Diabetic Profile indicating elevated HbA1c (7.8%) and borderline dyslipidemia."
    )

    d5 = models.Document(
        patient_id=p4.id,
        file_name="Dermatology_Allergy_Panel_2026.pdf",
        file_type="Diagnostic Report",
        date="2026-08-05",
        source_doctor_or_hospital="National Institute of Ayurveda Dermatology Lab",
        extracted_data={
            "serum_ige": "450 IU/mL (Elevated)",
            "patch_test": "Positive to synthetic fragrance and nickel",
            "impression": "Atopic Dermatitis with allergic component."
        },
        summary="Allergy panel showing elevated Serum IgE confirming atopic skin diathesis."
    )

    db.add_all([d1, d2, d3, d4, d5])
    db.commit()

    # ─── 5. Verified Anonymous Doctor Ratings ───────────────────────────────────
    r1 = models.DoctorRating(
        doctor_id=doc1.id,
        patient_id=p1.id,
        patient_hash="anon_pat_88a91",
        condition_treated="Sandhivata (Knee Pain)",
        score=5,
        comment="Dr. Rajesh Vaidya is extremely patient. His classical Ayurvedic prescription reduced my knee stiffness within 3 weeks.",
        verified_consultation=True
    )

    r2 = models.DoctorRating(
        doctor_id=doc1.id,
        patient_id=p2.id,
        patient_hash="anon_pat_33b12",
        condition_treated="Urdhvaga Amlapitta (GERD)",
        score=5,
        comment="Excellent explanation of diet (Pathya-Apathya). Acidity problem solved without antacids.",
        verified_consultation=True
    )

    r3 = models.DoctorRating(
        doctor_id=doc2.id,
        patient_id=p4.id,
        patient_hash="anon_pat_55c44",
        condition_treated="Twacha Roga (Eczema / Skin Itching)",
        score=5,
        comment="Panchakarma detox recommendations were remarkably effective. Skin itching vanished completely.",
        verified_consultation=True
    )

    r4 = models.DoctorRating(
        doctor_id=doc3.id,
        patient_id=p1.id,
        patient_hash="anon_pat_88a91",
        condition_treated="Marma Therapy (Joint Recovery)",
        score=5,
        comment="Outstanding surgical and Marma expertise at BHU Varanasi. Highly recommend for bone & joint disorders.",
        verified_consultation=True
    )

    db.add_all([r1, r2, r3, r4])
    db.commit()
    db.close()
    print("[+] Live Supabase Postgres 100% Seeded & Fully Populated!")

if __name__ == "__main__":
    seed_database()
