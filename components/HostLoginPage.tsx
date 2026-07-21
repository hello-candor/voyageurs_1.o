
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, ArrowLeft, Eye, EyeOff,
  Key, Mail, Lock, ChevronDown, ChevronUp
} from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';

/* ── Google "G" Logo SVG ─────────────────────────────────────────────────── */
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Divider ─────────────────────────────────────────────────────────────── */
const OrDivider = () => (
  <div className="flex items-center gap-4 my-6">
    <div className="flex-1 h-px bg-white/10" />
    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30" style={{ fontFamily: "'Montserrat', sans-serif" }}>or</span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
/*  HOST LOGIN PAGE                                                         */
/* ══════════════════════════════════════════════════════════════════════════ */

export const HostLoginPage = () => {
  const {
    loginHost,
    loginHostWithEmail,
    signupHostWithEmail,
    loginHostWithGooglePopup,
    error: authError,
    isLoading: authLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasscodeSection, setShowPasscodeSection] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  /* ── Handlers ────────────────────────────────────────────────────────── */

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await loginHostWithGooglePopup();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError('');
    try {
      let success: boolean;
      if (mode === 'signup') {
        success = await signupHostWithEmail(email.trim(), password);
      } else {
        success = await loginHostWithEmail(email.trim(), password);
      }
      if (!success && !authError) {
        setError(mode === 'signup' ? 'Sign-up failed.' : 'Sign-in failed.');
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

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #14243d 40%, #0e1c2a 100%)' }}
    >
      {/* ── Fonts ──────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-heading { font-family: 'Cormorant Garamond', serif; }
        .font-body   { font-family: 'Montserrat', sans-serif; }
      `}</style>

      {/* ── Ambient Background ─────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full blur-[160px]"
          style={{ background: 'radial-gradient(circle, rgba(192,125,94,0.12) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full blur-[180px]"
          style={{ background: 'radial-gradient(circle, rgba(53,80,112,0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full max-w-md mx-4 my-auto"
      >
        <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] px-7 py-10 sm:px-10 sm:py-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)]">

          {/* Internal glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#C07D5E]/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />

          <div className="relative z-10">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative inline-block mb-5"
              >
                <img
                  src="/assets/voyageurs-icon.png"
                  alt="Voyageurs"
                  className="w-16 h-16 object-contain drop-shadow-2xl brightness-0 invert mx-auto"
                />
                <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ background: '#C07D5E' }} />
              </motion.div>

              <h1 className="font-heading text-white text-3xl sm:text-4xl font-light tracking-tight mb-2">
                Command Center
              </h1>
              <p className="font-body text-white/40 text-[11px] uppercase tracking-[0.3em] font-medium">
                Host Access
              </p>
            </div>

            {/* ── Google Sign-In ──────────────────────────────────────── */}
            <button
              onClick={handleGoogleSignIn}
              disabled={busy || isGoogleLoading}
              className="w-full h-12 bg-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
              ) : (
                <>
                  <GoogleLogo />
                  <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "'Roboto', 'Montserrat', sans-serif" }}>
                    Sign in with Google
                  </span>
                </>
              )}
            </button>

            <OrDivider />

            {/* ── Email / Password ────────────────────────────────────── */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1 font-body">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 bg-white/[0.06] border border-white/[0.08] rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C07D5E]/50 focus:bg-white/[0.08] transition-all font-body"
                    disabled={busy}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 ml-1 font-body">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 bg-white/[0.06] border border-white/[0.08] rounded-xl pl-11 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C07D5E]/50 focus:bg-white/[0.08] transition-all font-body"
                    disabled={busy}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy || !email || !password}
                className="w-full h-12 bg-[#C07D5E] hover:bg-[#b06d4e] text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#C07D5E]/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-body"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  mode === 'signup' ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* ── Toggle sign-in / sign-up ────────────────────────────── */}
            <div className="text-center mt-4">
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                className="text-[11px] text-white/40 hover:text-white/70 transition-colors font-body"
              >
                {mode === 'signin' ? (
                  <>Don't have an account? <span className="text-[#C07D5E] font-semibold">Create one</span></>
                ) : (
                  <>Already have an account? <span className="text-[#C07D5E] font-semibold">Sign in</span></>
                )}
              </button>
            </div>

            {/* ── Passcode (collapsible) ──────────────────────────────── */}
            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <button
                onClick={() => setShowPasscodeSection(!showPasscodeSection)}
                className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 hover:text-white/50 transition-colors font-body"
              >
                <Key size={12} />
                <span>Sign in with Passcode</span>
                {showPasscodeSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                        <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                          type="text"
                          value={passcode}
                          onChange={e => setPasscode(e.target.value.toUpperCase())}
                          placeholder="PASSCODE"
                          className="w-full h-11 bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#C07D5E]/50 transition-all font-body uppercase tracking-wider"
                          disabled={busy}
                          autoComplete="off"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={busy || !passcode}
                        className="h-11 px-5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white/60 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed font-body"
                      >
                        {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Go'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Error ───────────────────────────────────────────────── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <p className="text-red-400 text-xs font-medium text-center font-body">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4 mt-6 px-4">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-white/25 hover:text-white/50 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-body">Back to Voyageurs</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTerms(true)}
              className="text-[10px] text-white/20 hover:text-white/40 transition-colors font-body"
            >
              Terms
            </button>
            <span className="text-white/10">·</span>
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-[10px] text-white/20 hover:text-white/40 transition-colors font-body"
            >
              Privacy
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default HostLoginPage;
