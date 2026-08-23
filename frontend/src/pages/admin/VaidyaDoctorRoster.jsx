import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  Search,
  Plus,
  CheckCircle2,
  Building2,
  Award,
  Users,
  X
} from 'lucide-react';

export default function VaidyaDoctorRoster() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [doctors, setDoctors] = useState([
    { reg_no: 'AYUSH-REG-DEL-2012-4412', name: 'Dr. Rajesh Vaidya', qual: 'BAMS, MD (Kayachikitsa)', hospital: 'All India Institute of Ayurveda (AIIA)', city: 'New Delhi', active_opd: 18, status: 'Verified' },
    { reg_no: 'AYUSH-REG-RAJ-2015-1108', name: 'Dr. Ananya Shastri', qual: 'BAMS, MD (Ayurveda)', hospital: 'National Institute of Ayurveda (NIA)', city: 'Jaipur', active_opd: 12, status: 'Verified' },
    { reg_no: 'AYUSH-REG-UP-2010-8820', name: 'Dr. Vikramaditya Dev', qual: 'BAMS, MD (Shalya Tantra)', hospital: 'Faculty of Ayurveda, BHU', city: 'Varanasi', active_opd: 15, status: 'Verified' },
    { reg_no: 'AYUSH-REG-KER-2014-9901', name: 'Dr. Sudhir Nambiar', qual: 'BAMS, MD (Panchakarma)', hospital: 'Govt. Ayurveda College', city: 'Thiruvananthapuram', active_opd: 22, status: 'Verified' },
    { reg_no: 'AYUSH-REG-MAH-2018-3340', name: 'Dr. Meenakshi Sundaram', qual: 'BAMS, MD (Dravyaguna)', hospital: 'Tilak Ayurved Mahavidyalaya', city: 'Mumbai', active_opd: 10, status: 'Verified' }
  ]);

  const [newDoc, setNewDoc] = useState({
    name: '',
    reg_no: '',
    qual: 'BAMS, MD (Ayurveda)',
    hospital: 'All India Institute of Ayurveda (AIIA)',
    city: 'New Delhi'
  });

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.reg_no) return;

    const created = {
      reg_no: newDoc.reg_no,
      name: newDoc.name,
      qual: newDoc.qual,
      hospital: newDoc.hospital,
      city: newDoc.city,
      active_opd: 0,
      status: 'Verified'
    };

    setDoctors([created, ...doctors]);
    setShowAddModal(false);
    setNewDoc({ name: '', reg_no: '', qual: 'BAMS, MD (Ayurveda)', hospital: 'All India Institute of Ayurveda (AIIA)', city: 'New Delhi' });
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.reg_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Header Banner ──────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" />
            Practitioner Management Module
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Vaidya Practitioner Doctor Roster</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            NCISM & State Ayush Council verified Ayurvedic clinical practitioners across all connected hospitals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Onboard New Vaidya Doctor</span>
        </button>
      </div>

      {/* ─── Search Bar & Doctor Directory ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-slate-100 gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Doctor, Reg No or Hospital..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <span className="text-xs font-bold text-slate-500">
            Total <span className="text-emerald-700 font-extrabold">{filteredDoctors.length}</span> verified practitioners
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-4">State Ayush Reg No</th>
                <th className="p-4">Practitioner Name & Degree</th>
                <th className="p-4">Attached Hospital</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Live Patient Queue</th>
                <th className="p-4">NCISM Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredDoctors.map((d) => (
                <tr key={d.reg_no} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-emerald-800">{d.reg_no}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block text-sm">{d.name}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{d.qual}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">{d.hospital}</td>
                  <td className="p-4 text-slate-600">{d.city}</td>
                  <td className="p-4 text-center">
                    <span className="font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      {d.active_opd} Patients
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-extrabold border border-emerald-200 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Onboard New Vaidya Modal ───────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                <span>Onboard New Vaidya Doctor</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State Ayush Council Reg No *</label>
                <input
                  type="text"
                  required
                  value={newDoc.reg_no}
                  onChange={(e) => setNewDoc({ ...newDoc, reg_no: e.target.value })}
                  placeholder="e.g. AYUSH-REG-DEL-2024-9001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Dr. Priyanshu Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qualification / Specialty</label>
                <input
                  type="text"
                  value={newDoc.qual}
                  onChange={(e) => setNewDoc({ ...newDoc, qual: e.target.value })}
                  placeholder="e.g. BAMS, MD (Kayachikitsa)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attached Hospital / Center</label>
                <input
                  type="text"
                  value={newDoc.hospital}
                  onChange={(e) => setNewDoc({ ...newDoc, hospital: e.target.value })}
                  placeholder="e.g. All India Institute of Ayurveda (AIIA)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Onboard Practitioner</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
