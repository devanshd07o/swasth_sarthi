import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BedDouble,
  Ambulance,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function IcuBedInventory() {
  const { t } = useTranslation();

  const inventory = [
    { hospital: 'All India Institute of Ayurveda (AIIA), New Delhi', total_beds: 250, occupied_beds: 198, icu_total: 30, icu_available: 8, ventilators: 12, status: 'Normal Operations' },
    { hospital: 'National Institute of Ayurveda (NIA), Jaipur', total_beds: 320, occupied_beds: 265, icu_total: 35, icu_available: 6, ventilators: 15, status: 'Normal Operations' },
    { hospital: 'Faculty of Ayurveda, BHU, Varanasi', total_beds: 280, occupied_beds: 240, icu_total: 25, icu_available: 4, ventilators: 10, status: 'High Occupancy' },
    { hospital: 'Govt. Ayurveda College, Thiruvananthapuram', total_beds: 350, occupied_beds: 290, icu_total: 40, icu_available: 11, ventilators: 18, status: 'Normal Operations' },
    { hospital: 'Tilak Ayurved Mahavidyalaya, Mumbai', total_beds: 310, occupied_beds: 275, icu_total: 40, icu_available: 9, ventilators: 14, status: 'Normal Operations' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Header Banner ──────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            Long-Term Therapy Capacity Module
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Panchakarma & Therapy Suites Inventory</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time telemetry monitor of Ayush inpatient suites, Panchakarma therapy units, and Rasayana herbal inventory.
          </p>
        </div>

        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Tele-Capacity Live
        </span>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Ayush IPD Capacity</span>
          <p className="text-3xl font-black text-slate-900">1,510 Suites</p>
          <p className="text-[11px] font-semibold text-emerald-700">1,268 Currently Active (83.9%)</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Panchakarma Therapy Fleet</span>
          <p className="text-3xl font-black text-emerald-700">170 Suites</p>
          <p className="text-[11px] font-semibold text-emerald-800">38 Suites Instantly Available</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Rasayana & Shodhna Units</span>
          <p className="text-3xl font-black text-teal-700">69 Units</p>
          <p className="text-[11px] font-semibold text-teal-800">Operational & ABDM Telemetry Sync</p>
        </div>
      </div>

      {/* ─── Capacity Grid Table ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-emerald-600" />
            <span>Hospital-Wise Panchakarma & Therapy Capacity Status</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Hospital Name</th>
                <th className="p-4 text-center">IPD Capacity</th>
                <th className="p-4 text-center">Active Inpatients</th>
                <th className="p-4 text-center">Panchakarma Suites</th>
                <th className="p-4 text-center">Available Suites</th>
                <th className="p-4 text-center">Rasayana Units</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {inventory.map((item) => (
                <tr key={item.hospital} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{item.hospital}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{item.total_beds}</td>
                  <td className="p-4 text-center font-bold text-slate-600">{item.occupied_beds}</td>
                  <td className="p-4 text-center font-bold text-teal-700">{item.icu_total}</td>
                  <td className="p-4 text-center">
                    <span className="font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {item.icu_available} Available
                    </span>
                  </td>
                  <td className="p-4 text-center font-bold text-violet-700">{item.ventilators}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-[11px] border ${
                      item.status === 'High Occupancy'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'High Occupancy' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {item.status}
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
