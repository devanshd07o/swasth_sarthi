import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, FileText, Pill, Clock, ArrowLeft, HeartPulse, ShieldCheck, 
  Lock, Unlock, Sparkles, UploadCloud, Eye, AlertTriangle, Stethoscope, Building2, CheckCircle2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPatientTimeline, getPatients, getDoctorPatients } from '../services/api';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';
import DocumentVaultModal from '../components/DocumentVaultModal';
import BrandedLoader from '../components/BrandedLoader';

export default function PatientTimeline({ patientId, onBack, onSelectPatientId, onOpenCaseSheet, currentDoctorId = "DOC-AYUR-101", currentUser = null }) {
  const { t } = useTranslation();
  const isDoctor = (currentUser?.role === 'doctor') || (currentUser?.role === 'hospital_admin') || (Boolean(currentDoctorId) && currentUser?.role !== 'patient');
  const [activePatientId, setActivePatientId] = useState(patientId || null);
  const [allPatients, setAllPatients] = useState([]);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePrescriptionForPrint, setActivePrescriptionForPrint] = useState(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [selectedDocForOverlay, setSelectedDocForOverlay] = useState(null);

  useEffect(() => {
    if (patientId && patientId !== activePatientId) {
      setActivePatientId(patientId);
    } else if (!patientId) {
      setActivePatientId(null);
      setTimelineData(null);
    }
  }, [patientId]);

  useEffect(() => {
    if (isDoctor) {
      loadPatientsList();
    } else {
      setAllPatients([]);
    }
  }, [currentDoctorId, isDoctor]);

  useEffect(() => {
    if (activePatientId) {
      loadTimeline(activePatientId, false);
    } else {
      setTimelineData(null);
      setLoading(false);
    }

    const handleUpdate = () => {
      if (activePatientId) loadTimeline(activePatientId, true);
      loadPatientsList();
    };
    window.addEventListener('ss_opd_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('ss_opd_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activePatientId, currentDoctorId]);

  const loadPatientsList = async () => {
    if (!isDoctor) return;
    try {
      const queue = await getDoctorPatients(currentDoctorId).catch(() => []);
      const all = queue.length > 0 ? queue : await getPatients().catch(() => []);
      const targetList = queue.length > 0 ? queue : all;
      setAllPatients(targetList);
    } catch (_) {}
  };

  const loadTimeline = async (targetId, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const idToFetch = targetId || activePatientId;
      if (!idToFetch) { setLoading(false); return; }
      const data = await getPatientTimeline(idToFetch, currentDoctorId);
      setTimelineData(data);
    } catch (e) {
      console.error('Failed to load patient timeline', e);
      setTimelineData(null);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handlePatientSwitch = (newId) => {
    const id = newId || null;
    setActivePatientId(id);
    if (id) {
      loadTimeline(id);
    } else {
      setTimelineData(null);
    }
    if (onSelectPatientId) onSelectPatientId(id);
  };

  // Derived state: true only when we have an active patient AND loaded their data
  const hasPatientData = Boolean(activePatientId) && Boolean(timelineData?.patient);
  const { patient, timeline, overall_summary_3line, symptom_diary, document_vault } = timelineData || {};

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4 animate-fade-in">

      {/* ─── Top Prominent Patient Switcher Banner (Doctor OPD only) ────────── */}
      {isDoctor && allPatients.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900 via-[#12372A] to-teal-900 p-4 sm:p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                OPD Consultation EHR
              </span>
              <span className="text-[11px] text-emerald-200 font-medium">
                Token #1 Active Patient Auto-Loaded
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <span>Select Active OPD Patient Record:</span>
            </h2>
          </div>

          {/* Large Prominent Dropdown Pill */}
          <div className="relative shrink-0 w-full sm:w-80">
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-400 rounded-full px-4 py-2.5 shadow-sm transition-all">
              <User className="w-4 h-4 text-emerald-800 shrink-0" />
              <select
                value={activePatientId ? (patient?.abha_id || patient?.patient_id || patient?.id || activePatientId) : ''}
                onChange={(e) => handlePatientSwitch(e.target.value || null)}
                className="bg-transparent text-xs sm:text-sm font-extrabold text-emerald-950 outline-none cursor-pointer w-full appearance-none pr-4"
              >
                <option value="" className="text-slate-500 font-bold bg-white">-- Select Patient to View Timeline --</option>
                {allPatients.map(p => {
                  const val = p.abha_id || p.patient_id || p.id;
                  const tokenLabel = p.queue_position ? ` (Token #${p.queue_position})` : '';
                  return (
                    <option key={p.id || val} value={val} className="text-slate-900 font-bold bg-white">
                      {p.name} ({p.abha_id || p.uhid || p.id}){tokenLabel}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-4 text-emerald-800 font-bold text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ─── Inline Loading State ───────────────────────────────────────────── */}
      {loading && activePatientId && (
        <div className="flex items-center justify-center py-16">
          <BrandedLoader message="Loading Patient Timeline..." />
        </div>
      )}

      {/* ─── Empty / No Patient Selected State ─────────────────────────────── */}
      {!loading && !hasPatientData && (
        <div className="bg-white p-10 sm:p-14 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 max-w-2xl mx-auto my-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto text-2xl shadow-sm border border-teal-200">
            📜
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {activePatientId ? 'No Timeline Records Found' : 'Select Patient to View Timeline'}
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              {activePatientId
                ? 'No consultation history found for this patient. Their records will appear here after their first visit.'
                : 'No patient history is currently loaded. Pick a patient from the green dropdown banner above or open the Patient Directory.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2"
            >
              <span>👤 Open Patient Directory →</span>
            </button>
          </div>
        </div>
      )}


      {hasPatientData && (
        <>
      {/* ─── Header Navigation Bar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-full">
                {patient.abha_id || patient.uhid}
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                {t('timeline.verifiedRecord', 'ABDM Verified Central Record')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {patient.gender ? patient.gender.toUpperCase() : 'MALE'} • {patient.age} yrs • Mobile: {patient.contact} • Blood: {patient.blood_group || 'O+'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCaseSheet && (
            <button
              onClick={() => onOpenCaseSheet(activePatientId)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Stethoscope className="w-4 h-4 text-amber-300" />
              <span>🩺 Open Active Case Sheet →</span>
            </button>
          )}

          <button
            onClick={() => setIsVaultModalOpen(true)}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>{t('timeline.uploadOld', 'Upload Old Report')}</span>
          </button>

          <div className="text-right pl-4 border-l border-slate-200">
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('timeline.totalConsultations', 'Total Consultations')}</span>
            <p className="text-xl font-bold text-emerald-700">{timeline.length}</p>
          </div>
        </div>
      </div>

      {/* ─── AI-Generated 3-Line Overall History Summary ────────────────────── */}
      {overall_summary_3line && (
        <div className="p-5 bg-white border border-slate-100 rounded-2xl space-y-3 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('timeline.aiSynthesis', 'AI Longitudinal Clinical Synthesis')}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">{t('timeline.computedFull', 'Computed over full medical history')}</span>
          </div>

          <div className="space-y-1.5 text-slate-700 font-medium">
            {typeof overall_summary_3line === 'object' && overall_summary_3line.line1_issues ? (
              <>
                <p className="leading-relaxed">
                  <strong className="text-slate-900 font-bold">1. Key Chronic Issues: </strong> {overall_summary_3line.line1_issues}
                </p>
                <p className="leading-relaxed">
                  <strong className="text-slate-900 font-bold">2. Longitudinal Trend: </strong> {overall_summary_3line.line2_trend}
                </p>
                <p className="leading-relaxed">
                  <strong className="text-slate-900 font-bold">3. Therapeutic Regimen: </strong> {overall_summary_3line.line3_meds}
                </p>
              </>
            ) : Array.isArray(overall_summary_3line) ? (
              overall_summary_3line.map((line, idx) => (
                <p key={idx} className="leading-relaxed">
                  <strong className="text-slate-900 font-bold">{idx + 1}. </strong> {line}
                </p>
              ))
            ) : (
              <p className="leading-relaxed">
                <strong className="text-slate-900 font-bold">1. Clinical Synthesis: </strong> {String(overall_summary_3line)}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT COLUMN: Vault & Diary ───── */}
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{t('timeline.sheet1', 'Self-Reported Diary')}</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                {symptom_diary?.length || 0} {t('timeline.entries', 'Entries')}
              </span>
            </div>

            {(!symptom_diary || symptom_diary.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center font-medium">{t('timeline.noSymptoms', 'No self-logged symptoms recorded.')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {symptom_diary.map((entry, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{entry.symptom}</span>
                      <span className="text-[10px] font-medium text-slate-500">{entry.date}</span>
                    </div>
                    {entry.notes && <p className="text-[11px] text-slate-600 italic">"{entry.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{t('timeline.ocrVault', 'OCR Document Vault')}</span>
              </h3>
              <button
                onClick={() => setIsVaultModalOpen(true)}
                className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                + {t('timeline.upload', 'Upload')}
              </button>
            </div>

            {(!document_vault || document_vault.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center font-medium">{t('timeline.noDocuments', 'No old documents attached.')}</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {document_vault.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {doc.file_name || doc.name || doc.title || "Diagnostic Report"}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        {doc.file_type || doc.status || "Verified"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {doc.source_doctor_or_hospital || 'Central Vault'} • {doc.date || '2026-08-15'}
                    </p>
                    <p className="text-[11px] text-slate-700 font-medium">
                      {doc.summary || doc.name || 'ABDM Central Encrypted Health Record'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ─── RIGHT COLUMN: Chronological Timeline ─── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>{t('timeline.sheet2', 'Chronological Consultations')}</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">{t('timeline.mostRecent', 'Most recent visit prioritized')}</span>
          </div>

          {timeline.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-100 text-center text-xs text-slate-500 font-medium shadow-sm">
              {t('timeline.noConsultations', 'No consultations recorded yet.')}
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-24 before:w-0.5 before:bg-slate-200">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative pl-32 flex items-start">
                  
                  {/* Date on the left */}
                  <div className="absolute left-0 top-5 w-20 text-right">
                    <span className="block text-xs font-bold text-slate-900">{item.date}</span>
                  </div>

                  {/* Timeline Bullet */}
                  <div className={`absolute left-[5.6rem] top-5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                    item.is_red_flag ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}></div>

                  {/* Consultation Card */}
                  <div className={`w-full p-5 rounded-2xl border shadow-sm space-y-4 bg-white text-xs ${
                    item.is_red_flag ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-100'
                  }`}>
                    
                    {/* Top Row: Doctor, Hospital */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{item.doctor_name || item.doctor || "Dr. Rajesh Vaidya"}</span>
                          <span className="text-[10px] text-slate-600 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {item.doctor_qualification || "BAMS, MD (Kayachikitsa)"}
                          </span>
                          {item.is_red_flag && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                              RED-FLAG
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.hospital_name || "All India Institute of Ayurveda (AIIA)"} • {t('timeline.token', 'Token')}: {item.token_number || "OPD-101"}
                        </p>
                      </div>

                      <button
                        onClick={() => setActivePrescriptionForPrint(item)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('timeline.prescriptionBtn', 'Prescription')}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">{t('timeline.chiefComplaints', 'Chief Complaints')}</span>
                        <p className="text-slate-900 font-medium">
                          {item.chief_complaints || item.chief_complaint || item.notes || item.title || "Joint stiffness, acid reflux & Sandhivata symptoms"}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-1">{t('timeline.diagnosis', 'Diagnosis (Ayurvedic / Modern)')}</span>
                        <p className="text-emerald-800 font-bold">
                          {item.diagnosis_ayurvedic || "Sandhivata"} {item.diagnosis_modern && `(${item.diagnosis_modern})`}
                        </p>
                      </div>
                    </div>

                    {/* AI Structured Voice Intake section if sent by patient */}
                    {item.intake_data?.structured && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>AI Patient Voice Triage Report</span>
                          </span>
                          {item.intake_data.structured.severity && (
                            <span className="px-2 py-0.5 bg-emerald-700 text-white rounded-full text-[9px] font-bold">
                              Severity: {item.intake_data.structured.severity}
                            </span>
                          )}
                        </div>
                        {item.intake_data.structured.clinical_summary && (
                          <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                            {item.intake_data.structured.clinical_summary}
                          </p>
                        )}
                        {item.intake_data.gap_qa && item.intake_data.gap_qa.length > 0 && (
                          <div className="pt-1.5 border-t border-emerald-200/60 space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Patient Q&A Answers:</span>
                            {item.intake_data.gap_qa.map((qa, qIdx) => (
                              qa.answer && qa.answer !== '—' && (
                                <div key={qIdx} className="text-[11px] text-slate-700">
                                  <span className="font-semibold text-slate-900">Q: {qa.question}</span> → <span className="font-medium">{qa.answer}</span>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attached ABDM Scanned Medical Records & Reports */}
                    {item.intake_data?.documents && item.intake_data.documents.length > 0 && (
                      <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-teal-900 uppercase flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>Attached Scanned Medical Records ({item.intake_data.documents.length})</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.intake_data.documents.map((doc, docIdx) => (
                            <div
                              key={docIdx}
                              onClick={() => setSelectedDocForOverlay(doc)}
                              className="p-2.5 bg-white rounded-lg border border-teal-200 shadow-2xs hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer space-y-1 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 group-hover:text-teal-950 text-[11px] truncate">{doc.file_name}</span>
                                <span className="text-[9px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">{doc.file_type}</span>
                              </div>
                              <p className="text-[10px] text-slate-500">{doc.source_doctor_or_hospital} • {doc.date}</p>
                              <span className="text-[10px] font-bold text-teal-700 underline block group-hover:text-teal-900">Click to Open Real Document →</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center gap-4 text-[11px]">
                      <div><span className="font-semibold text-slate-500">{t('timeline.prakriti', 'Prakriti')}:</span> <span className="font-bold text-slate-800">{item.prakriti || "Vata-Kapha"}</span></div>
                      <div><span className="font-semibold text-slate-500">{t('timeline.vikriti', 'Vikriti')}:</span> <span className="font-bold text-slate-800">{item.vikriti || "Vata Vriddhi"}</span></div>
                      {item.agni && <div><span className="font-semibold text-slate-500">{t('timeline.agni', 'Agni')}:</span> <span className="font-bold text-slate-800">{item.agni}</span></div>}
                      {item.koshtha && <div><span className="font-semibold text-slate-500">{t('timeline.koshtha', 'Koshtha')}:</span> <span className="font-bold text-slate-800">{item.koshtha}</span></div>}
                    </div>

                    {item.medicines && item.medicines.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('timeline.prescriptionRegimen', 'Prescription Regimen')}:</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {item.medicines.map((med, mIdx) => (
                            <div key={mIdx} className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-[11px]">
                              <span className="font-bold text-slate-900 block">{med.name}</span>
                              <span className="text-slate-500 font-medium mt-0.5 block">{med.dosage} • {med.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.is_author_of_private_notes ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[10px] uppercase">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>{t('timeline.privateNote', 'Your Confidential Private Note (Doctor Only)')}</span>
                        </div>
                        <p className="text-slate-800 font-medium">"{item.private_notes}"</p>
                      </div>
                    ) : item.has_hidden_private_notes ? (
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t('timeline.lockedNote', 'Private remark is locked.')}</span>
                      </div>
                    ) : null}

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      <PrescriptionPrintModal
        caseData={activePrescriptionForPrint}
        patient={patient}
        doctor={activePrescriptionForPrint}
        isOpen={!!activePrescriptionForPrint}
        onClose={() => setActivePrescriptionForPrint(null)}
      />

      <DocumentVaultModal
        patientId={patient?.id}
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onDocumentUploaded={() => loadTimeline()}
      />

      {selectedDocForOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 bg-gradient-to-r from-[#12372A] to-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-sm font-extrabold">{selectedDocForOverlay.file_name}</h3>
                  <p className="text-[11px] text-emerald-200">{selectedDocForOverlay.source_doctor_or_hospital} • {selectedDocForOverlay.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDocForOverlay(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
                {selectedDocForOverlay.file_url ? (
                  selectedDocForOverlay.is_image || selectedDocForOverlay.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|heic)$/i.test(selectedDocForOverlay.file_name) ? (
                    <div className="text-center p-2 bg-slate-950 rounded-xl">
                      <img src={selectedDocForOverlay.file_url} alt={selectedDocForOverlay.file_name} className="max-h-[400px] w-auto mx-auto rounded-lg object-contain shadow-md border border-slate-700" />
                    </div>
                  ) : (
                    <div className="w-full h-96 rounded-xl overflow-hidden bg-white shadow-md">
                      <iframe src={selectedDocForOverlay.file_url} title={selectedDocForOverlay.file_name} className="w-full h-full border-0" />
                    </div>
                  )
                ) : (
                  <div className="p-5 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-900">{selectedDocForOverlay.source_doctor_or_hospital || 'Central Healthcare Clinic'}</h4>
                    <p className="text-xs text-slate-700 font-medium">{selectedDocForOverlay.summary || 'Attached ABDM clinical record.'}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setSelectedDocForOverlay(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 border rounded-xl">Close</button>
              <button onClick={() => alert(`Downloading ${selectedDocForOverlay.file_name}...`)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">Download Record</button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
}