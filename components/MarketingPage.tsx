import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Calendar, CreditCard, Users, MessageSquare, CheckCircle, 
  Menu, X, ChevronRight, Star, Plane, Plus, Heart, Share2, 
  ArrowRight, Smartphone, Wine, Sun, Umbrella, Landmark, 
  Sparkles, Shield, ArrowUp, Moon, Sailboat, Lock, Mail, 
  Briefcase, PartyPopper, Palmtree, GraduationCap, Facebook, 
  Twitter, Instagram, DollarSign, ChevronDown, Compass, 
  Anchor, Send, Bot, Wand2, Check, Globe, Binoculars, 
  Loader2, Quote, ExternalLink, CalendarClock, Award, Network, WifiOff,
  Layout, Zap, Cpu, RotateCw, Rotate3d
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';
import { AboutUsModal } from './AboutUsModal';
import { FeatureBreakdownModal } from './FeatureBreakdownModal';

// --- Styles & Assets ---

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    .font-heading { font-family: 'Cormorant Garamond', serif; }
    .font-body { font-family: 'Montserrat', sans-serif; }
    
    .bg-paper-texture {
        background-color: #F5F2EB;
    }

    /* 3D Flip Utilities */
    .perspective-1000 { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
  `}</style>
);

// --- Custom Logo Component ---
const Logo = ({ className = "w-10 h-10", dark = false }) => (
  <div className={`relative flex items-center justify-center rounded-full ${dark ? 'bg-white border-2 border-med-blue dark:border-white' : 'bg-[#1E4472] border-2 border-med-terracotta'} shadow-lg ${className}`}>
    <Sailboat className={`${dark ? 'text-med-blue' : 'text-white'} w-[60%] h-[60%]`} strokeWidth={1.5} />
  </div>
);

// --- Reusable UI Components ---

const ButtonComp = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  onClick, 
  icon: Icon, 
  disabled = false, 
  size = 'md',
  isLoading = false
}: any) => {
  const baseStyle = "inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-300 font-body relative overflow-hidden group rounded-full active:scale-95";
  
  const sizes = {
      sm: "px-6 py-2.5 text-[10px]",
      md: "px-8 py-3.5 text-xs",
      lg: "px-10 py-4 text-sm"
  };

  const variants = {
    primary: "bg-[#E2923D] dark:bg-[#C25E3E] text-white hover:bg-[#d17e2b] dark:hover:bg-[#A04028] shadow-xl hover:shadow-2xl shadow-[#E2923D]/20 dark:shadow-none border border-transparent",
    secondary: "bg-transparent border border-med-terracotta text-med-terracotta hover:bg-med-terracotta hover:text-white dark:hover:text-white transition-all",
    terracotta: "bg-med-terracotta text-white hover:bg-[#c56143] shadow-xl hover:shadow-2xl shadow-med-terracotta/20",
    white: "bg-white dark:bg-slate-800 text-med-blue dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 shadow-xl",
    ghost: "text-med-blue dark:text-white hover:bg-med-blue/5 dark:hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled || isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
    >
      <span className="relative z-10 flex items-center">
        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
        {children}
        {!isLoading && Icon && <Icon className={`ml-2 transition-transform group-hover:translate-x-1 ${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />}
      </span>
    </button>
  );
};

const SectionHeading = ({ badge, title, subtitle, align = 'center', light = false }: any) => (
    <div className={`mb-16 ${align === 'center' ? 'text-center mx-auto max-w-4xl' : 'max-w-2xl'}`}>
      {badge && (
          <div className={`flex items-center gap-4 mb-6 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
              <div className={`h-px w-8 ${light ? 'bg-white' : 'bg-med-terracotta dark:bg-[#C25E3E]'}`}></div>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${light ? 'text-white' : 'text-med-terracotta dark:text-[#C25E3E]'}`}>
                  {badge}
              </span>
              {align === 'center' && (
                  <div className={`h-px w-8 ${light ? 'bg-white' : 'bg-med-terracotta dark:bg-[#C25E3E]'}`}></div>
              )}
          </div>
      )}
      <h2 className={`text-5xl md:text-6xl font-heading font-light leading-tight mb-6 ${light ? 'text-white' : 'text-med-blue dark:text-blue-100'}`}>
        {title.split('*').map((part: string, i: number) => 
            i % 2 === 1 ? <span key={i} className="italic text-med-terracotta dark:text-[#C25E3E]">{part}</span> : part
        )}
      </h2>
      {subtitle && (
        <p className={`text-lg font-light leading-relaxed ${light ? 'text-white/70' : 'text-slate-600 dark:text-slate-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
);

// --- Feature Card Component (Handles 3D Flip) ---
const FeatureCard = ({ icon: Icon, title, subtitle, desc, backIcon: BackIcon, backTitle, backDesc, features, isHero = false }: any) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Céleste Chat Simulation Logic (only for Hero card)
    const [chatState, setChatState] = useState({ q: "What's the dress code for Saturday?", a: "Black Tie Creative. Think velvet, sparkle, and Mediterranean flair." });
    
    useEffect(() => {
        if (!isHero) return;
        const examples = [
            { q: "What's the dress code for Saturday?", a: "Black Tie Creative. Think velvet, sparkle, and Mediterranean flair." },
            { q: "Best coffee near the hotel?", a: "Coldrip is a 3-minute walk. They serve excellent flat whites." },
            { q: "Is the gallery open on Monday?", a: "Yes, Musée Fabre is open 10am-6pm. Your ticket is already saved." }
        ];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % examples.length;
            setChatState(examples[index]);
        }, 5000);
        return () => clearInterval(interval);
    }, [isHero]);

    return (
        <div 
            className={`bento-card group relative h-full cursor-pointer perspective-1000 ${isHero ? 'md:col-span-2 md:row-span-2' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`bento-inner relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front Face */}
                <div className="bento-front absolute inset-0 backface-hidden p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 flex flex-col shadow-lg overflow-hidden">
                    <div className="mb-auto relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 transition-transform group-hover:scale-110 duration-500">
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">{title}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{subtitle}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">{desc}</p>
                        
                        {isHero && (
                             <div className="mt-8 space-y-4 relative z-10 max-w-md ml-auto min-h-[100px]">
                                <div className="flex justify-end">
                                    <div className="bg-med-blue text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm shadow-md animate-fade-in key-{chatState.q}">
                                        {chatState.q}
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-med-sand dark:bg-gray-800 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-slate-100 dark:border-gray-700 flex items-start gap-3 animate-fade-in key-{chatState.a}">
                                        <Sparkles className="w-4 h-4 text-med-terracotta mt-0.5 shrink-0" />
                                        <span>{chatState.a}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 text-med-terracotta">
                        {isHero ? <Rotate3d size={20} /> : <RotateCw size={20} />}
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-med-terracotta/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                </div>

                {/* Back Face */}
                <div className="bento-back absolute inset-0 backface-hidden rotate-y-180 bg-med-blue dark:bg-slate-800 text-white p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-xl border border-white/10">
                    <BackIcon size={32} className="text-med-lightBlue mb-4" />
                    <h4 className="font-bold uppercase tracking-widest text-sm mb-2 text-med-terracotta">{backTitle}</h4>
                    <p className="text-sm text-blue-100 mb-6">{backDesc}</p>
                    <ul className="text-xs text-left w-full space-y-2 text-blue-200">
                        {features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-2"><Check size={12} /> {feat}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Navbar Section ---
const Navbar = ({ onAuth, onLogin }: { onAuth: () => void, onLogin: () => void }) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 top-0 left-0 transition-all duration-500 px-4 ${
        scrolled 
        ? 'py-3 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl border-b border-med-blue/10 dark:border-white/5 shadow-lg shadow-black/5' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="font-heading text-2xl font-bold italic text-med-blue dark:text-white leading-none">Voyageurs</span>
        </div>
        
        <div className={`hidden md:flex items-center gap-8 px-8 py-3 rounded-full border transition-all duration-500 ${
            scrolled 
            ? 'bg-transparent border-transparent shadow-none backdrop-blur-none' 
            : 'bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-med-blue/10 dark:border-white/10 shadow-sm'
        }`}>
            <a href="#philosophy" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">About</a>
            <a href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border border-med-blue/10 dark:border-white/10 shadow-sm text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <ButtonComp onClick={onAuth} size="sm" variant="primary">Early Access</ButtonComp>
        </div>
      </div>
    </nav>
  );
};

// --- Auth / Waitlist Form ---
const AuthForm = ({ onBack, onComplete, mode = 'waitlist' }: { onBack: () => void, onComplete: () => void, mode?: 'waitlist' | 'login' | 'host_signup' }) => {
    const { loginHost, signupHost } = useAuth();
    const { login: guestLogin } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (mode === 'waitlist') {
                // Mock Waitlist Logic
                await new Promise(resolve => setTimeout(resolve, 1500));
                // For demo purposes, we'll just log them in as a guest
                guestLogin(name, email, 1, 'Pending', '', '');
                onComplete();
            } else if (mode === 'login') {
                // Host Login Logic
                const success = await loginHost(password);
                if (success) onComplete();
                else setError("Invalid credentials.");
            } else if (mode === 'host_signup') {
                await signupHost(email, password);
                localStorage.removeItem('trip_initialized'); // Reset for onboarding
                onComplete();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F2EB] dark:bg-slate-950 flex items-center justify-center p-4 font-body bg-paper-texture relative">
            <button onClick={onBack} className="absolute top-8 left-8 p-3 bg-white dark:bg-slate-900 rounded-full shadow-lg text-slate-400 hover:text-med-blue dark:hover:text-white transition-all"><ArrowRight className="rotate-180 w-6 h-6" /></button>
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-10">
                    <Logo className="w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-4xl font-heading italic text-med-blue dark:text-white mb-2">
                        {mode === 'waitlist' ? 'Join the Waitlist' : mode === 'login' ? 'Welcome Back' : 'Host Access'}
                    </h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-med-terracotta dark:text-[#C25E3E]">
                        {mode === 'waitlist' ? 'Voyageurs' : 'Host Account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl">{error}</div>}
                    
                    {mode !== 'login' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white" placeholder="Jean Dupont" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white" placeholder="name@example.com" />
                    </div>

                    {mode !== 'waitlist' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white" placeholder="••••••" />
                        </div>
                    )}

                    <ButtonComp type="submit" className="w-full py-4 shadow-xl" isLoading={isLoading}>
                        {mode === 'waitlist' ? 'Join Waitlist' : mode === 'login' ? 'Log In' : 'Create Account'}
                    </ButtonComp>
                </form>
            </div>
        </div>
    );
};

// --- Footer Component ---
const Footer = ({ onAuth, onHost, onPrivacy, onTerms, onAbout }: any) => (
  <footer className="bg-[#F5F2EB] dark:bg-slate-950 pt-20 pb-10 border-t border-slate-200 dark:border-slate-800 font-body">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="grid md:grid-cols-5 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Logo className="w-8 h-8" />
            <span className="font-heading text-xl font-bold text-med-blue dark:text-white italic">Voyageurs</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
            Shared discovery, perfected. We trade the chaos of coordination for pure travel elegance.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Instagram size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Twitter size={18} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-widest text-xs mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="#features" className="hover:text-med-terracotta transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-med-terracotta transition-colors">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-widest text-xs mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li><button onClick={onAbout} className="hover:text-med-terracotta transition-colors">About Us</button></li>
          </ul>
        </div>

        <div>
            <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-widest text-xs mb-6">Access</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li><button onClick={onHost} className="hover:text-med-terracotta transition-colors">Login</button></li>
            </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>© 2026 Candor Digital Group, LLC. All rights reserved.</p>
        <div className="flex gap-6">
            <button onClick={onPrivacy} className="hover:text-med-terracotta transition-colors">Privacy</button>
            <button onClick={onTerms} className="hover:text-med-terracotta transition-colors">Terms</button>
        </div>
        <p>Made with <Heart size={10} className="inline text-red-500 mx-1" /> in Chicago.</p>
      </div>
    </div>
  </footer>
);

// --- Main Export ---

export const MarketingPage = ({ onHostLogin, onPrivacyClick, onTermsClick }: any) => {
  const [view, setView] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'waitlist' | 'login' | 'host_signup'>('waitlist');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    document.title = "Voyageurs... for Better Group Travel";
  }, []);

  const handleAuth = (mode: 'waitlist' | 'login' | 'host_signup' = 'waitlist') => {
      setAuthMode(mode);
      setView('auth');
  };

  if (view === 'auth') {
      return (
        <>
            <Styles />
            <AuthForm 
                onBack={() => setView('landing')} 
                onComplete={() => { window.location.href = '/'; }} 
                mode={authMode} 
            />
        </>
      );
  }

  return (
    <div className="font-body bg-[#F5F2EB] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 selection:bg-med-terracotta selection:text-white transition-colors duration-300 relative">
      <Styles />
      
      {/* Playground Banner */}
      <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-xs font-bold uppercase tracking-widest fixed top-0 left-0 right-0 z-[1000] flex items-center justify-center gap-2">
        <Layout size={14} /> Playground Mode
      </div>

      <Navbar 
        onAuth={() => handleAuth('waitlist')} 
        onLogin={() => handleAuth('login')}
      />
      
      {/* 1. Hero Section */}
      <section className="relative pt-48 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                
                {/* Text Side */}
                <div className="lg:w-1/2 text-center lg:text-left animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        <span className="text-med-terracotta dark:text-[#C25E3E] font-bold uppercase tracking-widest text-[10px]">Upgraded Group Travel</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-heading font-light text-med-blue dark:text-blue-100 mb-8 leading-[0.9]">
                        Less planning, <br/>
                        <span className="italic text-med-terracotta dark:text-[#C25E3E]">more connecting.</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
                        Orchestrate your next group trip without the spreadsheet fatigue. Voyageurs unifies collaborative itinerary planning, shared expense tracking, and local discovery into one fluid experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <ButtonComp onClick={() => handleAuth('waitlist')} icon={ArrowRight}>Early Access</ButtonComp>
                    </div>
                </div>

                {/* Visual Side */}
                <div className="lg:w-1/2 relative h-[600px] w-full group perspective-1000 animate-in slide-in-from-bottom-10 duration-1000 delay-200">
                    {/* Floating Card */}
                    <div className="absolute top-1/2 left-0 z-40 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 transform -translate-y-1/2 -translate-x-12 hidden lg:flex items-center gap-4 transition-transform group-hover:translate-x-[-3rem] group-hover:scale-105">
                        <div className="w-14 h-14 bg-med-terracotta dark:bg-[#C25E3E] rounded-full flex items-center justify-center text-white shadow-lg shadow-med-terracotta/30">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="font-heading text-2xl text-med-blue dark:text-white leading-none">Montpellier</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta dark:text-[#C25E3E] mt-1">Sept 18 - 22 • Secured</p>
                        </div>
                    </div>

                    {/* Image Grid */}
                    {/* Top Right Card (Philosophy Mood) */}
                    <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform rotate-3 z-10 transition-all duration-700 ease-out group-hover:rotate-6 group-hover:translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1690132007585-1ef4b16f49d3?q=80&w=2342&auto=format&fit=crop" className="w-full h-full object-cover" alt="Philosophy Mood" />
                    </div>
                    {/* Bottom Left Card (Mediterranean Lifestyle) */}
                    <div className="absolute bottom-0 left-8 w-3/5 h-3/5 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform -rotate-6 z-0 transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:-translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1619523439722-c27651e8e10e?q=80&w=2342&auto=format&fit=crop" className="w-full h-full object-cover" alt="Mediterranean Lifestyle" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Philosophy Section */}
      <section id="philosophy" className="py-24 bg-white dark:bg-[#1e293b] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                
                {/* Text Content */}
                <div className="lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta dark:text-[#C25E3E]">The Philosophy</span>
                        <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E] lg:hidden"></div>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight mb-6 text-med-blue dark:text-blue-100">
                        Elevate the <span class="italic text-med-terracotta dark:text-[#C25E3E]">Experience.</span>
                    </h2>
                    <p className="text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400 mb-8">
                        Great journeys shouldn't require a project manager. We believe the magic of travel lies in the moment, not the administration. By replacing fragmented chat threads and endless email chains with a centralized hub for group coordination, we make the logistics invisible—letting the memories take center stage.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button onClick={() => setShowAbout(true)} className="text-med-blue dark:text-white font-bold uppercase tracking-widest text-xs border-b border-med-blue dark:border-white pb-1 hover:text-med-terracotta hover:border-med-terracotta transition-all">
                            Read our Manifesto
                        </button>
                    </div>
                </div>

                {/* Stacked Cards Visual */}
                <div className="lg:w-1/2 relative h-[500px] w-full flex items-center justify-center order-1 lg:order-2 group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-med-sand/50 dark:bg-med-blue/5 rounded-full blur-3xl -z-10"></div>
                    
                    {/* Back Card (Swapped) */}
                    <div className="absolute w-4/5 h-4/5 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 transform -rotate-6 transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:-translate-x-4 group-hover:scale-95 z-10 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                         <img src="https://images.unsplash.com/photo-1659882751335-43e664461e6d?q=80&w=735&auto=format&fit=crop" alt="Mediterranean street" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 bg-med-blue/10 dark:bg-black/20 mix-blend-multiply"></div>
                    </div>

                    {/* Front Card (Swapped) */}
                    <div className="absolute w-4/5 h-4/5 rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-8 border-white dark:border-gray-800 transform rotate-3 translate-x-4 translate-y-4 transition-all duration-700 ease-out group-hover:rotate-6 group-hover:translate-x-8 group-hover:scale-105 z-20 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                         <img src="https://images.unsplash.com/photo-1474925558543-e7a5f06e733e?q=80&w=1170&auto=format&fit=crop" alt="Friends jumping" className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Floating Badge */}
                    <div className="absolute bottom-10 -left-4 z-30 bg-white dark:bg-gray-900 px-6 py-4 rounded-full shadow-xl border border-med-sand dark:border-gray-700 animate-in slide-in-from-bottom-8 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-med-terracotta text-white flex items-center justify-center">
                            <Heart size={20} fill="currentColor" />
                         </div>
                         <div>
                            <p className="font-heading text-lg text-med-blue dark:text-white leading-none">L'Art de Vivre</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Our Core Value</p>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    {/* 4. Features Section (Bento Grid) */}
    <section id="features" className="py-24 bg-med-sand dark:bg-gray-950 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <SectionHeading 
                badge="The Ecosystem" 
                title="Elegantly *Powerful.*" 
                subtitle="Transform chaotic group chats into a seamless travel plan. Tap any card below to explore the technology powering your journey."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)] perspective-1000">
                
                {/* 1. Céleste AI (Hero: 2x2) */}
                <FeatureCard 
                    isHero={true}
                    icon={Bot} 
                    title="Meet Céleste" 
                    subtitle="Your AI Concierge" 
                    desc="A concierge that knows your group. From suggesting the perfect wine pairing to finding a late-night pharmacy, Céleste provides context-aware guidance based on your specific itinerary."
                    backIcon={Cpu}
                    backTitle="How it Works"
                    backDesc="Built with smart technology that understands travel. Céleste remembers your group's dietary needs, budget limits, and favorite styles."
                    features={['Privacy First', 'Smart Memory']}
                />

                {/* 2. Planning */}
                <FeatureCard 
                    icon={Compass} 
                    title="Plan Before You Book" 
                    subtitle="Logistics Engine" 
                    desc="Dream with precision. Build your group itinerary visually and watch the per-person budget estimates adjust in real-time."
                    backIcon={CalendarClock}
                    backTitle="Collaborative Canvas"
                    backDesc="Real-time multiplayer editing. Drag, drop, and vote on activities. Syncs instantly with Google Calendar."
                    features={['Smart Scheduling', 'Automatic Timezones']}
                />

                {/* 3. Finance */}
                <FeatureCard 
                    icon={DollarSign} 
                    title="Frictionless Finance" 
                    subtitle="Shared Ledger" 
                    desc="Settle up, stress down. Scan receipts, split costs instantly among the group, and transparently track who owes who."
                    backIcon={Layout}
                    backTitle="Smart Ledger"
                    backDesc="Multi-currency support with real-time exchange rates. Snap a photo to instantly read and itemize receipts."
                    features={['Secure Payments', 'PDF Export']}
                />

                {/* 4. Curated Discovery */}
                <FeatureCard 
                    icon={Binoculars} 
                    title="Curated Discovery" 
                    subtitle="Local Insights" 
                    desc="Move beyond tourist traps. Access curated guides featuring hand-picked gems and local secrets tailored to your destination."
                    backIcon={Award}
                    backTitle="Vetted Locals"
                    backDesc="We partner with over 500 local experts who curate seasonal lists. No sponsored content, just authentic recommendations."
                    features={['"Hidden Gem" Algorithm', 'Verified Reviews Only']}
                />

                {/* 5. Matchmaker */}
                <FeatureCard 
                    icon={Users} 
                    title="Guest Matchmaker" 
                    subtitle="Social Alchemy" 
                    desc="Social alchemy. Intelligent suggestions help your guests connect and find their tribe based on shared interests before departure."
                    backIcon={Network}
                    backTitle="Smart Connections"
                    backDesc="We analyze shared interests to suggest room allocations and carpools. Perfect for large retreats."
                    features={['Ice Breaker Generator', 'Personality Matching']}
                />

                {/* 6. Mobile */}
                <FeatureCard 
                    icon={Smartphone} 
                    title="Your Trip, Anywhere" 
                    subtitle="Cross-Platform" 
                    desc="A pocket-sized command center. Maps, group chats, and tickets live in harmony on any device, online or offline."
                    backIcon={WifiOff}
                    backTitle="Works Without Signal"
                    backDesc="Full itinerary access without data roaming. Changes sync automatically when you reconnect to the grid."
                    features={['No Download Needed', 'Battery Optimized']}
                />

            </div>
        </div>
    </section>

    {/* 5. Pricing Section */}
    <section id="pricing" className="py-24 bg-white dark:bg-[#1e293b]">
        <div className="container mx-auto px-4 max-w-7xl">
            <SectionHeading 
                badge="Membership" 
                title="Simply *Affordable.*" 
                subtitle="Transparent pricing for every kind of group trip."
            />
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16 animate-in fade-in">
                <span 
                    className={`text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${!isAnnual ? 'text-med-blue dark:text-white' : 'text-slate-400'}`}
                    onClick={() => setIsAnnual(false)}
                >
                    Monthly
                </span>
                <button 
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="w-14 h-8 bg-med-blue/10 dark:bg-gray-800 rounded-full p-1 relative transition-colors duration-300 focus:outline-none ring-offset-2 focus:ring-2 ring-med-terracotta/50"
                >
                    <div className={`w-6 h-6 bg-med-terracotta rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
                <span 
                    className={`text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${isAnnual ? 'text-med-blue dark:text-white' : 'text-slate-400'}`}
                    onClick={() => setIsAnnual(true)}
                >
                    Annual <span className="text-med-terracotta text-[9px] ml-1">(Save 20%)</span>
                </span>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Explorer */}
                <div className="relative p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col bg-med-sand dark:bg-gray-900 border-slate-100 dark:border-gray-800 text-slate-800 dark:text-slate-200 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-8">
                        <h3 className="text-xl font-heading mb-2 text-med-blue dark:text-white">Explorer</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold font-heading text-slate-900 dark:text-white">$0</span>
                            <span className="text-xs uppercase tracking-wide text-slate-400">forever</span>
                        </div>
                        <p className="text-sm mt-4 text-slate-500 dark:text-slate-400">Essential coordination tools for intimate group gatherings.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {['Up to 10 Guests', '1 Active Trip', 'Mobile App Access'].map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> {f}</li>
                        ))}
                    </ul>
                    <ButtonComp onClick={() => handleAuth('waitlist')} variant="white" className="w-full">Early Access</ButtonComp>
                </div>

                {/* Connoisseur */}
                <div className="relative p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col bg-med-blue text-white border-med-blue shadow-2xl scale-105 z-10 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(30,68,114,0.25)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-med-terracotta text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Most Popular</div>
                    <div className="mb-8">
                        <h3 className="text-xl font-heading mb-2 text-white">Connoisseur</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold font-heading text-white">{isAnnual ? '$8' : '$10'}</span>
                            <span className="text-xs uppercase tracking-wide text-blue-200">per month{isAnnual && ' (billed annually)'}</span>
                        </div>
                        <p className="text-sm mt-4 text-blue-100">Advanced logistics and AI assistance for the dedicated host.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {['Up to 25 Guests', '3 Active Trips', 'AI Concierge (Céleste)', 'Expense Ledger'].map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-med-terracotta mt-0.5" /> {f}</li>
                        ))}
                    </ul>
                    <ButtonComp onClick={() => handleAuth('waitlist')} variant="terracotta" className="w-full">Early Access</ButtonComp>
                </div>

                {/* Artisan */}
                <div className="relative p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col bg-med-sand dark:bg-gray-900 border-slate-100 dark:border-gray-800 text-slate-800 dark:text-slate-200 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-8">
                        <h3 className="text-xl font-heading mb-2 text-med-blue dark:text-white">Artisan</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold font-heading text-slate-900 dark:text-white">{isAnnual ? '$60' : '$75'}</span>
                            <span className="text-xs uppercase tracking-wide text-slate-400">per month{isAnnual && ' (billed annually)'}</span>
                        </div>
                        <p className="text-sm mt-4 text-slate-500 dark:text-slate-400">White-glove features for professional retreat leaders.</p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {['Unlimited Guests', 'White-Label Portal', 'Priority Support'].map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm"><CheckCircle size={16} className="text-slate-400 mt-0.5" /> {f}</li>
                        ))}
                    </ul>
                    <ButtonComp onClick={() => handleAuth('waitlist')} variant="white" className="w-full">Early Access</ButtonComp>
                </div>
            </div>

            <div className="mt-16 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Not sure which plan is right for you?</p>
                <button onClick={() => setShowFeatures(true)} className="text-med-blue dark:text-blue-400 font-bold uppercase tracking-widest text-xs border-b border-med-blue dark:border-blue-400 pb-1 hover:text-med-terracotta hover:border-med-terracotta transition-all">
                    Compare all features
                </button>
            </div>
        </div>
    </section>

    {/* 6. Signup Section */}
    <section id="signup" class="py-24 bg-med-blue dark:bg-[#0f172a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-med-terracotta/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
            <div className="max-w-2xl w-full text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="h-px w-8 bg-med-terracotta"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta">Early Access</span>
                    <div className="h-px w-8 bg-med-terracotta"></div>
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-light text-white mb-6 leading-tight">
                    Start Your <span className="italic text-med-terracotta">Odyssey.</span>
                </h2>
                <p className="text-blue-100/80 text-lg font-light leading-relaxed">
                    Be among the first to orchestrate group travel with elegance. Join the waitlist for our next release and simplify your planning.
                </p>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
                <form 
                    onSubmit={(e) => { 
                        e.preventDefault(); 
                        handleAuth('waitlist'); // Just trigger the auth modal logic for waitlist 
                    }} 
                    className="space-y-6"
                >
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-200 ml-1">Full Name</label>
                        <input type="text" className="w-full p-4 bg-black/20 rounded-2xl border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-med-terracotta/50 focus:ring-1 focus:ring-med-terracotta/50 transition-all text-sm" placeholder="Jean Dupont" />
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-blue-200 ml-1">Email Address</label>
                        <input type="email" className="w-full p-4 bg-black/20 rounded-2xl border border-white/10 text-white placeholder:text-white/20 outline-none focus:border-med-terracotta/50 focus:ring-1 focus:ring-med-terracotta/50 transition-all text-sm" placeholder="name@example.com" />
                    </div>
                    <ButtonComp type="submit" variant="terracotta" className="w-full py-4 shadow-xl" icon={ArrowRight}>
                        Join Waitlist
                    </ButtonComp>
                </form>
            </div>
        </div>
    </section>

    <Footer 
        onAuth={() => handleAuth('login')} 
        onHost={onHostLogin} 
        onPrivacy={() => setShowPrivacy(true)} 
        onTerms={() => setShowTerms(true)}
        onAbout={() => setShowAbout(true)} 
    />

    <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    <AboutUsModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    <FeatureBreakdownModal isOpen={showFeatures} onClose={() => setShowFeatures(false)} />
    
    {/* Floating AI Marketing Assistant */}
    <MarketingConcierge />
    </div>
  );
};
