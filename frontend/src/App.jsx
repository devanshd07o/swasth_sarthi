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
import DailyOPDRegister from './pages/DailyOPDRegister';
import MedRouteDashboard from './pages/MedRouteDashboard';
import PatientPortal from './pages/PatientPortal';
import SuperAdminPortal from './pages/SuperAdminPortal';
import VoiceAIOrb from './components/VoiceAIOrb';
import HeaderPortalModal from './components/HeaderPortalModal';
import MinistryCommandCenter from './pages/admin/MinistryCommandCenter';
import PanIndiaHospitalNetwork from './pages/admin/PanIndiaHospitalNetwork';
import VaidyaDoctorRoster from './pages/admin/VaidyaDoctorRoster';
import PanchakarmaBedInventory from './pages/admin/PanchakarmaBedInventory';
import AbdmComplianceLogs from './pages/admin/AbdmComplianceLogs';

export default function App() {
  const { i18n } = useTranslation();
  
  // Hydrate logged in user & active tab from localStorage for session persistence across refreshes
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('swasth_user') || localStorage.getItem('ss_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

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
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const savedUser = localStorage.getItem('swasth_user') || localStorage.getItem('ss_current_user');
      const user = savedUser ? JSON.parse(savedUser) : null;

      if (user) {
        if (user.role === 'doctor') {
          return 'dashboard';
        } else if (user.role === 'super_admin' || user.role === 'hospital_admin') {
          return 'admin_command';
        } else if (user.role === 'patient') {
          return 'triage';
        }
      }
      return 'triage';
    } catch (_) {
      return 'triage';
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    return localStorage.getItem('ss_active_patient_id') || null;
  });
  const [activeConsultingPatientId, setActiveConsultingPatientId] = useState(() => {
    return localStorage.getItem('ss_active_opd_token1') || null;
  });

  const updateSelectedPatientId = (newId) => {
    setSelectedPatientId(newId);
    if (newId) localStorage.setItem('ss_active_patient_id', newId);
    else localStorage.removeItem('ss_active_patient_id');
  };
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // Sync session state to localStorage
  React.useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ss_current_user', JSON.stringify(currentUser));
      localStorage.setItem('swasth_user', JSON.stringify(currentUser));
      if (!localStorage.getItem('swasth_jwt_token')) {
        localStorage.setItem('swasth_jwt_token', currentUser.token || `jwt_${currentUser.role}_2026`);
      }
    } else {
      localStorage.removeItem('ss_current_user');
      localStorage.removeItem('swasth_user');
      localStorage.removeItem('swasth_jwt_token');
      localStorage.removeItem('ss_active_tab');
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (activeTab) {
      localStorage.setItem('ss_active_tab', activeTab);
    }
  }, [activeTab]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('swasth_user', JSON.stringify(userData));
    localStorage.setItem('ss_current_user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('swasth_jwt_token', userData.token);
    }

    if (userData.role === 'patient') {
      const pId = userData.abha_id || userData.id || 'ABHA-9821-4501';
      updateSelectedPatientId(pId);
      setActiveTab('triage');
    } else if (userData.role === 'super_admin' || userData.role === 'hospital_admin') {
      setActiveTab('admin_command');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ss_current_user');
    localStorage.removeItem('swasth_user');
    localStorage.removeItem('swasth_jwt_token');
    localStorage.removeItem('ss_active_tab');
  };

  const handleOpenCaseSheet = (patientId, activeTokenId) => {
    if (patientId === 'directory' || patientId === 'patients') {
      setActiveTab('patients');
      return;
    }
    updateSelectedPatientId(patientId);
    const tokenToUse = activeTokenId || localStorage.getItem('ss_active_opd_token1') || patientId;
    if (tokenToUse) {
      setActiveConsultingPatientId(tokenToUse);
      localStorage.setItem('ss_active_opd_token1', tokenToUse);
    }
    setActiveTab('case_form');
  };

  const handleOpenTimeline = (patientId) => {
    updateSelectedPatientId(patientId);
    setActiveTab('timeline');
  };

  // Logo click: Navigate to role dashboard if logged in; reload page if logged out
  const handleNavigateHome = () => {
    if (currentUser) {
      if (currentUser.role === 'patient') {
        setActiveTab('triage');
      } else if (currentUser.role === 'super_admin') {
        setActiveTab('national_analytics');
      } else if (currentUser.role === 'hospital_admin') {
        setActiveTab('medroute');
      } else {
        setActiveTab('dashboard');
      }
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsHeaderPortalOpen(true)}
        onLogout={handleLogout}
        onNavigateSettings={() => setActiveTab('settings')}
        onNavigateHome={handleNavigateHome}
        onToggleMobileSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onQuickAction={() => {
          if (currentUser?.role === 'patient') {
            setActiveTab('triage');
          } else if (currentUser?.role === 'doctor') {
            setActiveTab('patients');
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
                    onSelectPatient={handleOpenCaseSheet}
                    onOpenTimeline={handleOpenTimeline}
                    currentDoctorId={currentUser?.doctor_id || currentUser?.id || "DOC-AYUR-101"}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'register' && (
                  <DailyOPDRegister
                    onSelectPatient={handleOpenCaseSheet}
                    onOpenCaseSheet={handleOpenCaseSheet}
                    currentDoctorId={currentUser?.doctor_id || currentUser?.id || "DOC-AYUR-101"}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'case_form' && (
                  <AyurSaarthiCaseForm
                    selectedPatientId={selectedPatientId}
                    onSelectPatientId={updateSelectedPatientId}
                    activeConsultingPatientId={activeConsultingPatientId}
                    onCaseSaved={() => setActiveTab('dashboard')}
                    onSelectPatientTimeline={handleOpenTimeline}
                    currentDoctorId={currentUser?.doctor_id || currentUser?.id || "DOC-AYUR-101"}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'patients' && (
                  <PatientDirectory
                    selectedPatientId={selectedPatientId}
                    onSelectPatientId={updateSelectedPatientId}
                    onSelectPatient={handleOpenTimeline}
                    onOpenCaseSheet={handleOpenCaseSheet}
                    onNewCase={() => setActiveTab('case_form')}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'timeline' && (
                  <PatientTimeline
                    patientId={selectedPatientId}
                    onSelectPatientId={(id) => setSelectedPatientId(id)}
                    onOpenCaseSheet={handleOpenCaseSheet}
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
                    patientId={currentUser?.abha_id || currentUser?.id || selectedPatientId || 'ABHA-9821-4501'}
                    onBack={() => setActiveTab('triage')}
                    currentDoctorId={null}
                    currentUser={currentUser}
                    lang={lang}
                  />
                )}
                {activeTab === 'medroute' && <MedRouteDashboard lang={lang} />}
              </>
            )}

            {/* HOSPITAL ADMIN & SUPER ADMIN ROLE TABS */}
            {(currentUser.role === 'hospital_admin' || currentUser.role === 'super_admin') && (
              <>
                {activeTab === 'admin_command' && <MinistryCommandCenter lang={lang} />}
                {activeTab === 'hospital_network' && <PanIndiaHospitalNetwork lang={lang} />}
                {activeTab === 'doctor_roster' && <VaidyaDoctorRoster lang={lang} />}
                {(activeTab === 'panchakarma_inventory' || activeTab === 'icu_inventory') && <PanchakarmaBedInventory lang={lang} />}
                {activeTab === 'audit_logs' && <AbdmComplianceLogs lang={lang} />}
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
        <div className="fixed bottom-24 right-3 sm:bottom-20 sm:right-4 z-50">
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
