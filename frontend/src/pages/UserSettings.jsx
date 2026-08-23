import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Mail, Shield, Building2, Globe, Save, CheckCircle2 } from 'lucide-react';

export default function UserSettings({ currentUser, onUpdateUser }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Dr. Rajesh Sharma',
    email: currentUser?.email || 'doctor@swasthsaarthi.in',
    role: currentUser?.role || 'doctor',
    hospital_name: currentUser?.hospital_name || 'All India Institute of Ayurveda (AIIA)',
    language_preference: 'hi-IN',
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({ ...currentUser, ...formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    'w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 shadow-sm transition-colors';

  const selectClass =
    'w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors';

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>{t('admin.settingsTitle', 'Account & System Settings')}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            {t('admin.settingsSubtitle', 'Manage your personal profile, credentials, role access, and clinic preferences.')}
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 capitalize">
          {t('admin.settingsRoleLabel', 'Role')}: {formData.role === 'patient' ? 'Citizen' : formData.role.replace('_', ' ')}
        </span>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t('admin.settingsSaved', 'Account settings updated successfully!')}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="space-y-4">

          {/* Full Name */}
          <div>
            <label className={labelClass}>{t('admin.settingsFullName', 'Full Name')}</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>{t('admin.settingsEmail', 'Email Address')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Hospital Name */}
          <div>
            <label className={labelClass}>{t('admin.settingsHospital', 'Hospital / Clinic Name')}</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Role + Language (2-col grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('admin.settingsRole', 'Role Portal Access')}</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`${selectClass} pl-9`}
                >
                  <option value="doctor">{t('admin.roleDoctor', 'Ayurvedic Doctor / Staff')}</option>
                  <option value="patient">{t('admin.rolePatient', 'Patient / Citizen')}</option>
                  <option value="hospital_admin">{t('admin.roleHospitalAdmin', 'Hospital Resource Admin')}</option>
                  <option value="super_admin">{t('admin.roleSuperAdmin', 'Ministry Super Admin')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('admin.settingsLanguage', 'Speech & UI Language')}</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.language_preference}
                  onChange={(e) => setFormData({ ...formData, language_preference: e.target.value })}
                  className={`${selectClass} pl-9`}
                >
                  <option value="hi-IN">Hindi (&#2361;&#2367;&#2306;&#2342;&#2368; - &#2349;&#2366;&#2352;&#2340;)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="mr-IN">Marathi (&#2350;&#2352;&#2366;&#2336;&#2368;)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{t('admin.settingsSaveBtn', 'Save Profile Settings')}</span>
          </button>
        </div>
      </form>

    </div>
  );
}
