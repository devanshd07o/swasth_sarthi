import React, { useState, useEffect } from 'react';
import { Phone, ShieldCheck, KeyRound, ArrowRight, AlertTriangle, RefreshCw, Sparkles, User, Stethoscope, Mail, ExternalLink, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { sendAuthOtp, verifyAuthOtp } from '../services/api';

export default function LoginOTPScreen({ role = 'patient', onLoginSuccess, onRedirectRegistration, lang = 'en' }) {
  const { t } = useTranslation();
  
  // Real OTP Flow State
  const [step, setStep] = useState('input'); // 'input' | 'otp' | 'not_registered'
  const [govId, setGovId] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [userPreview, setUserPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otpChannel, setOtpChannel] = useState('email'); // 'sms' | 'email'
  const [maskedTarget, setMaskedTarget] = useState('');

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
    const newDocId = docRegForm.registration_no.toUpperCase();
    const newDocData = {
      id: newDocId,
      doctor_id: newDocId,
      name: docRegForm.name.startsWith('Dr.') ? docRegForm.name : `Dr. ${docRegForm.name}`,
      email: docRegForm.contact ? `${docRegForm.contact}@ayursaarthi.in` : `${docRegForm.name.toLowerCase().replace(/[^a-z]/g, '')}@ayursaarthi.in`,
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

  // Step 1: Send Real OTP to Gmail while linking Master Gov ID
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!govId.trim()) {
      setErrorMsg(role === 'admin' ? 'Please enter Ministry Govt Employee ID.' : role === 'doctor' ? 'Please enter State Ayush Council Registration Number.' : 'Please enter 14-Digit ABHA ID.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail / Official Email address.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const targetEmail = email.trim();
      const targetGovId = govId.trim().toUpperCase();
      const res = await sendAuthOtp(targetEmail, role, 'email');
      
      const dynamicUserPreview = {
        id: targetGovId,
        abha_id: role === 'patient' ? targetGovId : undefined,
        doctor_id: role === 'doctor' ? targetGovId : undefined,
        registration_no: role === 'doctor' ? targetGovId : undefined,
        employee_id: role === 'admin' ? targetGovId : undefined,
        email: targetEmail,
        name: targetEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: role === 'admin' ? 'hospital_admin' : role
      };

      setSessionId(res.session_id || `sess_${Date.now()}`);
      setUserPreview(dynamicUserPreview);
      setOtpChannel('email');
      setMaskedTarget(targetEmail.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length)));
      setStep('otp');
      setTimerSeconds(60);
      setIsTimerActive(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send verification OTP to email. Please check your Gmail address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Issue Token
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMsg('Please enter 6-digit OTP code received in your Gmail inbox.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const res = await verifyAuthOtp(email.trim(), otpCode.trim(), sessionId, role, userPreview);
      const authenticatedUser = {
        ...(res.user || userPreview || {}),
        id: govId.trim().toUpperCase() || (res.user && res.user.id),
        abha_id: role === 'patient' ? (govId.trim().toUpperCase() || (res.user && res.user.abha_id)) : undefined,
        registration_no: role === 'doctor' ? (govId.trim().toUpperCase() || (res.user && res.user.registration_no)) : undefined,
        employee_id: role === 'admin' ? (govId.trim().toUpperCase() || (res.user && res.user.employee_id)) : undefined,
        email: email.trim().toLowerCase(),
        role: role === 'admin' ? 'hospital_admin' : role
      };

      localStorage.setItem('swasth_jwt_token', res.access_token || `jwt_${Date.now()}`);
      localStorage.setItem('swasth_user', JSON.stringify(authenticatedUser));
      onLoginSuccess(authenticatedUser);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP code. Please check your Gmail inbox and try again.');
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
              onClick={() => handleDoctorDemoPreset('DOC-AYUR-102', 'Dr. Ananya Shastri', 'National Institute of Ayurveda (NIA), Jaipur', 'BAMS, MD (Panchakarma & Skin)', 'AYUSH-REG-RAJ-2016-8921', '/avatars/dr_ananya_shastri.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dr. Ananya Shastri (AYUSH-REG-RAJ-2016-8921)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDoctorDemoPreset('DOC-AYUR-103', 'Dr. Vikramaditya Dev', 'Faculty of Ayurveda, BHU, Varanasi', 'BAMS, MS (Shalya Tantra)', 'AYUSH-REG-UP-2010-1120', '/avatars/dr_vikramaditya_dev.png')}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-slate-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dr. Vikramaditya Dev (AYUSH-REG-UP-2010-1120)</span>
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

      {/* ─── STEP 1: ENTER GOVT ID + GMAIL EMAIL (REAL OTP PATH) ─────────────── */}
      {step === 'input' && (
        <form onSubmit={handleSendOtp} className="space-y-3 font-body">

          {/* Input 1: Mandatory Master Govt Identifier */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {role === 'admin'
                ? '1. Ministry Govt Employee ID / Officer ID *'
                : role === 'doctor'
                ? '1. State Ayush Council Registration Number *'
                : '1. Central ABHA Number / ABHA Address *'}
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                required
                value={govId}
                onChange={(e) => setGovId(e.target.value)}
                placeholder={
                  role === 'admin'
                    ? 'e.g. AYUSH-EMP-9001'
                    : role === 'doctor'
                    ? 'e.g. AYUSH-REG-DEL-2012-4412'
                    : 'e.g. ABHA-9821-4501 or 9821450100'
                }
                className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none font-mono"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              {role === 'admin'
                ? 'Official Employee ID issued by Ministry of Ayush.'
                : role === 'doctor'
                ? 'Official Registration Number issued by State Ayush Council / NCISM.'
                : 'Central 14-Digit ABHA ID or registered mobile.'}
            </span>
          </div>

          {/* Input 2: Mandatory Gmail / Email Address for Real OTP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Official Gmail / Email Address (For 6-Digit Real OTP Verification) *
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com or rakesh.varma@ayush.gov.in"
                className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-1">
              Real 6-Digit OTP code will be sent immediately to this email inbox.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#12372A] hover:bg-[#0B2B20] disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
          >
            <Mail className="w-4 h-4 text-amber-300" />
            <span>{loading ? t('common.loading', 'Sending OTP...') : 'Send 6-Digit Real OTP to Gmail →'}</span>
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
