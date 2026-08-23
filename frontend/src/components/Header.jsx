import React from 'react';
import { LogIn, PlusCircle, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';

export default function Header({ 
  currentUser, 
  onOpenAuth, 
  onLogout, 
  onNavigateHome,
  onQuickAction
}) {
  const { t } = useTranslation();
  const role = currentUser?.role;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-slate-100 shrink-0">
      <div className="w-full px-3 sm:px-5 py-0.5 flex items-center justify-between gap-2">
        
        {/* Left Aligned Brand Header (Maximized Symbol Height with Minute Padding) */}
        <button onClick={onNavigateHome} className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer py-0">
          <img 
            src="/emblem_of_india.svg" 
            alt="Satyamev Jayate Emblem of India" 
            className="h-12 sm:h-14 md:h-[54px] w-auto object-contain shrink-0 border-r border-slate-200/80 pr-2 sm:pr-3" 
          />
          <img 
            src="/favicon.ico" 
            alt="SwasthSaarthi Icon" 
            className="h-10 sm:h-11 md:h-12 w-auto object-contain group-hover:scale-105 transition-all duration-300 shrink-0" 
          />
          <img 
            src="/swasthsaarthi_logo.png" 
            alt="SwasthSaarthi" 
            className="h-12 sm:h-14 md:h-[56px] w-auto object-contain group-hover:scale-[1.02] transition-all duration-300"
          />
        </button>

        {/* Top Right Header Controls - Dynamic Quick Action CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            role === 'patient' ? (
              <button
                type="button"
                onClick={onQuickAction}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-body font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-600/60 shadow-xs hover:shadow-sm group"
                title="Book OPD Consultation with Certified Vaidya"
              >
                <Stethoscope className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform shrink-0" />
                <span>+ Book OPD Consultation</span>
              </button>
            ) : role === 'doctor' ? (
              <button
                type="button"
                onClick={onQuickAction}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-body font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-600/60 shadow-xs hover:shadow-sm group"
                title="Open New Ashtavidha OPD Case Sheet"
              >
                <PlusCircle className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform shrink-0" />
                <span>+ New Case Sheet</span>
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('all')}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-display font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-700/60 shadow-xs hover:shadow-sm"
              title={t('header.portalLogin', 'Portal Login')}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>{t('header.portalLogin', 'Portal Login')}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
