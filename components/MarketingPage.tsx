
import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, 
  Calendar, 
  CreditCard, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  Plane, 
  Plus, 
  Heart, 
  Share2, 
  ArrowRight, 
  Smartphone, 
  Wine, 
  Sun, 
  Umbrella, 
  Landmark, 
  Sparkles, 
  Shield, 
  ArrowUp, 
  Moon, 
  Sailboat, 
  Lock, 
  Mail, 
  Briefcase, 
  PartyPopper, 
  Palmtree, 
  GraduationCap, 
  Facebook, 
  Twitter, 
  Instagram, 
  DollarSign, 
  ChevronDown, 
  Compass, 
  Anchor, 
  Send, 
  Bot, 
  Wand2, 
  Check, 
  Globe, 
  Binoculars, 
  Loader2, 
  Quote,
  ExternalLink
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';
import { AboutUsModal } from './AboutUsModal';
import { FeatureBreakdownModal } from './FeatureBreakdownModal';

const GOOGLE_CLIENT_ID = "436751288359-kg1n1timqtrdr1damc19fertgocs8paf.apps.googleusercontent.com";

// --- Marketing Specific AI Instruction ---
const MARKETING_SYSTEM_INSTRUCTION = `
You are "Céleste", the sophisticated AI spokesperson for the Voyageurs travel app. 
Your goal is to help visitors understand why Voyageurs is the premier platform for high-end group travel coordination.

KEY RULES:
1. **APP FOCUS ONLY**: You are an expert on the Voyageurs app itself (features, pricing, philosophy).
2. **NO PRIVATE TRIP DATA**: You do NOT know anything about specific individual trips. If a user asks about "Bryan's Birthday", "Alex's Escape", or any specific event, politely explain that you are a general platform assistant and those events are private to their respective hosts and invited guests.
3. **PRICING EXPERT**: You know the tiers: Leisure ($0), Professional ($10/mo), and Business ($75/mo).
4. **FEATURE HIGHLIGHTS**: Discuss the AI Concierge, Budget Estimator, Guest Matchmaker, and Expense Ledger.
5. **TONE**: Chic, Mediterranean, welcoming, and concise (under 80 words).
6. **GROUNDING**: Use Google Search for general travel questions (e.g., "Best time to visit France") but always relate it back to how Voyageurs can help organize such a trip.
`;

// --- Gemini API Helper ---
const callMarketingGemini = async (prompt: string, history: any[] = []) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: MARKETING_SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    const sources: any[] = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
            if (!sources.some(s => s.uri === chunk.web?.uri)) {
                sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            }
        }
      });
    }

    return { text: text || "I apologize, the connection is currently misty.", sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I apologize, I am currently navigating offline. Please try again later.", sources: [] };
  }
};

// --- Styles & Assets ---

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

    /* Scrollbar for the app demo */
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

// --- AI Concierge Widget ---
const MarketingConcierge = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([
        { role: 'model', text: "Bonjour! I am Céleste. How can I help you discover Voyageurs today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        const response = await callMarketingGemini(userMsg, messages);
        
        setMessages(prev => [...prev, { role: 'model', text: response.text, sources: response.sources }]);
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-body">
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute bottom-20 right-0 w-[90vw] md:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="p-6 bg-paper-texture dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-med-blue rounded-full flex items-center justify-center text-white shadow-lg"><Sparkles size={18} /></div>
                                <div>
                                    <h4 className="font-heading text-lg text-med-blue dark:text-white leading-none">Céleste</h4>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-med-terracotta dark:text-[#C25E3E] mt-1">Voyageurs Guide</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-med-terracotta dark:hover:text-[#C25E3E]"><X size={20} /></button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-med-blue text-white rounded-br-none' : 'bg-paper-texture dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm border border-white/50'}`}>
                                        <p className="whitespace-pre-wrap">{m.text}</p>
                                        {m.sources && m.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5">
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Sources</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {m.sources.map((s: any, j: number) => (
                                                        <a key={j} href={s.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[8px] hover:bg-med-terracotta/10 transition-colors">
                                                            <ExternalLink size={8} /> <span className="truncate max-w-[100px]">{s.title}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-paper-texture dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin text-med-terracotta dark:text-[#C25E3E]" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask about features, pricing..." 
                                className="flex-1 bg-paper-texture dark:bg-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-med-terracotta/20 dark:text-white"
                            />
                            <button type="submit" disabled={!input.trim() || isLoading} className="p-3 bg-med-blue text-white rounded-xl hover:bg-med-terracotta dark:hover:bg-[#C25E3E] transition-all disabled:opacity-50"><Send size={16}/></button>
                        </form>
                    </div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group relative z-[110] 
                ${isOpen ? 'bg-med-terracotta dark:bg-[#C25E3E] rotate-90' : 'bg-med-blue dark:bg-[#C25E3E] hover:bg-med-terracotta dark:hover:bg-[#A04028]'}`}
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <Sparkles size={24} className="group-hover:animate-pulse" />
                        <span className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center justify-center animate-bounce shadow-md ${isOpen ? 'bg-white text-med-terracotta dark:text-[#C25E3E]' : 'bg-med-terracotta dark:bg-white text-white dark:text-[#C25E3E]'}`}>Bonjour!</span>
                    </>
                )}
            </button>
        </div>
    );
};

// --- Auth Form Component ---
const AuthForm = ({ onBack, onComplete, initialMode = 'signup' }: { onBack: () => void, onComplete: () => void, initialMode?: 'signup' | 'login' | 'host_signup' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isHostSignup, setIsHostSignup] = useState(initialMode === 'host_signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginHost, signupHost } = useAuth();
  const { login: guestLogin, loginWithGoogle } = useUser();
  const { addNotification } = useNotification();

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        addNotification("Google Sign-In simulated for demo.", "info");
        onComplete();
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        if (isHostSignup) {
            // New Host Signup Flow
            await signupHost(email, password);
            
            // CRITICAL: Reset trip state to ensure Onboarding Flow triggers correctly in App.tsx
            // This forces the App to see "Default" state on next load, enabling the wizard.
            localStorage.removeItem('trip_initialized');
            localStorage.removeItem('voyageur_trips');
            localStorage.removeItem('voyageur_active_trip');
            
            onComplete();
            return;
        }

        // Login Logic
        // Special Case: Returning Host check (Simulated for Admin Demo)
        const isHostLogin = email.includes('admin') || email.includes('host') || email.includes('bryan');
        
        if (isHostLogin && isLogin) {
            const success = await loginHost(password);
            if (success) {
                onComplete();
                return;
            } else {
                setError("Invalid host credentials. Are you trying to join as a guest?");
                setIsLoading(false);
                return;
            }
        }

        // Standard Case: Guest Signup/Login
        if (!isLogin && !name) {
            setError("Please enter your name for your profile.");
            setIsLoading(false);
            return;
        }

        // Mock Guest logic: Any email works in this prototype
        guestLogin(name || email.split('@')[0], email, 1, 'Pending', '', '');
        onComplete();
        
    } catch (err: any) {
        setError(err.message || "An error occurred during authentication.");
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
                {isHostSignup ? 'Create Event' : isLogin ? 'Welcome Back' : 'Join the Party'}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-med-terracotta dark:text-[#C25E3E]">
                {isHostSignup ? 'Host Account' : 'Voyageurs'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
              <ButtonComp variant="secondary" className="w-full" onClick={handleGoogleLogin} icon={Globe}>Continue with Google</ButtonComp>
              <div className="relative flex items-center justify-center py-4">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                  <span className="bg-white dark:bg-slate-900 px-3 text-[9px] uppercase font-bold text-slate-300 absolute">Or</span>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             {error && (
                 <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-500 font-bold animate-in shake">
                     {error}
                 </div>
             )}
             
             {(!isLogin || isHostSignup) && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white" placeholder="Jean Dupont" />
                 </div>
             )}

             <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
               <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600" placeholder="name@example.com" />
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
               <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-med-terracotta transition-all text-med-blue dark:text-white" placeholder="••••••" />
             </div>

             <ButtonComp 
                type="submit" 
                className="w-full py-4 shadow-xl" 
                isLoading={isLoading}
             >
                {isHostSignup ? 'Start Planning' : isLogin ? 'Enter Hub' : 'Create Guest Account'}
             </ButtonComp>
          </form>

          {!isHostSignup && (
              <p className="text-center text-xs text-slate-400 mt-8 cursor-pointer hover:text-med-blue dark:hover:text-white" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Need an account? Sign Up" : "Have an account? Log In"}
              </p>
          )}
          {isHostSignup && (
              <p className="text-center text-xs text-slate-400 mt-8 cursor-pointer hover:text-med-blue dark:hover:text-white" onClick={() => { setIsHostSignup(false); setIsLogin(true); }}>
                Already have a host account? Log In
              </p>
          )}
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
            <span className="font-heading text-2xl font-bold text-med-blue dark:text-white leading-none">Voyageurs</span>
        </div>
        
        <div className={`hidden md:flex items-center gap-8 px-8 py-3 rounded-full border transition-all duration-500 ${
            scrolled 
            ? 'bg-transparent border-transparent shadow-none backdrop-blur-none' 
            : 'bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-med-blue/10 dark:border-white/10 shadow-sm'
        }`}>
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
          <ButtonComp onClick={onAuth} size="sm">Start Planning</ButtonComp>
        </div>
      </div>
    </nav>
  );
};

// --- Pricing Component ---
const Pricing = ({ onAuth, onCompareFeatures }: { onAuth: () => void, onCompareFeatures: () => void }) => {
  const plans = [
    {
      name: "Explorer",
      price: "$0",
      period: "forever",
      description: "Essential coordination tools for intimate gatherings and family escapes.",
      features: ["Up to 10 Guests", "1 Active Trip", "Standard Itinerary", "Mobile App Access"],
      cta: "Start Free",
      action: onAuth,
      highlight: false
    },
    {
      name: "Connoisseur",
      price: "$10",
      period: "per month",
      description: "Advanced logistics and AI assistance for the host who demands perfection.",
      features: ["Up to 25 Guests", "3 Active Trips", "AI Concierge (Céleste)", "Expense Ledger", "Real-time Alerts"],
      cta: "Start Trial",
      action: onAuth,
      highlight: true
    },
    {
      name: "Artisan",
      price: "$75",
      period: "per month",
      description: "White-glove features and brand control for professional retreat leaders.",
      features: ["Unlimited Guests", "Unlimited Trips", "White-Label Portal", "Custom Domain", "Priority Support"],
      cta: "Contact Sales",
      action: onAuth, // In reality this might open a mailto or contact form
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-[#1e293b]">
      <div className="container mx-auto px-4 max-w-7xl">
        <SectionHeading 
            badge="Membership" 
            title="Simply *Affordable.*" 
            subtitle="Flexible plans for every type of traveler. From weekend getaways to grand celebrations."
        />
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col ${plan.highlight ? 'bg-[#1E4472] text-white border-[#1E4472] shadow-2xl scale-105 z-10' : 'bg-[#FDFBF7] dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'}`}>
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-med-terracotta text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className={`text-xl font-heading mb-2 ${plan.highlight ? 'text-white' : 'text-med-blue dark:text-white'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold font-heading ${plan.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                  <span className={`text-xs uppercase tracking-wide ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{plan.period}</span>
                </div>
                <p className={`text-sm mt-4 ${plan.highlight ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-med-terracotta' : 'text-slate-400'}`} />
                    <span className={plan.highlight ? 'text-white/90' : 'text-slate-600 dark:text-slate-300'}>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <ButtonComp 
                onClick={plan.action} 
                variant={plan.highlight ? 'terracotta' : 'white'} 
                className="w-full"
              >
                {plan.cta}
              </ButtonComp>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Not sure which plan is right for you?</p>
          <button onClick={onCompareFeatures} className="text-med-blue dark:text-blue-400 font-bold uppercase tracking-widest text-xs border-b border-med-blue dark:border-blue-400 pb-1 hover:text-med-terracotta hover:border-med-terracotta transition-all">
            Compare all features
          </button>
        </div>
      </div>
    </section>
  );
};

// --- Testimonial Component ---
const Testimonial = () => (
  <section className="py-24 bg-[#1E4472] dark:bg-[#0f172a] relative overflow-hidden">
    <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
      <Quote size={48} className="text-white/20 mx-auto mb-8" />
      <p className="text-2xl md:text-4xl font-heading text-white font-light leading-relaxed mb-8">
        "Voyageurs transformed our wedding logistics. Instead of a chaotic WhatsApp group, our guests had a beautiful digital itinerary. It felt like we hired a private concierge."
      </p>
      <div className="flex items-center justify-center gap-4">
        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" alt="Sarah J." />
        <div className="text-left">
          <p className="text-white font-bold text-sm uppercase tracking-wider">Sarah Jenkins</p>
          <p className="text-white/50 text-xs">Wedding in Provence • 85 Guests</p>
        </div>
      </div>
    </div>
  </section>
);

// --- Footer Component ---
const Footer = ({ onAuth, onHost, onPrivacy, onTerms, onAbout }: any) => (
  <footer className="bg-[#F5F2EB] dark:bg-slate-950 pt-20 pb-10 border-t border-slate-200 dark:border-slate-800 font-body">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Logo className="w-8 h-8" />
            <span className="font-heading text-xl font-bold text-med-blue dark:text-white">Voyageurs</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
            The art of shared discovery. We replace the friction of coordination with elegance, so you can focus on what matters: the destination and the company you keep.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Instagram size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Twitter size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-800"><Facebook size={18} /></a>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-widest text-xs mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="#features" className="hover:text-med-terracotta transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-med-terracotta transition-colors">Pricing</a></li>
            <li><button onClick={onAuth} className="hover:text-med-terracotta transition-colors">Login</button></li>
            <li><button onClick={onHost} className="hover:text-med-terracotta transition-colors flex items-center gap-2"><Lock size={12} /> Host Admin</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-med-blue dark:text-white uppercase tracking-widest text-xs mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li><button onClick={onAbout} className="hover:text-med-terracotta transition-colors">About Us</button></li>
            <li><button onClick={onPrivacy} className="hover:text-med-terracotta transition-colors">Privacy Policy</button></li>
            <li><button onClick={onTerms} className="hover:text-med-terracotta transition-colors">Terms of Service</button></li>
            <li><a href="mailto:support@voyageurs.app" className="hover:text-med-terracotta transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <p>© 2026 Candor Digital Group, LLC. All rights reserved.</p>
        <p>Made with <Heart size={10} className="inline text-red-500 mx-1" /> in Chicago.</p>
      </div>
    </div>
  </footer>
);

// --- Main Export ---

export const MarketingPage = ({ onHostLogin, onPrivacyClick, onTermsClick }: any) => {
  const [view, setView] = useState<'landing' | 'auth'>('landing');
  const [authMode, setAuthMode] = useState<'signup' | 'login' | 'host_signup'>('signup');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Explicitly override title on mount for marketing view
  useEffect(() => {
    document.title = "Voyageurs... for Better Group Travel";
  }, []);

  const handleAuth = (mode: 'signup' | 'login' | 'host_signup' = 'signup') => {
      setAuthMode(mode);
      setView('auth');
  };

  if (view === 'auth') {
      return (
        <>
            <Styles />
            <AuthForm 
                onBack={() => setView('landing')} 
                onComplete={() => {
                    // Force state sync by reload to ensure app context re-initializes cleanly
                    window.location.href = '/'; 
                }} 
                initialMode={authMode} 
            />
        </>
      );
  }

  return (
    <div className="font-body bg-[#F5F2EB] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 selection:bg-med-terracotta selection:text-white transition-colors duration-300 relative">
      <Styles />
      <Navbar 
        onAuth={() => handleAuth('host_signup')} 
        onLogin={() => handleAuth('login')}
      />
      
      {/* 1. Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                
                {/* Text Side */}
                <div className="lg:w-1/2 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                        <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        <span className="text-med-terracotta dark:text-[#C25E3E] font-bold uppercase tracking-[0.2em] text-[10px]">Upgraded Group Travel</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-heading font-light text-med-blue dark:text-blue-100 mb-8 leading-[0.9]">
                        Less planning, <br/>
                        <span className="italic text-med-terracotta dark:text-[#C25E3E]">more connecting.</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed">
                        Orchestrate your next group odyssey without the spreadsheet fatigue. Voyageurs unifies logistics, finance, and discovery into one fluid, shared experience. You bring the people; we’ll handle the precision.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <ButtonComp onClick={() => handleAuth('host_signup')} icon={ArrowRight}>Start Planning</ButtonComp>
                    </div>
                </div>

                {/* Visual Side */}
                <div className="lg:w-1/2 relative h-[600px] w-full group perspective-1000">
                    {/* Floating Card - moved to z-40 to stay on top, added motion */}
                    <div className="absolute top-1/2 left-0 z-40 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white dark:border-slate-800 transform -translate-y-1/2 -translate-x-12 hidden lg:block animate-in slide-in-from-left-8 duration-1000 delay-300 transition-transform group-hover:translate-x-[-3rem] group-hover:scale-105">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-med-terracotta dark:bg-[#C25E3E] rounded-full flex items-center justify-center text-white shadow-lg shadow-med-terracotta/30">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="font-heading text-2xl text-med-blue dark:text-white leading-none">Montpellier</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta dark:text-[#C25E3E] mt-1">Sept 18 - 22 • Secured</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Grid */}
                    {/* Top Right Card */}
                    <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform rotate-3 z-10 transition-all duration-700 ease-out group-hover:rotate-6 group-hover:translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1659882751335-43e664461e6d?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover" alt="Mediterranean street scene" />
                    </div>
                    {/* Bottom Left Card */}
                    <div className="absolute bottom-0 left-8 w-3/5 h-3/5 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transform -rotate-6 z-0 transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:-translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1474925558543-e7a5f06e733e?q=80&w=1170&auto=format&fit=crop" className="w-full h-full object-cover" alt="Friends jumping into water" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Philosophy Section */}
      <section className="py-24 bg-white dark:bg-[#1e293b]">
        <div className="container mx-auto px-4 max-w-7xl text-center">
            <SectionHeading 
                badge="The Philosophy"
                title="Elevate the *Experience.*"
                subtitle="Great journeys shouldn't require a project manager. We believe the magic of travel lies in the moment, not the management. By replacing fragmented chat threads and email chains with a single, elegant sanctuary for your plans, we make the logistics invisible—so the memories can take center stage."
            />
        </div>
      </section>

      {/* 3. Target Audience Section */}
      <section className="py-32 bg-[#1E4472] dark:bg-[#0f172a] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2 text-white">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        <span className="text-med-terracotta dark:text-[#C25E3E] font-bold uppercase tracking-[0.2em] text-xs">The Guest List</span>
                    </div>
                    <h2 className="text-6xl font-heading font-light mb-8"><span className="italic text-med-terracotta dark:text-[#C25E3E]">Your Best</span> Friends, Family, <br/>Colleagues.</h2>
                    
                    <p className="text-white/80 text-lg font-light leading-relaxed mb-12 max-w-xl">
                        Whether it’s a milestone celebration in Provence, an executive retreat in the Alps, or a reunion years in the making—Voyageurs is built for those who understand that a destination is only as good as the company you keep.
                    </p>

                    <div className="space-y-8 mt-12">
                        {[
                            { icon: PartyPopper, title: "Group Celebrations", desc: "For the moments that happen once in a lifetime." },
                            { icon: Briefcase, title: "Retreats", desc: "Where focus meets inspiration, seamlessly organized." },
                            { icon: GraduationCap, title: "Intellectual Journeys", desc: "Curated discovery for the curious collective." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-med-terracotta dark:text-[#C25E3E] border border-white/10">
                                    <item.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold uppercase tracking-widest text-xs mb-1">{item.title}</h4>
                                    <p className="text-white/60 font-light text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="lg:w-1/2 relative h-[600px] w-full group">
                    {/* Visual overlap design */}
                    {/* Top Left Card (was z-0) */}
                    <div className="absolute top-0 left-0 w-4/5 h-4/5 rounded-[3rem] overflow-hidden border-8 border-white/10 dark:border-slate-800/50 shadow-2xl transform -rotate-6 z-0 will-change-transform transition-all duration-700 ease-out group-hover:-rotate-12 group-hover:-translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1474925558543-e7a5f06e733e?q=80&w=1170&auto=format&fit=crop" className="w-full h-full object-cover" alt="Friends jumping into water" />
                    </div>
                    {/* Bottom Right Card (was z-10) */}
                    <div className="absolute bottom-0 right-4 w-3/5 h-3/5 rounded-[3rem] overflow-hidden border-8 border-white/20 dark:border-slate-800 shadow-2xl transform rotate-12 z-10 will-change-transform transition-all duration-700 ease-out group-hover:rotate-12 group-hover:translate-x-4 hover:!z-30 hover:!scale-105 hover:!rotate-0 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1536607961765-592e80bcc19e?q=80&w=1170&auto=format&fit=crop" className="w-full h-full object-cover" alt="Group celebrating" />
                    </div>
                    <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 z-40 bg-white/10 dark:bg-slate-900/10 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl max-w-xs border border-white/20 dark:border-white/10 text-center transition-transform duration-500 group-hover:translate-y-4">
                        <div className="w-10 h-1 bg-med-terracotta dark:bg-[#C25E3E] mb-4 mx-auto"></div>
                        <p className="font-heading text-2xl text-white italic leading-relaxed drop-shadow-sm">"Finally, an app that understands group dynamics."</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 bg-[#F5F2EB] dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-med-terracotta/20 to-transparent"></div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <SectionHeading badge="The Ecosystem" title="Elegantly *Powerful.*" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {[
                    { icon: Smartphone, title: "Your Trip, Your Device", desc: "A pocket-sized command center. Maps, chats, and tickets live in harmony, accessible instantly by every guest." },
                    { icon: Compass, title: "Plan Before You Book", desc: "Dream with precision. Build your itinerary visually and watch the per-person budget adjust in real-time." },
                    { icon: Bot, title: "Meet Céleste, Your AI", desc: "A concierge that knows you. Céleste understands your specific itinerary, offering context-aware guidance when you need it most." },
                    { icon: DollarSign, title: "Frictionless Finance", desc: "Settle up, stress down. Scan receipts and split costs instantly. No awkward math at the end of dinner, just another round of wine." },
                    { icon: Binoculars, title: "Curated Discovery", desc: "Move beyond the tourist traps. Build a guide featuring hand-picked gems and local secrets for your guests to discover." },
                    { icon: Users, title: "Guest Matchmaker", desc: "Social alchemy. Our intelligent suggestions help your guests find their tribe based on shared interests before they even arrive." }
                ].map((item, i) => (
                    <div key={i} className="group relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-2 overflow-hidden flex flex-col h-full cursor-default">
                        {/* Decorative Gradient Blob */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-med-terracotta/5 rounded-full blur-3xl group-hover:bg-med-terracotta/10 group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full">
                            {/* Icon Header */}
                            <div className="mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-[#F5F2EB] dark:bg-slate-800 flex items-center justify-center text-med-terracotta group-hover:bg-med-terracotta group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-med-terracotta/30 ring-1 ring-black/5 dark:ring-white/5">
                                    <item.icon size={28} strokeWidth={1.5} />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic mb-4 pr-8">{item.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <Pricing 
        onAuth={() => handleAuth('host_signup')} 
        onCompareFeatures={() => setShowFeatures(true)}
      />

      {/* 6. Testimonial Section */}
      <Testimonial />

      {/* 7. Footer Section */}
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
