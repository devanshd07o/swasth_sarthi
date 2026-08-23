import React from 'react';
import { Search, RefreshCw, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WizardStep1Identify({
  abhaInput, setAbhaInput,
  activePatient,
  handleLookupAbha, isLookingUpAbha, lookupError,
  consentAccepted, setConsentAccepted,
  onNext, currentUser
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in text-left">
      <div className="border-b border-slate-100 pb-4">
        <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          {t('patientPortal.step1Tag', 'STEP 1 OF 5 • PATIENT IDENTIFICATION')}
        </span>
        <h3 className="font-display font-semibold text-xl text-slate-900 mt-2">
          {t('patientPortal.step1Title', 'Patient Intake & ABHA Health Pass Verification')}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {t('patientPortal.step1Desc', 'Verify your official Govt-issued 14-digit ABHA Number / ABHA Address to access ABDM Health Pass.')}
        </p>
      </div>

      {/* ─── SINGLE UNIFIED ABHA HEALTH PASS VERIFICATION ───────────────────── */}
      <div className="space-y-4 animate-fade-in">
        <div>
          <label className="font-body text-xs font-semibold text-slate-600 block mb-1.5">
            {t('patientPortal.labelAbhaInput', 'Enter Central 14-Digit ABHA Number / ABHA Address to verify health record:')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={abhaInput}
              onChange={(e) => setAbhaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLookupAbha(abhaInput);
              }}
              placeholder="e.g. ABHA-9821-4501 or 91-8214-4501-9982"
              className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-500 tracking-wide shadow-sm"
            />
            <button
              type="button"
              disabled={isLookingUpAbha}
              onClick={() => handleLookupAbha(abhaInput)}
              className="px-6 py-3 rounded-xl font-body font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer bg-[#12372A] hover:bg-[#0B2B20] text-white disabled:opacity-50"
            >
              {isLookingUpAbha ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('common.loading', 'Loading...')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{t('patientPortal.btnVerifyAbha', 'Verify ABHA ID & Load Record →')}</span>
                </>
              )}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Don't have an official 14-digit ABHA Number yet?</span>
            </div>

            <a
              href="https://abha.abdm.gov.in/abha/v3/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-950 via-[#12372A] to-emerald-900 hover:from-emerald-900 hover:to-[#0B2B20] text-white text-xs font-semibold rounded-xl border border-emerald-700/50 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-200 font-mono text-[11px] font-bold tracking-wide">ABDM GOVT PORTAL</span>
              <span className="text-slate-300 text-[11px] font-normal">| abha.abdm.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          {lookupError && (
            <p className="text-xs text-rose-600 font-medium mt-1.5">⚠️ {lookupError}</p>
          )}
        </div>

        {/* Verified Patient Card */}
        {activePatient && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-fade-in shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-xs text-emerald-900">
                  {t('patientPortal.centralRecordVerified', 'Central ABDM ABHA Record Verified')}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                {activePatient.abha_id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('patientPortal.labelName', 'Name')}</span>
                <span className="font-bold text-slate-900">{activePatient.name}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('patientPortal.labelDemographics', 'Demographics')}</span>
                <span className="font-semibold text-slate-900">{activePatient.age} yrs • {activePatient.gender} • {activePatient.blood_group}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('patientPortal.labelPrakriti', 'Prakriti Type')}</span>
                <span className="font-bold text-emerald-800">{activePatient.prakriti || 'Vata-Pitta'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t('patientPortal.labelContact', 'Contact')}</span>
                <span className="font-mono text-slate-900">{activePatient.contact || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-medium">
                  {t('patientPortal.dpdpConsent', 'I grant digital consent under DPDP Act 2023 for ABDM AyurSaarthi AI analysis.')}
                </span>
              </label>

              <button
                type="button"
                disabled={!consentAccepted}
                onClick={onNext}
                className={`px-5 py-2.5 rounded-xl font-body font-semibold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                  consentAccepted
                    ? 'bg-[#12372A] hover:bg-[#0B2B20] text-white shadow-md'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>{t('patientPortal.btnProceedStep2', 'Proceed to Voice Triage (Step 2) →')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
