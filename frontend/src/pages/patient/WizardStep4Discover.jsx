import React from 'react';
import { Search, Sparkles, Star, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WizardStep4Discover({
  searchQuery, setSearchQuery,
  taxonomyMode, setTaxonomyMode,
  selectedTaxonomyTag, setSelectedTaxonomyTag,
  doctorsList, loadDoctors,
  setSelectedDoctorForProfile,
  setBookingDoctor, setIsBookingModalOpen
}) {
  const { t } = useTranslation();

  const symptomTags = [
    { id: 'All', label: t('tags.all', 'All') },
    { id: 'Joint Pain', label: t('tags.jointPain', 'Joint Pain') },
    { id: 'Ghutna Dard', label: t('tags.kneePain', 'Knee Pain') },
    { id: 'Acidity', label: t('tags.acidity', 'Acidity & Gas') },
    { id: 'Digestion', label: t('tags.digestion', 'Digestion') },
    { id: 'Skin / Twacha', label: t('tags.skin', 'Skin Disorders') },
    { id: 'Headache', label: t('tags.headache', 'Headache') },
    { id: 'Stress / Tanav', label: t('tags.stress', 'Stress & Anxiety') },
    { id: 'Insomnia', label: t('tags.insomnia', 'Insomnia') },
    { id: 'Diabetes', label: t('tags.diabetes', 'Diabetes') },
    { id: 'Immunity', label: t('tags.immunity', 'Immunity') }
  ];

  const specializationTags = [
    { id: 'All', label: t('tags.all', 'All') },
    { id: 'Kayachikitsa (Internal Medicine)', label: t('tags.kayachikitsa', 'Kayachikitsa (Internal Medicine)') },
    { id: 'Panchakarma (Detox)', label: t('tags.panchakarma', 'Panchakarma (Detox)') },
    { id: 'Shalya Tantra (Surgery)', label: t('tags.shalyaTantra', 'Shalya Tantra (Surgery)') },
    { id: 'Kaumarbhritya (Pediatrics)', label: t('tags.kaumarbhritya', 'Kaumarbhritya (Pediatrics)') },
    { id: 'Rasayana (Rejuvenation)', label: t('tags.rasayana', 'Rasayana (Rejuvenation)') }
  ];

  const previousDoctor = doctorsList.find(d => d.name.includes("Rajesh")) || doctorsList[0];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          {t('patientPortal.step4Tag', 'Step 4 of 5 • Doctor Discovery & OPD Registration')}
        </span>
        <h3 className="text-lg font-semibold text-slate-900 mt-2">
          {t('patientPortal.step4Title', 'Available Certified Ayush Vaidyas')}
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          {t('patientPortal.step4Desc', 'Dual Taxonomy search (by symptom or classical specialty). Government-fixed nominal ₹100 registration fee.')}
        </p>
      </div>

      {previousDoctor && (
        <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-800 text-white rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={previousDoctor.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
                alt={previousDoctor.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow-sm"
              />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase">
                  {t('patientPortal.previousDoctorBadge', 'Previous Consulting Doctor • Continuity of Care')}
                </span>
                <h4 className="text-lg font-bold">{previousDoctor.name}</h4>
                <p className="text-xs text-emerald-200">{previousDoctor.qualification}</p>
                <p className="text-[11px] text-slate-300">{previousDoctor.hospital_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedDoctorForProfile(previousDoctor)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                {t('patientPortal.btnViewProfileReviews', 'View Profile & Reviews')}
              </button>
              <button
                onClick={() => {
                  setBookingDoctor(previousDoctor);
                  setIsBookingModalOpen(true);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {t('patientPortal.btnContinueFollowup', 'Continue Follow-up')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-800 rounded-2xl text-white space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {t('patientPortal.aiEngineHeader', 'Smart AI Vaidya Discovery Engine')}
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">
            {t('patientPortal.aiEngineSub', 'Semantic match across symptoms, classical doshas & hospitals')}
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('patientPortal.aiSearchPlaceholder', 'Type or ask AI (e.g. \'घुटने में दर्द\', \'acidity after eating\', \'skin allergy\')...')}
            className="w-full pl-11 pr-24 py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder-slate-300 focus:outline-none focus:bg-white/15 focus:border-emerald-400 transition-all backdrop-blur-md shadow-sm"
          />
          <Search className="w-5 h-5 text-emerald-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-md font-semibold cursor-pointer"
            >
              {t('common.clear', 'Clear')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
          <span className="text-slate-300 font-semibold">{t('patientPortal.aiSuggestions', 'AI Suggestions:')}</span>
          {[
            { label: t('patientPortal.sugJointPain', 'Joint Pain & Arthritis'), q: "Joint Pain" },
            { label: t('patientPortal.sugAcidity', 'Acidity & GERD'), q: "Acidity" },
            { label: t('patientPortal.sugPanchakarma', 'Panchakarma Detox'), q: "Panchakarma" },
            { label: t('patientPortal.sugSkin', 'Skin & Twacha Roga'), q: "Skin" },
            { label: t('patientPortal.sugStress', 'Stress & Insomnia'), q: "Stress" }
          ].map((sug, i) => (
            <button
              key={i}
              onClick={() => setSearchQuery(sug.q)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-md text-emerald-200 font-semibold transition-all cursor-pointer"
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">{t('patientPortal.filterDoctorsBy', 'Filter Doctors by:')}</span>
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setTaxonomyMode('symptoms');
                setSelectedTaxonomyTag('All');
                setSearchQuery('');
                loadDoctors();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                taxonomyMode === 'symptoms' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('patientPortal.byCommonSymptoms', 'By Common Symptoms')}
            </button>
            <button
              onClick={() => {
                setTaxonomyMode('specialization');
                setSelectedTaxonomyTag('All');
                setSearchQuery('');
                loadDoctors();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                taxonomyMode === 'specialization' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('patientPortal.bySpecialization', 'By Specialization')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(taxonomyMode === 'symptoms' ? symptomTags : specializationTags).map((tagObj) => (
            <button
              key={tagObj.id}
              onClick={() => {
                setSelectedTaxonomyTag(tagObj.id);
                loadDoctors(tagObj.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedTaxonomyTag === tagObj.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm'
              }`}
            >
              {tagObj.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctorsList
          .filter((doc) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const nameMatch = doc.name.toLowerCase().includes(q);
            const qualMatch = (doc.qualification || '').toLowerCase().includes(q);
            const hospMatch = (doc.hospital_name || '').toLowerCase().includes(q);
            const specMatch = (doc.specializations || []).some((s) => s.toLowerCase().includes(q));
            const sympMatch = (doc.symptom_tags || []).some((s) => s.toLowerCase().includes(q));
            return nameMatch || qualMatch || hospMatch || specMatch || sympMatch;
          })
          .map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between animate-fade-in shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={doc.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
                  alt={doc.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-900">{doc.name}</h4>
                    <span className="flex items-center gap-0.5 text-amber-500 text-xs font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating_avg || 4.9}</span>
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold">{doc.qualification}</p>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {doc.hospital_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {(doc.specializations || []).map((s, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                    {s}
                  </span>
                ))}
                {(doc.symptom_tags || []).slice(0, 3).map((s, idx) => (
                  <span key={idx} className="text-[10px] font-medium px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md border border-slate-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">{t('patientPortal.nominalFeeLabel', 'Nominal Fee')}</span>
                <span className="text-xs font-bold text-slate-900">₹{doc.consultation_fee || 100}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDoctorForProfile(doc)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                >
                  {t('patientPortal.btnReviews', 'Reviews')}
                </button>
                <button
                  onClick={() => {
                    setBookingDoctor(doc);
                    setIsBookingModalOpen(true);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                >
                  {t('patientPortal.btnRegisterCase', 'Register Case')}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
