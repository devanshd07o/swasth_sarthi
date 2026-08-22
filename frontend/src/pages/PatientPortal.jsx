import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Activity, FileText, Sparkles, Clock, QrCode, ArrowRight, ShieldCheck, 
  Search, Star, CheckCircle2, AlertTriangle, Pill, HeartPulse, Mic, MicOff, 
  UploadCloud, ChevronRight, Stethoscope, MapPin, Calendar, Plus, RefreshCw, Eye, MessageSquare, Copy, Check 
} from 'lucide-react';
import { 
  lookupAbhaId, getDoctors, getPatientTimeline, createCase, 
  addSymptomLog, structureVoiceIntake, scanRedFlags, createPatient, getDoctorRatings,
  transcribeAudioGroqWhisper 
} from '../services/api';
import DoctorProfileModal from '../components/DoctorProfileModal';
import DocumentVaultModal from '../components/DocumentVaultModal';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';

export default function PatientPortal({ currentUser, lang = 'en' }) {
  // Active Tab within Patient Portal: 'dashboard' | 'wizard_flow' | 'symptom_diary' | 'document_vault'
  const [activeView, setActiveView] = useState('wizard_flow'); // Starts with intake wizard or dashboard
  
  // Wizard Steps (1: Identify, 2: Converse, 3: Scan, 4: Discover & Book, 5: Post-Booking Active Case)
  const [wizardStep, setWizardStep] = useState(1);

  // ─── Step 1: Identify & Consent ─────────────────────────────────────────────
  const [abhaInput, setAbhaInput] = useState(currentUser?.abha_id || 'ABHA-9821-4501');
  const [activePatient, setActivePatient] = useState(null);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [regForm, setRegForm] = useState({
    name: currentUser?.name || 'Rajesh Kumar',
    age: currentUser?.age || 40,
    gender: currentUser?.gender || 'male',
    contact: currentUser?.contact || '+91 9876543210',
    blood_group: currentUser?.blood_group || 'B+',
    address: currentUser?.address || 'New Delhi'
  });

  // ─── Step 2: Converse & Real STT (Groq Whisper) ─────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sttEngine, setSttEngine] = useState('Groq Whisper (whisper-large-v3)');
  const [structuredIntake, setStructuredIntake] = useState(null);
  const [isRedFlag, setIsRedFlag] = useState(false);
  const [redFlagReason, setRedFlagReason] = useState('');
  const [processingAi, setProcessingAi] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ─── Step 3: OCR Vault Records ──────────────────────────────────────────────
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [patientDocs, setPatientDocs] = useState([]);

  // ─── Step 4: Doctor Discovery & Booking ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [taxonomyMode, setTaxonomyMode] = useState('symptoms'); // 'symptoms' | 'specialization'
  const [selectedTaxonomyTag, setSelectedTaxonomyTag] = useState('All');
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessCase, setBookingSuccessCase] = useState(null);

  // ─── Step 5: Timeline & Active Case ─────────────────────────────────────────
  const [timelineData, setTimelineData] = useState(null);
  const [activePrescriptionForPrint, setActivePrescriptionForPrint] = useState(null);

  // ─── Symptom Diary ──────────────────────────────────────────────────────────
  const [diarySymptom, setDiarySymptom] = useState('');
  const [diarySeverity, setDiarySeverity] = useState('Moderate');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [savingDiary, setSavingDiary] = useState(false);

  // Initialize Speech Recognition for live typing preview
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      
      recog.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
        }
      };

      recog.onerror = (e) => {
        console.error('Live speech preview error', e);
      };

      recognitionRef.current = recog;
    }
  }, [lang]);

  // Real Groq Whisper Audio Recording Toggle
  const toggleListening = async () => {
    if (isListening) {
      // STOP recording -> Send audio blob to Groq Whisper STT API
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
    } else {
      // START recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop()); // release mic
          
          setProcessingAi(true);
          try {
            const res = await transcribeAudioGroqWhisper(audioBlob, lang === 'hi' ? 'hi' : 'en');
            if (res.text) {
              setTranscript(res.text);
              setSttEngine('Groq Whisper (whisper-large-v3) • Verified');
            }
          } catch (err) {
            console.error('Groq Whisper STT call failed', err);
          } finally {
            setProcessingAi(false);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsListening(true);

        if (recognitionRef.current) {
          try { recognitionRef.current.start(); } catch (_) {}
        }
      } catch (err) {
        console.warn('Microphone stream error, falling back to Web Speech API', err);
        if (recognitionRef.current) {
          try { recognitionRef.current.start(); setIsListening(true); } catch (_) {}
        }
      }
    }
  };

  // Load initial data
  useEffect(() => {
    loadDoctors();
    const targetAbha = currentUser?.abha_id || 'ABHA-9821-4501';
    setAbhaInput(targetAbha);
    handleLookupAbha(targetAbha);
  }, [currentUser?.abha_id, currentUser?.id]);

  const loadDoctors = async (taxTag = null) => {
    try {
      const params = {};
      if (taxTag && taxTag !== 'All') {
        if (taxonomyMode === 'symptoms') params.symptom = taxTag;
        else params.specialization = taxTag;
      }
      const data = await getDoctors(params);
      setDoctorsList(data);
    } catch (e) {
      console.error('Failed to load doctors', e);
    }
  };

  const [isLookingUpAbha, setIsLookingUpAbha] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [copiedAbha, setCopiedAbha] = useState(false);

  const handleLookupAbha = async (idToLookup) => {
    const id = (idToLookup || abhaInput || '').trim();
    if (!id) {
      setActivePatient(null);
      setTimelineData(null);
      setPatientDocs([]);
      return;
    }
    setIsLookingUpAbha(true);
    setLookupError('');
    try {
      const res = await lookupAbhaId(id);
      if (res && res.found) {
        setActivePatient(res.patient);
        setIsNewRegistration(false);
        setAbhaInput(res.patient.abha_id);
        setConsentAccepted(true);
        loadPatientHistory(res.patient.id);
      } else {
        setActivePatient(null);
        setTimelineData(null);
        setPatientDocs([]);
        setLookupError(`ABHA ID "${id}" not found on central ABDM.`);
      }
    } catch (err) {
      console.warn('ABHA lookup error', err);
      setActivePatient(null);
      setTimelineData(null);
      setPatientDocs([]);
      setLookupError(`ABHA ID "${id}" not found on central ABDM.`);
    } finally {
      setIsLookingUpAbha(false);
    }
  };

  const loadPatientHistory = async (patientId) => {
    try {
      const data = await getPatientTimeline(patientId);
      setTimelineData(data);
      if (data.document_vault) setPatientDocs(data.document_vault);
      // Check if there is an active recent case
      if (data.timeline && data.timeline.length > 0) {
        setBookingSuccessCase(data.timeline[0]);
      } else {
        setBookingSuccessCase(null);
      }
    } catch (err) {
      console.error('Failed to load timeline', err);
    }
  };

  const handleRegisterNewPatient = async (e) => {
    e.preventDefault();
    try {
      const created = await createPatient({
        ...regForm,
        consent_given: consentAccepted
      });
      setActivePatient(created);
      setIsNewRegistration(false);
      loadPatientHistory(created.id);
      setWizardStep(2);
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleAnalyzeVoiceTranscript = async () => {
    if (!transcript.trim()) return;
    setProcessingAi(true);
    try {
      const structured = await structureVoiceIntake(transcript, activePatient?.id, lang);
      setStructuredIntake(structured);
      setIsRedFlag(structured.is_red_flag || false);
      setRedFlagReason(structured.red_flag_reason || '');
    } catch (e) {
      console.error('Structuring failed', e);
    } finally {
      setProcessingAi(false);
    }
  };

  const handleBookConsultation = async () => {
    if (!bookingDoctor || !activePatient) return;
    try {
      const casePayload = {
        patient_id: activePatient.id,
        doctor_id: bookingDoctor.id,
        chief_complaints: structuredIntake?.chief_complaint || transcript || 'Regular OPD Follow-up Consultation',
        history_present_illness: structuredIntake?.hpi || bookingNotes || 'Patient registered consultation via MediKiosk portal.',
        prakriti: activePatient.prakriti || 'Vata-Kapha',
        vikriti: structuredIntake?.suspected_dosha || 'Vata Vriddhi',
        is_red_flag: isRedFlag,
        red_flag_reason: redFlagReason || null,
        intake_data: {
          transcript: transcript,
          structured: structuredIntake,
          notes: bookingNotes
        },
        status: isRedFlag ? 'active' : 'active',
        token_number: isRedFlag ? `EMERG-${Math.floor(100 + Math.random() * 900)}` : `OPD-${Math.floor(100 + Math.random() * 900)}`
      };
      const createdCase = await createCase(casePayload);
      setBookingSuccessCase(createdCase);
      setIsBookingModalOpen(false);
      setWizardStep(5); // Jump to active case view
      loadPatientHistory(activePatient.id);
    } catch (err) {
      alert('Failed to register consultation.');
    }
  };

  const handleAddSymptomLog = async (e) => {
    e.preventDefault();
    if (!diarySymptom.trim() || !activePatient) return;
    setSavingDiary(true);
    try {
      await addSymptomLog(activePatient.id, {
        date: new Date().toLocaleString(),
        symptom: diarySymptom,
        severity: diarySeverity,
        notes: diaryNotes
      });
      setDiarySymptom('');
      setDiaryNotes('');
      loadPatientHistory(activePatient.id);
    } catch (e) {
      alert('Failed to add symptom log');
    } finally {
      setSavingDiary(false);
    }
  };

  // Symptom Taxonomy Categories & Specialization Categories
  const symptomTags = ["All", "Joint Pain", "Ghutna Dard", "Acidity", "Digestion", "Skin / Twacha", "Headache", "Stress / Tanav", "Insomnia", "Diabetes", "Immunity"];
  const specializationTags = ["All", "Kayachikitsa (Internal Medicine)", "Panchakarma (Detox)", "Shalya Tantra (Surgery)", "Kaumarbhritya (Pediatrics)", "Rasayana (Rejuvenation)"];

  // Find previous doctor if any
  const previousDoctor = doctorsList.find(d => d.name.includes("Rajesh")) || doctorsList[0];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* ─── Top Master Identity & ABHA Banner ─────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activePatient?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
            alt={activePatient?.name || "Patient"}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                ABDM Central Health Portal • MediKiosk
              </span>
              {activePatient?.consent_given && (
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  DPDP Consent Active
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {activePatient ? `${activePatient.name}` : 'Ayurvedic Digital Health Kiosk'} 👋
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Single central clinical record • Voice intake with real-time STT • Red-Flag MedRoute triage.
            </p>
          </div>
        </div>

        {/* ABHA ID Card / Quick Copy */}
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <QrCode className="w-8 h-8 text-emerald-700 shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Central ABHA Identity</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-black text-emerald-950 font-mono tracking-wide">
                {activePatient?.abha_id || currentUser?.abha_id || 'ABHA-1102-3344'}
              </span>
              <button
                type="button"
                onClick={() => {
                  const idToCopy = activePatient?.abha_id || currentUser?.abha_id || 'ABHA-1102-3344';
                  navigator.clipboard.writeText(idToCopy);
                  setCopiedAbha(true);
                  setAbhaInput(idToCopy);
                  setTimeout(() => setCopiedAbha(false), 2000);
                }}
                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer"
                title="Copy ABHA ID to clipboard"
              >
                {copiedAbha ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-emerald-700" />}
                <span>{copiedAbha ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Sub-Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('wizard_flow')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'wizard_flow'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📋 5-Step Intake & Booking Wizard
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏥 Active Case & Prescriptions
          </button>

          <button
            onClick={() => setActiveView('symptom_diary')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'symptom_diary'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ✍️ Symptom Diary (Sheet 1)
          </button>

          <button
            onClick={() => setActiveView('document_vault')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeView === 'document_vault'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📂 OCR Document Vault ({patientDocs.length})
          </button>
        </div>

        {/* Wizard Step Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { s: 1, label: "1. Identify" },
            { s: 2, label: "2. Converse" },
            { s: 3, label: "3. Scan" },
            { s: 4, label: "4. Discover" },
            { s: 5, label: "5. Active Case" }
          ].map((stepObj) => (
            <button
              key={stepObj.s}
              onClick={() => {
                setActiveView('wizard_flow');
                setWizardStep(stepObj.s);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                wizardStep === stepObj.s && activeView === 'wizard_flow'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {stepObj.label}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── 5-STEP WIZARD VIEW ─────────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeView === 'wizard_flow' && (
        <div className="space-y-6">
          
          {/* ─── STEP 1: IDENTIFY & CONSENT ─────────────────────────────────── */}
          {wizardStep === 1 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 1 of 5 • Patient Identification
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Patient Intake & ABHA Identification
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Search an existing central ABHA ID or register a brand new patient from scratch (Fallback flow).
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewRegistration(false);
                    handleLookupAbha(abhaInput || currentUser?.abha_id || 'ABHA-9821-4501');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    !isNewRegistration
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>1. Verify Existing ABHA ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsNewRegistration(true);
                    setActivePatient(null);
                    setRegForm({
                      name: '',
                      age: 32,
                      gender: 'male',
                      contact: '',
                      blood_group: 'B+',
                      address: ''
                    });
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    isNewRegistration
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>2. Register Brand New Patient</span>
                </button>
              </div>

              {/* MODE A: EXISTING ABHA LOOKUP */}
              {!isNewRegistration && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Enter Central ABHA ID to verify health record:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={abhaInput}
                        onChange={(e) => setAbhaInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleLookupAbha(abhaInput);
                        }}
                        placeholder="e.g. ABHA-1102-3344"
                        className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 font-mono tracking-wide"
                      />
                      <button
                        type="button"
                        disabled={isLookingUpAbha}
                        onClick={() => handleLookupAbha(abhaInput)}
                        className={`px-6 py-3.5 rounded-2xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isLookingUpAbha
                            ? 'bg-slate-700 text-slate-200'
                            : (activePatient && activePatient.abha_id?.toLowerCase() === abhaInput.trim().toLowerCase())
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/20'
                        }`}
                      >
                        {isLookingUpAbha ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (activePatient && activePatient.abha_id?.toLowerCase() === abhaInput.trim().toLowerCase()) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>Verified ✓</span>
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5 text-slate-300" />
                            <span>Verify ABHA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {lookupError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center justify-between animate-fade-in shadow-2xs">
                      <span>⚠️ {lookupError}</span>
                      <button
                        type="button"
                        onClick={() => setIsNewRegistration(true)}
                        className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950"
                      >
                        + Register as New Patient
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Found & Verified Patient Info Card */}
              {activePatient && (activePatient.abha_id?.toLowerCase() === abhaInput.trim().toLowerCase()) && !isNewRegistration && (
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4 animate-fade-in shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={activePatient.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                        alt={activePatient.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-base text-slate-900">{activePatient.name}</h4>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Verified
                          </span>
                        </div>
                        <span className="text-xs text-emerald-800 font-mono font-bold">{activePatient.abha_id}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
                      {activePatient.gender.toUpperCase()} • {activePatient.age} yrs • Blood: {activePatient.blood_group || 'O+'}
                    </span>
                  </div>

                  {/* DPDP Consent Box */}
                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Digital Personal Data Protection (DPDP) Act Consent</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      "I hereby consent to store my encrypted health records on the ABDM central record, grant temporary access to consulting Ayurvedic Vaidyas, and allow AI-assisted clinical structuring and red-flag emergency scanning."
                    </p>
                    <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={consentAccepted}
                        onChange={(e) => setConsentAccepted(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span>I agree & accept the clinical data sharing terms</span>
                    </label>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setWizardStep(2)}
                      disabled={!consentAccepted}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Proceed to Voice Intake (Step 2)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* No ABHA Fallback Registration */}
              {isNewRegistration && (
                <form onSubmit={handleRegisterNewPatient} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-extrabold text-slate-800">Instant Fallback Registration (No ABHA)</span>
                    <span className="text-[10px] text-slate-400 font-bold">Auto-generates Central ID</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Age</label>
                      <input
                        type="number"
                        required
                        value={regForm.age}
                        onChange={(e) => setRegForm({ ...regForm, age: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Gender</label>
                      <select
                        value={regForm.gender}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={regForm.contact}
                        onChange={(e) => setRegForm({ ...regForm, contact: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={regForm.blood_group}
                        onChange={(e) => setRegForm({ ...regForm, blood_group: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-xs"
                  >
                    Generate ABHA ID & Proceed
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ─── STEP 2: CONVERSE (REAL STT & RED-FLAG SCAN) ────────────────── */}
          {wizardStep === 2 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Step 2 of 5 • Real Voice Intake
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    Speak Your Symptoms (आवाज़ से लक्षण बताएं)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Speak freely in Hindi, Hinglish, or English. Live speech-to-text with automated Red-Flag emergency scanning.
                  </p>
                </div>

                {/* Microphone Toggle Button */}
                <button
                  onClick={toggleListening}
                  className={`px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isListening ? "Listening... (Click to Stop)" : "Start Voice Input"}</span>
                </button>
              </div>

              {/* Sample Voice Triggers for Testing / Hackathon Demo */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Quick Voice Test Prompts (Click to test):</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTranscript("3 din se right knee me bahut tej dard aur subah akadpan ho raha hai, chalne me takleef hoti hai")}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-700 rounded-xl border border-slate-200 text-[11px] font-semibold"
                  >
                    🦵 Sandhivata / Knee Pain Statement
                  </button>
                  <button
                    onClick={() => setTranscript("Khaana khane ke baad seene me jalan hoti hai, khatti dakar aati hai aur neend nahi aati")}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-700 rounded-xl border border-slate-200 text-[11px] font-semibold"
                  >
                    🔥 Amlapitta / Heartburn Statement
                  </button>
                  <button
                    onClick={() => setTranscript("Mere chhati me bahut tej dard ho raha hai, saans lene me takleef ho rahi hai aur pasina aa raha hai")}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-200 text-[11px] font-bold"
                  >
                    🚨 Red-Flag Emergency Chest Pain Statement
                  </button>
                </div>
              </div>

              {/* Live Transcript Editable Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Live Transcript (You can edit or add details below):</span>
                  {isListening && <span className="text-[10px] font-bold text-rose-600 animate-pulse">● Microphone Active</span>}
                </label>
                <textarea
                  rows={4}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Your spoken words will appear here in real-time... (e.g. 3 din se knee pain hai aur subah stiffness hoti hai)..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <div className="flex flex-wrap justify-between items-center gap-2">
                <button
                  onClick={() => setWizardStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Identification
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !isRedFlag;
                      setIsRedFlag(nextState);
                      if (nextState && !redFlagReason) {
                        setRedFlagReason('Manual Emergency Override: Patient/Attendant indicated acute clinical distress.');
                      }
                    }}
                    className={`px-4 py-3 rounded-2xl font-extrabold text-xs border transition-all flex items-center gap-1.5 ${
                      isRedFlag
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm animate-pulse'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isRedFlag ? '🚨 Emergency Tag Active' : '🚨 Toggle Emergency Flag'}</span>
                  </button>

                  <button
                    onClick={handleAnalyzeVoiceTranscript}
                    disabled={processingAi || !transcript.trim()}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{processingAi ? "Structuring Clinical Facts..." : "AI Structure & Scan"}</span>
                  </button>
                </div>
              </div>

              {/* 🚨 RED-FLAG EMERGENCY ALERT BANNER (MedRoute v1 Trigger) */}
              {isRedFlag && (
                <div className="p-4 bg-rose-50 border-2 border-rose-500 rounded-3xl space-y-2 animate-bounce-short">
                  <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>MEDROUTE EMERGENCY ALERT: RED-FLAG KEYWORDS DETECTED</span>
                  </div>
                  <p className="text-xs text-rose-900 font-medium">
                    {redFlagReason || "Critical symptom detected (e.g. Acute severe chest pain / respiratory distress)."}
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-800 font-bold">
                    ⚠️ This consultation will be prioritized to the TOP of the Doctor's OPD Queue with an Emergency Flag!
                  </div>
                </div>
              )}

              {/* Structured AI Facts Display */}
              {structuredIntake && (
                <div className="p-5 bg-emerald-50/60 rounded-3xl border border-emerald-200 space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="font-extrabold text-emerald-950 uppercase text-[11px]">
                      Structured Clinical Intake (Physician-Ready)
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-700 text-white font-bold rounded-full text-[10px]">
                      Severity: {structuredIntake.severity || 'Moderate'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-bold block">CHIEF COMPLAINT</span>
                      <span className="font-extrabold text-slate-900">{structuredIntake.chief_complaint}</span>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-bold block">DURATION & HPI</span>
                      <span className="font-bold text-slate-800">{structuredIntake.duration || "3-6 days"} • {structuredIntake.hpi}</span>
                    </div>
                    <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                      <span className="text-[10px] text-slate-400 font-bold block">SUSPECTED DOSHA</span>
                      <span className="font-extrabold text-emerald-800">{structuredIntake.suspected_dosha || "Vata Imbalance"}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setWizardStep(3)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
                    >
                      <span>Proceed to Document Vault (Step 3)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ─── STEP 3: SCAN (OCR DOCUMENT VAULT) ──────────────────────────── */}
          {wizardStep === 3 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Step 3 of 5 • Scanned Medical Records
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    OCR Document Vault & Old Prescriptions
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload old paper prescriptions, blood reports, or X-rays. Scanned once, available to all consulting Vaidyas.
                  </p>
                </div>

                <button
                  onClick={() => setIsVaultModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Upload Old Report / Parchaa</span>
                </button>
              </div>

              {/* Uploaded Document List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 block">Existing Digitized Documents on Central ABHA Record:</span>
                {patientDocs.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    No documents uploaded yet. You can click "+ Upload Old Report" or skip to doctor discovery.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {patientDocs.map((doc, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 space-y-2 text-xs transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            {doc.file_name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {doc.file_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {doc.source_doctor_or_hospital} • {doc.date}
                        </p>
                        <p className="text-xs text-slate-700 font-medium">{doc.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={() => setWizardStep(2)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Voice Intake
                </button>

                <button
                  onClick={() => setWizardStep(4)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2"
                >
                  <span>Proceed to Doctor Discovery (Step 4)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 4: DOCTOR DISCOVERY & BOOKING ──────────────────────────── */}
          {wizardStep === 4 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Step 4 of 5 • Doctor Discovery & OPD Registration
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  Find & Consult Verified Ayurvedic Vaidyas
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Dual Taxonomy search (by symptom or classical specialty). Government-fixed nominal ₹100 registration fee.
                </p>
              </div>

              {/* ─── Pinned Previous Doctor Card (Continuity Priority) ───────── */}
              {previousDoctor && (
                <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-md relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <img
                        src={previousDoctor.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
                        alt={previousDoctor.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-sm"
                      />
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase">
                          Previous Consulting Doctor • Continuity of Care
                        </span>
                        <h4 className="text-lg font-black">{previousDoctor.name}</h4>
                        <p className="text-xs text-emerald-200">{previousDoctor.qualification}</p>
                        <p className="text-[11px] text-slate-300">{previousDoctor.hospital_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDoctorForProfile(previousDoctor)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                      >
                        View Profile & Reviews
                      </button>
                      <button
                        onClick={() => {
                          setBookingDoctor(previousDoctor);
                          setIsBookingModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all"
                      >
                        [Continue Follow-up]
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Smart AI Search Bar ────────────────────────────────────────── */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl text-white space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      Smart AI Vaidya Discovery Engine
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium">
                    Semantic match across symptoms, classical doshas & hospitals
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type or ask AI (e.g. 'घुटने में दर्द', 'acidity after eating', 'skin allergy', 'Dr. Rajesh', 'AIIA Delhi')..."
                    className="w-full pl-11 pr-24 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-xs font-bold text-white placeholder-slate-400 focus:outline-none focus:bg-white/15 focus:border-emerald-400 transition-all backdrop-blur-md"
                  />
                  <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 top-3.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick AI Search Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span className="text-slate-400 font-semibold">AI Suggestions:</span>
                  {[
                    { label: "🦵 Joint Pain & Arthritis", q: "Joint Pain" },
                    { label: "🔥 Acidity & GERD", q: "Acidity" },
                    { label: "🌿 Panchakarma Detox", q: "Panchakarma" },
                    { label: "✨ Skin & Twacha Roga", q: "Skin" },
                    { label: "🧠 Stress & Insomnia", q: "Stress" }
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(sug.q)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg text-emerald-200 font-bold transition-all"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── Dual Taxonomy Switcher ──────────────────────────────────── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Filter Doctors by:</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        setTaxonomyMode('symptoms');
                        setSelectedTaxonomyTag('All');
                        setSearchQuery('');
                        loadDoctors();
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        taxonomyMode === 'symptoms' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      🩺 By Common Symptoms (लक्षण)
                    </button>
                    <button
                      onClick={() => {
                        setTaxonomyMode('specialization');
                        setSelectedTaxonomyTag('All');
                        setSearchQuery('');
                        loadDoctors();
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        taxonomyMode === 'specialization' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      🏛️ By Specialization (अष्टांग आयुर्वेद)
                    </button>
                  </div>
                </div>

                {/* Taxonomy Pills List */}
                <div className="flex flex-wrap gap-1.5">
                  {(taxonomyMode === 'symptoms' ? symptomTags : specializationTags).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTaxonomyTag(tag);
                        loadDoctors(tag);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedTaxonomyTag === tag
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctors Directory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctorsList
                  .filter((doc) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    const nameMatch = doc.name.toLowerCase().includes(q);
                    const qualMatch = (doc.qualification || '').toLowerCase().includes(q);
                    const hospMatch = (doc.hospital_name || '').toLowerCase().includes(q);
                    const specMatch = (doc.specializations || []).some((s) => s.toLowerCase().includes(q));
                    const sympMatch = (doc.symptom_tags || []).some((s) => s.toLowerCase().includes(q));
                    return nameMatch || qualMatch || hospMatch || specMatch || sympMatch;
                  })
                  .map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between animate-fade-in"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
                          alt={doc.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-slate-900">{doc.name}</h4>
                            <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{doc.rating_avg || 4.9}</span>
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-semibold">{doc.qualification}</p>
                          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {doc.hospital_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(doc.specializations || []).map((s, idx) => (
                          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                            {s}
                          </span>
                        ))}
                        {(doc.symptom_tags || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Nominal Fee</span>
                        <span className="text-xs font-black text-slate-900">₹{doc.consultation_fee || 100}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDoctorForProfile(doc)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                        >
                          Reviews
                        </button>
                        <button
                          onClick={() => {
                            setBookingDoctor(doc);
                            setIsBookingModalOpen(true);
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs"
                        >
                          Register Case
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ─── STEP 5: POST-BOOKING (ACTIVE CASE PILL & DIGITAL RECORD) ────── */}
          {wizardStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              {!(bookingSuccessCase || timelineData?.timeline?.length > 0) ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900">No Active Case Registered Yet</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      You haven't booked an active OPD token today. Discover verified Vaidyas in Step 4 to register your case.
                    </p>
                  </div>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20"
                  >
                    Find & Book a Doctor (Step 4) →
                  </button>
                </div>
              ) : (
                (() => {
                  const currentCase = bookingSuccessCase || timelineData?.timeline?.[0];
                  return (
                    <div className="space-y-6">
                      {/* Active Case Header Pill */}
                      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        currentCase?.is_red_flag
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              currentCase?.is_red_flag
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-emerald-700 text-white'
                            }`}>
                              {currentCase?.is_red_flag ? '🚨 MedRoute Emergency Case' : '● Active OPD Consultation'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700">
                              Token: {currentCase?.token_number || "OPD-101"}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900">
                            Consultation with {currentCase?.doctor_name || "Dr. Rajesh Vaidya"}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">
                            {currentCase?.hospital_name || "All India Institute of Ayurveda"} • Today's Queue Slot
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveView('dashboard')}
                            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View Digital Prescription & Diet</span>
                          </button>
                        </div>
                      </div>

                      {/* Notification Banner */}
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 text-xs">
                        <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-slate-700 font-medium">
                          Your case sheet has been securely transmitted to the Vaidya's Clinical Console. When your token is called, the Vaidya will examine Nadi & Prakriti and digitally sign your prescription.
                        </p>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── DASHBOARD VIEW (ACTIVE CASE, PRESCRIPTIONS & DIET) ─────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeView === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Active Case Top Pill */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Doctor's Verified Case Sheet (Sheet 2)
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Official Digital Prescriptions & Treatment History
                </h3>
              </div>

              <span className="text-xs font-bold text-slate-400">
                Central ABDM Synchronized
              </span>
            </div>

            {/* List of Consultations / Prescriptions */}
            {timelineData?.timeline?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No consultations recorded yet. Start by booking a consultation in the wizard.
              </div>
            ) : (
              <div className="space-y-4">
                {timelineData?.timeline?.map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50/70 hover:bg-emerald-50/40 rounded-3xl border border-slate-200 space-y-4 text-xs transition-all">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{item.doctor_name}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {item.token_number || "OPD-101"}
                          </span>
                          {item.prescription_signed && (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-teal-600" />
                              Digitally Signed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {item.hospital_name} • Consultation Date: {item.date}
                        </p>
                      </div>

                      <button
                        onClick={() => setActivePrescriptionForPrint({ ...item, hospital_name: item.hospital_name })}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View / Print Prescription PDF</span>
                      </button>
                    </div>

                    {/* Clinical Findings & Diagnosis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Ayurvedic Diagnosis</span>
                        <p className="font-black text-emerald-900 text-sm">{item.diagnosis_ayurvedic || "Sandhivata (Osteoarthritis)"}</p>
                        {item.diagnosis_modern && <p className="text-slate-500 font-medium text-[11px]">Modern: {item.diagnosis_modern}</p>}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Prakriti & Vikriti</span>
                        <p className="font-bold text-slate-800">{item.prakriti || "Vata-Kapha"} | {item.vikriti || "Vata Vriddhi"}</p>
                      </div>
                    </div>

                    {/* Prescribed Medicines */}
                    {item.medicines && item.medicines.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Prescribed Medicines:</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {item.medicines.map((med, mIdx) => (
                            <div key={mIdx} className="p-2.5 bg-white rounded-xl border border-slate-200">
                              <span className="font-extrabold text-slate-900 block">{med.name}</span>
                              <span className="text-slate-600 text-[11px] block">{med.dosage} • {med.duration}</span>
                              <span className="text-emerald-700 font-semibold text-[10px]">Anupana: {med.anupana || item.anupana || "Warm Water"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pathya-Apathya Diet Plan */}
                    {item.pathya_apathya && (
                      <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-[11px] text-amber-950 font-medium">
                        <span className="font-bold text-amber-800 uppercase block text-[10px] mb-0.5">Pathya - Apathya Diet Regimen:</span>
                        <p>{item.pathya_apathya}</p>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── SYMPTOM DIARY (SHEET 1) ────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeView === 'symptom_diary' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Patient Running Log (Sheet 1)
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              Patient Self-Reported Symptom Diary
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Log daily flare-ups, dietary triggers, or pain changes so your Vaidya can review the complete longitudinal trend.
            </p>
          </div>

          {/* Add Symptom Diary Entry Form */}
          <form onSubmit={handleAddSymptomLog} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Today's Symptom / Observation</label>
                <input
                  type="text"
                  required
                  value={diarySymptom}
                  onChange={(e) => setDiarySymptom(e.target.value)}
                  placeholder="e.g. Subah ghutne me 20 min stiffness rahi / Khaane ke baad acidity..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Severity Level</label>
                <select
                  value={diarySeverity}
                  onChange={(e) => setDiarySeverity(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Mild">Mild (हल्का)</option>
                  <option value="Moderate">Moderate (मध्यम)</option>
                  <option value="Severe">Severe (गंभीर)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Triggers or Relief Notes (Optional)</label>
              <textarea
                rows={2}
                value={diaryNotes}
                onChange={(e) => setDiaryNotes(e.target.value)}
                placeholder="e.g. Warm water lene se aaram mila / Thanda paani peene par badh gaya..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={savingDiary}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-xs"
            >
              {savingDiary ? "Saving..." : "+ Save Entry to Symptom Diary"}
            </button>
          </form>

          {/* Running Diary Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 block">Logged Symptom History:</span>
            {(timelineData?.symptom_diary || []).length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                No symptom diary entries yet. Use the box above to log symptoms anytime.
              </div>
            ) : (
              <div className="space-y-2.5">
                {timelineData?.symptom_diary?.map((entry, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{entry.symptom}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          entry.severity === 'Severe' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {entry.severity}
                        </span>
                      </div>
                      {entry.notes && <p className="text-slate-600 text-[11px]">{entry.notes}</p>}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">{entry.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ─── OCR DOCUMENT VAULT VIEW ────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activeView === 'document_vault' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Central ABDM Vault
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                Patient OCR Document Vault
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Physical prescriptions, hospital discharge summaries, radiology scans & pathology lab reports.
              </p>
            </div>

            <button
              onClick={() => setIsVaultModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-xs flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {patientDocs.map((doc, idx) => (
              <div key={idx} className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    {doc.file_name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {doc.file_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Source: {doc.source_doctor_or_hospital} • {doc.date}
                </p>
                <p className="text-slate-700 font-medium leading-relaxed">{doc.summary}</p>
                {doc.extracted_data && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[10px] text-slate-600">
                    <span className="font-bold text-slate-400 block mb-0.5">OCR Extracted Data:</span>
                    <pre className="font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(doc.extracted_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}
      {/* 1. Doctor Profile & Reviews Modal */}
      <DoctorProfileModal
        doctor={selectedDoctorForProfile}
        isOpen={!!selectedDoctorForProfile}
        onClose={() => setSelectedDoctorForProfile(null)}
        onBookConsultation={(doc) => {
          setSelectedDoctorForProfile(null);
          setBookingDoctor(doc);
          setIsBookingModalOpen(true);
        }}
        lang={lang}
      />

      {/* 2. Document Vault Upload Modal */}
      <DocumentVaultModal
        patientId={activePatient?.id}
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onDocumentUploaded={(newDoc) => {
          setPatientDocs([newDoc, ...patientDocs]);
        }}
        lang={lang}
      />

      {/* 3. Prescription Print / PDF Modal */}
      <PrescriptionPrintModal
        caseData={activePrescriptionForPrint}
        patient={activePatient}
        doctor={bookingDoctor || previousDoctor}
        isOpen={!!activePrescriptionForPrint}
        onClose={() => setActivePrescriptionForPrint(null)}
      />

      {/* 4. Booking Confirmation Modal (Gov-Fixed Nominal ₹100 Fee) */}
      {isBookingModalOpen && bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Register New Consultation
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Confirm OPD Booking with {bookingDoctor.name}
                </h3>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-800 text-lg font-bold">
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Linked Patient ABHA ID</span>
              <span className="font-extrabold text-slate-900 text-sm">{activePatient?.name} ({activePatient?.abha_id})</span>
              <p className="text-[11px] text-slate-500">{bookingDoctor.hospital_name} • Slot: Today</p>
            </div>

            {/* Current Condition Field (Pre-filled from Converse step) */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Condition / Symptoms</label>
              <textarea
                rows={3}
                value={bookingNotes || structuredIntake?.chief_complaint || transcript}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="State your complaints or let AI pre-fill from your voice intake..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
              />
            </div>

            {/* OCR Document Vault Entry Point in Booking Flow */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Attach Old Reports / Prescriptions</span>
                <span className="text-[11px] font-semibold text-slate-700">
                  {patientDocs.length > 0 ? `${patientDocs.length} Documents Linked in Vault` : "No old records attached"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVaultModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-xs flex items-center gap-1"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Attach Scanned Report</span>
              </button>
            </div>

            {/* Emergency Triage Override Toggle in Booking Modal */}
            <div className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
              isRedFlag ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-700 block">
                  Priority Triage / Emergency Status
                </span>
                <span className={`text-[11px] font-bold ${isRedFlag ? 'text-rose-700 animate-pulse' : 'text-slate-500'}`}>
                  {isRedFlag ? '🚨 Priority 1: Emergency Red-Flag Active (Bypasses queue)' : '● Standard Routine OPD Queue'}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRedFlag}
                  onChange={(e) => {
                    setIsRedFlag(e.target.checked);
                    if (e.target.checked && !redFlagReason) {
                      setRedFlagReason('Manual Emergency Override tagged during booking.');
                    }
                  }}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">Mark Emergency</span>
              </label>
            </div>

            {/* Nominal Gov Fee Anti-Spam Pill */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Government-Fixed Fee</span>
                <span className="text-sm font-black text-slate-900">₹{bookingDoctor.consultation_fee || 100}</span>
              </div>
              <span className="text-[11px] text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                Anti-Fake Registration Deterrent
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleBookConsultation}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-sm"
              >
                Confirm & Pay ₹100
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
