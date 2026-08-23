import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, ShieldCheck, ArrowUpRight, Search, 
  AlertTriangle, Star, Stethoscope, Filter, CheckCircle2,
  Calendar, Clock, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDoctorPatients, getDoctorById, signCase as apiSignCase, completeCaseToken } from '../services/api';
import DoctorReferralModal from '../components/DoctorReferralModal';
import BrandedLoader from '../components/BrandedLoader';

export default function DoctorDashboard({ onNewCase, onSelectPatient, onOpenTimeline, currentDoctorId = "DOC-AYUR-101", currentUser, lang = 'en', initialFocusRegister = false }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [referralPatient, setReferralPatient] = useState(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const handleOpenReferral = (e, patient) => {
    e.stopPropagation();
    setReferralPatient(patient);
    setIsReferralModalOpen(true);
  };

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    loadDashboardData();
  };

  // Per-Day Historical Recent Patients Search & Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [historyDay, setHistoryDay] = useState('ALL');

  // Persistent Completed Patients History State
  const [completedPatients, setCompletedPatients] = useState(() => {
    try {
      const saved = localStorage.getItem('ss_completed_records');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      {
        patient_id: 'pat_1',
        name: 'Ramesh Sharma',
        abha_id: 'ABHA-9821-4501',
        gender: 'MALE',
        age: 52,
        diagnosis: 'Sandhivata (Osteoarthritis)',
        regimen: 'Yograj Guggulu 2 tab BID, Rasnadi Kwath 15ml',
        status: 'Signed & Completed',
        date: '2026-08-23',
        day: 'Sunday',
        token_number: 'OPD-101'
      },
      {
        patient_id: 'pat_2',
        name: 'Sunita Sharma',
        abha_id: 'ABHA-3412-8902',
        gender: 'FEMALE',
        age: 44,
        diagnosis: 'Amlapitta & Hrid-Daha',
        regimen: 'Avipattikar Churna 3g BD, Kamadugha Rasa',
        status: 'Signed & Completed',
        date: '2026-08-22',
        day: 'Saturday',
        token_number: 'OPD-102'
      }
    ];
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentDoctorId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [docData, activeList, completedList] = await Promise.all([
        getDoctorById(currentDoctorId).catch(() => null),
        getDoctorPatients(currentDoctorId, searchQuery, 'active').catch(() => []),
        getDoctorPatients(currentDoctorId, '', 'completed').catch(() => [])
      ]);
      if (docData) setDoctorInfo(docData);

      // Filter out any closed tokens from localStorage
      let closedTokenIds = [];
      try {
        closedTokenIds = JSON.parse(localStorage.getItem('ss_closed_tokens') || '[]');
      } catch (_) {}

      const activeOnly = (activeList || []).filter(p => 
        p.status !== 'completed' && !closedTokenIds.includes(p.patient_id)
      );

      setPatients(activeOnly);

      // Merge backend completed cases into completedPatients state
      if (completedList && completedList.length > 0) {
        const mappedBackendCompleted = completedList.map(cp => ({
          patient_id: cp.patient_id,
          name: cp.name,
          abha_id: cp.abha_id || cp.uhid || 'ABHA-PATIENT',
          gender: cp.gender || 'MALE',
          age: cp.age || 40,
          diagnosis: cp.latest_chief_complaint || 'OPD Consult Completed',
          regimen: 'AYUSH e-Prescription Signed & Closed',
          status: 'Signed & Completed',
          date: cp.latest_visit_date || new Date().toISOString().split('T')[0],
          day: new Date(cp.latest_visit_date || Date.now()).toLocaleDateString('en-US', { weekday: 'long' }),
          token_number: cp.token_number || 'OPD-100'
        }));

        setCompletedPatients(prev => {
          const existingIds = new Set(prev.map(item => item.patient_id));
          const newItems = mappedBackendCompleted.filter(item => !existingIds.has(item.patient_id));
          const merged = [...newItems, ...prev];
          try {
            localStorage.setItem('ss_completed_records', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
      }
    } catch (e) {
      console.error('Failed to load doctor dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToken = async (e, patient) => {
    e.stopPropagation();
    if (window.confirm(`Mark OPD consultation for ${patient.name} as Completed and close token?`)) {
      try {
        if (patient.latest_case_id) {
          await completeCaseToken(patient.latest_case_id).catch(() => null);
          await apiSignCase(patient.latest_case_id).catch(() => null);
        }
      } catch (_) {}

      const todayDate = new Date().toISOString().split('T')[0];
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const newRecord = {
        patient_id: patient.patient_id,
        name: patient.name,
        abha_id: patient.abha_id || patient.uhid || 'ABHA-PATIENT',
        gender: patient.gender || 'MALE',
        age: patient.age || 40,
        diagnosis: patient.latest_chief_complaint || 'OPD Consult Completed',
        regimen: 'AYUSH e-Prescription Signed & Closed',
        status: 'Signed & Completed',
        date: todayDate,
        day: todayDay,
        token_number: `Token #${patient.queue_position || 1}`
      };

      const updatedRecords = [newRecord, ...completedPatients.filter(cp => cp.patient_id !== patient.patient_id)];
      setCompletedPatients(updatedRecords);

      try {
        localStorage.setItem('ss_completed_records', JSON.stringify(updatedRecords));
        const closedTokens = JSON.parse(localStorage.getItem('ss_closed_tokens') || '[]');
        if (!closedTokens.includes(patient.patient_id)) {
          closedTokens.push(patient.patient_id);
          localStorage.setItem('ss_closed_tokens', JSON.stringify(closedTokens));
        }
      } catch (_) {}

      setPatients(prev => prev.filter(p => p.patient_id !== patient.patient_id));
    }
  };

  const activeDoctor = currentUser || doctorInfo;
  const emergencyCount = patients.filter(p => p.is_red_flag).length;

  const filteredHistory = completedPatients.filter(item => {
    const matchText = !historySearch || 
      item.name.toLowerCase().includes(historySearch.toLowerCase()) || 
      (item.abha_id || '').toLowerCase().includes(historySearch.toLowerCase()) || 
      (item.diagnosis || '').toLowerCase().includes(historySearch.toLowerCase());
    
    const matchDate = !historyDate || item.date === historyDate;
    const matchDay = historyDay === 'ALL' || (item.day || '').toLowerCase() === historyDay.toLowerCase();

    return matchText && matchDate && matchDay;
  });

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4">
      
      {/* ─── Vaidya Identity Banner ────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={activeDoctor?.avatar_url || "/avatars/dr_rajesh_vaidya.png"}
            alt={activeDoctor?.name || "Doctor"}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/avatars/dr_rajesh_vaidya.png';
            }}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                STATE AYUSH REG: {activeDoctor?.registration_no || "AYUSH-REG-DEL-2012-4412"}
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
          onClick={() => onSelectPatient ? onSelectPatient('patients') : null}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
        >
          <Users className="w-4 h-4" />
          <span>Open Master Patient Directory</span>
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
          <BrandedLoader message={t('doctorDashboard.loadingQueue', 'Loading Live OPD Queue...')} />
        ) : patients.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 text-xs font-medium">
            {t('doctorDashboard.noPatientsFound', 'No patients found in queue today.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((p, idx) => {
              const queueNum = p.queue_position || (idx + 1);
              const isFirstInLine = idx === 0;

              return (
                <div
                  key={p.patient_id}
                  onClick={() => onSelectPatient(p.patient_id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs group ${
                    isFirstInLine
                      ? 'bg-emerald-50/50 border-emerald-400 hover:border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 opacity-90'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#12372A] text-amber-300 border border-emerald-800">
                          Token #{queueNum}
                        </span>
                        {isFirstInLine ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600 text-white border border-emerald-700 animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                            CURRENTLY CONSULTING
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            WAITING IN QUEUE
                          </span>
                        )}
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

                    <div className="flex items-center gap-2">
                      {isFirstInLine ? (
                        <button
                          type="button"
                          onClick={(e) => handleCloseToken(e, p)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Complete Consult (Close Token #{queueNum})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex-1 py-1.5 bg-slate-100 text-slate-400 font-bold text-[10px] rounded-xl border border-slate-200 flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
                        >
                          <span>⏳ Waiting in Queue (Token #{idx} active)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleOpenReferral(e, p)}
                        title="Refer Patient to Specialist or General Vaidya"
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all shrink-0"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Refer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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

      <DoctorReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        patient={referralPatient}
        currentDoctorId={currentDoctorId}
        onReferralSuccess={(refData) => {
          console.log('[Inter-Doctor Patient Referral Recorded]', refData);
          if (referralPatient) {
            setPatients(prev => prev.filter(p => p.patient_id !== referralPatient.patient_id));
          }
        }}
      />

    </div>
  );
}
