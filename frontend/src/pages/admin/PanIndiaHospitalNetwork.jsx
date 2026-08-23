import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  MapPin,
  BedDouble,
  Activity,
  X
} from 'lucide-react';

export default function PanIndiaHospitalNetwork() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);

  const [hospitals, setHospitals] = useState([
    { id: 'AYUSH-DEL-01', name: 'All India Institute of Ayurveda (AIIA)', city: 'New Delhi', state: 'Delhi', beds: 250, icu: 30, status: 'Active', abdm_sync: '100% Compliant' },
    { id: 'AYUSH-RAJ-01', name: 'National Institute of Ayurveda (NIA)', city: 'Jaipur', state: 'Rajasthan', beds: 320, icu: 35, status: 'Active', abdm_sync: '99.8% Compliant' },
    { id: 'AYUSH-UP-01', name: 'Faculty of Ayurveda, BHU', city: 'Varanasi', state: 'Uttar Pradesh', beds: 280, icu: 25, status: 'Active', abdm_sync: '100% Compliant' },
    { id: 'AYUSH-GUJ-01', name: 'ITRA Institute of Teaching & Research', city: 'Jamnagar', state: 'Gujarat', beds: 210, icu: 20, status: 'Active', abdm_sync: '98.4% Compliant' },
    { id: 'AYUSH-KER-01', name: 'Govt. Ayurveda College & Hospital', city: 'Thiruvananthapuram', state: 'Kerala', beds: 350, icu: 40, status: 'Active', abdm_sync: '100% Compliant' },
    { id: 'AYUSH-MUM-01', name: 'Tilak Ayurved Mahavidyalaya', city: 'Mumbai', state: 'Maharashtra', beds: 310, icu: 40, status: 'Active', abdm_sync: '99.2% Compliant' },
    { id: 'AYUSH-CHN-01', name: 'Govt. Ayurvedic Hospital Chennai', city: 'Chennai', state: 'Tamil Nadu', beds: 200, icu: 25, status: 'Active', abdm_sync: '97.6% Compliant' },
    { id: 'AYUSH-BLR-01', name: 'Government Ayurveda Medical College', city: 'Bengaluru', state: 'Karnataka', beds: 240, icu: 30, status: 'Active', abdm_sync: '100% Compliant' }
  ]);

  const [newHosp, setNewHosp] = useState({
    name: '',
    code: '',
    city: '',
    state: '',
    beds: 100,
    icu: 15
  });

  const handleAddHospital = (e) => {
    e.preventDefault();
    if (!newHosp.name || !newHosp.city) return;

    const created = {
      id: newHosp.code || `AYUSH-NEW-${Math.floor(100 + Math.random() * 900)}`,
      name: newHosp.name,
      city: newHosp.city,
      state: newHosp.state || 'India',
      beds: Number(newHosp.beds),
      icu: Number(newHosp.icu),
      status: 'Active',
      abdm_sync: '100% Compliant'
    };

    setHospitals([created, ...hospitals]);
    setShowAddModal(false);
    setNewHosp({ name: '', code: '', city: '', state: '', beds: 100, icu: 15 });
  };

  const filteredHospitals = hospitals
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Header Banner ──────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200 tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            National Registry Module
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Pan-India Ayush Hospital Network</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage accredited Ayush institutions, bed capacity, ICU availability & ABDM compliance across India.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 bg-violet-700 hover:bg-violet-800 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-violet-950/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Onboard New Hospital</span>
        </button>
      </div>

      {/* ─── Search Bar & Registry Table ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hospital Name, City or Code..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-violet-500"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            Showing <span className="text-violet-700 font-extrabold">{filteredHospitals.length}</span> connected hospitals
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">Hospital Code</th>
                <th className="p-4">Institution Name</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Ayush Beds</th>
                <th className="p-4 text-center">ICU Fleet</th>
                <th className="p-4">ABDM Compliance</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredHospitals.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-violet-700">{h.id}</td>
                  <td className="p-4 font-bold text-slate-900">{h.name}</td>
                  <td className="p-4 text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{h.city}, {h.state}</span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-900">{h.beds}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{h.icu}</td>
                  <td className="p-4">
                    <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {h.abdm_sync}
                    </span>
                  </td>
                  <td className="p-4">
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

      {/* ─── Onboard New Hospital Modal ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-violet-600" />
                <span>Onboard New Ayush Hospital</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHospital} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institution Name *</label>
                <input
                  type="text"
                  required
                  value={newHosp.name}
                  onChange={(e) => setNewHosp({ ...newHosp, name: e.target.value })}
                  placeholder="e.g. Government Ayurvedic Medical College"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newHosp.city}
                    onChange={(e) => setNewHosp({ ...newHosp, city: e.target.value })}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newHosp.state}
                    onChange={(e) => setNewHosp({ ...newHosp, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ayush Bed Count</label>
                  <input
                    type="number"
                    value={newHosp.beds}
                    onChange={(e) => setNewHosp({ ...newHosp, beds: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ICU Fleet Units</label>
                  <input
                    type="number"
                    value={newHosp.icu}
                    onChange={(e) => setNewHosp({ ...newHosp, icu: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-700 hover:bg-violet-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Add Hospital to National Network</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
