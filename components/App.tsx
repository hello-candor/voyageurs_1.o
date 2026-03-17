
import React, { useState, useEffect, Suspense } from 'react';
import { Hero } from './components/Hero';
import { MontpellierInfo } from './components/MontpellierInfo';
import { PublicLogistics } from './components/PublicLogistics';
import { Navigation } from './components/Navigation';
import { TheCelebration } from './components/TheCelebration';
import { Gallery } from './components/Gallery';
import { InstallPrompt } from './components/InstallPrompt';
import { ArrowUp, Lock, Loader2, Heart, Anchor } from 'lucide-react';
import { useUser } from './context/UserContext';
import { useAuth } from './context/AuthContext';
import { useAppConfig } from './context/AppConfigContext';
import { notificationService } from './services/notificationService';
import { safeStorage } from './utils/storage';
import { ThemeInjector } from './components/ThemeInjector';
import { OSContainer } from './components/OSContainer';
import { OnboardingFlow } from './components/OnboardingFlow';

// Lazy load heavy components
const TravelHub = React.lazy(() => import('./components/TravelHub').then(module => ({ default: module.TravelHub }))) as any;
const PrivacyPolicyModal = React.lazy(() => import('./components/PrivacyPolicyModal').then(module => ({ default: module.PrivacyPolicyModal }))) as any;
const TermsModal = React.lazy(() => import('./components/TermsModal').then(module => ({ default: module.TermsModal }))) as any;
const HostAdmin = React.lazy(() => import('./components/HostAdmin').then(module => ({ default: module.HostAdmin }))) as any;
const MarketingPage = React.lazy(() => import('./components/MarketingPage').then(module => ({ default: module.MarketingPage }))) as any;
const HostOnboarding = React.lazy(() => import('./components/HostOnboarding').then(module => ({ default: module.HostOnboarding }))) as any;

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-med-blue flex items-center justify-center z-[9999]">
    <Loader2 className="w-10 h-10 text-white animate-spin" />
  </div>
);

const App = () => {
  const { user, isVerified, isProfileOpen, toggleProfile } = useUser();
  const { isHost } = useAuth();
  const { allTrips } = useAppConfig();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const hasInitialized = safeStorage.getItem('trip_initialized');
    if (isHost && !hasInitialized && allTrips.length === 1 && allTrips[0].id === 'default') {
      setIsSettingUp(true);
    }
    if (isHost) {
      setShowAdmin(true);
    }
  }, [isHost, allTrips]);

  useEffect(() => {
    const requestNotifs = async () => {
      await notificationService.requestPermission();
    };
    const timer = setTimeout(requestNotifs, 5000);

    const handleScroll = () => {
      if (!isHost && !(user && user.hasCompletedOnboarding)) {
        setShowScrollTop(window.scrollY > 400);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [isHost, user]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isHost && isSettingUp) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <HostOnboarding onComplete={() => {
          safeStorage.setItem('trip_initialized', 'true');
          setIsSettingUp(false);
          window.location.reload();
        }} />
      </Suspense>
    );
  }

  if (isVerified && !user?.hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  if (isHost || (user && user.hasCompletedOnboarding && user.status !== 'Declined')) {
    return (
      <div className="min-h-[100dvh] bg-med-sand dark:bg-gray-950 selection:bg-med-terracotta/30 overflow-hidden">
        <ThemeInjector />
        <Suspense fallback={<LoadingScreen />}>
          <OSContainer initialMode={isHost ? 'host' : 'guest'} />
        </Suspense>
        <InstallPrompt />
        <Suspense fallback={null}>
          <TravelHub isOpen={isProfileOpen} onClose={toggleProfile} />
        </Suspense>
      </div>
    );
  }

  if (isVerified || (user && user.status !== 'Declined')) {
    return (
      <div className="min-h-screen font-sans selection:bg-med-terracotta/30 dark:bg-gray-900 transition-colors duration-300 flex flex-col overflow-x-hidden">
        <ThemeInjector />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[130] focus:top-4 focus:left-4 focus:bg-med-terracotta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
          Skip to content
        </a>

        <Navigation />

        <main id="main-content" className="flex-1 w-full pb-24 lg:pb-0">
          <Hero />
          <MontpellierInfo />
          <PublicLogistics />
          <TheCelebration />
          <Gallery />
        </main>

        <footer className="bg-white dark:bg-slate-900 py-16 border-t border-gray-100 dark:border-gray-800 relative z-10 transition-colors duration-300">
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center px-6 space-y-6">

            <div className="w-10 h-10 bg-med-blue dark:bg-white text-white dark:text-med-blue rounded-full flex items-center justify-center shadow-lg shadow-med-blue/20 dark:shadow-none mb-2">
              <Anchor size={20} />
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-med-blue dark:hover:text-white transition-colors duration-300">Privacy Policy</button>
              <button onClick={() => setShowTerms(true)} className="hover:text-med-blue dark:hover:text-white transition-colors duration-300">Terms of Service</button>
              <button onClick={() => setShowAdmin(true)} className="hover:text-med-blue dark:hover:text-white transition-colors duration-300 flex items-center gap-1.5">
                <Lock size={12} className="mb-0.5" /> Host Login
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-300 dark:text-gray-700 font-medium tracking-wide">
                © 2026 Candor Digital Group. All rights reserved.
              </p>
              <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-300 dark:text-gray-700 font-medium">
                Designed with <Heart size={10} className="text-med-terracotta fill-med-terracotta mx-0.5" /> in Chicago
              </p>
            </div>
          </div>
        </footer>

        <button onClick={scrollToTop} aria-label="Scroll to top" className={`fixed z-[130] p-3 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur text-med-blue dark:text-white shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-500 transform hover:-translate-y-1
              bottom-28 right-4 lg:bottom-10 lg:right-10
              ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>

        <Suspense fallback={null}>
          <TravelHub
            isOpen={isProfileOpen || (!!user && !user.hasCompletedOnboarding) || (isVerified && !user)}
            onClose={toggleProfile}
          />
          {showAdmin && (
            <div className="fixed inset-0 z-[500] bg-slate-950 animate-in fade-in duration-300">
              <HostAdmin onSwitchToGuest={() => setShowAdmin(false)} onClose={() => setShowAdmin(false)} />
            </div>
          )}
          <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
          <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </Suspense>
        <InstallPrompt />
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ThemeInjector />
      <MarketingPage
        onHostLoginSuccess={() => {
          setShowAdmin(true);
        }}
      />
      {showAdmin && (
        <div className="fixed inset-0 z-[500] bg-slate-950 animate-in fade-in duration-300">
          <HostAdmin onSwitchToGuest={() => setShowAdmin(false)} onClose={() => setShowAdmin(false)} />
        </div>
      )}
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <InstallPrompt />
    </Suspense>
  );
};

export default App;
