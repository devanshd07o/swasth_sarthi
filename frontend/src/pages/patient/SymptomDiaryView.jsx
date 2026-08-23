import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SymptomDiaryView({
  diarySymptom, setDiarySymptom,
  diarySeverity, setDiarySeverity,
  diaryNotes, setDiaryNotes,
  savingDiary, handleAddSymptomLog
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-medium uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          {t('patientPortal.runningLogTag', 'Patient Running Log (Sheet 1)')}
        </span>
        <h3 className="text-lg font-semibold text-slate-900 mt-2">
          {t('patientPortal.symptomDiaryTitle', 'Patient Self-Reported Symptom Diary')}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {t('patientPortal.symptomDiaryDesc', 'Log daily flare-ups, dietary triggers, or pain changes so your Vaidya can review the complete longitudinal trend.')}
        </p>
      </div>

      <form onSubmit={handleAddSymptomLog} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">{t('patientPortal.labelTodaySymptom', "Today's Symptom / Observation")}</label>
            <input
              type="text"
              required
              value={diarySymptom}
              onChange={(e) => setDiarySymptom(e.target.value)}
              placeholder={t('patientPortal.phTodaySymptom', 'e.g. Subah ghutne me 20 min stiffness rahi / Khaane ke baad acidity...')}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-sm"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-600 block mb-1">{t('patientPortal.labelSeverityLevel', 'Severity Level')}</label>
            <select
              value={diarySeverity}
              onChange={(e) => setDiarySeverity(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-teal-500 shadow-sm"
            >
              <option value="Mild">{t('patientPortal.sevMild', 'Mild')}</option>
              <option value="Moderate">{t('patientPortal.sevModerate', 'Moderate')}</option>
              <option value="Severe">{t('patientPortal.sevSevere', 'Severe')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-600 block mb-1">{t('patientPortal.labelTriggersNotes', 'Triggers or Relief Notes (Optional)')}</label>
          <textarea
            rows={3}
            value={diaryNotes}
            onChange={(e) => setDiaryNotes(e.target.value)}
            placeholder={t('patientPortal.phTriggersNotes', 'e.g. Warm water lene se aaram mila / Thanda paani peene par badh gaya...')}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={savingDiary}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm cursor-pointer transition-all"
        >
          {savingDiary ? t('patientPortal.saving', 'Saving...') : t('patientPortal.btnAddSymptomDiary', '+ Add to Symptom Diary')}
        </button>
      </form>
    </div>
  );
}
