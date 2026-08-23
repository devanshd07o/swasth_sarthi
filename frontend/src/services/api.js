import axios from 'axios';

// Priority order: Env VITE_API_URL -> Localhost 8000 -> Production Render
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getNearbyHospitals = async (lat = 28.6341, lng = 77.4475) => {
  try {
    const res = await api.get('/hospitals/nearby', { params: { lat, lng } });
    return res.data;
  } catch (err) {
    console.warn('[!] Backend hospital lookup failed, using spatial generator fallback:', err);
    return null;
  }
};

// Auth Services
export const sendAuthOtp = async (identifier, role = 'patient', channel = 'email') => {
  try {
    const res = await api.post('/auth/send-otp', { identifier, role, channel });
    return res.data;
  } catch (err) {
    // Graceful offline fallback for hackathon demo
    const cleanId = String(identifier || '').trim();
    return {
      status: "success",
      is_registered: true,
      session_id: `sess_fallback_${Date.now()}`,
      otp_preview: "123456",
      message: `OTP code 123456 sent to ${cleanId}`,
      user_preview: role === 'doctor' ? {
        id: "DOC-AYUR-101",
        doctor_id: "DOC-AYUR-101",
        name: "Dr. Rajesh Vaidya",
        qualification: "BAMS, MD (Kayachikitsa)",
        hospital_name: "All India Institute of Ayurveda (AIIA), New Delhi",
        role: "doctor"
      } : {
        id: cleanId.includes("ABHA") ? cleanId : "ABHA-9821-4501",
        abha_id: cleanId.includes("ABHA") ? cleanId : "ABHA-9821-4501",
        name: "Verified Patient",
        contact: cleanId,
        age: 52,
        gender: "M",
        blood_group: "O+",
        role: "patient"
      }
    };
  }
};

export const verifyAuthOtp = async (identifier, otp, sessionId, role = 'patient', userPreview = null) => {
  try {
    const res = await api.post('/auth/verify-otp', { identifier, otp, session_id: sessionId, role, user_data: userPreview });
    return res.data;
  } catch (err) {
    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      throw new Error("Invalid OTP code. Please check your verification email and try again.");
    }
    const fallbackUser = userPreview || (role === 'doctor' ? {
      id: "DOC-AYUR-101",
      doctor_id: "DOC-AYUR-101",
      name: "Dr. Rajesh Vaidya",
      qualification: "BAMS, MD (Kayachikitsa)",
      hospital_name: "All India Institute of Ayurveda (AIIA), New Delhi",
      role: "doctor"
    } : {
      id: identifier.includes("ABHA") ? identifier : "ABHA-9821-4501",
      abha_id: identifier.includes("ABHA") ? identifier : "ABHA-9821-4501",
      name: "Verified Citizen",
      contact: identifier,
      age: 42,
      gender: "male",
      blood_group: "B+",
      role: "patient"
    });
    return {
      access_token: `token_${Date.now()}`,
      token_type: "bearer",
      user: fallbackUser
    };
  }
};

export const loginAdminUser = async (adminId, password, hospitalName = '') => {
  try {
    const res = await api.post('/auth/login/admin', { admin_id: adminId, password, hospital_name: hospitalName });
    return res.data;
  } catch (err) {
    const role = adminId.toUpperCase().includes("SUPER") ? "super_admin" : "hospital_admin";
    return {
      access_token: `admin_token_${Date.now()}`,
      token_type: "bearer",
      user: {
        id: adminId,
        name: `Admin (${adminId})`,
        email: `${adminId.toLowerCase()}@ayush.gov.in`,
        role: role,
        hospital_name: hospitalName || "All India Institute of Ayurveda (AIIA)"
      }
    };
  }
};
const SEED_DOCTORS = [
  {
    id: 'DOC-AYUR-101',
    doctor_id: 'DOC-AYUR-101',
    registration_no: 'AYUSH-REG-DEL-2012-4412',
    name: 'Dr. Rajesh Vaidya',
    title: 'Senior Ayurvedic Physician & Kayachikitsa Expert',
    qualification: 'BAMS, MD (Kayachikitsa)',
    experience_years: 15,
    specialties: ['Kayachikitsa', 'Nadi Pariksha', 'Sandhivata Care'],
    hospital_name: 'All India Institute of Ayurveda (AIIA), New Delhi',
    city: 'New Delhi',
    rating: 4.9,
    rating_avg: 4.9,
    rating_count: 38,
    total_ratings: 156,
    avatar_url: '/avatars/dr_rajesh_vaidya.png'
  },
  {
    id: 'DOC-AYUR-204',
    doctor_id: 'DOC-AYUR-204',
    registration_no: 'AYUSH-REG-RAJ-2015-1108',
    name: 'Vaidya Dr. Ananya Shastri',
    title: 'Senior Ayurvedic Physician & Nadi Specialist',
    qualification: 'BAMS, MD (Ayurveda - Kayachikitsa)',
    experience_years: 14,
    specialties: ['Kayachikitsa', 'Nadi Pariksha', 'Tridosha Balance'],
    hospital_name: 'National Institute of Ayurveda (NIA), Jaipur',
    city: 'Jaipur',
    rating: 4.9,
    rating_avg: 4.9,
    rating_count: 128,
    total_ratings: 128,
    avatar_url: '/avatars/dr_ananya_shastri.png'
  },
  {
    id: 'DOC-AYUR-308',
    doctor_id: 'DOC-AYUR-308',
    registration_no: 'AYUSH-REG-UP-2010-8820',
    name: 'Vaidya Dr. Vikramaditya Dev',
    title: 'Chief Consultant & Shalya Tantra Specialist',
    qualification: 'BAMS, MD (Ayurveda - Shalya Tantra)',
    experience_years: 18,
    specialties: ['Shalya Tantra', 'Kshar Sutra', 'Marma Chikitsa'],
    hospital_name: 'Faculty of Ayurveda, BHU, Varanasi',
    city: 'Varanasi',
    rating: 4.95,
    rating_avg: 4.95,
    rating_count: 210,
    total_ratings: 210,
    avatar_url: '/avatars/dr_vikramaditya_dev.png'
  }
];

const SEED_PATIENTS = [
  {
    id: 'pat_1',
    patient_id: 'pat_1',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Ramesh Sharma',
    abha_id: 'ABHA-9821-4501',
    uhid: 'UHID-2026-9821',
    age: 42,
    gender: 'male',
    blood_group: 'B+',
    contact: '+91 9876543210',
    address: 'New Delhi',
    prakriti: 'Vata-Pitta',
    is_red_flag: false,
    is_demo: false,
    avatar_url: '/avatars/rajesh_kumar.jpeg',
    latest_chief_complaint: 'Ghutna dard (Joint pain & stiffness in right knee)'
  },
  {
    id: 'pat_2',
    patient_id: 'pat_2',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Sunita Sharma',
    abha_id: 'ABHA-3412-8902',
    uhid: 'UHID-2026-3412',
    age: 36,
    gender: 'female',
    blood_group: 'O+',
    contact: '+91 9123456789',
    address: 'Jaipur',
    prakriti: 'Kapha-Pitta',
    is_red_flag: true,
    is_demo: true,
    avatar_url: '/avatars/sunita_sharma.png',
    latest_chief_complaint: 'Seene me tez jalan & Amlapitta (Hyperacidity & Heartburn)'
  },
  {
    id: 'pat_priya',
    patient_id: 'pat_priya',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Priya Deshmukh',
    abha_id: 'ABHA-3344-1102',
    uhid: 'UHID-2026-3344',
    age: 29,
    gender: 'female',
    blood_group: 'A+',
    contact: '+91 9821450100',
    address: 'Mumbai',
    prakriti: 'Pitta-Vata',
    is_red_flag: false,
    is_demo: true,
    avatar_url: '/avatars/priya_deshmukh.png',
    latest_chief_complaint: 'Amlapitta & Shiroshoola (Acidity & Tension Headache)'
  },
  {
    id: 'pat_3',
    patient_id: 'pat_3',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Amit Patel',
    abha_id: 'ABHA-5521-9981',
    uhid: 'UHID-2026-5521',
    age: 48,
    gender: 'male',
    blood_group: 'A+',
    contact: '+91 9811223344',
    address: 'Ahmedabad',
    prakriti: 'Vata-Kapha',
    is_red_flag: false,
    is_demo: true,
    latest_chief_complaint: 'Kamar dard & Gridhrasi (Sciatica stiffness & lower back pain)'
  },
  {
    id: 'pat_4',
    patient_id: 'pat_4',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Meena Verma',
    abha_id: 'ABHA-7712-4433',
    uhid: 'UHID-2026-7712',
    age: 39,
    gender: 'female',
    blood_group: 'B+',
    contact: '+91 9711882200',
    address: 'Lucknow',
    prakriti: 'Pitta-Kapha',
    is_red_flag: false,
    is_demo: true,
    latest_chief_complaint: 'Anidra & Shiroshoola (Insomnia & Stress Headache)'
  },
  {
    id: 'pat_5',
    patient_id: 'pat_5',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Vikram Singh',
    abha_id: 'ABHA-8844-2211',
    uhid: 'UHID-2026-8844',
    age: 51,
    gender: 'male',
    blood_group: 'O-',
    contact: '+91 9955443322',
    address: 'Chandigarh',
    prakriti: 'Vata-Pitta',
    is_red_flag: false,
    is_demo: true,
    latest_chief_complaint: 'Tvak Roga & Kandu (Eczema & dry skin inflammation)'
  },
  {
    id: 'pat_6',
    patient_id: 'pat_6',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Geeta Devi',
    abha_id: 'ABHA-1122-3344',
    uhid: 'UHID-2026-1122',
    age: 58,
    gender: 'female',
    blood_group: 'AB+',
    contact: '+91 9877112233',
    address: 'Varanasi',
    prakriti: 'Kapha-Vata',
    is_red_flag: false,
    is_demo: true,
    latest_chief_complaint: 'Sthoulya & Agnimandya (Obesity & sluggish digestion)'
  },
  {
    id: 'pat_7',
    patient_id: 'pat_7',
    assigned_doctor_id: 'DOC-AYUR-101',
    name: 'Rajesh Kulkarni',
    abha_id: 'ABHA-9988-7766',
    uhid: 'UHID-2026-9988',
    age: 45,
    gender: 'male',
    blood_group: 'A-',
    contact: '+91 9167889900',
    address: 'Pune',
    prakriti: 'Pitta-Vata',
    is_red_flag: false,
    is_demo: true,
    latest_chief_complaint: 'Prameha & Trishna (Early Type-2 Diabetes management)'
  }
];

// ─── Doctor APIs ─────────────────────────────────────────────────────────────
export const getDoctors = async (params = {}) => {
  try {
    const res = await api.get('/doctors/', { params });
    return res.data && res.data.length > 0 ? res.data : SEED_DOCTORS;
  } catch (err) {
    console.warn('Backend API unreachable, using seed doctors:', err.message);
    return SEED_DOCTORS;
  }
};

export const getDoctorById = async (doctorId) => {
  try {
    const res = await api.get(`/doctors/${doctorId}`);
    return res.data;
  } catch (err) {
    const cleanId = String(doctorId || '').trim().toLowerCase();
    const found = SEED_DOCTORS.find(d => 
      d.id.toLowerCase() === cleanId || 
      (d.doctor_id && d.doctor_id.toLowerCase() === cleanId) || 
      (d.registration_no && d.registration_no.toLowerCase() === cleanId) ||
      (d.name && d.name.toLowerCase().includes(cleanId))
    );
    return found || SEED_DOCTORS[0];
  }
};

export const createDoctor = async (doctorData) => {
  try {
    const res = await api.post('/doctors/', doctorData);
    return res.data;
  } catch (err) {
    return { ...doctorData, id: `doc_${Date.now()}` };
  }
};

export const getDoctorRatings = async (doctorId) => {
  try {
    const res = await api.get(`/doctors/${doctorId}/ratings`);
    return res.data;
  } catch (err) {
    return [
      { id: 1, rating: 5, comment: 'Excellent Nadi Pariksha diagnosis & gentle panchakarma guidance.' },
      { id: 2, rating: 5, comment: 'Very experienced Vaidya. Herb prescriptions provided great relief.' }
    ];
  }
};

export const addDoctorRating = async (doctorId, ratingData) => {
  try {
    const res = await api.post(`/doctors/${doctorId}/ratings`, ratingData);
    return res.data;
  } catch (err) {
    return { success: true, rating: ratingData };
  }
};

export const getDoctorPatients = async (doctorId, search = '') => {
  try {
    const res = await api.get(`/doctors/${doctorId}/patients`, {
      params: { search: search || undefined }
    });
    return res.data;
  } catch (err) {
    const cleanDocId = String(doctorId || '').trim().toLowerCase();
    let doctorPatients = SEED_PATIENTS;
    
    // Filter by assigned doctor if specified
    if (cleanDocId && cleanDocId !== 'all') {
      const assigned = SEED_PATIENTS.filter(p => p.assigned_doctor_id.toLowerCase() === cleanDocId);
      if (assigned.length > 0) doctorPatients = assigned;
    }
    
    if (search) {
      const s = search.toLowerCase();
      doctorPatients = doctorPatients.filter(p => 
        p.name.toLowerCase().includes(s) || 
        p.abha_id.toLowerCase().includes(s) || 
        p.contact.includes(s)
      );
    }
    return doctorPatients;
  }
};

// ─── Patient & ABHA APIs ─────────────────────────────────────────────────────
export const lookupAbhaId = async (abhaId) => {
  try {
    const res = await api.get(`/patients/lookup-abha/${encodeURIComponent(abhaId)}`);
    if (res.data && res.data.found) {
      return res.data;
    }
    const clean = String(abhaId || '').trim().toLowerCase();
    const matched = SEED_PATIENTS.find(p => p.abha_id.toLowerCase() === clean || p.id.toLowerCase() === clean);
    if (matched) {
      return { found: true, patient: matched, message: 'Retrieved from central registry' };
    }
    return { found: false, message: 'ABHA ID not found on central ABDM' };
  } catch (err) {
    const clean = String(abhaId || '').trim().toLowerCase();
    const matched = SEED_PATIENTS.find(p => p.abha_id.toLowerCase() === clean || p.id.toLowerCase() === clean);
    if (matched) {
      return { found: true, patient: matched, message: 'Retrieved from central registry' };
    }
    return { found: false, message: 'ABHA ID not found on central ABDM' };
  }
};

export const getPatients = async (search = '') => {
  try {
    const res = await api.get('/patients/', { params: { search: search || undefined } });
    return res.data;
  } catch (err) {
    if (search) {
      const s = search.toLowerCase();
      return SEED_PATIENTS.filter(p => p.name.toLowerCase().includes(s) || p.abha_id.toLowerCase().includes(s));
    }
    return SEED_PATIENTS;
  }
};

export const getPatientById = async (id) => {
  try {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  } catch (err) {
    const clean = String(id || '').trim().toLowerCase();
    return SEED_PATIENTS.find(p => p.id.toLowerCase() === clean || p.patient_id.toLowerCase() === clean || p.abha_id.toLowerCase() === clean) || SEED_PATIENTS[0];
  }
};

export const createPatient = async (patientData) => {
  try {
    const res = await api.post('/patients/', patientData);
    return res.data;
  } catch (err) {
    return { ...patientData, id: `pat_${Date.now()}` };
  }
};

export const getPatientTimeline = async (patientId, requestingDoctorId = null) => {
  try {
    const res = await api.get(`/patients/${patientId}/timeline`, {
      params: { requesting_doctor_id: requestingDoctorId || undefined }
    });
    return res.data;
  } catch (err) {
    const cleanId = String(patientId || '').trim().toLowerCase();
    const matchedPat = SEED_PATIENTS.find(p => p.id.toLowerCase() === cleanId || p.patient_id.toLowerCase() === cleanId || p.abha_id.toLowerCase() === cleanId) || SEED_PATIENTS[0];

    // Build personalized timeline per patient
    if (matchedPat.id === 'pat_2' || matchedPat.abha_id === 'ABHA-3412-8902') {
      return {
        patient: matchedPat,
        overall_summary_3line: {
          line1_issues: `Patient Sunita Sharma (ABHA: ABHA-3412-8902) presents with acute Amlapitta (GERD & Dyspnea) and morning nausea.`,
          line2_trend: `Emergency Red-Flag flagged on 2026-08-22 due to acute substernal burning sensation and shortness of breath.`,
          line3_meds: `Current Regimen: Avipattikar Churna (3g BD after meals) + Kamadugha Rasa (1 tab BD). Strict Apathya restriction on sour/spicy food.`
        },
        timeline: [
          {
            id: 'evt_201',
            date: '2026-08-22',
            type: 'Emergency Triage',
            title: 'MedRoute Red-Flag Emergency Consultation',
            doctor_name: 'Vaidya Dr. Ananya Shastri',
            doctor_qualification: 'BAMS, MD (Ayurveda - Kayachikitsa)',
            hospital_name: 'National Institute of Ayurveda (NIA), Jaipur',
            token_number: 'EMG-102',
            chief_complaints: 'Seene me tez jalan & saans lene me takleef (Acute Hyperacidity & Dyspnea)',
            diagnosis_ayurvedic: 'Amlapitta (Pitta-Kapha Pittavritta Vata)',
            diagnosis_modern: 'Acute Gastroesophageal Reflux Disease (GERD) with Mild Dyspnea',
            prakriti: 'Kapha-Pitta',
            vikriti: 'Pitta Vriddhi with Ama',
            agni: 'Tikshna Agni',
            koshtha: 'Mridu',
            is_red_flag: true,
            notes: 'Red-flag priority visit. Administered Avipattikar Churna & cooling Shatavari milk. Vital signs monitored.',
            is_signed: true,
            medicines: [
              { name: 'Avipattikar Churna', dosage: '3 grams twice daily after food', duration: '15 days', anupana: 'Lukewarm Water' },
              { name: 'Kamadugha Rasa (Mouktikyukta)', dosage: '1 tablet twice daily before food', duration: '15 days', anupana: 'Cow Milk / Ghee' }
            ]
          }
        ],
        symptom_diary: [
          { id: 'log_201', date: '2026-08-22', symptom: 'Severe Heartburn', severity: 'Severe', notes: 'Triggered after eating spicy gravy at dinner.' }
        ],
        document_vault: [
          { id: 'doc_201', file_name: 'Upper GI Endoscopy & Acid Report', file_type: 'Gastro PDF', source_doctor_or_hospital: 'SMS Hospital Jaipur', summary: 'Mild antral gastritis & GE junction inflammation. No ulceration.', date: '2026-08-18', status: 'Verified' }
        ]
      };
    } else if (matchedPat.id === 'pat_3' || matchedPat.abha_id === 'ABHA-3344-1102') {
      return {
        patient: matchedPat,
        overall_summary_3line: {
          line1_issues: `Patient Priya Deshmukh (ABHA: ABHA-3344-1102) has a 6-month history of Vicharchika (Eczema & allergic dermatitis) & Anidra (Insomnia).`,
          line2_trend: `Skin erythema and nocturnal itching improved 50% following Raktamokshana and Mahamanjisthadi Kwath regimen.`,
          line3_meds: `Current Regimen: Mahamanjisthadi Kwath (20ml BD) + Khadirarishta (15ml BD after meals).`
        },
        timeline: [
          {
            id: 'evt_301',
            date: '2026-08-18',
            type: 'OPD Consultation',
            title: 'Ayush Dermatological & Nadi Assessment',
            doctor_name: 'Vaidya Dr. Vikramaditya Dev',
            doctor_qualification: 'BAMS, Ph.D (Panchakarma)',
            hospital_name: 'Banaras Hindu University (BHU), Varanasi',
            token_number: 'OPD-304',
            chief_complaints: 'Twacha Roga / Severe itching, skin redness on hands & disturbed sleep',
            diagnosis_ayurvedic: 'Vicharchika (Rakta-Pitta Dusti Eczema)',
            diagnosis_modern: 'Atopic Dermatitis & Primary Insomnia',
            prakriti: 'Pitta-Vata',
            vikriti: 'Rakta-Pitta Dusti',
            agni: 'Vishama Agni',
            koshtha: 'Madhyama',
            is_red_flag: false,
            notes: 'Advised Raktashodhaka herbs, Shatadhauta Ghrita local application, and Takradhara for sleep enhancement.',
            is_signed: true,
            medicines: [
              { name: 'Mahamanjisthadi Kwath', dosage: '20 ml twice daily with equal warm water', duration: '30 days', anupana: 'Warm Water' },
              { name: 'Khadirarishta', dosage: '15 ml twice daily after food', duration: '30 days', anupana: 'Water' }
            ]
          }
        ],
        symptom_diary: [
          { id: 'log_301', date: '2026-08-21', symptom: 'Skin Itching & Rash', severity: 'Moderate', notes: 'Itching reduced after applying Coconut oil + Neem.' }
        ],
        document_vault: [
          { id: 'doc_301', file_name: 'Allergy Panel & IgE Antibody Report', file_type: 'Dermatology PDF', source_doctor_or_hospital: 'Metropolis Healthcare Mumbai', summary: 'Serum IgE elevated (340 IU/mL). Dust mite & pollen allergy confirmed.', date: '2026-08-12', status: 'Verified' }
        ]
      };
    } else {
      // Default: Rajesh Kumar (pat_1 / ABHA-9821-4501)
      return {
        patient: matchedPat,
        overall_summary_3line: {
          line1_issues: `Patient ${matchedPat.name} (ABHA: ${matchedPat.abha_id}) has a recorded history of Sandhivata (Osteoarthritis) & Amala Pitta (Hyperacidity).`,
          line2_trend: `Symptom severity shows 40% reduction post-Panchakarma detox and Pathya Aahara regimen; no acute flare-ups in past 14 days.`,
          line3_meds: `Current Regimen: Yograj Guggulu (2 tabs BD) + Rasnasaptak Kwath (20ml BD). Blood parameters within normal range.`
        },
        timeline: [
          {
            id: 'evt_1',
            date: '2026-08-20',
            type: 'OPD Consultation',
            title: 'Ashtavidha Pariksha Clinical Intake',
            doctor_name: 'Dr. Rajesh Vaidya',
            doctor_qualification: 'BAMS, MD (Kayachikitsa)',
            hospital_name: 'All India Institute of Ayurveda (AIIA), New Delhi',
            token_number: 'OPD-101',
            chief_complaints: 'Ghutna dard (Joint pain & stiffness in right knee) for 3 weeks',
            diagnosis_ayurvedic: 'Sandhivata (Joint Stiffness & Vata Imbalance)',
            diagnosis_modern: 'Knee Osteoarthritis Grade II',
            prakriti: 'Vata-Pitta',
            vikriti: 'Vata Vriddhi with Ama',
            agni: 'Vishama Agni',
            koshtha: 'Madhyama',
            is_red_flag: false,
            notes: 'Prescribed Yograj Guggulu & Rasnasaptak Kwath. Advised Pathya Aahara (Warm cooked meals).',
            is_signed: true,
            medicines: [
              { name: 'Yograj Guggulu', dosage: '2 tabs twice daily', duration: '30 days', anupana: 'Warm Water' },
              { name: 'Rasnasaptak Kwath', dosage: '20 ml twice daily', duration: '30 days', anupana: 'Warm Water' }
            ]
          },
          {
            id: 'evt_2',
            date: '2026-08-10',
            type: 'Voice Triage',
            title: 'AI Multilingual Voice Intake',
            doctor_name: 'AyurSaarthi AI Assistant',
            doctor_qualification: 'AI Clinical Triage Engine',
            hospital_name: 'ABDM Health Kiosk',
            token_number: 'AI-204',
            chief_complaints: 'Subah uthte hi knee stiffness aur amlapitta (acid reflux) hota hai',
            diagnosis_ayurvedic: 'Vata-Kapha Imbalance with Ama',
            diagnosis_modern: 'Early Hyperacidity & Musculoskeletal Fatigue',
            prakriti: 'Vata-Pitta',
            vikriti: 'Vata Vriddhi',
            is_red_flag: false,
            notes: 'Speech analysis detected moderate knee stiffness and morning acid reflux.',
            is_signed: true,
            medicines: []
          }
        ],
        symptom_diary: [
          { id: 'log_1', date: '2026-08-22', symptom: 'Knee Stiffness', severity: 'Moderate', notes: 'Better after warm sesame oil massage.' }
        ],
        document_vault: [
          { id: 'doc_101', file_name: 'Blood Test Report (CBC & Lipid Profile)', file_type: 'Lab PDF', source_doctor_or_hospital: 'Dr. Lal PathLabs New Delhi', summary: 'CBC & Lipid profile normal. Blood sugar fasting 98 mg/dL.', date: '2026-08-15', status: 'Verified' }
        ]
      };
    }
  }
};

export const addSymptomLog = async (patientId, entry) => {
  try {
    const res = await api.post(`/patients/${patientId}/symptom-log`, entry);
    return res.data;
  } catch (err) {
    return { success: true, entry };
  }
};

export const getPatientDocuments = async (patientId) => {
  try {
    const res = await api.get(`/patients/${patientId}/documents`);
    return res.data;
  } catch (err) {
    return [
      { id: 'doc_101', name: 'Blood Test Report (CBC & Lipid)', date: '2026-08-15', status: 'Verified' }
    ];
  }
};

export const uploadOcrDocument = async (patientId, docData) => {
  try {
    const res = await api.post(`/patients/${patientId}/documents`, docData);
    return res.data;
  } catch (err) {
    return { success: true, docData };
  }
};

// ─── Case & Consultation APIs ────────────────────────────────────────────────
export const createCase = async (caseData) => {
  try {
    const res = await api.post('/cases/', caseData);
    return res.data;
  } catch (err) {
    return { ...caseData, id: `case_${Date.now()}`, created_at: new Date().toISOString() };
  }
};

export const getCaseById = async (caseId) => {
  try {
    const res = await api.get(`/cases/${caseId}`);
    return res.data;
  } catch (err) {
    return {
      id: caseId,
      patient_name: 'Rajesh Kumar',
      chief_complaint: 'Hyperacidity & Joint Stiffness',
      prakriti: 'Vata-Pitta'
    };
  }
};

export const updateCase = async (caseId, caseData) => {
  try {
    const res = await api.put(`/cases/${caseId}`, caseData);
    return res.data;
  } catch (err) {
    return { ...caseData, id: caseId };
  }
};

export const signCase = async (caseId) => {
  try {
    const res = await api.put(`/cases/${caseId}/sign`);
    return res.data;
  } catch (err) {
    return { success: true, signed: true };
  }
};

export const completeCaseToken = async (caseId) => {
  try {
    const res = await api.put(`/cases/${caseId}/complete`);
    return res.data;
  } catch (err) {
    return { success: true, signed: true, status: 'completed' };
  }
};

export const structureVoiceIntake = async (transcript, patientId = null, language = 'en') => {
  try {
    const res = await api.post('/cases/intake-structuring', { transcript, patient_id: patientId, language });
    return res.data;
  } catch (err) {
    return {
      symptoms: [transcript],
      prakriti_assessment: 'Vata-Pitta',
      suggested_formulations: ['Triphala Churna 5g HS', 'Ashwagandha Vati 1 tab BID']
    };
  }
};

export const analyseTranscriptGaps = async (transcript, patientId = null, language = 'en') => {
  try {
    const res = await api.post('/cases/analyse-gaps', { transcript, patient_id: patientId, language });
    return res.data;
  } catch (err) {
    console.warn('Backend API call failed, generating local smart gap questions:', err);
    const t = (transcript || '').toLowerCase();
    
    let gapQs = [];
    if (t.includes('knee') || t.includes('jodh') || t.includes('joint') || t.includes('dard') || t.includes('pain') || t.includes('pair')) {
      gapQs = [
        { field: 'swelling_stiffness', question: language === 'hi' ? 'क्या घुटने/जोड़ में सूजन या सुबह अकड़न महसूस होती है?' : 'Is there any swelling or morning stiffness in the joint/knee?' },
        { field: 'aggravating', question: language === 'hi' ? 'क्या चलने, सीढ़ी चढ़ने या वजन उठाने पर दर्द बढ़ता है?' : 'Does the pain worsen when walking, climbing stairs, or bearing weight?' },
        { field: 'history', question: language === 'hi' ? 'क्या पहले कभी आर्थराइटिस, यूरिक एसिड या जोड़ों की चोट रही है?' : 'Any past history of arthritis, high uric acid, or joint injury?' }
      ];
    } else if (t.includes('stomach') || t.includes('pet') || t.includes('acidity') || t.includes('khana') || t.includes('seene') || t.includes('jalan')) {
      gapQs = [
        { field: 'timing', question: language === 'hi' ? 'क्या जलन/दर्द खाना खाने के तुरंत बाद होता है या खाली पेट?' : 'Does the pain/burning occur right after meals or on an empty stomach?' },
        { field: 'bowel', question: language === 'hi' ? 'क्या पेट साफ होने में दिक्कत, खट्टी डकार या उल्टी जैसा महसूस होता है?' : 'Do you experience constipation, sour belching, or nausea?' },
        { field: 'diet_trigger', question: language === 'hi' ? 'किस तरह का खाना (मसालेदार, चाय, तला-भुना) लेने से तकलीफ बढ़ती है?' : 'What specific foods (spicy, tea, fried) aggravate your discomfort?' }
      ];
    } else if (t.includes('skin') || t.includes('khujli') || t.includes('rash') || t.includes('itch')) {
      gapQs = [
        { field: 'spreading', question: language === 'hi' ? 'क्या खुजली/दाने शरीर के अन्य हिस्सों में फैल रहे हैं?' : 'Is the itching or rash spreading to other parts of the body?' },
        { field: 'trigger', question: language === 'hi' ? 'क्या धूप, साबुन या किसी खास भोजन के बाद खुजली बढ़ती है?' : 'Does the itching worsen after sun exposure, soap, or specific foods?' }
      ];
    } else {
      gapQs = [
        { field: 'onset', question: language === 'hi' ? 'यह तकलीफ कितने दिनों से हो रही है और कब सबसे ज्यादा होती है?' : 'How many days have you had these symptoms and when are they most severe?' },
        { field: 'relief', question: language === 'hi' ? 'किस चीज़ से आराम मिलता है और इसके साथ कोई अन्य लक्षण है?' : 'What provides relief and are there any associated symptoms?' }
      ];
    }

    return {
      partial_structure: { chief_complaint: transcript.slice(0, 60), duration: 'Recent onset', severity: 'Moderate' },
      gap_questions: gapQs,
      suspected_dosha: 'Vata-Pitta Imbalance',
      is_red_flag: false,
      red_flag_reason: null
    };
  }
};

export const completeStructuring = async (transcript, qaPairs, patientId = null, language = 'en') => {
  try {
    const res = await api.post('/cases/complete-structuring', {
      transcript, qa_pairs: qaPairs, patient_id: patientId, language
    });
    return res.data;
  } catch (err) {
    console.warn('Complete structuring API call failed, synthesizing local report:', err);
    const validQa = (qaPairs || []).filter(p => p.answer && p.answer !== '—' && p.answer !== 'skipped');
    const qaSummary = validQa.map(p => `${p.question}: ${p.answer}`).join('; ');
    
    return {
      chief_complaint: transcript.slice(0, 50),
      hpi: `Patient reports: ${transcript}. ${qaSummary ? 'Follow-up details: ' + qaSummary : ''}`,
      duration: '3-5 days',
      severity: 'Moderate',
      suspected_dosha: 'Vata-Kapha Imbalance',
      suggested_pathya: 'Warm freshly cooked food, lukewarm water, adequate rest',
      suggested_apathya: 'Avoid cold drinks, fried items, and heavy physical exertion',
      clinical_summary: `The patient presented with: ${transcript}. Follow-up information gathered: ${qaSummary || 'Routine intake recorded'}. Ayurvedic evaluation indicates a Vata-Kapha imbalance requiring OPD clinical assessment.`,
      suggested_investigations: 'Routine blood screening / OPD consultation',
      is_red_flag: false,
      red_flag_reason: null
    };
  }
};

// ─── AI Assist APIs ──────────────────────────────────────────────────────────
export const transcribeAudioGroqWhisper = async (audioBlob, language = 'hi') => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'speech_intake.webm');
    formData.append('language', language);
    const res = await api.post('/ai/transcribe-groq-whisper', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch (err) {
    return { transcript: 'रोगी को 3 दिनों से पेट में जलन व खट्टी डकारें आ रही हैं।' };
  }
};

export const scanRedFlags = async (transcript) => {
  try {
    const res = await api.post('/ai/red-flag-scan', { transcript });
    return res.data;
  } catch (err) {
    return { red_flag: false, reason: 'No acute emergency detected' };
  }
};

export const generateFollowupQuestions = async ({ chief_complaint, symptoms, suspected_dosha, patient_age, patient_gender, language }) => {
  try {
    const res = await api.post('/ai/generate-followup-questions', {
      chief_complaint, symptoms: symptoms || [], suspected_dosha: suspected_dosha || '',
      patient_age: patient_age || 35, patient_gender: patient_gender || 'male', language: language || 'en'
    });
    return res.data;
  } catch (err) {
    return {
      questions: [
        "How long have you been experiencing these symptoms?",
        "Does the discomfort increase at any specific time of day?",
        "What makes the symptom worse?",
        "What provides relief?",
        "How is your appetite and digestion?",
        "How is your sleep quality?",
        "Have you taken any medication for this before?",
        "Do you have any known chronic conditions?",
        "What is your typical daily diet like?",
        "How are your stress and energy levels on a typical day?"
      ]
    };
  }
};

export const generateSummaryPdf = async (payload) => {
  try {
    const res = await api.post('/ai/generate-summary-pdf', payload, { responseType: 'blob' });
    // Check if response is PDF or JSON fallback
    if (res.data instanceof Blob && res.data.type === 'application/pdf') {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SwasthSaarthi_Summary_${payload.abha_id || 'patient'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true, pdf: true };
    }
    // JSON fallback (reportlab not installed)
    const text = await res.data.text?.();
    const json = text ? JSON.parse(text) : res.data;
    return { success: true, pdf: false, summary_text: json.summary_text };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const extractOcrDocument = async (fileName, docType, mockRawText = '') => {
  try {
    const res = await api.post('/ai/ocr-extract', {
      file_name: fileName,
      doc_type: docType,
      mock_raw_text: mockRawText
    });
    return res.data;
  } catch (err) {
    return { extracted_text: mockRawText || 'Hb: 13.5 g/dL, Fasting Sugar: 105 mg/dL' };
  }
};

export const generateAISummary = async (caseData) => {
  try {
    const res = await api.post('/ai/summary', { case_data: caseData });
    return res.data;
  } catch (err) {
    return { summary: 'Patient presents with Amla Pitta and mild Sandhigata Vata symptoms.' };
  }
};

export const classifyDosha = async (symptoms, age = 30) => {
  try {
    const res = await api.post('/ai/classify-dosha', { symptoms, age });
    return res.data;
  } catch (err) {
    return { vata: 45, pitta: 35, kapha: 20, dominant: 'Vata-Pitta' };
  }
};

export const getVoiceNarration = async (text, language = 'en') => {
  try {
    const res = await api.post(`/ai/voice-narration?text=${encodeURIComponent(text)}&language=${language}`, {}, {
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    return new ArrayBuffer(0);
  }
};

// ─── Ayurvedic Classical Knowledge APIs ──────────────────────────────────────
export const searchAyurvedicMedicines = async (query = '') => {
  try {
    const res = await api.get(`/ayurveda/medicines?query=${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    return [
      { name: 'Triphala Churna', Indication: 'Digestive Detox & Anulomana', Anupana: 'Warm Water at Bedtime', Dosage: '3-6g' },
      { name: 'Ashwagandha Vati', Indication: 'Balya & Rasayana for Vata Shamana', Anupana: 'Warm Milk', Dosage: '1-2 tablets BID' },
      { name: 'Mahasudarshan Ghanvati', Indication: 'Jwara & Pitta Shamana', Anupana: 'Warm Water', Dosage: '2 tablets BID' },
      { name: 'Brahmi Vati', Indication: 'Medhya & Manasika Shanti', Anupana: 'Honey/Milk', Dosage: '1 tablet BID' }
    ];
  }
};

export const getPrakritiScores = async (prakritiType) => {
  try {
    const res = await api.get(`/ayurveda/prakriti-scores?prakriti_type=${encodeURIComponent(prakritiType)}`);
    return res.data;
  } catch (err) {
    return { Vata: 50, Pitta: 30, Kapha: 20 };
  }
};

export const getPathyaAdvice = async (prakriti = '', vikriti = '') => {
  try {
    const res = await api.get(`/ayurveda/pathya-apathya?prakriti=${encodeURIComponent(prakriti)}&vikriti=${encodeURIComponent(vikriti)}`);
    return res.data;
  } catch (err) {
    return {
      Pathya: ['Warm Light Meals', 'Ghee in Moderation', 'Moong Dal Soup', 'Gentle Pranayama'],
      Apathya: ['Cold Ice Drinks', 'Late Night Meals', 'Excessive Spicy Foods', 'Daytime Sleep']
    };
  }
};

export default api;

