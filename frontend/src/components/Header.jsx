import React from 'react';
import { LogIn, LogOut, Users, Sparkles, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';

export default function Header({ 
  currentUser, 
  onOpenAuth, 
  onLogout, 
  onNavigateHome,
  onQuickAction,
  onToggleMobileSidebar
}) {
  const { t } = useTranslation();
  const [logoHovered, setLogoHovered] = React.useState(false);
  const role = currentUser?.role;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-slate-100 shrink-0">
      <div className="w-full px-2.5 sm:px-5 py-1 flex items-center justify-between gap-1.5 sm:gap-3">
        
        {/* Left Aligned Mobile Toggle + Brand Header */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {currentUser && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl md:hidden transition-colors cursor-pointer"
              title="Toggle Mobile Navigation Drawer"
            >
              <Menu className="w-5 h-5 shrink-0" />
            </button>
          )}

          <button 
            onClick={onNavigateHome} 
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            className="flex items-center gap-1.5 sm:gap-3 text-left group cursor-pointer py-0.5"
          >
            <img 
              src="/emblem_of_india.svg" 
              alt="Satyamev Jayate Emblem of India" 
              className="h-9 sm:h-12 md:h-[50px] w-auto object-contain shrink-0 border-r border-slate-200/80 pr-1.5 sm:pr-3" 
            />
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <img 
                src={logoHovered ? "/loading_animation.gif" : "/swasthsaarthi_static_logo.png"} 
                alt="SwasthSaarthi Logo Emblem" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/swasthsaarthi_static_logo.png';
                }}
                className="h-8 sm:h-11 md:h-12 w-auto object-contain group-hover:scale-105 transition-all duration-300 shrink-0 drop-shadow-xs" 
              />
              <img 
                src="/swasthsaarthi_text_logo.png" 
                alt="SwasthSaarthi Text Logo" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/swasthsaarthi_text_logo.png';
                }}
                className="block h-6 sm:h-8 md:h-10 w-auto object-contain group-hover:scale-[1.02] transition-all duration-300 drop-shadow-2xs" 
              />
            </div>
          </button>
        </div>

        {/* Top Right Header Controls - Dynamic Quick Action CTA + Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {currentUser ? (
            <>
              {role === 'patient' ? (
                <button
                  type="button"
                  onClick={onQuickAction}
                  className="p-2.5 sm:px-4 sm:py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-700/80 shadow-xs hover:shadow-md group shrink-0"
                  title="Book OPD Consultation with Certified Vaidya"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="hidden sm:inline">Book OPD Appointment</span>
                </button>
              ) : role === 'doctor' ? (
                <button
                  type="button"
                  onClick={onQuickAction}
                  className="p-2.5 sm:px-4 sm:py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-700/80 shadow-xs hover:shadow-md group shrink-0"
                  title="Search Master ABHA Patient Directory"
                >
                  <Users className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="hidden sm:inline">Patient Directory</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={onLogout}
                className="p-2 sm:p-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200/80 transition-all cursor-pointer shrink-0 md:hidden flex items-center justify-center shadow-2xs group"
                title={t('header.logout', 'Logout')}
              >
                <LogOut className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform shrink-0" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('all')}
              className="p-2.5 sm:px-4 sm:py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-display font-semibold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-emerald-700/60 shadow-xs hover:shadow-md shrink-0"
              title={t('header.portalLogin', 'Portal Login')}
            >
              <LogIn className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-200 shrink-0" />
              <span className="hidden sm:inline">{t('header.portalLogin', 'Portal Login')}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
