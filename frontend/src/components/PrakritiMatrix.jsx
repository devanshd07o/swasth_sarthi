import React from 'react';
import { Flame, Wind, Droplets, ShieldCheck } from 'lucide-react';

export default function PrakritiMatrix({ value, onChange }) {
  const options = [
    { id: 'Vata Dominant', label: 'Vata Dominant (वात प्रधान)', icon: Wind, color: 'border-cyan-300 bg-cyan-50 text-cyan-800' },
    { id: 'Pitta Dominant', label: 'Pitta Dominant (पित्त प्रधान)', icon: Flame, color: 'border-rose-300 bg-rose-50 text-rose-800' },
    { id: 'Kapha Dominant', label: 'Kapha Dominant (कफ प्रधान)', icon: Droplets, color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
    { id: 'Vata-Pitta', label: 'Vata-Pitta (वात-पित्त)', icon: ShieldCheck, color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { id: 'Pitta-Kapha', label: 'Pitta-Kapha (पित्त-कफ)', icon: ShieldCheck, color: 'border-purple-300 bg-purple-50 text-purple-800' },
    { id: 'Vata-Kapha', label: 'Vata-Kapha (वात-कफ)', icon: ShieldCheck, color: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
    { id: 'Tridoshaja', label: 'Sama / Tridoshaja (त्रिदोषज)', icon: ShieldCheck, color: 'border-teal-300 bg-teal-50 text-teal-800' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
              isSelected
                ? `${opt.color} ring-2 ring-emerald-500 shadow-sm font-bold`
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
