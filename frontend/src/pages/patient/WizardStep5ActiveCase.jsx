import React from 'react';
import { Stethoscope, Clock, FileText, ShieldCheck, Pill, Lock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formatDateTime = (item) => {
  const raw = item?.created_at || item?.timestamp || item?.date;
  if (!raw) {
    const now = new Date();
    return now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  const dateObj = new Date(raw);
  if (isNaN(dateObj.getTime())) {
    return String(raw);
  }
  const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${formattedDate} at ${formattedTime}`;
};

export default function WizardStep5ActiveCase({
  bookingSuccessCase,
  timelineData,
  setActiveView,
  setWizardStep,
  setActivePrescriptionForPrint,
  isDashboard = false,
  onStartNewIntake
}) {
  const { t } = useTranslation();

  if (isDashboard) {
    const rawTimeline = Array.isArray(timelineData?.timeline) ? timelineData.timeline : [];
    const signedPrescriptions = rawTimeline.filter(item => item.prescription_signed === true || item.status === 'completed' || (item.medicines && item.medicines.length > 0));
    const pendingCases = rawTimeline.filter(item => item.prescription_signed !== true && item.status !== 'completed' && (!item.medicines || item.medicines.length === 0));

    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t('patientPortal.sheet2Tag', "Doctor's Verified Case Sheet (Sheet 2)")}
            </span>
            <h3 className="text-lg font-semibold text-slate-900 mt-1">
              {t('patientPortal.sheet2Title', 'Official Digital Prescriptions & Treatment History')}
            </h3>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {t('patientPortal.sheet2AbdmSync', 'Central ABDM Synchronized')}
          </span>
        </div>

        {/* Pending Consultation Banner */}
        {pendingCases.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-600 animate-spin-slow shrink-0" />
              <span>⏳ Active OPD Consultation in Progress ({pendingCases[0].token_number || 'OPD Token'})</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium pl-6">
              Consultation with <strong>{pendingCases[0].doctor_name || 'Dr. Rajesh Vaidya'}</strong> is active. Your official prescription will be published here automatically once the Doctor examines and digitally signs your case sheet.
            </p>
          </div>
        )}

        {signedPrescriptions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
            <Lock className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <span className="font-bold text-slate-700 block">No Signed Prescriptions Available Yet</span>
            <p className="text-[11px] text-slate-500">
              Digital prescriptions unlock automatically after your Vaidya completes and signs the Ashtavidha OPD consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {signedPrescriptions.map((item, idx) => (
              <div key={idx} className="p-5 bg-white hover:bg-emerald-50/30 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.doctor_name}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {item.token_number || "OPD-101"}
                      </span>
                      {item.prescription_signed && (
                        <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          {t('patientPortal.digitallySigned', 'Digitally Signed')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 flex-wrap mt-0.5">
                      <span>{item.hospital_name}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                      <Clock className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                      <span className="font-bold text-slate-700">{formatDateTime(item)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setActivePrescriptionForPrint({ ...item, hospital_name: item.hospital_name })}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('patientPortal.btnViewPrintPrescriptionPdf', 'View / Print Prescription PDF')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">{t('patientPortal.ayurvedicDiagnosisLabel', 'Ayurvedic Diagnosis')}</span>
                    <p className="font-semibold text-emerald-800 text-sm">{item.diagnosis_ayurvedic || "Sandhivata (Osteoarthritis)"}</p>
                    {item.diagnosis_modern && <p className="text-slate-600 font-medium text-[11px] mt-1">{t('patientPortal.modernLabel', 'Modern:')} {item.diagnosis_modern}</p>}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-0.5">{t('patientPortal.prakritiVikritiLabel', 'Prakriti & Vikriti')}</span>
                    <p className="font-semibold text-slate-800">{item.prakriti || "Vata-Kapha"} | {item.vikriti || "Vata Vriddhi"}</p>
                  </div>
                </div>

                {item.medicines && item.medicines.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('patientPortal.prescribedMedicinesLabel', 'Prescribed Medicines:')}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {item.medicines.map((med, mIdx) => (
                        <div key={mIdx} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                          <span className="font-semibold text-slate-900 block">{med.name}</span>
                          <span className="text-slate-600 text-[11px] block mt-0.5">{med.dosage} • {med.duration}</span>
                          <span className="text-emerald-700 font-medium text-[10px] mt-1 block">{t('patientPortal.anupanaLabel', 'Anupana:')} {med.anupana || item.anupana || "Warm Water"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.pathya_apathya && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-900 font-medium mt-2">
                    <span className="font-semibold text-amber-800 uppercase block text-[10px] mb-0.5">{t('patientPortal.pathyaRegimenLabel', 'Pathya - Apathya Diet Regimen:')}</span>
                    <p>{item.pathya_apathya}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!(bookingSuccessCase || timelineData?.timeline?.length > 0)) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-4 shadow-sm animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">{t('patientPortal.noActiveCaseTitle', 'No Active Case Registered Yet')}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('patientPortal.noActiveCaseDesc', "You haven't booked an active OPD token today. Discover verified Vaidyas in Step 4 to register your case.")}
          </p>
        </div>
        <button
          onClick={() => setWizardStep(4)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer transition-all mt-4"
        >
          {t('patientPortal.btnFindDoctor', 'Find & Book a Doctor (Step 4) →')}
        </button>
      </div>
    );
  }

  const currentCase = bookingSuccessCase || timelineData?.timeline?.[0];
  const isSigned = currentCase?.prescription_signed === true || currentCase?.status === 'completed';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        currentCase?.is_red_flag
          ? 'bg-rose-50 border-rose-200'
          : 'bg-emerald-50 border-emerald-100'
      }`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              currentCase?.is_red_flag
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-700 text-white'
            }`}>
              {currentCase?.is_red_flag ? t('patientPortal.emergencyCaseTag', 'Emergency Case') : t('patientPortal.activeOpdConsultationTag', 'Active OPD Consultation')}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {t('patientPortal.tokenLabel', 'Token:')} {currentCase?.token_number || "OPD-101"}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            {t('patientPortal.consultationWith', 'Consultation with')} {currentCase?.doctor_name || "Dr. Rajesh Vaidya"}
          </h3>
          <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span>{currentCase?.hospital_name || "All India Institute of Ayurveda"}</span>
            <span>•</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-bold text-slate-800">{formatDateTime(currentCase)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSigned ? (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t('patientPortal.btnViewPrescriptionDiet', 'View Digital Prescription & Diet')}</span>
            </button>
          ) : (
            <div className="flex flex-col items-start sm:items-end gap-1">
              <button
                disabled={true}
                className="px-4 py-2.5 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-300 opacity-85 cursor-not-allowed shadow-2xs"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{t('patientPortal.prescriptionPendingSign', '🔒 Prescription Pending Doctor Sign')}</span>
              </button>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                ⏳ OPD Consultation in progress
              </span>
            </div>
          )}

          {onStartNewIntake && (
            <button
              onClick={onStartNewIntake}
              className="px-4 py-2.5 bg-[#12372A] hover:bg-[#0B2B20] text-amber-300 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer border border-emerald-500/30"
            >
              <span>🔄 {t('patientPortal.startNewIntake', 'Start New Intake Session')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 text-xs shadow-sm">
        <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-slate-600 font-medium">
          {t('patientPortal.caseTransmittedNotice', "Your case sheet has been securely transmitted to the Vaidya's Clinical Console. When your token is called, the Vaidya will examine Nadi & Prakriti and digitally sign your prescription.")}
        </p>
      </div>
    </div>
  );
}
