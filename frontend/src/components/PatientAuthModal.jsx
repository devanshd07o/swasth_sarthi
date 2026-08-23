import React from 'react';
import { X, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LoginOTPScreen from './LoginOTPScreen';

export default function PatientAuthModal({ isOpen, onClose, onLoginSuccess, lang = 'en' }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in font-body">
      <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {t('auth.patientAccessPill', 'Patient Access Portal')}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              <span>{t('auth.standalonePatientTitle', 'Patient ABHA / Mobile OTP Sign In')}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t('auth.standalonePatientSub', 'Access your personal health records, UHID pass, and AI symptom triage.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded OTP Flow */}
        <LoginOTPScreen
          role="patient"
          onLoginSuccess={(userData) => {
            onLoginSuccess(userData);
            onClose();
          }}
          lang={lang}
        />

      </div>
    </div>
  );
}
