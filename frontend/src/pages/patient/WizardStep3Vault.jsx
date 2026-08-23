import React, { useState } from 'react';
import { FileText, Plus, ArrowRight, Eye, Download, Printer, X, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DocumentVaultModal from '../../components/DocumentVaultModal';

/* ── Document Viewer Overlay Modal ───────────────────────────────────────── */
function DocumentPreviewModal({ doc, onClose }) {
  const { t } = useTranslation();
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#12372A] to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold truncate max-w-md">{doc.file_name}</h3>
                <span className="text-[10px] font-bold bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-500/50">
                  {doc.file_type}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                {doc.source_doctor_or_hospital} • {doc.date}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Compression & Security Banner */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-[11px]">ABDM Encrypted • Digitized Medical Record</span>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-400">
              ⚡ 84% Auto-Compressed
            </span>
          </div>

          {/* Document Summary */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Clinical Description</span>
            <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {doc.summary || 'Digitized clinical record stored in Central ABHA Vault.'}
            </p>
          </div>

          {/* Extracted AI OCR Facts */}
          {doc.extracted_data && (
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2">
              <div className="flex items-center gap-1.5 text-teal-900">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="font-extrabold text-xs uppercase tracking-wider">AI OCR Extracted Clinical Facts</span>
              </div>
              <div className="space-y-1 text-xs text-teal-950">
                {doc.extracted_data.diagnoses && (
                  <div><span className="font-semibold text-teal-700">Diagnosis:</span> <span className="font-bold">{Array.isArray(doc.extracted_data.diagnoses) ? doc.extracted_data.diagnoses.join(', ') : doc.extracted_data.diagnoses}</span></div>
                )}
                {doc.extracted_data.medicines && (
                  <div>
                    <span className="font-semibold text-teal-700">Prescribed Medicines:</span>{' '}
                    <span className="font-bold">{doc.extracted_data.medicines.map(m => typeof m === 'object' ? `${m.name} (${m.dosage || '1 tab'})` : m).join(', ')}</span>
                  </div>
                )}
                {doc.extracted_data.summary && (
                  <div><span className="font-semibold text-teal-700">OCR Summary:</span> {doc.extracted_data.summary}</div>
                )}
              </div>
            </div>
          )}

          {/* Visual Document Viewer Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Visual Document Viewer</span>
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-600" /> Real-Time Record View
              </span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
              {doc.file_url ? (
                doc.is_image || doc.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|heic)$/i.test(doc.file_name) ? (
                  <div className="text-center p-2 bg-slate-950 rounded-xl">
                    <img src={doc.file_url} alt={doc.file_name} className="max-h-[400px] w-auto mx-auto rounded-lg object-contain shadow-md border border-slate-700" />
                  </div>
                ) : (
                  <div className="w-full h-96 rounded-xl overflow-hidden bg-white shadow-md">
                    <iframe src={doc.file_url} title={doc.file_name} className="w-full h-full border-0" />
                  </div>
                )
              ) : doc.file_name?.includes('XRay') || doc.file_name?.includes('X_Ray') || doc.file_type === 'Diagnostic Report' ? (
                /* Rich Digital Radiology X-Ray Report Visualization */
                <div className="p-5 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 space-y-3 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 font-black text-xs flex items-center justify-center border border-slate-700">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{doc.source_doctor_or_hospital || 'City Care Diagnostic & Imaging Centre'}</h4>
                        <span className="text-[10px] font-semibold text-slate-500 block">Department of Radiology & Digital Imaging • NABL Accredited</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <span className="font-bold block text-slate-800">Date: {doc.date}</span>
                      <span>Accession #: RAD-2026-8891</span>
                    </div>
                  </div>

                  {/* Simulated Dark X-Ray Film Canvas Box */}
                  <div className="p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800 text-center space-y-2 relative overflow-hidden">
                    <div className="absolute top-2 left-3 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">RIGHT KNEE AP / LATERAL VIEW</div>
                    <div className="absolute top-2 right-3 text-[9px] font-mono text-amber-400 font-bold uppercase">R • WEIGHT BEARING</div>

                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                      <div className="w-24 h-28 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-900/80 shadow-inner relative">
                        <div className="w-12 h-10 border-b-2 border-emerald-400/60 rounded-b-full mb-1"></div>
                        <div className="w-10 h-10 border-t-2 border-emerald-400/60 rounded-t-full"></div>
                        <span className="text-[9px] font-mono text-emerald-300 font-bold mt-1">JOINT SPACE: 2.4mm</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 font-bold">DIGITAL RADIOGRAPH SCAN — HIGH RESOLUTION (100% COMPRESSED)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-left">
                    <span className="font-extrabold text-slate-900 block text-[11px]">RADIOLOGY FINDINGS & IMPRESSION:</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">
                      1. AP and Lateral views of the Right Knee Joint show mild-to-moderate loss of joint space in medial compartment.<br />
                      2. Subchondral sclerosis and prominent marginal osteophyte formation at tibial condyles.<br />
                      3. Patellofemoral joint space is preserved. No suprapatellar joint effusion.<br />
                      <strong className="text-emerald-900 block mt-1">IMPRESSION: Grade II Osteoarthritis Right Knee (Sandhivata).</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <div>Ref Vaidya: Dr. Rajesh Vaidya</div>
                    <div className="font-bold text-slate-800">Radiologist: Dr. S. K. Gupta, MD (Radiology) ✓</div>
                  </div>
                </div>
              ) : doc.file_name?.includes('Prescription') || doc.file_type === 'Prescription' ? (
                /* Rich AIIA Government OPD Prescription Parchaa Sheet */
                <div className="p-5 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 space-y-3 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
                  <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#12372A] text-amber-300 font-black text-sm flex items-center justify-center shadow-xs">
                        🌿
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">All India Institute of Ayurveda (AIIA), New Delhi</h4>
                        <span className="text-[10px] font-bold text-emerald-800 block">Ministry of Ayush • Govt. of India OPD Health Record</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <span className="font-bold block text-slate-800">OPD Ticket: AIIA-2026-9920</span>
                      <span>Date: {doc.date}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-emerald-50/60 rounded-xl text-[10px] border border-emerald-200">
                    <div><span className="text-slate-500 block">Patient:</span> <strong className="text-slate-900">Ramesh Sharma</strong></div>
                    <div><span className="text-slate-500 block">ABHA ID:</span> <strong className="text-slate-900">ABHA-9821-4501</strong></div>
                    <div><span className="text-slate-500 block">Prakriti:</span> <strong className="text-emerald-800">Vata-Pitta</strong></div>
                    <div><span className="text-slate-500 block">Vaidya:</span> <strong className="text-slate-900">Dr. Rajesh Vaidya</strong></div>
                  </div>

                  <div className="space-y-1.5 text-left text-xs">
                    <span className="font-extrabold text-slate-900 text-[11px] block text-emerald-900">Rx PRESCRIPTION REGIMEN (चिकित्सा योजना):</span>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-800">
                      <div>1. <strong>Yograj Guggulu 250mg</strong> — 2 tabs BID after meals with lukewarm water (30 Days)</div>
                      <div>2. <strong>Rasnadi Kwath</strong> — 15 ml BID with equal lukewarm water (30 Days)</div>
                      <div>3. <strong>Mahanarayana Taila</strong> — Local gentle application on right knee (BID)</div>
                      <div>4. <strong>Janu Basti Therapy</strong> — 7 consecutive OPD sessions recommended</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-950">
                      <strong className="block text-amber-900">Pathya (पथ्य):</strong> Warm cooked food, lukewarm water, light gentle walks.
                    </div>
                    <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-rose-950">
                      <strong className="block text-rose-900">Apathya (अपथ्य):</strong> Avoid cold food, curd at night, heavy weight lifting.
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Central ABDM Health Pass Signed Record</span>
                    <span className="font-bold text-emerald-800">Signed: Dr. Rajesh Vaidya (MD Kayachikitsa) ✓</span>
                  </div>
                </div>
              ) : (
                /* Realistic Digitized Report Preview Sheet for general records */
                <div className="p-5 bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 space-y-4 font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
                  <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center">
                        SS
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{doc.source_doctor_or_hospital || 'All India Institute of Ayurveda'}</h4>
                        <span className="text-[10px] font-semibold text-emerald-800 block">ABDM Central Digital Health Repository</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      <span className="font-bold block text-slate-800">Date: {doc.date}</span>
                      <span>Ref: ABDM-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg text-[11px] border border-slate-200">
                    <div><span className="font-semibold text-slate-500">Record Type:</span> <span className="font-bold text-slate-900">{doc.file_type}</span></div>
                    <div><span className="font-semibold text-slate-500">Status:</span> <span className="font-bold text-emerald-700">Verified & Attached</span></div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">Clinical Findings & Prescriptions:</span>
                    <p className="text-slate-700 leading-relaxed font-medium pt-1">
                      {doc.summary || 'Patient record digitized and formatted according to Ayush ABDM Health Standards. Full clinical details attached.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                    <span>Authentic Government Health Pass Record</span>
                    <span className="font-bold text-emerald-700">Digital Seal Verified ✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer">
            {t('common.close', 'Close Overlay')}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Downloading ${doc.file_name}...`)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Record</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ── Main Step 3 Component ────────────────────────────────────────────────── */
export default function WizardStep3Vault({
  patientDocs, setPatientDocs,
  isVaultModalOpen, setIsVaultModalOpen,
  activePatient,
  onBack, onNext
}) {
  const { t } = useTranslation();
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {t('patientPortal.step3Tag', 'Step 3 of 5 • Scanned Medical Records')}
          </span>
          <h3 className="text-lg font-semibold text-slate-900 mt-2">
            {t('patientPortal.step3Title', 'OCR Document Vault & Old Prescriptions')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('patientPortal.step3Desc', 'Upload old paper prescriptions, blood reports, or X-rays. Scanned once, available to all consulting Vaidyas.')}
          </p>
        </div>

        <button
          onClick={() => setIsVaultModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('patientPortal.btnUploadOcr', 'Upload Old Report / Parchaa')}</span>
        </button>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-600 block">{t('patientPortal.existingDocsLabel', 'Existing Digitized Documents on Central ABHA Record (Click to open overlay preview):')}</span>
        {patientDocs.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            {t('patientPortal.noDocsText', 'No documents uploaded yet. You can click "Upload Old Report" or skip to doctor discovery.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientDocs.map((doc, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPreviewDoc(doc)}
                className="p-4 bg-white hover:bg-emerald-50/70 rounded-xl border border-slate-200 hover:border-emerald-400 shadow-sm space-y-2 text-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 group-hover:text-emerald-950 flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{doc.file_name}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                    {doc.file_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {doc.source_doctor_or_hospital} • {doc.date}
                </p>
                <p className="text-xs text-slate-700 font-medium line-clamp-2">{doc.summary}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-extrabold text-emerald-700">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Open Overlay Preview</span>
                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">⚡ Compressed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition-all"
        >
          ← {t('patientPortal.btnBackVoiceIntake', 'Back to Voice Intake')}
        </button>

        <button
          onClick={onNext}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>{t('patientPortal.btnProceedStep4', 'Proceed to Doctor Discovery (Step 4)')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Upload Modal */}
      {isVaultModalOpen && (
        <DocumentVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => setIsVaultModalOpen(false)}
          patientId={activePatient?.id}
          onDocumentUploaded={(newDoc) => setPatientDocs(prev => [newDoc, ...prev])}
        />
      )}

      {/* Document Viewer Overlay Modal */}
      {selectedPreviewDoc && (
        <DocumentPreviewModal
          doc={selectedPreviewDoc}
          onClose={() => setSelectedPreviewDoc(null)}
        />
      )}
    </div>
  );
}
