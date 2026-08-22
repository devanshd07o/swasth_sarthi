import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Sparkles, Clock, ShieldCheck, ArrowUpRight, Search, 
  AlertTriangle, Star, Activity, Stethoscope, HeartPulse, Filter, RefreshCw, QrCode 
} from 'lucide-react';
import { getDoctorPatients, getDoctorById } from '../services/api';

export default function DoctorDashboard({ onNewCase, onSelectPatient, currentDoctorId = "DOC-AYUR-101" }) {
  const [patients, setPatients] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentDoctorId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [docData, patientList] = await Promise.all([
        getDoctorById(currentDoctorId).catch(() => null),
        getDoctorPatients(currentDoctorId, searchQuery).catch(() => [])
      ]);
      if (docData) setDoctorInfo(docData);
      setPatients(patientList);
    } catch (e) {
      console.error('Failed to load doctor dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDashboardData();
  };

  const emergencyCount = patients.filter(p => p.is_red_flag).length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* ─── Vaidya Identity Banner ────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={doctorInfo?.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
            alt="Doctor"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {doctorInfo?.registration_no || "AYUSH-REG-DEL-2012-4412"}
              </span>
              <span className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{doctorInfo?.rating_avg || 4.9}</span>
                <span className="text-slate-400 font-normal">({doctorInfo?.rating_count || 38} reviews)</span>
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {doctorInfo?.name || "Dr. Rajesh Vaidya"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {doctorInfo?.qualification || "BAMS, MD (Kayachikitsa)"} • {doctorInfo?.hospital_name || "All India Institute of Ayurveda (AIIA), New Delhi"}
            </p>
          </div>
        </div>

        <button
          onClick={onNewCase}
          className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          <Stethoscope className="w-4 h-4" />
          <span>+ Open Clinical Case Sheet</span>
        </button>
      </div>

      {/* ─── Analytics & Emergency KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Consulting Patients */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Consulting Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{patients.length}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">≥1 Visit / Active Registration</span>
        </div>

        {/* 🚨 Emergency Red-Flag Triage */}
        <div className={`p-5 rounded-3xl border shadow-xs transition-all ${
          emergencyCount > 0
            ? 'bg-rose-50 border-rose-300 animate-pulse'
            : 'bg-white border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">MedRoute Red-Flags</span>
            <AlertTriangle className={`w-4 h-4 ${emergencyCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-black ${emergencyCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {emergencyCount}
          </p>
          <span className={`text-[11px] font-bold ${emergencyCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
            {emergencyCount > 0 ? "Critical Queue Priority!" : "All Queues Normal"}
          </span>
        </div>

        {/* AI Longitudinal Summaries */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">3-Line AI Summaries</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">100%</p>
          <span className="text-[11px] text-amber-700 font-semibold">Synthesized over full history</span>
        </div>

        {/* ABDM Central Integration */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Privacy Boundary</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-800">Enforced</p>
          <span className="text-[11px] text-slate-500 font-semibold">Doctor private notes locked</span>
        </div>

      </div>

      {/* ─── Searchable Patient Queue with Red-Flag Priority ───────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Doctor's OPD Patient Queue & Records</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {patients.length} Registered
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Red-flag emergency cases are automatically sorted to the very top.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 w-full">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name, Mobile, ABHA..."
                className="bg-transparent text-xs font-medium text-slate-800 outline-none w-full"
              />
            </div>
            <button
              type="submit"
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              <Filter className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Patient Rows List */}
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading Patient Records...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
            No consulting patients found matching search criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((p) => {
              const isEmergency = p.is_red_flag;
              return (
                <div
                  key={p.patient_id}
                  onClick={() => onSelectPatient(p.patient_id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:shadow-sm ${
                    isEmergency
                      ? 'bg-rose-50/80 border-rose-300 hover:border-rose-500'
                      : 'bg-slate-50/70 hover:bg-emerald-50/50 border-slate-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isEmergency && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          🚨 RED-FLAG EMERGENCY
                        </span>
                      )}
                      <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded font-mono">
                        {p.abha_id || p.uhid}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-200 text-slate-700">
                        {p.token_number || "OPD-101"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {p.gender.toUpperCase()} • {p.age} yrs • Blood: {p.blood_group || 'O+'} • Mobile: {p.contact}
                    </p>

                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 pt-0.5">
                      <span className="text-slate-400 font-bold">Chief Complaint:</span>
                      <span className={isEmergency ? "text-rose-900 font-bold" : "text-emerald-900"}>
                        {p.latest_chief_complaint}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold block mb-0.5 ${
                        p.row_tag === 'Emergency / Red-Flag'
                          ? 'bg-rose-600 text-white'
                          : p.row_tag === 'New Patient'
                          ? 'bg-blue-100 text-blue-800'
                          : p.row_tag === 'Follow-up Due'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.row_tag}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Visits: {p.total_visits_with_doctor} • Last: {p.latest_visit_date}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-emerald-700 font-bold hover:bg-emerald-50">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
