
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Users, Globe, Loader2, MapPin,
    ArrowRight, Check, Phone, Plus, Trash2, Calendar,
    Plane, Map, Utensils, Camera, Music, Heart, Star,
    Clock, Compass, PartyPopper, X
} from 'lucide-react';
import { isValidEmail, isValidName } from '../utils/validation';
import { Button } from './Button';

import { twilioService } from '../services/twilioService';
import { emailService } from '../services/emailService';
import { zapierService } from '../services/zapierService';
import { stripeService } from '../services/stripeService';
import { bigQueryService } from '../services/bigQueryService';
import { abacusService } from '../services/abacusService';

type Step = 'welcome' | 'details' | 'rsvp';
type RSVPStatus = 'Confirmed' | 'Declined' | 'Pending';

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
const ProgressDots = ({ step, total }: { step: number; total: number }) => (
    <div className="flex gap-2 mb-10 justify-center">
        {Array.from({ length: total }, (_, i) => (
            <motion.div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                    i < step
                        ? 'w-8 bg-med-terracotta'
                        : i === step
                        ? 'w-4 bg-med-terracotta/60'
                        : 'w-2 bg-slate-200 dark:bg-gray-700'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
            />
        ))}
    </div>
);

// ─── Flat Input ───────────────────────────────────────────────────────────────
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

// ─── Pill CTA ─────────────────────────────────────────────────────────────────
const PillButton = ({
    onClick, disabled, isLoading, children, type = 'button', variant = 'primary', fullWidth = true, className = ''
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

// ─── Shell ────────────────────────────────────────────────────────────────────
const Shell = ({ children, stepIndex }: { children: React.ReactNode; stepIndex: number }) => (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-med-sand dark:bg-[#111827] transition-colors duration-500">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
            .font-heading { font-family: 'Cormorant Garamond', serif; }
            .font-body    { font-family: 'Montserrat', sans-serif; }
        `}</style>

        <Blobs />

        <div className="relative w-full max-w-2xl px-5 sm:px-8 py-8 min-h-screen flex items-center justify-center mx-auto">
            <motion.div
                key={stepIndex}
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] border border-white dark:border-gray-700 px-8 py-12 sm:px-14 sm:py-16 md:px-20 md:py-20 relative flex flex-col justify-center min-h-[88vh] sm:min-h-0 my-auto"
            >
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
    const { user, login, submitRSVP, completeOnboarding, updateTravelDetails, inviteToParty } = useUser();
    const { updateSettings, durationDays } = useTripPlanner();
    const { addNotification } = useNotification();
    const { logoutHost } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [isFinishing, setIsFinishing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('Confirmed');

    const [identity, setIdentity] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Party members the guest is adding
    const [partyMembers, setPartyMembers] = useState<{ name: string; email: string }[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    useEffect(() => {
        if (user) setIdentity(prev => ({
            ...prev,
            name: prev.name || user.name,
            email: prev.email || user.email,
            phone: prev.phone || (user.phone ?? '')
        }));
    }, [user]);

    const validateDetails = () => {
        const e: Record<string, string> = {};
        if (!isValidName(identity.name)) e.name = 'Name must be at least 2 characters.';
        if (!isValidEmail(identity.email)) e.email = 'Please enter a valid email.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const addPartyMember = () => {
        if (!newMemberName.trim()) return;
        setPartyMembers(prev => [...prev, { name: newMemberName.trim(), email: newMemberEmail.trim() }]);
        setNewMemberName('');
        setNewMemberEmail('');
        setAddingMember(false);
    };

    const handleFinish = async (status: RSVPStatus) => {
        setRsvpStatus(status);
        setIsFinishing(true);

        const privacy = { shareSocial: true, sharePhone: true, shareInterests: true, publicRegistry: status !== 'Declined', smsConsent: true };
        const guestsCount = 1 + partyMembers.length;

        if (identity.phone) twilioService.sendWelcomeSMS(identity.name, identity.phone).catch(() => {});
        zapierService.syncNewRegistration({ name: identity.name, email: identity.email, phone: identity.phone, status, guests: guestsCount }).catch(() => {});
        stripeService.handleNewRegistration({ name: identity.name, email: identity.email, phone: identity.phone, guests: guestsCount }).catch(() => {});
        bigQueryService.trackRegistration({ name: identity.name, email: identity.email, phone: identity.phone, status, guests: guestsCount }).catch(() => {});
        abacusService.notifyRegistration({ name: identity.name, email: identity.email, phone: identity.phone, guests: guestsCount }).catch(() => {});
        emailService.sendTemplateEmail(identity.email, 'WELCOME', { name: identity.name, url: window.location.origin }).catch(() => {});

        if (user) {
            submitRSVP({ status, guestsCount, privacy, phone: identity.phone } as any);
        } else {
            login(identity.name, identity.email, guestsCount, status, '', '', {}, privacy, identity.phone);
        }

        // Invite party members
        partyMembers.forEach(m => {
            if (m.email) inviteToParty(m.email, m.name);
        });

        setTimeout(() => {
            updateTravelDetails({ arrivalDate: '2026-09-18', departureDate: '2026-09-20', arrivalMode: 'Plane', arrivalNumber: '', accommodation: '', hub: '' });
            updateSettings(guestsCount, 3);
            safeStorage.removeItem('tour_seen');
            completeOnboarding();
        }, 800);
    };

    // ── Step 1: Welcome ──────────────────────────────────────────────────────
    if (currentStep === 'welcome') {
        return (
            <Shell stepIndex={0}>
                <Logo className="mb-10 w-24 h-24 sm:w-28 sm:h-28" />

                <div className="text-center mb-8 w-full">
                    <Eyebrow label="You're Invited" />
                    <h1
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-[0.9] mb-6 tracking-tight"
                        style={{ fontSize: 'clamp(3.5rem, 13vw, 6rem)' }}
                    >
                        Bryan's <br />
                        <span className="italic text-med-terracotta dark:text-[#C25E3E]">40th.</span>
                    </h1>

                    {/* Event Details Block */}
                    <div className="mt-6 grid grid-cols-2 gap-3 w-full">
                        <div className="flex flex-col items-center gap-2 p-4 rounded-[1.5rem] bg-med-sand/60 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700">
                            <Calendar size={18} className="text-med-terracotta" />
                            <div>
                                <p className="text-[9px] font-body font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 mb-0.5">Date</p>
                                <p className="text-sm font-heading font-medium text-med-blue dark:text-white">Sep 18–20, 2026</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 rounded-[1.5rem] bg-med-sand/60 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700">
                            <MapPin size={18} className="text-med-terracotta" />
                            <div>
                                <p className="text-[9px] font-body font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 mb-0.5">Location</p>
                                <p className="text-sm font-heading font-medium text-med-blue dark:text-white">Montpellier, France</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-med-terracotta/40 rounded-full" />
                        <p className="text-sm font-body text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto text-left pl-6">
                            Join the celebration in the south of France. Build your itinerary, coordinate travel, and connect with fellow guests.
                        </p>
                    </div>
                </div>

                <div className="w-full flex items-center gap-3">
                    <PillButton variant="ghost" onClick={logoutHost} fullWidth={false} className="flex-[1]">
                        RETURN
                    </PillButton>
                    <PillButton onClick={() => setCurrentStep('details')} fullWidth={false} className="flex-[2]">
                        CONFIRM DETAILS &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </PillButton>
                </div>
            </Shell>
        );
    }

    // ── Step 2: Personal Details + Party ──────────────────────────────────────
    if (currentStep === 'details') {
        return (
            <Shell stepIndex={1}>
                <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />
                <ProgressDots step={1} total={3} />

                <div className="text-center mb-10 w-full">
                    <Eyebrow label="Step 1 of 2" />
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight"
                        style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)' }}
                    >
                        Your<br /><span className="italic text-med-terracotta">Details.</span>
                    </h2>
                </div>

                <div className="w-full space-y-6">
                    <FlatInput
                        label="Full Name"
                        icon={User}
                        value={identity.name}
                        onChange={e => setIdentity({ ...identity, name: e.target.value })}
                        placeholder="Jean Dupont"
                        error={errors.name}
                        autoFocus
                    />
                    <FlatInput
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        value={identity.email}
                        onChange={e => setIdentity({ ...identity, email: e.target.value })}
                        placeholder="email@example.com"
                        error={errors.email}
                    />
                    <FlatInput
                        label="Phone (Optional)"
                        icon={Phone}
                        type="tel"
                        value={identity.phone}
                        onChange={e => setIdentity({ ...identity, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                    />

                    {/* ── Party Members ── */}
                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                <Users size={11} /> Your Party
                            </p>
                            <span className="text-[10px] font-body text-slate-400 dark:text-gray-500">
                                {1 + partyMembers.length} guest{partyMembers.length !== 0 ? 's' : ''}
                            </span>
                        </div>

                        {/* Primary guest pill */}
                        <div className="flex items-center gap-3 py-3 px-4 rounded-[1.5rem] bg-med-terracotta/8 dark:bg-med-terracotta/10 border border-med-terracotta/20 mb-2">
                            <div className="w-8 h-8 rounded-full bg-med-terracotta/20 flex items-center justify-center shrink-0">
                                <User size={14} className="text-med-terracotta" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-body font-semibold text-med-blue dark:text-white truncate">
                                    {identity.name || 'You'} <span className="font-normal text-med-terracotta text-xs">(primary)</span>
                                </p>
                            </div>
                        </div>

                        {/* Added party members */}
                        <AnimatePresence>
                            {partyMembers.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-3 py-3 px-4 rounded-[1.5rem] bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 mb-2 overflow-hidden"
                                >
                                    <div className="w-8 h-8 rounded-full bg-med-blue/10 flex items-center justify-center shrink-0">
                                        <User size={14} className="text-med-blue/60 dark:text-blue-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-body font-medium text-med-blue dark:text-white truncate">{m.name}</p>
                                        {m.email && <p className="text-[10px] font-body text-slate-400 dark:text-gray-500 truncate">{m.email}</p>}
                                    </div>
                                    <button
                                        onClick={() => setPartyMembers(prev => prev.filter((_, idx) => idx !== i))}
                                        className="w-7 h-7 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                                    >
                                        <X size={13} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Add member form */}
                        <AnimatePresence>
                            {addingMember ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-3"
                                >
                                    <div className="p-4 rounded-[1.5rem] bg-white dark:bg-gray-800 border-2 border-med-terracotta/20 space-y-3">
                                        <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta">Add Guest</p>
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={newMemberName}
                                            onChange={e => setNewMemberName(e.target.value)}
                                            autoFocus
                                            className="w-full bg-transparent border-b border-slate-100 dark:border-gray-700 py-2 text-sm font-body text-med-blue dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email (optional)"
                                            value={newMemberEmail}
                                            onChange={e => setNewMemberEmail(e.target.value)}
                                            className="w-full bg-transparent border-b border-slate-100 dark:border-gray-700 py-2 text-sm font-body text-med-blue dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                        />
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => { setAddingMember(false); setNewMemberName(''); setNewMemberEmail(''); }}
                                                className="flex-1 h-10 rounded-full border border-slate-200 dark:border-gray-700 text-[10px] font-body font-bold uppercase tracking-wider text-slate-400 hover:text-med-blue transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={addPartyMember}
                                                disabled={!newMemberName.trim()}
                                                className="flex-1 h-10 rounded-full bg-med-terracotta text-white text-[10px] font-body font-bold uppercase tracking-wider disabled:opacity-40 transition-all active:scale-95"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setAddingMember(true)}
                                    className="w-full mt-3 h-12 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-gray-700 hover:border-med-terracotta/40 flex items-center justify-center gap-2 text-[10px] font-body font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-gray-500 hover:text-med-terracotta transition-all"
                                >
                                    <Plus size={13} /> Add Guest to Party
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-6 flex items-center gap-3 w-full">
                        <PillButton variant="ghost" onClick={() => setCurrentStep('welcome')} fullWidth={false} className="flex-[1]">
                            ← BACK
                        </PillButton>
                        <PillButton
                            onClick={() => {
                                if (validateDetails()) setCurrentStep('rsvp');
                            }}
                            fullWidth={false}
                            className="flex-[2]"
                        >
                            NEXT &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </PillButton>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Step 3: RSVP (Icon-Focused) ───────────────────────────────────────────
    return (
        <Shell stepIndex={2}>
            <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />
            <ProgressDots step={2} total={3} />

            <div className="text-center mb-8 w-full">
                <Eyebrow label="Step 2 of 2" />
                <h2
                    className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-3"
                    style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)' }}
                >
                    Will you<br /><span className="italic text-med-terracotta">join us?</span>
                </h2>
            </div>

            {/* RSVP Options — Icon-Focused */}
            <div className="w-full grid grid-cols-3 gap-3 mb-8">
                {/* I'll Be There */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFinish('Confirmed')}
                    disabled={isFinishing}
                    className="flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 hover:border-med-terracotta/50 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg hover:shadow-med-terracotta/10 hover:bg-med-terracotta/5"
                >
                    <div className="w-14 h-14 rounded-full bg-med-terracotta/10 flex items-center justify-center group-hover:bg-med-terracotta group-hover:text-white transition-all duration-300">
                        <PartyPopper size={24} className="text-med-terracotta group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 group-hover:text-med-terracotta transition-colors leading-tight text-center">
                        I'll Be<br />There
                    </span>
                </motion.button>

                {/* Still Exploring */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFinish('Pending')}
                    disabled={isFinishing}
                    className="flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 hover:border-med-blue/40 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg hover:shadow-med-blue/10 hover:bg-med-blue/5"
                >
                    <div className="w-14 h-14 rounded-full bg-med-blue/10 flex items-center justify-center group-hover:bg-med-blue group-hover:text-white transition-all duration-300">
                        <Compass size={24} className="text-med-blue/60 dark:text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 group-hover:text-med-blue transition-colors leading-tight text-center">
                        Still<br />Exploring
                    </span>
                </motion.button>

                {/* Can't Make It */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFinish('Declined')}
                    disabled={isFinishing}
                    className="flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-500 bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg hover:bg-slate-50 dark:hover:bg-gray-800"
                >
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-gray-700/80 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-gray-600 transition-all duration-300">
                        <X size={24} className="text-slate-400 dark:text-gray-500 transition-colors" />
                    </div>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 leading-tight text-center">
                        Can't<br />Make It
                    </span>
                </motion.button>
            </div>

            {isFinishing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3 mb-6"
                >
                    <Loader2 size={18} className="animate-spin text-med-terracotta" />
                    <span className="text-sm font-body text-slate-400 dark:text-gray-500">Entering the hub…</span>
                </motion.div>
            )}

            {/* Voyageurs App Blurb */}
            <div className="w-full p-5 rounded-[2rem] bg-gradient-to-br from-med-sand/80 to-med-sand/40 dark:from-gray-800/80 dark:to-gray-800/40 border border-slate-100/80 dark:border-gray-700/80">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-med-terracotta/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Globe size={18} className="text-med-terracotta" />
                    </div>
                    <div>
                        <p className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta mb-1.5">About Voyageurs</p>
                        <p className="text-xs font-body text-slate-500 dark:text-slate-400 leading-relaxed">
                            Your personal hub for Bryan's 40th — explore the agenda, manage travel, coordinate with your group, discover Montpellier, and share moments together.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {[
                                { icon: Calendar, label: 'Agenda' },
                                { icon: Map, label: 'Explore' },
                                { icon: Users, label: 'Group' },
                                { icon: Camera, label: 'Gallery' },
                            ].map(({ icon: Icon, label }) => (
                                <span key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-700/50 border border-slate-100 dark:border-gray-600 text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-gray-400">
                                    <Icon size={9} /> {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full pt-5">
                <PillButton variant="ghost" onClick={() => setCurrentStep('details')} fullWidth>
                    ← BACK TO DETAILS
                </PillButton>
            </div>
        </Shell>
    );
};
