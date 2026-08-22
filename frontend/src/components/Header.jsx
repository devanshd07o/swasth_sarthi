import React from 'react';
import { HeartPulse, Globe, LogOut, Settings, Lock } from 'lucide-react';

export default function Header({ 
  currentUser, 
  onOpenAuth, 
  onLogout, 
  onNavigateSettings, 
  onNavigateHome,
  lang,
  setLang 
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Header */}
        <button onClick={onNavigateHome} className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                SwasthSaarthi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ministry of Ayush (SIH26047)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              AyurSaarthi AI Digital Case-Taking Platform
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Global Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Toggle Language (English / Hindi)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'en' ? 'English' : 'हिंदी'}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateSettings}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
                title="Account Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</h4>
                  <span className="text-[10px] text-emerald-700 font-bold capitalize block">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
