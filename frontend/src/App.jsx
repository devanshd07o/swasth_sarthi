import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import HeaderPortalModal from './components/HeaderPortalModal';

export default function App() {
  const { i18n } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('swasth_lang') || 'en');
  
  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState('patient');
  const [isHeaderPortalOpen, setIsHeaderPortalOpen] = useState(false);

  const handleOpenAuth = (role = 'patient') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  // App Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState('ABHA-9821-4501');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    if (userData.role === 'patient') {
      const pId = userData.abha_id || userData.id || 'ABHA-9821-4501';
      setSelectedPatientId(pId);
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
    <div key={i18n.language} className={`h-screen max-h-screen overflow-hidden bg-bg text-ink flex flex-col font-body antialiased lang-${i18n.language}`}>
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsHeaderPortalOpen(true)}
        onLogout={handleLogout}
        onNavigateSettings={() => setActiveTab('settings')}
        onNavigateHome={() => setCurrentUser(null)}
        onToggleMobileSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onQuickAction={() => {
          if (currentUser?.role === 'patient') {
            setActiveTab('triage');
          } else if (currentUser?.role === 'doctor') {
            setActiveTab('case_form');
          }
        }}
        lang={lang}
        setLang={setLang}
      />

      {/* Main Content Layout */}
      {!currentUser ? (
        // 1. PUBLIC FULL-SCREEN LANDING PAGE (NO SIDEBAR)
        <main className="flex-1 w-full overflow-y-auto min-h-0">
          <PublicLanding
            onOpenAuth={handleOpenAuth}
            lang={lang}
          />
        </main>
      ) : (
        // 2. AUTHENTICATED PORTALS (WITH COLLAPSIBLE SIDEBAR)
        <div className="flex-1 flex w-full min-w-0 overflow-hidden min-h-0 bg-gradient-to-b from-white via-[#EBF3EF] via-65% to-[#C1DCD0]">
          <Sidebar
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            lang={lang}
            setLang={setLang}
          />

          <main className="flex-1 p-2 sm:p-3 md:p-4 overflow-y-auto min-w-0">
            {/* DOCTOR ROLE TABS */}
            {currentUser.role === 'doctor' && (
              <>
                {activeTab === 'dashboard' && (
                  <DoctorDashboard
                    onNewCase={() => setActiveTab('case_form')}
                    onSelectPatient={handleOpenTimeline}
                    currentDoctorId={currentUser?.doctor_id || currentUser?.id || "DOC-AYUR-101"}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'case_form' && (
                  <AyurSaarthiCaseForm
                    onCaseSaved={() => setActiveTab('dashboard')}
                    onSelectPatientTimeline={handleOpenTimeline}
                    currentDoctorId={currentUser?.doctor_id || currentUser?.id || "DOC-AYUR-101"}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'patients' && (
                  <PatientDirectory
                    onSelectPatient={handleOpenTimeline}
                    onNewCase={() => setActiveTab('case_form')}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'timeline' && (
                  <PatientTimeline
                    patientId={selectedPatientId}
                    onBack={() => setActiveTab('dashboard')}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'medroute' && <MedRouteDashboard lang={lang} />}
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
                    lang={lang}
                  />
                )}
                {activeTab === 'medroute' && <MedRouteDashboard lang={lang} />}
              </>
            )}

            {/* HOSPITAL ADMIN ROLE TABS */}
            {currentUser.role === 'hospital_admin' && (
              <>
                {activeTab === 'medroute' && <MedRouteDashboard lang={lang} />}
                {activeTab === 'inventory' && <MedRouteDashboard lang={lang} />}
              </>
            )}

            {/* SUPER ADMIN ROLE TABS */}
            {currentUser.role === 'super_admin' && (
              <>
                {(activeTab === 'national_analytics' || activeTab === 'hospital_registry') && (
                  <SuperAdminPortal lang={lang} />
                )}
              </>
            )}

            {/* COMMON SETTINGS TAB */}
            {activeTab === 'settings' && (
              <UserSettings
                currentUser={currentUser}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                lang={lang}
              />
            )}
          </main>
        </div>
      )}

      {/* Floating Voice AI Orb Assistant Widget on all authenticated screens */}
      {currentUser && (
        <div className="fixed bottom-4 right-4 z-50">
          <VoiceAIOrb lang={lang} />
        </div>
      )}

      {/* Unified Auth Popup Modal */}
      <UnifiedAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        initialRole={authRole}
      />

      {/* Independent Header Portal Modal */}
      <HeaderPortalModal
        isOpen={isHeaderPortalOpen}
        onClose={() => setIsHeaderPortalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
      />
    </div>
  );
}
