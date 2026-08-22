import React, { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PatientAuthModal({ isOpen, onClose, onLoginSuccess, lang = 'en' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    const userData = {
      name: name || 'Ramesh Sharma',
      email: email || 'ramesh.patient@gmail.com',
      role: 'patient',
      token: 'google_jwt_token_2026'
    };
    onLoginSuccess(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {lang === 'hi' ? 'रोगी प्रवेश पोर्टल' : 'Patient Access Portal'}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1.5">
              {lang === 'hi' ? 'गूगल से तुरंत साइन इन करें' : 'Sign In with Google'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {lang === 'hi' 
                ? 'अपने स्वास्थ्य रिकॉर्ड और डिजिटल हेल्थ पास तक पहुंचने के लिए' 
                : 'Access your personal health records, UHID pass, and AI symptom triage.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'hi' ? 'आपका पूरा नाम' : 'Your Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 shadow-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'hi' ? 'गूगल / जीमेल आईडी' : 'Gmail / Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 shadow-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-slate-900/20 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span>{lang === 'hi' ? 'गूगल से साइन इन करें' : 'Sign In with Google Account'}</span>
          </button>
        </div>

        <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
          <span>{lang === 'hi' ? 'सुरक्षित एवं गोपनीय स्वास्थ्य डेटा' : '100% Encrypted & Private Health Data'}</span>
        </div>

      </div>
    </div>
  );
}
