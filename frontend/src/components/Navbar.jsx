import React from 'react';
import { HeartPulse, Stethoscope, UserCheck, LayoutDashboard, Siren, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Navbar({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                SwasthSaarthi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('navbar.sihTag', 'Ministry of Ayush (SIH26047)')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {t('navbar.subtitle', 'AyurSaarthi AI Digital Case-Taking & MedRoute')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('case_form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'case_form'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t('sidebar.caseForm', 'AyurSaarthi Case Sheet')}</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'patients'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('sidebar.patientDirectory', 'Patient Records')}</span>
          </button>

          <button
            onClick={() => setActiveTab('medroute')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'medroute'
                ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
            }`}
          >
            <Siren className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>{t('sidebar.medrouteEmergency', 'MedRoute Routing')}</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t('sidebar.vaidyaDashboard', 'Doctor Dashboard')}</span>
          </button>
        </nav>

        {/* AI Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>{t('navbar.aiActiveBadge', 'Gemini 1.5 & ElevenLabs Active')}</span>
        </div>

      </div>
    </header>
  );
}
