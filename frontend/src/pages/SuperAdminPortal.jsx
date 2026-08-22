import React from 'react';
import { ShieldCheck, Building2, Activity, FileText, CheckCircle2, TrendingUp, Search } from 'lucide-react';

export default function SuperAdminPortal() {
  const stats = [
    { label: "Total Connected Hospitals", val: "5,420", desc: "Pan-India Ayush Registry" },
    { label: "Digital Case Sheets", val: "1.2M", desc: "AyurSaarthi Records" },
    { label: "Active Emergency Nodes", val: "840", desc: "MedRoute Dispatch Units" },
    { label: "AI Accuracy Rating", val: "99.4%", desc: "Bilingual Triage & Summaries" },
  ];

  const hospitalRegistry = [
    { id: "AYUSH-DEL-01", name: "All India Institute of Ayurveda (AIIA)", city: "New Delhi", beds: 250, icu: 30, status: "Active" },
    { id: "AYUSH-DEL-02", name: "Safdarjung Hospital AYUSH Wing", city: "New Delhi", beds: 180, icu: 15, status: "Active" },
    { id: "AYUSH-GUR-01", name: "Fortis Research Institute AYUSH OPD", city: "Gurugram", beds: 120, icu: 20, status: "Active" },
    { id: "AYUSH-NOI-01", name: "Metro Hospital AYUSH Center", city: "Noida", beds: 90, icu: 10, status: "Active" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Ministry of Ayush • Super Admin Command Center
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <span>National AYUSH Healthcare Analytics & Registry</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Nationwide monitoring of AyurSaarthi digital consultations, MedRoute emergency dispatch, and hospital compliance.
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500">{s.label}</span>
            <p className="text-2xl font-black text-slate-900">{s.val}</p>
            <span className="text-[11px] text-purple-700 font-bold">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Hospital Registry Audit Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>National Hospital Registry & Compliance Audit</span>
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Hospital / Code..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 w-48 shadow-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Hospital Registry ID</th>
                <th className="p-3">Hospital Name</th>
                <th className="p-3">City / Location</th>
                <th className="p-3">AYUSH Beds</th>
                <th className="p-3">ICU Units</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {hospitalRegistry.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-purple-700">{h.id}</td>
                  <td className="p-3 font-bold text-slate-900">{h.name}</td>
                  <td className="p-3 text-slate-500">{h.city}</td>
                  <td className="p-3">{h.beds} beds</td>
                  <td className="p-3">{h.icu} units</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200">
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
