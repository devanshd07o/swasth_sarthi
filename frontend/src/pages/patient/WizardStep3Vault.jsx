import React from 'react';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DocumentVaultModal from '../../components/DocumentVaultModal';

export default function WizardStep3Vault({
  patientDocs, setPatientDocs,
  isVaultModalOpen, setIsVaultModalOpen,
  activePatient,
  onBack, onNext
}) {
  const { t } = useTranslation();

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
        <span className="text-xs font-semibold text-slate-600 block">{t('patientPortal.existingDocsLabel', 'Existing Digitized Documents on Central ABHA Record:')}</span>
        {patientDocs.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            {t('patientPortal.noDocsText', 'No documents uploaded yet. You can click "Upload Old Report" or skip to doctor discovery.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientDocs.map((doc, idx) => (
              <div key={idx} className="p-4 bg-white hover:bg-emerald-50/50 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    {doc.file_name}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    {doc.file_type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
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

      {isVaultModalOpen && (
        <DocumentVaultModal
          isOpen={isVaultModalOpen}
          onClose={() => setIsVaultModalOpen(false)}
          patientId={activePatient?.id}
          onDocumentAdded={(newDoc) => setPatientDocs(prev => [newDoc, ...prev])}
        />
      )}
    </div>
  );
}
