
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
import { DEFAULT_AGENDA_DATA } from '../data/defaults';

type Step = 'welcome' | 'details' | 'attendance' | 'rsvp' | 'decline';
type RSVPStatus = 'Confirmed' | 'Declined' | 'Pending';

// Blobs removed — webOS workspace background provides atmosphere

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

// ─── Progress Bar ──────────────────────────────────────────────────────────────────
const ProgressBar = ({ step, total }: { step: number; total: number }) => (
    <div className="w-full max-w-[180px] mx-auto mb-8 flex gap-2">
        {Array.from({ length: total }, (_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-med-terracotta"
                    initial={{ width: 0 }}
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: i * 0.1 }}
                />
            </div>
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
    <div className="space-y-0.5">
        <label className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-med-terracotta flex items-center gap-1.5">
            <Icon size={10} /> {label}
        </label>
        <div className="relative group">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                disabled={disabled}
                className={`w-full bg-transparent border-b-2 ${error ? 'border-red-400' : 'border-slate-100 dark:border-gray-800 focus:border-med-terracotta dark:focus:border-med-terracotta'} px-1 py-2 text-sm font-body font-medium text-med-blue dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 placeholder:font-normal placeholder:text-xs`}
            />
        </div>
        {error && (
            <p className="text-red-400 text-[9px] font-body font-bold uppercase tracking-wider pt-0.5">{error}</p>
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
                className={`h-12 px-6 text-slate-500 hover:text-med-blue dark:text-gray-400 dark:hover:text-white text-[10px] font-body font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border-2 border-transparent hover:border-slate-200 dark:hover:border-gray-800 rounded-full ${fullWidth ? 'w-full' : ''} ${className}`}
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
            className={`h-12 bg-[#E2923D] dark:bg-[#c07030] text-white rounded-full text-[10px] font-body font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-[#d17e2b] dark:hover:bg-[#a86028] shadow-[#E2923D]/20 transition-all flex items-center justify-center gap-4 group active:scale-95 disabled:opacity-50 ${fullWidth ? 'w-full' : 'px-10'} ${className}`}
        >
            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : children}
        </button>
    );
};

// ─── Shell (webOS Workspace + Onyx Card) ─────────────────────────────────────
const Shell = ({ children, stepIndex, stepTitle = 'Voyageurs' }: { children: React.ReactNode; stepIndex: number; stepTitle?: string }) => (
    <div className="fixed inset-0 z-[1000] overflow-y-auto transition-colors duration-500">

        {/* webOS Workspace Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Light mode base */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-[#F5F2EB] to-[#F5F2EB] dark:opacity-0 transition-opacity duration-700" />
            {/* Dark mode base */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#330046]/40 via-[#1A1A1A] to-[#1A1A1A] opacity-0 dark:opacity-100 transition-opacity duration-700" />
            {/* Ambient glows */}
            <div className="absolute top-[20%] left-[30%] w-[600px] h-[600px] bg-[#508BC5] rounded-full blur-[120px] mix-blend-multiply opacity-[0.1] dark:mix-blend-screen dark:opacity-[0.15]" />
            <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-[#FFCDA6] rounded-full blur-[140px] mix-blend-multiply opacity-[0.2] dark:mix-blend-screen dark:opacity-[0.10]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#330046] rounded-full blur-[160px] mix-blend-screen opacity-0 dark:opacity-40 transition-opacity duration-700" />
        </div>

        <div className="relative w-full max-w-xl px-5 py-4 min-h-screen flex items-center justify-center mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, scale: 0.96, y: 16, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.96, y: -12, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                    className="w-full max-h-[90vh] overflow-hidden rounded-[var(--onyx-card-radius)] shadow-[var(--onyx-shadow-card)] relative flex flex-col justify-start bg-white/95 dark:bg-[#1a202c]/92 dark:backdrop-blur-[40px] border border-white dark:border-white/[0.08] border-t-white/50 dark:border-t-white/10"
                >
                    {/* Onyx Header Chrome */}
                    <div className="h-12 shrink-0 flex items-center justify-between px-6 border-b bg-white/40 dark:bg-transparent border-white/40 dark:border-white/10 select-none">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-med-terracotta shadow-[0_0_8px_#D67252]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{stepTitle}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8">
                        <div className="absolute top-0 right-0 w-72 h-72 bg-med-terracotta/10 dark:bg-med-terracotta/20 rounded-full blur-[120px] opacity-60 dark:opacity-80 pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto">
                            {children}
                        </div>
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

    const [currentStep, setCurrentStep] = useState<Step>('rsvp');
    const [isFinishing, setIsFinishing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('Confirmed');
    const [selectedRSVP, setSelectedRSVP] = useState<RSVPStatus | null>(null);
    const [declineMessage, setDeclineMessage] = useState('');
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

    const guestName = React.useMemo(() => {
        if (!parsedNames.primary) return 'Voyager';
        return parsedNames.primary.split(' ')[0];
    }, [parsedNames.primary]);

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
        if (identity.email && !isValidEmail(identity.email)) e.email = 'Please enter a valid email.';
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

    // ── Step 2: Personal Details + Party (only if attending) ──────────────────
    if (currentStep === 'details') {
        return (
            <Shell stepIndex={1} stepTitle="Details">
                <Logo className="mb-2 w-14 h-14" />

                <div className="text-center mb-3 w-full">
                    <ProgressBar step={2} total={2} />
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-1"
                        style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}
                    >
                        Confirm Your<br /><span className="italic text-med-terracotta">{partyMembers.length > 0 ? 'Party.' : 'Details.'}</span>
                    </h2>
                </div>

                <div className="w-full space-y-3">
                    {/* Compact confirmation when profile data exists */}
                    {hasExistingProfile && !showEditDetails ? (
                        <div className="space-y-3">
                            <div className="p-4 rounded-[1.5rem] bg-white dark:bg-gray-800/50 border-2 border-slate-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta flex items-center gap-1.5">
                                        <Check size={10} /> Confirmed Details
                                    </p>
                                    <button
                                        onClick={() => setShowEditDetails(true)}
                                        className="text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-med-blue dark:text-gray-500 dark:hover:text-white transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                            <User size={12} className="text-med-terracotta" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-body text-slate-400 dark:text-gray-500">Name</p>
                                            <p className="text-xs font-body font-semibold text-med-blue dark:text-white">{identity.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                            <Mail size={12} className="text-med-terracotta" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-body text-slate-400 dark:text-gray-500">Email</p>
                                            <p className="text-xs font-body font-semibold text-med-blue dark:text-white">{identity.email}</p>
                                        </div>
                                    </div>
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
                                label="Email Address"
                                icon={Mail}
                                type="email"
                                value={identity.email}
                                onChange={e => setIdentity({ ...identity, email: e.target.value })}
                                placeholder="email@example.com"
                                error={errors.email}
                            />
                        </>
                    )}

                    {/* ── Party Members ── */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta flex items-center gap-1.5">
                                <Users size={10} /> Your Party
                            </p>
                            <span className="text-[9px] font-body text-slate-400 dark:text-gray-500">
                                {1 + partyMembers.length} / 6 guests
                            </span>
                        </div>

                        {/* Primary guest pill */}
                        <div className="flex items-center gap-2 py-2 px-3 rounded-[1rem] bg-med-terracotta/5 border border-med-terracotta/10 mb-1.5">
                            <div className="w-6 h-6 rounded-full bg-med-terracotta/20 flex items-center justify-center shrink-0">
                                <User size={12} className="text-med-terracotta" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-body font-semibold text-med-blue dark:text-white truncate">
                                    {identity.name || 'You'}
                                </p>
                                <p className="text-[9px] font-body text-med-terracotta">Primary Guest</p>
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
                                    className="flex items-center gap-2 py-2 px-3 rounded-[1rem] bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 mb-1.5"
                                >
                                    <div className="w-6 h-6 rounded-full bg-med-blue/10 flex items-center justify-center shrink-0">
                                        <User size={12} className="text-med-blue/60 dark:text-blue-300" />
                                    </div>
                                    <p className="flex-1 text-xs font-body font-medium text-med-blue dark:text-white truncate">{m.name}</p>
                                    <button
                                        onClick={() => setPartyMembers(prev => prev.filter((_, idx) => idx !== i))}
                                        className="w-6 h-6 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                                    >
                                        <X size={12} />
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
                                    className="overflow-hidden mt-2"
                                >
                                    <div className="p-3 rounded-[1rem] bg-white dark:bg-gray-800 border-2 border-med-terracotta/20 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Full name"
                                            value={newMemberName}
                                            onChange={e => setNewMemberName(e.target.value)}
                                            autoFocus
                                            className="w-full bg-transparent border-b border-slate-100 dark:border-gray-700 py-1.5 text-xs font-body text-med-blue dark:text-white outline-none placeholder:text-slate-300"
                                        />
                                        <button
                                            onClick={addPartyMember}
                                            disabled={!newMemberName.trim()}
                                            className="w-full h-8 rounded-full bg-med-terracotta text-white text-[9px] font-body font-bold uppercase tracking-wider disabled:opacity-40"
                                        >
                                            Add Guest
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => setAddingMember(true)}
                                    disabled={partyMembers.length >= 5}
                                    className="w-full mt-1.5 h-9 rounded-[1rem] border border-dashed border-slate-200 dark:border-gray-700 hover:border-med-terracotta/40 flex items-center justify-center gap-1.5 text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-med-terracotta transition-all disabled:opacity-30"
                                >
                                    <Plus size={12} /> Add Guest
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-2 flex items-center gap-2 w-full">
                        <PillButton variant="ghost" onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[1]">
                            ← BACK
                        </PillButton>
                        <PillButton
                            onClick={() => {
                                if (validateDetails()) handleFinish('Confirmed');
                            }}
                            fullWidth={false}
                            className="flex-[2]"
                        >
                            FINISH &nbsp;<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </PillButton>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Decline Confirmation ──────────────────────────────────────────────────
    if (currentStep === 'decline') {
        return (
            <Shell stepIndex={0} stepTitle="Decline">
                <Logo className="mb-2 w-14 h-14" />

                <div className="text-center mb-3 w-full">
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-1"
                        style={{ fontSize: 'clamp(1.6rem, 6vw, 2.2rem)' }}
                    >
                        We'll miss<br /><span className="italic text-med-terracotta">you.</span>
                    </h2>
                </div>

                <div className="w-full space-y-2 mb-3">
                    <textarea
                        value={declineMessage}
                        onChange={(e) => setDeclineMessage(e.target.value)}
                        placeholder="Optional note to the host..."
                        rows={2}
                        className="w-full bg-white/80 dark:bg-gray-800/60 border-2 border-slate-100 dark:border-gray-700 rounded-[1rem] px-3 py-2 text-xs font-body text-med-blue dark:text-white focus:outline-none focus:border-med-terracotta/50 resize-none"
                    />
                </div>

                <div className="w-full flex items-center gap-2">
                    <PillButton variant="ghost" onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[1]">
                        ← BACK
                    </PillButton>
                    <PillButton
                        onClick={() => handleFinish('Declined')}
                        fullWidth={false}
                        className="flex-[2]"
                        isLoading={isFinishing}
                    >
                        {declineMessage.trim() ? 'SEND & FINISH' : 'FINISH'}
                    </PillButton>
                </div>
            </Shell>
        );
    }

    // ── Step 1: RSVP (Icon-Focused) ───────────────────────────────────────────
    return (
        <Shell stepIndex={0} stepTitle="RSVP">
            <Logo className="mb-2 w-14 h-14" />

            <div className="text-center mb-3 w-full">
                <ProgressBar step={1} total={2} />
                <h2
                    className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-1"
                    style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}
                >
                    Will you join us,<br /><span className="italic text-med-terracotta">{guestName}?</span>
                </h2>
            </div>

            {/* Event Info Box */}
            <div className="w-full py-4 px-5 rounded-[1.5rem] bg-med-sand/40 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-700 text-center mb-3">
                <p className="text-[11px] leading-relaxed font-body text-slate-500 dark:text-gray-400">
                    You're invited to celebrate <span className="font-semibold text-med-blue dark:text-white">Bryan's 40th</span> in Montpellier <span className="font-semibold text-med-blue dark:text-white">September 18-20</span>. Please RSVP before <span className="font-semibold text-med-terracotta">August 15</span> so we can finalize headcounts. We hope to see you in France!
                </p>
            </div>

            {/* RSVP Options — Icon-Focused */}
            <div className="w-full grid grid-cols-3 gap-2 mb-3">
                {/* Yes */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRSVP('Confirmed')}
                    disabled={isFinishing}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-[1.2rem] border-2 transition-all group ${
                        selectedRSVP === 'Confirmed'
                            ? 'border-med-terracotta bg-med-terracotta/10'
                            : 'border-slate-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedRSVP === 'Confirmed' ? 'bg-med-terracotta text-white' : 'bg-med-terracotta/10 text-med-terracotta'
                    }`}>
                        <PartyPopper size={16} />
                    </div>
                    <span className="text-[8px] font-body font-bold uppercase tracking-[0.2em] text-slate-500">Yes</span>
                </motion.button>

                {/* Maybe */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRSVP('Pending')}
                    disabled={isFinishing}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-[1.2rem] border-2 transition-all group ${
                        selectedRSVP === 'Pending'
                            ? 'border-med-blue bg-med-blue/10'
                            : 'border-slate-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedRSVP === 'Pending' ? 'bg-med-blue text-white' : 'bg-med-blue/10 text-med-blue'
                    }`}>
                        <Compass size={16} />
                    </div>
                    <span className="text-[8px] font-body font-bold uppercase tracking-[0.2em] text-slate-500">Maybe</span>
                </motion.button>

                {/* No */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRSVP('Declined')}
                    disabled={isFinishing}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-[1.2rem] border-2 transition-all group ${
                        selectedRSVP === 'Declined'
                            ? 'border-slate-400 bg-slate-100 dark:bg-gray-700'
                            : 'border-slate-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/50'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        selectedRSVP === 'Declined' ? 'bg-slate-400 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-400'
                    }`}>
                        <X size={16} />
                    </div>
                    <span className="text-[8px] font-body font-bold uppercase tracking-[0.2em] text-slate-400">No</span>
                </motion.button>
            </div>

            <div className="w-full pt-4 flex items-center gap-3">
                <PillButton variant="ghost" onClick={logoutHost} fullWidth={false} className="flex-[1]">
                    ← BACK
                </PillButton>
                <AnimatePresence>
                    {selectedRSVP && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-[2]"
                        >
                            <PillButton
                                onClick={() => {
                                    if (selectedRSVP === 'Confirmed') {
                                        setCurrentStep('details');
                                    } else if (selectedRSVP === 'Pending') {
                                        handleFinish('Pending');
                                    } else {
                                        setCurrentStep('decline');
                                    }
                                }}
                                fullWidth
                                isLoading={isFinishing}
                            >
                                CONTINUE &nbsp;<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </PillButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Shell>
    );
};
