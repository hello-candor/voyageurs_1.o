
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Users, ShieldCheck, Globe, Loader2, MapPin,
    ArrowRight, Plane, Check, Crosshair, Phone, ChevronRight, Key
} from 'lucide-react';
import { isValidEmail, isValidName } from '../utils/validation';
import { Button } from './Button';
import { debounce } from 'lodash';

import { twilioService } from '../services/twilioService';
import { emailService } from '../services/emailService';
import { zapierService } from '../services/zapierService';
import { stripeService } from '../services/stripeService';
import { bigQueryService } from '../services/bigQueryService';
import { abacusService } from '../services/abacusService';

const GOOGLE_CLIENT_ID = "436751288359-kg1n1timqtrdr1damc19fertgocs8paf.apps.googleusercontent.com";

type Step = 'welcome' | 'rsvp' | 'preferences' | 'identity';

interface Suggestion {
    airport_name: string;
    iata_code: string;
    city_name: string;
    country_name: string;
}

// ─── Shared Decorative Background ───────────────────────────────────────────
const Blobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-med-terracotta/10 rounded-full blur-[120px]"
        />
        <motion.div
            animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-med-blue/10 rounded-full blur-[140px]"
        />
    </div>
);

// ─── Logo ────────────────────────────────────────────────────────────────────
const Logo = ({ className = 'w-16 h-16' }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <img
            src="/assets/voyageurs-icon.png"
            alt="Voyageurs"
            className="w-full h-full object-contain drop-shadow-xl"
        />
        <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-med-terracotta/20 rounded-full blur-xl -z-10"
        />
    </div>
);

// ─── Eyebrow ─────────────────────────────────────────────────────────────────
const Eyebrow = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center gap-5 mb-6">
        <div className="h-px w-10 bg-med-terracotta/40" />
        <span className="text-[11px] font-body font-bold uppercase tracking-[0.4em] text-med-terracotta">
            {label}
        </span>
        <div className="h-px w-10 bg-med-terracotta/40" />
    </div>
);

// ─── Progress ────────────────────────────────────────────────────────────────
const ProgressBar = ({ step }: { step: number }) => (
    <div className="flex gap-3 mb-10 w-full">
        {[1, 2, 3].map(i => (
            <motion.div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-all duration-700 ${step >= i ? 'bg-med-terracotta' : 'bg-slate-100 dark:bg-gray-800'}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
            />
        ))}
    </div>
);

// ─── Flat input (bottom border only — matches RSVP card) ─────────────────────
const FlatInput = ({
    label, icon: Icon, type = 'text', value, onChange, placeholder, error, autoFocus, disabled
}: {
    label: string; icon: React.ElementType; type?: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string; error?: string; autoFocus?: boolean; disabled?: boolean;
}) => (
    <div className="space-y-1">
        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
            <Icon size={11} /> {label}
        </label>
        <div className="relative group">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                disabled={disabled}
                className={`w-full bg-transparent border-b-2 ${error ? 'border-red-400' : 'border-slate-100 dark:border-gray-800 focus:border-med-terracotta dark:focus:border-med-terracotta'} px-1 py-4 text-xl font-body font-medium text-med-blue dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 placeholder:font-normal placeholder:text-base`}
            />
        </div>
        {error && (
            <p className="text-red-400 text-[10px] font-body font-bold uppercase tracking-wider pt-1">{error}</p>
        )}
    </div>
);

// ─── Pill CTA (matches RSVP "RSVP NOW" button) ───────────────────────────────
const PillButton = ({
    onClick, disabled, isLoading, children, type = 'button', variant = 'primary', fullWidth = true, className = ""
}: {
    onClick?: () => void; disabled?: boolean; isLoading?: boolean;
    children: React.ReactNode; type?: 'button' | 'submit'; variant?: 'primary' | 'ghost';
    fullWidth?: boolean; className?: string;
}) => {
    if (variant === 'ghost') {
        return (
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className={`h-16 px-6 text-slate-500 hover:text-med-blue dark:text-gray-400 dark:hover:text-white text-[11px] font-body font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border-2 border-transparent hover:border-slate-200 dark:hover:border-gray-800 rounded-full ${fullWidth ? 'w-full' : ''} ${className}`}
            >
                {children}
            </button>
        );
    }
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`h-16 bg-[#E2923D] text-white rounded-full text-[11px] font-body font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-[#d17e2b] shadow-[#E2923D]/20 transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 ${fullWidth ? 'w-full' : 'px-10'} ${className}`}
        >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : children}
        </button>
    );
};

// ─── Shell — wraps each step in the same card as the RSVP modal ──────────────
const Shell = ({ children, step }: { children: React.ReactNode; step: number }) => (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-med-sand dark:bg-[#111827] transition-colors duration-500">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
            .font-heading { font-family: 'Cormorant Garamond', serif; }
            .font-body    { font-family: 'Montserrat', sans-serif; }
        `}</style>

        <Blobs />

        <div className="relative w-full max-w-2xl px-5 sm:px-8 py-8 min-h-screen flex items-center justify-center mx-auto">
            <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] border border-white dark:border-gray-700 px-8 py-12 sm:px-14 sm:py-16 md:px-20 md:py-20 relative flex flex-col justify-center min-h-[88vh] sm:min-h-0 my-auto"
            >
                {/* Inner accent glow */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-med-terracotta/10 dark:bg-med-terracotta/20 rounded-full blur-[120px] opacity-60 dark:opacity-80 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto">
                    {children}
                </div>
            </motion.div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const OnboardingFlow: React.FC = () => {
    const { user, login, loginWithGoogle, submitRSVP, completeOnboarding, updateTravelDetails } = useUser();
    const { updateSettings, durationDays } = useTripPlanner();
    const { addNotification } = useNotification();
    const { logoutHost } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [isFinishing, setIsFinishing] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [preferences, setPreferences] = useState({
        origin: '',
        arrivalDate: '2026-09-15',
        departureDate: '2026-09-22',
        guests: 1,
        destination: 'Montpellier, France (MPL)',
        rsvpStatus: 'Pending' as 'Confirmed' | 'Declined' | 'Pending'
    });

    const [identity, setIdentity] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        publicRegistry: user?.privacy?.publicRegistry ?? true,
        smsConsent: user?.privacy?.smsConsent ?? true
    });

    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) { setSuggestions([]); return; }
        try {
            const response = await fetch(`/api/places?query=${query}`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            setSuggestions(data.data || []);
            setShowSuggestions(true);
        } catch { setSuggestions([]); }
    };

    const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

    const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPreferences({ ...preferences, origin: value });
        debouncedFetch(value);
    };

    const handleSuggestionClick = (s: Suggestion) => {
        setPreferences({ ...preferences, origin: `${s.city_name}, ${s.country_name} (${s.iata_code})` });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) { addNotification('Geolocation not supported.', 'error'); return; }
        setIsLocating(true);
        setShowSuggestions(false);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`/api/places?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                if (data.data) {
                    const n = data.data;
                    setPreferences(prev => ({ ...prev, origin: `${n.city_name}, ${n.country_name} (${n.iata_code})` }));
                    addNotification("Found your nearest airport!", 'success');
                }
            } catch { addNotification("Could not find a nearby airport.", 'error'); }
            finally { setIsLocating(false); }
        }, () => { addNotification("Location access denied.", 'error'); setIsLocating(false); });
    };

    useEffect(() => {
        if (user) setIdentity(prev => ({ ...prev, name: user.name, email: user.email }));
    }, [user]);

    const validateIdentity = () => {
        const e: Record<string, string> = {};
        if (!isValidName(identity.name)) e.name = 'Name must be at least 2 characters.';
        if (!isValidEmail(identity.email)) e.email = 'Please enter a valid email.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleGoogleLogin = () => {
        setIsAuthLoading(true);
        const t = setTimeout(() => { setIsAuthLoading(false); addNotification('Google Sign-In unavailable. Please use manual entry.', 'error'); }, 3500);
        try {
            if (!(window as any).google) { clearTimeout(t); addNotification('Google Sign-In is loading...', 'info'); setIsAuthLoading(false); return; }
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                use_fedcm_for_prompt: false,
                callback: async (r: any) => { clearTimeout(t); await loginWithGoogle(r.credential); setIsAuthLoading(false); }
            });
            (window as any).google.accounts.id.prompt();
        } catch { clearTimeout(t); setIsAuthLoading(false); }
    };

    const handleFinish = async () => {
        if (!validateIdentity()) return;
        setIsFinishing(true);

        const isDeclined = preferences.rsvpStatus === 'Declined';
        const privacy = { shareSocial: true, sharePhone: true, shareInterests: true, publicRegistry: isDeclined ? false : identity.publicRegistry, smsConsent: identity.smsConsent };

        if (privacy.smsConsent && identity.phone) twilioService.sendWelcomeSMS(identity.name, identity.phone).catch(() => {});
        zapierService.syncNewRegistration({ name: identity.name, email: identity.email, phone: identity.phone, status: preferences.rsvpStatus, guests: preferences.guests }).catch(() => {});
        stripeService.handleNewRegistration({ name: identity.name, email: identity.email, phone: identity.phone, guests: preferences.guests }).catch(() => {});
        bigQueryService.trackRegistration({ name: identity.name, email: identity.email, phone: identity.phone, status: preferences.rsvpStatus, guests: preferences.guests }).catch(() => {});
        abacusService.notifyRegistration({ name: identity.name, email: identity.email, phone: identity.phone, guests: preferences.guests }).catch(() => {});
        emailService.sendTemplateEmail(identity.email, 'WELCOME', { name: identity.name, url: window.location.origin }).catch(() => {});

        if (user) {
            submitRSVP({ status: preferences.rsvpStatus as any, guestsCount: preferences.guests, privacy, phone: identity.phone });
        } else {
            login(identity.name, identity.email, preferences.guests, preferences.rsvpStatus as any, '', '', {}, privacy, identity.phone);
        }

        setTimeout(() => {
            updateTravelDetails({ arrivalDate: preferences.arrivalDate, departureDate: preferences.departureDate, arrivalMode: 'Plane', arrivalNumber: '', accommodation: '', hub: preferences.origin });
            const start = new Date(preferences.arrivalDate), end = new Date(preferences.departureDate);
            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            updateSettings(preferences.guests, diffDays || durationDays);
            safeStorage.removeItem('tour_seen');
            completeOnboarding();
        }, 800);
    };

    // ── Step 1: Welcome ──────────────────────────────────────────────────────
    if (currentStep === 'welcome') {
        return (
            <Shell step={1}>
                <Logo className="mb-10 w-24 h-24 sm:w-28 sm:h-28" />
                <div className="text-center mb-10 w-full">
                    <h1
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-[0.9] mb-4 tracking-tight"
                        style={{ fontSize: 'clamp(3.5rem, 13vw, 6rem)' }}
                    >
                        Bryan's <br/>
                        <span className="italic text-med-terracotta dark:text-[#C25E3E]">40th.</span>
                    </h1>
                    <div className="mt-8 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-med-terracotta/40 rounded-full" />
                        <p className="text-sm font-body text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto text-left pl-6">
                            Join the celebration in Montpellier, France. Build your itinerary, coordinate logistics, and RSVP below.
                        </p>
                    </div>
                </div>

                <div className="w-full flex items-center gap-3">
                    <PillButton variant="ghost" onClick={logoutHost} fullWidth={false} className="flex-[1]">
                        RETURN
                    </PillButton>
                    <PillButton onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[2] bg-med-blue text-white shadow-med-blue/20 hover:bg-med-blue/90 border-transparent">
                        START RSVP &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </PillButton>
                </div>
            </Shell>
        );
    }

    // ── Step 2: RSVP ────────────────────────────────────────────────────────
    if (currentStep === 'rsvp') {
        return (
            <Shell step={1}>
                <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />
                <ProgressBar step={1} />
                <div className="text-center mb-10 w-full">
                    <Eyebrow label="September 18-20 · " />
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight"
                        style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)' }}
                    >
                        Can you<br /><span className="italic text-med-terracotta">make it?</span>
                    </h2>
                </div>

                <div className="w-full space-y-3">
                    {/* Confirmed */}
                    <button
                        onClick={() => { setPreferences({ ...preferences, rsvpStatus: 'Confirmed' }); setCurrentStep('preferences'); }}
                        className="w-full p-5 sm:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 hover:border-med-terracotta/40 dark:hover:border-med-terracotta/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="text-left">
                            <p className="font-heading text-3xl sm:text-4xl font-medium text-med-blue dark:text-white group-hover:text-med-terracotta transition-colors">I'll be there</p>
                            <p className="text-[10px] sm:text-xs font-body font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-400 mt-2">Ready for the adventure</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-gray-800/80 flex items-center justify-center group-hover:bg-med-terracotta group-hover:text-white transition-all text-slate-300 dark:text-gray-400 shrink-0">
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Pending */}
                    <button
                        onClick={() => { setPreferences({ ...preferences, rsvpStatus: 'Pending' }); setCurrentStep('preferences'); }}
                        className="w-full p-5 sm:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 hover:border-med-terracotta/40 dark:hover:border-med-terracotta/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="text-left">
                            <p className="font-heading text-3xl sm:text-4xl font-medium text-med-blue dark:text-white group-hover:text-med-terracotta transition-colors">I'm still exploring</p>
                            <p className="text-[10px] sm:text-xs font-body font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-400 mt-2">Grant access to guests hub</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-gray-800/80 flex items-center justify-center group-hover:bg-med-terracotta group-hover:text-white transition-all text-slate-300 dark:text-gray-400 shrink-0">
                            <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                        </div>
                    </button>

                    {/* Declined */}
                    <button
                        onClick={() => { setPreferences({ ...preferences, rsvpStatus: 'Declined' }); setCurrentStep('identity'); }}
                        className="w-full p-5 sm:p-6 rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 hover:border-med-terracotta/40 dark:hover:border-med-terracotta/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between group transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="text-left">
                            <p className="font-heading text-3xl sm:text-4xl font-medium text-med-blue dark:text-white group-hover:text-med-terracotta transition-colors">I can't make it</p>
                            <p className="text-[10px] sm:text-xs font-body font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-400 mt-2">Regretfully decline</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-gray-800/80 flex items-center justify-center group-hover:bg-med-terracotta group-hover:text-white transition-all text-slate-300 dark:text-gray-400 shrink-0">
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <div className="w-full pt-4">
                        <PillButton variant="ghost" onClick={() => setCurrentStep('welcome')} fullWidth>← BACK TO WELCOME</PillButton>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Step 3: Trip Preferences ─────────────────────────────────────────────
    if (currentStep === 'preferences') {
        return (
            <Shell step={2}>
                <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />
                <ProgressBar step={2} />
                <div className="text-center mb-10 w-full">
                    <Eyebrow label="Step 2 of 3" />
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight"
                        style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)' }}
                    >
                        Trip<br /><span className="italic text-med-terracotta">Details.</span>
                    </h2>
                </div>

                <div className="w-full space-y-8">
                    {/* Destination (readonly) */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                            <MapPin size={11} /> Destination
                        </label>
                        <div className="border-b-2 border-slate-100 dark:border-gray-800 py-4 flex items-center justify-between">
                            <span className="text-xl font-body font-medium text-med-blue dark:text-white">{preferences.destination}</span>
                            <Check size={16} className="text-med-terracotta" />
                        </div>
                    </div>

                    {/* Flying from */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                            <Plane size={11} /> Flying From
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder={isLocating ? 'Searching...' : 'City or Airport (e.g. Chicago, ORD)'}
                                value={preferences.origin}
                                onChange={handleOriginChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                disabled={isLocating}
                                autoFocus
                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta dark:focus:border-med-terracotta px-1 pr-8 py-4 text-xl font-body font-medium text-med-blue dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 placeholder:font-normal placeholder:text-base"
                            />
                            <button
                                onClick={handleLocateMe}
                                disabled={isLocating}
                                className="absolute right-1 bottom-3 text-slate-300 dark:text-gray-700 hover:text-med-terracotta transition-colors"
                            >
                                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-xl overflow-hidden"
                                >
                                    {suggestions.map((s, i) => (
                                        <li
                                            key={i}
                                            onMouseDown={() => handleSuggestionClick(s)}
                                            className="px-5 py-3 cursor-pointer hover:bg-med-sand/40 dark:hover:bg-gray-800 text-sm font-body text-med-blue dark:text-gray-300 transition-colors"
                                        >
                                            <span className="font-semibold">{s.iata_code}</span> · {s.city_name}, {s.country_name}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-6 sm:gap-10">
                        <div className="space-y-1">
                            <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta">Arrival</label>
                            <input
                                type="date"
                                value={preferences.arrivalDate}
                                onChange={e => setPreferences({ ...preferences, arrivalDate: e.target.value })}
                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta py-4 text-base font-body text-med-blue dark:text-white outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta">Departure</label>
                            <input
                                type="date"
                                value={preferences.departureDate}
                                onChange={e => setPreferences({ ...preferences, departureDate: e.target.value })}
                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta py-4 text-base font-body text-med-blue dark:text-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Party size */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                            <Users size={11} /> Party Size
                        </label>
                        <select
                            value={preferences.guests}
                            onChange={e => setPreferences({ ...preferences, guests: parseInt(e.target.value) })}
                            className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta py-4 text-xl font-body font-medium text-med-blue dark:text-white outline-none transition-all appearance-none cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                        </select>
                    </div>

                    <div className="pt-8 flex items-center gap-3 w-full">
                        <PillButton variant="ghost" onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[1]">
                            ← BACK
                        </PillButton>
                        <PillButton onClick={() => setCurrentStep('identity')} fullWidth={false} className="flex-[2]">
                            NEXT STEP &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </PillButton>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Step 4: Identity / Profile ───────────────────────────────────────────
    return (
        <Shell step={3}>
            <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />
            <ProgressBar step={3} />
            <div className="text-center mb-10 w-full">
                <Eyebrow label="Final Step" />
                <h2
                    className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight"
                    style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)' }}
                >
                    Your<br /><span className="italic text-med-terracotta">Passport.</span>
                </h2>
            </div>

            <div className="w-full space-y-8">
                {/* Google SSO */}
                {!user && (
                    <div>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isAuthLoading}
                            className="w-full h-14 border-2 border-slate-100 dark:border-gray-800 hover:border-med-blue/30 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-body font-bold uppercase tracking-[0.3em] text-slate-400 hover:text-med-blue transition-all"
                        >
                            {isAuthLoading ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                            Sign in with Google
                        </button>
                        <div className="relative flex items-center justify-center my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100 dark:border-gray-800" />
                            </div>
                            <span className="relative bg-white dark:bg-gray-900 px-4 text-[9px] font-body font-bold uppercase tracking-[0.3em] text-slate-300">or manual entry</span>
                        </div>
                    </div>
                )}

                <FlatInput label="Full Name" icon={User} value={identity.name} onChange={e => setIdentity({ ...identity, name: e.target.value })} placeholder="Jean Dupont" error={errors.name} autoFocus={!user} />
                <FlatInput label="Email Address" icon={Mail} type="email" value={identity.email} onChange={e => setIdentity({ ...identity, email: e.target.value })} placeholder="email@example.com" error={errors.email} />
                <FlatInput label="Phone Number" icon={Phone} type="tel" value={identity.phone} onChange={e => setIdentity({ ...identity, phone: e.target.value })} placeholder="+1 (555) 000-0000" />

                {/* Privacy toggles */}
                <div className="space-y-4 pt-2">
                    <p className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta">Settings & Privacy</p>

                    {preferences.rsvpStatus !== 'Declined' && (
                        <button
                            onClick={() => setIdentity({ ...identity, publicRegistry: !identity.publicRegistry })}
                            className={`w-full py-5 px-6 rounded-[2rem] border-2 flex items-center justify-between transition-all duration-300 ${identity.publicRegistry ? 'border-med-blue/20 bg-med-blue/5 dark:border-med-blue/30 dark:bg-med-blue/20' : 'border-slate-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'}`}
                        >
                            <span className={`flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.25em] ${identity.publicRegistry ? 'text-med-blue dark:text-blue-300' : 'text-slate-400 dark:text-gray-400'}`}>
                                {identity.publicRegistry ? <Globe size={13} /> : <ShieldCheck size={13} />}
                                {identity.publicRegistry ? 'Public Registry' : 'Private Profile'}
                            </span>
                            <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${identity.publicRegistry ? 'bg-med-blue dark:bg-blue-500' : 'bg-slate-200 dark:bg-gray-700'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${identity.publicRegistry ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </button>
                    )}

                    <button
                        onClick={() => setIdentity({ ...identity, smsConsent: !identity.smsConsent })}
                        className={`w-full py-5 px-6 rounded-[2rem] border-2 flex gap-4 text-left transition-all duration-300 ${identity.smsConsent ? 'border-med-terracotta/20 bg-med-terracotta/5 dark:border-med-terracotta/30 dark:bg-med-terracotta/20' : 'border-slate-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50'}`}
                    >
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${identity.smsConsent ? 'bg-med-terracotta border-med-terracotta text-white' : 'border-slate-300 dark:border-gray-600'}`}>
                            {identity.smsConsent && <Check size={12} />}
                        </div>
                        <div>
                            <p className={`text-[11px] font-body font-bold uppercase tracking-[0.25em] mb-1 ${identity.smsConsent ? 'text-med-terracotta' : 'text-slate-400'}`}>
                                Enable SMS Updates
                            </p>
                            <p className="text-xs font-body text-slate-400 leading-relaxed">
                                Receive automated text messages for celebration reminders & logistics. Msg & data rates may apply. Reply STOP to opt out.
                            </p>
                        </div>
                    </button>
                </div>

                <div className="pt-8 flex items-center gap-3 w-full">
                    <PillButton variant="ghost" onClick={() => setCurrentStep(preferences.rsvpStatus === 'Declined' ? 'rsvp' : 'preferences')} fullWidth={false} className="flex-[1]">
                        ← BACK
                    </PillButton>
                    <PillButton
                        onClick={handleFinish}
                        isLoading={isFinishing}
                        fullWidth={false}
                        className="flex-[2]"
                    >
                        {isFinishing ? null : preferences.rsvpStatus === 'Declined'
                            ? <>DECLINE RSVP &nbsp;<ArrowRight size={16} /></>
                            : <>ENTER THE HUB &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                        }
                    </PillButton>
                </div>
            </div>
        </Shell>
    );
};
