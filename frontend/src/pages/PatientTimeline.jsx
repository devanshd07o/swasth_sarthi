import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, FileText, Pill, Clock, ArrowLeft, HeartPulse, ShieldCheck, 
  Lock, Unlock, Sparkles, UploadCloud, Eye, AlertTriangle, Stethoscope, Building2, CheckCircle2 
} from 'lucide-react';
import { getPatientTimeline } from '../services/api';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';
import DocumentVaultModal from '../components/DocumentVaultModal';

export default function PatientTimeline({ patientId, onBack, currentDoctorId = "DOC-AYUR-101" }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePrescriptionForPrint, setActivePrescriptionForPrint] = useState(null);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  useEffect(() => {
    if (patientId) loadTimeline();
  }, [patientId, currentDoctorId]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const data = await getPatientTimeline(patientId, currentDoctorId);
      setTimelineData(data);
    } catch (e) {
      console.error('Failed to load patient timeline', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-xs">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <span className="font-bold">Loading Longitudinal ABDM Clinical Records across All Vaidyas...</span>
      </div>
    );
  }

  if (!timelineData || !timelineData.patient) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-slate-500 text-xs">
        <p>No patient records found.</p>
        <button onClick={onBack} className="mt-3 text-xs text-emerald-700 font-bold underline">Go Back to Queue</button>
      </div>
    );
  }

  const { patient, timeline, overall_summary_3line, symptom_diary, document_vault } = timelineData;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      
      {/* ─── Header Navigation Bar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 transition-all"
            title="Back to Patient Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full font-mono">
                {patient.abha_id || patient.uhid}
              </span>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                ABDM Verified Central Record
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {patient.gender.toUpperCase()} • {patient.age} yrs • Mobile: {patient.contact} • Blood: {patient.blood_group || 'O+'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVaultModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>Upload Old Report</span>
          </button>

          <div className="text-right pl-3 border-l border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Consultations</span>
            <p className="text-xl font-black text-emerald-700">{timeline.length}</p>
          </div>
        </div>
      </div>

      {/* ─── AI-Generated 3-Line Overall History Summary ────────────────────── */}
      {overall_summary_3line && (
        <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/40 border border-emerald-200 rounded-3xl space-y-2 shadow-xs text-xs">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
            <span className="font-black text-emerald-950 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Longitudinal Clinical Synthesis (Gemini 1.5 Flash)</span>
            </span>
            <span className="text-[10px] text-emerald-800 font-bold">Computed over full medical history</span>
          </div>

          <div className="space-y-1.5 text-slate-800 font-medium">
            <p className="leading-relaxed">
              <strong className="text-emerald-900">1. Recurring Issues:</strong> {overall_summary_3line.line1_issues}
            </p>
            <p className="leading-relaxed">
              <strong className="text-teal-900">2. Clinical Trajectory:</strong> {overall_summary_3line.line2_trend}
            </p>
            <p className="leading-relaxed">
              <strong className="text-slate-900">3. Effective Formulations:</strong> {overall_summary_3line.line3_meds}
            </p>
          </div>
        </div>
      )}

      {/* ─── Two Sheets Split View: Sheet 1 (Symptom Diary) + Sheet 2 (Consultations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ─── LEFT COLUMN: Sheet 1 (Patient Diary) & OCR Document Vault ───── */}
        <div className="space-y-6">
          
          {/* Patient Self-Reported Symptom Diary (Sheet 1) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Sheet 1 • Self-Reported Diary</span>
              </h3>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded">
                {symptom_diary?.length || 0} Entries
              </span>
            </div>

            {(!symptom_diary || symptom_diary.length === 0) ? (
              <p className="text-xs text-slate-400 py-3 text-center">No self-logged symptoms recorded.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {symptom_diary.map((entry, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{entry.symptom}</span>
                      <span className="text-[10px] font-bold text-slate-400">{entry.date}</span>
                    </div>
                    {entry.notes && <p className="text-[11px] text-slate-600 italic">"{entry.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OCR Document Vault Records */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>OCR Document Vault</span>
              </h3>
              <button
                onClick={() => setIsVaultModalOpen(true)}
                className="text-[10px] text-emerald-700 font-bold hover:underline"
              >
                + Upload
              </button>
            </div>

            {(!document_vault || document_vault.length === 0) ? (
              <p className="text-xs text-slate-400 py-3 text-center">No old documents attached.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {document_vault.map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 truncate max-w-[180px]">{doc.file_name}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        {doc.file_type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{doc.source_doctor_or_hospital} • {doc.date}</p>
                    <p className="text-[11px] text-slate-700">{doc.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ─── RIGHT COLUMN: Sheet 2 (Unified Timeline Across ALL Doctors) ─── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>Sheet 2 • Chronological Consultations Across All Doctors</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Most recent visit prioritized</span>
          </div>

          {timeline.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              No consultations recorded yet.
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative pl-10">
                  
                  {/* Timeline Bullet */}
                  <div className={`absolute left-3.5 top-4 w-3.5 h-3.5 rounded-full border-4 border-white shadow-xs ${
                    item.is_red_flag ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
                  }`}></div>

                  {/* Consultation Card */}
                  <div className={`p-5 rounded-3xl border shadow-xs space-y-3.5 bg-white text-xs ${
                    item.is_red_flag ? 'border-rose-300 ring-2 ring-rose-200/50' : 'border-slate-200/80'
                  }`}>
                    
                    {/* Top Row: Doctor, Hospital, Date */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{item.doctor_name}</span>
                          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.doctor_qualification}
                          </span>
                          {item.is_red_flag && (
                            <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded">
                              🚨 RED-FLAG EMERGENCY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.hospital_name} • {item.date} • Token: {item.token_number || "OPD-101"}
                        </p>
                      </div>

                      <button
                        onClick={() => setActivePrescriptionForPrint(item)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-xs flex items-center gap-1 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Prescription</span>
                      </button>
                    </div>

                    {/* Chief Complaints & Clinical Diagnosis (OPEN TO ALL DOCTORS) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">Chief Complaints</span>
                        <p className="text-slate-800 font-semibold">{item.chief_complaints}</p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-bold block text-[10px] uppercase mb-0.5">Diagnosis (Ayurvedic / Modern)</span>
                        <p className="text-emerald-800 font-black">
                          {item.diagnosis_ayurvedic || "Sandhivata"} {item.diagnosis_modern && `(${item.diagnosis_modern})`}
                        </p>
                      </div>
                    </div>

                    {/* Prakriti, Agni & Pariksha (OPEN) */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-4 text-[11px]">
                      <div><span className="font-bold text-slate-500">Prakriti:</span> <span className="font-extrabold text-slate-800">{item.prakriti || "Vata-Kapha"}</span></div>
                      <div><span className="font-bold text-slate-500">Vikriti:</span> <span className="font-extrabold text-slate-800">{item.vikriti || "Vata Vriddhi"}</span></div>
                      {item.agni && <div><span className="font-bold text-slate-500">Agni:</span> <span className="font-extrabold text-slate-800">{item.agni}</span></div>}
                      {item.koshtha && <div><span className="font-bold text-slate-500">Koshtha:</span> <span className="font-extrabold text-slate-800">{item.koshtha}</span></div>}
                    </div>

                    {/* Medicines Prescribed */}
                    {item.medicines && item.medicines.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Prescription Regimen:</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {item.medicines.map((med, mIdx) => (
                            <div key={mIdx} className="p-2 bg-emerald-50/40 rounded-xl border border-emerald-100 text-[11px]">
                              <span className="font-extrabold text-emerald-950 block">{med.name}</span>
                              <span className="text-slate-600 text-[10px]">{med.dosage} • {med.duration}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ─── PRIVACY BOUNDARY: DOCTOR PRIVATE NOTES ────────────────── */}
                    {item.is_author_of_private_notes ? (
                      <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-teal-900 font-bold text-[10px] uppercase">
                          <Unlock className="w-3.5 h-3.5 text-teal-600" />
                          <span>Your Confidential Private Note (Doctor Only)</span>
                        </div>
                        <p className="text-teal-950 font-medium italic">"{item.private_notes}"</p>
                      </div>
                    ) : item.has_hidden_private_notes ? (
                      <div className="p-2.5 bg-slate-100/70 border border-slate-200 rounded-2xl text-[11px] text-slate-500 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Private remark by {item.doctor_name} is locked & confidential to authoring doctor.</span>
                      </div>
                    ) : null}

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Prescription PDF Modal */}
      <PrescriptionPrintModal
        caseData={activePrescriptionForPrint}
        patient={patient}
        isOpen={!!activePrescriptionForPrint}
        onClose={() => setActivePrescriptionForPrint(null)}
      />

      {/* Document Vault Modal */}
      <DocumentVaultModal
        patientId={patient?.id}
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onDocumentUploaded={() => loadTimeline()}
      />

    </div>
  );
}
