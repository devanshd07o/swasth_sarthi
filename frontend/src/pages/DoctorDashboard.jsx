import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, ShieldCheck, ArrowUpRight, Search, 
  AlertTriangle, Star, Stethoscope, Filter 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDoctorPatients, getDoctorById } from '../services/api';

export default function DoctorDashboard({ onNewCase, onSelectPatient, currentDoctorId = "DOC-AYUR-101", currentUser, lang = 'en' }) {
  const { t } = useTranslation();
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

  const activeDoctor = currentUser || doctorInfo;
  const emergencyCount = patients.filter(p => p.is_red_flag).length;

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4">
      
      {/* ─── Vaidya Identity Banner ────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={activeDoctor?.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
            alt={activeDoctor?.name || "Doctor"}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeDoctor?.registration_no || "AYUSH-REG-DEL-2012-4412"}
              </span>
              <span className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{activeDoctor?.rating_avg || 4.9}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {activeDoctor?.name || "Dr. Rajesh Vaidya"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {activeDoctor?.qualification || "BAMS, MD (Kayachikitsa)"} • {activeDoctor?.hospital_name || "All India Institute of Ayurveda"}
            </p>
          </div>
        </div>

        <button
          onClick={onNewCase}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Stethoscope className="w-4 h-4" />
          <span>{t('doctorDashboard.openCaseSheet', 'Open Clinical Case Sheet')}</span>
        </button>
      </div>

      {/* ─── Analytics & Emergency KPI Cards ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Consulting Patients */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">{t('doctorDashboard.consultingPatients', 'Consulting Patients')}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
        </div>

        {/* Active OPD Queue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">{t('doctorDashboard.activeQueueCard', 'Active OPD Queue')}</span>
            <Stethoscope className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {patients.length}
          </p>
        </div>

        {/* AI Longitudinal Summaries */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">{t('doctorDashboard.aiSummaries', 'AI Summaries')}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">100%</p>
        </div>

        {/* ABDM Central Integration */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-600">{t('doctorDashboard.privacyBoundary', 'Privacy Boundary')}</span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-800">{t('doctorDashboard.enforced', 'Enforced')}</p>
        </div>

      </div>

      {/* ─── Searchable Patient Queue with Red-Flag Priority ───────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{t('doctorDashboard.opdQueueTitle', 'OPD Queue')}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {patients.length} {t('doctorDashboard.registered', 'Registered')}
              </span>
            </h3>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-72">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('doctorDashboard.searchPlaceholder', 'Search...')}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none w-full"
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            {t('common.loading', 'Loading...')}
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 text-xs font-medium">
            {t('doctorDashboard.noPatientsFound', 'No patients found.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p) => {
              const isEmergency = p.is_red_flag;
              return (
                <div
                  key={p.patient_id}
                  onClick={() => onSelectPatient(p.patient_id)}
                  className={`p-4 rounded-2xl border shadow-sm transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isEmergency
                      ? 'bg-rose-50 border-rose-300'
                      : p.is_demo
                        ? 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                        : 'bg-emerald-50/40 border-emerald-300/80 hover:border-emerald-500 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isEmergency ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            ACUTE RISK
                          </span>
                        ) : p.is_demo ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            DEMO PATIENT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-700 text-white border border-emerald-800">
                            ACTIVE PATIENT
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {p.prakriti || 'Vata-Pitta'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-50 rounded-xl text-emerald-700 font-bold border border-slate-100 shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-snug">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {p.abha_id || p.uhid} • {p.gender.toUpperCase()} • {p.age} yrs
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-medium text-slate-700 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">
                      {t('doctorDashboard.chiefComplaint', 'Chief Complaint')}
                    </span>
                    <p className={`line-clamp-2 ${isEmergency ? "text-rose-800 font-bold" : "text-slate-800"}`}>
                      {p.latest_chief_complaint}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ─── Bottom Section: Recent Signed Prescriptions & Quick Ayush Formulary ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recent Signed Case Records */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <span>Recent OPD Consultations & Prescriptions</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HIP Synced
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Ramesh Sharma</span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Signed</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Sandhivata (Osteoarthritis) • Yograj Guggulu 2 tab bid</p>
              </div>
              <button 
                onClick={() => onSelectPatient('pat_1')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-slate-200 shadow-xs cursor-pointer shrink-0"
              >
                View EHR
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Sunita Sharma</span>
                  <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.2 rounded">Risk Review</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Amlapitta & Hrid-Daha • Avipattikar Churna 5g HS</p>
              </div>
              <button 
                onClick={() => onSelectPatient('pat_2')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-slate-200 shadow-xs cursor-pointer shrink-0"
              >
                View EHR
              </button>
            </div>
          </div>
        </div>

        {/* Quick Ayush Formulary & Ashtavidha Tools */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ayush Formulary & Ashtavidha Tools</span>
            </h3>
            <button 
              onClick={onNewCase}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              + Open Case Sheet
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Guggulu Kalpa</span>
              <span className="font-bold text-slate-900 block mt-0.5">Yograj Guggulu</span>
              <p className="text-[10px] text-slate-500">Joint pain, Vata roga, Sandhigata Vata</p>
            </div>

            <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100">
              <span className="text-[10px] font-bold text-teal-800 uppercase block">Rasayana Kalpa</span>
              <span className="font-bold text-slate-900 block mt-0.5">Ashwagandha Churna</span>
              <p className="text-[10px] text-slate-500">Balya, Ojovardhaka, Anidra</p>
            </div>

            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Arishta / Asava</span>
              <span className="font-bold text-slate-900 block mt-0.5">Dashamoolarishta</span>
              <p className="text-[10px] text-slate-500">Vata hara, Shoolaprashamana</p>
            </div>

            <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Pariksha Guide</span>
              <span className="font-bold text-slate-900 block mt-0.5">Nadi & Jihva Assessment</span>
              <p className="text-[10px] text-slate-500">Vata/Pitta/Kapha Nadi pulse rhythm</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
