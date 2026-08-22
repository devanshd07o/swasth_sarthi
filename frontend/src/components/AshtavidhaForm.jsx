import React from 'react';

export default function AshtavidhaForm({ data = {}, onChange }) {
  const fields = [
    { key: 'nadi', label: 'Nadi (Pulse Pariksha)', placeholder: 'e.g. Vata-Vaha, Fast, Thready' },
    { key: 'mutra', label: 'Mutra (Urine Examination)', placeholder: 'e.g. Samyak, Clear' },
    { key: 'mala', label: 'Mala (Stool Examination)', placeholder: 'e.g. Baddhatva (Constipated)' },
    { key: 'jihva', label: 'Jihva (Tongue Examination)', placeholder: 'e.g. Saama (Coated), Red' },
    { key: 'shabda', label: 'Shabda (Voice/Sound)', placeholder: 'e.g. Spashta (Clear)' },
    { key: 'sparsha', label: 'Sparsha (Touch/Skin)', placeholder: 'e.g. Rooksha (Dry), Warm' },
    { key: 'drik', label: 'Drik (Eyes/Vision)', placeholder: 'e.g. Normal vision' },
    { key: 'aakriti', label: 'Aakriti (Body Frame)', placeholder: 'e.g. Madhyama (Medium)' }
  ];

  const handleFieldChange = (key, val) => {
    onChange({ ...data, [key]: val });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {f.label}
          </label>
          <input
            type="text"
            value={data[f.key] || ''}
            onChange={(e) => handleFieldChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      ))}
    </div>
  );
}
