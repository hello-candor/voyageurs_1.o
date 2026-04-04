
import React, { useState, useEffect, Suspense } from 'react';
import { InstallPrompt } from './components/InstallPrompt';
import { RSVPPrompt } from './components/RSVPPrompt';
import { ArrowUp, Lock, Loader2, EyeOff } from 'lucide-react';
import { useUser } from './context/UserContext';
import { useAuth } from './context/AuthContext';
import { useAppConfig } from './context/AppConfigContext';
import { safeStorage } from './utils/storage';
import { notificationService } from './services/notificationService';
import { OSContainer } from './components/OSContainer';
import { Button } from './components/Button';
import './styles/global.css';

// Lazy load heavy components
const TravelHub = React.lazy(() => import('./components/TravelHub').then(m => ({ default: m.TravelHub })));
const PrivacyPolicyModal = React.lazy(() => import('./components/PrivacyPolicyModal').then(m => ({ default: m.PrivacyPolicyModal })));
const TermsModal = React.lazy(() => import('./components/TermsModal').then(m => ({ default: m.TermsModal })));
const HostAdmin = React.lazy(() => import('./components/HostAdmin').then(m => ({ default: m.HostAdmin })));
const MarketingPage = React.lazy(() => import('./components/MarketingPage').then(m => ({ default: m.MarketingPage })));
const HostOnboarding = React.lazy(() => import('./components/HostOnboarding').then(m => ({ default: m.HostOnboarding })));
const LoginPage = React.lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const OnboardingFlow = React.lazy(() => import('./components/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
  </div>
);

const App = () => {
  const { user, isVerified, isProfileOpen, toggleProfile, loading: userLoading } = useUser();
  const { isHost, isLoading: authLoading } = useAuth();
  const { config } = useAppConfig();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isGuestPreview, setIsGuestPreview] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Determine if this is the initial host setup
  useEffect(() => {
    if (isHost && config.appName === 'Voyageurs' && !safeStorage.getItem('trip_initialized')) {
      setIsSettingUp(true);
    }
  }, [isHost, config.appName]);

  // Handle scroll and notification permissions
  useEffect(() => {
    notificationService.requestPermission().catch(console.warn);
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);

    // Listen for in-app RSVP navigation
    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener('open_login', handleOpenLogin);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open_login', handleOpenLogin);
    };
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (authLoading || userLoading) {
    return <LoadingScreen />;
  }

  // SCENARIO 1: HOST LOGGED IN
  if (isHost) {
    if (isSettingUp) {
      return (
        <Suspense fallback={<LoadingScreen />}>
          <HostOnboarding onComplete={() => { setIsSettingUp(false); safeStorage.setItem('trip_initialized', 'true'); }} />
        </Suspense>
      );
    }

    if (isGuestPreview) {
      return (
        <div className="min-h-[100dvh] bg-background selection:bg-med-terracotta/30 overflow-hidden relative transition-colors duration-300">
          <Suspense fallback={<LoadingScreen />}>
            <OSContainer initialMode={'guest'} />
          </Suspense>
          <RSVPPrompt />
          <InstallPrompt />
          <Suspense fallback={null}>
            <TravelHub isOpen={isProfileOpen} onClose={toggleProfile} />
          </Suspense>
        </div>
      );
    }

    return (
      <div className="min-h-[100dvh] bg-background selection:bg-med-terracotta/30 overflow-hidden transition-colors duration-300">
        <Suspense fallback={<LoadingScreen />}>
          <HostAdmin isOpen={true} onSwitchToGuest={() => setIsGuestPreview(true)} />
        </Suspense>
        <RSVPPrompt />
        <InstallPrompt />
      </div>
    );
  }

  // SCENARIO 2: GUEST LOGGED IN (verified, has profile)
  if (user && user.hasCompletedOnboarding && user.status !== 'Declined') {
    return (
      <div className="min-h-[100dvh] bg-background selection:bg-med-terracotta/30 overflow-hidden transition-colors duration-300">
        <Suspense fallback={<LoadingScreen />}>
          <OSContainer initialMode={'guest'} />
        </Suspense>
        <RSVPPrompt />
        <InstallPrompt />
        <Suspense fallback={null}>
          <TravelHub isOpen={isProfileOpen} onClose={toggleProfile} />
        </Suspense>
      </div>
    );
  }

  // SCENARIO 3: PUBLIC/MARKETING VIEW OR GUEST ONBOARDING
  const showGuestOnboarding = isVerified || (user && user.status !== 'Declined');

  // Guest verified but hasn't finished onboarding yet — launch the flow
  if (isVerified && !user?.hasCompletedOnboarding) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <OnboardingFlow />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-med-terracotta/30 bg-background transition-colors duration-300 flex flex-col overflow-x-hidden">
      <main id="main-content" className="flex-1 w-full">
        {showGuestOnboarding ? (
          // Guest Hub is triggered for onboarding or profile view
          <Suspense fallback={<LoadingScreen />}>
            <TravelHub isOpen={true} onClose={toggleProfile} />
          </Suspense>
        ) : (
          // Standard public marketing page
          <Suspense fallback={<LoadingScreen />}>
            <MarketingPage onShowLogin={() => setShowLogin(true)} />
          </Suspense>
        )}
      </main>

      {/* LoginPage renders as a fixed overlay on top of everything */}
      {showLogin && (
        <Suspense fallback={null}>
          <LoginPage onClose={() => setShowLogin(false)} />
        </Suspense>
      )}


      {/* Scroll-to-top button */}
      <button onClick={scrollToTop} className={`fixed z-[130] p-3 rounded-full bg-white/90 dark:bg-gray-800/90 text-med-blue shadow-xl transition-all duration-500 bottom-28 right-4 lg:bottom-10 lg:right-10 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <ArrowUp size={20} strokeWidth={2.5} />
      </button>

      {/* Modals and Overlays */}
      <Suspense fallback={null}>
        {showAdmin && (
          <div className="fixed inset-0 z-[500] bg-background animate-in fade-in duration-300">
            <HostAdmin onSwitchToGuest={() => setShowAdmin(false)} onClose={() => setShowAdmin(false)} />
          </div>
        )}
        <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      </Suspense>
      <RSVPPrompt />
      <InstallPrompt />
    </div>
  );
};

export default App;
