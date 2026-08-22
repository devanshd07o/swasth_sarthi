import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Doctor APIs ─────────────────────────────────────────────────────────────
export const getDoctors = async (params = {}) => {
  const res = await api.get('/doctors/', { params });
  return res.data;
};

export const getDoctorById = async (doctorId) => {
  const res = await api.get(`/doctors/${doctorId}`);
  return res.data;
};

export const createDoctor = async (doctorData) => {
  const res = await api.post('/doctors/', doctorData);
  return res.data;
};

export const getDoctorRatings = async (doctorId) => {
  const res = await api.get(`/doctors/${doctorId}/ratings`);
  return res.data;
};

export const addDoctorRating = async (doctorId, ratingData) => {
  const res = await api.post(`/doctors/${doctorId}/ratings`, ratingData);
  return res.data;
};

export const getDoctorPatients = async (doctorId, search = '') => {
  const res = await api.get(`/doctors/${doctorId}/patients`, {
    params: { search: search || undefined }
  });
  return res.data;
};

// ─── Patient & ABHA APIs ─────────────────────────────────────────────────────
export const lookupAbhaId = async (abhaId) => {
  const res = await api.get(`/patients/lookup-abha/${encodeURIComponent(abhaId)}`);
  return res.data;
};

export const getPatients = async (search = '') => {
  const res = await api.get('/patients/', { params: { search: search || undefined } });
  return res.data;
};

export const getPatientById = async (id) => {
  const res = await api.get(`/patients/${id}`);
  return res.data;
};

export const createPatient = async (patientData) => {
  const res = await api.post('/patients/', patientData);
  return res.data;
};

export const getPatientTimeline = async (patientId, requestingDoctorId = null) => {
  const res = await api.get(`/patients/${patientId}/timeline`, {
    params: { requesting_doctor_id: requestingDoctorId || undefined }
  });
  return res.data;
};

export const addSymptomLog = async (patientId, entry) => {
  const res = await api.post(`/patients/${patientId}/symptom-log`, entry);
  return res.data;
};

export const getPatientDocuments = async (patientId) => {
  const res = await api.get(`/patients/${patientId}/documents`);
  return res.data;
};

export const uploadOcrDocument = async (patientId, docData) => {
  const res = await api.post(`/patients/${patientId}/documents`, docData);
  return res.data;
};

// ─── Case & Consultation APIs ────────────────────────────────────────────────
export const createCase = async (caseData) => {
  const res = await api.post('/cases/', caseData);
  return res.data;
};

export const getCaseById = async (caseId) => {
  const res = await api.get(`/cases/${caseId}`);
  return res.data;
};

export const updateCase = async (caseId, caseData) => {
  const res = await api.put(`/cases/${caseId}`, caseData);
  return res.data;
};

export const signCase = async (caseId) => {
  const res = await api.put(`/cases/${caseId}/sign`);
  return res.data;
};

export const structureVoiceIntake = async (transcript, patientId = null, language = 'en') => {
  const res = await api.post('/cases/intake-structuring', { transcript, patient_id: patientId, language });
  return res.data;
};

// ─── AI Assist APIs ──────────────────────────────────────────────────────────
export const transcribeAudioGroqWhisper = async (audioBlob, language = 'hi') => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'speech_intake.webm');
  formData.append('language', language);
  const res = await api.post('/ai/transcribe-groq-whisper', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const scanRedFlags = async (transcript) => {
  const res = await api.post('/ai/red-flag-scan', { transcript });
  return res.data;
};

export const extractOcrDocument = async (fileName, docType, mockRawText = '') => {
  const res = await api.post('/ai/ocr-extract', {
    file_name: fileName,
    doc_type: docType,
    mock_raw_text: mockRawText
  });
  return res.data;
};

export const generateAISummary = async (caseData) => {
  const res = await api.post('/ai/summary', { case_data: caseData });
  return res.data;
};

export const classifyDosha = async (symptoms, age = 30) => {
  const res = await api.post('/ai/classify-dosha', { symptoms, age });
  return res.data;
};

export const getVoiceNarration = async (text, language = 'en') => {
  const res = await api.post(`/ai/voice-narration?text=${encodeURIComponent(text)}&language=${language}`, {}, {
    responseType: 'arraybuffer'
  });
  return res.data;
};

// ─── Ayurvedic Classical Knowledge APIs ──────────────────────────────────────
export const searchAyurvedicMedicines = async (query = '') => {
  const res = await api.get(`http://localhost:8000/api/ayurveda/medicines?query=${encodeURIComponent(query)}`);
  return res.data;
};

export const getPrakritiScores = async (prakritiType) => {
  const res = await api.get(`http://localhost:8000/api/ayurveda/prakriti-scores?prakriti_type=${encodeURIComponent(prakritiType)}`);
  return res.data;
};

export const getPathyaAdvice = async (prakriti = '', vikriti = '') => {
  const res = await api.get(`http://localhost:8000/api/ayurveda/pathya-apathya?prakriti=${encodeURIComponent(prakriti)}&vikriti=${encodeURIComponent(vikriti)}`);
  return res.data;
};

export default api;
