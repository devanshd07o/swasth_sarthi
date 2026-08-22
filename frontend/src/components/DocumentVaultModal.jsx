import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Sparkles, X, Calendar, Building2, Eye, Plus, ShieldCheck } from 'lucide-react';
import { uploadOcrDocument, extractOcrDocument } from '../services/api';

export default function DocumentVaultModal({ patientId, isOpen, onClose, onDocumentUploaded, lang = 'en' }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('Prescription');
  const [sourceHospital, setSourceHospital] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [extractedData, setExtractedData] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    
    // Trigger instant simulated AI OCR extraction
    setExtracting(true);
    try {
      const res = await extractOcrDocument(selected.name, docType);
      setExtractedData(res.extracted_data);
      if (res.source_doctor_or_hospital) setSourceHospital(res.source_doctor_or_hospital);
      if (res.date) setDocDate(res.date);
    } catch (err) {
      console.error('OCR Extraction failed', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveToVault = async (e) => {
    e.preventDefault();
    if (!file && !sourceHospital) return;
    setSaving(true);
    try {
      const payload = {
        patient_id: patientId || 'ABHA-9821-4501',
        file_name: file ? file.name : `${docType}_Scanned_${Date.now()}.pdf`,
        file_type: docType,
        date: docDate,
        source_doctor_or_hospital: sourceHospital || 'Government Ayurvedic Hospital',
        extracted_data: extractedData || { summary: 'Digitized document record' },
        summary: `Scanned ${docType} from ${sourceHospital || 'Clinical Center'}. Structured for ABDM Vault.`
      };
      const saved = await uploadOcrDocument(patientId || 'ABHA-9821-4501', payload);
      if (onDocumentUploaded) onDocumentUploaded(saved);
      onClose();
    } catch (err) {
      alert('Failed to save document to OCR Vault');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-black">ABDM OCR Document Vault</h3>
              <p className="text-[11px] text-emerald-200">Digitize old paper prescriptions, lab tests & discharge summaries</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSaveToVault} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 text-center bg-slate-50/50 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              {file ? (
                <div>
                  <span className="font-extrabold text-slate-900 block text-xs">{file.name}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">{(file.size / 1024).toFixed(1)} KB • Ready for OCR Parsing</span>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-slate-700 block">Click or Drag & Drop Old Prescription / Report</span>
                  <span className="text-[11px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          {extracting && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-xs">AI OCR is parsing text, past medicines & diagnosis...</span>
            </div>
          )}

          {extractedData && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 animate-fade-in">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Extracted Clinical Facts (OCR)</span>
              <div className="space-y-1 text-slate-700">
                {extractedData.diagnoses && (
                  <div><span className="font-semibold text-slate-500">Extracted Diagnoses:</span> <span className="font-bold text-emerald-800">{extractedData.diagnoses.join(', ')}</span></div>
                )}
                {extractedData.medicines && (
                  <div>
                    <span className="font-semibold text-slate-500">Previous Meds:</span>{' '}
                    <span className="font-bold text-slate-800">{extractedData.medicines.map(m => m.name || m).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Prescription">Prescription (पर्चा)</option>
                <option value="Lab Report">Lab / Blood Report</option>
                <option value="X-Ray / Radiology">X-Ray / MRI Scan</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Document Date</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Source Clinic / Hospital / Doctor</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={sourceHospital}
                onChange={(e) => setSourceHospital(e.target.value)}
                placeholder="e.g. All India Institute of Ayurveda / Local Vaidya Clinic"
                className="w-full bg-transparent text-xs font-medium text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-tight">
              Documents are encrypted and attached to the patient's central ABHA record, instantly available for all future Vaidya consultations.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all"
          >
            {saving ? "Digitizing & Uploading..." : "Save to Central ABDM Vault"}
          </button>
        </form>

      </div>
    </div>
  );
}
