import React, { useState } from 'react';
import { ShieldCheck, QrCode, Copy, Check, User, Phone, Droplet, Activity, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PatientHeader({ activePatient, currentUser }) {
  const { t } = useTranslation();
  const [copiedAbha, setCopiedAbha] = useState(false);

  const displayPatient = currentUser || activePatient;
  const patientName = displayPatient?.name || 'Ramesh Sharma';
  const abhaId = displayPatient?.abha_id || 'ABHA-9821-4501';
  const uhid = displayPatient?.uhid || displayPatient?.abha_id || 'UHID-2026-9821';
  const age = displayPatient?.age || 42;
  const gender = (displayPatient?.gender || 'male').toUpperCase();
  const bloodGroup = displayPatient?.blood_group || 'B+';
  const contact = displayPatient?.contact || '+91 9876543210';
  const prakriti = displayPatient?.prakriti || 'Vata-Pitta';
  const avatarUrl = displayPatient?.avatar_url || (gender === 'FEMALE' ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80");

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl}
          alt={patientName}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
        />
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              {t('patientPortal.dpdpConsent', 'ABDM Verified Record')}
            </span>
            <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {uhid}
            </span>
          </div>

          <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-slate-900 leading-tight">
            {patientName}
          </h2>

          {/* DYNAMIC PATIENT PROFILE METADATA ROW */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {gender} • {age} yrs
            </span>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="flex items-center gap-1 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {contact}
            </span>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
              <Droplet className="w-3 h-3 text-rose-500" />
              {bloodGroup}
            </span>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="flex items-center gap-1 text-teal-800 font-bold bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
              <Activity className="w-3 h-3 text-teal-600" />
              Prakriti: {prakriti}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE ABHA QR & COPY CARD */}
      <div className="flex items-center gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto shrink-0 justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <QrCode className="w-7 h-7 text-emerald-600 shrink-0" />
          <div className="text-left">
            <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('patientPortal.centralAbha', 'CENTRAL ABHA ID')}
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono tracking-wide">
              {abhaId}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(abhaId);
            setCopiedAbha(true);
            setTimeout(() => setCopiedAbha(false), 2000);
          }}
          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded-md flex items-center gap-1 transition-all border border-emerald-200 cursor-pointer shrink-0"
          title={t('patientPortal.copy', 'Copy ABHA ID')}
        >
          {copiedAbha ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
          <span>{copiedAbha ? t('patientPortal.copied', 'Copied!') : t('patientPortal.copy', 'Copy')}</span>
        </button>
      </div>
    </div>
  );
}
