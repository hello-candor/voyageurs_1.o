
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronRight, Star, Plane, Plus, Heart, ArrowRight, 
  Smartphone, Wine, Sun, Umbrella, Landmark, Sparkles, 
  Shield, Sailboat, Lock, Mail, Briefcase, PartyPopper, 
  GraduationCap, Facebook, Twitter, Instagram, DollarSign, 
  ChevronDown, Compass, Anchor, Send, Bot, Check, Globe, 
  Binoculars, Loader2, Quote, ExternalLink, Construction,
  RotateCw, RefreshCw, CalendarDays, ScanLine, Award, Network, WifiOff,
  Layout, Zap, CheckCircle,
  Moon, Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';
import { AboutUsModal } from './AboutUsModal';
import { FeatureBreakdownModal } from './FeatureBreakdownModal';
import { OnboardingFlow } from './OnboardingFlow';

// --- Styles & Assets ---

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

    .font-heading { font-family: 'Cormorant Garamond', serif; }
    .font-body { font-family: 'Montserrat', sans-serif; }
    
    .bg-paper-texture {
        background-color: #F5F2EB;
    }

    .perspective-1000 {
        perspective: 1000px;
    }
    .preserve-3d {
        transform-style: preserve-3d;
    }
    .backface-hidden {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }
    .rotate-y-180 {
        transform: rotateY(180deg);
    }
    .is-flipped {
        transform: rotateY(180deg);
    }

    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
  `}</style>
);

const Logo = ({ className = "w-10 h-10", dark = false }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-med-blue border-2 border-med-terracotta shadow-lg ${className}`}>
    <Sailboat className="text-white w-[60%] h-[60%]" strokeWidth={1.5} />
  </div>
);

// --- Sub-components ---

const BentoCard = ({ children, back, className = "", isHero = false }: any) => {
    const [flipped, setFlipped] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || flipped) return; // Disable tilt when flipped
        
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        
        cardRef.current.style.transition = 'none';
        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current || flipped) return;
        
        cardRef.current.style.transition = 'transform 0.5s ease-out';
        cardRef.current.style.transform = `rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    };

    useEffect(() => {
        if (cardRef.current) {
            cardRef.current.style.transition = 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            cardRef.current.style.transform = ''; 
        }
    }, [flipped]);

    return (
        <div 
            className={`bento-card group relative h-full cursor-pointer perspective-1000 ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => setFlipped(!flipped)}
        >
            <div 
                ref={cardRef}
                className={`bento-inner relative w-full h-full preserve-3d ${flipped ? 'is-flipped' : ''}`}
            >
                {/* Front */}
                <div className="bento-front absolute inset-0 backface-hidden bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col">
                    {children}
                </div>
                {/* Back */}
                <div className="bento-back absolute inset-0 backface-hidden rotate-y-180 bg-med-blue dark:bg-slate-800 text-white p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-xl border border-white/10">
                    {back}
                </div>
            </div>
        </div>
    );
};

const AuthModal = ({ isOpen, onClose, onGuestLoginSuccess, onHostLoginSuccess }: { isOpen: boolean, onClose: () => void, onGuestLoginSuccess: () => void, onHostLoginSuccess: () => void }) => {
    const { loginWithCode } = useUser();
    const { loginHost, loginHostWithGoogle } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [authView, setAuthView] = useState<'guest' | 'host'>('guest');

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const googleUser = await (window as any).google.accounts.id.prompt((notification:any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    setIsLoading(false);
                }
            });
            if (googleUser) {
                await loginHostWithGoogle(googleUser.credential);
                onHostLoginSuccess();
            }
        } catch (err) {
            setError("Google sign-in failed. Please try again.");
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setIsLoading(true);
        setError('');
        const success = await loginWithCode(code);
        if (success) {
            onGuestLoginSuccess();
        } else {
            setError("Invalid invite code. Please try again.");
        }
        setIsLoading(false);
    };

    const handleHostLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setIsLoading(true);
        setError('');
        const success = await loginHost(code);
        if (success) {
            onHostLoginSuccess();
        } else {
            setError("Invalid host passcode. Please try again.");
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-med-blue transition-colors z-10"><X size={24}/></button>
                <div className="p-12 text-center">
                    <Logo className="w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-3xl font-heading italic text-med-blue dark:text-white mb-2">Event Access</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta mb-8">{authView === 'host' ? 'Host Login' : 'Guest Entry'}</p>
                    
                    {authView === 'guest' ? (
                        <div className="space-y-4">
                            <button onClick={handleGoogleLogin} className="w-full py-4 bg-med-blue text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <><Globe size={14} /> Sign in with Google</>}
                            </button>
                            <div className="my-4 flex items-center">
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                <span className="flex-shrink mx-4 text-slate-400 dark:text-slate-500 text-xs uppercase">Or</span>
                                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <form className="space-y-4" onSubmit={handleGuestLogin}>
                                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full p-4 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white font-serif tracking-widest text-xl" placeholder="ENTER INVITE CODE" />
                                <button type="submit" className="w-full py-4 bg-[#E2923D] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-[#d17e2b] transition-all" disabled={isLoading || !code}>
                                    Access as Guest
                                </button>
                            </form>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleHostLogin}>
                            <input type="password" value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-4 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white font-serif tracking-widest text-xl" placeholder="ENTER HOST PASSCODE" autoFocus />
                            <button type="submit" className="w-full py-4 bg-med-blue text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all" disabled={isLoading || !code}>
                                Login as Host
                            </button>
                        </form>
                    )}

                    {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
                    <div className="mt-4">
                        <button onClick={() => setAuthView(authView === 'guest' ? 'host' : 'guest')} className="text-xs text-slate-400 hover:underline">
                            {authView === 'guest' ? 'Switch to Host Login' : 'Switch to Guest Login'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const MarketingPage = ({ onHostLoginSuccess }: any) => {
    const { theme, toggleTheme } = useTheme();
    const [isAnnual, setIsAnnual] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const [celesteIndex, setCelesteIndex] = useState(0);
    const celesteExamples = [
        { q: "What's the dress code for Saturday?", a: "Black Tie Creative. Think velvet, sparkle, and Mediterranean flair." },
        { q: "Best coffee near the hotel?", a: "Coldrip is a 3-minute walk. They serve excellent flat whites." },
        { q: "Is the gallery open on Monday?", a: "Yes, Musée Fabre is open 10am-6pm. Your ticket is already saved." },
        { q: "Where can I charge my EV?", a: "There are 2 stations at the Indigo Parking, 200m from the venue." }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCelesteIndex(prev => (prev + 1) % celesteExamples.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    
    if (showOnboarding) {
        return (
            <div className="fixed inset-0 z-[1000] bg-white dark:bg-gray-900">
                <OnboardingFlow />
            </div>
        );
    }


    return (
        <div className="font-body bg-med-sand dark:bg-gray-950 text-slate-800 dark:text-slate-200 selection:bg-med-terracotta selection:text-white transition-colors duration-500 overflow-x-hidden">
            <Styles />
            
            <nav className="fixed w-full z-50 top-0 left-0 transition-all duration-500 px-4 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo />
                        <span className="font-heading text-2xl font-bold italic text-med-blue dark:text-white leading-none">Voyageurs</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 px-8 py-3 rounded-full border transition-all duration-500 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-med-blue/10 dark:border-white/10 shadow-sm">
                        <a href="#philosophy" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">About</a>
                        <a href="#features" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">Features</a>
                        <a href="#pricing" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-med-blue/10 dark:border-white/10 shadow-sm text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button onClick={() => setShowAuthModal(true)} className="inline-flex items-center justify-center font-bold tracking-[0.2em] uppercase transition-all duration-300 font-body relative overflow-hidden group rounded-full active:scale-95 bg-[#E2923D] text-white hover:bg-[#d17e2b] shadow-xl hover:shadow-2xl shadow-[#E2923D]/20 px-6 py-2.5 text-[10px] sm:px-8 sm:py-3.5 sm:text-xs">
                            Access
                        </button>
                    </div>
                </div>
            </nav>

            <section className="relative pt-48 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-center lg:text-left animate-in slide-in-from-bottom-8 duration-700">
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                                <span className="text-med-terracotta dark:text-[#C25E3E] font-bold uppercase tracking-[0.2em] text-[10px]">Upgraded Group Travel</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-heading font-light text-med-blue dark:text-blue-100 mb-8 leading-[0.9]">
                                Less planning, <br/>
                                <span className="italic text-med-terracotta dark:text-[#C25E3E]">more connecting.</span>
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
                                Orchestrate your next group trip without the spreadsheet fatigue. Voyageurs unifies collaborative itinerary planning, shared expense tracking, and local discovery into one fluid experience.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={() => setShowAuthModal(true)} className="inline-flex items-center justify-center font-bold tracking-[0.2em] uppercase transition-all duration-300 font-body relative overflow-hidden group rounded-full active:scale-95 bg-[#E2923D] text-white hover:bg-[#d17e2b] px-8 py-3.5 text-xs shadow-xl">
                                    Access <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative h-[600px] w-full group perspective-1000 animate-in slide-in-from-bottom-12 duration-1000">
                            <div className="absolute top-1/2 left-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border border-white dark:border-gray-800 transform -translate-y-1/2 -translate-x-12 hidden lg:flex items-center gap-4 transition-transform group-hover:translate-x-[-3rem] group-hover:scale-105">
                                <div className="w-14 h-14 bg-med-terracotta dark:bg-[#C25E3E] rounded-full flex items-center justify-center text-white shadow-lg">
                                    <CheckCircle className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="font-heading text-2xl text-med-blue dark:text-white leading-none">Montpellier</p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E] mt-1">Sept 18 - 22 • Secured</p>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 transform rotate-3 z-10 transition-all duration-700 ease-out group-hover:rotate-6 group-hover:translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1690132007585-1ef4b16f49d3?q=80&w=2342&auto=format&fit=crop" className="w-full h-full object-cover" alt="Philosophy Mood" />
                            </div>
                            <div className="absolute bottom-0 left-8 w-3/5 h-3/5 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 transform -rotate-6 z-0 transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:-translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1619523439722-c27651e8e10e?q=80&w=2342&auto=format&fit=crop" className="w-full h-full object-cover" alt="Mediterranean Lifestyle" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="philosophy" className="py-24 bg-white dark:bg-[#1e293b] relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">The Philosophy</span>
                                <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E] lg:hidden"></div>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight mb-6 text-med-blue dark:text-blue-100">
                                Elevate the <span className="italic text-med-terracotta dark:text-[#C25E3E]">Experience.</span>
                            </h2>
                            <p className="text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400 mb-8">
                                Great journeys shouldn't require a project manager. We believe the magic of travel lies in the moment, not the administration. By replacing fragmented chat threads and endless email chains with a centralized hub for group coordination, we make the logistics invisible—letting the memories take center stage.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={() => setShowAbout(true)} className="text-med-blue dark:text-white font-bold uppercase tracking-[0.2em] text-[10px] border-b border-med-blue dark:border-white pb-1 hover:text-med-terracotta hover:border-med-terracotta transition-all">
                                    Read our Manifesto
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative h-[500px] w-full flex items-center justify-center order-1 lg:order-2 group">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-med-sand/50 dark:bg-med-blue/5 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute w-4/5 h-4/5 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 transform -rotate-6 transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:-translate-x-4 group-hover:scale-95 z-10 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                                 <img src="https://images.unsplash.com/photo-1659882751335-43e664461e6d?q=80&w=735&auto=format&fit=crop" alt="Mediterranean street" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                 <div className="absolute inset-0 bg-med-blue/10 dark:bg-black/20 mix-blend-multiply"></div>
                            </div>
                            <div className="absolute w-4/5 h-4/5 rounded-[2.5rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-white dark:border-gray-800 transform rotate-3 translate-x-4 translate-y-4 transition-all duration-700 ease-out group-hover:rotate-6 group-hover:translate-x-8 group-hover:scale-105 z-20 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                                 <img src="https://images.unsplash.com/photo-1474925558543-e7a5f06e733e?q=80&w=1170&auto=format&fit=crop" alt="Friends jumping" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-10 -left-4 z-30 bg-white dark:bg-gray-900 px-6 py-4 rounded-full shadow-xl border border-med-sand dark:border-gray-700 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-500">
                                 <div className="w-10 h-10 rounded-full bg-med-terracotta text-white flex items-center justify-center">
                                    <Heart size={20} fill="currentColor" />
                                 </div>
                                 <div>
                                    <p className="font-heading text-lg text-med-blue dark:text-white leading-none">L'Art de Vivre</p>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Our Core Value</p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-24 bg-med-sand dark:bg-gray-950 relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">The Ecosystem</span>
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight text-med-blue dark:text-blue-100 mb-6">
                            Elegantly <span className="italic text-med-terracotta dark:text-[#C25E3E]">Powerful.</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                            Transform chaotic group chats into a seamless travel plan. Tap any card below to explore the technology powering your journey.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
                        <BentoCard 
                            className="md:col-span-2 md:row-span-2"
                            back={
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6"><Sparkles size={24}/></div>
                                    <h3 className="font-heading text-3xl mb-4">How it Works</h3>
                                    <p className="text-blue-100 leading-relaxed max-w-lg mb-8">Built with smart technology that understands travel. Céleste remembers your group's dietary needs, budget limits, and favorite styles to give you the perfect answers.</p>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-md text-left">
                                        <div className="p-4 bg-white/10 rounded-xl">
                                            <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-med-terracotta mb-1">Privacy First</div>
                                            <div className="text-[10px] text-blue-100 leading-tight">Isolated isolated isolated isolated isolated isolated isolated isolated isolated isolated isolated isolated isolated.</div>
                                        </div>
                                        <div className="p-4 bg-white/10 rounded-xl">
                                            <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-med-terracotta mb-1">Smart Memory</div>
                                            <div className="text-[10px] text-blue-100 leading-tight">Maintains context across the entire duration of your trip planning.</div>
                                        </div>
                                    </div>
                                </div>
                            }
                        >
                            <div className="absolute top-0 right-0 w-96 h-96 bg-med-terracotta/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-med-blue text-white flex items-center justify-center shadow-xl">
                                            <Bot size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-3xl md:text-4xl text-med-blue dark:text-white leading-none">Meet Céleste</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta mt-1">Your AI Concierge</p>
                                        </div>
                                    </div>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-md">
                                        A concierge that knows your group. From suggesting the perfect wine pairing to finding a late-night pharmacy, Céleste provides context-aware guidance based on your specific itinerary.
                                    </p>
                                </div>

                                <div className="mt-8 space-y-4 relative max-w-md ml-auto min-h-[120px]">
                                    <AnimatePresence mode="wait">
                                        <motion.div 
                                            key={`q-${celesteIndex}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex justify-end"
                                        >
                                            <div className="bg-med-blue text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm shadow-md">
                                                {celesteExamples[celesteIndex].q}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                    <AnimatePresence mode="wait">
                                        <motion.div 
                                            key={`a-${celesteIndex}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-paper-texture dark:bg-gray-800 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-slate-100 dark:border-gray-700 flex items-start gap-3">
                                                <Sparkles className="w-4 h-4 text-med-terracotta mt-0.5 shrink-0" />
                                                <span>{celesteExamples[celesteIndex].a}</span>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className="absolute bottom-8 left-8 flex items-center gap-2 text-[10px] text-med-terracotta font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RotateCw size={14} /> Flip for details
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard 
                            back={
                                <div className="flex flex-col items-center">
                                    <CalendarDays size={32} className="text-med-lightBlue mb-4" />
                                    <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-2 text-med-terracotta">Collaborative Canvas</h4>
                                    <p className="text-xs text-blue-100 mb-6">Real-time multiplayer editing. Drag, drop, and vote on activities. Syncs instantly with Google Calendar and Outlook.</p>
                                    <ul className="text-[10px] text-left w-full space-y-2 text-blue-200">
                                        <li className="flex items-center gap-2"><Check size={12} /> Smart Scheduling</li>
                                        <li className="flex items-center gap-2"><Check size={12} /> Automatic Timezones</li>
                                    </ul>
                                </div>
                            }
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Compass size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Plan Before You Book</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Logistics Engine</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">Dream with precision. Build your group itinerary visually and watch the per-person budget estimates adjust in real-time.</p>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RotateCw className="text-med-terracotta" size={16} />
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard 
                            back={
                                <div className="flex flex-col items-center">
                                    <ScanLine size={32} className="text-med-lightBlue mb-4" />
                                    <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-2 text-med-terracotta">Smart Ledger</h4>
                                    <p className="text-xs text-blue-100 mb-6">Multi-currency support with real-time exchange rates. Snap a photo to instantly read and itemize receipts in seconds.</p>
                                    <ul className="text-[10px] text-left w-full space-y-2 text-blue-200">
                                        <li className="flex items-center gap-2"><Check size={12} /> Secure Payments</li>
                                        <li className="flex items-center gap-2"><Check size={12} /> PDF Export for Records</li>
                                    </ul>
                                </div>
                            }
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Frictionless Finance</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Shared Ledger</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">Settle up, stress down. Scan receipts, split costs instantly among the group, and transparently track who owes who.</p>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RotateCw className="text-med-terracotta" size={16} />
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard 
                            back={
                                <div className="flex flex-col items-center">
                                    <Award size={32} className="text-med-lightBlue mb-4" />
                                    <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-2 text-med-terracotta">Vetted Locals</h4>
                                    <p className="text-xs text-blue-100 mb-6">We partner with over 500 local experts who curate seasonal lists. No sponsored content, just authentic recommendations.</p>
                                    <ul className="text-[10px] text-left w-full space-y-2 text-blue-200">
                                        <li className="flex items-center gap-2"><Check size={12} /> "Hidden Gem" Algorithm</li>
                                        <li className="flex items-center gap-2"><Check size={12} /> Verified Reviews Only</li>
                                    </ul>
                                </div>
                            }
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Binoculars size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Curated Discovery</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Local Insights</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">Move beyond tourist traps. Access curated guides featuring hand-picked gems and local secrets tailored to your destination.</p>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RotateCw className="text-med-terracotta" size={16} />
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard 
                            back={
                                <div className="flex flex-col items-center">
                                    <Network size={32} className="text-med-lightBlue mb-4" />
                                    <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-2 text-med-terracotta">Smart Connections</h4>
                                    <p className="text-xs text-blue-100 mb-6">We analyze shared interests to suggest room allocations and carpools. Perfect for large retreats where not everyone knows each other.</p>
                                    <ul className="text-[10px] text-left w-full space-y-2 text-blue-200">
                                        <li className="flex items-center gap-2"><Check size={12} /> Ice Breaker Generator</li>
                                        <li className="flex items-center gap-2"><Check size={12} /> Personality Matching</li>
                                    </ul>
                                </div>
                            }
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Guest Matchmaker</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Social Alchemy</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">Social alchemy. Intelligent suggestions help your guests connect and find their tribe based on shared interests before departure.</p>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RotateCw className="text-med-terracotta" size={16} />
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard 
                            back={
                                <div className="flex flex-col items-center">
                                    <WifiOff size={32} className="text-med-lightBlue mb-4" />
                                    <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] mb-2 text-med-terracotta">Works Without Signal</h4>
                                    <p className="text-xs text-blue-100 mb-6">Full itinerary access without data roaming. Changes sync automatically when you reconnect to the grid.</p>
                                    <ul className="text-[10px] text-left w-full space-y-2 text-blue-200">
                                        <li className="flex items-center gap-2"><Check size={12} /> No Download Needed</li>
                                        <li className="flex items-center gap-2"><Check size={12} /> Battery Optimized</li>
                                    </ul>
                                </div>
                            }
                        >
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Your Trip, Anywhere</h3>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Cross-Platform</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">A pocket-sized command center. Maps, group chats, and tickets live in harmony on any device, online or offline.</p>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <RotateCw className="text-med-terracotta" size={16} />
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-24 bg-white dark:bg-[#1e293b]">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">Membership</span>
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight text-med-blue dark:text-blue-100 mb-6">
                            Simply <span className="italic text-med-terracotta dark:text-[#C25E3E]">Affordable.</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed mb-8">
                            Transparent pricing for every kind of group trip. Whether you need essential coordination tools for a weekend getaway or advanced logistics for a destination wedding, choose the plan that fits your party size and travel style.
                        </p>
                        
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-colors ${!isAnnual ? 'text-med-blue dark:text-white' : 'text-slate-400'}`} onClick={() => setIsAnnual(false)}>Monthly</span>
                            <button 
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-14 h-8 bg-med-blue/10 dark:bg-gray-800 rounded-full p-1 relative transition-colors duration-300 focus:outline-none ring-offset-2 focus:ring-2 ring-med-terracotta/50"
                            >
                                <div className={`w-6 h-6 bg-med-terracotta rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer transition-colors ${isAnnual ? 'text-med-blue dark:text-white' : 'text-slate-400'}`} onClick={() => setIsAnnual(true)}>
                                Annual <span className="text-med-terracotta text-[9px] ml-1">(Save 20%)</span>
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="relative p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 bg-med-sand dark:bg-gray-900 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="mb-8">
                                <h3 className="text-xl font-heading mb-2 text-med-blue dark:text-white">Explorer</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold font-heading text-slate-900 dark:text-white">$0</span>
                                    <span className="text-[10px] uppercase tracking-wide text-slate-400">forever</span>
                                </div>
                                <p className="text-sm mt-4 text-slate-500 dark:text-slate-400">Essential coordination tools for intimate group gatherings.</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> Up to 10 Guests</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> 1 Active Trip</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> Mobile App Access</li>
                            </ul>
                            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-white dark:bg-gray-800 text-med-blue dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xl rounded-full text-[10px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all">Access</button>
                        </div>

                        <div className="relative p-8 rounded-[2.5rem] border border-med-blue bg-med-blue text-white shadow-2xl scale-105 z-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(30,68,114,0.25)]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-med-terracotta text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">Most Popular</div>
                            <div className="mb-8">
                                <h3 className="text-xl font-heading mb-2 text-white">Connoisseur</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold font-heading text-white transition-all duration-300">{isAnnual ? '$8' : '$10'}</span>
                                    <span className="text-[10px] uppercase tracking-wide text-blue-200 transition-all duration-300">{isAnnual ? 'per month (billed annually)' : 'per month'}</span>
                                </div>
                                <p className="text-sm mt-4 text-blue-100">Advanced logistics and AI assistance for the dedicated host.</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-med-terracotta mt-0.5" /> Up to 25 Guests</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-med-terracotta mt-0.5" /> 3 Active Trips</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-med-terracotta mt-0.5" /> AI Concierge (Céleste)</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-med-terracotta mt-0.5" /> Expense Ledger</li>
                            </ul>
                            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-med-terracotta text-white hover:bg-[#c56143] shadow-xl hover:shadow-2xl rounded-full text-[10px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all">Access</button>
                        </div>

                        <div className="relative p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 bg-med-sand dark:bg-gray-900 text-slate-800 dark:text-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                            <div className="mb-8">
                                <h3 className="text-xl font-heading mb-2 text-med-blue dark:text-white">Artisan</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold font-heading text-slate-900 dark:text-white transition-all duration-300">{isAnnual ? '$60' : '$75'}</span>
                                    <span className="text-[10px] uppercase tracking-wide text-slate-400 transition-all duration-300">{isAnnual ? 'per month (billed annually)' : 'per month'}</span>
                                </div>
                                <p className="text-sm mt-4 text-slate-500 dark:text-slate-400">White-glove features for professional retreat leaders and agencies.</p>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> Unlimited Guests</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> White-Label Portal</li>
                                <li className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> Priority Support</li>
                            </ul>
                            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-white dark:bg-gray-800 text-med-blue dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xl rounded-full text-[10px] font-bold uppercase tracking-[0.2em] active:scale-95 transition-all">Access</button>
                        </div>
                    </div>
                    
                    <div className="mt-16 text-center">
                        <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Not sure which plan is right for you?</p>
                        <button onClick={() => setShowFeatures(true)} className="text-med-blue dark:text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px] border-b border-med-blue dark:border-blue-400 pb-1 hover:text-med-terracotta hover:border-med-terracotta transition-all">
                            Compare all features
                        </button>
                    </div>
                </div>
            </section>

            <section id="signup" className="py-24 bg-med-blue dark:bg-[#0f172a] relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-med-terracotta/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
                </div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10 flex flex-col items-center text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-8 bg-med-terracotta"></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta">Start Your Journey</span>
                        <div className="h-px w-8 bg-med-terracotta"></div>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-heading font-light text-white mb-6 leading-tight">
                        Your <span className="italic text-med-terracotta">Odyssey</span> Awaits.
                    </h2>
                    <p className="text-blue-100/80 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
                        Orchestrate your next group trip with elegance. Access your event or sign up to create a new one.
                    </p>
                    <button onClick={() => setShowAuthModal(true)} className="inline-flex items-center justify-center font-bold tracking-[0.2em] uppercase transition-all duration-300 font-body relative overflow-hidden group rounded-full active:scale-95 bg-[#E2923D] text-white hover:bg-[#d17e2b] px-8 py-3.5 text-xs shadow-xl">
                        Access Your Event <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </section>

            <footer className="bg-med-sand dark:bg-gray-950 pt-20 pb-10 border-t border-slate-200 dark:border-slate-800 font-body">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid md:grid-cols-5 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Logo className="w-10 h-10" />
                                <span className="font-heading text-xl font-bold italic text-med-blue dark:text-white">Voyageurs</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
                                Shared discovery, perfected. We trade the chaos of coordination for pure travel elegance.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Instagram size={18} /></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Twitter size={18} /></a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-[0.2em] text-[10px] mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                                <li><a href="#features" className="hover:text-med-terracotta transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-med-terracotta transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-[0.2em] text-[10px] mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                                <li><button onClick={() => setShowAbout(true)} className="hover:text-med-terracotta transition-colors">About Us</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-[0.2em] text-[10px] mb-6">Access</h4>
                            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                                <li><button onClick={() => setShowAuthModal(true)} className="hover:text-med-terracotta transition-colors">Login</button></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <p>© 2026 Candor Digital Group, LLC. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => setShowPrivacy(true)} className="hover:text-med-terracotta transition-colors">Privacy</button>
                            <button onClick={() => setShowTerms(true)} className="hover:text-med-terracotta transition-colors">Terms</button>
                        </div>
                        <p>Made with <Heart size={10} className="inline text-red-500 mx-1" /> in Chicago.</p>
                    </div>
                </div>
            </footer>

            <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
            <AboutUsModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            <FeatureBreakdownModal isOpen={showFeatures} onClose={() => setShowFeatures(false)} />
            
            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                onGuestLoginSuccess={() => {
                    setShowAuthModal(false);
                    setShowOnboarding(true);
                }}
                onHostLoginSuccess={onHostLoginSuccess}
            />
        </div>
    );
};
