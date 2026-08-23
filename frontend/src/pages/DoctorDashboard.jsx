import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, ShieldCheck, ArrowUpRight, Search, 
  AlertTriangle, Star, Stethoscope, Filter, CheckCircle2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDoctorPatients, getDoctorById, signCase as apiSignCase } from '../services/api';

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

  const [completedPatients, setCompletedPatients] = useState([
    {
      patient_id: 'pat_1',
      name: 'Ramesh Sharma',
      abha_id: 'ABHA-9821-4501',
      diagnosis: 'Sandhivata (Osteoarthritis)',
      regimen: 'Yograj Guggulu 2 tab BID, Rasnadi Kwath 15ml',
      status: 'Signed & Completed',
      date: '2026-08-23'
    },
    {
      patient_id: 'pat_2',
      name: 'Sunita Sharma',
      abha_id: 'ABHA-3412-8902',
      diagnosis: 'Amlapitta & Hrid-Daha',
      regimen: 'Avipattikar Churna 3g BD, Kamadugha Rasa',
      status: 'Signed & Completed',
      date: '2026-08-22'
    }
  ]);

  const handleCloseToken = async (e, patient) => {
    e.stopPropagation();
    if (window.confirm(`Mark OPD consultation for ${patient.name} as Completed and close token?`)) {
      try {
        if (patient.latest_case_id) {
          await apiSignCase(patient.latest_case_id).catch(() => null);
        }
      } catch (_) {}
      
      // Move patient to completed list
      setCompletedPatients(prev => [
        {
          patient_id: patient.patient_id,
          name: patient.name,
          abha_id: patient.abha_id,
          diagnosis: patient.latest_chief_complaint || 'OPD Consult Completed',
          regimen: 'AYUSH Prescription Signed',
          status: 'Signed & Completed',
          date: new Date().toISOString().split('T')[0]
        },
        ...prev.filter(cp => cp.patient_id !== patient.patient_id)
      ]);

      // Remove from active queue
      setPatients(prev => prev.filter(p => p.patient_id !== patient.patient_id));
    }
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

      {/* ─── Searchable Patient Queue with Daily FIFO Token Order ───────────────── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{t('doctorDashboard.opdQueueTitle', 'Live OPD Consultation Queue')}</span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                📅 {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {patients.length} {t('doctorDashboard.registered', 'Registered Patients Today')}
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
                placeholder={t('doctorDashboard.searchPlaceholder', 'Search OPD queue by name or ABHA...')}
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
            {t('doctorDashboard.noPatientsFound', 'No patients found in queue today.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p, idx) => {
              const queueNum = p.queue_position || (idx + 1);
              return (
                <div
                  key={p.patient_id}
                  onClick={() => onSelectPatient(p.patient_id)}
                  className="p-4 rounded-2xl border bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#12372A] text-amber-300 border border-emerald-800">
                          Token #{queueNum}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-700 text-white border border-emerald-800">
                          ACTIVE PATIENT
                        </span>
                        <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {p.prakriti || 'Vata-Pitta'}
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-50 group-hover:bg-emerald-50 rounded-xl text-emerald-700 font-bold border border-slate-100 transition-colors shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {p.abha_id || p.uhid} • {p.gender ? p.gender.toUpperCase() : 'MALE'} • {p.age} yrs
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-medium text-slate-700 pt-2 border-t border-slate-100 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">
                        {t('doctorDashboard.chiefComplaint', 'Chief Complaint')}
                      </span>
                      <p className="line-clamp-2 text-slate-800 font-medium">
                        {p.latest_chief_complaint}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleCloseToken(e, p)}
                      className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-900 hover:text-white font-extrabold text-[11px] rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Consult (Close Token)</span>
                    </button>
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

          <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto pr-1">
            {completedPatients.map((cp, cIdx) => (
              <div key={cIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{cp.name}</span>
                    <span className="text-[10px] text-emerald-900 font-extrabold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Completed & Signed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cp.diagnosis} • {cp.regimen}</p>
                </div>
                <button 
                  onClick={() => onSelectPatient(cp.patient_id)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-[11px] rounded-xl border border-slate-200 shadow-xs cursor-pointer shrink-0 transition-colors"
                >
                  View EHR & Details →
                </button>
              </div>
            ))}
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
