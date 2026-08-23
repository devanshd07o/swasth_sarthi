import React, { useState } from 'react';
import { X, Send, UserCheck, Stethoscope, AlertTriangle, ShieldCheck, HeartPulse, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DOCTOR_LIST = [
  {
    id: 'DOC-AYUR-101',
    name: 'Vaidya Dr. Rajesh Vaidya',
    title: 'Senior General Physician & Kayachikitsa Specialist (General OPD)',
    qualification: 'BAMS, MD (Kayachikitsa), AIIA Delhi',
    specialty: 'General Kayachikitsa (Multi-Symptom / Full Body Tridosha)',
    hospital: 'All India Institute of Ayurveda (AIIA), New Delhi',
    isGeneral: true
  },
  {
    id: 'DOC-AYUR-204',
    name: 'Vaidya Dr. Ananya Shastri',
    title: 'Senior Ayurvedic Physician & Nadi Specialist',
    qualification: 'BAMS, MD (Ayurveda - Kayachikitsa), NIA Jaipur',
    specialty: 'Nadi Pariksha & Amlapitta (GERD) Specialist',
    hospital: 'National Institute of Ayurveda (NIA), Jaipur',
    isGeneral: false
  },
  {
    id: 'DOC-AYUR-308',
    name: 'Vaidya Dr. Vikramaditya Dev',
    title: 'Chief Consultant & Shalya Tantra Specialist',
    qualification: 'BAMS, MD (Shalya Tantra), BHU Varanasi',
    specialty: 'Shalya Tantra, Kshar Sutra & Twacha Roga',
    hospital: 'Faculty of Ayurveda, BHU, Varanasi',
    isGeneral: false
  }
];

export default function DoctorReferralModal({ isOpen, onClose, patient, currentDoctorId = 'DOC-AYUR-101', onReferralSuccess }) {
  const { t } = useTranslation();
  const [targetDoctorId, setTargetDoctorId] = useState('DOC-AYUR-204');
  const [referralReason, setReferralReason] = useState('');
  const [urgency, setUrgency] = useState('Routine');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !patient) return null;

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    const targetDoc = DOCTOR_LIST.find(d => d.id === targetDoctorId) || DOCTOR_LIST[1];
    
    const referralData = {
      patient_id: patient.id || patient.patient_id,
      patient_name: patient.name,
      abha_id: patient.abha_id,
      from_doctor_id: currentDoctorId,
      to_doctor_id: targetDoc.id,
      to_doctor_name: targetDoc.name,
      to_doctor_hospital: targetDoc.hospital,
      reason: referralReason,
      urgency: urgency,
      notes: notes,
      date: new Date().toISOString().split('T')[0],
      status: 'Referred'
    };

    setIsSuccess(true);
    setTimeout(() => {
      if (onReferralSuccess) onReferralSuccess(referralData);
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  const selectedDoc = DOCTOR_LIST.find(d => d.id === targetDoctorId) || DOCTOR_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20">
              <Stethoscope className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">Inter-Doctor Patient Referral</h3>
              <p className="text-xs text-emerald-200 font-medium">Transfer Token & Clinical Case to Specialist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Patient Successfully Referred!</h4>
            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
              Patient <strong className="text-slate-900">{patient.name}</strong> ({patient.abha_id}) has been referred to <strong className="text-emerald-800">{selectedDoc.name}</strong> at {selectedDoc.hospital}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReferralSubmit} className="p-6 space-y-4 text-xs font-sans">
            
            {/* Patient Header Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Patient Being Referred</span>
                <span className="font-extrabold text-slate-900 text-sm">{patient.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Central ABHA ID</span>
                <span className="font-bold text-emerald-800 font-mono">{patient.abha_id}</span>
              </div>
            </div>

            {/* Select Destination Doctor */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Select Specialist / General Vaidya</label>
              <select
                value={targetDoctorId}
                onChange={(e) => setTargetDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                {DOCTOR_LIST.filter(d => d.id !== currentDoctorId).map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty} ({doc.isGeneral ? 'General Physician' : 'Specialist'})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Doctor Info Card */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-950 text-xs">{selectedDoc.name}</span>
                {selectedDoc.isGeneral && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[9px] font-black uppercase">
                    ⭐ Recommended for Multi-Symptom Patients
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold">{selectedDoc.title}</p>
              <p className="text-[10px] text-slate-500 font-medium">{selectedDoc.hospital}</p>
            </div>

            {/* Urgency Level */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Referral Urgency</label>
              <div className="grid grid-cols-3 gap-2">
                {['Routine', 'Urgent', 'Red-Flag Emergency'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgency(level)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      urgency === level
                        ? level === 'Red-Flag Emergency' ? 'bg-red-600 text-white border-red-700 shadow-sm'
                          : level === 'Urgent' ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Referral Reason */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Primary Clinical Reason for Referral</label>
              <input
                type="text"
                required
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                placeholder="e.g. Requires specialized Nadi Pariksha or Panchakarma Raktamokshana evaluation"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Doctor Clinical Notes */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Clinical Summary & Handover Notes</label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detail current Vata/Pitta/Kapha findings, active medications, or specific diagnostic requests..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Referral</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
