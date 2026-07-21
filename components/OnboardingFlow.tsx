
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
    User, Mail, Users, Globe, Loader2, MapPin,
    ArrowRight, Check, Phone, Plus, Trash2, Calendar, AlertCircle, Info,
    Plane, Map, Utensils, Camera, Music, Heart, Star,
    Clock, Compass, PartyPopper, X, ArrowUpDown, Key, Sparkles
} from 'lucide-react';
import { isValidEmail, isValidName } from '../utils/validation';
import { authService } from '../services/authService';
import { Button } from './Button';
import { WebOSCard } from './WebOSCard';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';
import { onGuestRegistered } from '../services/registrationOrchestrator';
import { DEFAULT_AGENDA_DATA } from '../data/defaults';

type Step = 'invite' | 'welcome' | 'details' | 'attendance' | 'rsvp' | 'decline';
type RSVPStatus = 'Confirmed' | 'Declined' | 'Pending';

// Blobs removed — webOS workspace background provides atmosphere


// Helpers for invite code formatting
const stripCode = (v: string) => v.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
const formatCode = (raw: string) => {
  const clean = stripCode(raw);
  const parts = [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6)].filter(Boolean);
  return parts.join('-');
};

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
        <div className="relative group my-auto">
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


// ─── Shell (webOS Workspace + Onyx Card) ─────────────────────────────────────
const Shell = ({ children, stepIndex, stepTitle = 'RSVP', onClose }: { children: React.ReactNode; stepIndex: number; stepTitle?: string; onClose?: () => void }) => {
    const { toggleProfile } = useUser();
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden bg-med-sand dark:bg-slate-900 transition-colors duration-500">
          <MarketingHeader />
          <div className={`relative transition-all duration-300 ${isFullScreen ? 'w-full h-full' : 'w-[90%] max-w-sm h-[90dvh] max-h-[900px] mt-12'}`}>
            <WebOSCard
              id="onboarding-card"
              title={stepTitle}
              isActive={true}
              isOverview={false}
              index={0}
              activeIndex={0}
              stackIndex={0}
              stackSize={1}
              onClose={onClose || toggleProfile}
              onFocus={() => {}}
              onMinimize={onClose || toggleProfile}
              isFullScreen={isFullScreen}
              onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            >
              <div className="flex flex-col h-full overflow-hidden relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stepIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 overflow-y-auto px-6 py-8 md:px-10 flex flex-col items-center justify-start"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </WebOSCard>
          </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const OnboardingFlow: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { user, isVerified, login, submitRSVP, completeOnboarding, updateTravelDetails, inviteToParty, loginWithCode } = useUser();
    const { updateSettings, durationDays } = useTripPlanner();
    const { addNotification } = useNotification();
    const { logoutHost } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>(isVerified ? 'rsvp' : 'invite');
    const [isFinishing, setIsFinishing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Login State
    const [inputValue, setInputValue] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showConsentInfo, setShowConsentInfo] = useState(false);
    const hasAutoSubmitted = React.useRef(false);

    // Auto-fill and auto-submit from ?code= URL parameter
    useEffect(() => {
      if (hasAutoSubmitted.current) return;
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code');
      if (codeParam) {
        const code = stripCode(codeParam);
        setInputValue(formatCode(code));
        hasAutoSubmitted.current = true;
        
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.pathname + url.search);

        setTimeout(async () => {
          setIsLoginLoading(true);
          setLoginError('');
          try {
            const success = await loginWithCode(code);
            if (success) {
              setCurrentStep('rsvp');
            } else {
              setLoginError("Invalid invite code.");
            }
          } catch (err) {
            setLoginError("Connection error.");
          } finally {
            setIsLoginLoading(false);
          }
        }, 1200);
      }
    }, [loginWithCode]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue) return;
      
      setIsLoginLoading(true);
      setLoginError('');
      
      try {
          const success = await loginWithCode(inputValue.trim().toUpperCase());
          if (success) {
            setCurrentStep('rsvp');
          } else {
            setLoginError("Invalid invite code. Check your invitation.");
          }
      } catch (err) {
        setLoginError("Connection error. Please try again.");
      } finally {
        setIsLoginLoading(false);
      }
    };

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
            <Shell stepIndex={1} stepTitle="Details" onClose={onClose}>

                <div className="text-center mb-3 w-full">
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-1"
                        style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}
                    >
                        Confirm Your<br /><span className="italic text-med-terracotta">{partyMembers.length > 0 ? 'Party.' : 'Details.'}</span>
                    </h2>
                </div>

                <div className="w-full flex-1 flex flex-col">
                    <div className="my-auto space-y-3">
                    {/* Compact confirmation when profile data exists */}
                    {hasExistingProfile && !showEditDetails ? (
                        <div className="space-y-3 mt-auto">
                            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/50 border-2 border-slate-100 dark:border-gray-700">
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
                        <div className="flex items-center gap-2 py-2 px-3 rounded-2xl bg-med-terracotta/5 border border-med-terracotta/10 mb-1.5">
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
                                    className="flex items-center gap-2 py-2 px-3 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 mb-1.5"
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
                                    <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border-2 border-med-terracotta/20 space-y-2">
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
                                    className="w-full mt-1.5 h-9 rounded-2xl border border-dashed border-slate-200 dark:border-gray-700 hover:border-med-terracotta/40 flex items-center justify-center gap-1.5 text-[9px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-med-terracotta transition-all disabled:opacity-30"
                                >
                                    <Plus size={12} /> Add Guest
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    </div>

                    <div className="mt-auto pt-2 flex items-center gap-2 w-full">
                        <Button variant="ghost" onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[1]">
                            ← BACK
                        </Button>
                        <Button
                            onClick={() => {
                                if (validateDetails()) handleFinish('Confirmed');
                            }}
                            fullWidth={false}
                            className="flex-[2]"
                        >
                            FINISH &nbsp;<ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Decline Confirmation ──────────────────────────────────────────────────
    if (currentStep === 'decline') {
        return (
            <Shell stepIndex={0} stepTitle="Decline" onClose={onClose}>

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
                        className="w-full bg-white/80 dark:bg-gray-800/60 border-2 border-slate-100 dark:border-gray-700 rounded-2xl px-3 py-2 text-xs font-body text-med-blue dark:text-white focus:outline-none focus:border-med-terracotta/50 resize-none"
                    />
                </div>

                <div className="w-full flex items-center gap-2">
                    <Button variant="ghost" onClick={() => setCurrentStep('rsvp')} fullWidth={false} className="flex-[1]">
                        ← BACK
                    </Button>
                    <Button
                        onClick={() => handleFinish('Declined')}
                        fullWidth={false}
                        className="flex-[2]"
                        isLoading={isFinishing}
                    >
                        {declineMessage.trim() ? 'SEND & FINISH' : 'FINISH'}
                    </Button>
                </div>
            </Shell>
        );
    }


    // ── Step 1: Invite Code ──────────────────────────────────────────────────
    if (currentStep === 'invite') {
        return (
            <Shell stepIndex={0} stepTitle="Welcome" onClose={onClose}>

                <div className="text-center mb-3 w-full">
                    <h2
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-[0.9] mb-1"
                        style={{ fontSize: 'clamp(1.8rem, 6vw, 3rem)' }}
                    >
                        Welcome,<br /><span className="italic text-med-terracotta inline-block">Voyager.</span>
                    </h2>
                </div>

                <form onSubmit={handleLoginSubmit} className="w-full flex flex-col flex-1">
                    <div className="relative group my-auto">
                        <p className="text-[10px] font-body text-slate-400 dark:text-gray-500 text-center mb-2 tracking-wide uppercase font-bold">Enter Your Invite Code</p>
                        <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(formatCode(e.target.value))}
                        placeholder="XXX-XXX-XXX" 
                        maxLength={11}
                        className="w-full h-12 bg-slate-50/50 dark:bg-[#1a1f2e] border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta dark:focus:border-med-terracotta rounded-2xl px-4 text-center font-body font-bold text-med-blue dark:text-white outline-none transition-all flex items-center justify-center leading-none placeholder:text-sm placeholder:tracking-[0.5em] placeholder:font-body placeholder:opacity-30 placeholder:font-normal"
                        style={{ 
                            fontSize: 'clamp(1.2rem, 5vw, 2rem)',
                            letterSpacing: '0.08em',
                        }}
                        disabled={isLoginLoading}
                        autoFocus
                        />
                        <div className="absolute right-0 bottom-3 text-slate-300 dark:text-gray-700 opacity-0 group-focus-within:opacity-100 transition-opacity">
                        <Key size={16} />
                        </div>
                    </div>

                    <div className="space-y-3 mt-auto">
                        <label className="flex items-start gap-3 p-3 bg-med-sand/40 dark:bg-[#1a1f2e]/40 rounded-2xl border border-med-blue/5 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-med-terracotta focus:ring-med-terracotta shrink-0 accent-[#E2923D]"
                            />
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-body font-medium text-left">
                                I agree to the Voyageurs <button type="button" onClick={() => setShowTerms(true)} className="underline hover:text-med-blue decoration-med-terracotta/30">Terms</button> and <button type="button" onClick={() => setShowPrivacy(true)} className="underline hover:text-med-blue decoration-med-terracotta/30">Privacy</button>.
                            </p>
                        </label>
                    </div>

                    <div className="mt-auto pt-4">
                    <Button 
                        type="submit"
                        disabled={isLoginLoading || !inputValue || !agreedToTerms}
                        isLoading={isLoginLoading}
                        fullWidth
                    >
                        CONTINUE
                    </Button>
                    </div>
                </form>

                <AnimatePresence>
                {loginError && (
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 w-full text-red-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-red-50 dark:bg-red-500/10 rounded-xl text-center font-body border border-red-100 dark:border-red-500/20"
                    >
                        {loginError}
                    </motion.p>
                )}
                </AnimatePresence>
            </Shell>
        );
    }

    // ── Step 2: RSVP (Icon-Focused) ───────────────────────────────────────────
    return (
        <Shell stepIndex={1} stepTitle="RSVP" onClose={onClose}>

            <div className="text-center mb-3 w-full">
                <h2
                    className="font-heading font-light text-med-blue dark:text-blue-100 leading-tight mb-1"
                    style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)' }}
                >
                    Will you join us,<br /><span className="italic text-med-terracotta">{guestName}?</span>
                </h2>
            </div>

            {/* Event Info Box */}
            <div className="flex-1 flex flex-col w-full">
            <div className="my-auto w-full">
            <div className="w-full text-center mb-4 px-2">
                <p className="text-sm leading-relaxed font-body text-slate-500 dark:text-gray-400">
                    You're invited to celebrate <span className="font-semibold text-med-blue dark:text-white">Bryan's 40th</span> in <span className="font-semibold text-med-blue dark:text-white">Montpellier, France</span> on <span className="font-semibold text-med-blue dark:text-white">September 18-20</span>.
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
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-3xl border-2 transition-all group ${
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

            {/* Combined Info Box */}
            <div className="w-full mt-2 mb-2 py-2.5 px-5 rounded-[1.5rem] bg-med-blue/5 dark:bg-med-blue/10 border border-med-blue/10 dark:border-med-blue/20 text-center">
                <p className="text-[10px] leading-relaxed font-body text-slate-500 dark:text-gray-400">
                    Please RSVP by <span className="font-bold text-med-terracotta">August 15th</span> to help us finalize the guest list. Don't worry if your plans shift—you can always update your response before the deadline. If you're not sure, choose <span className="font-bold">Maybe</span> to explore the weekend itinerary, find accommodations, manage your party, and discover the destination before you decide.
                </p>
            </div>

            </div>
            </div>
            <div className="w-full mt-auto pt-4 flex items-center gap-3">
                <PillButton variant="ghost" onClick={() => setCurrentStep('invite')} fullWidth={false} className="flex-[1]">
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
