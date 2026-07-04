
import React, { useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { Check, X, Clock, Users, ChevronDown, Loader2, PartyPopper, Frown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RSVPStatus = 'Confirmed' | 'Declined' | 'Pending';

interface RSVPOption {
    status: RSVPStatus;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    glow: string;
}

const OPTIONS: RSVPOption[] = [
    {
        status: 'Confirmed',
        label: 'Attending',
        description: 'I\'ll be there — count me in!',
        icon: PartyPopper,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        glow: 'shadow-emerald-500/10',
    },
    {
        status: 'Declined',
        label: 'Can\'t Make It',
        description: 'Unfortunately I won\'t be able to attend.',
        icon: Frown,
        color: 'text-red-500 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        glow: 'shadow-red-500/10',
    },
    {
        status: 'Pending',
        label: 'Undecided',
        description: 'I need more time to decide.',
        icon: HelpCircle,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        glow: 'shadow-amber-500/10',
    },
];

const STATUS_CONFIG: Record<RSVPStatus, { icon: React.ElementType; color: string; bg: string; badge: string; label: string }> = {
    Confirmed: { icon: Check, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', badge: 'bg-emerald-500', label: 'Attending' },
    Declined: { icon: X, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', badge: 'bg-red-500', label: 'Not Attending' },
    Pending: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', badge: 'bg-amber-500', label: 'Undecided' },
};

interface HubRSVPCardProps {
    onComplete?: () => void;
}

export const HubRSVPCard: React.FC<HubRSVPCardProps> = ({ onComplete }) => {
    const { user, submitRSVP } = useUser();
    const { addNotification } = useNotification();

    const currentStatus = (user?.status as RSVPStatus) || 'Pending';
    const statusConfig = STATUS_CONFIG[currentStatus];
    const StatusIcon = statusConfig.icon;

    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const handleStatusChange = useCallback(async (newStatus: RSVPStatus) => {
        if (newStatus === currentStatus || isSaving) return;

        setIsSaving(true);
        try {
            await submitRSVP({
                status: newStatus,
                isConfirmed: newStatus === 'Confirmed',
            });
            addNotification(
                newStatus === 'Confirmed'
                    ? 'You\'re confirmed! We can\'t wait to see you.'
                    : newStatus === 'Declined'
                        ? 'Your RSVP has been updated. We\'ll miss you!'
                        : 'Your RSVP has been set to undecided.',
                newStatus === 'Confirmed' ? 'success' : 'info'
            );
            setJustSaved(true);
            setIsExpanded(false);
            setTimeout(() => setJustSaved(false), 2500);
            if (newStatus === 'Confirmed' && onComplete) {
                setTimeout(onComplete, 600);
            }
        } catch {
            addNotification('Failed to update RSVP. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [currentStatus, isSaving, submitRSVP, addNotification, onComplete]);

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">
                    Attendance
                </span>
                <h2 className="font-serif text-4xl text-med-blue dark:text-white leading-none">
                    Your <span className="italic text-med-terracotta">RSVP</span>
                </h2>
            </div>

            {/* Current Status Card */}
            <div
                className={`
                    relative overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 mb-6
                    ${statusConfig.bg} ${statusConfig.color}
                    ${justSaved ? `${statusConfig.badge.replace('bg-', 'border-')} shadow-xl ${statusConfig.badge.replace('bg-', 'shadow-')}/20` : 'border-gray-100 dark:border-gray-800 shadow-sm'}
                `}
            >
                {/* Decorative glow */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-30 ${statusConfig.badge}`} />

                <div className="relative p-8">
                    <div className="flex items-center gap-5 mb-6">
                        <div className={`w-14 h-14 rounded-2xl ${statusConfig.bg} border ${statusConfig.color.includes('emerald') ? 'border-emerald-200 dark:border-emerald-800' : statusConfig.color.includes('red') ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800'} flex items-center justify-center shadow-inner`}>
                            <StatusIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-1">Current Status</p>
                            <h3 className={`font-serif text-2xl ${statusConfig.color}`}>
                                {statusConfig.label}
                            </h3>
                        </div>
                        {justSaved && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Check size={16} strokeWidth={3} />
                            </motion.div>
                        )}
                    </div>

                    {user?.guestsCount && user.guestsCount > 1 && (
                        <div className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-white/60 dark:bg-gray-800/40 rounded-xl w-fit">
                            <Users size={14} className="text-gray-400" />
                            <span className="text-xs font-bold text-med-blue dark:text-white">{user.guestsCount} guests</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider">in your party</span>
                        </div>
                    )}

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        disabled={isSaving}
                        className={`
                            w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                            text-[10px] font-bold uppercase tracking-[0.2em]
                            transition-all duration-300 group
                            ${isExpanded
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                : 'bg-white dark:bg-gray-800 text-med-blue dark:text-white border border-gray-200 dark:border-gray-700 hover:border-med-terracotta hover:text-med-terracotta shadow-sm hover:shadow-md'
                            }
                        `}
                    >
                        {isSaving ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <>
                                {isExpanded ? 'Cancel' : 'Change RSVP'}
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded Options */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="space-y-3 overflow-hidden"
                    >
                        {OPTIONS.filter(o => o.status !== currentStatus).map((option) => {
                            const Icon = option.icon;
                            return (
                                <motion.button
                                    key={option.status}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: option.status === 'Confirmed' ? 0 : 0.1 }}
                                    onClick={() => handleStatusChange(option.status)}
                                    disabled={isSaving}
                                    className={`
                                        w-full flex items-center gap-5 p-6 rounded-[2rem]
                                        border-2 ${option.border} ${option.bg}
                                        hover:shadow-lg ${option.glow}
                                        transition-all duration-300 group text-left
                                        active:scale-[0.98]
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl ${option.bg} border ${option.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                        <Icon size={22} className={option.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-serif text-lg ${option.color} mb-0.5`}>{option.label}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full border-2 ${option.border} flex items-center justify-center shrink-0 group-hover:${option.bg} transition-colors`}>
                                        <Check size={14} className={`${option.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Event quick-reference */}
            <div className="mt-8 p-5 rounded-[2rem] bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-3">Event Details</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Date</p>
                        <p className="text-sm font-serif font-medium text-med-blue dark:text-white">Sep 18–20, 2026</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Location</p>
                        <p className="text-sm font-serif font-medium text-med-blue dark:text-white">Montpellier, FR</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
