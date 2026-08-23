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

export default function AyurSaarthiCaseForm({ onCaseSaved, onSelectPatientTimeline, currentDoctorId = "DOC-AYUR-101", currentUser, lang = 'en' }) {
  const { t } = useTranslation();
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
      
      {/* ─── Top Clinical Header ────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mt-1.5">
            {t('caseForm.title', 'Digital Patient Consultation')}
          </h2>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="flex items-center justify-center w-full max-w-3xl">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-2 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                  step === s.num
                    ? 'bg-emerald-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5 text-white" /> : s.num}
                </div>
                <span className={`text-[10px] uppercase font-semibold absolute top-10 whitespace-nowrap ${
                  step === s.num ? 'text-emerald-700' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
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

      {/* ─── Patient Selector Strip ─────────────────────────────────────────── */}
      <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs mt-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <User className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="w-full">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{t('caseForm.consultingPatient', 'Consulting Patient')}</span>
            <div className="flex items-center gap-2">
              {!isNewPatient ? (
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 font-bold text-slate-900 rounded-xl p-2.5 text-xs w-full sm:w-80 outline-none focus:border-emerald-500"
                >
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.abha_id || p.uhid})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input type="text" placeholder={t('caseForm.patientName')} value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 w-40"/>
                  <input type="number" placeholder={t('caseForm.age')} value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 w-20"/>
                </div>
              )}
              <button
                onClick={() => setIsNewPatient(!isNewPatient)}
                className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-[10px] uppercase cursor-pointer"
              >
                {isNewPatient ? t('common.cancel') : t('caseForm.newPatient', 'New Patient')}
              </button>
            </div>
          </div>
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
