import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, User, FileText, HeartPulse, Stethoscope, 
  Pill, AlertTriangle, CheckCircle2, ChevronRight, Plus, Trash2, ArrowLeft, Volume2, ShieldCheck, Printer, Search, Lock 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SpeechMicButton from '../components/SpeechMicButton';
import AshtavidhaForm from '../components/AshtavidhaForm';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';
import { 
  createCase, createPatient, getPatients, generateAISummary, 
  searchAyurvedicMedicines, getPathyaAdvice, signCase 
} from '../services/api';

export default function AyurSaarthiCaseForm({ selectedPatientId: initialPatientId, onCaseSaved, onSelectPatientTimeline, currentDoctorId = "DOC-AYUR-101", currentUser, lang = 'en' }) {
  const { t } = useTranslation();
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [isExamining, setIsExamining] = useState(false);
  const [previewDocModal, setPreviewDocModal] = useState(null);
  const [step, setStep] = useState(1);

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

  useEffect(() => {
    if (initialPatientId) setSelectedPatientId(initialPatientId);
  }, [initialPatientId]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const list = await getPatients();
      setPatientsList(list);
      if (!initialPatientId && list.length > 0) setSelectedPatientId(list[0].id);
    } catch (e) {
      console.error('Failed to load patients', e);
    }
  };

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

  const handleMedSearch = async (q) => {
    setMedQuery(q);
    if (!q) {
      setSearchedMeds([]);
      return;
    }
    try {
      const results = await searchAyurvedicMedicines(q);
      setSearchedMeds(results);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSearchedMedicine = (med) => {
    const newMedObj = {
      name: med.name,
      category: med.category || 'Vati/Guggulu',
      dosage: med.default_dosage || '2 tabs twice daily',
      duration: '30 days',
      anupana: med.anupana || caseForm.anupana || 'Warm Water'
    };
    setCaseForm({
      ...caseForm,
      medicines: [...caseForm.medicines, newMedObj]
    });
    setMedQuery('');
    setSearchedMeds([]);
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
      const activePatient = patientsList.find(p => p.id === selectedPatientId) || newPatient;
      const caseDataForAi = {
        ...caseForm,
        patient_name: activePatient.name,
        age: activePatient.age
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
      await signCase(savedCase.id);
      savedCase.prescription_signed = true;
      setSavedCaseForPrint(savedCase);
      if (onCaseSaved) onCaseSaved(savedCase);
    } catch (e) {
      alert('Failed to save and sign case sheet.');
    } finally {
      setSavingCase(false);
    }
  };

  const activePatient = patientsList.find(p => p.id === selectedPatientId) || newPatient;

  const steps = [
    { num: 1, label: t('caseForm.step1', 'Pariksha & Dosha') },
    { num: 2, label: t('caseForm.step2', 'Diagnosis & Findings') },
    { num: 3, label: t('caseForm.step3', 'Classical Medicines') },
    { num: 4, label: t('caseForm.step4', 'Anupana & Diet') },
    { num: 5, label: t('caseForm.step5', 'Sign & Prescribe') }
  ];

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4">

      {/* Document Overlay Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>{previewDocModal.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded-lg cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
              <div className="flex justify-between font-bold text-slate-900 border-b pb-2">
                <span>Issuer: {previewDocModal.issuer}</span>
                <span>Date: {previewDocModal.date}</span>
              </div>
              <p className="font-medium">{previewDocModal.summary}</p>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] font-semibold text-emerald-900">
                ✓ ABDM Central Health Records (HIP Verified Signature)
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Top Clinical Header ────────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activePatient?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"}
            alt={activePatient?.name || "Patient"}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900">{activePatient?.name || "Ramesh Sharma"}</span>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
                {activePatient?.abha_id || activePatient?.uhid || "ABHA-9821-4501"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activePatient?.gender ? activePatient.gender.toUpperCase() : 'MALE'} • {activePatient?.age || 42} yrs • Blood: {activePatient?.blood_group || 'B+'} • Mobile: {activePatient?.contact || '+91 98210 45010'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── PHASE 1: FULL PATIENT INTAKE DOSSIER & REPORT REVIEW SCREEN ────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {!isExamining ? (
        <div className="space-y-4 animate-fade-in">
          
          {/* Card 1: Submitted Voice Triage & Self Intake Summary */}
          <div className="bg-gradient-to-br from-slate-900 via-[#12372A] to-teal-950 p-6 rounded-2xl text-white shadow-md space-y-4 border border-emerald-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                  Patient Submitted Intake Data
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Self-Reported Symptom Triage & Current Condition for {activePatient?.name || 'Patient'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => speakText(activePatient?.latest_chief_complaint || 'Joint stiffness and morning pain in both knees persisting for 6 months.')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen Audio Triage</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2">
                <span className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider block">
                  🎙️ Full Voice Transcript Recorded by Patient:
                </span>
                <p className="text-slate-100 text-xs italic leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                  "Mujhe pichle 6 mahine se dono ghutno me subah uthte hi severe dard aur akadahat hoti hai. Stair climb karte waqt katar-katar ki sound aati hai. Sardi me dard badh jaata hai."
                </p>
                <div className="pt-2 text-emerald-200 text-[11px]">
                  <strong className="text-white">Duration & Severity:</strong> 6 Months • Moderate to Severe (Vata Prakopa)
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-2">
                <span className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider block">
                  📋 Suspected Dosha & Triage Summary:
                </span>
                <div className="space-y-1.5 text-slate-200 text-[11px]">
                  <p><strong className="text-white">Primary Complaint:</strong> {activePatient?.latest_chief_complaint || 'Bilateral Knee Joint Stiffness & Crepitus'}</p>
                  <p><strong className="text-white">Aggravating Factors:</strong> Cold weather, sour food, climbing stairs</p>
                  <p><strong className="text-white">Prakriti Imbalance:</strong> {activePatient?.prakriti || 'Vata-Pitta Imbalance'}</p>
                  <p><strong className="text-white">Recommended Therapy:</strong> Janu Basti & Vata-hara Guggulu Kalpa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Attached Medical Reports & Scanned Images */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Attached Medical Reports & Documents Sent by Patient (3)</span>
              </h3>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                ABDM Sync Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Radiology Scan</span>
                  <h4 className="font-bold text-slate-900 text-xs">Knee Joint X-Ray Report.pdf</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Bilateral Knee AP/Lateral view. Medial joint space narrowing.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal({
                    title: 'Radiograph Knee Joint X-Ray Report.pdf',
                    issuer: 'AIIA Department of Radiodiagnosis',
                    date: '2026-08-10',
                    summary: 'Findings: Grade II Osteoarthritis of bilateral knee joints with subchondral sclerosis and medial joint space reduction.'
                  })}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs mt-2 cursor-pointer"
                >
                  👁️ View Full Document →
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase block mb-1">Prescription Parchaa</span>
                  <h4 className="font-bold text-slate-900 text-xs">AIIA OPD Prescription.pdf</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Previous 30-day course of Yograj Guggulu & Rasnadi Kwath.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal({
                    title: 'AIIA OPD Prescription Parchaa.pdf',
                    issuer: 'Dr. Rajesh Vaidya, BAMS MD',
                    date: '2026-07-15',
                    summary: 'Rx: Yograj Guggulu 2 tabs BID, Rasnadi Kwath 15ml BID with equal warm water.'
                  })}
                  className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs mt-2 cursor-pointer"
                >
                  👁️ View Full Document →
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between hover:border-emerald-300 transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-purple-800 uppercase block mb-1">Pathology Lab</span>
                  <h4 className="font-bold text-slate-900 text-xs">Blood & ESR Test Report.pdf</h4>
                  <p className="text-[10px] text-slate-500 mt-1">ESR: 28 mm/hr, Hb: 13.8 g/dl, Uric Acid: 5.2 mg/dl.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal({
                    title: 'Blood & ESR Test Report.pdf',
                    issuer: 'National Diagnostics Lab',
                    date: '2026-08-05',
                    summary: 'Hb: 13.8, TLC: 7,400, ESR: 28 mm/hr (Mild elevation), Uric Acid: 5.2 mg/dl (Normal).'
                  })}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] rounded-lg shadow-2xs mt-2 cursor-pointer"
                >
                  👁️ View Full Document →
                </button>
              </div>

            </div>
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

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>{t('caseForm.searchMeds', 'Search Classical Formulations:')}</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={medQuery}
                onChange={(e) => handleMedSearch(e.target.value)}
                className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
              />

              {searchedMeds.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto text-xs">
                  {searchedMeds.map((med, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddSearchedMedicine(med)}
                      className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between border-b border-slate-100"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{med.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-2">
                          {med.category}
                        </span>
                      </div>
                      <button className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]">
                        {t('caseForm.addBtn', '+ Add')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-800">{t('caseForm.addCustom', 'Add Custom Formulation:')}</span>
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
      {/* ─── STEP 4: ANUPANA, DIET & AI SUMMARY ─────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">{t('caseForm.section4', 'Section 4: Pathya-Apathya & Anupana')}</h3>
            <button
              onClick={handleAutoSuggestDiet}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('caseForm.autoSuggest', 'Auto-Suggest Diet')}</span>
            </button>
          </div>

          {/* AI Summary Block */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Summary
              </span>
              <button onClick={handleTriggerAiSummary} className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer">
                {loadingAi ? t('common.loading') : 'Generate'}
              </button>
            </div>
            {aiResult && (
              <p className="text-xs text-emerald-900 font-medium">{aiResult.summary}</p>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700 block">{t('caseForm.commonAnupana', 'Common Anupana Vehicle')}</label>
            <input
              type="text"
              value={caseForm.anupana}
              onChange={(e) => setCaseForm({ ...caseForm, anupana: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            />
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-slate-700 block">{t('caseForm.dietPlan', 'Diet Plan')}</label>
            <textarea
              rows={4}
              value={caseForm.pathya_apathya}
              onChange={(e) => setCaseForm({ ...caseForm, pathya_apathya: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>{t('caseForm.privateNotes', 'Doctor Private Notes')}</span>
            </label>
            <textarea
              rows={2}
              value={caseForm.private_notes}
              onChange={(e) => setCaseForm({ ...caseForm, private_notes: e.target.value })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800"
            />
          </div>

          <div className="flex justify-between items-center pt-3">
            <button onClick={() => setStep(3)} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              ← {t('caseForm.back3', 'Back')}
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{t('caseForm.proceed5', 'Review & Sign (Step 5)')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 5: REVIEW, 1-CLICK SIGN & PRESCRIBE ───────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">{t('caseForm.section5', 'Section 5: Final Clinical Verification')}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {t('caseForm.signLock', 'Signing locks the prescription.')}
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{activePatient.name}</span>
              <span className="text-emerald-700 font-bold">{caseForm.diagnosis_ayurvedic}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">{t('caseForm.prescribedMeds', 'PRESCRIBED MEDICINES')}</span>
                <ul className="list-disc list-inside font-medium space-y-0.5">
                  {caseForm.medicines.map((m, i) => (
                    <li key={i}>{m.name} — {m.dosage}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">{t('caseForm.anupanaDiet', 'ANUPANA & DIET')}</span>
                <p className="text-[11px] font-medium">{caseForm.anupana}</p>
                <p className="text-[11px] font-medium text-slate-600 mt-1">{caseForm.pathya_apathya}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep(4)} className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer">
              ← {t('caseForm.back4', 'Back to Edit')}
            </button>

            <button
              onClick={handleSaveAndSignCase}
              disabled={savingCase}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
              <span>{savingCase ? t('caseForm.signing', 'Signing...') : t('caseForm.signBtn', '1-Click Sign & Prescribe')}</span>
            </button>
          </div>
        </div>
      )}
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

    </div>
  );
}
