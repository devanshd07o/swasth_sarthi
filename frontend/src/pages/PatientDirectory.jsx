import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Plus, Calendar, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPatients } from '../services/api';

export default function PatientDirectory({ onSelectPatient, onNewCase }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const list = await getPatients(search);
      setPatients(list);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-2 space-y-4">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>{t('directory.title', 'Ayurvedic Patient Directory')}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">{t('directory.subtitle', 'Search and retrieve records.')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('directory.searchPlaceholder', 'Search Name / UHID...')}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 w-56 shadow-sm"
            />
          </div>

          <button
            onClick={onNewCase}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('directory.newConsultation', 'New Consultation')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-medium">
          {t('directory.loading', 'Loading patients database...')}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-500 text-xs font-medium">
          {t('directory.noPatients', 'No matching patients found.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-300 rounded-2xl transition-all space-y-3 shadow-sm group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {p.uhid}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {p.gender.toUpperCase()} • {p.age} yrs • Blood: {p.blood_group || 'O+'}
                  </p>
                </div>

                <button
                  onClick={() => onSelectPatient(p.id)}
                  className="p-2 bg-slate-50 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white rounded-xl transition-all cursor-pointer border border-slate-100 group-hover:border-emerald-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 font-medium space-y-1 border-t border-slate-100 pt-2">
                <p><span className="text-slate-500 font-semibold">{t('directory.contact', 'Contact:')} </span>{p.contact}</p>
                {p.address && <p><span className="text-slate-500 font-semibold">{t('directory.address', 'Address:')} </span>{p.address}</p>}
                {p.medical_history && (
                  <p className="text-slate-700 text-[11px] pt-1 font-semibold bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                    <span className="text-slate-500">{t('directory.history', 'History:')} </span>{p.medical_history}
                  </p>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {t('directory.registered', 'Registered:')} {new Date(p.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onSelectPatient(p.id)}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {t('directory.viewTimeline', 'View Timeline & Consultations')} →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
