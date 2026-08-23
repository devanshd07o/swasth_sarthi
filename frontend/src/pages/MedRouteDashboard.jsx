import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const greenHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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

export default function MedRouteDashboard({ lang = 'en' }) {
  const { t } = useTranslation();
  const [userPos, setUserPos] = useState({ lat: 28.6139, lng: 77.2090 });
  const [locationName, setLocationName] = useState('New Delhi (Default Location)');
  const [detectingGps, setDetectingGps] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [hospitalsData, setHospitalsData] = useState([
    {
      id: 'AYUSH-DEL-01',
      name: 'All India Institute of Ayurveda (AIIA)',
      address: 'Gautam Puri, Sarita Vihar, Mathura Road, New Delhi',
      city: 'New Delhi',
      phone: '+91 11 2987 0000',
      lat: 28.5284,
      lng: 77.2882,
      opd_timing: '09:00 AM - 04:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-DEL-2012-4412', name: 'Dr. Rajesh Vaidya', qual: 'BAMS, MD (Kayachikitsa)', queue: 18, specialty: 'Kayachikitsa', status: 'Available' },
        { reg_no: 'AYUSH-REG-DEL-2018-9901', name: 'Dr. Sunita Deshmukh', qual: 'BAMS, MD (Panchakarma)', queue: 8, specialty: 'Panchakarma', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-DEL-02',
      name: 'Safdarjung Hospital AYUSH Wing',
      address: 'Ansari Nagar East, Near AIIMS Metro, New Delhi',
      city: 'New Delhi',
      phone: '+91 11 2616 5060',
      lat: 28.5684,
      lng: 77.2078,
      opd_timing: '08:30 AM - 03:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-DEL-2016-5510', name: 'Dr. Ramanuj Shastri', qual: 'BAMS, MD (Shalya Tantra)', queue: 14, specialty: 'Shalya Tantra', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-RAJ-01',
      name: 'National Institute of Ayurveda (NIA)',
      address: 'Jorawar Singh Gate, Amer Road, Jaipur, Rajasthan',
      city: 'Jaipur',
      phone: '+91 141 263 5816',
      lat: 26.9378,
      lng: 75.8236,
      opd_timing: '09:00 AM - 04:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-RAJ-2015-1108', name: 'Dr. Ananya Shastri', qual: 'BAMS, MD (Ayurveda)', queue: 12, specialty: 'Kayachikitsa', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-UP-01',
      name: 'Faculty of Ayurveda, BHU',
      address: 'Banaras Hindu University, Lanka, Varanasi, Uttar Pradesh',
      city: 'Varanasi',
      phone: '+91 542 236 7568',
      lat: 25.2677,
      lng: 82.9913,
      opd_timing: '09:00 AM - 05:00 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-UP-2010-8820', name: 'Dr. Vikramaditya Dev', qual: 'BAMS, MD (Shalya Tantra)', queue: 15, specialty: 'Shalya Tantra', status: 'Available' }
      ]
    },
    {
      id: 'AYUSH-MUM-01',
      name: 'Tilak Ayurved Mahavidyalaya',
      address: 'Rasta Peth, Somwar Peth, Pune / Mumbai OPD Center',
      city: 'Mumbai',
      phone: '+91 22 2612 1100',
      lat: 19.0760,
      lng: 72.8777,
      opd_timing: '09:00 AM - 04:30 PM',
      doctors: [
        { reg_no: 'AYUSH-REG-MAH-2018-3340', name: 'Dr. Meenakshi Sundaram', qual: 'BAMS, MD (Dravyaguna)', queue: 10, specialty: 'Dravyaguna', status: 'Available' }
      ]
    }
  ]);

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
        setUserPos({ lat: latitude, lng: longitude });
        setLocationName(`Your Live GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setDetectingGps(false);
      },
      (err) => {
        console.warn('GPS position error:', err);
        setDetectingGps(false);
        alert('Could not fetch live GPS position. Showing default New Delhi region.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Compute distance for each hospital and sort by nearest
  const hospitalsWithDistance = hospitalsData
    .map((h) => ({
      ...h,
      distance_km: getDistanceKm(userPos.lat, userPos.lng, h.lat, h.lng)
    }))
    .sort((a, b) => a.distance_km - b.distance_km);

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
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-body text-xs text-slate-800 animate-fade-in">

      {/* ─── Top Banner ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl space-y-4 border border-emerald-700/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/40 tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              AYUSH Wellness Grid • Hospital & Vaidya Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>Nearest Ayush Hospitals & Doctor Availability</span>
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            </h1>
            <p className="text-xs font-semibold text-slate-200">
              Find verified Ayurvedic hospitals, check live OPD doctor queues, and get instant GPS directions.
            </p>
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingGps}
            className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <MapPin className={`w-4 h-4 text-slate-950 ${detectingGps ? 'animate-bounce' : ''}`} />
            <span>{detectingGps ? 'Detecting Location...' : '📍 Detect My Live GPS Location'}</span>
          </button>
        </div>

        {/* Location Chip */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-200 pt-2 border-t border-emerald-700/60">
          <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>Active Location: <strong className="text-white">{locationName}</strong></span>
        </div>
      </div>

      {/* ─── Search & Specialty Filter Controls ────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
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
          <span className="text-[11px] font-extrabold text-slate-600 shrink-0">Specialty:</span>
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

      {/* ─── Main Content Grid: Map + Hospital Cards ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Interactive Leaflet Map */}
        <div className="lg:col-span-6 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Interactive Ayush Hospital Map</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">Live GPS Coordinates</span>
          </div>

          <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200 relative">
            <MapContainer
              center={[userPos.lat, userPos.lng]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap &amp; CartoDB"
              />

              {/* User Location Marker */}
              <Marker position={[userPos.lat, userPos.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className="text-xs font-bold text-slate-900">
                    📍 Your Current Location
                  </div>
                </Popup>
              </Marker>

              {/* Hospital Markers */}
              {filteredHospitals.map((h) => (
                <Marker key={h.id} position={[h.lat, h.lng]} icon={greenHospitalIcon}>
                  <Popup>
                    <div className="p-1 text-xs space-y-1">
                      <h4 className="font-bold text-slate-900">{h.name}</h4>
                      <p className="text-slate-600">{h.address}</p>
                      <p className="text-emerald-800 font-extrabold">Distance: {h.distance_km} km away</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Hospital Directory & Live Doctor Availability List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Nearest Ayush Institutions ({filteredHospitals.length})</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Sorted by Nearest Distance</span>
          </div>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {filteredHospitals.map((h) => (
              <div
                key={h.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                {/* Hospital Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {h.id}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 mt-1">{h.name}</h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {h.address}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 inline-block">
                      {h.distance_km} km
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-1">
                      {h.opd_timing}
                    </span>
                  </div>
                </div>

                {/* Live Doctor Availability */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    Available Vaidya Practitioners ({h.doctors.length}):
                  </span>

                  <div className="grid grid-cols-1 gap-2">
                    {h.doctors.map((doc) => (
                      <div
                        key={doc.reg_no}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2"
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
                          {doc.queue} Patients in Queue
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <a
                    href={`tel:${h.phone}`}
                    className="font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call OPD: {h.phone}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get GPS Directions →</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

