import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  BedDouble,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Leaf
} from 'lucide-react';

export default function PanchakarmaBedInventory() {
  const { t } = useTranslation();

  const inventory = [
    { hospital: t('admin.hospAiiA', 'All India Institute of Ayurveda (AIIA), New Delhi'), ipd_beds: 250, occupied_ipd: 198, panchakarma_suites: 24, active_therapies: 18, rasayana_stock: '100% Stocked', status: t('common.normalOps', 'Normal Operations') },
    { hospital: t('admin.hospNia', 'National Institute of Ayurveda (NIA), Jaipur'), ipd_beds: 320, occupied_ipd: 265, panchakarma_suites: 30, active_therapies: 24, rasayana_stock: '98% Stocked', status: t('common.normalOps', 'Normal Operations') },
    { hospital: t('admin.hospBhu', 'Faculty of Ayurveda, BHU, Varanasi'), ipd_beds: 280, occupied_ipd: 240, panchakarma_suites: 20, active_therapies: 17, rasayana_stock: '95% Stocked', status: t('common.highOccupancy', 'High Occupancy') },
    { hospital: t('admin.hospTrivandrum', 'Govt. Ayurveda College, Thiruvananthapuram'), ipd_beds: 350, occupied_ipd: 290, panchakarma_suites: 36, active_therapies: 28, rasayana_stock: '100% Stocked', status: t('common.normalOps', 'Normal Operations') },
    { hospital: t('admin.hospMumbai', 'Tilak Ayurved Mahavidyalaya, Mumbai'), ipd_beds: 310, occupied_ipd: 275, panchakarma_suites: 28, active_therapies: 22, rasayana_stock: '96% Stocked', status: t('common.normalOps', 'Normal Operations') }
  ];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Header Banner ──────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            {t('admin.ayushCapacityPill', 'AYUSH Inpatient & Panchakarma Module')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {t('admin.panchakarmaTitle', 'Panchakarma Suites & Ayush Inpatient Ward Capacity')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t('admin.panchakarmaSubtitle', 'Real-time telemetry monitor of Ayurvedic IPD beds, Panchakarma therapy suites, Shirodhara units & Rasayana herbal inventory.')}
          </p>
        </div>

        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          {t('admin.liveTelemetry', 'Therapy Grid Live')}
        </span>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-extrabold text-slate-500 uppercase">{t('admin.totalIpdBeds', 'Total Ayush IPD Beds')}</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">1,510 Beds</p>
          <p className="text-[11px] font-bold text-emerald-700">1,268 Currently Occupied (83.9%)</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-extrabold text-slate-500 uppercase">{t('admin.panchakarmaSuites', 'Panchakarma Therapy Suites')}</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">138 Suites</p>
          <p className="text-[11px] font-bold text-emerald-800">109 Active Therapy Sessions Today</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-xs font-extrabold text-slate-500 uppercase">{t('admin.herbInventory', 'Rasayana & Herb Stock')}</span>
          <p className="text-2xl sm:text-3xl font-black text-teal-700">98.8% Stocked</p>
          <p className="text-[11px] font-bold text-teal-800">Central Ayush Medicine Supply Synchronized</p>
        </div>
      </div>

      {/* ─── Capacity Grid Table ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-emerald-600" />
            <span>{t('admin.hospitalCapacityStatus', 'Hospital-Wise Ayush IPD & Panchakarma Status')}</span>
          </h3>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5 sm:p-4">{t('admin.thHospital', 'Hospital Name')}</th>
                <th className="p-3.5 sm:p-4 text-center">{t('admin.thIpdBeds', 'Total IPD Beds')}</th>
                <th className="p-3.5 sm:p-4 text-center">{t('admin.thOccupied', 'Occupied IPD')}</th>
                <th className="p-3.5 sm:p-4 text-center">{t('admin.thTherapySuites', 'Panchakarma Suites')}</th>
                <th className="p-3.5 sm:p-4 text-center">{t('admin.thActiveTherapies', 'Active Therapies')}</th>
                <th className="p-3.5 sm:p-4">{t('admin.thRasayanaStock', 'Rasayana Inventory')}</th>
                <th className="p-3.5 sm:p-4">{t('admin.thStatus', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {inventory.map((item) => (
                <tr key={item.hospital} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-slate-900">{item.hospital}</td>
                  <td className="p-3.5 sm:p-4 text-center font-bold text-slate-900">{item.ipd_beds}</td>
                  <td className="p-3.5 sm:p-4 text-center font-bold text-slate-600">{item.occupied_ipd}</td>
                  <td className="p-3.5 sm:p-4 text-center font-bold text-emerald-700">{item.panchakarma_suites}</td>
                  <td className="p-3.5 sm:p-4 text-center">
                    <span className="font-extrabold text-emerald-900 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-200">
                      {item.active_therapies} Active
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 font-mono font-bold text-teal-700">{item.rasayana_stock}</td>
                  <td className="p-3.5 sm:p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-extrabold text-[11px] border ${
                      item.status.includes('High')
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status.includes('High') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
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
