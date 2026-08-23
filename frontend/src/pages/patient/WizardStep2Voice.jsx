import React, { useState } from 'react';
import {
  Mic, MicOff, AlertTriangle, Sparkles, ArrowRight, ChevronDown, ChevronUp,
  CheckCircle2, SkipForward, Brain, Loader2, RotateCcw, Send, User,
  ClipboardList, MessageSquare, Stethoscope, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  onBack, onNext
}) {
  const { t } = useTranslation();
  const [promptsExpanded, setPromptsExpanded] = useState(false);

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
                  className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-700" />}
                  <span>{isListening ? t('patientPortal.listening', 'Listening… Tap to stop') : t('patientPortal.tapToSpeak', 'Tap to Speak')}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isRedFlag;
                      setIsRedFlag(next);
                      if (next && !redFlagReason) setRedFlagReason('Manual Emergency Override');
                    }}
                    className={`px-3 py-2.5 rounded-xl font-semibold text-xs border flex items-center gap-1.5 cursor-pointer transition-all ${
                      isRedFlag ? 'bg-rose-600 text-white border-rose-700 animate-pulse' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isRedFlag ? t('patientPortal.emergencyActive', 'Emergency Active') : t('patientPortal.btnToggleEmergency', 'Emergency Flag')}</span>
                  </button>

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
            {/* What AI already knows */}
            {partialStructure && partialStructure.chief_complaint && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                  {t('patientPortal.aiAlreadyKnows', 'AI understood from your description')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {partialStructure.chief_complaint && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">
                      {partialStructure.chief_complaint}
                    </span>
                  )}
                  {partialStructure.duration && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg font-semibold">
                      {partialStructure.duration}
                    </span>
                  )}
                  {partialStructure.severity && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg font-semibold">
                      {partialStructure.severity}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Gap questions header */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#12372A] flex items-center justify-center shrink-0">
                <Brain className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 block">
                  {t('patientPortal.gapQaTitle', 'AI needs a few more details')}
                </span>
                <span className="text-[10px] text-slate-500">
                  {gapIndex + 1} {t('patientPortal.of', 'of')} {gapQuestions.length} · {answeredGaps} {t('patientPortal.answered', 'answered')}
                </span>
              </div>
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
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                    {t('patientPortal.question', 'Question')} {gapIndex + 1}
                  </span>
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

        {/* ══════════════════ PHASE 3: COMPLETE STRUCTURED REPORT ══════════ */}
        {intakePhase === 'complete' && structuredIntake && (
          <div className="space-y-4 animate-fade-in">

            {/* Success banner */}
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-sm font-bold text-emerald-900 block">
                  {t('patientPortal.reportReady', 'Clinical Report Ready')}
                </span>
                <span className="text-[10px] text-emerald-700">
                  {t('patientPortal.reportReadySub', 'AI has generated a complete physician-ready intake. Review below, then send to your doctor.')}
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
                <span>{redFlagReason || t('patientPortal.emergencyReasonDefault', 'Critical symptom detected.')}</span>
              </div>
            )}

            {/* Structured Clinical Report Card */}
            <div className="rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#12372A] to-emerald-800">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-300" />
                  <span className="text-white font-bold text-xs uppercase tracking-wide">
                    {t('patientPortal.intakeHeader', 'Structured Clinical Intake')}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isRedFlag ? 'bg-rose-500 text-white' :
                  structuredIntake.severity === 'Severe' ? 'bg-orange-500 text-white' :
                  structuredIntake.severity === 'Mild' ? 'bg-emerald-400 text-white' :
                  'bg-amber-400 text-[#12372A]'
                }`}>
                  {t('patientPortal.severity', 'Severity:')} {structuredIntake.severity || 'Moderate'}
                </span>
              </div>

              <div className="p-4 bg-white space-y-3 text-xs">
                {/* Primary row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: t('patientPortal.chiefComplaintLabel', 'Chief Complaint'), value: structuredIntake.chief_complaint, accent: true },
                    { label: t('patientPortal.hpiLabel', 'Duration & HPI'), value: `${structuredIntake.duration || '—'} · ${structuredIntake.hpi || '—'}` },
                    { label: t('patientPortal.doshaLabel', 'Suspected Dosha'), value: structuredIntake.suspected_dosha },
                    { label: t('patientPortal.aggravatingLabel', 'Aggravating Factors'), value: structuredIntake.aggravating_factors },
                    { label: t('patientPortal.relievingLabel', 'Relieving Factors'), value: structuredIntake.relieving_factors },
                    { label: t('patientPortal.associatedLabel', 'Associated Symptoms'), value: structuredIntake.associated_symptoms },
                  ].filter(f => f.value && f.value !== 'Not specified' && f.value !== 'Not reported').map((field, i) => (
                    <div key={i} className={`p-3 rounded-xl border shadow-xs ${field.accent ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase mb-0.5">{field.label}</span>
                      <span className={`font-semibold ${field.accent ? 'text-emerald-900' : 'text-slate-800'}`}>{field.value}</span>
                    </div>
                  ))}
                </div>

                {/* Clinical summary */}
                {structuredIntake.clinical_summary && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="text-[10px] text-blue-700 font-bold uppercase block mb-1">
                      {t('patientPortal.clinicalSummary', 'Physician Summary')}
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">{structuredIntake.clinical_summary}</p>
                  </div>
                )}

                {/* Pathya / Apathya */}
                {(structuredIntake.suggested_pathya || structuredIntake.suggested_apathya) && (
                  <div className="grid grid-cols-2 gap-2">
                    {structuredIntake.suggested_pathya && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <span className="text-[10px] text-emerald-700 font-bold uppercase block">✅ Pathya (Do)</span>
                        <span className="text-slate-700 font-medium">{structuredIntake.suggested_pathya}</span>
                      </div>
                    )}
                    {structuredIntake.suggested_apathya && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
                        <span className="text-[10px] text-rose-700 font-bold uppercase block">❌ Apathya (Avoid)</span>
                        <span className="text-slate-700 font-medium">{structuredIntake.suggested_apathya}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Investigations */}
                {structuredIntake.suggested_investigations && structuredIntake.suggested_investigations !== 'None required at this stage' && (
                  <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">🔬 Suggested Investigations</span>
                    <span className="text-slate-700 font-medium">{structuredIntake.suggested_investigations}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setIsSendDoctorOpen(true)}
                className="flex-1 py-3 bg-gradient-to-r from-[#12372A] to-emerald-700 hover:from-[#0B2B20] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                <Send className="w-4 h-4 text-amber-300" />
                <span>{t('patientPortal.sendToDoctorBtn', 'Send Report to Doctor')}</span>
              </button>
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
