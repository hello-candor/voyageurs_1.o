import React, { useState, useEffect, Suspense } from 'react';
import { Hero } from './components/Hero';
import { MontpellierInfo } from './components/MontpellierInfo';
import { Navigation } from './components/Navigation';
import { TheCelebration } from './components/TheCelebration';
import { Gallery } from './components/Gallery';
import { InstallPrompt } from './components/InstallPrompt';
import { ArrowUp, Lock, Loader2, Heart } from 'lucide-react';
import { useUser } from './context/UserContext';
import { useAuth } from './context/AuthContext';
import { useAppConfig } from './context/AppConfigContext';
import { notificationService } from './services/notificationService';
import { ThemeInjector } from './components/ThemeInjector';
import { OSContainer } from './components/OSContainer';

// Lazy load heavy components with explicit named exports
const TravelHub = React.lazy(() => import('./components/TravelHub').then(m => ({ default: m.TravelHub })));
const PrivacyPolicyModal = React.lazy(() => import('./components/PrivacyPolicyModal').then(m => ({ default: m.PrivacyPolicyModal })));
const TermsModal = React.lazy(() => import('./components/TermsModal').then(m => ({ default: m.TermsModal })));
const HostAdmin = React.lazy(() => import('./components/HostAdmin').then(m => ({ default: m.HostAdmin })));
const MarketingPage = React.lazy(() => import('./components/MarketingPage').then(m => ({ default: m.MarketingPage })));
const HostOnboarding = React.lazy(() => import('./components/HostOnboarding').then(m => ({ default: m.HostOnboarding })));

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
    if (isHost && allTrips.length === 1 && allTrips[0].id === 'default' && !localStorage.getItem('trip_initialized')) {
        setIsSettingUp(true);
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
              <HostOnboarding onComplete={() => { setIsSettingUp(false); localStorage.setItem('trip_initialized', 'true'); }} />
          </Suspense>
      );
  }

  if (isHost || (user && user.hasCompletedOnboarding && user.status !== 'Declined')) {
    return (
      <div className="min-h-[100dvh] bg-med-sand dark:bg-slate-900 selection:bg-med-terracotta/30 overflow-hidden">
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
        <div className="min-h-screen font-sans selection:bg-med-terracotta/30 dark:bg-slate-900 transition-colors duration-300 flex flex-col overflow-x-hidden">
          <ThemeInjector />
          <Navigation />
          <main id="main-content" className="flex-1 w-full pb-24 lg:pb-0">
            <Hero />
            <MontpellierInfo />
            <TheCelebration />
            <Gallery />
          </main>
          <footer className="bg-slate-900 py-20 border-t border-white/5 relative z-10">
            <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center px-6 space-y-5">
                <div className="flex items-center justify-center gap-8 text-[13px] font-medium text-slate-400">
                    <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy Policy</button>
                    <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms of Service</button>
                    <button onClick={() => setShowAdmin(true)} className="hover:text-white transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100">
                      <Lock size={12} className="mb-0.5" /> Host Login
                    </button>
                </div>
                <p className="text-[13px] text-slate-500 font-medium">© 2026 Candor Digital Group. All rights reserved.</p>
            </div>
          </footer>
          <button onClick={scrollToTop} className={`fixed z-[130] p-3 rounded-full bg-white/90 dark:bg-gray-800/90 text-med-blue shadow-xl transition-all duration-500 bottom-28 right-4 lg:bottom-10 lg:right-10 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
          <Suspense fallback={null}>
            <TravelHub isOpen={isProfileOpen || (!!user && !user.hasCompletedOnboarding) || (isVerified && !user)} onClose={toggleProfile} />
            {showAdmin && (
                <div className="fixed inset-0 z-[500] bg-slate-900 animate-in fade-in duration-300">
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
        <MarketingPage onHostLogin={() => setShowAdmin(true)} />
        {showAdmin && (
            <div className="fixed inset-0 z-[500] bg-slate-900 animate-in fade-in duration-300">
                <HostAdmin onSwitchToGuest={() => setShowAdmin(false)} onClose={() => setShowAdmin(false)} />
            </div>
        )}
        <InstallPrompt />
    </Suspense>
  );
};

export default App;