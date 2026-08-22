import React from 'react';
import { HeartPulse } from 'lucide-react';

export default function BrandedLoader({ message = "SwasthSaarthi AI Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Branded Pulsing Logo Ring */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-600/30 animate-pulse">
          <HeartPulse className="w-9 h-9 text-white animate-bounce" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-500/30 animate-ping"></div>
      </div>
      <span className="text-xs font-bold text-slate-700 tracking-wide">{message}</span>
    </div>
  );
}
