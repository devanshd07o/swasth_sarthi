import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud } from 'lucide-react';
import { 
  lookupAbhaId, getDoctors, getPatientTimeline, createCase, 
  addSymptomLog, structureVoiceIntake, createPatient,
  transcribeAudioGroqWhisper, sendAuthOtp, verifyAuthOtp,
  generateFollowupQuestions, generateSummaryPdf,
  analyseTranscriptGaps, completeStructuring, extractQAPill
} from '../services/api';
import DoctorProfileModal from '../components/DoctorProfileModal';
import DocumentVaultModal from '../components/DocumentVaultModal';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';

import PatientHeader from './patient/PatientHeader';
import PatientNavTabs from './patient/PatientNavTabs';
import WizardStep1Identify from './patient/WizardStep1Identify';
import WizardStep2Voice from './patient/WizardStep2Voice';
import WizardStep3Vault from './patient/WizardStep3Vault';
import WizardStep4Discover from './patient/WizardStep4Discover';
import WizardStep5ActiveCase from './patient/WizardStep5ActiveCase';
import SymptomDiaryView from './patient/SymptomDiaryView';
import RecentFollowupsView from './patient/RecentFollowupsView';

export default function PatientPortal({ currentUser, lang = 'en', initialView = 'dashboard' }) {
  const { t } = useTranslation();

  const [activeView, setActiveView] = useState(initialView);

  React.useEffect(() => {
    if (initialView) setActiveView(initialView);
  }, [initialView]);

  const handleReset5StepWizard = () => {
    setWizardStep(1);
    setMaxUnlockedStep(1);
    localStorage.setItem('ss_wizard_step', '1');
    localStorage.setItem('ss_max_unlocked_step', '1');
    setTranscript('');
    setStructuredIntake(null);
    setGapAnswers({});
    setAiExtractedPills([]);
    setBookingSuccessCase(null);
    setBookingDoctor(null);
    setActiveView('wizard_flow');
  };

  const [wizardStep, setWizardStep] = useState(() => {
    try {
      const saved = localStorage.getItem('ss_wizard_step');
      return saved ? parseInt(saved, 10) : 1;
    } catch (_) {
      return 1;
    }
  });

  const [maxUnlockedStep, setMaxUnlockedStep] = useState(() => {
    try {
      const saved = localStorage.getItem('ss_max_unlocked_step');
      return saved ? parseInt(saved, 10) : 1;
    } catch (_) {
      return 1;
    }
  });

  const changeWizardStep = (stepNum) => {
    setWizardStep(stepNum);
    setMaxUnlockedStep(prev => {
      const nextMax = Math.max(prev, stepNum);
      localStorage.setItem('ss_max_unlocked_step', String(nextMax));
      return nextMax;
    });
    localStorage.setItem('ss_wizard_step', String(stepNum));
  };

  // Step 1 State
  const [abhaInput, setAbhaInput] = useState(currentUser?.abha_id || 'ABHA-9821-4501');
  const [activePatient, setActivePatient] = useState(null);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [isLookingUpAbha, setIsLookingUpAbha] = useState(false);
  const [lookupError, setLookupError] = useState('');
  
  const [regForm, setRegForm] = useState({
    name: currentUser?.name || 'Ramesh Sharma',
    age: currentUser?.age || 40,
    gender: currentUser?.gender || 'male',
    contact: currentUser?.contact || '+91 9876543210',
    blood_group: currentUser?.blood_group || 'B+',
    address: currentUser?.address || 'New Delhi'
  });
  const [regOtpStep, setRegOtpStep] = useState('details');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpSessionId, setRegOtpSessionId] = useState('');
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  const [regOtpError, setRegOtpError] = useState('');

  // Step 2 State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [structuredIntake, setStructuredIntake] = useState(null);
  const [isRedFlag, setIsRedFlag] = useState(false);
  const [redFlagReason, setRedFlagReason] = useState('');
  const [processingAi, setProcessingAi] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Step 2 — 3-Phase Intake Workflow
  const [intakePhase, setIntakePhase] = useState('input'); // 'input' | 'gap_qa' | 'complete'
  const [gapQuestions, setGapQuestions] = useState([]);
  const [gapAnswers, setGapAnswers] = useState({});
  const [gapIndex, setGapIndex] = useState(0);
  const [partialStructure, setPartialStructure] = useState(null);
  const [analysingGaps, setAnalysingGaps] = useState(false);
  const [completingStructure, setCompletingStructure] = useState(false);

  // Step 2 — Send to Doctor
  const [isSendDoctorOpen, setIsSendDoctorOpen] = useState(false);
  const [sendingToDoctor, setSendingToDoctor] = useState(false);

  // Step 2 — Follow-up Q&A (legacy, keeping for compatibility)
  const [followupQuestions, setFollowupQuestions] = useState([]);
  const [followupAnswers, setFollowupAnswers] = useState({});
  const [followupIndex, setFollowupIndex] = useState(0);
  const [generatingFollowup, setGeneratingFollowup] = useState(false);
  const [followupComplete, setFollowupComplete] = useState(false);
  const [generatingSummaryPdf, setGeneratingSummaryPdf] = useState(false);
  const [followupListeningIdx, setFollowupListeningIdx] = useState(null);
  const followupRecorderRef = useRef(null);
  const followupChunksRef = useRef([]);

  // Gap Q&A mic ref
  const gapRecorderRef = useRef(null);
  const gapChunksRef = useRef([]);
  const gapStreamRef = useRef(null);
  const gapRecogRef = useRef(null);
  const gapBaseRef = useRef('');
  const [gapListeningIdx, setGapListeningIdx] = useState(null);

  // Step 3 State
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [patientDocs, setPatientDocs] = useState([]);

  // Step 4 State
  const [searchQuery, setSearchQuery] = useState('');
  const [taxonomyMode, setTaxonomyMode] = useState('symptoms');
  const [selectedTaxonomyTag, setSelectedTaxonomyTag] = useState('All');
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState(null);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccessCase, setBookingSuccessCase] = useState(null);

  // Step 5 State
  const [timelineData, setTimelineData] = useState(null);
  const [activePrescriptionForPrint, setActivePrescriptionForPrint] = useState(null);

  // Diary State
  const [diarySymptom, setDiarySymptom] = useState('');
  const [diarySeverity, setDiarySeverity] = useState('Moderate');
  const [diaryNotes, setDiaryNotes] = useState('');
  const [savingDiary, setSavingDiary] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      
      recog.onresult = (event) => {
        let sessionText = '';
        for (let i = 0; i < event.results.length; i++) {
          sessionText += event.results[i][0].transcript;
        }
        if (sessionText.trim()) {
          // Append session text to whatever was there before mic started
          const base = transcriptBaseRef.current;
          setTranscript(base ? base.trimEnd() + ' ' + sessionText.trim() : sessionText.trim());
        }
      };

      recog.onerror = (e) => {
        console.error('Live speech preview error', e);
      };

      recognitionRef.current = recog;
    }
  }, [lang]);

  // Holds the transcript text captured at mic-start, so each session appends rather than replaces
  const transcriptBaseRef = useRef('');

  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
    } else {
      // Capture current transcript as the base for this new session
      transcriptBaseRef.current = transcript;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          
          setProcessingAi(true);
          try {
            const res = await transcribeAudioGroqWhisper(audioBlob, lang === 'hi' ? 'hi' : 'en');
            if (res.text) {
              // Append Groq result to the base (don't replace)
              setTranscript(prev => {
                const base = transcriptBaseRef.current;
                return base ? base.trimEnd() + ' ' + res.text.trim() : res.text.trim();
              });
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
      if (res && res.patient) {
        setActivePatient(res.patient);
        setIsNewRegistration(false);
        setAbhaInput(res.patient.abha_id);
        setConsentAccepted(true);
        try {
          localStorage.setItem('ss_active_patient_id', res.patient.id);
          localStorage.setItem('ss_active_patient', JSON.stringify(res.patient));
        } catch (_) {}
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
      
      // Merge signed prescriptions from localStorage key 'ss_patient_signed_prescriptions'
      try {
        const localSigned = JSON.parse(localStorage.getItem('ss_patient_signed_prescriptions') || '[]');
        const curAbha = activePatient?.abha_id || abhaInput;
        const matchingLocal = localSigned.filter(s => s.patient_id === patientId || s.abha_id === curAbha || (activePatient && s.patient_name === activePatient.name));
        if (matchingLocal.length > 0) {
          const combinedTimeline = [...matchingLocal, ...(data?.timeline || [])];
          const seen = new Set();
          const uniqueTimeline = combinedTimeline.filter(item => {
            const k = item.id || item.case_id;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          data.timeline = uniqueTimeline;
        }
      } catch (_) {}

      setTimelineData(data);
      if (data.document_vault) setPatientDocs(data.document_vault);
      if (data.timeline && data.timeline.length > 0) {
        setBookingSuccessCase(data.timeline[0]);
      } else {
        setBookingSuccessCase(null);
      }
    } catch (err) {
      console.error('Failed to load timeline', err);
    }
  };

  const handleSendRegOtp = async (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.contact.trim() || !regForm.age) {
      alert('Please fill in Full Name, Age, and Mobile Number.');
      return;
    }
    setRegOtpError('');
    setRegOtpLoading(true);
    try {
      const res = await sendAuthOtp(regForm.contact.trim(), 'patient');
      setRegOtpSessionId(res.session_id);
      setRegOtpStep('otp');
    } catch (err) {
      setRegOtpError('Failed to send registration OTP. Try again.');
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleVerifyRegOtpAndRegister = async (e) => {
    e.preventDefault();
    if (!regOtpCode.trim() || regOtpCode.trim().length < 4) {
      setRegOtpError('Please enter 6-digit OTP code (e.g. 123456).');
      return;
    }
    setRegOtpError('');
    setRegOtpLoading(true);
    try {
      await verifyAuthOtp(regForm.contact.trim(), regOtpCode.trim(), regOtpSessionId, 'patient');
      const created = await createPatient({ ...regForm, consent_given: true });
      setActivePatient(created);
      setIsNewRegistration(false);
      setRegOtpStep('details');
      setConsentAccepted(true);
      loadPatientHistory(created.id);
      setWizardStep(2);
    } catch (err) {
      setRegOtpError(err.message || 'Invalid OTP code. Please enter 123456.');
    } finally {
      setRegOtpLoading(false);
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

  // ── New 3-Phase Intake Handlers ─────────────────────────────────────────────

  const handleAnalyseGaps = async () => {
    if (!transcript.trim()) return;
    setAnalysingGaps(true);
    setGapQuestions([]);
    setGapAnswers({});
    setGapIndex(0);
    setPartialStructure(null);
    setIntakePhase('input');
    try {
      const res = await analyseTranscriptGaps(transcript, activePatient?.id, lang);
      setPartialStructure(res.partial_structure);
      setIsRedFlag(res.is_red_flag || false);
      setRedFlagReason(res.red_flag_reason || '');
      if (res.gap_questions && res.gap_questions.length > 0) {
        setGapQuestions(res.gap_questions);
        setIntakePhase('gap_qa');
      } else {
        // No gaps — go straight to complete structuring
        await _runCompleteStructuring(transcript, []);
      }
    } catch (e) {
      console.error('Gap analysis failed', e);
    } finally {
      setAnalysingGaps(false);
    }
  };

  const stopActiveGapMic = () => {
    if (gapRecogRef.current) {
      try { gapRecogRef.current.stop(); } catch (_) {}
      gapRecogRef.current = null;
    }
    if (gapRecorderRef.current && gapRecorderRef.current.state === 'recording') {
      try { gapRecorderRef.current.stop(); } catch (_) {}
    }
    if (gapStreamRef.current) {
      gapStreamRef.current.getTracks().forEach(t => t.stop());
      gapStreamRef.current = null;
    }
    setGapListeningIdx(null);
  };

  const [aiExtractedPills, setAiExtractedPills] = useState([]);

  const handleGapAnswer = (idx, answer) => {
    setGapAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const handleGapNext = async () => {
    stopActiveGapMic();
    const currentQ = gapQuestions[gapIndex];
    const currentAns = gapAnswers[gapIndex];

    if (currentQ && currentAns && currentAns.trim() && currentAns !== '—' && currentAns !== 'skipped') {
      try {
        const pill = await extractQAPill(currentQ.question, currentAns, lang);
        if (pill) {
          setAiExtractedPills(prev => {
            if (!prev.includes(pill)) return [...prev, pill];
            return prev;
          });
        }
      } catch (_) {}
    }

    const nextIdx = gapIndex + 1;
    if (nextIdx >= gapQuestions.length) {
      await handleCompleteStructuring();
    } else {
      setGapIndex(nextIdx);
    }
  };

  const handleGapSkip = async () => {
    stopActiveGapMic();
    handleGapAnswer(gapIndex, '—');
    const nextIdx = gapIndex + 1;
    if (nextIdx >= gapQuestions.length) {
      await handleCompleteStructuring();
    } else {
      setGapIndex(nextIdx);
    }
  };

  const toggleGapListening = async (idx) => {
    if (gapListeningIdx === idx) {
      stopActiveGapMic();
      return;
    }

    stopActiveGapMic();
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch (_) {}
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsListening(false);
    }

    const baseText = gapAnswers[idx] || '';
    gapBaseRef.current = baseText;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      gapStreamRef.current = stream;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

        recog.onresult = (event) => {
          let sessionText = '';
          for (let i = 0; i < event.results.length; i++) {
            sessionText += event.results[i][0].transcript;
          }
          if (sessionText.trim()) {
            const base = gapBaseRef.current;
            setGapAnswers(prev => ({
              ...prev,
              [idx]: base ? base.trimEnd() + ' ' + sessionText.trim() : sessionText.trim()
            }));
          }
        };
        recog.onerror = (e) => console.warn('Gap WebSpeech error', e);
        gapRecogRef.current = recog;
        try { recog.start(); } catch (_) {}
      }

      const recorder = new MediaRecorder(stream);
      gapChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) gapChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(gapChunksRef.current, { type: 'audio/webm' });
        try {
          const res = await transcribeAudioGroqWhisper(blob, lang === 'hi' ? 'hi' : 'en');
          if (res.text && res.text.trim()) {
            setGapAnswers(prev => {
              const currentVal = prev[idx] || '';
              if (!currentVal.includes(res.text.trim())) {
                const base = gapBaseRef.current;
                return {
                  ...prev,
                  [idx]: base ? base.trimEnd() + ' ' + res.text.trim() : res.text.trim()
                };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Groq Whisper gap STT error', err);
        }
      };

      gapRecorderRef.current = recorder;
      recorder.start();
      setGapListeningIdx(idx);
    } catch (err) {
      console.warn('Gap mic error', err);
      alert('Could not access microphone.');
    }
  };

  const _runCompleteStructuring = async (rawTranscript, qaPairs) => {
    setCompletingStructure(true);
    try {
      const structured = await completeStructuring(rawTranscript, qaPairs, activePatient?.id, lang);
      setStructuredIntake(structured);
      setIsRedFlag(structured.is_red_flag || false);
      setRedFlagReason(structured.red_flag_reason || '');
      setIntakePhase('complete');
    } catch (e) {
      console.error('Complete structuring failed', e);
    } finally {
      setCompletingStructure(false);
    }
  };

  const handleCompleteStructuring = async () => {
    const qaPairs = gapQuestions.map((gq, i) => ({
      field: gq.field,
      question: gq.question,
      answer: gapAnswers[i] || '—'
    }));
    await _runCompleteStructuring(transcript, qaPairs);
  };

  const handleSendToDoctor = async (doctor) => {
    if (!activePatient || !structuredIntake || !doctor) return;
    setSendingToDoctor(true);
    try {
      const gapQA = gapQuestions.map((gq, i) => ({ question: gq.question, answer: gapAnswers[i] || '—' }));
      const casePayload = {
        patient_id: activePatient.id,
        doctor_id: doctor.id,
        chief_complaints: structuredIntake.chief_complaint || transcript,
        history_present_illness: structuredIntake.hpi || structuredIntake.clinical_summary || transcript,
        prakriti: activePatient.prakriti || 'Vata-Kapha',
        vikriti: structuredIntake.suspected_dosha || 'Vata Vriddhi',
        is_red_flag: isRedFlag,
        red_flag_reason: redFlagReason || null,
        intake_data: {
          transcript,
          partial_structure: partialStructure,
          structured: structuredIntake,
          gap_qa: gapQA,
          documents: patientDocs
        },
        status: 'active',
        token_number: isRedFlag ? `EMERG-${Math.floor(100 + Math.random() * 900)}` : `OPD-${Math.floor(100 + Math.random() * 900)}`
      };
      const createdCase = await createCase(casePayload);
      setBookingSuccessCase(createdCase);
      setBookingDoctor(doctor);
      setIsSendDoctorOpen(false);
      changeWizardStep(5);
      setActiveView('wizard_flow');
      loadPatientHistory(activePatient.id);
    } catch (err) {
      alert('Failed to send to doctor. Please try again.');
    } finally {
      setSendingToDoctor(false);
    }
  };

  const handleResetIntake = () => {
    stopActiveGapMic();
    setIntakePhase('input');
    setGapQuestions([]);
    setGapAnswers({});
    setGapIndex(0);
    setPartialStructure(null);
    setStructuredIntake(null);
    setIsRedFlag(false);
    setRedFlagReason('');
  };

  const handleGenerateFollowupQuestions = async () => {
    if (!structuredIntake) return;
    setGeneratingFollowup(true);
    setFollowupQuestions([]);
    setFollowupAnswers({});
    setFollowupIndex(0);
    setFollowupComplete(false);
    try {
      const res = await generateFollowupQuestions({
        chief_complaint: structuredIntake.chief_complaint || transcript,
        symptoms: structuredIntake.symptoms || [],
        suspected_dosha: structuredIntake.suspected_dosha || '',
        patient_age: activePatient?.age || 35,
        patient_gender: activePatient?.gender || 'male',
        language: lang
      });
      setFollowupQuestions(res.questions || []);
    } catch (e) {
      console.error('Followup generation failed', e);
    } finally {
      setGeneratingFollowup(false);
    }
  };

  const handleFollowupAnswer = (idx, answer) => {
    setFollowupAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const handleFollowupNext = () => {
    const nextIdx = followupIndex + 1;
    if (nextIdx >= followupQuestions.length) {
      setFollowupComplete(true);
    } else {
      setFollowupIndex(nextIdx);
    }
  };

  const handleFollowupSkip = () => {
    handleFollowupAnswer(followupIndex, '—');
    handleFollowupNext();
  };

  const toggleFollowupListening = async (idx) => {
    if (followupListeningIdx === idx) {
      if (followupRecorderRef.current?.state === 'recording') {
        followupRecorderRef.current.stop();
      }
      setFollowupListeningIdx(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      followupChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) followupChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(followupChunksRef.current, { type: 'audio/webm' });
        try {
          const res = await transcribeAudioGroqWhisper(blob, lang === 'hi' ? 'hi' : 'en');
          if (res.text) handleFollowupAnswer(idx, res.text);
        } catch (_) {}
      };
      followupRecorderRef.current = recorder;
      recorder.start();
      setFollowupListeningIdx(idx);
    } catch (err) {
      console.warn('Followup mic error', err);
    }
  };

  const handleGenerateSummaryPdf = async () => {
    if (!activePatient || !structuredIntake) return;
    setGeneratingSummaryPdf(true);
    try {
      const qa_pairs = followupQuestions.map((q, i) => ({
        question: q,
        answer: followupAnswers[i] || '—'
      }));
      await generateSummaryPdf({
        patient_name: activePatient.name,
        abha_id: activePatient.abha_id,
        chief_complaint: structuredIntake.chief_complaint || transcript,
        hpi: structuredIntake.hpi || '',
        suspected_dosha: structuredIntake.suspected_dosha || '',
        severity: structuredIntake.severity || 'Moderate',
        transcript,
        qa_pairs,
        doctor_name: bookingDoctor?.name || ''
      });
    } catch (e) {
      console.error('PDF generation failed', e);
    } finally {
      setGeneratingSummaryPdf(false);
    }
  };

  const [bookingLoading, setBookingLoading] = useState(false);

  const handleBookConsultation = async () => {
    if (!bookingDoctor || !activePatient) return;
    setBookingLoading(true);
    try {
      const gapQA = gapQuestions.map((gq, i) => ({ question: gq.question, answer: gapAnswers[i] || '—' }));
      const casePayload = {
        patient_id: activePatient.id,
        doctor_id: bookingDoctor.id,
        chief_complaints: structuredIntake?.chief_complaint || transcript || 'Regular OPD Follow-up Consultation',
        history_present_illness: structuredIntake?.hpi || structuredIntake?.clinical_summary || bookingNotes || 'Patient registered consultation via MediKiosk portal.',
        prakriti: activePatient.prakriti || 'Vata-Kapha',
        vikriti: structuredIntake?.suspected_dosha || 'Vata Vriddhi',
        is_red_flag: isRedFlag,
        red_flag_reason: redFlagReason || null,
        intake_data: {
          transcript,
          partial_structure: partialStructure,
          structured: structuredIntake,
          gap_qa: gapQA,
          notes: bookingNotes,
          documents: patientDocs
        },
        status: 'active',
        token_number: isRedFlag ? `EMERG-${Math.floor(100 + Math.random() * 900)}` : `OPD-${Math.floor(100 + Math.random() * 900)}`
      };
      const createdCase = await createCase(casePayload);
      setBookingSuccessCase(createdCase);
      setIsBookingModalOpen(false);
      changeWizardStep(5);
      setActiveView('wizard_flow');
      loadPatientHistory(activePatient.id);
    } catch (err) {
      alert('Failed to register consultation.');
    } finally {
      setBookingLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4">
      <PatientHeader 
        activePatient={activePatient} 
        currentUser={currentUser} 
      />

      <PatientNavTabs 
        activeView={activeView}
        setActiveView={setActiveView}
        wizardStep={wizardStep}
        setWizardStep={changeWizardStep}
        maxUnlockedStep={maxUnlockedStep}
        documentCount={patientDocs.length}
      />

      {activeView === 'wizard_flow' && (
        <div className="space-y-6">
          {wizardStep === 1 && (
            <WizardStep1Identify
              abhaInput={abhaInput} setAbhaInput={setAbhaInput}
              activePatient={activePatient}
              isNewRegistration={isNewRegistration} setIsNewRegistration={setIsNewRegistration}
              handleLookupAbha={handleLookupAbha} isLookingUpAbha={isLookingUpAbha} lookupError={lookupError}
              consentAccepted={consentAccepted} setConsentAccepted={setConsentAccepted}
              onNext={() => changeWizardStep(2)} currentUser={currentUser}
              regForm={regForm} setRegForm={setRegForm}
              regOtpStep={regOtpStep} setRegOtpStep={setRegOtpStep}
              regOtpCode={regOtpCode} setRegOtpCode={setRegOtpCode}
              regOtpLoading={regOtpLoading} regOtpError={regOtpError}
              handleSendRegOtp={handleSendRegOtp} handleVerifyRegOtpAndRegister={handleVerifyRegOtpAndRegister}
            />
          )}

          {wizardStep === 2 && (
            <WizardStep2Voice
              isListening={isListening} toggleListening={toggleListening}
              transcript={transcript} setTranscript={setTranscript}
              isRedFlag={isRedFlag} setIsRedFlag={setIsRedFlag}
              redFlagReason={redFlagReason} setRedFlagReason={setRedFlagReason}
              structuredIntake={structuredIntake}
              intakePhase={intakePhase}
              gapQuestions={gapQuestions}
              gapAnswers={gapAnswers}
              gapIndex={gapIndex}
              gapListeningIdx={gapListeningIdx}
              analysingGaps={analysingGaps}
              completingStructure={completingStructure}
              partialStructure={partialStructure}
              doctorsList={doctorsList}
              sendingToDoctor={sendingToDoctor}
              isSendDoctorOpen={isSendDoctorOpen}
              setIsSendDoctorOpen={setIsSendDoctorOpen}
              handleAnalyseGaps={handleAnalyseGaps}
              handleGapAnswer={handleGapAnswer}
              handleGapNext={handleGapNext}
              handleGapSkip={handleGapSkip}
              toggleGapListening={toggleGapListening}
              handleSendToDoctor={handleSendToDoctor}
              handleResetIntake={handleResetIntake}
              aiExtractedPills={aiExtractedPills}
              bookingDoctor={bookingDoctor}
              lang={lang}
              onBack={() => changeWizardStep(1)} onNext={() => changeWizardStep(3)}
            />
          )}

          {wizardStep === 3 && (
            <WizardStep3Vault
              patientDocs={patientDocs} setPatientDocs={setPatientDocs}
              isVaultModalOpen={isVaultModalOpen} setIsVaultModalOpen={setIsVaultModalOpen}
              activePatient={activePatient}
              onBack={() => changeWizardStep(2)} onNext={() => changeWizardStep(4)}
            />
          )}

          {wizardStep === 4 && (
            <WizardStep4Discover
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              taxonomyMode={taxonomyMode} setTaxonomyMode={setTaxonomyMode}
              selectedTaxonomyTag={selectedTaxonomyTag} setSelectedTaxonomyTag={setSelectedTaxonomyTag}
              doctorsList={doctorsList} loadDoctors={loadDoctors}
              setSelectedDoctorForProfile={setSelectedDoctorForProfile}
              setBookingDoctor={setBookingDoctor} setIsBookingModalOpen={setIsBookingModalOpen}
            />
          )}

          {wizardStep === 5 && (
            <WizardStep5ActiveCase
              bookingSuccessCase={bookingSuccessCase}
              timelineData={timelineData}
              setActiveView={setActiveView}
              setWizardStep={changeWizardStep}
              setActivePrescriptionForPrint={setActivePrescriptionForPrint}
              isDashboard={false}
              onStartNewIntake={handleReset5StepWizard}
            />
          )}
        </div>
      )}

      {activeView === 'dashboard' && (
        <div className="space-y-6">
          <WizardStep5ActiveCase
            bookingSuccessCase={bookingSuccessCase}
            timelineData={timelineData}
            setActiveView={setActiveView}
            setWizardStep={changeWizardStep}
            setActivePrescriptionForPrint={setActivePrescriptionForPrint}
            isDashboard={true}
            onStartNewIntake={handleReset5StepWizard}
          />
        </div>
      )}

      {activeView === 'recent_followups' && (
        <RecentFollowupsView
          patientHistory={timelineData?.timeline || []}
          activePatient={activePatient}
          setBookingDoctor={setBookingDoctor}
          setIsBookingModalOpen={setIsBookingModalOpen}
          setWizardStep={changeWizardStep}
          setActiveView={setActiveView}
          setActivePrescriptionForPrint={setActivePrescriptionForPrint}
          lang={lang}
        />
      )}

      {activeView === 'symptom_diary' && (
        <SymptomDiaryView
          diarySymptom={diarySymptom} setDiarySymptom={setDiarySymptom}
          diarySeverity={diarySeverity} setDiarySeverity={setDiarySeverity}
          diaryNotes={diaryNotes} setDiaryNotes={setDiaryNotes}
          savingDiary={savingDiary} handleAddSymptomLog={handleAddSymptomLog}
        />
      )}

      {activeView === 'document_vault' && (
        <WizardStep3Vault
          patientDocs={patientDocs} setPatientDocs={setPatientDocs}
          isVaultModalOpen={isVaultModalOpen} setIsVaultModalOpen={setIsVaultModalOpen}
          activePatient={activePatient}
        />
      )}

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

      {/* ── GIF Booking Loading Overlay ── */}
      {bookingLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 max-w-sm w-full">
            <img
              src="./loading_animation.gif"
              alt="Loading"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              className="w-28 h-28 object-contain mx-auto"
            />
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">
                Processing OPD Registration & Token...
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Transmitting intake payload to Vaidya OPD Console...
              </p>
            </div>
          </div>
        </div>
      )}

      <PrescriptionPrintModal
        caseData={activePrescriptionForPrint}
        patient={activePatient}
        doctor={bookingDoctor || (doctorsList.find(d => d.name.includes("Rajesh")) || doctorsList[0])}
        isOpen={!!activePrescriptionForPrint}
        onClose={() => setActivePrescriptionForPrint(null)}
      />

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
              <button onClick={() => setIsBookingModalOpen(false)} className="text-slate-400 hover:text-slate-800 text-lg font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Linked Patient ABHA ID</span>
              <span className="font-bold text-slate-900 text-sm">{activePatient?.name} ({activePatient?.abha_id})</span>
              <p className="text-[11px] text-slate-500 font-medium">{bookingDoctor.hospital_name} • Slot: Today</p>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-600 uppercase block mb-1">Current Condition / Symptoms</label>
              <textarea
                rows={3}
                value={bookingNotes || structuredIntake?.chief_complaint || transcript}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="State your complaints or let AI pre-fill from your voice intake..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            {/* Attached Scanned Reports Section */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-600 uppercase block">Attach Old Reports / Prescriptions</span>
                  <span className="text-[11px] font-medium text-slate-700">
                    {patientDocs.length > 0 ? `${patientDocs.length} Documents Linked in Vault` : "No old records attached"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVaultModalOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-slate-200 text-xs flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Attach Scanned Report</span>
                </button>
              </div>

              {patientDocs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {patientDocs.map((doc, dIdx) => (
                    <span key={dIdx} className="text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      📄 {doc.file_name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-semibold text-emerald-700 uppercase block">Government-Fixed Fee</span>
                <span className="text-sm font-bold text-slate-900">₹{bookingDoctor.consultation_fee || 100}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                Anti-Fake Registration Deterrent
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 cursor-pointer shadow-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBookConsultation}
                className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm cursor-pointer transition-all"
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
