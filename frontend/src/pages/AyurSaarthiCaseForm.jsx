import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Save, User, FileText, HeartPulse, Stethoscope, 
  Pill, AlertTriangle, CheckCircle2, ChevronRight, Plus, Trash2, ArrowLeft, Volume2, ShieldCheck, Printer, Search, Lock 
} from 'lucide-react';
import SpeechMicButton from '../components/SpeechMicButton';
import PrakritiMatrix from '../components/PrakritiMatrix';
import AshtavidhaForm from '../components/AshtavidhaForm';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';
import { 
  createCase, createPatient, getPatients, generateAISummary, 
  searchAyurvedicMedicines, getPathyaAdvice, signCase 
} from '../services/api';

export default function AyurSaarthiCaseForm({ onCaseSaved, onSelectPatientTimeline, currentDoctorId = "DOC-AYUR-101" }) {
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [step, setStep] = useState(1);

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
      { name: 'Yograj Guggulu', category: 'Guggulu', dosage: '2 tablets twice daily', duration: '30 days', anupana: 'Warm Water' },
      { name: 'Rasnasaptak Kwath', category: 'Kwath', dosage: '20 ml twice daily after food', duration: '30 days', anupana: 'Lukewarm water' }
    ],
    anupana: 'गुनगुना पानी (Lukewarm Water) / शहद (Honey)',
    pathya_apathya: 'Pathya: Warm freshly cooked food, Garlic, Sesame oil massage. Apathya: Cold aerated drinks, Night curd, Heavy pulses.',
    private_notes: '',
    follow_up_date: '2026-09-20'
  });

  // Classical Medicine Search DB
  const [medQuery, setMedQuery] = useState('');
  const [searchedMeds, setSearchedMeds] = useState([]);
  const [customMedName, setCustomMedName] = useState('');
  const [customMedDosage, setCustomMedDosage] = useState('1 tab twice daily');
  const [customMedAnupana, setCustomMedAnupana] = useState('Warm Water');

  // AI Summary & State
  const [aiResult, setAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [savingCase, setSavingCase] = useState(false);
  const [savedCaseForPrint, setSavedCaseForPrint] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const list = await getPatients();
      setPatientsList(list);
      if (list.length > 0) setSelectedPatientId(list[0].id);
    } catch (e) {
      console.error('Failed to load patients', e);
    }
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
        doctor_name: "Dr. Rajesh Vaidya",
        doctor_qualification: "BAMS, MD (Kayachikitsa)",
        hospital_name: "All India Institute of Ayurveda (AIIA), New Delhi",
        status: "completed"
      };
      const savedCase = await createCase(casePayload);
      // 1-Click Sign
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* ─── Top Clinical Header ────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Ayurveda Clinical Scribe & Case Sheet (SIH26047)
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1.5">
            Digital Patient Consultation & Prescription Console
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Standardized Ashtavidha Pariksha, Tridosha & Agni assessment, classical DB medicine search & 1-click prescription signing.
          </p>
        </div>

        {/* Wizard Step Nav */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { s: 1, label: "1. Pariksha & Dosha" },
            { s: 2, label: "2. Diagnosis & Findings" },
            { s: 3, label: "3. Classical Medicines" },
            { s: 4, label: "4. Anupana & Diet" },
            { s: 5, label: "5. Sign & Prescribe" }
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => setStep(item.s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                step === item.s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Patient Selector Strip ─────────────────────────────────────────── */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <User className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Consulting Patient</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-50 border border-slate-200 font-extrabold text-slate-900 rounded-xl p-2 text-xs w-full sm:w-80 outline-none"
            >
              {patientsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.abha_id || p.uhid}) — {p.age}Y/{p.gender.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activePatient && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectPatientTimeline && onSelectPatientTimeline(activePatient.id)}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-xs flex items-center gap-1.5 transition-all"
            >
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              <span>View Full History Across All Vaidyas</span>
            </button>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 1: ASHTAVIDHA PARIKSHA, PRAKRITI & DOSHA ──────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Section 1 of 5 • Rogi & Roga Pariksha
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Ayurvedic Assessment (Prakriti, Vikriti, Agni & Ashtavidha Pariksha)
              </h3>
            </div>
            <SpeechMicButton label="Dictate Pariksha" onTranscript={(t) => setCaseForm({ ...caseForm, clinical_findings: t })} />
          </div>

          {/* Prakriti & Agni Matrices */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Deha Prakriti (प्रकृति)</label>
              <select
                value={caseForm.prakriti}
                onChange={(e) => setCaseForm({ ...caseForm, prakriti: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Pitta-Kapha">Pitta-Kapha</option>
                <option value="Vata-Kapha">Vata-Kapha</option>
                <option value="Vata Dominant">Vata Dominant</option>
                <option value="Pitta Dominant">Pitta Dominant</option>
                <option value="Kapha Dominant">Kapha Dominant</option>
                <option value="Sama Prakriti (Tridosha)">Sama Prakriti (Tridosha)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vikriti / Dosha Vriddhi (विकृति)</label>
              <input
                type="text"
                value={caseForm.vikriti}
                onChange={(e) => setCaseForm({ ...caseForm, vikriti: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                placeholder="e.g. Vata Vriddhi with Ama"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Agni Status (अग्नि)</label>
              <select
                value={caseForm.agni}
                onChange={(e) => setCaseForm({ ...caseForm, agni: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Sama Agni">Sama Agni (Balanced)</option>
                <option value="Vishama Agni">Vishama Agni (Irregular / Vata)</option>
                <option value="Tikshna Agni">Tikshna Agni (Hyper / Pitta)</option>
                <option value="Manda Agni">Manda Agni (Sluggish / Kapha)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Koshtha (कोष्ठ)</label>
              <select
                value={caseForm.koshtha}
                onChange={(e) => setCaseForm({ ...caseForm, koshtha: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Madhyama">Madhyama Koshtha</option>
                <option value="Mridu">Mridu Koshtha (Soft)</option>
                <option value="Krushta">Krushta Koshtha (Hard / Constipated)</option>
              </select>
            </div>
          </div>

          {/* Ashtavidha Pariksha Component */}
          <AshtavidhaForm
            data={caseForm.ashtavidha_pariksha}
            onChange={(updated) => setCaseForm({ ...caseForm, ashtavidha_pariksha: updated })}
          />

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
            >
              <span>Proceed to Diagnosis (Step 2)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 2: DIAGNOSIS & CLINICAL FINDINGS ──────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Section 2 of 5 • Nidana & Samprapti
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Chief Complaints & Dual Diagnosis (Ayurvedic + Modern)
              </h3>
            </div>
            <SpeechMicButton label="Voice Scribe" onTranscript={(t) => setCaseForm({ ...caseForm, chief_complaints: t })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Chief Complaints (प्रधान लक्षण)</label>
              <textarea
                rows={3}
                value={caseForm.chief_complaints}
                onChange={(e) => setCaseForm({ ...caseForm, chief_complaints: e.target.value })}
                placeholder="e.g. Janu Shoola (Knee pain), Morning stiffness, Burning in stomach..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">History of Present Illness (HPI)</label>
              <textarea
                rows={3}
                value={caseForm.history_present_illness}
                onChange={(e) => setCaseForm({ ...caseForm, history_present_illness: e.target.value })}
                placeholder="e.g. Onset since 6 months, aggravated in cold weather..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Dual Diagnosis Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Ayurvedic Diagnosis (आयुर्वेदिक निदान)</label>
              <input
                type="text"
                value={caseForm.diagnosis_ayurvedic}
                onChange={(e) => setCaseForm({ ...caseForm, diagnosis_ayurvedic: e.target.value })}
                placeholder="e.g. Sandhivata / Amlapitta / Amavata"
                className="w-full p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl font-black text-emerald-950 text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Modern Equivalent Diagnosis</label>
              <input
                type="text"
                value={caseForm.diagnosis_modern}
                onChange={(e) => setCaseForm({ ...caseForm, diagnosis_modern: e.target.value })}
                placeholder="e.g. Knee Osteoarthritis Grade II / GERD"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-3">
            <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              ← Back to Pariksha
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
            >
              <span>Proceed to Medicines DB (Step 3)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 3: CLASSICAL AYURVEDIC MEDICINE SEARCH & CUSTOM ADD ───────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Section 3 of 5 • Aushadha Sevana
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Classical Ayurvedic Medicine Database & Custom Formulations
              </h3>
            </div>
          </div>

          {/* Search Classical Formulations DB */}
          <div className="p-4 bg-emerald-50/60 rounded-3xl border border-emerald-200 space-y-3">
            <label className="text-xs font-black text-emerald-950 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-700" />
              <span>Search Classical Formulations (Vati, Guggulu, Kwatha, Churna, Asava-Arishta):</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={medQuery}
                onChange={(e) => handleMedSearch(e.target.value)}
                placeholder="Type medicine name (e.g. Yograj, Avipattikar, Maharasnadi, Ashwagandha)..."
                className="w-full p-3.5 bg-white border border-emerald-300 rounded-2xl text-xs font-bold text-slate-900 shadow-xs outline-none"
              />

              {searchedMeds.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {searchedMeds.map((med, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddSearchedMedicine(med)}
                      className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900">{med.name}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded ml-2">
                          {med.category}
                        </span>
                        <p className="text-[11px] text-slate-500">{med.indications}</p>
                      </div>
                      <button className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[11px]">
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Free-Text Medicine Add */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3 text-xs">
            <span className="font-extrabold text-slate-800 block text-xs">
              Or Add Custom Formulation (Free-Text Add):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={customMedName}
                onChange={(e) => setCustomMedName(e.target.value)}
                placeholder="Medicine Name (e.g. Custom Rasayana Vati)"
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={customMedDosage}
                onChange={(e) => setCustomMedDosage(e.target.value)}
                placeholder="Dosage (e.g. 2 tabs twice daily)"
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                value={customMedAnupana}
                onChange={(e) => setCustomMedAnupana(e.target.value)}
                placeholder="Anupana (e.g. Warm Water / Milk)"
                className="p-2.5 bg-white border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={handleAddCustomMedicine}
                className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
              >
                + Add Custom Med
              </button>
            </div>
          </div>

          {/* Added Prescription Medicines Table */}
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              Active Prescription List ({caseForm.medicines.length} Medicines):
            </span>

            <div className="space-y-2">
              {caseForm.medicines.map((med, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">MEDICINE</span>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="font-extrabold text-slate-900 bg-transparent outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">DOSAGE & TIMING</span>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="text-slate-700 bg-transparent outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">DURATION</span>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="text-slate-600 bg-transparent outline-none w-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">ANUPANA</span>
                      <input
                        type="text"
                        value={med.anupana}
                        onChange={(e) => handleMedicineChange(idx, 'anupana', e.target.value)}
                        className="text-emerald-800 font-bold bg-transparent outline-none w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMedicine(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3">
            <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              ← Back to Diagnosis
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
            >
              <span>Proceed to Anupana & Diet (Step 4)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 4: ANUPANA & PATHYA-APATHYA DIET PLAN ─────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Section 4 of 5 • Pathya - Apathya & Anupana
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1.5">
                Anupana Selection & Dosha-Based Diet Plan
              </h3>
            </div>
            <button
              onClick={handleAutoSuggestDiet}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Auto-Suggest Diet from Dosha</span>
            </button>
          </div>

          {/* Anupana Selection */}
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 block">Common Anupana Vehicle (अनुपान):</label>
            <div className="flex flex-wrap gap-2">
              {[
                "गुनगुना पानी (Lukewarm Water)",
                "शहद (Pure Honey)",
                "गौ दुग्ध (Warm Cow Milk)",
                "गौ घृत (Cow Ghee)",
                "रास्नासप्तक क्वाथ",
                "दशमूल क्वाथ",
                "नारियल पानी (Coconut Water)"
              ].map((anu) => (
                <button
                  key={anu}
                  type="button"
                  onClick={() => setCaseForm({ ...caseForm, anupana: anu })}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    caseForm.anupana === anu
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {anu}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={caseForm.anupana}
              onChange={(e) => setCaseForm({ ...caseForm, anupana: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
              placeholder="Or enter custom Anupana instructions..."
            />
          </div>

          {/* Pathya-Apathya Diet Box */}
          <div className="space-y-2 text-xs">
            <label className="font-bold text-amber-900 block">Pathya - Apathya Diet Plan (Auto-Suggested & Editable):</label>
            <textarea
              rows={4}
              value={caseForm.pathya_apathya}
              onChange={(e) => setCaseForm({ ...caseForm, pathya_apathya: e.target.value })}
              className="w-full p-4 bg-amber-50/50 border border-amber-200 rounded-2xl font-medium text-amber-950"
            />
          </div>

          {/* Doctor-Only Private Remarks (Strict Privacy Boundary) */}
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-2 text-xs">
            <label className="font-black text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Doctor Private Notes (Visible ONLY to You):</span>
            </label>
            <textarea
              rows={2}
              value={caseForm.private_notes}
              onChange={(e) => setCaseForm({ ...caseForm, private_notes: e.target.value })}
              placeholder="Confidential clinical remarks (e.g. Patient anxiety about surgery, adherence concerns)..."
              className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-medium text-slate-800"
            />
          </div>

          <div className="flex justify-between items-center pt-3">
            <button onClick={() => setStep(3)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              ← Back to Medicines
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
            >
              <span>Review & Sign Prescription (Step 5)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── STEP 5: REVIEW, 1-CLICK SIGN & PRESCRIBE ───────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Section 5 of 5 • Final Clinical Verification
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1.5">
              1-Click "Sign & Prescribe" — Live Synchronization to Patient Portal
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Signing locks the prescription, appends it to the patient's central timeline, and pushes it live to the patient dashboard.
            </p>
          </div>

          {/* Quick Summary Preview Box */}
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">{activePatient.name} ({activePatient.abha_id || 'ABHA-9821-4501'})</span>
              <span className="text-emerald-800 font-bold">{caseForm.diagnosis_ayurvedic}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 font-bold block text-[10px]">PRESCRIBED MEDICINES:</span>
                <ul className="list-disc list-inside font-semibold space-y-0.5">
                  {caseForm.medicines.map((m, i) => (
                    <li key={i}>{m.name} — {m.dosage} ({m.anupana || caseForm.anupana})</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px]">ANUPANA & DIET:</span>
                <p className="text-[11px]">{caseForm.anupana}</p>
                <p className="text-[11px] text-slate-600 mt-1">{caseForm.pathya_apathya}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep(4)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
              ← Back to Edit Regimen
            </button>

            <button
              onClick={handleSaveAndSignCase}
              disabled={savingCase}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-3xl shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
              <span>{savingCase ? "Digitally Signing..." : "1-Click Sign & Prescribe"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Printable Prescription Modal */}
      <PrescriptionPrintModal
        caseData={savedCaseForPrint}
        patient={activePatient}
        isOpen={!!savedCaseForPrint}
        onClose={() => {
          setSavedCaseForPrint(null);
          setStep(1);
        }}
      />

    </div>
  );
}
