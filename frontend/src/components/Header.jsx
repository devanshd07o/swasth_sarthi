import React from 'react';
import { Globe, LogOut, Settings, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';

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
    <header className="sticky top-0 z-50 bg-[#FBF6EC]/95 backdrop-blur-md border-b border-hairline shadow-paper-sm transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Header */}
        <button onClick={onNavigateHome} className="flex items-center gap-3 text-left group cursor-pointer">
          <BrandLogo size={40} className="group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-semibold text-lg md:text-xl tracking-tight text-ink">
                SwasthSaarthi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-medium border border-hairline bg-brand/5 text-brand-deep tracking-wider uppercase">
                Ministry of Ayush • SIH26047
              </span>
            </div>
            <p className="text-xs text-ink-soft font-body font-normal">
              AyurSaarthi AI Digital Case-Taking Platform
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Global Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-3.5 py-2 bg-bg-deep hover:bg-hairline-soft text-ink rounded-control border border-hairline font-mono text-xs font-medium flex items-center gap-1.5 transition-all shadow-paper-sm cursor-pointer"
            title="Toggle Language (English / Hindi)"
          >
            <Globe className="w-3.5 h-3.5 text-brand" />
            <span>{lang === 'en' ? 'EN' : 'HI'}</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateSettings}
                className="p-2 text-ink-soft hover:text-ink hover:bg-bg-deep rounded-control border border-hairline transition-all shadow-paper-sm cursor-pointer"
                title="Account Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 pl-3 border-l border-hairline">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-control object-cover border border-hairline shadow-paper-sm shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-control bg-brand text-[#FBF6EC] font-display font-bold text-xs flex items-center justify-center shadow-paper-sm shrink-0">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <h4 className="text-xs font-semibold text-ink leading-tight">{currentUser.name}</h4>
                  <span className="font-mono text-[10px] text-brand-deep font-medium uppercase tracking-wide block">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-ink-faint hover:text-maroon hover:bg-maroon-tint rounded-control transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 bg-brand hover:bg-brand-deep text-[#FBF6EC] font-body font-semibold text-xs rounded-control flex items-center gap-1.5 shadow-paper-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-gold-soft" />
              <span>Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
