import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Siren, Navigation, ShieldAlert, Award, Clock, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const greenHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MedRouteDashboard() {
  const [pickupPos] = useState({ lat: 28.6139, lng: 77.2090 });
  const [reqForm, setReqForm] = useState({
    patient_condition: "Severe Trauma & Respiration Distress",
    requires_icu: true,
    requires_ventilator: true,
    requires_trauma: true,
    requires_blood_bank: true,
    required_specialist: "cardiologist"
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
        ...reqForm
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            MedRoute Module • Emergency Routing Engine
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            <Siren className="w-6 h-6 text-rose-600 animate-pulse" />
            <span>Real-Time Ambulance Hospital Routing & Scoring</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Dynamic 100-Point Match Score based on real-time ICU beds, ventilators, travel ETA & emergency load.
          </p>
        </div>

        <button
          onClick={handleRunMedRouteScoring}
          disabled={loading}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-xs flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          <span>{loading ? "Calculating Route..." : "Run MedRoute Scoring Engine"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map */}
        <div className="lg:col-span-7 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Live Emergency Location Map (Delhi NCR)</span>
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
                attribution="&copy; OpenStreetMap & CartoDB"
              />

              <Marker position={[pickupPos.lat, pickupPos.lng]} icon={ambulanceIcon}>
                <Popup>
                  <div className="text-xs font-bold">🚑 Ambulance AMB-101 (Emergency Dispatch)</div>
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
                      <p className="text-emerald-700 font-bold">Match Score: {h.total_score} / 100</p>
                      <p className="text-slate-600">ICU Beds: {h.icu_available} | ETA: {h.eta_minutes} min</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedHospital && (
                <Polyline
                  positions={[
                    [pickupPos.lat, pickupPos.lng],
                    [selectedHospital.lat, selectedHospital.lng]
                  ]}
                  color="#e11d48"
                  weight={4}
                  dashArray="8, 8"
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Panel */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Emergency Triage Parameters</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={reqForm.requires_icu}
                  onChange={(e) => setReqForm({ ...reqForm, requires_icu: e.target.checked })}
                  className="rounded text-rose-600"
                />
                <span>Requires ICU</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={reqForm.requires_ventilator}
                  onChange={(e) => setReqForm({ ...reqForm, requires_ventilator: e.target.checked })}
                  className="rounded text-rose-600"
                />
                <span>Requires Ventilator</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={reqForm.requires_trauma}
                  onChange={(e) => setReqForm({ ...reqForm, requires_trauma: e.target.checked })}
                  className="rounded text-rose-600"
                />
                <span>Trauma Center</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={reqForm.requires_blood_bank}
                  onChange={(e) => setReqForm({ ...reqForm, requires_blood_bank: e.target.checked })}
                  className="rounded text-rose-600"
                />
                <span>Blood Bank</span>
              </label>
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Ranked Hospital Match Results</span>
              </span>
              <span className="text-[10px] text-slate-400">100-pt Scoring</span>
            </h3>

            {hospitals.length === 0 ? (
              <div className="text-center py-8 text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                Click "Run MedRoute Scoring Engine" to evaluate.
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
                          ? 'bg-rose-50/60 border-rose-400 shadow-xs'
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
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          ETA: <strong className="text-slate-900">{h.eta_minutes} min</strong> ({h.distance_km} km)
                        </span>
                        <span>ICU: <strong className="text-emerald-700">{h.icu_available} beds</strong></span>
                        <span className="capitalize text-slate-400">Load: {h.emergency_load}</span>
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
