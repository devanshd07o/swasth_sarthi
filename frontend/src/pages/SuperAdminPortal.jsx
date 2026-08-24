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
  Stethoscope,
  Ambulance,
  Phone,
  Mail,
  Award,
  Users,
  MapPin,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function SuperAdminPortal({ initialTab = 'hospitals' }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab); // 'hospitals' | 'doctors' | 'medroute' | 'audit'

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const loggedInOfficer = {
    name: 'Shri Rakesh Varma',
    emp_id: 'AYUSH-EMP-9001',
    designation: 'Senior Director, SIH & ABDM Integration Cell',
    ministry: 'Ministry of Ayush, Government of India',
    email: 'rakesh.varma@ayush.gov.in',
    contact: '+91 9811002233'
  };

  const stats = [
    {
      key: 'totalHospitals',
      label: t('admin.statTotalHospitals', 'Connected Ayush Hospitals'),
      val: '5,420',
      desc: t('admin.statTotalHospitalsDesc', 'Pan-India Ayush Registry'),
      icon: Building2,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      key: 'totalDoctors',
      label: 'Verified Vaidya Practitioners',
      val: '14,850',
      desc: 'NCISM & State Ayush Reg Verified',
      icon: Stethoscope,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      key: 'caseSheets',
      label: t('admin.statCaseSheets', 'Digital Case Sheets'),
      val: '1.24M',
      desc: t('admin.statCaseSheetsDesc', 'AyurSaarthi ABDM Records'),
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      key: 'emergencyNodes',
      label: t('admin.statEmergencyNodes', 'Active MedRoute Mobile Fleet'),
      val: '840',
      desc: t('admin.statEmergencyNodesDesc', 'GPS & Tele-Ayush Mobile Response'),
      icon: Ambulance,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
  ];

  const hospitalRegistry = [
    { id: 'AYUSH-DEL-01', name: 'All India Institute of Ayurveda (AIIA)', city: 'New Delhi', state: 'Delhi', beds: 250, icu: 30, status: 'Active', abdm_sync: '100% Compliant' },
    { id: 'AYUSH-RAJ-01', name: 'National Institute of Ayurveda (NIA)', city: 'Jaipur', state: 'Rajasthan', beds: 320, icu: 35, status: 'Active', abdm_sync: '99.8% Compliant' },
    { id: 'AYUSH-UP-01', name: 'Faculty of Ayurveda, BHU', city: 'Varanasi', state: 'Uttar Pradesh', beds: 280, icu: 25, status: 'Active', abdm_sync: '100% Compliant' },
    { id: 'AYUSH-GUJ-01', name: 'ITRA Institute of Teaching & Research', city: 'Jamnagar', state: 'Gujarat', beds: 210, icu: 20, status: 'Active', abdm_sync: '98.4% Compliant' },
    { id: 'AYUSH-KER-01', name: 'Govt. Ayurveda College & Hospital', city: 'Thiruvananthapuram', state: 'Kerala', beds: 350, icu: 40, status: 'Active', abdm_sync: '100% Compliant' },
    { id: 'AYUSH-MUM-01', name: 'Tilak Ayurved Mahavidyalaya', city: 'Mumbai', state: 'Maharashtra', beds: 310, icu: 40, status: 'Active', abdm_sync: '99.2% Compliant' },
    { id: 'AYUSH-CHN-01', name: 'Govt. Ayurvedic Hospital Chennai', city: 'Chennai', state: 'Tamil Nadu', beds: 200, icu: 25, status: 'Active', abdm_sync: '97.6% Compliant' },
    { id: 'AYUSH-BLR-01', name: 'Government Ayurveda Medical College', city: 'Bengaluru', state: 'Karnataka', beds: 240, icu: 30, status: 'Active', abdm_sync: '100% Compliant' }
  ];

  const doctorRegistry = [
    { reg_no: 'AYUSH-REG-DEL-2012-4412', name: 'Dr. Rajesh Vaidya', qual: 'BAMS, MD (Kayachikitsa)', hospital: 'All India Institute of Ayurveda (AIIA)', city: 'New Delhi', active_opd: 18, status: 'Verified' },
    { reg_no: 'AYUSH-REG-RAJ-2015-1108', name: 'Dr. Ananya Shastri', qual: 'BAMS, MD (Ayurveda)', hospital: 'National Institute of Ayurveda (NIA)', city: 'Jaipur', active_opd: 12, status: 'Verified' },
    { reg_no: 'AYUSH-REG-UP-2010-8820', name: 'Dr. Vikramaditya Dev', qual: 'BAMS, MD (Shalya Tantra)', hospital: 'Faculty of Ayurveda, BHU', city: 'Varanasi', active_opd: 15, status: 'Verified' },
    { reg_no: 'AYUSH-REG-KER-2014-9901', name: 'Dr. Sudhir Nambiar', qual: 'BAMS, MD (Panchakarma)', hospital: 'Govt. Ayurveda College', city: 'Thiruvananthapuram', active_opd: 22, status: 'Verified' },
    { reg_no: 'AYUSH-REG-MAH-2018-3340', name: 'Dr. Meenakshi Sundaram', qual: 'BAMS, MD (Dravyaguna)', hospital: 'Tilak Ayurved Mahavidyalaya', city: 'Mumbai', active_opd: 10, status: 'Verified' }
  ];

  const medrouteFleet = [
    { unit_id: 'MED-DEL-01', hospital: 'AIIA New Delhi', location: 'Sarita Vihar, New Delhi', type: 'Advanced Life Support (ALS)', status: 'On Duty', active_call: 'Patient Emergency Dispatch to Safdarjung' },
    { unit_id: 'MED-RAJ-04', hospital: 'NIA Jaipur', location: 'Amer Road, Jaipur', type: 'Ayush Tele-Triage Unit', status: 'Available', active_call: 'Standby' },
    { unit_id: 'MED-UP-02', hospital: 'BHU Varanasi', location: 'Lanka Crossing, Varanasi', type: 'ICU Critical Transport', status: 'On Duty', active_call: 'Trauma Triage Patient Transfer' },
    { unit_id: 'MED-KER-08', hospital: 'Govt Ayurveda College', location: 'MG Road, Trivandrum', type: 'Panchakarma Mobile Care', status: 'Available', active_call: 'Standby' }
  ];

  const activityLog = [
    {
      id: 1,
      icon: UserCheck,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      title: 'New Ayush Multi-Specialty Center onboarded to Central Registry',
      meta: 'AYUSH-BLR-04 • Bengaluru • ABDM M3 Certified',
      time: '2 hours ago',
    },
    {
      id: 2,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      title: 'MedRoute ICU Node compliance audit flagged — GPS telemetry update required',
      meta: 'AYUSH-HYD-02 • Hyderabad Command Node',
      time: '5 hours ago',
    },
    {
      id: 3,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      title: 'Bulk ABDM Health Pass sync completed successfully — 1,240 records updated',
      meta: 'Rajasthan Regional Ayush Registry',
      time: '1 day ago',
    },
    {
      id: 4,
      icon: Settings,
      iconColor: 'text-slate-500',
      iconBg: 'bg-slate-100',
      title: 'AyurSaarthi AI Ashtavidha Clinical Scoring Engine updated to v3.4',
      meta: 'Ministry System Architecture Division',
      time: '2 days ago',
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

  const filteredHospitals = hospitalRegistry
    .filter(
      (h) =>
        h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortCol === 'beds') return (a.beds - b.beds) * dir;
      if (sortCol === 'icu') return (a.icu - b.icu) * dir;
      return (a[sortCol] ?? '').localeCompare(b[sortCol] ?? '') * dir;
    });

  const filteredDoctors = doctorRegistry.filter(
    (d) =>
      d.reg_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800">

      {/* ─── Ministry Officer Identity Banner ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-slate-700/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Ministry of Ayush • National Command Portal
              </span>
              <span className="font-mono text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                GOVT OFFICER ID: {loggedInOfficer.emp_id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>{loggedInOfficer.name}</span>
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
            </h1>

            <p className="text-xs font-semibold text-slate-300">
              {loggedInOfficer.designation} • <span className="text-emerald-400">{loggedInOfficer.ministry}</span>
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700 space-y-1.5 text-[11px] font-medium text-slate-300 shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{loggedInOfficer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{loggedInOfficer.contact}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-[10px] uppercase tracking-wider pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Central Grid: Live Sync Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Pan-India KPI Metrics Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-5 space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700">{s.label}</span>
                <span className={`p-2 rounded-xl ${s.bgColor}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </span>
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold font-display ${s.color}`}>{s.val}</p>
              <span className="text-[11px] text-slate-500 font-semibold block">{s.desc}</span>
            </div>
          );
        })}
      </div>

      {/* ─── Navigation Sub-Tabs ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('hospitals')}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'hospitals'
              ? 'bg-white text-violet-900 shadow-sm border border-violet-200'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <Building2 className="w-4 h-4 text-violet-600" />
          <span>Ayush Hospital Registry ({hospitalRegistry.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'doctors'
              ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-emerald-600" />
          <span>Vaidya Practitioner Directory ({doctorRegistry.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medroute')}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'medroute'
              ? 'bg-white text-rose-900 shadow-sm border border-rose-200'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <Ambulance className="w-4 h-4 text-rose-600" />
          <span>MedRoute Emergency Fleet ({medrouteFleet.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
              : 'text-slate-600 hover:bg-white/50'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-600" />
          <span>ABDM Compliance Audit Log</span>
        </button>
      </div>

      {/* ─── TAB 1: HOSPITAL REGISTRY ───────────────────────────────────────── */}
      {activeTab === 'hospitals' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-600" />
                <span>Pan-India Ayush Medical Institute & Hospital Registry</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Authorized Ayush healthcare facilities linked with ABDM M2/M3 digital health record sync.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Hospital, City or State..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Hospital ID</th>
                  <th className="p-3.5">Institution Name</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 text-center">Panchakarma Suites</th>
                  <th className="p-3.5 text-center">Therapy Suites</th>
                  <th className="p-3.5">ABDM Sync</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredHospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-violet-700">{h.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{h.name}</td>
                    <td className="p-3.5 text-slate-600">{h.city}, {h.state}</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">{h.beds}</td>
                    <td className="p-3.5 text-center font-bold text-slate-900">{h.icu}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {h.abdm_sync}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 text-[11px]">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: VAIDYA PRACTITIONER DIRECTORY ─────────────────────────────── */}
      {activeTab === 'doctors' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>National Ayush Vaidya Practitioner Registry</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Verified Ayurvedic clinical practitioners registered with State Ayush Council / NCISM India.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Doctor, Reg No or City..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">State Council Reg No</th>
                  <th className="p-3.5">Doctor Name & Qualification</th>
                  <th className="p-3.5">Attached Institution</th>
                  <th className="p-3.5">City</th>
                  <th className="p-3.5 text-center">Live Queue</th>
                  <th className="p-3.5">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredDoctors.map((d) => (
                  <tr key={d.reg_no} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-emerald-800">{d.reg_no}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{d.name}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">{d.qual}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{d.hospital}</td>
                    <td className="p-3.5 text-slate-600">{d.city}</td>
                    <td className="p-3.5 text-center">
                      <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {d.active_opd} Patients
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold border border-emerald-200 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MEDROUTE EMERGENCY FLEET ─────────────────────────────────── */}
      {activeTab === 'medroute' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-rose-600" />
                <span>MedRoute GPS Telemetry & Emergency ICU Fleet</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time critical triage ambulance dispatch & emergency referral node monitor.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              Live Emergency Node Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medrouteFleet.map((unit) => (
              <div key={unit.unit_id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-lg border border-rose-200">
                    {unit.unit_id}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    unit.status === 'On Duty'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {unit.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{unit.hospital}</h4>
                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {unit.location}
                </p>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500">{unit.type}</span>
                  <span className="font-bold text-slate-900">{unit.active_call}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: SYSTEM AUDIT LOG ────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 space-y-4 animate-fade-in">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <span>National ABDM System Compliance & Audit Log</span>
          </h3>

          <div className="space-y-3">
            {activityLog.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <span className={`p-2.5 rounded-xl ${item.iconBg} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{item.meta}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
