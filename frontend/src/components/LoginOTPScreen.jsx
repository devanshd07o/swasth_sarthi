import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, KeyRound, ArrowRight, AlertTriangle, RefreshCw, Sparkles, User, Stethoscope, Mail, ExternalLink, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendAuthOtp, verifyAuthOtp } from '../services/api';

export default function LoginOTPScreen({ role = 'patient', onLoginSuccess, onRedirectRegistration, lang = 'en' }) {
  const { t } = useTranslation();
  
  // Real OTP Flow State
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'not_registered'
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [userPreview, setUserPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpChannel, setOtpChannel] = useState('email'); // 'sms' | 'email'
  const [maskedTarget, setMaskedTarget] = useState('');
  const [inputMode, setInputMode] = useState('email'); // Default to Email OTP to protect SMS credits

  // Registration Form States
  const [docRegForm, setDocRegForm] = useState({
    name: '',
    registration_no: '',
    qualification: 'BAMS, MD (Kayachikitsa)',
    hospital_name: '',
    city: 'New Delhi',
    contact: ''
  });

  const [patientRegForm, setPatientRegForm] = useState({
    name: '',
    age: 32,
    gender: 'male',
    blood_group: 'B+',
    contact: '',
    city: 'New Delhi',
    prakriti: 'Vata-Pitta'
  });

  const [adminRegForm, setAdminRegForm] = useState({
    name: '',
    employee_id: '',
    email: '',
    contact: '',
    hospital_name: 'Ministry of Ayush Head Office, New Delhi',
    designation: 'Ministry Admin Officer'
  });

  const handleRegisterAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminRegForm.name || !adminRegForm.employee_id || !adminRegForm.email) {
      setErrorMsg('Please fill out Name, Employee ID, and Official Email.');
      return;
    }
    const newEmpId = adminRegForm.employee_id.toUpperCase().startsWith('AYUSH-EMP') 
      ? adminRegForm.employee_id.toUpperCase() 
      : `AYUSH-EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAdminData = {
      id: newEmpId,
      employee_id: newEmpId,
      name: adminRegForm.name,
      email: adminRegForm.email,
      contact: adminRegForm.contact || '+91 9811002233',
      hospital_name: adminRegForm.hospital_name,
      designation: adminRegForm.designation,
      role: 'hospital_admin',
      token: `jwt_admin_${Date.now()}`
    };
    localStorage.setItem('swasth_jwt_token', newAdminData.token);
    localStorage.setItem('swasth_user', JSON.stringify(newAdminData));
    onLoginSuccess(newAdminData);
  };

  const handleRegisterDoctorSubmit = (e) => {
    e.preventDefault();
    if (!docRegForm.name || !docRegForm.registration_no || !docRegForm.hospital_name) {
      setErrorMsg('Please fill out Name, Registration No, and Hospital/Clinic Name.');
      return;
    }
    const newDocId = `DOC-AYUR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDocData = {
      id: newDocId,
      doctor_id: newDocId,
      name: docRegForm.name.startsWith('Dr.') ? docRegForm.name : `Dr. ${docRegForm.name}`,
      email: `${docRegForm.name.toLowerCase().replace(/[^a-z]/g, '')}@ayursaarthi.in`,
      role: 'doctor',
      qualification: docRegForm.qualification,
      hospital_name: docRegForm.hospital_name,
      registration_no: docRegForm.registration_no,
      city: docRegForm.city,
      contact: docRegForm.contact || '9876543210',
      avatar_url: '/avatars/dr_rajesh_vaidya.png',
      token: `jwt_doc_${Date.now()}`
    };
    localStorage.setItem('swasth_jwt_token', newDocData.token);
    localStorage.setItem('swasth_user', JSON.stringify(newDocData));
    onLoginSuccess(newDocData);
  };

  const handleRegisterPatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientRegForm.name || !patientRegForm.contact) {
      setErrorMsg('Please enter Patient Full Name and Contact Mobile Number.');
      return;
    }
    const newAbhaId = `ABHA-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatientData = {
      id: newAbhaId,
      abha_id: newAbhaId,
      uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: patientRegForm.name,
      email: `${patientRegForm.name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
      role: 'patient',
      contact: patientRegForm.contact,
      age: Number(patientRegForm.age) || 30,
      gender: patientRegForm.gender,
      blood_group: patientRegForm.blood_group,
      prakriti: patientRegForm.prakriti,
      address: patientRegForm.city,
      avatar_url: patientRegForm.gender === 'female' ? '/avatars/priya_deshmukh.png' : '/avatars/rajesh_kumar.jpeg',
      token: `jwt_pat_${Date.now()}`
    };
    localStorage.setItem('swasth_jwt_token', newPatientData.token);
    localStorage.setItem('swasth_user', JSON.stringify(newPatientData));
    onLoginSuccess(newPatientData);
  };

  // Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

  // Dedicated Demo Profile Handler (SEPARATE FROM OTP PATH - NEVER CALLS sendAuthOtp)
  const handlePatientDemoPreset = (abhaId, patientName, mobile, gender, age, bloodGroup, prakriti, avatarUrl) => {
    const demoUserData = {
      id: abhaId,
      abha_id: abhaId,
      name: patientName,
      email: `${patientName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: 'patient',
      contact: mobile,
      age: age,
      gender: gender,
      blood_group: bloodGroup,
      prakriti: prakriti,
      avatar_url: avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      token: 'demo_patient_jwt_token_2026'
    };
    // Store JWT & user data in localStorage
    localStorage.setItem('swasth_jwt_token', demoUserData.token);
    localStorage.setItem('swasth_user', JSON.stringify(demoUserData));
    onLoginSuccess(demoUserData);
  };

  const handleDoctorDemoPreset = (docId, docName, hospital, qual, regNo, avatar) => {
    const demoUserData = {
      id: docId,
      doctor_id: docId,
      name: docName,
      email: `${docId.toLowerCase()}@ayursaarthi.in`,
      role: 'doctor',
      qualification: qual,
      hospital_name: hospital,
      registration_no: regNo || 'AYUSH-REG-DEL-2012-4412',
      avatar_url: avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=face",
      token: 'demo_doctor_jwt_token_2026'
    };
    localStorage.setItem('swasth_jwt_token', demoUserData.token);
    localStorage.setItem('swasth_user', JSON.stringify(demoUserData));
    onLoginSuccess(demoUserData);
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(t('auth.errorEnterId', 'Please enter your Mobile Number, ABHA ID or Doctor ID.'));
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const selectedChannel = inputMode === 'email' ? 'email' : 'sms';
      const res = await sendAuthOtp(identifier.trim(), role, selectedChannel);
      if (res.status === 'not_registered' || !res.is_registered) {
        setStep('not_registered');
      } else {
        setSessionId(res.session_id);
        setUserPreview(res.user_preview);
        setOtpChannel(res.channel || selectedChannel);
        setMaskedTarget(res.masked_target || identifier.slice(-4).padStart(identifier.length, '*'));
        setStep('otp');
        setTimerSeconds(60);
        setIsTimerActive(true);
      }
    } catch (err) {
      setErrorMsg(err.message || t('auth.errorOtpSend', 'Failed to send OTP. Please check your number/email and try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg(t('auth.errorInvalidOtpLength', 'Please enter 6-digit OTP code (e.g. 123456).'));
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const res = await verifyAuthOtp(identifier.trim(), otpCode.trim(), sessionId, role, userPreview);
      // Store JWT in localStorage (24h expiry)
      localStorage.setItem('swasth_jwt_token', res.access_token);
      localStorage.setItem('swasth_user', JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMsg(err.message || t('auth.invalidOtp', 'Invalid OTP code. Please check your SMS or email and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isTimerActive) return;
    setErrorMsg('');
    setLoading(true);
    try {
      const selectedChannel = inputMode === 'email' ? 'email' : 'sms';
      const res = await sendAuthOtp(identifier.trim(), role, selectedChannel);
      setSessionId(res.session_id);
      if (res.channel) setOtpChannel(res.channel);
      if (res.masked_target) setMaskedTarget(res.masked_target);
      setTimerSeconds(60);
      setIsTimerActive(true);
    } catch (err) {
      setErrorMsg(t('auth.errorResend', 'Failed to resend OTP. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-xs font-body">
      
      {/* ─── 1-CLICK DEMO PROFILE PRESETS (STRICTLY SEPARATE - NO OTP) ───── */}
      <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t('auth.demoPill', '1-Click Judge / Demo Profile (Bypass OTP)')}
          </span>
          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            Instant Demo
          </span>
        </div>

        {role === 'patient' ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePatientDemoPreset('ABHA-9821-4501', 'Ramesh Sharma', '+91 9876543210', 'male', 42, 'B+', 'Vata-Pitta', '/avatars/rajesh_kumar.jpeg')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ramesh Sharma (ABHA-9821-4501)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePatientDemoPreset('ABHA-3344-1102', 'Priya Deshmukh', '+91 9821450100', 'female', 29, 'A+', 'Pitta-Vata', '/avatars/priya_deshmukh.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Priya Deshmukh (ABHA-3344-1102)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePatientDemoPreset('ABHA-3412-8902', 'Sunita Sharma', '+91 9123456789', 'female', 36, 'O+', 'Kapha-Pitta', '/avatars/sunita_sharma.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sunita Sharma (ABHA-3412-8902)</span>
            </button>
          </div>
        ) : role === 'admin' ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                const adminData = {
                  id: 'AYUSH-EMP-9001',
                  employee_id: 'AYUSH-EMP-9001',
                  name: 'Shri Rakesh Varma',
                  designation: 'Senior Director, Ministry of Ayush SIH Division',
                  email: 'rakesh.varma@ayush.gov.in',
                  hospital_name: 'Ministry of Ayush Head Office, New Delhi',
                  role: 'hospital_admin',
                  token: `jwt_admin_${Date.now()}`
                };
                localStorage.setItem('swasth_jwt_token', adminData.token);
                localStorage.setItem('swasth_user', JSON.stringify(adminData));
                onLoginSuccess(adminData);
              }}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Shri Rakesh Varma (EMP-9001)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const adminData = {
                  id: 'AYUSH-EMP-9002',
                  employee_id: 'AYUSH-EMP-9002',
                  name: 'Dr. Sangeeta Rao',
                  designation: 'ABDM Integration Officer, MoA Govt of India',
                  email: 'sangeeta.rao@ayush.gov.in',
                  hospital_name: 'All India Institute of Ayurveda Command Center',
                  role: 'hospital_admin',
                  token: `jwt_admin_${Date.now()}`
                };
                localStorage.setItem('swasth_jwt_token', adminData.token);
                localStorage.setItem('swasth_user', JSON.stringify(adminData));
                onLoginSuccess(adminData);
              }}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dr. Sangeeta Rao (EMP-9002)</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleDoctorDemoPreset('DOC-AYUR-101', 'Dr. Rajesh Vaidya', 'All India Institute of Ayurveda (AIIA), New Delhi', 'BAMS, MD (Kayachikitsa)', 'AYUSH-REG-DEL-2012-4412', '/avatars/dr_rajesh_vaidya.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dr. Rajesh Vaidya (AYUSH-REG-DEL-2012-4412)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDoctorDemoPreset('DOC-AYUR-204', 'Dr. Ananya Shastri', 'National Institute of Ayurveda (NIA), Jaipur', 'BAMS, MD (Ayurveda - Kayachikitsa)', 'AYUSH-REG-RAJ-2015-1108', '/avatars/dr_ananya_shastri.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dr. Ananya Shastri (AYUSH-REG-RAJ-2015-1108)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDoctorDemoPreset('DOC-AYUR-308', 'Dr. Vikramaditya Dev', 'Faculty of Ayurveda, BHU, Varanasi', 'BAMS, MD (Ayurveda - Shalya Tantra)', 'AYUSH-REG-UP-2010-8820', '/avatars/dr_vikramaditya_dev.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dr. Vikramaditya Dev (AYUSH-REG-UP-2010-8820)</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 font-semibold flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── STEP 1: ENTER IDENTIFIER (REAL OTP PATH) ───────────────────────── */}
      {step === 'input' && (
        <form onSubmit={handleSendOtp} className="space-y-3">

          {/* Mode toggle: Mobile/Govt ID vs Email */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setInputMode('mobile'); setIdentifier(''); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'mobile'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{role === 'admin' ? 'Govt Employee ID / Mobile' : role === 'doctor' ? 'State Ayush Reg No / Mobile' : 'Central ABHA ID / Mobile'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setInputMode('email'); setIdentifier(''); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'email'
                  ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail / Official Email OTP</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {inputMode === 'email'
                ? t('auth.enterEmail', 'Enter Official Gmail Email Address')
                : role === 'admin'
                ? 'Enter Ministry Govt Employee ID / Officer ID'
                : role === 'doctor'
                ? 'Enter State Ayush Council Registration Number'
                : t('auth.enterAbhaOrMobile', 'Enter 14-Digit ABHA ID / ABHA Address')}
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              {inputMode === 'email'
                ? <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                : <Phone className="w-4 h-4 text-slate-400 shrink-0" />}
              <input
                type={inputMode === 'email' ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  inputMode === 'email'
                    ? 'e.g. rakesh.varma@ayush.gov.in or yourname@gmail.com'
                    : role === 'admin'
                    ? 'e.g. AYUSH-EMP-9001 or 9811002233'
                    : role === 'doctor'
                    ? 'e.g. AYUSH-REG-DEL-2012-4412 or 9876543210'
                    : 'e.g. ABHA-9821-4501 or 9821450100'
                }
                className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              {inputMode === 'email'
                ? t('auth.emailHint', 'OTP will be sent to your Gmail inbox.')
                : t('auth.identifierHint', 'OTP will be sent via SMS to your mobile.')}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {inputMode === 'email'
              ? <Mail className="w-4 h-4 text-amber-300" />
              : <Phone className="w-4 h-4 text-amber-300" />}
            <span>{loading ? t('common.loading', 'Sending OTP...') : t('auth.btnSendOtp', 'Send Verification OTP')}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          {/* Direct Link to Official Government Registration Portals */}
          <div className="text-center pt-2.5 border-t border-slate-100 space-y-2">
            {role === 'doctor' ? (
              <a
                href="https://ncismindia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 font-bold text-xs rounded-2xl border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>🏛️ Official NCISM / State Ayush Practitioner Registry (ncismindia.org)</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ) : role === 'admin' ? (
              <a
                href="https://ayush.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 text-amber-950 font-bold text-xs rounded-2xl border border-amber-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                <span>🏛️ Official Ministry of Ayush Officer Portal (ayush.gov.in)</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ) : (
              <a
                href="https://abha.abdm.gov.in/abha/v3/register"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 font-bold text-xs rounded-2xl border border-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>🏛️ Create New ABHA Health Pass on Official ABDM Govt Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        </form>
      )}

      {/* ─── STEP 2: VERIFY 6-DIGIT OTP ─────────────────────────────────────── */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-950 space-y-1">
            <span className="font-extrabold block text-xs">
              {otpChannel === 'email'
                ? t('auth.otpSentEmail', 'OTP sent to your email address')
                : t('auth.otpSentSms', 'OTP sent to your mobile number')}
            </span>
            <p className="text-[11px] text-emerald-800">
              {otpChannel === 'email'
                ? t('auth.codeSentToEmail', 'Check your inbox for a 6-digit code sent to')
                : t('auth.codeSentToMobile', 'Check your SMS for a 6-digit code sent to')}{' '}
              <span className="font-bold font-mono">{maskedTarget || identifier}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('auth.otpInputLabel', '6-Digit Verification OTP Code')}
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-transparent font-mono text-base font-extrabold tracking-widest text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            {isTimerActive ? (
              <span className="text-slate-400 font-semibold">
                {t('auth.resendInSeconds', 'Resend OTP in {{seconds}}s', { seconds: timerSeconds })}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {t('auth.resendBtn', 'Resend OTP')}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setStep('input');
                setErrorMsg('');
              }}
              className="text-slate-500 font-semibold hover:text-slate-800 cursor-pointer"
            >
              {t('auth.changeNumber', 'Change Number')}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>{loading ? t('common.loading', 'Verifying...') : t('auth.btnVerifyOtp', 'Verify OTP & Access Portal')}</span>
          </button>
        </form>
      )}

      {/* ─── STEP 3: NOT REGISTERED FALLBACK ───────────────────────────────── */}
      {step === 'not_registered' && (
        <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-4 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900">{t('auth.notRegisteredTitle', 'Record Not Registered')}</h4>
            <p className="text-xs text-slate-600 font-medium">
              {role === 'doctor'
                ? 'No doctor account matching your registration or mobile number. Register your clinical practice now.'
                : t('auth.notRegisteredDesc', 'No patient record found. Complete registration to get your central clinical health pass.')}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep(role === 'doctor' ? 'register_doctor' : 'register_patient');
                setErrorMsg('');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              {role === 'doctor' ? 'Proceed to Vaidya Practice Registration →' : t('auth.btnRegisterNew', 'Proceed to New Patient Registration →')}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 cursor-pointer"
            >
              {t('auth.btnTryDifferent', 'Try Different Number / ID')}
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: NEW DOCTOR REGISTRATION FORM ─────────────────────────────── */}
      {step === 'register_doctor' && (
        <form onSubmit={handleRegisterDoctorSubmit} className="space-y-3 animate-fade-in">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 flex items-center justify-between">
            <span className="font-extrabold text-xs flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              New Vaidya Practitioner Onboarding
            </span>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Login
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Doctor Full Name *</label>
            <input
              type="text"
              required
              value={docRegForm.name}
              onChange={(e) => setDocRegForm({ ...docRegForm, name: e.target.value })}
              placeholder="e.g. Dr. Arvind Sharma"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Reg. Number *</label>
              <input
                type="text"
                required
                value={docRegForm.registration_no}
                onChange={(e) => setDocRegForm({ ...docRegForm, registration_no: e.target.value })}
                placeholder="AYUSH-REG-2024-9912"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Contact Mobile *</label>
              <input
                type="tel"
                required
                value={docRegForm.contact}
                onChange={(e) => setDocRegForm({ ...docRegForm, contact: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Qualification & Specialty</label>
            <input
              type="text"
              value={docRegForm.qualification}
              onChange={(e) => setDocRegForm({ ...docRegForm, qualification: e.target.value })}
              placeholder="BAMS, MD (Kayachikitsa / Nadi Pariksha)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Hospital / Clinic *</label>
              <input
                type="text"
                required
                value={docRegForm.hospital_name}
                onChange={(e) => setDocRegForm({ ...docRegForm, hospital_name: e.target.value })}
                placeholder="Ayush Clinic"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">City</label>
              <input
                type="text"
                value={docRegForm.city}
                onChange={(e) => setDocRegForm({ ...docRegForm, city: e.target.value })}
                placeholder="New Delhi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Complete Registration & Launch Console</span>
          </button>
        </form>
      )}

      {/* ─── STEP 5: NEW PATIENT / CITIZEN REGISTRATION FORM ─────────────────── */}
      {step === 'register_patient' && (
        <form onSubmit={handleRegisterPatientSubmit} className="space-y-3 animate-fade-in">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 flex items-center justify-between">
            <span className="font-extrabold text-xs flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              New Citizen Central ABHA Registration
            </span>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Login
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Full Name *</label>
            <input
              type="text"
              required
              value={patientRegForm.name}
              onChange={(e) => setPatientRegForm({ ...patientRegForm, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Age *</label>
              <input
                type="number"
                required
                value={patientRegForm.age}
                onChange={(e) => setPatientRegForm({ ...patientRegForm, age: e.target.value })}
                placeholder="30"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Gender</label>
              <select
                value={patientRegForm.gender}
                onChange={(e) => setPatientRegForm({ ...patientRegForm, gender: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Blood Group</label>
              <select
                value={patientRegForm.blood_group}
                onChange={(e) => setPatientRegForm({ ...patientRegForm, blood_group: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile Number *</label>
              <input
                type="tel"
                required
                value={patientRegForm.contact}
                onChange={(e) => setPatientRegForm({ ...patientRegForm, contact: e.target.value })}
                placeholder="9876543210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Prakriti Type</label>
              <select
                value={patientRegForm.prakriti}
                onChange={(e) => setPatientRegForm({ ...patientRegForm, prakriti: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Vata-Pitta">Vata-Pitta</option>
                <option value="Kapha-Pitta">Kapha-Pitta</option>
                <option value="Pitta-Vata">Pitta-Vata</option>
                <option value="Tridoshaja">Tridoshaja</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Generate ABHA & Access Citizen Portal</span>
          </button>
        </form>
      )}

      {/* ─── STEP 6: NEW MINISTRY ADMIN REGISTRATION FORM ─────────────────── */}
      {step === 'register_admin' && (
        <form onSubmit={handleRegisterAdminSubmit} className="space-y-3 animate-fade-in">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 flex items-center justify-between">
            <span className="font-extrabold text-xs flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              New Ministry Admin Officer Onboarding
            </span>
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
            >
              ← Back to Login
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Officer Full Name *</label>
            <input
              type="text"
              required
              value={adminRegForm.name}
              onChange={(e) => setAdminRegForm({ ...adminRegForm, name: e.target.value })}
              placeholder="e.g. Shri Rakesh Varma"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Govt Employee ID *</label>
              <input
                type="text"
                required
                value={adminRegForm.employee_id}
                onChange={(e) => setAdminRegForm({ ...adminRegForm, employee_id: e.target.value })}
                placeholder="AYUSH-EMP-9001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Contact Mobile *</label>
              <input
                type="tel"
                required
                value={adminRegForm.contact}
                onChange={(e) => setAdminRegForm({ ...adminRegForm, contact: e.target.value })}
                placeholder="9811002233"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Official Govt Email Address *</label>
            <input
              type="email"
              required
              value={adminRegForm.email}
              onChange={(e) => setAdminRegForm({ ...adminRegForm, email: e.target.value })}
              placeholder="e.g. rakesh.varma@ayush.gov.in"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Ministry Division / Institution</label>
            <input
              type="text"
              value={adminRegForm.hospital_name}
              onChange={(e) => setAdminRegForm({ ...adminRegForm, hospital_name: e.target.value })}
              placeholder="Ministry of Ayush Head Office, New Delhi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Verify Employee ID & Launch Ministry Portal</span>
          </button>
        </form>
      )}

    </div>
  );
}
