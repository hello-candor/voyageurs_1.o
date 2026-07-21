import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, Eye, EyeOff,
  Key, Mail, Lock, ChevronDown, ChevronUp
} from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';
import { WebOSCard } from './WebOSCard';

/* ── Google "G" Logo SVG ─────────────────────────────────────────────────── */
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const OrDivider = () => (
  <div className="flex items-center gap-4 my-6">
    <div className="flex-1 h-px bg-white/10" />
    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 font-body">or</span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

export const HostLoginPage = () => {
  const {
    loginHost,
    loginHostWithEmail,
    error: authError,
    isLoading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasscodeSection, setShowPasscodeSection] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);


  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');
    try {
      const success = await loginHostWithEmail(email.trim(), password);
      if (!success && !authError) {
        setError('Sign-in failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsLoading(true);
    setError('');
    try {
      const success = await loginHost(passcode);
      if (!success) {
        setError('Invalid passcode.');
      }
    } catch {
      setError('Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    window.history.replaceState({}, '', '/');
    window.location.reload();
  };

  const busy = isLoading || authLoading;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #1b263b 0%, #0d1b2a 100%)' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-heading { font-family: 'Cormorant Garamond', serif; }
        .font-body   { font-family: 'Montserrat', sans-serif; }
      `}</style>

      {/* The main app card container */}
      <div className={`relative transition-all duration-300 ${isFullScreen ? 'w-full h-full' : 'w-[90%] max-w-sm h-[650px] max-h-[85vh]'}`}>
        <WebOSCard
          id="host-login-card"
          title="Command Center"
          isActive={true}
          isOverview={false}
          index={0}
          activeIndex={0}
          stackIndex={0}
          stackSize={1}
          onClose={goBack}
          onFocus={() => {}}
          onMinimize={goBack}
          isFullScreen={isFullScreen}
          onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        >
          {/* Card internal content */}
          <div className="flex flex-col h-full bg-[#1a202c] text-white/90">
            <div className="flex-1 overflow-y-auto px-8 py-10">
              
              <div className="text-center mb-8">
                <img
                  src="/assets/voyageurs-icon.png"
                  alt="Voyageurs"
                  className="w-14 h-14 object-contain brightness-0 invert opacity-90 mx-auto mb-4"
                />
                <h2 className="font-heading text-2xl font-light tracking-wide mb-1">
                  Host Access
                </h2>
                <p className="font-body text-[10px] uppercase tracking-[0.2em] text-[#C07D5E] font-medium">
                  Secure Authentication
                </p>
              </div>



              {/* ── Email / Password ── */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full h-11 bg-black/20 border border-white/10 rounded-full pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C07D5E]/60 focus:bg-black/30 transition-all font-body"
                    disabled={busy}
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full h-11 bg-black/20 border border-white/10 rounded-full pl-10 pr-12 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#C07D5E]/60 focus:bg-black/30 transition-all font-body"
                    disabled={busy}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={busy || !email || !password}
                  className="w-full h-11 bg-gradient-to-b from-[#C07D5E] to-[#b06d4e] hover:brightness-110 text-white rounded-full text-[11px] font-bold uppercase tracking-widest shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-body"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>


              {/* ── Passcode ── */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => setShowPasscodeSection(!showPasscodeSection)}
                  className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-body"
                >
                  <Key size={12} />
                  <span>Passcode Access</span>
                  {showPasscodeSection ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <AnimatePresence>
                  {showPasscodeSection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <form onSubmit={handlePasscode} className="mt-4 flex gap-2">
                        <div className="relative flex-1">
                          <Key size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                          <input
                            type="text"
                            value={passcode}
                            onChange={e => setPasscode(e.target.value.toUpperCase())}
                            placeholder="CODE"
                            className="w-full h-10 bg-black/20 border border-white/10 rounded-full pl-9 pr-4 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#C07D5E]/60 transition-all font-body uppercase tracking-widest"
                            disabled={busy}
                            autoComplete="off"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={busy || !passcode}
                          className="h-10 px-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40 font-body"
                        >
                          {isLoading ? <Loader2 className="animate-spin w-3 h-3" /> : 'Go'}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Error ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-red-400 text-[11px] font-medium text-center font-body">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Inner Footer */}
            <div className="shrink-0 bg-black/20 border-t border-white/5 py-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setShowTerms(true)}
                className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-body"
              >
                Terms
              </button>
              <span className="text-white/10">·</span>
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors font-body"
              >
                Privacy
              </button>
            </div>

          </div>
        </WebOSCard>
      </div>

      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default HostLoginPage;
