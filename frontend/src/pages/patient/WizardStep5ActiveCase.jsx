import React from 'react';
import { Stethoscope, Clock, FileText, ShieldCheck, Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WizardStep5ActiveCase({
  bookingSuccessCase,
  timelineData,
  setActiveView,
  setWizardStep,
  setActivePrescriptionForPrint,
  isDashboard = false
}) {
  const { t } = useTranslation();
  
  if (isDashboard) {
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

        {timelineData?.timeline?.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            {t('patientPortal.noConsultationsRecorded', 'No consultations recorded yet. Start by booking a consultation in the wizard.')}
          </div>
        ) : (
          <div className="space-y-4">
            {timelineData?.timeline?.map((item, idx) => (
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
                    <p className="text-[11px] text-slate-500 font-medium">
                      {item.hospital_name} • {t('patientPortal.consultationDateLabel', 'Consultation Date:')} {item.date}
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
          <p className="text-xs text-slate-600 font-medium">
            {currentCase?.hospital_name || "All India Institute of Ayurveda"} • {t('patientPortal.todaysQueueSlot', "Today's Queue Slot")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{t('patientPortal.btnViewPrescriptionDiet', 'View Digital Prescription & Diet')}</span>
          </button>
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
