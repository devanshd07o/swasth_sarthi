import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, AlertTriangle, Sparkles, ArrowRight, ChevronDown, ChevronUp,
  CheckCircle2, SkipForward, Brain, Loader2, RotateCcw, Send, User,
  MessageSquare, Stethoscope, X, Volume2, VolumeX, Radio, Volume1
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RobotAvatarAnimation from '../../components/RobotAvatarAnimation';
import { getVoiceNarration } from '../../services/api';

/* ── Phase Step Indicator ─────────────────────────────────────────────────── */
function PhaseBar({ phase }) {
  const phases = [
    { id: 'input', label: 'Describe', icon: MessageSquare },
    { id: 'gap_qa', label: 'Gap Q&A', icon: Brain },
    { id: 'complete', label: 'Review & Send', icon: Stethoscope },
  ];
  const active = ['input', 'gap_qa', 'complete'].indexOf(phase);
  return (
    <div className="flex items-center gap-0 mb-5">
      {phases.map((p, i) => {
        const Icon = p.icon;
        const done = i < active;
        const current = i === active;
        return (
          <React.Fragment key={p.id}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              current ? 'bg-[#12372A] text-white shadow-sm' :
              done ? 'bg-emerald-100 text-emerald-700' :
              'bg-slate-100 text-slate-400'
            }`}>
              <Icon className="w-3 h-3" />
              <span>{p.label}</span>
            </div>
            {i < phases.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Send to Doctor Modal ─────────────────────────────────────────────────── */
function SendDoctorModal({ doctors, onSend, onClose, sending }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(null);
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#12372A] to-emerald-800">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-300" />
            <span className="text-white font-bold text-sm">{t('patientPortal.selectDoctor', 'Select Doctor (Auto-Sends Report)')}</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {doctors.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">{t('patientPortal.noDoctorsAvailable', 'No doctors available. Search from Step 4.')}</p>
          )}
          {doctors.map(doc => (
            <button
              key={doc.id}
              type="button"
              disabled={sending}
              onClick={() => onSend(doc)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 text-left cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50/70 hover:shadow-md group active:scale-[0.99] disabled:opacity-50"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 group-hover:bg-emerald-600 flex items-center justify-center shrink-0 transition-colors">
                <User className="w-4 h-4 text-emerald-700 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 block truncate">{doc.name}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-emerald-800">{doc.specialization} · {doc.hospital_name || doc.hospital}</span>
              </div>
              <div className="px-3 py-1 bg-emerald-600 group-hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs">
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                <span>{t('patientPortal.sendNow', 'Send Report →')}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <button onClick={onClose} className="w-full py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            {t('common.cancel', 'Cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export default function WizardStep2Voice({
  isListening, toggleListening,
  transcript, setTranscript,
  isRedFlag, setIsRedFlag,
  redFlagReason, setRedFlagReason,
  structuredIntake,
  intakePhase,
  gapQuestions, gapAnswers, gapIndex, gapListeningIdx,
  analysingGaps, completingStructure, partialStructure,
  doctorsList, sendingToDoctor, isSendDoctorOpen, setIsSendDoctorOpen,
  handleAnalyseGaps,
  handleGapAnswer, handleGapNext, handleGapSkip, toggleGapListening,
  handleSendToDoctor, handleResetIntake,
  bookingDoctor,
  aiExtractedPills = [],
  lang = 'en',
  onBack, onNext
}) {
  const { t } = useTranslation();
  const [promptsExpanded, setPromptsExpanded] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);
  const ttsEnabledRef = useRef(true);

  // Keep ref in sync so useEffect callbacks don't go stale
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  const stopAllAudio = useCallback(() => {
    // Stop all global audio elements on the page
    document.querySelectorAll('audio').forEach(a => {
      try { a.pause(); a.currentTime = 0; } catch (_) {}
    });
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch (_) {}
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    setIsPlayingAudio(false);
    setIsAudioLoading(false);
  }, []);

  const speakText = useCallback(async (text) => {
    if (!ttsEnabledRef.current || !text) return;
    stopAllAudio();
    setIsAudioLoading(true);

    try {
      // 1. Fetch HD MP3 audio from backend API (5-key Groq + ElevenLabs / Google Neural engine)
      const arrayBuffer = await getVoiceNarration(text, lang);
      if (arrayBuffer && arrayBuffer.byteLength > 100) {
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio();
        audioRef.current = audio;

        audio.oncanplaythrough = async () => {
          setIsAudioLoading(false);
          setIsPlayingAudio(true);
          try { await audio.play(); } catch (_) { setIsPlayingAudio(false); }
        };
        audio.onended = () => {
          setIsPlayingAudio(false);
          setIsAudioLoading(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsAudioLoading(false);
          setIsPlayingAudio(false);
          speakWithBrowserFallback(text);
        };

        audio.src = audioUrl;
        audio.load();
        return;
      }
    } catch (err) {
      console.warn('[TTS Player] Backend speech fallback', err);
    }

    // 2. Browser fallback if API call fails
    speakWithBrowserFallback(text);
  }, [lang, stopAllAudio]);

  const speakWithBrowserFallback = (text) => {
    setIsAudioLoading(false);
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utter.rate = 0.95;
      utter.pitch = 1.25; // Higher feminine pitch

      const allVoices = window.speechSynthesis.getVoices() || [];
      const code = lang === 'hi' ? 'hi' : 'en';

      // STRICT FEMALE VOICE FILTER — Blacklist ALL male names
      const femaleVoice = allVoices.find(v =>
        v.lang.startsWith(code) &&
        /female|woman|zira|neha|aria|swara|kalpana|heera|google/i.test(v.name) &&
        !/david|mark|george|male|guy|ryan|stefan|james|richard|pavel|ravi|hemant|gurdeep/i.test(v.name)
      ) || allVoices.find(v =>
        v.lang.startsWith(code) &&
        !/david|mark|george|male|guy|ryan|stefan|james|richard|pavel|ravi|hemant|gurdeep/i.test(v.name)
      ) || allVoices.find(v =>
        !/david|mark|george|male|guy|ryan|stefan|james|richard|pavel|ravi|hemant|gurdeep/i.test(v.name)
      );

      if (femaleVoice) {
        utter.voice = femaleVoice;
      }

      utter.onstart = () => setIsPlayingAudio(true);
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    } catch (_) {
      setIsPlayingAudio(false);
    }
  };

  // Cleanup TTS on unmount or phase change — NO AUTO-SPEAK to prevent voice overlapping!
  useEffect(() => {
    stopAllAudio();
    return () => { stopAllAudio(); };
  }, [stopAllAudio, gapIndex, intakePhase]);

  const answeredGaps = Object.values(gapAnswers).filter(a => a && a !== '—').length;

  return (
    <>
      {isSendDoctorOpen && (
        <SendDoctorModal
          doctors={doctorsList || []}
          onSend={handleSendToDoctor}
          onClose={() => setIsSendDoctorOpen(false)}
          sending={sendingToDoctor}
        />
      )}

      {/* ── GIF Loading Overlay ── */}
      {(analysingGaps || completingStructure || sendingToDoctor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 max-w-sm w-full">
            <img
              src="/loading_animation.gif"
              alt="Loading"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
              className="w-28 h-28 object-contain mx-auto"
            />
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">
                {analysingGaps
                  ? 'AI Analyzing Symptoms & Extracting Gaps...'
                  : completingStructure
                  ? 'AI Synthesizing Physician Clinical Intake...'
                  : 'Transmitting EHR to Vaidya OPD Console...'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Please wait while SwasthSaarthi AI processes your clinical intake...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 animate-fade-in">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {t('patientPortal.step2Tag', 'STEP 2 OF 5 • CLINICAL VOICE TRIAGE')}
          </span>
          <h3 className="text-lg font-semibold text-slate-900 mt-2">
            {t('patientPortal.step2Title', 'Voice Triage & Clinical Conversation')}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('patientPortal.step2WorkflowDesc', 'Speak or type your symptoms → AI fills gaps → Complete structured report sent to your doctor')}
          </p>
        </div>

        {/* ── Phase Bar ──────────────────────────────────────────────────── */}
        <PhaseBar phase={intakePhase} />

        {/* ══════════════════ PHASE 1: INPUT ════════════════════════════════ */}
        {intakePhase === 'input' && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick Test Prompts — collapsed */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setPromptsExpanded(p => !p)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                <span>{t('patientPortal.quickPrompts', 'Quick Test Prompts')}</span>
                {promptsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {promptsExpanded && (
                <div className="flex flex-wrap gap-2 px-4 py-3 bg-white border-t border-slate-100">
                  <button onClick={() => setTranscript('3 din se right knee me bahut tej dard aur subah akadpan ho raha hai, chalne me takleef hoti hai')}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium cursor-pointer transition-colors">
                    {t('patientPortal.promptKneePain', 'Sandhivata / Knee Pain')}
                  </button>
                  <button onClick={() => setTranscript('Khaana khane ke baad seene me jalan hoti hai, khatti dakar aati hai aur neend nahi aati')}
                    className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-medium cursor-pointer transition-colors">
                    {t('patientPortal.promptHeartburn', 'Amlapitta / Heartburn')}
                  </button>
                  <button onClick={() => setTranscript('Mere chhati me bahut tej dard ho raha hai, saans lene me takleef ho rahi hai aur pasina aa raha hai')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-[11px] font-medium cursor-pointer transition-colors">
                    {t('patientPortal.promptChestPain', '🚨 Red-Flag Chest Pain')}
                  </button>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">
                  {t('patientPortal.liveTranscriptLabel', 'Tell us about your symptoms')}
                </label>
                {isListening && (
                  <span className="text-[10px] font-bold text-rose-600 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    {t('patientPortal.micActive', 'Microphone Active')}
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={t('patientPortal.transcriptPlaceholder', 'Speak or type freely in Hindi, English, or Hinglish…\n\nExample: "3 din se ghabrahat ho rahi hai, pet me dard aur ulti jaisi feeling hai"')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-xs transition-colors resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-50 border border-rose-200 text-rose-700 animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  <RobotAvatarAnimation state={isListening ? 'listening' : 'idle'} size="sm" />
                  <span>{isListening ? t('patientPortal.listening', 'Listening… Tap to stop') : t('patientPortal.tapToSpeak', 'Tap to Speak')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyseGaps}
                    disabled={analysingGaps || !transcript.trim()}
                    className="px-5 py-2.5 bg-[#12372A] hover:bg-[#0B2B20] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {analysingGaps
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>{t('patientPortal.analysingGaps', 'Analysing…')}</span></>
                      : <><Sparkles className="w-3.5 h-3.5 text-amber-300" /><span>{t('patientPortal.btnAnalyseGaps', 'Analyse & Fill Gaps →')}</span></>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Red Flag */}
            {isRedFlag && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{t('patientPortal.emergencyTitle', 'MEDROUTE EMERGENCY ALERT: RED-FLAG KEYWORDS DETECTED')}</span>
                </div>
                <p className="text-xs text-rose-800 font-medium">{redFlagReason}</p>
                <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs text-rose-700 font-semibold">
                  {t('patientPortal.emergencyOpdNotice', "This consultation will be prioritized to TOP of the Doctor's OPD Queue with an Emergency Flag!")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ PHASE 2: GAP Q&A ═════════════════════════════ */}
        {intakePhase === 'gap_qa' && (
          <div className="space-y-4 animate-fade-in">
            {/* What AI already knows + Live updates as gap questions are answered */}
            {(partialStructure && partialStructure.chief_complaint) || Object.keys(gapAnswers).length > 0 ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 animate-fade-in">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  {t('patientPortal.aiAlreadyKnows', 'AI understood from your description')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {partialStructure?.chief_complaint && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg font-semibold">
                      {partialStructure.chief_complaint}
                    </span>
                  )}
                  {partialStructure?.duration && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-100 rounded-lg font-semibold">
                      {partialStructure.duration}
                    </span>
                  )}
                  {partialStructure?.severity && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg font-semibold">
                      {partialStructure.severity}
                    </span>
                  )}

                  {/* AI Extracted Live Pills */}
                  {aiExtractedPills.map((pill, pIdx) => (
                    <span key={pIdx} className="px-2.5 py-1 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1 shadow-2xs animate-fade-in">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{pill}</span>
                    </span>
                  ))}

                  {/* Live AI-Formatted Gap Answered Pills */}
                  {Object.entries(gapAnswers).map(([idx, ans]) => {
                    if (!ans || ans === '—' || ans === 'skipped') return null;
                    const gq = gapQuestions[parseInt(idx, 10)];
                    const rawLabel = gq?.field ? gq.field.replace('_', ' ') : 'Symptom Detail';
                    
                    // Clean up colloquial fillers (e.g. "hai yaar", "bhai", "ji")
                    let cleanText = ans
                      .replace(/\b(hai|h|yaar|yar|bhai|sir|ji|hn|han|rehta|rehti|ho|gaya|gaye|lag|rhi|raha)\b/gi, '')
                      .replace(/\s+/g, ' ')
                      .trim();
                    if (!cleanText) cleanText = ans;
                    cleanText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);

                    let icon = "✨";
                    let badgeBg = "bg-teal-50 text-teal-900 border-teal-200";
                    if (/pain|dard|stiffness|swelling|redness/i.test(cleanText)) {
                      icon = "🩺";
                      badgeBg = "bg-emerald-50 text-emerald-950 border-emerald-300";
                    } else if (/day|din|month|mahine|week|hafta|since/i.test(cleanText)) {
                      icon = "🕒";
                      badgeBg = "bg-blue-50 text-blue-950 border-blue-200";
                    } else if (/severe|mild|moderate|tez|bht/i.test(cleanText)) {
                      icon = "⚡";
                      badgeBg = "bg-amber-50 text-amber-950 border-amber-300";
                    } else if (/cold|sour|fried|food|khana|sardi/i.test(cleanText)) {
                      icon = "❄️";
                      badgeBg = "bg-indigo-50 text-indigo-950 border-indigo-200";
                    }

                    return (
                      <span key={idx} className={`px-2.5 py-1 ${badgeBg} border rounded-lg font-bold text-xs flex items-center gap-1.5 animate-fade-in shadow-2xs`}>
                        <span className="text-xs">{icon}</span>
                        <span className="font-mono text-[9px] uppercase tracking-wide opacity-80">{rawLabel}:</span>
                        <span className="font-semibold">{cleanText.length > 32 ? cleanText.slice(0, 32) + '…' : cleanText}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Gap questions header */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#12372A] flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-900 block">
                  {t('patientPortal.gapQaTitle', 'AI needs a few more details')}
                </span>
                <span className="text-[10px] text-slate-500">
                  {gapIndex + 1} {t('patientPortal.of', 'of')} {gapQuestions.length} · {answeredGaps} {t('patientPortal.answered', 'answered')}
                </span>
              </div>
              {/* TTS Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !ttsEnabled;
                  setTtsEnabled(next);
                  if (!next) stopAllAudio();
                }}
                title={ttsEnabled ? 'Turn off voice' : 'Turn on voice'}
                className={`p-2 rounded-full border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                  ttsEnabled
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#12372A] rounded-full transition-all duration-500"
                  style={{ width: `${(gapIndex / gapQuestions.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 shrink-0">{gapIndex + 1}/{gapQuestions.length}</span>
            </div>

            {/* Current question */}
            {gapQuestions[gapIndex] && (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">
                      {t('patientPortal.question', 'Question')} {gapIndex + 1}
                    </span>

                    {/* Replay speaker button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingAudio) stopAllAudio();
                        else speakText(gapQuestions[gapIndex].question);
                      }}
                      title="Replay question"
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isPlayingAudio
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {isAudioLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                      ) : isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Replay</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {gapQuestions[gapIndex].question}
                  </p>
                </div>

                {gapListeningIdx === gapIndex && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                    <span>{t('patientPortal.micActive', 'Listening… Speak your answer')}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={gapAnswers[gapIndex] || ''}
                    onChange={(e) => handleGapAnswer(gapIndex, e.target.value)}
                    placeholder={t('patientPortal.gapAnswerPlaceholder', 'Type your answer or tap mic to speak…')}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => toggleGapListening(gapIndex)}
                    className={`px-4 rounded-xl flex items-center gap-2 cursor-pointer shrink-0 transition-all border font-semibold text-xs shadow-xs ${
                      gapListeningIdx === gapIndex
                        ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                        : 'bg-slate-100 hover:bg-emerald-50 text-emerald-800 border-slate-200'
                    }`}
                  >
                    {gapListeningIdx === gapIndex ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-700" />}
                    <span>{gapListeningIdx === gapIndex ? t('patientPortal.listening', 'Stop') : t('patientPortal.tapToSpeak', 'Tap Mic')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleGapSkip}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>{t('patientPortal.skipQuestion', 'Skip this question')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGapNext}
                    disabled={completingStructure}
                    className="px-5 py-2.5 bg-[#12372A] hover:bg-[#0B2B20] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    {completingStructure && gapIndex + 1 >= gapQuestions.length
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>{t('patientPortal.structuring', 'Structuring…')}</span></>
                      : gapIndex + 1 >= gapQuestions.length
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /><span>{t('patientPortal.completeAndStructure', 'Complete & Generate Report')}</span></>
                        : <><span>{t('patientPortal.nextQuestion', 'Next')}</span><ArrowRight className="w-3.5 h-3.5" /></>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ PHASE 3: YOUR AI HEALTH REPORT ══════════════ */}
        {intakePhase === 'complete' && structuredIntake && (
          <div className="space-y-4 animate-fade-in">

            {/* Success banner */}
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-sm font-bold text-emerald-900 block">
                  {t('patientPortal.reportReady', 'Your Health Report is Ready')}
                </span>
                <span className="text-[10px] text-emerald-700">
                  {t('patientPortal.reportReadySub', 'AI has analysed your symptoms and conversation. Review your report below, then send it to your doctor.')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetIntake}
                className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                title="Start over"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Red flag if any */}
            {isRedFlag && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{redFlagReason || t('patientPortal.emergencyReasonDefault', 'Critical symptom detected. You will be given priority.')}</span>
              </div>
            )}

            {/* ── Official Patient Self-Assessment Clinical Dossier Card ── */}
            <div className="bg-white border-2 border-emerald-700/30 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 font-body">
              
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                <div>
                  <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ABDM HIP COMPLIANT • PATIENT SELF-ASSESSMENT DOSSIER
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-700" />
                    <span>{t('patientPortal.intakeSummaryTitle', 'Patient Voice & Clinical Triage Dossier')}</span>
                  </h4>
                </div>

                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ready for Vaidya Review</span>
                </span>
              </div>

              {/* ── TOP EXECUTIVE SUMMARY FOR PHYSICIAN ── */}
              {structuredIntake.clinical_summary && (
                <div className="p-4 bg-gradient-to-r from-emerald-950 via-[#12372A] to-emerald-900 text-white rounded-xl space-y-2.5 shadow-md border border-emerald-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-300 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-amber-300" /> ⭐ {t('patientPortal.clinicalSummary', 'Executive Summary for Physician')}
                    </span>

                    {/* Play AI Audio Summary Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isPlayingAudio) {
                          stopAllAudio();
                        } else {
                          speakText(`${t('patientPortal.clinicalSummary', 'Summary for Physician')}: ${structuredIntake.clinical_summary}`);
                        }
                      }}
                      disabled={isAudioLoading}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                        isPlayingAudio
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : 'bg-white/10 text-amber-200 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {isAudioLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isPlayingAudio ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-amber-300" />
                          <span>Listen Voice Summary</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-slate-100 font-medium text-xs leading-relaxed">{structuredIntake.clinical_summary}</p>
                </div>
              )}

              {/* ── CLINICAL POINTS BREAKDOWN ── */}
              <div className="space-y-3 pt-1 text-xs">

                {/* Point 1: Chief Complaint */}
                {structuredIntake.chief_complaint && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Chief Complaint</span>
                      <p className="text-slate-900 font-extrabold text-sm">{structuredIntake.chief_complaint}</p>
                    </div>
                  </div>
                )}

                {/* Point 2: HPI Narrative */}
                {structuredIntake.hpi && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-slate-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">History of Present Illness (HPI)</span>
                      <p className="text-slate-800 font-medium leading-relaxed">{structuredIntake.hpi}</p>
                    </div>
                  </div>
                )}

                {/* Point 3: Ayurvedic Dosha */}
                {structuredIntake.suspected_dosha && (
                  <div className="p-3 bg-teal-50/80 border border-teal-200/80 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-teal-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-teal-800 uppercase block">Ayurvedic Dosha Analysis</span>
                      <span className="text-teal-950 font-bold text-xs">{structuredIntake.suspected_dosha}</span>
                    </div>
                  </div>
                )}

                {/* Point 4: Aggravating & Relieving Factors */}
                {(structuredIntake.aggravating_factors || structuredIntake.relieving_factors) && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Triggers & Relief Factors</span>
                      {structuredIntake.aggravating_factors && <p className="text-slate-800"><strong className="text-amber-900">Aggravating:</strong> {structuredIntake.aggravating_factors}</p>}
                      {structuredIntake.relieving_factors && <p className="text-slate-800"><strong className="text-emerald-900">Relieving:</strong> {structuredIntake.relieving_factors}</p>}
                    </div>
                  </div>
                )}

                {/* Point 5: Associated Symptoms */}
                {structuredIntake.associated_symptoms && structuredIntake.associated_symptoms !== 'None reported' && (
                  <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">5</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase block">Associated Symptoms</span>
                      <span className="text-slate-800 font-medium">{structuredIntake.associated_symptoms}</span>
                    </div>
                  </div>
                )}

                {/* Point 6: Pathya / Apathya */}
                {(structuredIntake.suggested_pathya || structuredIntake.suggested_apathya) && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">6</div>
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-700 uppercase block">Diet & Lifestyle Guidelines (Pathya / Apathya)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                        {structuredIntake.suggested_pathya && (
                          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 font-medium">
                            <strong>✅ Pathya (Do):</strong> {structuredIntake.suggested_pathya}
                          </div>
                        )}
                        {structuredIntake.suggested_apathya && (
                          <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-rose-900 font-medium">
                            <strong>❌ Apathya (Avoid):</strong> {structuredIntake.suggested_apathya}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Point 7: Suggested Investigations */}
                {structuredIntake.suggested_investigations && structuredIntake.suggested_investigations !== 'None required at this stage' && (
                  <div className="p-3 bg-purple-50/80 border border-purple-200/80 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-purple-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">7</div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-purple-800 uppercase block">Suggested Clinical Investigations</span>
                      <span className="text-slate-800 font-medium">{structuredIntake.suggested_investigations}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Smart Send Button ── */}
            <div className="flex flex-col sm:flex-row gap-2">
              {bookingDoctor ? (
                /* Doctor already selected in Step 4 — send directly */
                <button
                  type="button"
                  onClick={() => handleSendToDoctor(bookingDoctor)}
                  disabled={sendingToDoctor}
                  className="flex-1 py-3 bg-gradient-to-r from-[#12372A] to-emerald-700 hover:from-[#0B2B20] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-60"
                >
                  {sendingToDoctor
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Sending to {bookingDoctor.name}…</span></>
                    : <><Send className="w-4 h-4 text-amber-300" /><span>Send to {bookingDoctor.name} ({bookingDoctor.specialization})</span></>
                  }
                </button>
              ) : (
                /* No doctor selected yet — show selector modal */
                <button
                  type="button"
                  onClick={() => setIsSendDoctorOpen(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#12372A] to-emerald-700 hover:from-[#0B2B20] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{t('patientPortal.sendToDoctorBtn', 'Select Doctor & Send Report')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onNext}
                className="flex-1 py-3 border border-[#12372A] text-[#12372A] hover:bg-emerald-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>{t('patientPortal.btnProceedStep3', 'Continue to Step 3 →')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Footer Nav ─────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={intakePhase === 'gap_qa' ? handleResetIntake : onBack}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
          >
            {intakePhase === 'gap_qa'
              ? `← ${t('patientPortal.backToInput', 'Back to Input')}`
              : t('patientPortal.btnBackIdentification', '← Back to Identification')
            }
          </button>
        </div>
      </div>
    </>
  );
}
