import React from 'react';
import { 
  HeartPulse, Stethoscope, UserCheck, LayoutDashboard, Siren, Settings, 
  ChevronLeft, ChevronRight, User, Building2, ShieldCheck, FileText, Activity, Lock 
} from 'lucide-react';

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  isExpanded, 
  setIsExpanded,
  onOpenAuth 
}) {
  const role = currentUser?.role || 'public';

  const getNavItems = () => {
    if (role === 'patient') {
      return [
        { id: 'triage', label: 'Self Symptom Triage', icon: Activity },
        { id: 'timeline', label: 'My Health Timeline', icon: FileText },
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ];
    } else if (role === 'hospital_admin') {
      return [
        { id: 'medroute', label: 'Emergency Routing', icon: Siren },
        { id: 'inventory', label: 'ICU & Bed Inventory', icon: Building2 },
        { id: 'settings', label: 'Hospital Settings', icon: Settings },
      ];
    } else if (role === 'super_admin') {
      return [
        { id: 'national_analytics', label: 'National Analytics', icon: ShieldCheck },
        { id: 'hospital_registry', label: 'Hospital Registry', icon: Building2 },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ];
    } else if (role === 'doctor') {
      return [
        { id: 'case_form', label: 'AyurSaarthi Case Sheet', icon: Stethoscope },
        { id: 'patients', label: 'Patient Directory', icon: UserCheck },
        { id: 'medroute', label: 'MedRoute Emergency', icon: Siren },
        { id: 'dashboard', label: 'OPD Dashboard', icon: LayoutDashboard },
        { id: 'settings', label: 'Doctor Settings', icon: Settings },
      ];
    } else {
      // Public / Unauthenticated Nav Items
      return [
        { id: 'landing', label: 'SwasthSaarthi Home', icon: HeartPulse },
        { id: 'triage_preview', label: 'AI Voice Triage', icon: Activity },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`sticky top-[61px] h-[calc(100vh-61px)] bg-white border-r border-slate-200/80 transition-all duration-300 flex flex-col justify-between z-40 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Top Nav Section */}
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          {isExpanded && (
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {currentUser ? `${role.replace('_', ' ')} PORTAL` : 'PUBLIC NAVIGATION'}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all ml-auto"
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {isExpanded && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Auth Section */}
      <div className="p-3 border-t border-slate-100">
        {currentUser ? (
          <div className="flex items-center gap-3 px-2 py-2 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser.name[0].toUpperCase()}
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</h4>
                <span className="text-[10px] text-slate-400 font-medium capitalize block">{role.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            title="Sign In / Auth"
          >
            <Lock className="w-4 h-4 shrink-0" />
            {isExpanded && <span>Sign In / Login</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
