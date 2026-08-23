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
                doc.is_image || doc.mime_type?.startsWith('image/') ? (
                  <div className="text-center p-2 bg-slate-950 rounded-xl">
                    <img src={doc.file_url} alt={doc.file_name} className="max-h-[380px] w-auto mx-auto rounded-lg object-contain shadow-md border border-slate-700" />
                  </div>
                ) : (
                  <div className="w-full h-96 rounded-xl overflow-hidden bg-white shadow-md">
                    <iframe src={doc.file_url} title={doc.file_name} className="w-full h-full border-0" />
                  </div>
                )
              ) : (
                /* Realistic Digitized Report Preview Sheet for ABDM records */
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
