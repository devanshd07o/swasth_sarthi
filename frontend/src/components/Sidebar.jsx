import React, { useState } from 'react';
import { 
  Menu, Settings, ChevronLeft, Lock, Globe, LogOut,
  HeartPulse, Stethoscope, Building2, ShieldCheck, 
  FileText, Activity, Users, LayoutDashboard 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import NativeLanguageSelector from './NativeLanguageSelector';

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  isExpanded, 
  setIsExpanded,
  onOpenAuth,
  onLogout,
  lang = 'en',
  setLang
}) {
  const { t } = useTranslation();
  const role = currentUser?.role || 'public';
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = React.useState(isExpanded);
  const [logoHovered, setLogoHovered] = useState(false);

  React.useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsFullyExpanded(true), 260);
      return () => clearTimeout(timer);
    } else {
      setIsFullyExpanded(false);
    }
  }, [isExpanded]);

  const getNavItems = () => {
    if (role === 'patient') {
      return [
        { id: 'triage', label: t('sidebar.triage', 'Self Symptom Triage'), icon: Activity },
        { id: 'timeline', label: t('sidebar.timeline', 'My Health Timeline'), icon: FileText },
        { id: 'medroute', label: t('sidebar.medrouteEmergency', 'AYUSH Wellness Grid'), icon: HeartPulse },
      ];
    } else if (role === 'hospital_admin' || role === 'super_admin') {
      return [
        { id: 'admin_command', label: t('sidebar.adminCommand', 'Ministry Command Portal'), icon: ShieldCheck },
        { id: 'hospital_network', label: t('sidebar.hospitalNetwork', 'Pan-India Hospital Network'), icon: Building2 },
        { id: 'doctor_roster', label: t('sidebar.doctorRoster', 'Vaidya Doctor Roster'), icon: Stethoscope },
        { id: 'panchakarma_inventory', label: t('sidebar.inventory', 'Panchakarma & Ayush Wards'), icon: Activity },
        { id: 'audit_logs', label: t('sidebar.auditLogs', 'ABDM Compliance Logs'), icon: FileText },
      ];
    } else if (role === 'doctor') {
      return [
        { id: 'dashboard', label: t('sidebar.vaidyaDashboard', 'Vaidya OPD Dashboard'), icon: LayoutDashboard },
        { id: 'case_form', label: t('sidebar.caseForm', 'Ashtavidha Case Sheet'), icon: Stethoscope },
        { id: 'patients', label: t('sidebar.patientDirectory', 'Patient Directory'), icon: Users },
        { id: 'timeline', label: t('sidebar.longitudinalHistory', 'Patient Timeline'), icon: FileText },
        { id: 'register', label: t('sidebar.dailyRegister', 'Daily OPD Register'), icon: Activity },
      ];
    } else {
      return [
        { id: 'landing', label: t('sidebar.ayushPortalTitle', 'AYUSH Health Portal'), icon: HeartPulse },
        { id: 'triage_preview', label: t('sidebar.symptomVoiceIntake', 'Symptom Voice Intake'), icon: Activity },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Backdrop overlay for mobile screen click-out */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[999] md:hidden animate-fade-in"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* SMOOTH RESPONSIVE SLIDE-OVER / IN-PLACE EXPANDING SIDEBAR */}
      <aside 
        className={`h-full bg-white border-r border-slate-200/90 transition-all duration-300 ease-in-out flex flex-col justify-between overflow-hidden select-none shrink-0 ${
          isExpanded 
            ? 'fixed inset-y-0 left-0 z-[1000] w-64 sm:w-72 p-3.5 shadow-2xl translate-x-0' 
            : 'hidden md:flex md:w-16 p-2 items-center z-30 shadow-none'
        }`}
      >
        {/* TOP HEADER / LOGO / TOGGLE AREA */}
        <div className="w-full space-y-4">
          <div className={`flex items-center ${isExpanded ? 'justify-between pb-3 border-b border-slate-100' : 'justify-center py-2'}`}>
            {isExpanded ? (
              <div 
                className="flex items-center gap-2 overflow-hidden cursor-pointer"
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
              >
                <img 
                  src={logoHovered ? "/loading_animation.gif" : "/swasthsaarthi_static_logo.png"} 
                  alt="SwasthSaarthi" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/swasthsaarthi_static_logo.png';
                  }}
                  className="h-9 w-auto object-contain shrink-0 transition-transform duration-300 hover:scale-105" 
                />
                {isFullyExpanded && (
                  <div className="text-left overflow-hidden animate-fade-in flex flex-col justify-center">
                    <span className="font-['Philosopher','Cinzel',serif] italic font-black text-[#12372A] text-xs sm:text-sm tracking-widest leading-tight uppercase drop-shadow-2xs">
                      {role === 'patient' ? 'CITIZEN PORTAL' : (role.replace('_', ' ') + ' CONSOLE').toUpperCase()}
                    </span>
                    <span className="font-mono text-[8px] font-extrabold uppercase tracking-widest text-emerald-700 block truncate mt-0.5">
                      Ministry of Ayush • ABDM
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`rounded-2xl flex items-center justify-center transition-all cursor-pointer border border-emerald-200/80 shadow-xs ${
                isExpanded 
                  ? 'w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600' 
                  : 'w-10 h-10 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
              title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isExpanded ? <ChevronLeft className="w-5 h-5 text-emerald-800" /> : <Menu className="w-5 h-5 text-emerald-800" />}
            </button>
          </div>

          {/* DYNAMIC ROLE NAVIGATION LINKS */}
          <nav className="space-y-1.5 w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (!isExpanded) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer my-0.5 ${
                      isActive
                        ? 'bg-[#12372A] text-emerald-300 shadow-md ring-2 ring-emerald-400/40 font-bold scale-105'
                        : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 768) {
                      setIsExpanded(false);
                    }
                  }}
                  className={`w-full p-3 rounded-xl font-body text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#12372A] text-white font-bold shadow-md shadow-emerald-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  {isFullyExpanded && (
                    <span className="truncate animate-fade-in">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM ACTIONS (LANGUAGE + SETTINGS + USER PROFILE) */}
        <div className="w-full space-y-2 pt-3 border-t border-slate-100">
          
          {/* Native Language Selector Dropdown */}
          <div className="w-full flex justify-center">
            <NativeLanguageSelector 
              lang={lang} 
              setLang={setLang} 
              direction="up" 
              compact={!isExpanded} 
            />
          </div>

          {/* Account Settings Gear Button */}
          {isExpanded ? (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full p-3 rounded-xl font-body text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#12372A] text-white font-bold shadow-md shadow-emerald-950/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Settings className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'settings' ? 'text-emerald-300' : 'text-slate-500'}`} />
              {isFullyExpanded && (
                <span className="truncate animate-fade-in">{t('sidebar.settings', 'Account Settings')}</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#12372A] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={t('sidebar.settings', 'Account Settings')}
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          )}

          {/* User Account Profile Info (When Expanded) */}
          {isExpanded ? (
            <div className="pt-2 space-y-2">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                    {currentUser?.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt={currentUser.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/swasthsaarthi_logo.png';
                        }}
                        className="w-9 h-9 rounded-xl object-cover border border-emerald-600/40 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-[#12372A] text-white font-display font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {isFullyExpanded && (
                      <div className="overflow-hidden text-left animate-fade-in">
                        <h4 className="font-body text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                        <span className="font-mono text-[9px] text-emerald-800 font-bold uppercase tracking-wider block truncate">
                          {role === 'patient' ? 'Verified Citizen' : role.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PROMINENT HIGHLIGHTED RED LOGOUT BUTTON */}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-sm group"
                    title={t('sidebar.logout', 'Sign Out / Logout')}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform shrink-0" />
                    {isFullyExpanded && (
                      <span className="animate-fade-in">{t('sidebar.logout', 'Sign Out / Logout')}</span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full p-2.5 bg-[#12372A] hover:bg-[#0B2B20] text-white rounded-xl font-body text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                  {isFullyExpanded && (
                    <span className="animate-fade-in">Sign In / Login</span>
                  )}
                </button>
              )}
            </div>
          ) : (
            currentUser && (
              <div className="pt-1 flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 shadow-xs transition-all cursor-pointer"
                  title={t('sidebar.logout', 'Sign Out / Logout')}
                >
                  <LogOut className="w-4.5 h-4.5 text-rose-600" />
                </button>
              </div>
            )
          )}
          {/* ByteBugs Team Footer */}
          {isFullyExpanded && (
            <div className="mt-2 px-2 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
              <p className="font-mono text-[8px] font-extrabold uppercase tracking-widest text-emerald-700">
                Team ByteBugs
              </p>
              <p className="font-mono text-[7px] text-slate-400 tracking-wide mt-0.5 leading-relaxed">
                Devansh · Kamal · Devita<br />Anurag · Ayush · Anshu
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
