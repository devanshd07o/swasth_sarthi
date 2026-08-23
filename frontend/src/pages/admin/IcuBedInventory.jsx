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
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            Critical Care Capacity Module
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">ICU & Bed Inventory Capacity Fleet</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time telemetry monitor of Ayush hospital beds, critical care ICU units, and ventilator availability.
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
          <span className="text-xs font-bold text-slate-500 uppercase">Total Ayush Beds Grid</span>
          <p className="text-3xl font-black text-slate-900">1,510 Beds</p>
          <p className="text-[11px] font-semibold text-emerald-700">1,268 Currently Occupied (83.9%)</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">National ICU Fleet</span>
          <p className="text-3xl font-black text-teal-700">170 Units</p>
          <p className="text-[11px] font-semibold text-teal-800">38 ICU Beds Instantly Available</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Ventilators</span>
          <p className="text-3xl font-black text-violet-700">69 Ventilators</p>
          <p className="text-[11px] font-semibold text-violet-800">Operational & ABDM Telemetry Sync</p>
        </div>
      </div>

      {/* ─── Capacity Grid Table ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-teal-600" />
            <span>Hospital-Wise Bed & ICU Capacity Status</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Hospital Name</th>
                <th className="p-4 text-center">Total Beds</th>
                <th className="p-4 text-center">Occupied Beds</th>
                <th className="p-4 text-center">Total ICU</th>
                <th className="p-4 text-center">Available ICU</th>
                <th className="p-4 text-center">Ventilators</th>
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
