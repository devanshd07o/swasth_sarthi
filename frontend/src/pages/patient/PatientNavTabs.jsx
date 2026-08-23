import React from 'react';
import { ClipboardList, Stethoscope, BookOpen, FolderOpen, Check, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PatientNavTabs({ activeView, setActiveView, wizardStep, setWizardStep, documentCount, maxUnlockedStep = 1 }) {
  const { t } = useTranslation();

  const steps = [
    { s: 1, label: t('patientPortal.step1IdentifyClean', 'Identify') },
    { s: 2, label: t('patientPortal.step2ConverseClean', 'Converse') },
    { s: 3, label: t('patientPortal.step3ScanClean', 'Scan') },
    { s: 4, label: t('patientPortal.step4DiscoverClean', 'Discover') },
    { s: 5, label: t('patientPortal.step5ActiveCaseClean', 'Active Case') }
  ];

  const currentStepObj = steps.find(s => s.s === wizardStep) || steps[0];

  return (
    <div className="space-y-3 w-full">
      {/* ─── TIER 1: MAIN SECTION NAVIGATION TABS ─────────────────────────────── */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        {/* Mobile Horizontal Scrollbar-Free Pill Container (< sm) & Grid on Desktop (>= sm) */}
        <div className="flex sm:grid sm:grid-cols-4 gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          
          <button
            type="button"
            onClick={() => setActiveView('wizard_flow')}
            className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 sm:shrink ${
              activeView === 'wizard_flow'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>{t('patientPortal.tabWizard', '5-Step Intake Wizard')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 sm:shrink ${
              activeView === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>{t('patientPortal.tabActiveCases', 'Active Prescriptions')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('symptom_diary')}
            className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 sm:shrink ${
              activeView === 'symptom_diary'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>{t('patientPortal.tabSymptomDiary', 'Symptom Diary')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('document_vault')}
            className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0 sm:shrink ${
              activeView === 'document_vault'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
            }`}
          >
            <FolderOpen className="w-4 h-4 shrink-0" />
            <span>{t('patientPortal.tabDocumentVault', 'OCR Vault')}</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-800">
              {documentCount || 0}
            </span>
          </button>

        </div>
      </div>

      {/* ─── TIER 2: 5-STEP INTAKE STEPPER BAR (RESPONSIVE & LOCKED PROGRESSION) ─ */}
      {activeView === 'wizard_flow' && (
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm animate-fade-in space-y-3">
          
          {/* Mobile Stepper Summary (< sm screens) */}
          <div className="flex sm:hidden items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {wizardStep}
              </span>
              <span className="text-xs font-bold text-slate-900">
                Step {wizardStep} of 5: {currentStepObj.label}
              </span>
            </div>

            {/* Quick Mobile Step Selectors */}
            <div className="flex items-center gap-1">
              {steps.map((sObj) => {
                const isLocked = sObj.s > maxUnlockedStep;
                return (
                  <button
                    key={sObj.s}
                    type="button"
                    disabled={isLocked}
                    onClick={() => !isLocked && setWizardStep(sObj.s)}
                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                      sObj.s === wizardStep
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                        : sObj.s < wizardStep
                        ? 'bg-emerald-100 text-emerald-800'
                        : isLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    {isLocked ? <Lock className="w-2.5 h-2.5" /> : sObj.s < wizardStep ? <Check className="w-3 h-3" /> : sObj.s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop/Tablet 5-Column Grid (>= sm screens) */}
          <div className="hidden sm:grid sm:grid-cols-5 gap-2 items-center">
            {steps.map((stepObj) => {
              const isCompleted = stepObj.s < wizardStep;
              const isActive = stepObj.s === wizardStep;
              const isLocked = stepObj.s > maxUnlockedStep;

              return (
                <button
                  key={stepObj.s}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && setWizardStep(stepObj.s)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all border ${
                    isLocked
                      ? 'bg-slate-50/60 border-slate-200/60 text-slate-300 cursor-not-allowed opacity-60'
                      : isActive
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100 cursor-pointer'
                      : isCompleted
                      ? 'bg-white border-emerald-200 text-emerald-800 cursor-pointer'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                      isLocked
                        ? 'bg-slate-100 text-slate-300'
                        : isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3 h-3 text-slate-400" /> : isCompleted ? <Check className="w-3.5 h-3.5" /> : stepObj.s}
                  </div>
                  <span
                    className={`text-xs font-semibold truncate text-left ${
                      isLocked
                        ? 'text-slate-300'
                        : isActive
                        ? 'text-emerald-900 font-bold'
                        : isCompleted
                        ? 'text-slate-800 font-medium'
                        : 'text-slate-500'
                    }`}
                  >
                    {stepObj.label}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
