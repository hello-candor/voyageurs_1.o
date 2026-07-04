
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
    Clock, Compass, PartyPopper, X, ArrowUpDown
} from 'lucide-react';
import { isValidEmail, isValidName } from '../utils/validation';
import { Button } from './Button';

import { onGuestRegistered } from '../services/registrationOrchestrator';

type Step = 'welcome' | 'details' | 'attendance' | 'rsvp';
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
            <AnimatePresence mode="wait">
                <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, scale: 0.98, y: 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.98, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] border border-white dark:border-gray-700 px-8 py-12 sm:px-14 sm:py-16 md:px-20 md:py-20 relative flex flex-col justify-center min-h-[88vh] sm:min-h-0 my-auto"
                >
                    <div className="absolute top-0 right-0 w-72 h-72 bg-med-terracotta/10 dark:bg-med-terracotta/20 rounded-full blur-[120px] opacity-60 dark:opacity-80 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center w-full max-w-lg mx-auto">
                        {children}
                    </div>
                </motion.div>
            </AnimatePresence>
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
    const [eventAttendance, setEventAttendance] = useState<Record<string, boolean>>({});

    // Parse compound names like "Paul & Victoria Mahoney" into separate guests
    const parseGuestNames = useCallback((fullName: string): { primary: string; companion: string | null } => {
        if (!fullName) return { primary: '', companion: null };

        // Check for " & " separator
        const ampIndex = fullName.indexOf(' & ');
        if (ampIndex === -1) return { primary: fullName, companion: null };

        const left = fullName.substring(0, ampIndex).trim();
        const right = fullName.substring(ampIndex + 3).trim();

        // Pattern: "First & Guest" → no companion to pre-fill
        if (right.toLowerCase() === 'guest') return { primary: left, companion: null };

        // Pattern: "Paul & Victoria Mahoney" → left is "Paul", right is "Victoria Mahoney"
        // Check if left is just a first name (no space = no last name)
        const leftParts = left.split(' ');
        const rightParts = right.split(' ');

        if (leftParts.length === 1 && rightParts.length >= 2) {
            // "Paul" & "Victoria Mahoney" → primary: "Paul Mahoney", companion: "Victoria Mahoney"
            const lastName = rightParts[rightParts.length - 1];
            return { primary: `${left} ${lastName}`, companion: right };
        }

        if (leftParts.length >= 2 && rightParts.length === 1) {
            // "Paul Mahoney" & "Victoria" → primary: "Paul Mahoney", companion: "Victoria Mahoney"
            const lastName = leftParts[leftParts.length - 1];
            return { primary: left, companion: `${right} ${lastName}` };
        }

        // Both have full names: "Adam Ralston & Jonathan Richard"
        return { primary: left, companion: right };
    }, []);

    const parsedNames = parseGuestNames(user?.name || '');

    const [identity, setIdentity] = useState({
        name: parsedNames.primary || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Phone field: split existing phone into country code + local
    const [phoneCountryCode, setPhoneCountryCode] = useState(() => {
        const p = user?.phone || '';
        const match = p.match(/^(\+\d{1,4})\s/);
        return match ? match[1] : '+1';
    });
    const [phoneLocal, setPhoneLocal] = useState(() => {
        const p = user?.phone || '';
        const match = p.match(/^(\+\d{1,4})\s(.+)$/);
        return match ? match[2] : p.replace(/^\+\d{1,4}\s?/, '');
    });

    // Party members the guest is adding — pre-populate companion if detected
    const [partyMembers, setPartyMembers] = useState<{ name: string; email: string }[]>(() => {
        if (parsedNames.companion) {
            return [{ name: parsedNames.companion, email: '' }];
        }
        return [];
    });
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    // Step 2 conditional: show compact confirmation when profile data already exists
    const hasExistingProfile = !!(user?.name && user?.email && identity.name && identity.email);
    const [showEditDetails, setShowEditDetails] = useState(!hasExistingProfile);

    useEffect(() => {
        if (user) {
            setIdentity(prev => ({
                ...prev,
                name: prev.name || user.name,
                email: prev.email || user.email,
                phone: prev.phone || (user.phone ?? '')
            }));
            if (user.eventConfirmations) {
                setEventAttendance(user.eventConfirmations);
            }
        }
    }, [user]);

    const validateDetails = () => {
        const e: Record<string, string> = {};
        if (!isValidName(identity.name)) e.name = 'Name must be at least 2 characters.';
        if (!isValidEmail(identity.email)) e.email = 'Please enter a valid email.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const addPartyMember = () => {
        if (!newMemberName.trim() || partyMembers.length >= 5) return;
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

        // Fire integrations via orchestrator (non-blocking, failures are logged)
        onGuestRegistered({
            name: identity.name,
            email: identity.email,
            phone: identity.phone || undefined,
            status,
            guests: guestsCount,
        });

        // Persist RSVP — await to prevent race condition with follow-up writes
        if (user) {
            await submitRSVP({ status, guestsCount, privacy, phone: identity.phone, eventConfirmations: eventAttendance });
        } else {
            login(identity.name, identity.email, guestsCount, status, '', '', {}, privacy, identity.phone);
            // After login, we might need to update event confirmations if they were set in onboarding
            if (Object.keys(eventAttendance).length > 0) {
                setTimeout(() => submitRSVP({ eventConfirmations: eventAttendance }), 500);
            }
        }

        // Send RSVP confirmation email via Firebase Trigger Email extension
        if (identity.email) {
            try {
                const { collection, addDoc } = await import('firebase/firestore');
                const { db } = await import('../firebaseConfig');

                const statusMessages: Record<string, { subject: string; heading: string; message: string; emoji: string }> = {
                    Confirmed: {
                        subject: "🎉 You're confirmed for Bryan's 40th!",
                        heading: "You're In!",
                        message: "We're thrilled you'll be joining us in Montpellier. Start exploring the app to plan your trip, coordinate with other guests, and discover everything the south of France has to offer.",
                        emoji: "🥂",
                    },
                    Pending: {
                        subject: "📋 RSVP received — Bryan's 40th",
                        heading: "We Got Your RSVP",
                        message: "No rush — take your time deciding. You can update your RSVP anytime by visiting the site again with your invitation code. We hope to see you in Montpellier!",
                        emoji: "🤔",
                    },
                    Declined: {
                        subject: "We'll miss you — Bryan's 40th",
                        heading: "Sorry to Hear That",
                        message: "We understand and we'll miss you! If your plans change, you can always update your RSVP by visiting the site again with your invitation code.",
                        emoji: "💙",
                    },
                };

                const s = statusMessages[status] || statusMessages.Pending;

                await addDoc(collection(db, 'mail'), {
                    to: identity.email,
                    message: {
                        subject: s.subject,
                        html: `
                            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #FFFFFF;">
                                <div style="background: linear-gradient(135deg, #1B2A4A 0%, #2A3F6B 100%); padding: 40px 32px; text-align: center; border-radius: 16px 16px 0 0;">
                                    <h1 style="color: #FFFFFF; font-size: 28px; margin: 0 0 8px; font-weight: 300;">${s.emoji} ${s.heading}</h1>
                                    <p style="color: #D67252; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; font-weight: 600;">Voyageurs 2026</p>
                                </div>
                                <div style="padding: 32px; border: 1px solid #F0EBE3; border-top: none; border-radius: 0 0 16px 16px;">
                                    <p style="color: #1B2A4A; font-size: 16px; margin: 0 0 4px;">Bonjour <strong>${identity.name}</strong>,</p>
                                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 12px 0 24px;">${s.message}</p>
                                    <div style="background: #F5F0E8; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                                        <p style="color: #D67252; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 12px; font-weight: 600;">Event Details</p>
                                        <p style="color: #1B2A4A; font-size: 14px; margin: 0 0 6px;"><strong>📅</strong> September 18–20, 2026</p>
                                        <p style="color: #1B2A4A; font-size: 14px; margin: 0 0 6px;"><strong>📍</strong> Montpellier, France</p>
                                        <p style="color: #1B2A4A; font-size: 14px; margin: 0;"><strong>👥</strong> ${guestsCount} guest${guestsCount > 1 ? 's' : ''} in your party</p>
                                    </div>
                                    <a href="https://bryans40th.voyageurs.app" style="display: block; text-align: center; background: #D67252; color: #FFFFFF; text-decoration: none; padding: 14px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">Open Voyageurs App</a>
                                    <p style="color: #999; font-size: 11px; text-align: center; margin: 20px 0 0; line-height: 1.5;">You can update your RSVP anytime at<br><a href="https://bryans40th.voyageurs.app" style="color: #D67252;">bryans40th.voyageurs.app</a></p>
                                </div>
                            </div>
                        `,
                    },
                });
                console.log('📧 RSVP confirmation email queued for', identity.email);
            } catch (e) {
                console.warn('Email queue failed (non-blocking):', e);
            }
        }

        // Invite party members
        partyMembers.forEach(m => {
            if (m.email) inviteToParty(m.email, m.name);
        });

        // Chain follow-up updates after primary write completes
        await updateTravelDetails({ arrivalDate: '2026-09-18', departureDate: '2026-09-20', arrivalMode: 'Plane', arrivalNumber: '', accommodation: '', hub: '' });
        updateSettings(guestsCount, 3);
        safeStorage.removeItem('tour_seen');
        completeOnboarding();
    };

    // ── Step 1: Welcome ──────────────────────────────────────────────────────
    if (currentStep === 'welcome') {
        return (
            <Shell stepIndex={0}>
                <Logo className="mb-10 w-24 h-24 sm:w-28 sm:h-28" />

                <div className="text-center mb-8 w-full">
                    <Eyebrow label="You're Invited To" />
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


                </div>

                <div className="w-full flex items-center gap-3">
                    <PillButton variant="ghost" onClick={logoutHost} fullWidth={false} className="flex-[1]">
                        RETURN
                    </PillButton>
                    <PillButton onClick={() => setCurrentStep('details')} fullWidth={false} className="flex-[2]">
                        CONFIRM &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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

                <div className="text-center mb-10 w-full">
                    <Eyebrow label="Step 1 of 3" />
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight"
                        style={{ fontSize: 'clamp(2.8rem, 10vw, 4.5rem)' }}
                    >
                        Your<br /><span className="italic text-med-terracotta">Details.</span>
                    </h2>
                </div>

                <div className="w-full space-y-6">
                    {/* Compact confirmation when profile data exists */}
                    {hasExistingProfile && !showEditDetails ? (
                        <div className="space-y-4">
                            <div className="p-5 rounded-[2rem] bg-white dark:bg-gray-800/50 border-2 border-slate-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                        <Check size={11} /> Confirmed Details
                                    </p>
                                    <button
                                        onClick={() => setShowEditDetails(true)}
                                        className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-med-blue dark:text-gray-500 dark:hover:text-white transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-med-terracotta" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-body text-slate-400 dark:text-gray-500">Name</p>
                                            <p className="text-sm font-body font-semibold text-med-blue dark:text-white">{identity.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                            <Mail size={14} className="text-med-terracotta" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-body text-slate-400 dark:text-gray-500">Email</p>
                                            <p className="text-sm font-body font-semibold text-med-blue dark:text-white">{identity.email}</p>
                                        </div>
                                    </div>
                                    {identity.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                                <Phone size={14} className="text-med-terracotta" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-body text-slate-400 dark:text-gray-500">Phone</p>
                                                <p className="text-sm font-body font-semibold text-med-blue dark:text-white">{identity.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Full editable form for new guests or when editing */
                        <>
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
                                label="Email Address (required)"
                                icon={Mail}
                                type="email"
                                value={identity.email}
                                onChange={e => setIdentity({ ...identity, email: e.target.value })}
                                placeholder="email@example.com"
                                error={errors.email}
                            />
                            {/* Phone with country code dropdown */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                    <Phone size={11} /> Phone / WhatsApp (Optional)
                                </label>
                                <div className="relative group flex items-center border-b-2 border-slate-100 dark:border-gray-800 focus-within:border-med-terracotta dark:focus-within:border-med-terracotta transition-all">
                                    <select
                                        value={phoneCountryCode}
                                        onChange={e => setPhoneCountryCode(e.target.value)}
                                        className="bg-transparent text-med-blue dark:text-white text-xl font-body font-medium outline-none py-4 pr-1 appearance-none cursor-pointer"
                                        style={{ width: `${phoneCountryCode.length + 2}ch` }}
                                    >
                                        <option value="+1">+1</option>
                                        <option value="+44">+44</option>
                                        <option value="+33">+33</option>
                                        <option value="+34">+34</option>
                                        <option value="+49">+49</option>
                                        <option value="+31">+31</option>
                                        <option value="+39">+39</option>
                                        <option value="+90">+90</option>
                                        <option value="+61">+61</option>
                                        <option value="+81">+81</option>
                                        <option value="+86">+86</option>
                                        <option value="+91">+91</option>
                                        <option value="+52">+52</option>
                                        <option value="+55">+55</option>
                                        <option value="+7">+7</option>
                                        <option value="+82">+82</option>
                                        <option value="+351">+351</option>
                                        <option value="+41">+41</option>
                                        <option value="+46">+46</option>
                                        <option value="+47">+47</option>
                                        <option value="+48">+48</option>
                                        <option value="+32">+32</option>
                                        <option value="+43">+43</option>
                                        <option value="+353">+353</option>
                                        <option value="+62">+62</option>
                                        <option value="+66">+66</option>
                                        <option value="+64">+64</option>
                                        <option value="+27">+27</option>
                                        <option value="+20">+20</option>
                                        <option value="+234">+234</option>
                                        <option value="+254">+254</option>
                                        <option value="+971">+971</option>
                                        <option value="+972">+972</option>
                                    </select>
                                    <span className="text-slate-300 dark:text-gray-600 text-xl mx-1 select-none">|</span>
                                    <input
                                        type="tel"
                                        value={phoneLocal}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/\D/g, '');
                                            let formatted = raw;
                                            if (phoneCountryCode === '+1') {
                                                if (raw.length <= 3) formatted = raw;
                                                else if (raw.length <= 6) formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
                                                else formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
                                            } else if (['+44', '+33', '+34', '+49', '+39', '+31'].includes(phoneCountryCode)) {
                                                if (raw.length <= 4) formatted = raw;
                                                else if (raw.length <= 7) formatted = `${raw.slice(0, 4)} ${raw.slice(4)}`;
                                                else formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7, 11)}`;
                                            } else {
                                                if (raw.length <= 3) formatted = raw;
                                                else if (raw.length <= 7) formatted = `${raw.slice(0, 3)} ${raw.slice(3)}`;
                                                else formatted = `${raw.slice(0, 3)} ${raw.slice(3, 7)} ${raw.slice(7, 11)}`;
                                            }
                                            setPhoneLocal(formatted);
                                            const fullNumber = formatted ? `${phoneCountryCode} ${formatted}` : '';
                                            setIdentity(prev => ({ ...prev, phone: fullNumber }));
                                        }}
                                        placeholder={phoneCountryCode === '+1' ? '(555) 000-0000' : '0000 000 0000'}
                                        className="flex-1 bg-transparent px-1 py-4 text-xl font-body font-medium text-med-blue dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-gray-700 placeholder:font-normal placeholder:text-base"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Party Members ── */}
                    <div className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                <Users size={11} /> Your Party
                            </p>
                            <span className="text-[10px] font-body text-slate-400 dark:text-gray-500">
                                {1 + partyMembers.length} / 6 guests
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
                                <p className="text-[9px] font-body text-slate-400 dark:text-gray-500 mt-0.5">Main contact for updates & emails</p>
                            </div>
                        </div>

                        {/* Added party members */}
                        <AnimatePresence>
                            {partyMembers.map((m, i) => (
                                <motion.div
                                    key={`member-${i}-${m.name}`}
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
                                        onClick={() => {
                                            // Swap: move this member to primary, move current primary to party
                                            const currentPrimary = { name: identity.name, email: identity.email };
                                            setIdentity(prev => ({ ...prev, name: m.name, email: m.email || prev.email }));
                                            setPartyMembers(prev => prev.map((p, idx) => idx === i ? currentPrimary : p));
                                        }}
                                        title="Make primary guest"
                                        className="w-7 h-7 rounded-full hover:bg-med-terracotta/10 flex items-center justify-center text-slate-300 hover:text-med-terracotta transition-colors"
                                    >
                                        <ArrowUpDown size={13} />
                                    </button>
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
                                    disabled={partyMembers.length >= 5}
                                    className="w-full mt-3 h-12 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-gray-700 hover:border-med-terracotta/40 flex items-center justify-center gap-2 text-[10px] font-body font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-gray-500 hover:text-med-terracotta transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Plus size={13} /> {partyMembers.length >= 5 ? 'Party Limit Reached' : 'Add Guest to Party'}
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
                                if (validateDetails()) setCurrentStep('attendance');
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

    // ── Step 3: Event Attendance (New) ────────────────────────────────────────
    if (currentStep === 'attendance') {
        const { DEFAULT_AGENDA_DATA } = require('../data/defaults');
        const officialEvents = DEFAULT_AGENDA_DATA.filter((e: any) => e.isOfficial);

        return (
            <Shell stepIndex={1.5}>
                <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />

                <div className="text-center mb-8 w-full">
                    <Eyebrow label="Step 2 of 3" />
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-3"
                        style={{ fontSize: 'clamp(2.5rem, 9vw, 4rem)' }}
                    >
                        The<br /><span className="italic text-med-terracotta">Festivities.</span>
                    </h2>
                    <p className="text-xs font-body text-slate-400 dark:text-gray-500 max-w-xs mx-auto">
                        Which events can we expect to see you at? You can update this later in the Hub.
                    </p>
                </div>

                <div className="w-full space-y-3 mb-8 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-med-terracotta/20">
                    {officialEvents.map((event: any) => (
                        <button
                            key={event.id}
                            onClick={() => setEventAttendance(prev => ({ ...prev, [event.id]: !prev[event.id] }))}
                            className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 text-left ${
                                eventAttendance[event.id]
                                    ? 'bg-med-terracotta/5 border-med-terracotta shadow-sm'
                                    : 'bg-white dark:bg-gray-800/40 border-slate-100 dark:border-gray-700 hover:border-slate-200'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                eventAttendance[event.id] ? 'bg-med-terracotta text-white' : 'bg-slate-50 dark:bg-gray-700 text-slate-400'
                            }`}>
                                {eventAttendance[event.id] ? <Check size={18} /> : <Calendar size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-body font-bold uppercase tracking-wider ${eventAttendance[event.id] ? 'text-med-terracotta' : 'text-med-blue dark:text-white'}`}>
                                    {event.title}
                                </p>
                                <p className="text-[10px] font-body text-slate-400 dark:text-gray-500 truncate">
                                    {event.day} • {event.time} @ {event.subtitle}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="w-full flex items-center gap-3">
                    <PillButton variant="ghost" onClick={() => setCurrentStep('details')} fullWidth={false} className="flex-[1]">
                        ← BACK
                    </PillButton>
                    <PillButton onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[2]">
                        NEXT &nbsp;<ArrowRight size={16} />
                    </PillButton>
                </div>
            </Shell>
        );
    }

    // ── Step 3: RSVP (Icon-Focused) ───────────────────────────────────────────
    return (
        <Shell stepIndex={2}>
            <Logo className="mb-8 w-20 h-20 sm:w-24 sm:h-24" />

            <div className="text-center mb-8 w-full">
                <Eyebrow label="Step 3 of 3" />
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

                {/* Still Exploring — highlighted as default */}
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFinish('Pending')}
                    disabled={isFinishing}
                    className="flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 border-med-blue/40 bg-med-blue/5 dark:bg-med-blue/10 dark:border-blue-500/40 backdrop-blur-sm transition-all duration-300 group hover:shadow-lg hover:shadow-med-blue/10 shadow-sm shadow-med-blue/5"
                >
                    <div className="w-14 h-14 rounded-full bg-med-blue/15 flex items-center justify-center group-hover:bg-med-blue group-hover:text-white transition-all duration-300">
                        <Compass size={24} className="text-med-blue/70 dark:text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-med-blue/70 dark:text-blue-400 group-hover:text-med-blue transition-colors leading-tight text-center">
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

            {/* RSVP Deadline Reminder — Reimagined */}
            <div className="w-full mt-2 py-4 px-8 rounded-full bg-med-sand/40 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-700 flex items-center justify-between group">
                <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-med-terracotta transition-colors">RSVP Cutoff</span>
                <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-med-terracotta" />
                    <span className="text-xs font-heading font-semibold text-med-blue dark:text-white italic">August 15, 2026</span>
                </div>
            </div>

            <div className="w-full pt-8 flex items-center justify-between gap-3">
                <PillButton variant="ghost" onClick={() => setCurrentStep('attendance')} fullWidth={false}>
                    ← BACK
                </PillButton>
                <PillButton onClick={() => handleFinish('Pending')} fullWidth={false} className="px-12">
                    NEXT &nbsp;<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </PillButton>
            </div>
        </Shell>
    );
};
