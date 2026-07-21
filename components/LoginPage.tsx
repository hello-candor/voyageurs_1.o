
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Loader2, Sailboat, 
  ChevronRight, ArrowLeft, ShieldCheck,
  Key, CheckCircle, Info, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { authService } from '../services/authService';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';
import { WebOSCard } from './WebOSCard';

const Logo = ({ className = "w-20 h-20" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <img
      src="/assets/voyageurs-icon.png"
      alt="Voyageurs"
      className="w-full h-full object-contain drop-shadow-xl"
    />
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-med-terracotta/20 rounded-full blur-xl -z-10"
    />
  </div>
);

// Helpers for invite code formatting
const stripCode = (v: string) => v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
const formatCode = (raw: string) => {
  const clean = stripCode(raw);
  const parts = [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6)].filter(Boolean);
  return parts.join('-');
};

export const LoginPage = ({ onClose }: { onClose?: () => void }) => {
  const { loginWithCode } = useUser();
  const { loginHost, error: authError } = useAuth();
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConsentInfo, setShowConsentInfo] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  // Auto-fill and auto-submit from ?code= URL parameter
  useEffect(() => {
    if (hasAutoSubmitted.current) return;
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      const code = stripCode(codeParam);
      setInputValue(formatCode(code));
      hasAutoSubmitted.current = true;
      // Clean the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.pathname + url.search);

      // Quick lookup to personalize the greeting
      authService.verifyGuestCode(code).then(guest => {
        if (guest?.name) {
          setGuestName(guest.name);
        }
      }).catch(() => {});

      // Auto-submit after a brief visual delay
      setTimeout(async () => {
        setIsLoading(true);
        setError('');
        try {
          const success = await loginWithCode(code);
          if (success) {
            onClose?.();
          } else {
            setError("Invalid invite code. Check your invitation.");
          }
        } catch (err) {
          setError("Connection error. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }, 1200);
    }
  }, [loginWithCode, onClose]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    
    setIsLoading(true);
    setError('');
    
    try {
        const success = await loginWithCode(inputValue.trim().toUpperCase());
        if (success) {
          onClose?.();
        } else {
          setError("Invalid invite code. Check your invitation.");
        }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #1b263b 0%, #0d1b2a 100%)' }}
    >
      {/* Styles Injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-heading { font-family: 'Cormorant Garamond', serif; }
        .font-body { font-family: 'Montserrat', sans-serif; }
      `}</style>

      <div className={`relative transition-all duration-300 ${isFullScreen ? 'w-full h-full' : 'w-[90%] max-w-sm h-[90dvh] max-h-[900px]'}`}>
        <WebOSCard
          id="rsvp-login-card"
          title="RSVP"
          isActive={true}
          isOverview={false}
          index={0}
          activeIndex={0}
          stackIndex={0}
          stackSize={1}
          onClose={onClose || (() => {})}
          onFocus={() => {}}
          onMinimize={onClose || (() => {})}
          isFullScreen={isFullScreen}
          onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        >
          <div className="dark flex flex-col h-full bg-[#1a202c] text-white/90 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-med-terracotta/10 rounded-full blur-[120px] opacity-60 pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 flex flex-col items-center justify-start sm:justify-center">
              <Logo className="mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20" />
            
            <div className="text-center mb-4 sm:mb-8">
              <h1 
                className="font-heading font-light text-med-blue dark:text-blue-100 leading-[0.9] mb-3 tracking-tight"
                style={{ fontSize: guestName ? 'clamp(1.8rem, 6vw, 3rem)' : 'clamp(2.5rem, 9vw, 4.5rem)' }}
              >
                Welcome, <br/>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={guestName || 'default'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="italic text-med-terracotta dark:text-[#C25E3E] inline-block"
                  >
                    {guestName || 'Voyager'}.
                  </motion.span>
                </AnimatePresence>
              </h1>
            </div>

            <form onSubmit={handleAuth} className="w-full space-y-4 sm:space-y-6">
              <div className="relative group">
                <p className="text-xs font-body text-slate-400 dark:text-gray-500 text-center mb-2 tracking-wide">Enter Your Unique Invite Code</p>
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(formatCode(e.target.value))}
                  placeholder="XXX-XXX-XXX" 
                  maxLength={11}
                  className="w-full h-16 sm:h-20 bg-slate-50/50 dark:bg-[#1a1f2e] border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta dark:focus:border-med-terracotta rounded-none px-4 text-center font-body font-bold text-med-blue dark:text-white outline-none transition-all flex items-center justify-center leading-none placeholder:text-sm placeholder:tracking-[0.5em] placeholder:font-body placeholder:opacity-30 placeholder:font-normal"
                  style={{ 
                    fontSize: 'clamp(1.2rem, 5vw, 2rem)',
                    letterSpacing: '0.08em',
                  }}
                  disabled={isLoading}
                  autoFocus
                />
                <div className="absolute right-0 bottom-3 text-slate-300 dark:text-gray-700 opacity-0 group-focus-within:opacity-100 transition-opacity">
                   <Key size={20} />
                </div>
              </div>

              <div className="px-1 space-y-3">
                <label className="flex items-start gap-3 p-4 sm:p-4 bg-med-sand/40 dark:bg-[#1a1f2e]/40 rounded-[1.5rem] border border-med-blue/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-med-terracotta focus:ring-med-terracotta shrink-0 accent-[#E2923D]"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-body font-medium text-left">
                        I agree to the Voyageurs <button type="button" onClick={() => setShowTerms(true)} className="underline hover:text-med-blue decoration-med-terracotta/30">Terms</button> and <button type="button" onClick={() => setShowPrivacy(true)} className="underline hover:text-med-blue decoration-med-terracotta/30">Privacy Policy</button>.
                    </p>
                </label>
                
                <AnimatePresence>
                  {showConsentInfo && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50/50 dark:bg-black/10 rounded-xl text-[10px] text-slate-400 italic font-body flex items-center gap-4">
                        <Sparkles size={14} className="text-med-terracotta shrink-0" />
                        <span>AI-enhanced logistics coordination via Candor Digital Group, LLC, Chicago.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                type="submit"
                disabled={isLoading || !inputValue || !agreedToTerms}
                className="w-full h-14 sm:h-16 bg-[#E2923D] text-white rounded-full text-xs font-bold uppercase tracking-[0.3em] shadow-2xl hover:bg-[#d17e2b] shadow-[#E2923D]/30 transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 font-body"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  "RSVP"
                )}
              </button>
            </form>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-full text-red-500 text-xs font-bold uppercase tracking-widest px-6 py-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-center font-body border border-red-100 dark:border-red-500/20"
              >
                {error}
              </motion.p>
            )}
            </div>
          </div>
        </WebOSCard>
      </div>
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </motion.div>
  );
};
