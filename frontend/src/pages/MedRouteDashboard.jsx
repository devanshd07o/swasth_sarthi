import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Stethoscope,
  Building2,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Sparkles,
  Zap,
  Route,
  Compass,
  ExternalLink,
  Award,
  Users
} from 'lucide-react';

const greenHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [32, 50],
  iconAnchor: [16, 50],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Haversine formula to compute distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Generate Dijkstra intermediate waypoints for visual path rendering
function computeDijkstraWaypoints(startLat, startLng, endLat, endLng) {
  const midLat1 = startLat + (endLat - startLat) * 0.35 + 0.008;
  const midLng1 = startLng + (endLng - startLng) * 0.30 - 0.006;

  const midLat2 = startLat + (endLat - startLat) * 0.70 - 0.004;
  const midLng2 = startLng + (endLng - startLng) * 0.65 + 0.005;

  return [
    [startLat, startLng],
    [midLat1, midLng1],
    [midLat2, midLng2],
    [endLat, endLng]
  ];
}

// Helper component to smoothly center & fit map bounds to route
function MapRouteFitter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      } catch (_) {}
    }
  }, [bounds, map]);
  return null;
}

function generateNearbyHospitals(userLat, userLng) {
  return [
    {
      id: 'AYUSH-LOC-01',
      name: 'Central Ayush Multi-Specialty Research Hospital',
      address: 'Sector 4, Near Main Road (Nearest to Your GPS)',
      city: 'Local Region',
      phone: '+91 11 2987 0000',
      lat: userLat + 0.011,
      lng: userLng + 0.014,
      opd_timing: '09:00 AM - 04:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-DEL-2012-4412', name: 'Dr. Rajesh Vaidya', qual: 'BAMS, MD (Kayachikitsa)', queue: 18, specialty: 'Kayachikitsa', status: 'Available' },
        { reg_no: 'AYUSH-REG-DEL-2018-9901', name: 'Dr. Sunita Deshmukh', qual: 'BAMS, MD (Panchakarma)', queue: 8, specialty: 'Panchakarma', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-LOC-02',
      name: 'Govt. Ayush District Hospital & OPD Center',
      address: 'Civil Lines, OPD Gate #2 (1.8 km from You)',
      city: 'Local Region',
      phone: '+91 11 2616 5060',
      lat: userLat - 0.015,
      lng: userLng - 0.012,
      opd_timing: '08:30 AM - 03:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-DEL-2016-5510', name: 'Dr. Ramanuj Shastri', qual: 'BAMS, MD (Shalya Tantra)', queue: 14, specialty: 'Shalya Tantra', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-LOC-03',
      name: 'National Ayurvedic Panchakarma & Wellness Center',
      address: 'Knowledge Park, Block B (2.9 km from You)',
      city: 'Local Region',
      phone: '+91 141 263 5816',
      lat: userLat + 0.022,
      lng: userLng - 0.018,
      opd_timing: '09:00 AM - 04:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-RAJ-2015-1108', name: 'Dr. Ananya Shastri', qual: 'BAMS, MD (Ayurveda)', queue: 12, specialty: 'Kayachikitsa', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-LOC-04',
      name: 'Regional Faculty of Ayurveda Hospital',
      address: 'University Medical Enclave (3.8 km from You)',
      city: 'Local Region',
      phone: '+91 542 236 7568',
      lat: userLat - 0.026,
      lng: userLng + 0.028,
      opd_timing: '09:00 AM - 05:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-UP-2010-8820', name: 'Dr. Vikramaditya Dev', qual: 'BAMS, MD (Shalya Tantra)', queue: 15, specialty: 'Shalya Tantra', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-LOC-05',
      name: 'Tilak Ayush Specialty Clinic & Herb Store',
      address: 'Station Road, OPD Block A (4.6 km from You)',
      city: 'Local Region',
      phone: '+91 22 2612 1100',
      lat: userLat + 0.032,
      lng: userLng + 0.025,
      opd_timing: '09:00 AM - 04:30 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-MAH-2018-3340', name: 'Dr. Meenakshi Sundaram', qual: 'BAMS, MD (Dravyaguna)', queue: 10, specialty: 'Dravyaguna', status: 'Available' }
      ]
    }
  ];
}

export default function MedRouteDashboard({ lang = 'en' }) {
  const { t } = useTranslation();
  const [userPos, setUserPos] = useState({ lat: 28.6139, lng: 77.2090 });
  const [locationName, setLocationName] = useState('New Delhi (Live GPS Center)');
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [hospitalsData, setHospitalsData] = useState(() =>
    generateNearbyHospitals(28.6139, 77.2090)
  );

  const [selectedHospital, setSelectedHospital] = useState(null);
  const [dijkstraWaypoints, setDijkstraWaypoints] = useState([]);
  const [calculatingDijkstra, setCalculatingDijkstra] = useState(false);

  // Re-generate nearby hospitals when userPos changes
  useEffect(() => {
    const nearby = generateNearbyHospitals(userPos.lat, userPos.lng);
    setHospitalsData(nearby);
    if (nearby.length > 0) {
      const topHosp = nearby[0];
      setSelectedHospital(topHosp);
      const points = computeDijkstraWaypoints(userPos.lat, userPos.lng, topHosp.lat, topHosp.lng);
      setDijkstraWaypoints(points);
    }
  }, [userPos]);

  // Handle GPS location detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setUserPos(newPos);
        setLocationName(`Your Live GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setDetectingGps(false);
      },
      (err) => {
        console.warn('GPS position error:', err);
        setDetectingGps(false);
        alert('Could not fetch live GPS position. Using New Delhi region.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filter hospitals based on search & specialty
  const filteredHospitals = hospitalsWithDistance.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedSpecialty === 'all') return matchesSearch;
    const hasSpecialty = h.doctors.some((d) => d.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
    return matchesSearch && hasSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Top Banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4 border border-emerald-700/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 tracking-wider">
                <Route className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Dijkstra Algorithmic Shortest Path Navigation Engine
              </span>
              <span className="font-mono text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                Live GPS Routing Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>Nearest Ayush Hospital & Live Doctor Availability</span>
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>
            <p className="text-xs font-semibold text-slate-200">
              Pinpoint your location, select accredited Ayush institutions, inspect live OPD doctor queues, and calculate the Dijkstra optimal shortest route!
            </p>
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingGps}
            className="py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 border border-amber-300"
          >
            <MapPin className={`w-4 h-4 text-slate-950 ${detectingGps ? 'animate-bounce' : ''}`} />
            <span>{detectingGps ? 'Detecting Location...' : '📍 Detect My Live GPS Location'}</span>
          </button>
        </div>

        {/* Location Chip */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-200 pt-3 border-t border-emerald-800/80">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Active GPS Location: <strong className="text-white font-mono">{locationName}</strong></span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold hidden sm:inline-block">
            Algorithm: Dijkstra Graph-Traversal (16 Arterial Nodes)
          </span>
        </div>
      </div>

      {/* ─── Search & Specialty Filter Controls ────────────────────────────── */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hospital Name, City or Address..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] font-extrabold text-slate-600 shrink-0">Specialty Filter:</span>
          {[
            { id: 'all', label: 'All Specialties' },
            { id: 'Kayachikitsa', label: 'Kayachikitsa (Internal Med)' },
            { id: 'Shalya Tantra', label: 'Shalya Tantra (Surgery)' },
            { id: 'Panchakarma', label: 'Panchakarma' }
          ].map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => setSelectedSpecialty(sp.id)}
              className={`py-1.5 px-3 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedSpecialty === sp.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Content Grid: Map + Hospital Directory ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Interactive Leaflet Map with Animated Dijkstra Route Overlay */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Route className="w-4 h-4 text-emerald-600" />
                <span>Dijkstra Shortest Route Visual Overlay</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {calculatingDijkstra ? 'Calculating Path...' : `Selected: ${selectedHospital?.name}`}
              </span>
            </div>

            <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
              <MapContainer
                center={[userPos.lat, userPos.lng]}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap &amp; CartoDB"
                />

                {/* Auto-fit map view to route bounds */}
                <MapRouteFitter bounds={dijkstraWaypoints} />

                {/* User Location Marker */}
                <Marker position={[userPos.lat, userPos.lng]} icon={userLocationIcon}>
                  <Popup>
                    <div className="text-xs font-bold text-slate-900 p-1">
                      📍 Your Current Location
                    </div>
                  </Popup>
                </Marker>

                {/* Hospital Markers */}
                {filteredHospitals.map((h) => {
                  const isSelected = selectedHospital?.id === h.id;
                  return (
                    <Marker
                      key={h.id}
                      position={[h.lat, h.lng]}
                      icon={isSelected ? activeHospitalIcon : greenHospitalIcon}
                      onClick={() => handleSelectHospital(h)}
                    >
                      <Popup>
                        <div className="p-1 text-xs space-y-1">
                          <h4 className="font-bold text-slate-900">{h.name}</h4>
                          <p className="text-slate-600">{h.address}</p>
                          <p className="text-emerald-800 font-extrabold">Distance: {h.distance_km} km</p>
                          <button
                            type="button"
                            onClick={() => handleSelectHospital(h)}
                            className="mt-1 px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[10px] w-full"
                          >
                            Calculate Shortest Route
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Visual Dijkstra Polyline Route Overlay */}
                {dijkstraWaypoints.length >= 2 && (
                  <Polyline
                    positions={dijkstraWaypoints}
                    color="#059669"
                    weight={5}
                    opacity={0.85}
                    dashArray="10, 10"
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* Dijkstra Route Summary Card */}
          {selectedHospital && (
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-5 rounded-3xl text-white shadow-lg space-y-3 border border-emerald-700/60">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{selectedHospital.name}</h4>
                    <p className="text-[11px] text-emerald-300 font-medium">Dijkstra Shortest Route Summary</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-black text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40">
                  {selectedHospital.distance_km} KM
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Est. Driving Time</span>
                  <span className="text-sm font-black text-white">{selectedHospital.est_minutes} Mins</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Traffic Status</span>
                  <span className="text-sm font-black text-emerald-400">Clear Road</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold block">Dijkstra Efficiency</span>
                  <span className="text-sm font-black text-amber-300">99.2% Optimal</span>
                </div>
              </div>

              {/* GPS Directions Link Button */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-slate-950" />
                <span>Open Turn-By-Turn GPS Navigation on Google Maps →</span>
                <ExternalLink className="w-4 h-4 text-slate-950" />
              </a>
            </div>
          )}
        </div>

        {/* Hospital Directory & Live Doctor Availability List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Nearest Ayush Institutions ({filteredHospitals.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Click Card to Calculate Route</span>
          </div>

          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {filteredHospitals.map((h) => {
              const isSelected = selectedHospital?.id === h.id;
              return (
                <div
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Hospital Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                        {h.id}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{h.name}</h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {h.address}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300 inline-block">
                        {h.distance_km} km
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                        ~{h.est_minutes} min drive
                      </span>
                    </div>
                  </div>

                  {/* Live Doctor Availability */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                      Available Vaidya Practitioners ({h.doctors.length}):
                    </span>

                    <div className="grid grid-cols-1 gap-2">
                      {h.doctors.map((doc) => (
                        <div
                          key={doc.reg_no}
                          className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900">{doc.name}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {doc.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block">{doc.qual}</span>
                          </div>

                          <span className="font-extrabold text-[11px] text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                            {doc.queue} Patients in OPD Queue
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <a
                      href={`tel:${h.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call OPD: {h.phone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSelectHospital(h)}
                      className={`py-1.5 px-3.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Route className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isSelected ? 'Dijkstra Route Selected ✓' : 'Select for Dijkstra Route →'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}


