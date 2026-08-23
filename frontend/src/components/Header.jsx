import React from 'react';
import { LogIn, Users, Sparkles } from 'lucide-react';
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
  const [logoHovered, setLogoHovered] = React.useState(false);
  const role = currentUser?.role;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-slate-100 shrink-0">
      <div className="w-full px-3 sm:px-5 py-0.5 flex items-center justify-between gap-2">
        
        {/* Left Aligned Brand Header */}
        <button 
          onClick={onNavigateHome} 
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer py-1"
        >
          <img 
            src="/emblem_of_india.svg" 
            alt="Satyamev Jayate Emblem of India" 
            className="h-12 sm:h-14 md:h-[52px] w-auto object-contain shrink-0 border-r border-slate-200/80 pr-2 sm:pr-3" 
          />
          <div className="flex items-center gap-2.5">
            <img 
              src={logoHovered ? "/loading_animation.gif" : "/swasthsaarthi_static_logo.png"} 
              alt="SwasthSaarthi Logo Emblem" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/swasthsaarthi_static_logo.png';
              }}
              className="h-11 sm:h-12 md:h-13 w-auto object-contain group-hover:scale-105 transition-all duration-300 shrink-0 drop-shadow-xs" 
            />
            <img 
              src="/swasthsaarthi_text_logo.png" 
              alt="SwasthSaarthi Text Logo" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/swasthsaarthi_text_logo.png';
              }}
              className="h-9 sm:h-10 md:h-11 w-auto object-contain group-hover:scale-[1.02] transition-all duration-300 drop-shadow-2xs" 
            />
          </div>
        </button>

        {/* Top Right Header Controls - Dynamic Quick Action CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentUser ? (
            role === 'patient' ? (
              <button
                type="button"
                onClick={onQuickAction}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-700/80 shadow-xs hover:shadow-md group"
                title="Book OPD Consultation with Certified Vaidya"
              >
                <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
                <span>Book OPD Appointment</span>
              </button>
            ) : role === 'doctor' ? (
              <button
                type="button"
                onClick={onQuickAction}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-700/80 shadow-xs hover:shadow-md group"
                title="Search Master ABHA Patient Directory"
              >
                <Users className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform shrink-0" />
                <span>Patient Directory</span>
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
