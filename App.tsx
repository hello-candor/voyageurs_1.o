
import React, { useState, useEffect, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { MobileNav } from './components/MobileNav';
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
const EventLandingPage = React.lazy(() => import('./components/EventLandingPage').then(m => ({ default: m.EventLandingPage })));
const JournalPage = React.lazy(() => import('./components/JournalPage').then(m => ({ default: m.JournalPage })));
const HostLoginPage = React.lazy(() => import('./components/HostLoginPage').then(m => ({ default: m.HostLoginPage })));

const LoadingScreen = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    'Preparing your experience…',
    'Loading event details…',
    'Setting the scene…',
    'Bienvenue, Voyager…',
    'Almost there…',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0e1c2a 0%, #1a2d45 50%, #0e1c2a 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #C07D5E 0%, transparent 70%)', top: '20%', left: '50%', transform: 'translateX(-50%)' }} />

      {/* Logo */}
      <div className="relative mb-8" style={{ animation: 'loadPulse 3s ease-in-out infinite' }}>
        <img src="/assets/voyageurs-icon.png" alt="Voyageurs" className="w-20 h-20 object-contain drop-shadow-2xl" />
        <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: '#C07D5E' }} />
      </div>

      {/* Brand name */}
      <h1 className="text-white text-2xl tracking-[0.3em] uppercase mb-12"
        style={{ fontFamily: "'Montserrat', system-ui, sans-serif", fontWeight: 300, opacity: 0.9 }}>
        Voyageurs
      </h1>

      {/* Progress bar */}
      <div className="w-48 h-[2px] rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{
          background: 'linear-gradient(90deg, transparent, #C07D5E, transparent)',
          animation: 'loadSlide 1.8s ease-in-out infinite',
          width: '40%',
        }} />
      </div>

      {/* Rotating message */}
      <div className="h-6 relative overflow-hidden">
        <p key={msgIndex} className="text-sm tracking-wider text-center"
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontFamily: "'Montserrat', system-ui, sans-serif",
            fontWeight: 400,
            animation: 'loadFadeIn 0.5s ease-out',
          }}>
          {messages[msgIndex]}
        </p>
      </div>

      <style>{`
        @keyframes loadPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes loadSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        @keyframes loadFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

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
  const [isHostRoute, setIsHostRoute] = useState(false);

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

    if (window.location.hostname === 'bryans40th.voyageurs.app') {
      window.location.replace('https://voyageurs.app' + window.location.search);
      return;
    }

    // Auto-open login for /rsvp, /event paths or ?code= parameter
    const params = new URLSearchParams(window.location.search);
    const rsvpPaths = ['/rsvp', '/event'];
    const isRSVPPath = rsvpPaths.includes(window.location.pathname);
    if (params.has('code')) {
      // New QR code scanned — clear any existing guest session
      // so the new code is processed fresh
      safeStorage.removeItem('guest_user');
      safeStorage.removeItem('has_rsvpd');
      safeStorage.removeItem('passcode_verified');
      setShowLogin(true);
    } else if (isRSVPPath) {
      setShowLogin(true);
      window.history.replaceState({}, '', '/');
    } else if (window.location.pathname === '/host') {
      setIsHostRoute(true);
    }

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
    // Clean up /host route after successful auth
    if (window.location.pathname === '/host') {
      window.history.replaceState({}, '', '/');
    }

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
        <InstallPrompt />
      </div>
    );
  }

  // ── Hub launch gate: controlled via AppConfig (Firestore or defaults) ──
  const hubUnlocked = config.hubUnlocked;

  // SCENARIO 2: GUEST LOGGED IN (verified, has completed onboarding)
  if (user && user.hasCompletedOnboarding) {
    // Hub is not yet open, or guest declined — show the dashboard so they
    // can manage their RSVP, edit profile, and preview the hub.
    if (!hubUnlocked || user.status === 'Declined') {
      return (
        <Suspense fallback={<LoadingScreen />}>
          <EventLandingPage />
          <InstallPrompt />
        </Suspense>
      );
    }

    // Hub is live — full guest app experience
    return (
      <div className="min-h-[100dvh] bg-background selection:bg-med-terracotta/30 overflow-hidden transition-colors duration-300">
        <Suspense fallback={<LoadingScreen />}>
          <OSContainer initialMode={'guest'} />
        </Suspense>
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

  // SCENARIO 3.5: HOST LOGIN ROUTE
  if (isHostRoute) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <HostLoginPage />
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
            <MarketingPage onShowLogin={() => setIsHostRoute(true)} onRSVP={() => setShowLogin(true)} />
          </Suspense>
        )}
      </main>

      {/* LoginPage renders as a fixed overlay on top of everything */}
      <AnimatePresence mode="wait">
        {showLogin && (
          <Suspense fallback={null}>
            <LoginPage onClose={() => setShowLogin(false)} />
          </Suspense>
        )}
      </AnimatePresence>


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
      {!showGuestOnboarding && <MobileNav onShowLogin={() => setShowLogin(true)} />}

      <InstallPrompt />
    </div>
  );
};

export default App;
