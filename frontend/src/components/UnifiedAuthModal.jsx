import React, { useState } from 'react';
import { X, User, Building2, ShieldCheck, ArrowRight, Lock, KeyRound, Stethoscope, Star, Sparkles, Plus, Upload, Camera, Trash2 } from 'lucide-react';
import { createPatient, createDoctor } from '../services/api';

export default function UnifiedAuthModal({ isOpen, onClose, onLoginSuccess, lang = 'en' }) {
  // Main Role Tab: 'patient' vs 'doctor' vs 'admin'
  const [mainTab, setMainTab] = useState('patient'); 
  
  // Show Demo Presets Toggle (Default is FALSE so user gets pure empty working form)
  const [showDemoPresets, setShowDemoPresets] = useState(false);

  // Submitting States
  const [loading, setLoading] = useState(false);

  // 1. Clean Patient Registration Form
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'male',
    contact: '',
    blood_group: 'B+',
    address: ''
  });

  // 2. Clean Doctor Registration Form
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    qualification: 'BAMS, MD (Kayachikitsa)',
    specialization: 'Kayachikitsa (Internal Medicine)',
    hospital_name: '',
    experience_years: '8',
    email: '',
    contact: ''
  });

  // 3. Admin / Hospital Login Form
  const [adminForm, setAdminForm] = useState({
    admin_id: '',
    password: '',
    hospital_name: 'All India Institute of Ayurveda (AIIA)'
  });

  if (!isOpen) return null;

  // 1-Click Preset Doctor Logins
  const handleDoctorPreset = (docId, docName, hospital, qual, avatarUrl = null) => {
    const doctorAvatars = {
      'DOC-AYUR-101': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      'DOC-AYUR-102': 'https://images.unsplash.com/photo-1594824813589-3221dbb80b7d?w=150&auto=format&fit=crop&q=80',
      'DOC-AYUR-103': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      'DOC-AYUR-104': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    };
    onLoginSuccess({
      id: docId,
      doctor_id: docId,
      name: docName,
      email: `${docId.toLowerCase()}@ayursaarthi.in`,
      role: 'doctor',
      qualification: qual,
      hospital_name: hospital,
      avatar_url: avatarUrl || doctorAvatars[docId] || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      token: 'doctor_jwt_token_2026'
    });
    onClose();
  };

  // 1-Click Preset Patient Logins
  const handlePatientPreset = (abhaId, patientName, mobile, avatarUrl = null) => {
    const patientAvatars = {
      'ABHA-9821-4501': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'ABHA-1102-3344': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      'ABHA-5544-7788': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      'ABHA-9988-1234': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'ABHA-7700-9999': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };
    onLoginSuccess({
      id: abhaId,
      abha_id: abhaId,
      name: patientName,
      email: `${patientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: 'patient',
      contact: mobile,
      avatar_url: avatarUrl || patientAvatars[abhaId] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      token: 'patient_jwt_token_2026'
    });
    onClose();
  };

  // Submit Brand New Patient Form to Live Supabase
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientForm.name.trim() || !patientForm.contact.trim() || !patientForm.age) {
      alert('Please fill in Full Name, Age, and Mobile Number.');
      return;
    }
    setLoading(true);
    try {
      const created = await createPatient({
        name: patientForm.name.trim(),
        age: Number(patientForm.age),
        gender: patientForm.gender,
        contact: patientForm.contact.trim(),
        blood_group: patientForm.blood_group,
        address: patientForm.address.trim() || 'India',
        consent_given: true
      });
      onLoginSuccess({
        id: created.id,
        abha_id: created.abha_id,
        name: created.name,
        email: `${created.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        role: 'patient',
        contact: created.contact,
        age: created.age,
        gender: created.gender,
        blood_group: created.blood_group,
        address: created.address,
        token: 'patient_jwt_token_2026'
      });
      onClose();
    } catch (err) {
      console.error('Patient creation failed', err);
      alert('Failed to register patient in Supabase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Brand New Doctor Form to Live Supabase
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim() || !doctorForm.qualification.trim()) {
      alert('Please fill in Doctor Name and Qualification.');
      return;
    }
    setLoading(true);
    try {
      const created = await createDoctor({
        name: doctorForm.name.trim(),
        qualification: doctorForm.qualification.trim(),
        specialization: doctorForm.specialization.trim(),
        hospital_name: doctorForm.hospital_name.trim() || 'Ayurvedic Clinical Center',
        experience_years: Number(doctorForm.experience_years) || 5,
        email: doctorForm.email.trim() || undefined
      });
      onLoginSuccess({
        id: created.id,
        doctor_id: created.doctor_id,
        name: created.name,
        email: created.email,
        role: 'doctor',
        qualification: created.qualification,
        hospital_name: created.hospital_name,
        token: 'doctor_jwt_token_2026'
      });
      onClose();
    } catch (err) {
      console.error('Doctor creation failed', err);
      alert('Failed to register doctor in Supabase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // File Upload to DataURL (Base64) Helper
  const handleFileUpload = (e, formSetter) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formSetter(prev => ({ ...prev, avatar_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Admin Form
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      name: adminForm.hospital_name || 'AIIA Hospital Admin',
      email: 'admin@aiia.gov.in',
      role: 'hospital_admin',
      hospital_name: adminForm.hospital_name || 'All India Institute of Ayurveda',
      token: 'admin_jwt_token_2026'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FBF6EC] max-w-xl w-full rounded-modal border border-hairline shadow-paper-lg overflow-hidden p-6 space-y-5 text-xs text-ink max-h-[92vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase font-medium text-brand-deep bg-brand-tint px-2.5 py-0.5 rounded-full border border-hairline tracking-wider">
                SwasthSaarthi Portal Gate
              </span>
              <button
                type="button"
                onClick={() => setShowDemoPresets(!showDemoPresets)}
                className={`font-mono text-[10px] font-medium px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                  showDemoPresets
                    ? 'bg-gold text-white border-gold shadow-paper-sm'
                    : 'bg-gold-tint text-gold border-hairline hover:bg-gold/10'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{showDemoPresets ? 'Hide Jury Presets' : '⚡ Quick Demo Presets (Jury)'}</span>
              </button>
            </div>
            <h2 className="font-display font-semibold text-xl text-ink mt-1.5">
              {showDemoPresets ? 'Quick Demo Profiles' : 'Register & Enter Platform'}
            </h2>
            <p className="text-xs text-ink-soft font-body">
              {showDemoPresets 
                ? 'Select any verified mock profile for instant demonstration.' 
                : 'Enter your real details below to create a fresh record on live Supabase Postgres.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-faint hover:text-ink hover:bg-bg-deep rounded-control transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Main Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-bg-deep p-1.5 rounded-control border border-hairline">
          <button
            type="button"
            onClick={() => setMainTab('patient')}
            className={`py-2 rounded-control font-body font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === 'patient'
                ? 'bg-brand text-[#FBF6EC] shadow-paper-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient (ABHA)</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('doctor')}
            className={`py-2 rounded-control font-body font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === 'doctor'
                ? 'bg-brand text-[#FBF6EC] shadow-paper-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Vaidya / Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('admin')}
            className={`py-2 rounded-control font-body font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === 'admin'
                ? 'bg-brand text-[#FBF6EC] shadow-paper-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital / Admin</span>
          </button>
        </div>

        {/* ─── OPTIONAL TOP JURY DEMO PRESETS (SHOWN ONLY WHEN TOGGLED) ────── */}
        {showDemoPresets && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 animate-fade-in">
            <span className="font-extrabold text-amber-950 uppercase text-[10px] tracking-wider block">
              1-Click Demo Profiles for Hackathon Jury:
            </span>

            {mainTab === 'patient' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handlePatientPreset('ABHA-9821-4501', 'Ramesh Sharma', '+91 9876543210')}
                  className="p-2.5 bg-white hover:bg-emerald-50 text-left rounded-xl border border-slate-200 text-[11px] flex items-center gap-2 transition-all group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Ramesh"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block group-hover:text-emerald-700">Ramesh Sharma</span>
                    <span className="text-[10px] text-emerald-800 font-mono font-bold">ABHA-9821-4501</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePatientPreset('ABHA-1102-3344', 'Sunita Devi', '+91 9812345678')}
                  className="p-2.5 bg-white hover:bg-emerald-50 text-left rounded-xl border border-slate-200 text-[11px] flex items-center gap-2 transition-all group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80"
                    alt="Sunita"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block group-hover:text-emerald-700">Sunita Devi</span>
                    <span className="text-[10px] text-emerald-800 font-mono font-bold">ABHA-1102-3344</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePatientPreset('ABHA-7700-9999', 'Kailash Chandra', '+91 9899001122')}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-left rounded-xl border border-rose-200 text-[11px] flex items-center gap-2 transition-all group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
                    alt="Kailash"
                    className="w-9 h-9 rounded-full object-cover border border-rose-300 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-rose-950 block">🚨 Kailash Chandra</span>
                    <span className="text-[10px] text-rose-700 font-mono font-bold">Emergency Case</span>
                  </div>
                </button>
              </div>
            )}

            {mainTab === 'doctor' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleDoctorPreset('DOC-AYUR-101', 'Dr. Rajesh Vaidya', 'All India Institute of Ayurveda', 'BAMS, MD')}
                  className="p-2.5 bg-white hover:bg-emerald-50 text-left rounded-xl border border-slate-200 text-[11px] flex items-center gap-2 transition-all group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80"
                    alt="Dr. Rajesh"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block group-hover:text-emerald-700">Dr. Rajesh Vaidya</span>
                    <span className="text-[10px] text-emerald-800 font-bold">Kayachikitsa (4.9 ★)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleDoctorPreset('DOC-AYUR-102', 'Dr. Ananya Sharma', 'NIA Jaipur', 'BAMS, MD')}
                  className="p-2.5 bg-white hover:bg-emerald-50 text-left rounded-xl border border-slate-200 text-[11px] flex items-center gap-2 transition-all group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1594824813589-3221dbb80b7d?w=100&auto=format&fit=crop&q=80"
                    alt="Dr. Ananya"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block group-hover:text-emerald-700">Dr. Ananya Sharma</span>
                    <span className="text-[10px] text-emerald-800 font-bold">Panchakarma (4.8 ★)</span>
                  </div>
                </button>

                <button
                  onClick={() => handleDoctorPreset('DOC-AYUR-103', 'Dr. Vikramaditya Shastri', 'BHU Varanasi', 'BAMS, MS')}
                  className="p-2.5 bg-white hover:bg-emerald-50 text-left rounded-xl border border-slate-200 text-[11px] flex items-center gap-2 transition-all group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80"
                    alt="Dr. Vikram"
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 block group-hover:text-emerald-700">Dr. Vikram Shastri</span>
                    <span className="text-[10px] text-emerald-800 font-bold">Shalya (4.9 ★)</span>
                  </div>
                </button>
              </div>
            )}

            {mainTab === 'admin' && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onLoginSuccess({
                      name: 'AIIA Hospital Admin',
                      email: 'admin@aiia.gov.in',
                      role: 'hospital_admin',
                      hospital_name: 'All India Institute of Ayurveda'
                    });
                    onClose();
                  }}
                  className="p-2.5 bg-white text-left rounded-xl border border-slate-200 text-[11px] flex-1"
                >
                  <span className="font-extrabold text-slate-900 block">AIIA Emergency Admin</span>
                  <span className="text-[10px] text-slate-500">ICU & Bed Management</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* ─── TAB 1: PURE WORKING PATIENT REGISTRATION FORM ───────────────── */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {mainTab === 'patient' && (
          <form onSubmit={handlePatientSubmit} className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-slate-800">Create New Patient & ABHA Master Key:</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Supabase Postgres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={patientForm.contact}
                  onChange={(e) => setPatientForm({ ...patientForm, contact: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Age *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                  placeholder="e.g. 45"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Gender *</label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Blood Group</label>
                <select
                  value={patientForm.blood_group}
                  onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="O-">O-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Address / City</label>
              <input
                type="text"
                value={patientForm.address}
                onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                placeholder="e.g. Sector 14, Dwarka, New Delhi"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Interactive Profile Photo Upload / Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  Profile Photo / Avatar (Optional)
                </span>
                {patientForm.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setPatientForm({ ...patientForm, avatar_url: '' })}
                    className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Photo Preview Thumbnail */}
                <div className="w-12 h-12 rounded-2xl bg-slate-200 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {patientForm.avatar_url ? (
                    <img
                      src={patientForm.avatar_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {/* Real File Input Button */}
                    <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setPatientForm)}
                        className="hidden"
                      />
                    </label>

                    {/* Quick Avatar Presets */}
                    <div className="flex items-center gap-1">
                      {[
                        { label: '👨 Man', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
                        { label: '👩 Woman', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
                        { label: '👴 Senior', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPatientForm({ ...patientForm, avatar_url: preset.url })}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="url"
                    value={patientForm.avatar_url || ''}
                    onChange={(e) => setPatientForm({ ...patientForm, avatar_url: e.target.value })}
                    placeholder="Or paste direct image URL here..."
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Triage Registration Option */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-rose-900 block">
                  🚨 Acute Emergency Triage Priority
                </span>
                <span className="text-[10px] text-rose-700 font-medium">
                  Flags case with red-flag alert to bypass standard queue
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-rose-900 text-xs">
                <input
                  type="checkbox"
                  checked={patientForm.is_emergency || false}
                  onChange={(e) => setPatientForm({ ...patientForm, is_emergency: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <span>Emergency</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-3"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{loading ? "Generating ABHA Record on Supabase..." : "Generate Central ABHA & Enter Patient Portal"}</span>
            </button>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* ─── TAB 2: PURE WORKING VAIDYA / DOCTOR REGISTRATION FORM ───────── */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {mainTab === 'doctor' && (
          <form onSubmit={handleDoctorSubmit} className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-slate-800">Register New Ayurvedic Practitioner:</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Live Supabase Postgres
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Vaidya / Doctor Name *</label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="e.g. Dr. Suresh Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Qualification *</label>
                <input
                  type="text"
                  required
                  value={doctorForm.qualification}
                  onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                  placeholder="e.g. BAMS, MD (Kayachikitsa)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Specialization</label>
                <select
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="Kayachikitsa (Internal Medicine)">Kayachikitsa (Internal Medicine)</option>
                  <option value="Panchakarma (Detox & Rejuvenation)">Panchakarma (Detox & Rejuvenation)</option>
                  <option value="Shalya Tantra (Surgery & Marma)">Shalya Tantra (Surgery & Marma)</option>
                  <option value="Shalakya Tantra (ENT & Ophthalmology)">Shalakya Tantra (ENT & Ophthalmology)</option>
                  <option value="Kaumarbhritya (Pediatrics & Rasayana)">Kaumarbhritya (Pediatrics & Rasayana)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={doctorForm.experience_years}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: e.target.value })}
                  placeholder="e.g. 10"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Hospital / Clinic Affiliation</label>
              <input
                type="text"
                value={doctorForm.hospital_name}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospital_name: e.target.value })}
                placeholder="e.g. All India Institute of Ayurveda, New Delhi"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Interactive Doctor Photo Upload / Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  Doctor Profile Photo / Badge (Optional)
                </span>
                {doctorForm.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setDoctorForm({ ...doctorForm, avatar_url: '' })}
                    className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Photo Preview Thumbnail */}
                <div className="w-12 h-12 rounded-2xl bg-slate-200 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {doctorForm.avatar_url ? (
                    <img
                      src={doctorForm.avatar_url}
                      alt="Doctor Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Stethoscope className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {/* Real File Input Button */}
                    <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setDoctorForm)}
                        className="hidden"
                      />
                    </label>

                    {/* Quick Avatar Presets */}
                    <div className="flex items-center gap-1">
                      {[
                        { label: '👨‍⚕️ Senior Vaidya', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
                        { label: '👩‍⚕️ Specialist', url: 'https://images.unsplash.com/photo-1594824813589-3221dbb80b7d?w=150&auto=format&fit=crop&q=80' },
                        { label: '👨‍⚕️ Surgeon', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80' }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setDoctorForm({ ...doctorForm, avatar_url: preset.url })}
                          className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="url"
                    value={doctorForm.avatar_url || ''}
                    onChange={(e) => setDoctorForm({ ...doctorForm, avatar_url: e.target.value })}
                    placeholder="Or paste direct image URL here..."
                    className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-3"
            >
              <Stethoscope className="w-4 h-4 text-emerald-200" />
              <span>{loading ? "Registering Practitioner on Supabase..." : "Create Vaidya Profile & Enter Console"}</span>
            </button>
          </form>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* ─── TAB 3: ADMIN & HOSPITAL CREDENTIALS LOGIN ───────────────────── */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {mainTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-slate-800">Hospital Admin & Ministry Access:</span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Command Console
              </span>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">Hospital / Center Name</label>
              <input
                type="text"
                value={adminForm.hospital_name}
                onChange={(e) => setAdminForm({ ...adminForm, hospital_name: e.target.value })}
                placeholder="e.g. All India Institute of Ayurveda"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Admin ID / License</label>
                <input
                  type="text"
                  value={adminForm.admin_id}
                  onChange={(e) => setAdminForm({ ...adminForm, admin_id: e.target.value })}
                  placeholder="e.g. AIIA-ADMIN-01"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Password</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-2xl shadow-md shadow-purple-700/20 flex items-center justify-center gap-2 transition-all mt-3"
            >
              <Building2 className="w-4 h-4 text-purple-200" />
              <span>Enter Hospital Admin & Bed Command Portal</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
