import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Plus, Calendar, ChevronRight } from 'lucide-react';
import { getPatients } from '../services/api';

export default function PatientDirectory({ onSelectPatient, onNewCase }) {
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
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Ayurvedic Patient Directory</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Search and retrieve longitudinal medical records by Name, UHID, or Contact Number.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name / UHID..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 w-56 shadow-xs"
            />
          </div>

          <button
            onClick={onNewCase}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Consultation</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          Loading patients database...
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No matching patients found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patients.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 rounded-3xl transition-all space-y-3 shadow-xs group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {p.uhid}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {p.gender.toUpperCase()} • {p.age} yrs • Blood: {p.blood_group || 'O+'}
                  </p>
                </div>

                <button
                  onClick={() => onSelectPatient(p.id)}
                  className="p-2 bg-slate-100 group-hover:bg-emerald-600 text-slate-600 group-hover:text-white rounded-xl transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 font-medium space-y-1 border-t border-slate-100 pt-2">
                <p><span className="text-slate-400">Contact:</span> {p.contact}</p>
                {p.address && <p><span className="text-slate-400">Address:</span> {p.address}</p>}
                {p.medical_history && (
                  <p className="text-amber-800 text-[11px] pt-1 font-semibold">
                    <span className="text-amber-600 font-bold">History:</span> {p.medical_history}
                  </p>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  Registered: {new Date(p.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => onSelectPatient(p.id)}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  View Timeline & Consultations →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
