import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Siren, Navigation, ShieldAlert, Award, Clock, MapPin } from 'lucide-react';
import axios from 'axios';

const greenHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MedRouteDashboard() {
  const { t } = useTranslation();
  const [pickupPos] = useState({ lat: 28.6139, lng: 77.2090 });
  const [reqForm, setReqForm] = useState({
    patient_condition: 'Severe Trauma & Respiration Distress',
    requires_icu: true,
    requires_ventilator: true,
    requires_trauma: true,
    requires_blood_bank: true,
    required_specialist: 'cardiologist',
  });

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunMedRouteScoring = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/emergency/find-best-hospitals', {
        pickup_lat: pickupPos.lat,
        pickup_lng: pickupPos.lng,
        ...reqForm,
      });
      setHospitals(res.data.recommended_hospitals);
      if (res.data.recommended_hospitals.length > 0) {
        setSelectedHospital(res.data.recommended_hospitals[0]);
      }
    } catch (e) {
      console.error('MedRoute scoring error', e);
    } finally {
      setLoading(false);
    }
  };

  const triageParams = [
    { key: 'requires_icu', label: t('admin.triageIcu', 'Requires ICU') },
    { key: 'requires_ventilator', label: t('admin.triageVentilator', 'Requires Ventilator') },
    { key: 'requires_trauma', label: t('admin.triageTrauma', 'Trauma Center') },
    { key: 'requires_blood_bank', label: t('admin.triageBloodBank', 'Blood Bank') },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {t('admin.medRoutePill', 'MedRoute Module \u2022 Emergency Routing Engine')}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Siren className="w-6 h-6 text-rose-600 animate-pulse" />
            <span>{t('admin.medRouteTitle', 'Real-Time Ambulance Hospital Routing & Scoring')}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            {t('admin.medRouteSubtitle', 'Dynamic 100-Point Match Score based on real-time ICU beds, ventilators, travel ETA & emergency load.')}
          </p>
        </div>

        <button
          onClick={handleRunMedRouteScoring}
          disabled={loading}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>{loading ? t('admin.medRouteCalculating', 'Calculating Route...') : t('admin.medRouteRun', 'Run MedRoute Scoring Engine')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Map */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>{t('admin.medRouteMapTitle', 'Live Emergency Location Map (Delhi NCR)')}</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">CartoDB Light Theme</span>
          </div>

          <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200 relative">
            <MapContainer
              center={[28.56, 77.20]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap &amp; CartoDB"
              />

              <Marker position={[pickupPos.lat, pickupPos.lng]} icon={ambulanceIcon}>
                <Popup>
                  <div className="text-xs font-bold">{t('admin.ambulanceLabel', 'Ambulance AMB-101 (Emergency Dispatch)')}</div>
                </Popup>
              </Marker>

              {hospitals.map((h) => (
                <Marker
                  key={h.hospital_id}
                  position={[h.lat, h.lng]}
                  icon={h.icu_available > 0 ? greenHospitalIcon : redHospitalIcon}
                  onClick={() => setSelectedHospital(h)}
                >
                  <Popup>
                    <div className="p-1 text-xs font-semibold">
                      <h4 className="font-bold text-slate-900">{h.hospital_name}</h4>
                      <p className="text-emerald-700 font-bold">{t('admin.matchScore', 'Match Score')}: {h.total_score} / 100</p>
                      <p className="text-slate-600">ICU: {h.icu_available} | ETA: {h.eta_minutes} min</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedHospital && (
                <Polyline
                  positions={[
                    [pickupPos.lat, pickupPos.lng],
                    [selectedHospital.lat, selectedHospital.lng],
                  ]}
                  color="#e11d48"
                  weight={4}
                  dashArray="8, 8"
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-5 space-y-4">

          {/* Triage Parameters */}
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>{t('admin.triageTitle', 'Emergency Triage Parameters')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {triageParams.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800 cursor-pointer hover:border-rose-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={reqForm[key]}
                    onChange={(e) => setReqForm({ ...reqForm, [key]: e.target.checked })}
                    className="rounded text-rose-600"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ranked Hospital Results */}
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{t('admin.rankedTitle', 'Ranked Hospital Match Results')}</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">100-pt {t('admin.scoringLabel', 'Scoring')}</span>
            </h3>

            {hospitals.length === 0 ? (
              <div className="text-center py-8 text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                {t('admin.medRouteEmpty', 'Click "Run MedRoute Scoring Engine" to evaluate.')}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {hospitals.map((h, i) => {
                  const isSelected = selectedHospital?.hospital_id === h.hospital_id;
                  return (
                    <div
                      key={h.hospital_id}
                      onClick={() => setSelectedHospital(h)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-rose-50/60 border-rose-400 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            #{i + 1}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900">{h.hospital_name}</h4>
                        </div>
                        <span className="font-black text-sm text-emerald-700">{h.total_score} pts</span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full"
                          style={{ width: `${h.total_score}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          ETA: <strong className="text-slate-900">{h.eta_minutes} min</strong> ({h.distance_km} km)
                        </span>
                        <span>ICU: <strong className="text-emerald-700">{h.icu_available} beds</strong></span>
                        <span className="capitalize text-slate-400">{t('admin.load', 'Load')}: {h.emergency_load}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
