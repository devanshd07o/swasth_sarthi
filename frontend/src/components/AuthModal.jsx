import React, { useState, useEffect } from 'react';
import { X, User, Stethoscope, Building2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialRole = 'doctor' }) {
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: name || (role === 'doctor' ? 'Dr. Rajesh Sharma' : role === 'patient' ? 'Ramesh Sharma' : 'Admin User'),
      email: email || `${role}@swasthsaarthi.in`,
      role: role,
      token: 'jwt_token_swasth_2026'
    };
    onLoginSuccess(userData);
    onClose();
  };

  const roleOptions = [
    { id: 'patient', title: 'Patient / Citizen', desc: 'Self symptom triage, Digital Health Pass & personal history', icon: User, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
    { id: 'doctor', title: 'Ayurvedic Doctor / Staff', desc: 'AyurSaarthi OPD digital case sheet & AI assistant', icon: Stethoscope, color: 'border-teal-200 bg-teal-50/50 text-teal-800' },
    { id: 'hospital_admin', title: 'Hospital Resource Admin', desc: 'MedRoute ICU, bed inventory & ambulance dispatch', icon: Building2, color: 'border-cyan-200 bg-cyan-50/50 text-cyan-800' },
    { id: 'super_admin', title: 'Ministry Super Admin', desc: 'National AYUSH analytics & hospital command center', icon: ShieldCheck, color: 'border-purple-200 bg-purple-50/50 text-purple-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              SwasthSaarthi Authentication Door
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Select Your Role & Sign In
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Choose your role to access your dedicated workspace portal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Choose Role Access Portal:</label>
          <div className="grid grid-cols-1 gap-2">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = role === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRole(opt.id)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? `${opt.color} ring-2 ring-emerald-500 shadow-xs font-bold`
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold">{opt.title}</h4>
                    <p className="text-[11px] opacity-80 font-medium">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@swasthsaarthi.in"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <span>Enter {roleOptions.find(r => r.id === role)?.title} Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
