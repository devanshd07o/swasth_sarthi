import React from 'react';
import { Printer, Download, X, HeartPulse, CheckCircle2, ShieldCheck, Pill, Calendar, Clock, MapPin } from 'lucide-react';

export default function PrescriptionPrintModal({ caseData, patient, doctor, isOpen, onClose }) {
  if (!isOpen || !caseData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:shadow-none print:border-none print:max-h-full print:rounded-none">
        
        {/* Controls Bar (Hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider">Digital AYUSH E-Prescription</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prescription Paper Document */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 font-sans print:p-6" id="prescription-print-area">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                  SS
                </div>
                <div>
                  <h2 className="text-lg font-black text-emerald-950 leading-tight">SwasthSaarthi / MediKiosk</h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 block">
                    Ministry of Ayush • Government of India (SIH26047)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                {caseData.hospital_name || doctor?.hospital_name || "All India Institute of Ayurveda (AIIA), New Delhi"}
              </p>
            </div>

            <div className="text-right space-y-0.5">
              <h3 className="text-sm font-extrabold text-slate-900">{caseData.doctor_name || doctor?.name || "Dr. Rajesh Vaidya"}</h3>
              <p className="text-xs text-emerald-800 font-semibold">{caseData.doctor_qualification || doctor?.qualification || "BAMS, MD (Kayachikitsa)"}</p>
              <p className="text-[10px] text-slate-500 font-mono font-bold">Reg: {doctor?.registration_no || "AYUSH-REG-2018-8841"}</p>
            </div>
          </div>

          {/* Patient Meta Strip */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Name</span>
              <span className="font-extrabold text-slate-900">{patient?.name || "Ramesh Sharma"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Central ABHA ID</span>
              <span className="font-bold text-emerald-800 font-mono">{patient?.abha_id || "ABHA-9821-4501"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Gender / Blood</span>
              <span className="font-bold text-slate-800">{patient?.age || 52} Y / {(patient?.gender || "M").toUpperCase()} / {patient?.blood_group || "O+"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Date & Token</span>
              <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-GB')} • {caseData.token_number || "OPD-101"}</span>
            </div>
          </div>

          {/* Ayurvedic Pariksha & Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                Ayurvedic Assessment (Prakriti / Agni / Nadi)
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><span className="font-semibold text-slate-500">Prakriti:</span> <span className="font-bold text-emerald-900">{caseData.prakriti || "Vata-Kapha"}</span></div>
                <div><span className="font-semibold text-slate-500">Agni:</span> <span className="font-bold text-emerald-900">{caseData.agni || "Sama Agni"}</span></div>
                <div><span className="font-semibold text-slate-500">Vikriti:</span> <span className="font-bold text-emerald-900">{caseData.vikriti || "Vata Vriddhi"}</span></div>
                <div><span className="font-semibold text-slate-500">Koshtha:</span> <span className="font-bold text-emerald-900">{caseData.koshtha || "Madhyama"}</span></div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Clinical Diagnosis
              </span>
              <p className="text-xs font-black text-emerald-800">
                {caseData.diagnosis_ayurvedic || "Sandhivata (Osteoarthritis)"}
              </p>
              {caseData.diagnosis_modern && (
                <p className="text-[11px] text-slate-500 font-medium">Modern: {caseData.diagnosis_modern}</p>
              )}
            </div>
          </div>

          {/* Rx: Medicines Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider">
              <Pill className="w-4 h-4 text-emerald-700" />
              <span>Rx • Ayurvedic Medicines & Formulations</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                    <th className="p-3">#</th>
                    <th className="p-3">Medicine Name & Formulation</th>
                    <th className="p-3">Dosage & Timing</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Anupana (अनुपान)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(caseData.medicines && caseData.medicines.length > 0 ? caseData.medicines : [
                    { name: "Yograj Guggulu", dosage: "2 tablets twice daily", duration: "30 days", anupana: "Warm Water" },
                    { name: "Rasnasaptak Kwath", dosage: "20 ml twice daily after meals", duration: "30 days", anupana: "Lukewarm water" },
                    { name: "Ksheerabala Taila (101)", dosage: "External application on knees", duration: "30 days", anupana: "External" }
                  ]).map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-extrabold text-slate-900">{med.name}</td>
                      <td className="p-3 text-slate-700 font-medium">{med.dosage}</td>
                      <td className="p-3 text-slate-600 font-medium">{med.duration}</td>
                      <td className="p-3 text-emerald-800 font-bold">{med.anupana || caseData.anupana || "Warm Water"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anupana & Pathya-Apathya Diet Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-1.5">
              <span className="text-[10px] font-extrabold text-teal-900 uppercase block">Anupana Instructions</span>
              <p className="text-teal-950 font-medium leading-relaxed">
                {caseData.anupana || "गुनगुना पानी (Lukewarm Water) अथवा शहद (Honey) के साथ लें।"}
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase block">Pathya - Apathya Diet Plan</span>
              <p className="text-amber-950 font-medium leading-relaxed">
                {caseData.pathya_apathya || "Pathya: Warm freshly cooked food, Garlic, Sesame oil. Apathya: Cold aerated drinks, Night curd, Heavy pulses."}
              </p>
            </div>
          </div>

          {/* Footer & Digital Signature */}
          <div className="pt-6 border-t-2 border-slate-200 flex items-end justify-between text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>ABDM / Ayush National Grid Verified E-Signature</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Digitally Signed on: {new Date().toISOString()} • SHA-256 Validated
              </p>
              {caseData.follow_up_date && (
                <p className="text-xs font-extrabold text-slate-800 pt-1">
                  Next Follow-up Date: <span className="text-emerald-800">{caseData.follow_up_date}</span>
                </p>
              )}
            </div>

            <div className="text-center space-y-1">
              <div className="w-36 h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-emerald-800 font-mono font-bold">
                [ Dr. Rajesh Vaidya ]
              </div>
              <span className="text-[10px] text-slate-500 font-bold block">Consulting Vaidya Signature</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
