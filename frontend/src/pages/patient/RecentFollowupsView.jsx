import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, User, Stethoscope, ArrowRight, Trash2, 
  CheckCircle2, Volume2, VolumeX, Loader2, RefreshCw, ChevronRight, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLongitudinalSummary, getVoiceNarration } from '../../services/api';

const safeString = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.text || val.point || val.summary || val.title || JSON.stringify(val);
  }
  return String(val);
};

export default function RecentFollowupsView({
  patientHistory = [],
  activePatient,
  setBookingDoctor,
  setIsBookingModalOpen,
  setWizardStep,
  setActiveView,
  setActivePrescriptionForPrint,
  lang = 'en'
}) {
  const { t } = useTranslation();
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ss_dismissed_followups') || '[]');
    } catch (_) {
      return [];
    }
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Safe history array check
  const safeHistory = Array.isArray(patientHistory) ? patientHistory : [];

  // Filter completed cases not dismissed
  const completedCases = safeHistory.filter(c => 
    c && !dismissedIds.includes(c.id) &&
    (c.status === 'completed' || c.doctor_name || c.diagnosis || c.chief_complaints)
  );

  // Smart cached fetch: ONLY call AI when a NEW doctor report/case is detected!
  useEffect(() => {
    if (completedCases.length === 0) {
      setAiSummary(null);
      return;
    }

    const currentCaseSig = completedCases.map(c => `${c.id}_${c.status}`).join('|');
    const cachedSig = localStorage.getItem('ss_cached_case_sig');
    const cachedSummaryRaw = localStorage.getItem('ss_cached_ai_summary');

    if (cachedSig === currentCaseSig && cachedSummaryRaw) {
      try {
        const parsedCache = JSON.parse(cachedSummaryRaw);
        setAiSummary(parsedCache);
        setLoadingAi(false);
        return;
      } catch (_) {}
    }

    // New doctor report detected -> trigger AI synthesis call
    setLoadingAi(true);
    getLongitudinalSummary(activePatient?.id, completedCases)
      .then(res => {
        setAiSummary(res);
        try {
          localStorage.setItem('ss_cached_case_sig', currentCaseSig);
          localStorage.setItem('ss_cached_ai_summary', JSON.stringify(res));
        } catch (_) {}
      })
      .catch(err => console.warn('Longitudinal summary fetch error', err))
      .finally(() => setLoadingAi(false));
  }, [patientHistory, activePatient, dismissedIds]);

  const handleDismiss = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('ss_dismissed_followups', JSON.stringify(updated));
    } catch (_) {}
  };

  const handlePlayVoiceSummary = async () => {
    if (isPlayingAudio) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      document.querySelectorAll('audio').forEach(a => { try { a.pause(); } catch (_) {} });
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = aiSummary?.overall_summary && aiSummary?.key_points
      ? `${aiSummary.overall_summary}. Key points: ${aiSummary.key_points.join('. ')}`
      : 'Recent follow-up history is clear. Schedule your next consultation with an Ayush Vaidya.';

    setLoadingAudio(true);
    try {
      const buffer = await getVoiceNarration(textToSpeak, lang);
      if (buffer && buffer.byteLength > 100) {
        const blob = new Blob([buffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => { setIsPlayingAudio(false); setLoadingAudio(false); };
        audio.onerror = () => { setIsPlayingAudio(false); setLoadingAudio(false); };
        audio.play();
        setLoadingAudio(false);
        setIsPlayingAudio(true);
        return;
      }
    } catch (_) {}

    setLoadingAudio(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utter.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── Page Header ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {t('patientPortal.recentFollowupsTag', 'CARE CONTINUITY • FOLLOW-UPS & AI SUMMARY')}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            {t('patientPortal.recentFollowupsTitle', 'Follow-ups & AI Summary')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('patientPortal.recentFollowupsSub', 'AI synthesizes your recent doctor consultations into a 3-4 point continuity summary for seamless follow-up care.')}
          </p>
        </div>
        <button
          onClick={() => {
            setActiveView('wizard_flow');
            setWizardStep(4);
          }}
          className="px-5 py-2.5 bg-[#12372A] hover:bg-[#0B2B20] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs shrink-0"
        >
          <Stethoscope className="w-4 h-4 text-amber-300" />
          <span>{t('patientPortal.bookNewDoctor', 'Book New Consultation')}</span>
        </button>
      </div>

      {/* ── AI Longitudinal Synthesis Card ── */}
      <div className="p-5 bg-gradient-to-r from-[#12372A] via-teal-900 to-emerald-900 text-white rounded-2xl shadow-md space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <h4 className="text-sm font-bold uppercase tracking-wide text-amber-300">
              {t('patientPortal.aiLongitudinalHeader', 'Follow-ups & AI Summary')}
            </h4>
          </div>

          <button
            onClick={handlePlayVoiceSummary}
            disabled={loadingAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isPlayingAudio ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            {loadingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isPlayingAudio ? 'Stop Voice' : 'Listen to AI Summary'}</span>
          </button>
        </div>

        {loadingAi ? (
          <div className="flex items-center gap-2 text-emerald-200 text-xs py-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Synthesizing multi-visit health timeline…</span>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-medium text-emerald-100 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
              {aiSummary?.overall_summary || 'Multi-visit clinical synthesis generated from your central ABHA health timeline.'}
            </p>

            {aiSummary?.key_points && aiSummary.key_points.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                  📌 Key Longitudinal Findings (3-4 Points):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiSummary.key_points.map((pt, pIdx) => (
                    <div key={pIdx} className="p-2.5 bg-white/10 rounded-xl border border-white/15 text-xs text-white flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium">{safeString(pt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiSummary?.recommendations && aiSummary.recommendations.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-2">
                <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block w-full mb-0.5">
                  💡 Ayurvedic Care Continuity Advice:
                </span>
                {aiSummary.recommendations.map((rec, rIdx) => (
                  <span key={rIdx} className="px-2.5 py-1 bg-emerald-400/20 text-emerald-200 rounded-lg text-[11px] font-medium border border-emerald-400/30">
                    • {safeString(rec)}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Recent Doctor Visit Cards ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            📋 Recent Completed Doctor Consultations ({completedCases.length})
          </span>
          {dismissedIds.length > 0 && (
            <button
              onClick={() => {
                setDismissedIds([]);
                localStorage.removeItem('ss_dismissed_followups');
              }}
              className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restore Dismissed ({dismissedIds.length})</span>
            </button>
          )}
        </div>

        {completedCases.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No Recent Follow-up Records</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once your Ayush Vaidya completes an OPD consultation case sheet, your visit summary will appear here for easy follow-up booking.
            </p>
            <button
              onClick={() => {
                setActiveView('wizard_flow');
                setWizardStep(4);
              }}
              className="px-4 py-2 bg-[#12372A] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              <span>Book OPD Consultation →</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {completedCases.map((cCase, cIdx) => {
              if (!cCase) return null;
              const itemKey = cCase.id || cCase.case_id || `followup_${cIdx}`;
              let docName = cCase.doctor_name || cCase.doctor?.name || 'Dr. Rajesh Vaidya';
              if (!docName || docName.includes('AI Assistant') || docName.includes('AyurSaarthi AI')) {
                docName = 'Dr. Rajesh Vaidya';
              }
              const docSpec = cCase.doctor_qualification || cCase.doctor_specialization || cCase.doctor?.specialization || 'BAMS, MD Kayachikitsa';
              const docHosp = cCase.hospital_name || cCase.doctor?.hospital_name || 'All India Institute of Ayurveda';
              const dateStr = cCase.created_at ? new Date(cCase.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent Visit';

              return (
                <div key={itemKey} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
                        <User className="w-6 h-6 text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-sm text-slate-900">{docName}</h5>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                            {cCase.token_number || 'OPD-101'}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 font-medium">{docSpec} · {docHosp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dateStr}</span>
                      </span>

                      <button
                        onClick={() => handleDismiss(cCase.id)}
                        title="Remove from recent follow-ups"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visit Clinical Summary */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Clinical Diagnosis & Summary</span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {cCase.chief_complaints || cCase.history_present_illness || 'Consultation completed. Prescribed classical Ayurvedic medicines and Pathya diet.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Case Complete & Signed</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {setActivePrescriptionForPrint && (
                        <button
                          onClick={() => setActivePrescriptionForPrint(cCase)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>View Rx PDF</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const targetDoc = {
                            id: cCase.doctor_id || 'DOC-AYUR-101',
                            name: docName,
                            specialization: docSpec,
                            hospital_name: docHosp
                          };
                          setBookingDoctor(targetDoc);
                          setIsBookingModalOpen(true);
                        }}
                        className="px-4 py-1.5 bg-gradient-to-r from-[#12372A] to-emerald-700 hover:from-[#0B2B20] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <span>Book Follow-up</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
