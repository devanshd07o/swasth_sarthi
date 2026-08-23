import React, { useState, useEffect } from 'react';
import { X, User, Building2, Stethoscope, Lock, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LoginOTPScreen from './LoginOTPScreen';
import { loginAdminUser } from '../services/api';

export default function HeaderPortalModal({ isOpen, onClose, onLoginSuccess, lang = 'en' }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'doctor' | 'admin'
  const [loading, setLoading] = useState(false);

  const [adminForm, setAdminForm] = useState({
    admin_id: '',
    password: '',
    hospital_name: ''
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('patient');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminForm.admin_id.trim() || !adminForm.password.trim()) {
      alert(t('auth.adminRequired', 'Please enter Admin ID and password.'));
      return;
    }
    setLoading(true);
    try {
      const res = await loginAdminUser(adminForm.admin_id, adminForm.password, adminForm.hospital_name);
      localStorage.setItem('swasth_jwt_token', res.access_token);
      localStorage.setItem('swasth_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
      onClose();
    } catch (err) {
      alert(t('auth.adminError', 'Admin login failed. Check ID and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in font-body">
      <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 text-xs text-slate-800 max-h-[90vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="font-mono text-[10px] font-extrabold uppercase text-[#12372A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 tracking-wider">
              {t('auth.portalTitle', 'SwasthSaarthi Portal Gate')}
            </span>
            
            <h2 className="font-display font-extrabold text-xl text-slate-900 mt-1">
              {activeTab === 'patient'
                ? t('auth.patientTabHeading', 'Patient ABHA / Mobile OTP Access')
                : activeTab === 'doctor'
                ? t('auth.doctorTabHeading', 'Vaidya Console OTP Access')
                : t('auth.adminTabHeading', 'Hospital Command Admin Login')}
            </h2>
            
            <p className="text-xs text-slate-500 font-body mt-0.5">
              {t('auth.portalSub', 'Select your role below to proceed into the respective SwasthSaarthi dashboard.')}
            </p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 font-body">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'patient'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('auth.tabPatient', 'Patient (ABHA)')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'doctor'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t('auth.tabDoctor', 'Vaidya / Doctor')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('auth.tabAdmin', 'Hospital / Admin')}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'patient' && (
          <LoginOTPScreen
            role="patient"
            onLoginSuccess={(userData) => {
              onLoginSuccess(userData);
              onClose();
            }}
            lang={lang}
          />
        )}

        {activeTab === 'doctor' && (
          <LoginOTPScreen
            role="doctor"
            onLoginSuccess={(userData) => {
              onLoginSuccess(userData);
              onClose();
            }}
            lang={lang}
          />
        )}

        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('auth.adminIdLabel', 'Hospital Admin ID / Staff Code')}</label>
              <input
                type="text"
                value={adminForm.admin_id}
                onChange={(e) => setAdminForm({ ...adminForm, admin_id: e.target.value })}
                placeholder="e.g. ADMIN-AIIA-01 or SUPER-ADMIN-01"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('auth.passwordLabel', 'Password')}</label>
              <input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>{loading ? t('common.loading', 'Authenticating...') : t('auth.btnAdminLogin', 'Admin Portal Login')}</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
