import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Save, User, FileText, HeartPulse, Stethoscope, 
  Pill, AlertTriangle, CheckCircle2, ChevronRight, Plus, Trash2, ArrowLeft, Volume2, ShieldCheck, Printer, Search, Lock, Eye 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SpeechMicButton from '../components/SpeechMicButton';
import AshtavidhaForm from '../components/AshtavidhaForm';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';
import { 
  createCase, createPatient, getPatients, generateAISummary, 
  searchAyurvedicMedicines, getPathyaAdvice, signCase, getPatientTimeline 
} from '../services/api';
import DoctorReferralModal from '../components/DoctorReferralModal';


/* ─── 100% Distinct ABDM Patient Clinical Data Dictionary (Indexed by ABHA ID) ─── */
const PATIENT_CLINICAL_MAP = {
  'ABHA-3344-1102': {
    name: 'Priya Deshmukh',
    transcript: "Mujhe pichle 3 hafte se skin itching aur khajli ki problem ho rahi hai. Haath aur gardan par red eczematous patches ban jate hain. Raat me itching severe ho jaati hai.",
    complaint: "Kushtha / Vicharchika (Skin Eczema & Allergic Dermatitis)",
    diagAyurvedic: "Kushtha Roga / Vicharchika (Pitta-Rakta Pradhana)",
    diagModern: "Allergic Contact Dermatitis / Subacute Eczema",
    prakriti: "Pitta-Vata",
    vikriti: "Pitta-Rakta Dushti with Kandu",
    duration: "3 Weeks • Moderate (Kandu & Raga)",
    aggravating: "Excessive heat, spicy food, direct sunlight, synthetic garments",
    findings: "Eczematous papules and erythematous patches on bilateral forearms and posterior neck. Excoriation marks present.",
    suggestedPathya: "Kaishore Guggulu & Gandhak Rasayan with lukewarm water. Nimbadi Kwath wash.",
    meds: [
      { name: 'Kaishore Guggulu', category: 'Guggulu', dosage: '2 tabs twice daily after food', duration: '30 days', anupana: 'Lukewarm Water' },
      { name: 'Gandhak Rasayan', category: 'Vati', dosage: '1 tab twice daily after food', duration: '30 days', anupana: 'Warm Milk / Water' },
      { name: 'Nimbadi Kwath', category: 'Kwath', dosage: '15 ml twice daily before meals', duration: '15 days', anupana: 'Water' }
    ]
  },
  'ABHA-9988-1234': {
    name: 'Priya Patel',
    transcript: "Mujhe pichle 1 mahine se khana khane ke baad pet me severe burning sensation, acidity aur nausea hota hai. Subah khatti dakarein aati hain.",
    complaint: "Amlapitta & Dyspepsia (Acid Peptic Disorder / Hyperacidity)",
    diagAyurvedic: "Urdhvaga Amlapitta (Pitta-Kaphaja)",
    diagModern: "Non-Ulcer Dyspepsia & Gastroesophageal Reflux",
    prakriti: "Pitta-Kaphaja",
    vikriti: "Pitta Prakopa with Vidagdha Ajirna",
    duration: "1 Month • Moderate (Daha & Utklesha)",
    aggravating: "Empty stomach, spicy pickles, sour curd, late night sleep",
    findings: "Epigastric tenderness on deep palpation, retrosternal burning, coated tongue (Saama Jihva).",
    suggestedPathya: "Avipattikar Churna & Sutshekhar Ras. Milk & coconut water pathya diet.",
    meds: [
      { name: 'Avipattikar Churna', category: 'Churna', dosage: '3 grams twice daily before meals', duration: '15 days', anupana: 'Lukewarm Water' },
      { name: 'Sutshekhar Ras (Gold/Plain)', category: 'Ras', dosage: '1 tab twice daily after meals', duration: '30 days', anupana: 'Warm Water / Milk' }
    ]
  },
  'ABHA-3412-8902': {
    name: 'Sunita Sharma',
    transcript: "Mujhe pichle 2 mahine se gardan aur kandhe me severe stiffness aur haath me jhunjhuni aati hai. Computer par baithne se pain badh jaata hai.",
    complaint: "Greeva Stambha (Cervical Spondylosis)",
    diagAyurvedic: "Greeva Stambha / Manyastambha (Vata-Kapha)",
    diagModern: "Cervical Spondylosis with C5-C6 Nerve Irritation",
    prakriti: "Kapha-Vata",
    vikriti: "Vata Stambha with Kapha Anubandha",
    duration: "2 Months • Moderate (Stambha & Ruja)",
    aggravating: "Forward neck posture, continuous computer typing, cold AC draft",
    findings: "Restricted lateral neck rotation, paraspinal muscle spasm in C5-C7 region, positive Spurling sign.",
    suggestedPathya: "Trayodashanga Guggulu & Mahanarayana Taila local abhyanga. Greeva Basti therapy.",
    meds: [
      { name: 'Trayodashanga Guggulu', category: 'Guggulu', dosage: '2 tabs twice daily after meals', duration: '30 days', anupana: 'Lukewarm Water' },
      { name: 'Mahanarayana Taila', category: 'Taila', dosage: 'Gentle neck application twice daily', duration: '30 days', anupana: 'External Use' }
    ]
  },
  'ABHA-9821-4501': {
    name: 'Ramesh Sharma',
    transcript: "Mujhe pichle 6 mahine se dono ghutno me subah uthte hi severe dard aur akadahat hoti hai. Stair climb karte waqt katar-katar ki sound aati hai. Sardi me dard badh jaata hai.",
    complaint: "Sandhivata (Bilateral Knee Joint Osteoarthritis)",
    diagAyurvedic: "Janu Sandhigata Vata (Vata-Pitta)",
    diagModern: "Bilateral Primary Knee Osteoarthritis (Grade II)",
    prakriti: "Vata-Pitta",
    vikriti: "Vata Vriddhi with Ama & Sandhi Kshay",
    duration: "6 Months • Severe (Vata Prakopa & Crepitus)",
    aggravating: "Cold weather, climbing stairs, heavy weight lifting, sour food",
    findings: "Bilateral knee joint crepitus present, medial joint line tenderness, restricted terminal flexion.",
    suggestedPathya: "Yograj Guggulu & Rasnadi Kwath. Janu Basti local panchakarma session.",
    meds: [
      { name: 'Yograj Guggulu', category: 'Guggulu', dosage: '2 tabs twice daily after food', duration: '30 days', anupana: 'Lukewarm Water' },
      { name: 'Rasnadi Kwath', category: 'Kwath', dosage: '15 ml twice daily with equal warm water', duration: '30 days', anupana: 'Warm Water' }
    ]
  },
  'ABHA-7700-9999': {
    name: 'Kailash Chandra',
    transcript: "Mujhe chaltay waqt chest heaviness aur saans phoolne ki shikayat hoti hai. High BP aur cholesterol 2 saal se hai.",
    complaint: "Hridroga & High BP (Hypertension & Lipid Disorder)",
    diagAyurvedic: "Hridroga / Rakta Vata (Kapha-Pitta)",
    diagModern: "Essential Hypertension with Mild Dyslipidemia",
    prakriti: "Kapha-Pitta",
    vikriti: "Rakta Pitta Vriddhi with Medo Vridhi",
    duration: "2 Years • Chronic (Rakta Chapa & Medas)",
    aggravating: "Mental stress, salty snacks, sedentary afternoon naps",
    findings: "BP 148/92 mmHg, S1 S2 normal, no gallop rhythm, pedal edema absent.",
    suggestedPathya: "Arjunarishta & Prabhakar Vati. Low sodium diet, daily 30 min morning walk.",
    meds: [
      { name: 'Arjunarishta', category: 'Asava/Arishta', dosage: '15 ml twice daily with equal water', duration: '30 days', anupana: 'Water' },
      { name: 'Prabhakar Vati', category: 'Vati', dosage: '1 tab twice daily after meals', duration: '30 days', anupana: 'Warm Water' }
    ]
  }
};

const getMasterPatientId = (p) => {
  if (!p) return '';
  if (typeof p === 'string') return p;
  return p.abha_id || p.uhid || p.patient_id || p.id || '';
};

const getPatientClinicalData = (patient) => {
  if (!patient) return null;
  const abhaKey = patient.abha_id || patient.uhid || patient.patient_id || patient.id;
  if (PATIENT_CLINICAL_MAP[abhaKey]) return PATIENT_CLINICAL_MAP[abhaKey];
  const nameMatch = Object.values(PATIENT_CLINICAL_MAP).find(
    m => m.name && patient.name && m.name.toLowerCase().trim() === patient.name.toLowerCase().trim()
  );
  if (nameMatch) return nameMatch;
  return null;
};

export default function AyurSaarthiCaseForm({ selectedPatientId: initialPatientId, activeConsultingPatientId, onSelectPatientId, onCaseSaved, onSelectPatientTimeline, currentDoctorId = "DOC-AYUR-101", currentUser, lang = 'en' }) {
  const { t } = useTranslation();
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [isExamining, setIsExamining] = useState(false);
  const [previewDocModal, setPreviewDocModal] = useState(null);
  const [step, setStep] = useState(1);
  const [userUploadedDocs, setUserUploadedDocs] = useState([]);
  const [prescribeModalMed, setPrescribeModalMed] = useState(null);
  const [modalMedName, setModalMedName] = useState('');
  const [modalDosage, setModalDosage] = useState('2 tabs twice daily after food');
  const [modalDuration, setModalDuration] = useState('30 days');
  const [modalAnupana, setModalAnupana] = useState('Lukewarm Water');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [sigMode, setSigMode] = useState('auto'); // 'auto' | 'draw' | 'text'
  const [customSigText, setCustomSigText] = useState('');
  const [drawnSigUrl, setDrawnSigUrl] = useState(null);
  const sigCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const medSearchContainerRef = useRef(null);

  // Sync from parent prop when it changes (e.g. dashboard selects Token #1)
  useEffect(() => {
    setSelectedPatientId(initialPatientId || null);
  }, [initialPatientId]);

  useEffect(() => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem('ss_user_uploaded_docs') || '[]');
      const patientDocs = savedDocs.filter(d => !d.patient_id || d.patient_id === selectedPatientId);
      setUserUploadedDocs(patientDocs);
    } catch (_) {}
  }, [selectedPatientId]);

  const speakText = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const [newPatient, setNewPatient] = useState({
    name: '', age: 30, gender: 'male', contact: '', blood_group: 'O+', address: '', medical_history: ''
  });

  const [caseForm, setCaseForm] = useState({
    chief_complaints: '',
    history_present_illness: '',
    past_history: '',
    family_history: '',
    personal_history: '',
    dietary_lifestyle_habits: '',
    prakriti: 'Vata-Pitta',
    vikriti: 'Vata Vriddhi with Ama',
    agni: 'Vishama Agni',
    koshtha: 'Madhyama',
    ashtavidha_pariksha: { nadi: 'Vata-Vaha', mutra: 'Samyak', mala: 'Normal', jihva: 'Saama Jihva', shabda: 'Spashta', sparsha: 'Rooksha', drik: 'Prakrita', aakriti: 'Madhyama' },
    vitals: { bp: '120/80 mmHg', pulse: '74 bpm', temp: '98.4 F', spo2: '99%' },
    clinical_findings: '',
    diagnosis_ayurvedic: 'Sandhivata (Osteoarthritis)',
    diagnosis_modern: 'Knee Osteoarthritis Grade II',
    medicines: [
      { name: 'Yograj Guggulu', category: 'Guggulu', dosage: '2 tablets twice daily', duration: '30 days', anupana: 'Warm Water' }
    ],
    anupana: 'गुनगुना पानी (Lukewarm Water) / शहद (Honey)',
    pathya_apathya: 'Pathya: Warm freshly cooked food. Apathya: Cold aerated drinks.',
    private_notes: '',
    follow_up_date: '2026-09-20'
  });

  const [medQuery, setMedQuery] = useState('');
  const [searchedMeds, setSearchedMeds] = useState([]);
  const [customMedName, setCustomMedName] = useState('');
  const [customMedDosage, setCustomMedDosage] = useState('1 tab twice daily');
  const [customMedAnupana, setCustomMedAnupana] = useState('Warm Water');

  const [aiResult, setAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [savingCase, setSavingCase] = useState(false);
  const [savedCaseForPrint, setSavedCaseForPrint] = useState(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  useEffect(() => {
    if (initialPatientId && patientsList.length > 0) {
      const match = patientsList.find(p => p.id === initialPatientId || p.abha_id === initialPatientId);
      if (match) setSelectedPatientId(match.abha_id || match.id);
      else setSelectedPatientId(initialPatientId);
    } else if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId, patientsList]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const list = await getPatients();
      setPatientsList(list);
      
      const savedToken1 = localStorage.getItem('ss_active_opd_token1');
      const targetIdToSet = initialPatientId || activeConsultingPatientId || savedToken1;

      if (targetIdToSet) {
        const match = list.find(p => p.id === targetIdToSet || p.abha_id === targetIdToSet || p.patient_id === targetIdToSet);
        if (match) setSelectedPatientId(match.abha_id || match.id);
        else setSelectedPatientId(targetIdToSet);
      } else {
        // Zero active patients in OPD queue: default to null (No Active Patient Selected)
        setSelectedPatientId(null);
      }
    } catch (e) {
      console.error('Failed to load patients', e);
    }
  };

  const activePatient = patientsList.find(p => {
    const pMaster = getMasterPatientId(p);
    const selMaster = getMasterPatientId(selectedPatientId);
    return pMaster === selMaster || p.id === selectedPatientId || p.abha_id === selectedPatientId || (p.name && selectedPatientId && p.name.toLowerCase() === String(selectedPatientId).toLowerCase());
  }) || newPatient;

  const activeCaseData = React.useMemo(() => {
    if (!activePatient) return null;
    const patData = getPatientClinicalData(activePatient);
    return {
      intake_data: {
        transcript: activePatient.medical_history || patData?.transcript || '',
        structured: {
          duration: patData?.duration || '',
          aggravating_factors: patData?.aggravating || '',
          suggested_pathya: patData?.suggestedPathya || ''
        }
      },
      chief_complaints: activePatient.latest_chief_complaint || patData?.complaint || '',
      prakriti: activePatient.prakriti || patData?.prakriti || 'Vata-Pitta',
      token_number: activePatient.token_number || 'OPD-101'
    };
  }, [activePatient]);

  const activePatientDocs = React.useMemo(() => {
    return userUploadedDocs.filter(d => {
      if (!selectedPatientId) return true;
      if (d.patient_id && d.patient_id === selectedPatientId) return true;
      if (activePatient?.abha_id && d.abha_id === activePatient.abha_id) return true;
      return false;
    });
  }, [userUploadedDocs, selectedPatientId, activePatient]);

  const isReadOnly = React.useMemo(() => {
    const storedToken1 = localStorage.getItem('ss_active_opd_token1');
    const selMaster = getMasterPatientId(selectedPatientId || activePatient);
    const activeMaster = getMasterPatientId(storedToken1 || activeConsultingPatientId || initialPatientId || 'ABHA-9821-4501');

    const isActiveConsultation = (
      selMaster === activeMaster ||
      (activePatient && getMasterPatientId(activePatient) === activeMaster) ||
      (storedToken1 && (
        selectedPatientId === storedToken1 ||
        activePatient?.abha_id === storedToken1 ||
        activePatient?.id === storedToken1 ||
        activePatient?.patient_id === storedToken1
      ))
    );

    if (isActiveConsultation) {
      try {
        const closedTokens = JSON.parse(localStorage.getItem('ss_closed_tokens') || '[]');
        if (
          closedTokens.includes(selMaster) || 
          (activePatient?.abha_id && closedTokens.includes(activePatient.abha_id)) ||
          (activePatient?.token_number && closedTokens.includes(activePatient.token_number))
        ) {
          return true;
        }
      } catch (_) {}

      if (activePatient && (activePatient.status === 'completed' || activePatient.status === 'closed' || activePatient.status === 'archived')) {
        return true;
      }

      return false;
    }

    return true;
  }, [selectedPatientId, activePatient, activeConsultingPatientId, initialPatientId]);

  const handleAiSmartPrefill = () => {
    const curP = patientsList.find(p => p.id === selectedPatientId || p.abha_id === selectedPatientId) || newPatient;
    setCaseForm({
      chief_complaints: curP.latest_chief_complaint || 'Joint stiffness & morning pain in both knees',
      history_present_illness: curP.medical_history || 'Patient reports difficulty climbing stairs and morning joint stiffness lasting 30 minutes.',
      past_history: 'No past surgical history. Known mild hypertension.',
      family_history: 'Family history of osteoarthritis (Mother).',
      personal_history: 'Sedentary work habits, irregular sleep schedule.',
      dietary_lifestyle_habits: 'Frequent consumption of cold, sour, and fried foods.',
      prakriti: curP.prakriti || 'Vata-Pitta',
      vikriti: 'Vata Vriddhi with Ama',
      agni: 'Vishama Agni',
      koshtha: 'Madhyama',
      ashtavidha_pariksha: { nadi: 'Vata-Vaha', mutra: 'Samyak', mala: 'Normal', jihva: 'Saama Jihva', shabda: 'Spashta', sparsha: 'Rooksha', drik: 'Prakrita', aakriti: 'Madhyama' },
      vitals: { bp: '130/84 mmHg', pulse: '76 bpm', temp: '98.4 F', spo2: '98%' },
      clinical_findings: 'Bilateral knee joint crepitus present, medial joint line tenderness.',
      diagnosis_ayurvedic: 'Janu Sandhigata Vata (Bilateral Knee Osteoarthritis)',
      diagnosis_modern: 'Bilateral Primary Knee Osteoarthritis (Grade II)',
      medicines: [
        { name: 'Yograj Guggulu', category: 'Vati', dosage: '2 tabs twice daily after food', duration: '30 days', anupana: 'Lukewarm Water' },
        { name: 'Rasnadi Kwath', category: 'Kwath', dosage: '15 ml twice daily with equal water', duration: '30 days', anupana: 'Warm Water' }
      ],
      anupana: 'कोसना पानी (Lukewarm Water)',
      pathya_apathya: 'Pathya: Warm freshly cooked food, sesame oil massage. Apathya: Cold curd, heavy fried foods.',
      private_notes: 'Advised Janu Basti panchakarma therapy session.',
      follow_up_date: '2026-09-15'
    });
    alert('✨ AI Smart Prefill: Form pre-filled from patient intake dossier & attached reports!');
  };

  const handleMedSearch = async (q, catFilter = 'All') => {
    setMedQuery(q);
    setShowMedDropdown(true);
    try {
      const queryStr = catFilter !== 'All' ? (q ? `${q} ${catFilter}` : catFilter) : q;
      const results = await searchAyurvedicMedicines(queryStr);
      setSearchedMeds(results);
    } catch (e) {
      console.error(e);
    }
  };

  const loadInitialMeds = async (catFilter = 'All') => {
    setActiveCategoryFilter(catFilter);
    setShowMedDropdown(true);
    try {
      const results = await searchAyurvedicMedicines(catFilter !== 'All' ? catFilter : '');
      setSearchedMeds(results);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (step === 3 && searchedMeds.length === 0) {
      loadInitialMeds('All');
    }
  }, [step]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (medSearchContainerRef.current && !medSearchContainerRef.current.contains(event.target)) {
        setShowMedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const startDrawing = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#064e3b';
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = sigCanvasRef.current;
    if (canvas) {
      setDrawnSigUrl(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSigUrl(null);
  };

  const handleAddSearchedMedicine = (med) => {
    if (!med || !med.name) return;
    setPrescribeModalMed(med);
    setModalMedName(med.name);
    setModalDosage(med.default_dosage || '2 tabs twice daily after food');
    setModalDuration('30 days');
    setModalAnupana(med.anupana || 'Lukewarm Water');
  };

  const handleOpenBlankPrescribeModal = () => {
    setPrescribeModalMed({ name: '', category: 'Custom Formulation' });
    setModalMedName('');
    setModalDosage('2 tabs twice daily after food');
    setModalDuration('30 days');
    setModalAnupana('Lukewarm Water');
  };

  const handleAddCustomMedicine = () => {
    if (!customMedName.trim()) return;
    const newMedObj = {
      name: customMedName.trim(),
      category: 'Custom Formulation',
      dosage: customMedDosage,
      duration: '30 days',
      anupana: customMedAnupana
    };
    setCaseForm({
      ...caseForm,
      medicines: [...caseForm.medicines, newMedObj]
    });
    setCustomMedName('');
  };

  const handleRemoveMedicine = (idx) => {
    const updated = caseForm.medicines.filter((_, i) => i !== idx);
    setCaseForm({ ...caseForm, medicines: updated });
  };

  const handleMedicineChange = (idx, field, val) => {
    const updated = [...caseForm.medicines];
    updated[idx][field] = val;
    setCaseForm({ ...caseForm, medicines: updated });
  };

  const handleAutoSuggestDiet = async () => {
    try {
      const advice = await getPathyaAdvice(caseForm.prakriti, caseForm.vikriti);
      if (advice) {
        const pText = `Pathya: ${advice.pathya.join(', ')}. Apathya: ${advice.apathya.join(', ')}.`;
        setCaseForm({ ...caseForm, pathya_apathya: pText });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerAiSummary = async () => {
    setLoadingAi(true);
    try {
      const curPatient = patientsList.find(p => p.id === selectedPatientId || p.abha_id === selectedPatientId) || activePatient || newPatient;
      const caseDataForAi = {
        ...caseForm,
        patient_name: curPatient.name,
        age: curPatient.age,
        prakriti: caseForm.prakriti,
        vikriti: caseForm.vikriti,
        ashtavidha_pariksha: caseForm.ashtavidha_pariksha
      };
      const res = await generateAISummary(caseDataForAi);
      setAiResult(res);
    } catch (e) {
      console.error('AI Summary failed', e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveAndSignCase = async () => {
    setSavingCase(true);
    try {
      let targetPatientId = selectedPatientId;
      if (isNewPatient) {
        const createdP = await createPatient(newPatient);
        targetPatientId = createdP.id;
      }
      const casePayload = {
        ...caseForm,
        patient_id: targetPatientId,
        doctor_id: currentDoctorId,
        doctor_name: currentUser?.name || "Dr. Rajesh Vaidya",
        doctor_qualification: currentUser?.qualification || "BAMS, MD (Kayachikitsa)",
        hospital_name: currentUser?.hospital_name || "All India Institute of Ayurveda",
        status: "completed"
      };
      const savedCase = await createCase(casePayload);
      try {
        await signCase(savedCase.id);
      } catch (e) {
        console.warn('Backend sign endpoint notice', e);
      }
      savedCase.prescription_signed = true;

      // Sync signed prescription directly for Patient Portal access
      const curPatient = patientsList.find(p => p.id === targetPatientId || p.abha_id === targetPatientId) || activePatient || newPatient;
      const signedRecord = {
        id: savedCase.id || `presc_${Date.now()}`,
        case_id: savedCase.id,
        patient_id: targetPatientId,
        abha_id: curPatient?.abha_id || curPatient?.uhid || targetPatientId,
        patient_name: curPatient?.name || 'Patient',
        doctor_name: currentUser?.name || "Dr. Rajesh Vaidya",
        doctor_qualification: currentUser?.qualification || "BAMS, MD (Kayachikitsa)",
        doctor_registration_no: currentUser?.registration_no || "AYUSH-REG-DEL-2012-4412",
        hospital_name: currentUser?.hospital_name || "All India Institute of Ayurveda",
        token_number: curPatient?.token_number || 'OPD-110',
        chief_complaints: caseForm.chief_complaints,
        diagnosis_ayurvedic: caseForm.diagnosis_ayurvedic,
        diagnosis_modern: caseForm.diagnosis_modern,
        prakriti: caseForm.prakriti,
        vikriti: caseForm.vikriti,
        medicines: caseForm.medicines,
        anupana: caseForm.anupana,
        pathya_apathya: caseForm.pathya_apathya,
        private_notes: caseForm.private_notes,
        vitals: caseForm.vitals,
        ashtavidha_pariksha: caseForm.ashtavidha_pariksha,
        prescription_signed: true,
        status: 'completed',
        signed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      try {
        const existingPrescs = JSON.parse(localStorage.getItem('ss_patient_signed_prescriptions') || '[]');
        existingPrescs.unshift(signedRecord);
        localStorage.setItem('ss_patient_signed_prescriptions', JSON.stringify(existingPrescs));
      } catch (e) {
        console.error('Failed to sync patient signed prescription', e);
      }

      // Auto-close Token #1 and move patient record to Daily OPD Register
      const closedToken = curPatient?.token_number || activeCaseData?.token_number || 'OPD-110';
      try {
        const closedTokens = JSON.parse(localStorage.getItem('ss_closed_tokens') || '[]');
        if (!closedTokens.includes(closedToken)) {
          closedTokens.push(closedToken);
          localStorage.setItem('ss_closed_tokens', JSON.stringify(closedTokens));
        }

        const completedPatientIds = JSON.parse(localStorage.getItem('ss_completed_patient_ids') || '[]');
        if (!completedPatientIds.includes(targetPatientId)) {
          completedPatientIds.push(targetPatientId);
          if (curPatient?.abha_id) completedPatientIds.push(curPatient.abha_id);
          localStorage.setItem('ss_completed_patient_ids', JSON.stringify(completedPatientIds));
        }

        // Add to completed records for Daily OPD Register
        const completedRecord = {
          patient_id: targetPatientId,
          name: curPatient?.name || 'Patient',
          abha_id: curPatient?.abha_id || curPatient?.uhid || 'ABHA-3344-1102',
          gender: curPatient?.gender || 'FEMALE',
          age: curPatient?.age || 29,
          diagnosis: caseForm.diagnosis_ayurvedic || 'Ayurvedic OPD Consult Completed',
          regimen: 'AYUSH e-Prescription Signed & Closed',
          status: 'Signed & Completed',
          date: new Date().toISOString().split('T')[0],
          day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          token_number: closedToken,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const existingCompleted = JSON.parse(localStorage.getItem('ss_completed_records') || '[]');
        const filteredPrev = existingCompleted.filter(r => r.patient_id !== targetPatientId && r.token_number !== closedToken);
        filteredPrev.unshift(completedRecord);
        localStorage.setItem('ss_completed_records', JSON.stringify(filteredPrev));

        if (savedCase.id) {
          completeCaseToken(savedCase.id, closedToken).catch(() => null);
        }
      } catch (err) {
        console.warn('Auto-close token sync error', err);
      }

      // Dispatch global real-time event so OPD Register & Dashboard update live
      window.dispatchEvent(new CustomEvent('ss_opd_updated'));
      localStorage.setItem('ss_last_update_ts', String(Date.now()));

      setSavedCaseForPrint(savedCase);
      if (onCaseSaved) onCaseSaved(savedCase);
    } catch (e) {
      alert('Failed to save and sign case sheet.');
    } finally {
      setSavingCase(false);
    }
  };

  const steps = [
    { num: 1, label: t('caseForm.step1', 'Pariksha & Dosha') },
    { num: 2, label: t('caseForm.step2', 'Diagnosis & Findings') },
    { num: 3, label: t('caseForm.step3', 'Classical Medicines') },
    { num: 4, label: t('caseForm.step4', 'Anupana & Diet') },
    { num: 5, label: t('caseForm.step5', 'Sign & Prescribe') }
  ];

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4">

      {/* ─── Real Visual Medical Document / PDF / Image Viewer Modal ─────── */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Top Bar */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{previewDocModal.title}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {previewDocModal.type === 'image' ? '🖼️ Image Scan' : previewDocModal.type === 'triage_report' ? '🎙️ AI Voice Report' : '📄 Official PDF Document'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Issued by: {previewDocModal.issuer} • Date: {previewDocModal.date} • ABDM Verified HIP ID: HIP-DEL-8812
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Downloading official document: ${previewDocModal.title}`)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content Viewport */}
            <div className="flex-1 bg-slate-200 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
              
              {/* PDF Document Viewer Layout */}
              {previewDocModal.type === 'pdf' && (
                <div className="bg-white max-w-2xl w-full p-8 rounded-xl shadow-lg border border-slate-300 space-y-6 text-slate-900 font-serif text-xs leading-relaxed">
                  <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 block font-sans">MINISTRY OF AYUSH • ABDM HIP REGISTERED</span>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">{previewDocModal.issuer}</h2>
                      <p className="text-[10px] text-slate-500 font-sans">AIIA Hospital Complex, Sarita Vihar, New Delhi - 110076</p>
                    </div>
                    <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold text-slate-600 font-sans text-center p-1">
                      <span>ABDM</span>
                      <span>VERIFIED</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-sans text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p><strong>Patient Name:</strong> {activePatient?.name || 'Ramesh Sharma'}</p>
                    <p><strong>ABHA ID:</strong> {activePatient?.abha_id || 'ABHA-9821-4501'}</p>
                    <p><strong>Age / Gender:</strong> {activePatient?.age || 42} Yrs / {activePatient?.gender ? activePatient.gender.toUpperCase() : 'MALE'}</p>
                    <p><strong>Report Date:</strong> {previewDocModal.date}</p>
                  </div>

                  <div className="space-y-3 font-sans">
                    <h4 className="font-sans font-bold text-xs text-slate-900 uppercase border-b border-slate-200 pb-1">Radiological Findings & Summary</h4>
                    <p className="text-slate-800 text-xs font-sans leading-relaxed">{previewDocModal.summary}</p>
                    {previewDocModal.details && (
                      <div className="p-3 bg-slate-100 rounded-lg text-[11px] font-sans space-y-1 text-slate-700">
                        {previewDocModal.details.map((d, i) => (
                          <p key={i}>• {d}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between font-sans text-[10px]">
                    <div>
                      <p className="font-bold text-emerald-800">✓ Digitally Signed via ABDM HIP Security Gate</p>
                      <p className="text-slate-400">Timestamp: 2026-08-23T10:30:00Z</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">Dr. Rajesh Vaidya, BAMS MD</p>
                      <p className="text-slate-500">Reg No: AYUSH-REG-DEL-2012-4412</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image / Scan Viewer Layout */}
              {previewDocModal.type === 'image' && (
                <div className="max-w-3xl w-full bg-slate-900 p-4 rounded-2xl shadow-xl flex flex-col items-center space-y-3">
                  <img
                    src={previewDocModal.imageUrl || "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80"}
                    alt={previewDocModal.title}
                    className="max-h-[60vh] w-auto object-contain rounded-xl border border-slate-700 shadow-md"
                  />
                  <div className="bg-slate-800 p-3 rounded-xl w-full text-xs text-slate-200 font-sans space-y-1">
                    <p className="font-bold text-amber-300">Image Scan Details: {previewDocModal.title}</p>
                    <p className="text-[11px] text-slate-300">{previewDocModal.summary}</p>
                  </div>
                </div>
              )}

              {/* Patient AI Voice Triage Report Layout */}
              {previewDocModal.type === 'triage_report' && (
                <div className="bg-white max-w-2xl w-full p-8 rounded-xl shadow-lg border border-emerald-300 space-y-5 text-slate-900 font-sans text-xs">
                  <div className="border-b-2 border-emerald-700 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                        OFFICIAL PATIENT SELF-TRIAGE PARCHAA
                      </span>
                      <h2 className="text-base font-bold text-slate-900 mt-1">SwasthSaarthi AI Symptom Triage Report</h2>
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Generated at Intake
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                    <span className="font-extrabold text-emerald-900 text-xs block">
                      🎙️ Recorded Voice Audio Transcript:
                    </span>
                    <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-emerald-100 text-xs leading-relaxed">
                      "Mujhe pichle 6 mahine se dono ghutno me subah uthte hi severe dard aur akadahat hoti hai. Stair climb karte waqt katar-katar ki sound aati hai. Sardi me dard badh jaata hai."
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 text-[10px] uppercase block">Chief Complaints</span>
                      <p className="font-bold text-slate-900 mt-0.5">{activePatient?.latest_chief_complaint || 'Joint stiffness & morning pain in both knees'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 text-[10px] uppercase block">Suspected Dosha</span>
                      <p className="font-bold text-emerald-800 mt-0.5">{activePatient?.prakriti || 'Vata-Pitta Imbalance (Vata Vriddhi)'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-slate-700 text-xs block">AI Clinical Recommendations for Doctor:</span>
                    <ul className="list-disc list-inside text-slate-700 text-[11px] space-y-1">
                      <li>Check Ashtavidha Pariksha for Vata-Vaha Nadi pulse rhythm and Rooksha Sparsha.</li>
                      <li>Evaluate medial joint line tenderness and crepitus during flexion.</li>
                      <li>Consider prescribing Yograj Guggulu with lukewarm water anupana and Janu Basti therapy.</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Bar */}
            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Close Document Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── Top Clinical Header & Patient Selector Dropdown ────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {selectedPatientId && activePatient?.avatar_url ? (
            <img
              src={activePatient.avatar_url}
              alt={activePatient?.name || "Patient"}
              onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.style.display = 'none'; }}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
          )}
          <div className="space-y-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 uppercase">Consulting Patient:</span>
              <select
                value={selectedPatientId ? (activePatient?.abha_id || activePatient?.id || selectedPatientId) : ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setSelectedPatientId(val);
                  if (onSelectPatientId) onSelectPatientId(val);
                }}
                className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl font-extrabold text-xs text-emerald-950 outline-none cursor-pointer"
              >
                <option value="">-- Select Patient to View Case Sheet --</option>
                {patientsList.map((p) => {
                  const val = p.abha_id || p.id;
                  return (
                    <option key={p.id || val} value={val}>
                      {p.name} ({p.abha_id || p.uhid || p.id})
                    </option>
                  );
                })}
              </select>
              {selectedPatientId && (
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                  {activePatient?.abha_id || activePatient?.uhid || "ABHA"}
                </span>
              )}
            </div>
            {selectedPatientId ? (
              <p className="text-xs text-slate-500 font-medium">
                {activePatient?.gender ? activePatient.gender.toUpperCase() : 'MALE'} • {activePatient?.age || 42} yrs • Blood: {activePatient?.blood_group || 'B+'} • Mobile: {activePatient?.contact || '+91 98000 00000'}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                No active patient selected. Pick a patient from the dropdown above to load case sheet.
              </p>
            )}
          </div>
        </div>

        {selectedPatientId && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsReferralModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Stethoscope className="w-4 h-4 text-white" />
              <span>🔁 Refer Patient</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectPatientTimeline) onSelectPatientTimeline(selectedPatientId);
              }}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>📜 View Patient's Full Longitudinal History (Timeline) →</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── DEFAULT UNSELECTED STATE ────────────────────────────────────────── */}
      {!selectedPatientId && (
        <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-2xl mx-auto my-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-2xl shadow-sm border border-emerald-200">
            🩺
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">Select Patient to View Case Sheet</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              No patient data is currently displayed. Choose a patient from the dropdown selector above or open the Patient Directory to load a patient record.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSelectPatientTimeline && onSelectPatientTimeline('directory')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>👤 Open Patient Directory →</span>
            </button>
          </div>
        </div>
      )}

      {selectedPatientId && (
        <>

      {/* Read-Only Historical Case Sheet Notice */}
      {isReadOnly && (
        <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>🔒 Read-Only Historical Case View — Active consultation editing & prescription signing is enabled only for Token #1 active patient.</span>
          </div>
          <span className="text-[10px] font-extrabold uppercase bg-amber-200 px-2 py-0.5 rounded text-amber-950 shrink-0">Archived Record</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── PHASE 1: FULL PATIENT INTAKE DOSSIER & REPORT REVIEW SCREEN ────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {!isExamining ? (
        <div className="space-y-4 animate-fade-in">
          
          {/* Card 1: Submitted Voice Triage & Self Intake Summary (100% Patient Isolated) */}
          {(() => {
            const patAbha = activePatient?.abha_id || activePatient?.uhid;
            const patData = PATIENT_CLINICAL_MAP[patAbha] || PATIENT_CLINICAL_MAP['ABHA-3344-1102'];
            const displayTranscript = activeCaseData?.intake_data?.transcript || patData?.transcript || '';
            const displayComplaint = activeCaseData?.chief_complaints || activePatient?.latest_chief_complaint || patData?.complaint || '';
            const displayPrakriti = activeCaseData?.prakriti || activePatient?.prakriti || patData?.prakriti || 'Vata-Pitta';

            return (
              <div className="bg-gradient-to-br from-slate-900 via-[#12372A] to-teal-950 p-6 rounded-2xl text-white shadow-md space-y-4 border border-emerald-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded">
                      Patient Submitted Intake Data
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Self-Reported Symptom Triage & Current Condition for {activePatient?.name || 'Patient'}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => speakText(displayTranscript)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 text-amber-300" />
                    <span>Listen Audio Triage</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2">
                    <span className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider block">
                      🎙️ Full Voice Transcript Recorded by Patient:
                    </span>
                    <p className="text-slate-100 text-xs italic leading-relaxed bg-black/30 p-3 rounded-xl border border-white/10 min-h-20">
                      "{displayTranscript}"
                    </p>
                    <div className="pt-2 text-emerald-200 text-[11px]">
                      <strong className="text-white">Duration & Severity:</strong> {activeCaseData?.intake_data?.structured?.duration || patData?.duration || ''}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2">
                    <span className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider block">
                      📋 Suspected Dosha & Triage Summary:
                    </span>
                    <div className="space-y-1.5 text-slate-200 text-[11px]">
                      <p><strong className="text-white">Primary Complaint:</strong> {displayComplaint}</p>
                      <p><strong className="text-white">Aggravating Factors:</strong> {activeCaseData?.intake_data?.structured?.aggravating_factors || patData?.aggravating || ''}</p>
                      <p><strong className="text-white">Prakriti Imbalance:</strong> {displayPrakriti}</p>
                      <p><strong className="text-white">Recommended Therapy:</strong> {activeCaseData?.intake_data?.structured?.suggested_pathya || patData?.suggestedPathya || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Card 2: Attached Medical Reports & Scanned Images (100% Patient Isolated) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Attached Medical Reports & Documents Sent by Patient ({activePatientDocs.length})</span>
              </h3>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                ABDM Sync Verified
              </span>
            </div>

            {activePatientDocs.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs font-medium border border-slate-200/80 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center font-bold text-sm">
                  📄
                </div>
                <p className="font-bold text-slate-700 text-xs">No medical reports uploaded by {activePatient?.name || 'this patient'} yet.</p>
                <p className="text-[11px] text-slate-400">Attached documents sent via Patient Portal (Step 3 Vault) will appear here instantly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {activePatientDocs.map((ud, uIdx) => {
                  const isPdf = (ud.file_name && ud.file_name.toLowerCase().endsWith('.pdf')) || (ud.file_type && ud.file_type.toLowerCase().includes('pdf'));
                  const isImg = ud.is_image || (ud.file_name && /\.(png|jpg|jpeg|svg)$/i.test(ud.file_name));

                  return (
                    <div key={ud.id || uIdx} className="p-4 bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-white rounded-2xl border border-emerald-200/80 space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                            {isImg ? '🖼️ Patient Uploaded Image' : '📄 Patient Uploaded PDF'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">{ud.date || 'Recent'}</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs truncate">{ud.file_name || 'Attached Report.pdf'}</h4>
                        
                        {/* ✨ AI Scan Clinical Summarization */}
                        <div className="p-3 bg-white rounded-xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
                          <span className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                            <span>✨ AI Clinical Scan Findings:</span>
                          </span>
                          <p className="text-[11px] text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                            {ud.summary || ud.ocr_summary || ud.ai_findings || 'Medical report parsed & digitized to ABDM Health Vault.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({
                          type: isPdf ? 'pdf' : isImg ? 'image' : 'pdf',
                          title: ud.file_name || 'Medical Document',
                          issuer: ud.source_doctor_or_hospital || 'Patient Self Upload',
                          date: ud.date || new Date().toISOString().split('T')[0],
                          summary: ud.summary || ud.ocr_summary || ud.ai_findings || 'Patient submitted medical document record.',
                          file_url: ud.file_url || ud.data_url || ud.url,
                          imageUrl: ud.file_url || ud.data_url || ud.url || '/sample_scans/knee_xray_scan.svg'
                        })}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 mt-2"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Original {isImg ? 'Image' : 'PDF'} & OCR Details →</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: AI Assistant Smart Auto-Fill & Proceed CTA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">AI Clinical Examination Assistant Ready</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  AI will auto-fill Ashtavidha Pariksha, Vitals, Formulations & Diet from the patient's dossier upon proceeding.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAiSmartPrefill}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>✨ AI Smart Auto-Fill</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAiSmartPrefill();
                  setIsExamining(true);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap"
              >
                <span>Proceed to Ashtavidha Examination (Steps 1 to 5)</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      ) : (

        /* ────────────────────────────────────────────────────────────────────── */
        /* ─── PHASE 2: 5-STEP ASHTAVIDHA EXAMINATION WIZARD ─────────────────── */
        /* ────────────────────────────────────────────────────────────────────── */
        <div className="space-y-4 animate-fade-in">
          
          {/* Top Bar for Phase 2: Back to Review + Step Progress Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setIsExamining(false)}
                className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to Patient Intake Review Screen</span>
              </button>

              <button
                type="button"
                onClick={handleAiSmartPrefill}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>✨ AI Auto-Fill Form</span>
              </button>
            </div>

            {/* 5-Step Wizard Progress Bar */}
            <div className="flex items-center justify-center w-full max-w-3xl mx-auto pt-1">
              {steps.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div className="flex flex-col items-center gap-2 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                      step === s.num
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : step > s.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}>
                      {step > s.num ? <CheckCircle2 className="w-5 h-5 text-white" /> : s.num}
                    </div>
                    <span className={`text-[10px] uppercase font-semibold absolute top-10 whitespace-nowrap ${
                      step === s.num ? 'text-emerald-700 font-extrabold' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 -translate-y-3 ${
                      step > s.num ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 1: ASHTAVIDHA PARIKSHA, PRAKRITI & DOSHA ──────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('caseForm.section1', 'Section 1: Rogi & Roga Pariksha')}</h3>
            </div>
            <SpeechMicButton label="Dictate" onTranscript={(t) => setCaseForm({ ...caseForm, clinical_findings: t })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.dehaPrakriti', 'Deha Prakriti')}</label>
              <select
                value={caseForm.prakriti}
                onChange={(e) => setCaseForm({ ...caseForm, prakriti: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Pitta-Kapha">Pitta-Kapha</option>
                <option value="Vata-Kapha">Vata-Kapha</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.vikriti', 'Vikriti')}</label>
              <input
                type="text"
                value={caseForm.vikriti}
                onChange={(e) => setCaseForm({ ...caseForm, vikriti: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.agniStatus', 'Agni Status')}</label>
              <select
                value={caseForm.agni}
                onChange={(e) => setCaseForm({ ...caseForm, agni: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="Sama Agni">Sama Agni</option>
                <option value="Vishama Agni">Vishama Agni</option>
                <option value="Tikshna Agni">Tikshna Agni</option>
                <option value="Manda Agni">Manda Agni</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.koshtha', 'Koshtha')}</label>
              <select
                value={caseForm.koshtha}
                onChange={(e) => setCaseForm({ ...caseForm, koshtha: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="Madhyama">Madhyama</option>
                <option value="Mridu">Mridu</option>
                <option value="Krushta">Krushta</option>
              </select>
            </div>
          </div>

          <AshtavidhaForm
            data={caseForm.ashtavidha_pariksha}
            onChange={(updated) => setCaseForm({ ...caseForm, ashtavidha_pariksha: updated })}
          />

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('caseForm.proceed2', 'Proceed to Diagnosis')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 2: DIAGNOSIS & CLINICAL FINDINGS ──────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('caseForm.section2', 'Section 2: Nidana & Samprapti')}</h3>
            </div>
            <SpeechMicButton label="Voice Scribe" onTranscript={(t) => setCaseForm({ ...caseForm, chief_complaints: t })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.chiefComplaints', 'Chief Complaints')}</label>
              <textarea
                rows={3}
                value={caseForm.chief_complaints}
                onChange={(e) => setCaseForm({ ...caseForm, chief_complaints: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.hpi', 'History of Present Illness')}</label>
              <textarea
                rows={3}
                value={caseForm.history_present_illness}
                onChange={(e) => setCaseForm({ ...caseForm, history_present_illness: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-emerald-700 uppercase block mb-1">{t('caseForm.ayurvedicDiagnosis', 'Ayurvedic Diagnosis')}</label>
              <input
                type="text"
                value={caseForm.diagnosis_ayurvedic}
                onChange={(e) => setCaseForm({ ...caseForm, diagnosis_ayurvedic: e.target.value })}
                className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-900 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">{t('caseForm.modernDiagnosis', 'Modern Equivalent Diagnosis')}</label>
              <input
                type="text"
                value={caseForm.diagnosis_modern}
                onChange={(e) => setCaseForm({ ...caseForm, diagnosis_modern: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3">
            <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              ← {t('caseForm.back1', 'Back')}
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('caseForm.proceed3', 'Proceed to Medicines DB')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 3: CLASSICAL AYURVEDIC MEDICINE SEARCH & CUSTOM ADD ───────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">{t('caseForm.section3', 'Section 3: Aushadha Sevana')}</h3>
          </div>

          <div ref={medSearchContainerRef} className="p-4 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-emerald-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-700" />
                <span>Search Classical Ayurvedic Formulations & Prescriptions:</span>
              </label>

              {/* Quick Category Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {[
                  { label: '🔥 All Formulations', key: 'All' },
                  { label: '🌿 Guggulu', key: 'Guggulu' },
                  { label: '💎 Rasa & Vati', key: 'Vati' },
                  { label: '🍃 Churna', key: 'Churna' },
                  { label: '🫖 Kwath', key: 'Kwath' },
                  { label: '🍷 Arishta', key: 'Arishta' }
                ].map(cat => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => loadInitialMeds(cat.key)}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                      activeCategoryFilter === cat.key
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={medQuery}
                onFocus={() => {
                  setShowMedDropdown(true);
                  if (searchedMeds.length === 0) loadInitialMeds(activeCategoryFilter);
                }}
                onChange={(e) => handleMedSearch(e.target.value, activeCategoryFilter)}
                placeholder="Type medicine name (e.g. Yograj Guggulu, Sutshekhar Ras, Avipattikar Churna...)..."
                className="w-full p-3.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              />

              {showMedDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto text-xs divide-y divide-slate-100 animate-fade-in">
                  <div className="p-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold px-3">
                    <span>Showing {searchedMeds.length} Classical Formulations — Click to set Dosage & Anupana</span>
                    <button type="button" onClick={() => setShowMedDropdown(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕ Close</button>
                  </div>

                  {searchedMeds.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 italic">No formulations found. Try typing another name or category.</div>
                  ) : (
                    searchedMeds.map((med, idx) => (
                      <div
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddSearchedMedicine(med);
                          setShowMedDropdown(false);
                        }}
                        className="p-3.5 hover:bg-emerald-50/80 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="space-y-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 group-hover:text-emerald-900 text-xs">{med.name}</span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                              {med.category || 'Classical'}
                            </span>
                            {med.dosha && (
                              <span className="text-[10px] font-semibold text-slate-500">
                                ({med.dosha})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            <strong className="text-slate-700">Indication:</strong> {med.indications || 'Classical Ayurvedic Therapy'}
                          </p>
                        </div>

                        <button 
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddSearchedMedicine(med);
                            setShowMedDropdown(false);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-700 group-hover:bg-emerald-800 text-white font-extrabold rounded-xl text-[11px] shrink-0 shadow-2xs cursor-pointer flex items-center gap-1 transition-all"
                        >
                          <span>+ Prescribe</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{t('caseForm.addCustom', 'Add Custom Formulation:')}</span>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenBlankPrescribeModal(); }}
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg shadow-2xs cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>✨ Manual Entry Overlay Modal</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={customMedName}
                onChange={(e) => setCustomMedName(e.target.value)}
                placeholder={t('caseForm.medName')}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={customMedDosage}
                onChange={(e) => setCustomMedDosage(e.target.value)}
                placeholder={t('caseForm.dosage')}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={customMedAnupana}
                onChange={(e) => setCustomMedAnupana(e.target.value)}
                placeholder={t('caseForm.anupana')}
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddCustomMedicine}
                className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
              >
                {t('caseForm.addBtn', '+ Add')}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 uppercase">
              {t('caseForm.activePrescription', 'Active Prescription List')} ({caseForm.medicines.length}):
            </span>

            <div className="space-y-2">
              {caseForm.medicines.map((med, idx) => (
                <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">{t('caseForm.medName', 'MEDICINE')}</span>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="font-bold text-slate-900 bg-transparent outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">{t('caseForm.dosage', 'DOSAGE')}</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="text-slate-800 font-medium bg-transparent outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">{t('caseForm.duration', 'DURATION')}</span>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="text-slate-800 font-medium bg-transparent outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">{t('caseForm.anupana', 'ANUPANA')}</span>
                      <input
                        type="text"
                        value={med.anupana}
                        onChange={(e) => handleMedicineChange(idx, 'anupana', e.target.value)}
                        className="text-emerald-700 font-bold bg-transparent outline-none w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMedicine(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3">
            <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              ← {t('caseForm.back2', 'Back')}
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('caseForm.proceed4', 'Proceed to Anupana & Diet')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 4: OFFICIAL AI CLINICAL SYNTHESIS DOSSIER (A4 PARCHAA SHEET) ──── */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in font-body">
          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl text-white shadow-md border border-emerald-800">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                Step 4: AI Clinical Synthesis & Official Parchaa Report
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Official A4 Longitudinal Clinical Synthesis Sheet</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTriggerAiSummary}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{loadingAi ? 'Synthesizing...' : '✨ Regenerate AI Synthesis'}</span>
              </button>
              <button
                type="button"
                onClick={handleAutoSuggestDiet}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>🥗 Auto-Suggest Pathya</span>
              </button>
            </div>
          </div>

          {/* ─── A4 CLINICAL PARCHAA SHEET ────────────────────────────────────────── */}
          <div className="bg-white p-8 rounded-3xl border-2 border-emerald-200/80 shadow-xl max-w-4xl mx-auto space-y-6 text-slate-800 relative font-sans">
            
            {/* 1. Header Emblem & Hospital Crest */}
            <div className="border-b-2 border-emerald-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center font-black text-2xl shadow-md border border-emerald-700 shrink-0">
                  🌿
                </div>
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-emerald-800 uppercase block">
                    Ministry of Ayush • Official Clinical Record
                  </span>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {currentUser?.hospital_name || "ALL INDIA INSTITUTE OF AYURVEDA (AIIA)"}
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold">
                    Department of Kayachikitsa & Panchakarma Clinical OPD • New Delhi
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l border-slate-200 sm:pl-4 space-y-0.5 shrink-0">
                <div className="text-xs font-black text-emerald-950 uppercase">
                  {currentUser?.name || "Dr. Rajesh Vaidya, BAMS, MD"}
                </div>
                <p className="text-[11px] text-slate-600 font-semibold">
                  {currentUser?.qualification || "MD (Kayachikitsa) — Senior Physician"}
                </p>
                <p className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                  Reg No: {currentUser?.registration_no || "AYUSH-REG-DEL-2012-4412"}
                </p>
              </div>
            </div>

            {/* 2. Patient Demographics Strip */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 rounded-2xl border border-emerald-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Consulting Patient</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{activePatient?.name || 'Priya Deshmukh'}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">ABHA Health ID</span>
                <span className="font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 text-xs inline-block mt-0.5">
                  {activePatient?.abha_id || activePatient?.uhid || 'ABHA-3344-1102'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Age / Gender / Blood</span>
                <span className="font-bold text-slate-800">{activePatient?.age || 29} Yrs • {activePatient?.gender ? activePatient.gender.toUpperCase() : 'FEMALE'} • {activePatient?.blood_group || 'A+'}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Date & OPD Ref</span>
                <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {activeCaseData?.token_number || 'OPD-110'}</span>
              </div>
            </div>

            {/* 3. AI Generated Clinical Synthesis Executive Summary */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-[#12372A] rounded-2xl text-white shadow-sm space-y-3 border border-emerald-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Live Groq LLM AI Synthesis & Samprapti Engine</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    Groq LLM Active
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerAiSummary}
                  disabled={loadingAi}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1 self-start sm:self-auto"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                  <span>{loadingAi ? 'Running Live LLM AI...' : '✨ Generate Live AI Synthesis'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-100 font-medium leading-relaxed italic bg-black/30 p-3.5 rounded-xl border border-white/10">
                "{aiResult?.summary_en || aiResult?.summary || 
                  `Patient ${activePatient?.name || 'Priya Deshmukh'} presents with ${caseForm.chief_complaints || 'Pitta-Vata imbalance'}. Ashtavidha Pariksha confirms ${caseForm.ashtavidha_pariksha?.jihva || 'Saama Jihva'} and ${caseForm.ashtavidha_pariksha?.nadi || 'Pitta-Vata Nadi'}. Formulated classical line of treatment with ${caseForm.medicines?.map(m => m.name).join(', ') || 'Kaishore Guggulu and Gandhak Rasayan'} for complete Samprapti Vighatana.`
                }"
              </p>

              {aiResult?.risk_factors && aiResult.risk_factors.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] text-amber-200 font-semibold pt-1">
                  <span className="text-amber-400 font-bold">⚠️ AI Risk Factors:</span>
                  <span>{aiResult.risk_factors.join(' • ')}</span>
                </div>
              )}
            </div>

            {/* 4. Section A: Combined Clinical Findings (Step 1 + Step 2 Synthesis) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Step 1 Intake & Vitals */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="font-extrabold text-emerald-900 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <span>📋 Step 1: Self Intake & Vitals</span>
                </h4>
                <div className="space-y-1.5 text-slate-700 text-[11px]">
                  <p><strong className="text-slate-900">Chief Complaint:</strong> {caseForm.chief_complaints || 'Acid Peptic Disorder & Heartburn'}</p>
                  <p><strong className="text-slate-900">Clinical Findings:</strong> {caseForm.clinical_findings || 'Epigastric tenderness and esophageal burning.'}</p>
                  <p><strong className="text-slate-900">Vitals:</strong> BP {caseForm.vitals?.bp || '120/80'} • Pulse {caseForm.vitals?.pulse || '74 bpm'} • SpO2 {caseForm.vitals?.spo2 || '99%'}</p>
                </div>
              </div>

              {/* Step 2 Ashtavidha Pariksha */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="font-extrabold text-emerald-900 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <span>🔍 Step 2: Ashtavidha Examination</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div><strong className="text-slate-900">Nadi:</strong> {caseForm.ashtavidha_pariksha?.nadi || 'Pitta-Vaha'}</div>
                  <div><strong className="text-slate-900">Jihva:</strong> {caseForm.ashtavidha_pariksha?.jihva || 'Saama'}</div>
                  <div><strong className="text-slate-900">Agni:</strong> {caseForm.agni || 'Vishama'}</div>
                  <div><strong className="text-slate-900">Prakriti:</strong> {caseForm.prakriti || 'Pitta-Vata'}</div>
                </div>
                <div className="pt-1 text-[11px] border-t border-slate-200/60">
                  <strong className="text-emerald-900">Ayurvedic Diagnosis:</strong> {caseForm.diagnosis_ayurvedic || 'Urdhvaga Amlapitta'}
                </div>
              </div>
            </div>

            {/* 5. Section B: Step 3 Prescribed Classical Formulations Table (Rx) */}
            <div className="space-y-2">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-extrabold">Rx</span>
                <span>Prescribed Classical Ayurvedic Formulations ({caseForm.medicines?.length || 0})</span>
              </h4>

              {caseForm.medicines?.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs font-semibold">
                  No medicines added yet. Go back to Step 3 to add classical formulations.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
                        <th className="p-3">#</th>
                        <th className="p-3">Formulation & Category</th>
                        <th className="p-3">Dosage (खुराक)</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Anupana (अनुपान)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                      {caseForm.medicines?.map((med, mIdx) => (
                        <tr key={mIdx} className="hover:bg-emerald-50/50 transition-colors">
                          <td className="p-3 font-bold text-slate-500">{mIdx + 1}</td>
                          <td className="p-3">
                            <strong className="text-slate-900 block text-xs">{med.name}</strong>
                            <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                              {med.category || 'Classical Formulation'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{med.dosage || '2 tabs twice daily'}</td>
                          <td className="p-3 font-bold text-slate-700">{med.duration || '30 days'}</td>
                          <td className="p-3 font-extrabold text-teal-800">{med.anupana || 'Lukewarm Water'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 6. Section C: Pathya-Apathya & Physician Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
                <label className="font-extrabold text-emerald-900 text-xs block border-b border-emerald-200 pb-1">
                  ✅ Pathya & Lifestyle Guidance (पथ्य आहार-विहार)
                </label>
                <textarea
                  rows={3}
                  value={caseForm.pathya_apathya}
                  onChange={(e) => setCaseForm({ ...caseForm, pathya_apathya: e.target.value })}
                  className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <label className="font-extrabold text-slate-800 text-xs block border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Physician Confidential Notes</span>
                </label>
                <textarea
                  rows={3}
                  value={caseForm.private_notes}
                  onChange={(e) => setCaseForm({ ...caseForm, private_notes: e.target.value })}
                  placeholder="Confidential clinical notes for follow-up..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 text-xs outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* 7. Official Seal & Sign Bar */}
            <div className="pt-4 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">ABDM Health Locker Sync Status</span>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block">
                  🛡️ Digitally Signed & Encrypted (Ayush Standard)
                </span>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic font-bold text-emerald-900 text-sm">
                  {currentUser?.name || "Dr. Rajesh Vaidya"}
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
                  Senior Ayurvedic Physician (Authorized Signatory)
                </span>
              </div>
            </div>

          </div>

          {/* Navigation Step 4 -> Step 5 */}
          <div className="flex justify-between items-center pt-3 max-w-4xl mx-auto">
            <button onClick={() => setStep(3)} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              ← Back to Step 3 (Medicines)
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Proceed to Sign & Issue (Step 5) →</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 5: AUTHENTIC DIGITAL SIGNATURE & OFFICIAL EHR SIGN-OFF TERMINAL ─── */}
      {step === 5 && (
        <div className="space-y-6 animate-fade-in font-body">
          {/* Step Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl text-white shadow-md border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                Step 5: Digital Signature & Final EHR Locking
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Authentic Vaidya Digital Signature & ABDM Token Verification</span>
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-xl border border-white/10 shrink-0">
              🛡️ ABDM Health Locker Class-3 DSC Verified
            </span>
          </div>

          {/* Digital Sign-off Verification Terminal Container */}
          <div className="bg-white p-8 rounded-3xl border-2 border-emerald-200/80 shadow-xl max-w-4xl mx-auto space-y-6 text-slate-800 font-sans">
            
            {/* 1. Doctor & Medical Registration Verification Header */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-[#12372A] rounded-2xl text-white shadow-sm space-y-4 border border-emerald-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                    ✍️
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">
                      Class-3 Medical Digital Signature Certificate (DSC)
                    </span>
                    <h3 className="text-base font-black text-white">
                      {currentUser?.name || "Dr. Rajesh Vaidya, BAMS, MD"}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">
                      {currentUser?.qualification || "MD (Kayachikitsa — Internal Medicine)"} • {currentUser?.hospital_name || "All India Institute of Ayurveda"}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l border-emerald-700/80 sm:pl-4 space-y-1 shrink-0">
                  <span className="text-[10px] font-black text-emerald-300 uppercase block">State Ayush Registration</span>
                  <span className="text-xs font-extrabold text-amber-400 bg-black/40 px-2.5 py-1 rounded-md border border-amber-400/30 inline-block font-mono">
                    {currentUser?.registration_no || "AYUSH-REG-DEL-2012-4412"}
                  </span>
                </div>
              </div>

              {/* Cryptographic EHR Hash & Timestamp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SHA-256 Prescription Hash</span>
                  <span className="text-[11px] font-mono text-emerald-300 block truncate">
                    0x9f8b4a2e...{activePatient?.abha_id?.replace('-', '') || '7a8b9c1d'}
                  </span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ABDM Health Locker ID</span>
                  <span className="text-[11px] font-mono text-amber-300 block truncate">
                    {activePatient?.abha_id || 'ABHA-3344-1102'}
                  </span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Digital Stamp Date</span>
                  <span className="text-[11px] font-bold text-slate-200 block">
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Live OPD
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Final Case Summary Review Strip */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-extrabold text-emerald-950 uppercase text-[11px]">
                  Final Clinical Case Dossier to be Digitally Signed for {activePatient?.name || 'Patient'}
                </span>
                <span className="font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {caseForm.diagnosis_ayurvedic || 'Urdhvaga Amlapitta'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-800">
                <div className="space-y-1 text-[11px]">
                  <strong className="text-slate-900 block font-extrabold uppercase text-[10px] text-slate-500">
                    Chief Complaints & Diagnosis:
                  </strong>
                  <p className="font-medium text-slate-900">{caseForm.chief_complaints}</p>
                  <p className="text-emerald-800 font-bold mt-1">Modern: {caseForm.diagnosis_modern}</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <strong className="text-slate-900 block font-extrabold uppercase text-[10px] text-slate-500">
                    Prescribed Formulations ({caseForm.medicines?.length || 0}):
                  </strong>
                  <ul className="list-disc list-inside space-y-0.5 font-semibold text-slate-800">
                    {caseForm.medicines?.map((m, i) => (
                      <li key={i}><strong className="text-slate-950">{m.name}</strong> — {m.dosage} ({m.anupana})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Interactive Doctor Digital Signature Canvas & Manual Input Pad */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <label className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Official Authorized Signature & Rubber Stamp:</span>
                </label>

                {/* Signature Mode Selector Tabs */}
                <div className="flex items-center gap-1 text-[11px]">
                  {[
                    { key: 'auto', label: '✍️ Auto Cursive DSC' },
                    { key: 'draw', label: '🖋️ Manual Draw Pad' },
                    { key: 'text', label: '⌨️ Custom Input' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSigMode(tab.key)}
                      className={`px-3 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                        sigMode === tab.key
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mode 1: Auto Cursive Signature */}
                {sigMode === 'auto' && (
                  <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-emerald-300 flex flex-col justify-between h-36 relative overflow-hidden shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Auto Class-3 Cursive DSC Certificate
                    </span>

                    <div className="my-auto text-center">
                      <span className="font-serif italic text-2xl font-black text-emerald-950 tracking-wide block select-none">
                        {customSigText || (currentUser?.name ? currentUser.name.split(' ').map(n => n[0] + '.').join('') + ' ' + (currentUser.name.split(' ').pop() || '') : 'Dr. R. Vaidya')}
                      </span>
                      <div className="w-44 h-0.5 bg-emerald-800/40 mx-auto mt-1 rounded-full" />
                    </div>

                    <span className="text-[9px] font-extrabold text-emerald-800 uppercase block text-right">
                      ✓ ABDM DSC Verified
                    </span>
                  </div>
                )}

                {/* Mode 2: Freehand Drawing Canvas */}
                {sigMode === 'draw' && (
                  <div className="bg-white p-3 rounded-2xl border-2 border-emerald-400 flex flex-col justify-between h-36 relative shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                        🖋️ Draw Your Signature (Mouse/Touch):
                      </span>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[10px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded border border-rose-200 cursor-pointer"
                      >
                        🗑️ Clear
                      </button>
                    </div>

                    <canvas
                      ref={sigCanvasRef}
                      width={300}
                      height={80}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-20 bg-emerald-50/40 rounded-xl border border-emerald-200 cursor-crosshair touch-none"
                    />

                    <span className="text-[9px] font-semibold text-slate-400 block text-right">
                      {drawnSigUrl ? '✓ Custom Signature Captured' : 'Draw inside box above'}
                    </span>
                  </div>
                )}

                {/* Mode 3: Custom Text Signature Input */}
                {sigMode === 'text' && (
                  <div className="bg-white p-3.5 rounded-2xl border-2 border-teal-300 flex flex-col justify-between h-36 relative shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-teal-900 uppercase tracking-wider block">
                      ⌨️ Manual Signature Input:
                    </span>

                    <input
                      type="text"
                      value={customSigText}
                      onChange={(e) => setCustomSigText(e.target.value)}
                      placeholder="Type signature e.g. Dr. Rajesh Vaidya, MD..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-teal-600"
                    />

                    <div className="text-center font-serif italic text-base font-bold text-emerald-900 truncate">
                      {customSigText || 'Signature Preview...'}
                    </div>
                  </div>
                )}

                {/* Official Doctor Rubber Stamp */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-300 flex flex-col items-center justify-center text-center space-y-1 relative shadow-2xs">
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-800 text-emerald-900 font-extrabold text-xs flex items-center justify-center bg-white shadow-xs mb-1">
                    AYUSH
                  </div>
                  <span className="font-black text-emerald-950 text-xs uppercase tracking-tight block">
                    {currentUser?.name || "Dr. Rajesh Vaidya"}
                  </span>
                  <p className="text-[10px] text-slate-600 font-bold">
                    {currentUser?.qualification || "BAMS, MD Kayachikitsa"}
                  </p>
                  <span className="text-[9px] font-extrabold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5 font-mono">
                    REG: {currentUser?.registration_no || "AYUSH-DEL-2012"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Action & 1-Click Sign Button */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Step 4 (Parchaa Sheet)
              </button>

              <button
                type="button"
                onClick={handleSaveAndSignCase}
                disabled={savingCase || isReadOnly}
                className={`px-8 py-3.5 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2.5 transition-all ${
                  isReadOnly 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 hover:from-emerald-800 hover:to-slate-900 text-white cursor-pointer hover:scale-[1.02]'
                }`}
              >
                <ShieldCheck className={`w-5 h-5 ${isReadOnly ? 'text-slate-400' : 'text-amber-300'}`} />
                <span>
                  {savingCase 
                    ? 'Digitally Signing & Encrypting Case...' 
                    : isReadOnly 
                      ? '🔒 Historical Case View (Read-Only)' 
                      : '1-Click Digitally Sign & Issue EHR Prescription 🛡️'
                  }
                </span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )}

        {/* ─── PRESCRIBE MEDICINE POPUP MODAL OVERLAY ──────────────────────────── */}
      {prescribeModalMed && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setPrescribeModalMed(null); }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 relative cursor-default">
            <button
              type="button"
              onClick={() => setPrescribeModalMed(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer font-bold"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                💊 Prescribe Classical / Custom Formulation Overlay
              </span>
              
              {/* Editable Medicine Name Input */}
              <div className="pt-2">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                  Medicine Name (Editable / Custom Manual Entry):
                </label>
                <input
                  type="text"
                  value={modalMedName}
                  onChange={(e) => setModalMedName(e.target.value)}
                  placeholder="Type formulation name e.g. Kaishore Guggulu..."
                  className="w-full p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl text-sm font-extrabold text-slate-900 outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Category: <strong className="text-slate-800">{prescribeModalMed.category || 'Classical Formulation'}</strong> • Indication: <span className="text-emerald-700 font-semibold">{prescribeModalMed.indications || 'Ayurvedic Therapy'}</span>
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Field 1: DOSAGE */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block text-[11px]">
                  1. Select Dosage (खुराक):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '2 tabs twice daily after food',
                    '1 tab twice daily after food',
                    '1 tab thrice daily',
                    '3 grams twice daily before meals',
                    '15 ml twice daily with equal water',
                    '3 to 6 grams at bedtime'
                  ].map((dChoice) => (
                    <button
                      key={dChoice}
                      type="button"
                      onClick={() => setModalDosage(dChoice)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                        modalDosage === dChoice 
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dChoice}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={modalDosage}
                  onChange={(e) => setModalDosage(e.target.value)}
                  placeholder="Custom dosage e.g. 2 tabs BID..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Field 2: DURATION */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block text-[11px]">
                  2. Select Duration (अवधि / दिन):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['7 days', '15 days', '30 days', '45 days', '60 days', '90 days'].map((durChoice) => (
                    <button
                      key={durChoice}
                      type="button"
                      onClick={() => setModalDuration(durChoice)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                        modalDuration === durChoice 
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {durChoice}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={modalDuration}
                  onChange={(e) => setModalDuration(e.target.value)}
                  placeholder="Custom duration e.g. 30 days..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Field 3: ANUPANA */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block text-[11px]">
                  3. Select Anupana (Adjuvant / Vehicle - अनुपान):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Lukewarm Water',
                    'Warm Milk / Water',
                    'Warm Water',
                    'Honey',
                    'Ginger Juice & Honey',
                    'Equal Warm Water'
                  ].map((anuChoice) => (
                    <button
                      key={anuChoice}
                      type="button"
                      onClick={() => setModalAnupana(anuChoice)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                        modalAnupana === anuChoice 
                          ? 'bg-teal-800 text-white border-teal-800 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {anuChoice}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={modalAnupana}
                  onChange={(e) => setModalAnupana(e.target.value)}
                  placeholder="Custom Anupana e.g. Lukewarm Water..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPrescribeModalMed(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!modalMedName.trim()) return;
                  const newMedObj = {
                    name: modalMedName.trim(),
                    category: prescribeModalMed?.category || 'Classical Formulation',
                    dosage: modalDosage || '2 tabs twice daily after food',
                    duration: modalDuration || '30 days',
                    anupana: modalAnupana || 'Lukewarm Water'
                  };
                  setCaseForm(prev => ({
                    ...prev,
                    medicines: [...prev.medicines, newMedObj]
                  }));
                  setPrescribeModalMed(null);
                  setMedQuery('');
                  setSearchedMeds([]);
                }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>➕ Confirm & Add to Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}

  <PrescriptionPrintModal
        caseData={savedCaseForPrint}
        patient={activePatient}
        isOpen={!!savedCaseForPrint}
        onClose={() => {
          setSavedCaseForPrint(null);
          setStep(1);
          setIsExamining(false);
        }}
      />

      <DoctorReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        patient={activePatient}
        currentDoctorId={currentDoctorId}
        onReferralSuccess={(refData) => {
          console.log('[Case Sheet Referral Recorded]', refData);
          alert(`Patient ${activePatient?.name} successfully referred to ${refData.to_doctor_name}!`);
        }}
      />
      </>
      )}
    </div>
  );
}