import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UnifiedAuthModal from './components/UnifiedAuthModal';
import PublicLanding from './pages/PublicLanding';
import UserSettings from './pages/UserSettings';
import AyurSaarthiCaseForm from './pages/AyurSaarthiCaseForm';
import PatientTimeline from './pages/PatientTimeline';
import PatientDirectory from './pages/PatientDirectory';
import DoctorDashboard from './pages/DoctorDashboard';
import MedRouteDashboard from './pages/MedRouteDashboard';
import PatientPortal from './pages/PatientPortal';
import SuperAdminPortal from './pages/SuperAdminPortal';
import VoiceAIOrb from './components/VoiceAIOrb';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [lang, setLang] = useState('en'); // 'en' or 'hi'
  
  // Unified Auth Modal Popup
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState('ABHA-9821-4501');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    if (userData.role === 'patient') {
      setActiveTab('triage');
    } else if (userData.role === 'super_admin') {
      setActiveTab('national_analytics');
    } else if (userData.role === 'hospital_admin') {
      setActiveTab('medroute');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleOpenTimeline = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab('timeline');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNavigateSettings={() => setActiveTab('settings')}
        onNavigateHome={() => setCurrentUser(null)}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Layout */}
      {!currentUser ? (
        // 1. PUBLIC FULL-SCREEN LANDING PAGE (NO SIDEBAR)
        <main className="flex-1 w-full max-w-7xl mx-auto">
          <PublicLanding
            onOpenAuth={() => setIsAuthOpen(true)}
            lang={lang}
          />
        </main>
      ) : (
        // 2. AUTHENTICATED PORTALS (WITH COLLAPSIBLE SIDEBAR)
        <div className="flex-1 flex w-full">
          <Sidebar
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            onOpenAuth={() => setIsAuthOpen(true)}
          />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {/* DOCTOR ROLE TABS */}
            {currentUser.role === 'doctor' && (
              <>
                {activeTab === 'dashboard' && (
                  <DoctorDashboard
                    onNewCase={() => setActiveTab('case_form')}
                    onSelectPatient={handleOpenTimeline}
                    currentDoctorId={currentUser?.doctor_id || "DOC-AYUR-101"}
                  />
                )}
                {activeTab === 'case_form' && (
                  <AyurSaarthiCaseForm
                    onCaseSaved={() => setActiveTab('dashboard')}
                    onSelectPatientTimeline={handleOpenTimeline}
                    currentDoctorId={currentUser?.doctor_id || "DOC-AYUR-101"}
                  />
                )}
                {activeTab === 'patients' && (
                  <PatientDirectory
                    onSelectPatient={handleOpenTimeline}
                    onNewCase={() => setActiveTab('case_form')}
                  />
                )}
                {activeTab === 'timeline' && (
                  <PatientTimeline
                    patientId={selectedPatientId}
                    onBack={() => setActiveTab('dashboard')}
                    currentDoctorId={currentUser?.doctor_id || "DOC-AYUR-101"}
                  />
                )}
                {activeTab === 'medroute' && <MedRouteDashboard />}
              </>
            )}

            {/* PATIENT ROLE TABS */}
            {currentUser.role === 'patient' && (
              <>
                {activeTab === 'triage' && (
                  <PatientPortal
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'timeline' && (
                  <PatientTimeline
                    patientId={selectedPatientId || 'ABHA-9821-4501'}
                    onBack={() => setActiveTab('triage')}
                    currentDoctorId={null}
                  />
                )}
              </>
            )}

            {/* HOSPITAL ADMIN ROLE TABS */}
            {currentUser.role === 'hospital_admin' && (
              <>
                {activeTab === 'medroute' && <MedRouteDashboard />}
                {activeTab === 'inventory' && <MedRouteDashboard />}
              </>
            )}

            {/* SUPER ADMIN ROLE TABS */}
            {currentUser.role === 'super_admin' && (
              <>
                {(activeTab === 'national_analytics' || activeTab === 'hospital_registry') && (
                  <SuperAdminPortal />
                )}
              </>
            )}

            {/* COMMON SETTINGS TAB */}
            {activeTab === 'settings' && (
              <UserSettings
                currentUser={currentUser}
                onUpdateUser={(updated) => setCurrentUser(updated)}
              />
            )}
          </main>
        </div>
      )}

      {/* Floating Voice AI Orb Assistant Widget on all authenticated screens */}
      {currentUser && (
        <div className="fixed bottom-6 right-6 z-50">
          <VoiceAIOrb lang={lang} />
        </div>
      )}

      {/* Unified Auth Popup Modal */}
      <UnifiedAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs font-medium text-slate-500">
        SwasthSaarthi / MediKiosk — Integrated AyurSaarthi AI Platform • Ministry of Ayush (SIH26047)
      </footer>
    </div>
  );
}
