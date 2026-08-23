import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function AbdmComplianceLogs() {
  const { t } = useTranslation();

  const activityLog = [
    {
      id: 1,
      icon: UserCheck,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      title: 'New Ayush Multi-Specialty Center onboarded to Central Registry',
      meta: 'AYUSH-BLR-04 • Bengaluru • ABDM M3 Certified',
      time: '2 hours ago',
    },
    {
      id: 2,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      title: 'MedRoute ICU Node compliance audit flagged — GPS telemetry update required',
      meta: 'AYUSH-HYD-02 • Hyderabad Command Node',
      time: '5 hours ago',
    },
    {
      id: 3,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      title: 'Bulk ABDM Health Pass sync completed successfully — 1,240 records updated',
      meta: 'Rajasthan Regional Ayush Registry',
      time: '1 day ago',
    },
    {
      id: 4,
      icon: Settings,
      iconColor: 'text-slate-500',
      iconBg: 'bg-slate-100',
      title: 'AyurSaarthi AI Ashtavidha Clinical Scoring Engine updated to v3.4',
      meta: 'Ministry System Architecture Division',
      time: '2 days ago',
    },
    {
      id: 5,
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      title: 'NCISM Practitioner Registry Automated API Sync Verified',
      meta: 'National Commission for Indian System of Medicine',
      time: '3 days ago',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Header Banner ──────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300 tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            Audit & System Logs Module
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">ABDM System Compliance & Audit Logs</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time audit trail of hospital registrations, ABDM digital health pass syncs & AI model updates.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Audit Stream Active
        </span>
      </div>

      {/* ─── Logs Stream ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Clock className="w-5 h-5 text-slate-700" />
          <span>System Event History</span>
        </h3>

        <div className="space-y-3">
          {activityLog.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <span className={`p-3 rounded-2xl ${item.iconBg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{item.title}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{item.meta}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 pt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
