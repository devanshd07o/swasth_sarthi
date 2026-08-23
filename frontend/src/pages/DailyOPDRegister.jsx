import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Search, Calendar, Clock, ShieldCheck, 
  ArrowUpRight, FileText, CheckCircle2, RefreshCw 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDoctorPatients } from '../services/api';

export default function DailyOPDRegister({ 
  onSelectPatient, 
  onOpenCaseSheet, 
  currentDoctorId = "DOC-AYUR-101", 
  currentUser, 
  lang = 'en' 
}) {
  const { t } = useTranslation();
  const [historySearch, setHistorySearch] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [historyDay, setHistoryDay] = useState('ALL');
  const [loading, setLoading] = useState(true);

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
    loadCompletedRegister();
  }, [currentDoctorId]);

  const loadCompletedRegister = async () => {
    setLoading(true);
    try {
      const backendCompleted = await getDoctorPatients(currentDoctorId, '', 'completed').catch(() => []);
      if (backendCompleted && backendCompleted.length > 0) {
        const mapped = backendCompleted.map(cp => ({
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
          const newItems = mapped.filter(item => !existingIds.has(item.patient_id));
          const merged = [...newItems, ...prev];
          try {
            localStorage.setItem('ss_completed_records', JSON.stringify(merged));
          } catch (_) {}
          return merged;
        });
      }
    } catch (e) {
      console.error('Failed to load completed register', e);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4 animate-fade-in">
      
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              Hospital OPD Archives
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Per-Day Attended Consultation Register
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-700" />
            <span>Daily Patient History & Completed OPD Register</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={loadCompletedRegister}
          className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Register</span>
        </button>
      </div>

      {/* Main Register Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Attended Consultations Log</span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {filteredHistory.length} Attended Records
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Filter by Date, Day of Week, Patient Name, ABHA ID or Diagnosis.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setHistorySearch('');
              setHistoryDate('');
              setHistoryDay('ALL');
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline shrink-0 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>

        {/* Search & Multi-Filter Control Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
          
          {/* 1. Name & ABHA Search */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search Name or ABHA ID..."
              className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full"
            />
          </div>

          {/* 2. Specific Date Picker */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
            />
          </div>

          {/* 3. Day of Week Dropdown Filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4 text-teal-700 shrink-0" />
            <select
              value={historyDay}
              onChange={(e) => setHistoryDay(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full cursor-pointer"
            >
              <option value="ALL">All Days of Week</option>
              <option value="Sunday">Sunday</option>
              <option value="Saturday">Saturday</option>
              <option value="Friday">Friday</option>
              <option value="Thursday">Thursday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Monday">Monday</option>
            </select>
          </div>

        </div>

        {/* Filtered Patient Cards Grid */}
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No completed consultation records found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((item, hIdx) => (
              <div
                key={hIdx}
                className="p-4 bg-white hover:bg-emerald-50/20 rounded-2xl border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-emerald-300"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{item.name}</span>
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                      {item.abha_id}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    📅 {item.day || 'Day'}, {item.date}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="font-semibold text-slate-800">
                    <span className="text-slate-500 font-medium">Diagnosis: </span>
                    {item.diagnosis}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                    <span className="text-slate-400 font-medium">Regimen: </span>
                    {item.regimen}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    ✓ ABDM Signed & Archived
                  </span>

                  <div className="flex items-center gap-2">
                    {onOpenCaseSheet && (
                      <button
                        type="button"
                        onClick={() => onOpenCaseSheet(item.patient_id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Open Case Sheet</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
