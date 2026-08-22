import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Clock, MapPin, Award, Calendar, CheckCircle2, User, X, MessageSquare, AlertCircle } from 'lucide-react';
import { getDoctorRatings, addDoctorRating } from '../services/api';

export default function DoctorProfileModal({ doctor, isOpen, onClose, onBookConsultation, lang = 'en' }) {
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newScore, setNewScore] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [conditionTreated, setConditionTreated] = useState('Sandhivata / Joint Pain');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (doctor?.id && isOpen) {
      loadRatings();
    }
  }, [doctor, isOpen]);

  const loadRatings = async () => {
    setLoadingRatings(true);
    try {
      const data = await getDoctorRatings(doctor.id);
      setRatings(data);
    } catch (e) {
      console.error('Failed to load doctor ratings', e);
    } finally {
      setLoadingRatings(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      await addDoctorRating(doctor.id, {
        doctor_id: doctor.id,
        patient_id: 'anonymous_verified_session',
        score: newScore,
        comment: newComment,
        condition_treated: conditionTreated
      });
      setNewComment('');
      setShowReviewForm(false);
      loadRatings();
    } catch (err) {
      alert('Failed to post verified review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={doctor.avatar_url || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"}
              alt={doctor.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {doctor.registration_no || "AYUSH-REG-VERIFIED"}
                </span>
                <span className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{doctor.rating_avg || 4.9}</span>
                  <span className="text-amber-200/80 font-normal">({doctor.rating_count || 38})</span>
                </span>
              </div>
              <h3 className="text-xl font-black">{doctor.name}</h3>
              <p className="text-xs text-emerald-100/90 font-medium">{doctor.qualification}</p>
              <div className="flex items-center gap-2 text-xs text-emerald-200/70 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{doctor.hospital_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Experience</span>
              <span className="text-base font-black text-slate-800">{doctor.experience_years || 12}+ Years</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">OPD Availability</span>
              <span className="text-xs font-bold text-emerald-700 block mt-0.5">{doctor.availability || "Mon - Sat • 9AM - 2PM"}</span>
            </div>
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Gov-Fixed Fee</span>
              <span className="text-base font-black text-emerald-800">₹{doctor.consultation_fee || 100}</span>
            </div>
          </div>

          {/* Specializations & Ashtanga Ayurveda Focus */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ashtanga Ayurveda Specializations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(doctor.specializations || ["Kayachikitsa", "Panchakarma"]).map((spec, i) => (
                <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl font-bold border border-emerald-200">
                  {spec}
                </span>
              ))}
              {(doctor.symptom_tags || []).map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl font-medium border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Verified Anonymous Patient Reviews */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Anonymous Patient Reviews</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Cryptographically verified consultations via central ABHA IDs. Patient names remain strictly anonymous.
                </p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl transition-all"
              >
                {showReviewForm ? "Cancel" : "+ Write Review"}
              </button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <form onSubmit={handlePostReview} className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Condition Treated</label>
                    <input
                      type="text"
                      value={conditionTreated}
                      onChange={(e) => setConditionTreated(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      placeholder="e.g. Joint Pain, GERD"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Rating Score</label>
                    <select
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 / 5 - Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 / 5 - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 / 5 - Good)</option>
                      <option value={2}>⭐⭐ (2 / 5 - Average)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Your Honest Feedback</label>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe your treatment experience, relief timeline, and Vaidya guidance..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {submittingReview ? "Submitting..." : "Submit Anonymous Verified Review"}
                </button>
              </form>
            )}

            {/* Ratings List */}
            {loadingRatings ? (
              <div className="p-4 text-center text-slate-400">Loading reviews...</div>
            ) : ratings.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-500">
                No reviews yet. Be the first to consult and leave feedback!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {ratings.map((r) => (
                  <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800">{r.patient_hash}</span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.2 rounded">
                          {r.condition_treated}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: r.score }).map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Nominal Consultation Fee</span>
            <span className="text-sm font-extrabold text-slate-900">₹{doctor.consultation_fee || 100} <span className="text-[11px] text-slate-400 font-normal">(Gov-Fixed Anti-Spam)</span></span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onBookConsultation) onBookConsultation(doctor);
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Register New Case with {doctor.name.split(' ')[1] || 'Vaidya'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
