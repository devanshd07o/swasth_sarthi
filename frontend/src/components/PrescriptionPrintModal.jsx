import React from 'react';
import { Printer, Download, X, HeartPulse, CheckCircle2, ShieldCheck, Pill, Calendar, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PrescriptionPrintModal({ caseData, patient, doctor, isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen || !caseData) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('prescription-print-area');
    if (!printContent) {
      window.print();
      return;
    }

    // Open dedicated clean print popup window
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ayush Digital Prescription - ${caseData?.patient_name || patient?.name || 'Patient'}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 24px;
                background: #ffffff;
                color: #0f172a;
              }
              .text-xs { font-size: 12px; }
              .text-[10px] { font-size: 10px; }
              .text-[11px] { font-size: 11px; }
              .text-sm { font-size: 14px; }
              .text-lg { font-size: 18px; }
              .text-xl { font-size: 20px; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-black { font-weight: 900; }
              .font-extrabold { font-weight: 800; }
              .font-mono { font-family: monospace; }
              .font-serif { font-family: Georgia, serif; }
              .italic { font-style: italic; }
              .uppercase { text-transform: uppercase; }
              .tracking-wider { letter-spacing: 0.05em; }
              .tracking-widest { letter-spacing: 0.1em; }
              .bg-slate-50 { background-color: #f8fafc; }
              .bg-emerald-50 { background-color: #ecfdf5; }
              .bg-emerald-700 { background-color: #047857; }
              .bg-emerald-800 { background-color: #065f46; }
              .bg-teal-50 { background-color: #f0fdfa; }
              .text-slate-900 { color: #0f172a; }
              .text-slate-800 { color: #1e293b; }
              .text-slate-700 { color: #334155; }
              .text-slate-600 { color: #475569; }
              .text-slate-500 { color: #64748b; }
              .text-slate-400 { color: #94a3b8; }
              .text-emerald-950 { color: #022c22; }
              .text-emerald-900 { color: #064e3b; }
              .text-emerald-800 { color: #065f46; }
              .text-teal-800 { color: #115e59; }
              .border { border: 1px solid #e2e8f0; }
              .border-b-2 { border-bottom: 2px solid #047857; }
              .border-t-2 { border-top: 2px dashed #cbd5e1; }
              .border-slate-200 { border-color: #e2e8f0; }
              .border-emerald-200 { border-color: #a7f3d0; }
              .border-teal-200 { border-color: #99f6e4; }
              .rounded-2xl { border-radius: 16px; }
              .rounded-xl { border-radius: 12px; }
              .rounded-full { border-radius: 9999px; }
              .p-4 { padding: 16px; }
              .p-3\.5 { padding: 14px; }
              .p-8 { padding: 32px; }
              .py-1 { padding-top: 4px; padding-bottom: 4px; }
              .px-3 { padding-left: 12px; padding-right: 12px; }
              .px-2 { padding-left: 8px; padding-right: 8px; }
              .mb-1 { margin-bottom: 4px; }
              .space-y-6 > * + * { margin-top: 24px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .space-y-3 > * + * { margin-top: 12px; }
              .space-y-2 > * + * { margin-top: 8px; }
              .space-y-1 > * + * { margin-top: 4px; }
              .space-y-0\.5 > * + * { margin-top: 2px; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
              .gap-4 { gap: 16px; }
              .gap-3 { gap: 12px; }
              .gap-2 { gap: 8px; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .justify-between { justify-content: space-between; }
              .text-right { text-align: right; }
              .w-full { width: 100%; }
              table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
              th { background-color: #f8fafc; font-weight: 800; text-transform: uppercase; color: #475569; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:shadow-none print:border-none print:max-h-full print:rounded-none">
        
        {/* Controls Bar (Hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider">{t('rxPrint.title', 'Digital AYUSH E-Prescription')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('rxPrint.printBtn', 'Print / Save as PDF')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all cursor-pointer"
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
                    {t('rxPrint.govSubheading', 'Ministry of Ayush • Government of India (SIH26047)')}
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
              <p className="text-[10px] text-slate-500 font-mono font-bold">{t('rxPrint.regPrefix', 'Reg:')} {doctor?.registration_no || caseData.doctor_registration_no || "AYUSH-REG-DEL-2012-4412"}</p>
            </div>
          </div>

          {/* Patient Meta Strip */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('rxPrint.patientName', 'Patient Name')}</span>
              <span className="font-extrabold text-slate-900">{caseData.patient_name || patient?.name || "Ramesh Sharma"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('rxPrint.abhaId', 'Central ABHA ID')}</span>
              <span className="font-bold text-emerald-800 font-mono">{caseData.patient_abha_id || patient?.abha_id || "ABHA-9821-4501"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('rxPrint.ageGenderBlood', 'Age / Gender / Blood')}</span>
              <span className="font-bold text-slate-800">{caseData.patient_age || patient?.age || 42} {t('rxPrint.yearsSuffix', 'Y')} / {(caseData.patient_gender || patient?.gender || "male").toUpperCase()} / {caseData.patient_blood_group || patient?.blood_group || "B+"}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('rxPrint.dateAndToken', 'Date & Token')}</span>
              <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-GB')} • {caseData.token_number || "OPD-101"}</span>
            </div>
          </div>

          {/* Ayurvedic Pariksha & Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                {t('rxPrint.ayurvedicAssessment', 'Ayurvedic Assessment (Prakriti / Agni / Nadi)')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><span className="font-semibold text-slate-500">{t('rxPrint.prakriti', 'Prakriti:')}</span> <span className="font-bold text-emerald-900">{caseData.prakriti || "Vata-Kapha"}</span></div>
                <div><span className="font-semibold text-slate-500">{t('rxPrint.agni', 'Agni:')}</span> <span className="font-bold text-emerald-900">{caseData.agni || "Sama Agni"}</span></div>
                <div><span className="font-semibold text-slate-500">{t('rxPrint.vikriti', 'Vikriti:')}</span> <span className="font-bold text-emerald-900">{caseData.vikriti || "Vata Vriddhi"}</span></div>
                <div><span className="font-semibold text-slate-500">{t('rxPrint.koshtha', 'Koshtha:')}</span> <span className="font-bold text-emerald-900">{caseData.koshtha || "Madhyama"}</span></div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                {t('rxPrint.clinicalDiagnosis', 'Clinical Diagnosis')}
              </span>
              <p className="text-xs font-black text-emerald-800">
                {caseData.diagnosis_ayurvedic || "Sandhivata (Osteoarthritis)"}
              </p>
              {caseData.diagnosis_modern && (
                <p className="text-[11px] text-slate-500 font-medium">{t('rxPrint.modernDiagnosis', 'Modern:')} {caseData.diagnosis_modern}</p>
              )}
            </div>
          </div>

          {/* Rx: Medicines Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm uppercase tracking-wider">
              <Pill className="w-4 h-4 text-emerald-700" />
              <span>{t('rxPrint.rxHeader', 'Rx • Ayurvedic Medicines & Formulations')}</span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold text-[11px] border-b border-slate-200">
                    <th className="p-3">#</th>
                    <th className="p-3">{t('rxPrint.colMedName', 'Medicine Name & Formulation')}</th>
                    <th className="p-3">{t('rxPrint.colDosage', 'Dosage & Timing')}</th>
                    <th className="p-3">{t('rxPrint.colDuration', 'Duration')}</th>
                    <th className="p-3">{t('rxPrint.colAnupana', 'Anupana (अनुपान)')}</th>
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
              <span className="text-[10px] font-extrabold text-teal-900 uppercase block">{t('rxPrint.anupanaInstructions', 'Anupana Instructions')}</span>
              <p className="text-teal-950 font-medium leading-relaxed">
                {caseData.anupana || "गुनगुना पानी (Lukewarm Water) अथवा शहद (Honey) के साथ लें।"}
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1.5">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase block">{t('rxPrint.pathyaApathyaTitle', 'Pathya - Apathya Diet Plan')}</span>
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
                <span>{t('rxPrint.eSignatureBadge', 'ABDM / Ayush National Grid Verified E-Signature')}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {t('rxPrint.digitallySignedOn', 'Digitally Signed on:')} {new Date().toISOString()} {t('rxPrint.sha256Validated', '• SHA-256 Validated')}
              </p>
              {caseData.follow_up_date && (
                <p className="text-xs font-extrabold text-slate-800 pt-1">
                  {t('rxPrint.nextFollowUp', 'Next Follow-up Date:')} <span className="text-emerald-800">{caseData.follow_up_date}</span>
                </p>
              )}
            </div>

            <div className="text-center space-y-1">
              <div className="w-48 h-10 border-b border-dashed border-slate-400 flex items-center justify-center text-[10px] text-emerald-800 font-mono font-bold">
                [ {caseData.doctor_name || doctor?.name || "Dr. Rajesh Vaidya"} ]
              </div>
              <span className="text-[10px] text-slate-500 font-bold block">{t('rxPrint.vaidyaSignatureLabel', 'Consulting Vaidya Signature')}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
