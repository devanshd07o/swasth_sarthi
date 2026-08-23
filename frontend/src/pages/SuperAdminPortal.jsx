import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Building2,
  Activity,
  FileText,
  TrendingUp,
  Search,
  ChevronUp,
  ChevronDown,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Settings,
} from 'lucide-react';

export default function SuperAdminPortal() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const stats = [
    {
      key: 'totalHospitals',
      label: t('admin.statTotalHospitals', 'Total Connected Hospitals'),
      val: '5,420',
      desc: t('admin.statTotalHospitalsDesc', 'Pan-India Ayush Registry'),
      icon: Building2,
    },
    {
      key: 'caseSheets',
      label: t('admin.statCaseSheets', 'Digital Case Sheets'),
      val: '1.2M',
      desc: t('admin.statCaseSheetsDesc', 'AyurSaarthi Records'),
      icon: FileText,
    },
    {
      key: 'emergencyNodes',
      label: t('admin.statEmergencyNodes', 'Active Emergency Nodes'),
      val: '840',
      desc: t('admin.statEmergencyNodesDesc', 'MedRoute Dispatch Units'),
      icon: Activity,
    },
    {
      key: 'aiAccuracy',
      label: t('admin.statAiAccuracy', 'AI Accuracy Rating'),
      val: '99.4%',
      desc: t('admin.statAiAccuracyDesc', 'Bilingual Triage & Summaries'),
      icon: TrendingUp,
    },
  ];

  const hospitalRegistry = [
    { id: 'AYUSH-DEL-01', name: 'All India Institute of Ayurveda (AIIA)', city: 'New Delhi', beds: 250, icu: 30, status: 'Active' },
    { id: 'AYUSH-DEL-02', name: 'Safdarjung Hospital AYUSH Wing', city: 'New Delhi', beds: 180, icu: 15, status: 'Active' },
    { id: 'AYUSH-GUR-01', name: 'Fortis Research Institute AYUSH OPD', city: 'Gurugram', beds: 120, icu: 20, status: 'Active' },
    { id: 'AYUSH-NOI-01', name: 'Metro Hospital AYUSH Center', city: 'Noida', beds: 90, icu: 10, status: 'Active' },
    { id: 'AYUSH-MUM-01', name: 'Tilak Ayurved Mahavidyalaya', city: 'Mumbai', beds: 310, icu: 40, status: 'Active' },
    { id: 'AYUSH-CHN-01', name: 'Govt. Ayurvedic Hospital Chennai', city: 'Chennai', beds: 200, icu: 25, status: 'Active' },
  ];

  const activityLog = [
    {
      id: 1,
      icon: UserCheck,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      title: t('admin.activityNewHospital', 'New hospital onboarded to Ayush registry'),
      meta: 'AYUSH-BLR-04 \u2022 Bengaluru',
      time: t('admin.activityTime1', '2 hours ago'),
    },
    {
      id: 2,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      title: t('admin.activityComplianceAlert', 'Compliance audit flagged \u2014 ICU data missing'),
      meta: 'AYUSH-HYD-02 \u2022 Hyderabad',
      time: t('admin.activityTime2', '5 hours ago'),
    },
    {
      id: 3,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      title: t('admin.activityBulkSync', 'Bulk ABDM sync completed \u2014 1,240 records'),
      meta: t('admin.activitySyncRegion', 'Rajasthan Region'),
      time: t('admin.activityTime3', '1 day ago'),
    },
    {
      id: 4,
      icon: Settings,
      iconColor: 'text-slate-500',
      iconBg: 'bg-slate-100',
      title: t('admin.activitySystemUpdate', 'MedRoute scoring engine updated to v3.2'),
      meta: t('admin.activitySystemAdmin', 'Ministry Systems Admin'),
      time: t('admin.activityTime4', '2 days ago'),
    },
  ];

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronUp className="w-3 h-3 text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-violet-600" />
      : <ChevronDown className="w-3 h-3 text-violet-600" />;
  };

  const filtered = hospitalRegistry
    .filter(
      (h) =>
        h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortCol === 'beds') return (a.beds - b.beds) * dir;
      if (sortCol === 'icu') return (a.icu - b.icu) * dir;
      return (a[sortCol] ?? '').localeCompare(b[sortCol] ?? '') * dir;
    });

  const thClass = () => `p-3 cursor-pointer select-none hover:text-violet-700 transition-colors`;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200 tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            {t('admin.bannerPill', 'Ministry of Ayush \u2022 Super Admin Command Center')}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-violet-600" />
            <span>{t('admin.bannerTitle', 'National AYUSH Healthcare Analytics & Registry')}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            {t(
              'admin.bannerSubtitle',
              'Nationwide monitoring of AyurSaarthi digital consultations, MedRoute emergency dispatch, and hospital compliance.'
            )}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{s.label}</span>
                <span className="p-1.5 bg-violet-50 rounded-lg">
                  <Icon className="w-3.5 h-3.5 text-violet-600" />
                </span>
              </div>
              <p className="text-2xl font-bold text-violet-600">{s.val}</p>
              <span className="text-[11px] text-slate-500 font-medium">{s.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Hospital Registry Audit Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-600" />
            {t('admin.registryTitle', 'National Hospital Registry & Compliance Audit')}
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.registrySearch', 'Search Hospital / Code...')}
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 w-52 focus:outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                {[
                  { col: 'id', label: t('admin.colRegistryId', 'Registry ID') },
                  { col: 'name', label: t('admin.colHospitalName', 'Hospital Name') },
                  { col: 'city', label: t('admin.colCity', 'City') },
                  { col: 'beds', label: t('admin.colBeds', 'AYUSH Beds') },
                  { col: 'icu', label: t('admin.colIcu', 'ICU Units') },
                  { col: 'status', label: t('admin.colStatus', 'Status') },
                ].map(({ col, label }) => (
                  <th key={col} className={thClass()} onClick={() => handleSort(col)}>
                    <span className="flex items-center gap-1">
                      {label} <SortIcon col={col} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-slate-800">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-bold text-violet-600">{h.id}</td>
                  <td className="p-3 font-bold text-slate-900">{h.name}</td>
                  <td className="p-3 text-slate-500">{h.city}</td>
                  <td className="p-3">{h.beds} {t('admin.bedsSuffix', 'beds')}</td>
                  <td className="p-3">{h.icu} {t('admin.unitsSuffix', 'units')}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 text-[11px]">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {t('admin.statusActive', h.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                    {t('admin.noResults', 'No hospitals match your search.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-600" />
          {t('admin.activityTitle', 'Recent Activity Log')}
        </h3>

        <div className="space-y-3">
          {activityLog.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <span className={`p-2 rounded-xl ${item.iconBg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-snug">{item.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.meta}</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap flex-shrink-0 flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
