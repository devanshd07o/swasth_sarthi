import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Building2,
  Activity,
  FileText,
  Stethoscope,
  Ambulance,
  Phone,
  Mail,
  Award,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Sparkles
} from 'lucide-react';

export default function MinistryCommandCenter() {
  const { t } = useTranslation();

  const loggedInOfficer = {
    name: 'Shri Rakesh Varma',
    emp_id: 'AYUSH-EMP-9001',
    designation: 'Senior Director, SIH & ABDM Integration Cell',
    ministry: 'Ministry of Ayush, Government of India',
    email: 'rakesh.varma@ayush.gov.in',
    contact: '+91 9811002233'
  };

  const stats = [
    {
      label: 'Connected Ayush Hospitals',
      val: '5,420',
      desc: 'Pan-India Ayush Registry',
      icon: Building2,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      label: 'Verified Vaidya Practitioners',
      val: '14,850',
      desc: 'NCISM & State Ayush Reg Verified',
      icon: Stethoscope,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Digital Case Sheets',
      val: '1.24M',
      desc: 'AyurSaarthi ABDM Records',
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      label: 'Active MedRoute Emergency Fleet',
      val: '840',
      desc: 'GPS & ICU Ambulance Dispatch',
      icon: Ambulance,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
  ];

  const recentUpdates = [
    {
      id: 1,
      title: 'National Ayush Registry Grid Online',
      desc: 'All 28 States and 8 UTs connected to ABDM M2/M3 Sync Engine.',
      time: 'Just now',
      type: 'success'
    },
    {
      id: 2,
      title: 'AyurSaarthi AI Clinical Engine v3.4 Deployed',
      desc: 'Enhanced Ashtavidha pariksha NLP summary accuracy to 99.4%.',
      time: '2 hours ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'State Ayush Council Automated Verification',
      desc: 'NCISM Practitioner Registry API sync verified 120 new Vaidyas today.',
      time: '4 hours ago',
      type: 'success'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Ministry Officer Identity Banner ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4 border border-slate-700/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Ministry of Ayush • National Executive Command
              </span>
              <span className="font-mono text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                GOVT OFFICER ID: {loggedInOfficer.emp_id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>{loggedInOfficer.name}</span>
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>

            <p className="text-xs font-semibold text-slate-300">
              {loggedInOfficer.designation} • <span className="text-emerald-400">{loggedInOfficer.ministry}</span>
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 space-y-2 text-[11px] font-medium text-slate-300 shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{loggedInOfficer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{loggedInOfficer.contact}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-[10px] uppercase tracking-wider pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Central Grid Live Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Pan-India Executive Metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-5 space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">{s.label}</span>
                <span className={`p-2.5 rounded-2xl ${s.bgColor}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </span>
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold font-display ${s.color}`}>{s.val}</p>
              <span className="text-[11px] text-slate-500 font-semibold block">{s.desc}</span>
            </div>
          );
        })}
      </div>

      {/* ─── Executive Command Highlights ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>National Ayush Healthcare Grid Overview</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ABDM Phase 3 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">Government Institutions</span>
              <p className="text-xl font-black text-slate-900">1,240 Facilities</p>
              <p className="text-[11px] text-slate-600 font-medium">AIIA, NIA, BHU, ITRA Jamnagar & State Colleges</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">Private Accredited Ayush Hospitals</span>
              <p className="text-xl font-black text-slate-900">4,180 Clinics</p>
              <p className="text-[11px] text-slate-600 font-medium">NABH Accredited Ayurvedic Hospitals & Panchakarma Centers</p>
            </div>
          </div>
        </div>

        {/* Live Updates */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            <span>Ministry Bulletins</span>
          </h3>

          <div className="space-y-3">
            {recentUpdates.map((u) => (
              <div key={u.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{u.title}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{u.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
