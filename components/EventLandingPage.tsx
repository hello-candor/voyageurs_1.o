
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, Users, Check, X, Clock,
    ChevronDown, ChevronRight, Loader2, PartyPopper, Frown, HelpCircle,
    Plus, Edit3, Calendar, MapPin,
    MessageCircle, Hotel, UtensilsCrossed, Plane, Smartphone,
    Map, Sparkles, Lock, ExternalLink, ArrowRight,
    Globe, Shield, Camera, Compass, LogOut,
    Wifi, CreditCard, Heart, Star, Utensils, StickyNote,
    CalendarDays, PlaneTakeoff, Train, Car, Wine, Sun, GlassWater,
    Info, Shirt, ListChecks, MapPinned, Clock3, AlertCircle, Pencil, Wallet,
    Palette, Music, Eye, Building2, ChevronLeft, ChevronRight, PartyPopper, Moon, Sun, Martini, RefreshCw
} from 'lucide-react';
import { UnifiedHeader } from './UnifiedHeader';
import { safeStorage } from '../utils/storage';
import { isValidEmail, isValidName } from '../utils/validation';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const RSVP_CUTOFF = new Date('2026-08-15T23:59:59');
const EVENT_DATE = new Date('2026-09-18T00:00:00');

type RSVPStatus = 'Confirmed' | 'Declined' | 'Pending';

// ─── Shared Decorative Background ───────────────────────────────────────────

const Blobs = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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

// ─── Eyebrow ─────────────────────────────────────────────────────────────────

const Eyebrow = ({ label, onEdit, isEditing, rightContent, editLabel }: { label: string; onEdit?: () => void; isEditing?: boolean; rightContent?: React.ReactNode; editLabel?: string }) => (
    <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-body font-bold uppercase tracking-[0.25em] text-med-terracotta">
            {label}
        </h2>
        <div className="flex items-center gap-2">
            {rightContent}
            {onEdit && (
                <button
                    onClick={onEdit}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider transition-all ${
                        isEditing
                            ? 'bg-med-terracotta text-white shadow-md shadow-med-terracotta/30'
                            : 'bg-med-terracotta/10 text-med-terracotta/70 hover:bg-med-terracotta/20 hover:text-med-terracotta active:scale-95'
                    }`}
                >
                    <Pencil size={10} />
                    {editLabel || 'Edit'}
                </button>
            )}
        </div>
    </div>
);

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(target: Date) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);
    const diff = Math.max(0, target.getTime() - now);
    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        isPast: diff === 0,
    };
}

// ─── RSVP Status Config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RSVPStatus, {
    icon: React.ElementType; label: string; description: string;
    color: string; bg: string; border: string; dot: string;
}> = {
    Confirmed: {
        icon: PartyPopper, label: 'Attending', description: "You're confirmed — we can't wait to see you!",
        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500',
    },
    Pending: {
        icon: HelpCircle, label: 'Still Exploring', description: "No rush — you can update anytime before August 15th.",
        color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500',
    },
    Declined: {
        icon: Frown, label: 'Not Attending', description: "We'll miss you! You can change your mind anytime before August 15th.",
        color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500',
    },
};

const RSVP_OPTIONS: { status: RSVPStatus; label: string; labelPlural?: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
    { status: 'Confirmed', label: "I'll Be There", labelPlural: "We'll Be There", icon: PartyPopper, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
    { status: 'Pending', label: 'Still Exploring', labelPlural: 'Still Exploring', icon: Compass, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
    { status: 'Declined', label: "Can't Make It", icon: X, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
];

// ─── Hub Feature Teasers ─────────────────────────────────────────────────────

const HUB_FEATURES = [
    { icon: MessageCircle, title: 'Connect with Guests', description: 'Chat, coordinate plans, and share moments with fellow travelers', gradient: 'from-blue-500/20 to-indigo-500/20' },
    { icon: Hotel, title: 'Reserve Accommodations', description: 'Browse curated hotels and lock in the perfect stay near the action', gradient: 'from-emerald-500/20 to-teal-500/20' },
    { icon: UtensilsCrossed, title: 'Discover Dining', description: 'Explore local restaurants and reserve group tables together', gradient: 'from-orange-500/20 to-amber-500/20' },
    { icon: Plane, title: 'Book Flights & Trains', description: 'Find the best routes to Montpellier and coordinate arrivals', gradient: 'from-sky-500/20 to-cyan-500/20' },
    { icon: Wifi, title: 'Travel eSIMs', description: 'Get data abroad — stay connected without roaming charges', gradient: 'from-violet-500/20 to-purple-500/20' },
    { icon: Map, title: 'Plan Together', description: 'Build group itineraries, split costs, and explore as a crew', gradient: 'from-rose-500/20 to-pink-500/20' },
];

// ─── Weekend Events ──────────────────────────────────────────────────────────

const WEEKEND_EVENTS = [
    {
        id: 'welcome', title: 'Rooftop Sunset Welcome', subtitle: "L'Arbre Blanc Rooftop", day: 'Fri', date: 'Sep 18', time: '7:00 PM', icon: GlassWater,
        description: 'Welcome cocktails and tapas as the sun sets over the Lez.', gradient: 'from-amber-500/5 to-orange-400/5', price: 0,
        inclusions: [
            { icon: Martini, label: 'Cocktails' },
            { icon: UtensilsCrossed, label: 'Tapas' },
            { icon: Eye, label: 'Panoramic Views' },
        ],
        detail: {
            image: '/assets/images/arbre_blanc_bar_1.jpg',
            images: [
                '/assets/images/arbre_blanc_bar_1.jpg',
                '/assets/images/arbre_blanc_bar_2.jpg',
                '/assets/images/arbre_blanc_terrasse.jpg',
                '/assets/images/arbre_blanc_fullscreen.jpg',
                '/assets/images/arbre_blanc_folie.jpg',
            ],
            venue: "L'Arbre Blanc Rooftop",
            address: "Place Christophe Colomb, 34000 Montpellier",
            mapUrl: "https://maps.google.com/?q=L'Arbre+Blanc+Montpellier",
            venueUrl: 'https://larbre-restaurant.fr/le-bar/',
            venueLinkLabel: "About L'Arbre Blanc",
            dressCode: "Smart casual — linen and light layers encouraged",
            overview: "We will kick off the weekend on the 17th floor of Montpellier's most iconic architectural landmark, L'Arbre Blanc. The rooftop terrace offers an exceptional 360° panorama—stretching from the Mediterranean Sea on one side to the foothills Pic St. Loup on the other. As the sun sets, we'll toast to friendship and adventure with signature cocktails, regional wines, and a spread of tapas.",
            schedule: [
                { time: '7:00 PM', item: 'Guests arrive — welcome cocktails on the terrace' },
                { time: '8:00 PM', item: 'Tapas & shared plates begin' },
                { time: '9:00 PM', item: 'Toast & welcome remarks from Bryan' },
                { time: '9:30 PM', item: 'Music, mingling & sunset views' },
                { time: '11:00 PM', item: 'Evening wraps — taxis available' },
            ],
            included: ['Welcome cocktail on arrival', 'Full tapas spread & shared plates', 'Live DJ'],

        }
    },
    {
        id: 'saturday-day', title: 'Afternoon Gathering — TBA', subtitle: 'Details Coming Soon', day: 'Sat', date: 'Sep 19', time: '1:00 PM', icon: Compass,
        description: 'A daytime activity is in the works — stay tuned for details!', gradient: 'from-teal-500/5 to-emerald-400/5', price: 0, locked: true,
        inclusions: [
            { icon: Map, label: 'Explore' },
            { icon: UtensilsCrossed, label: 'Food' },
            { icon: Users, label: 'Group' },
        ],
        detail: {
            venue: 'To Be Announced',
            address: 'Montpellier city centre',
            mapUrl: 'https://maps.google.com/?q=Montpellier',
            dressCode: 'Casual & comfortable',
            overview: "We're planning a fun daytime activity for Saturday afternoon before the main event. Details are still being finalized — check back soon or we'll notify you when plans are confirmed!",
            schedule: [
                { time: '1:00 PM', item: 'Meet up — location TBD' },
                { time: '4:00 PM', item: 'Free time before the evening soirée' },
            ],
            included: ['Details to be confirmed'],
            notes: 'This event is still being planned. We\'ll update you as soon as details are finalized!',
        }
    },
    {
        id: 'gala', title: 'Contemporary Garden Soirée', subtitle: 'MO.CO. Montpellier Contemporain', day: 'Sat', date: 'Sep 19', time: '8:00 PM', icon: Star,
        description: 'A private soirée at Montpellier\'s contemporary art museum to celebrate Bryan\'s 40th.', gradient: 'from-blue-500/5 to-indigo-400/5', price: 50,
        inclusions: [
            { icon: Martini, label: 'Drinks' },
            { icon: Utensils, label: 'Dinner' },
            { icon: Palette, label: 'Art' },
            { icon: Music, label: 'Dancing' },
        ],
        detail: {
            image: 'https://www.moco.art/sites/default/files/styles/full_size/public/2025-05/home4_hdc-gozard_0.png?itok=V5hazeCc',
            images: [
                'https://www.moco.art/sites/default/files/styles/full_size/public/2025-05/home4_hdc-gozard_0.png?itok=V5hazeCc',
                'https://www.moco.art/sites/default/files/styles/full_size/public/2025-02/privatisation_home3.jpg?itok=97EjzPnr',
            ],
            venue: 'MO.CO. Montpellier Contemporain',
            address: '13 Rue de la République, 34000 Montpellier',
            mapUrl: 'https://maps.google.com/?q=MO.CO+Montpellier',
            venueUrl: 'https://www.montpellier-tourisme.fr/decouvrir/artistique-et-culturelle/architecture-contemporaine/le-mo-co-des-lieux-a-decouvrir/',
            venueLinkLabel: 'About MO.CO.',
            dressCode: 'Cocktail attire — dress to impress',
            overview: "Join us for the main event of the weekend: a private soirée to celebrate Bryan's 40th, set in the landscaped garden and terrace of Montpellier's renowned contemporary art museum, MO.CO. We've exclusively reserved this stunning outdoor space and the adjoining historic Salon for an unforgettable evening under the stars. Expect regional wines and a curated cocktail menu by MO.CO.'s in-house restaurant, Faune, as well as a private guided tour of the museum. A live DJ will set the mood, and a photographer will be on hand to capture the celebration all night long.",
            schedule: [
                { time: '8:00 PM', item: 'Doors open — welcome drinks on the terrace & garden' },
                { time: '8:45 PM', item: 'Private guided tour of the current exhibition' },
                { time: '9:30 PM', item: 'Dinner service begins — catering by Faune' },
                { time: '10:30 PM', item: 'Speeches, toasts & surprises' },
                { time: '11:00 PM', item: 'Music & dancing in the Salon' },
                { time: '12:30 AM', item: 'Late-night bites & cocktails' },
                { time: '1:00 AM', item: 'Evening ends' },
            ],
            included: ['Exclusive access to the museum Salon & Gardens', 'A champagne toast & selection of regional wines', 'Abundant hors d\'oeuvres including meat and vegetarian options', 'Local DJ "Bryan Only" (yes, that\'s his name) to set the beat', 'Our own professional photographer to capture every moment'],

        }
    },
    {
        id: 'vineyard', title: 'Pic St. Loup Wine Tour', subtitle: 'With Bertrand Bosc', day: 'Sun', date: 'Sep 20', time: '10:30 AM', icon: Wine,
        description: 'A half-day journey through the Pic Saint-Loup terroir with a local guide.', gradient: 'from-purple-500/5 to-rose-400/5', price: 95, capacity: 25,
        inclusions: [
            { icon: Wine, label: 'Wine' },
            { icon: Utensils, label: 'Lunch' },
            { icon: Map, label: 'Guided Tour' },
        ],
        detail: {
            image: '/assets/images/winetour_1.webp',
            images: [
                '/assets/images/winetour_1.webp',
                '/assets/images/winetour_2.webp',
                '/assets/images/winetour_3.webp',
                '/assets/images/winetour_4.webp',
                '/assets/images/winetour_5.jpg',
            ],
            venue: 'Bertrand Bosc — Pic Saint-Loup Wine Tour',
            address: 'Pickup from central Montpellier (Place de la Comédie)',
            mapUrl: 'https://www.bertrandbosc.guide/en/wine-tour/',
            linkLabel: 'Learn More',
            dressCode: 'Casual & comfortable — wear walking shoes',
            overview: "A personalized half-day road trip through one of the Languedoc's most prestigious appellations, led by local guide Bertrand Bosc. We'll explore two family-run wine estates nestled beneath the dramatic limestone peak of Pic Saint-Loup, stroll through sun-drenched vineyards, wander a medieval village, and sit down for a homemade farm-to-table meal prepared by Bertrand's mother. This tour has received thousands of outstanding reviews, don't miss it!",
            schedule: [
                { time: '10:30 AM', item: 'Pickup from Place de la Comédie in air-conditioned vehicle' },
                { time: '11:15 AM', item: 'Arrive at first domaine — vineyard walk & guided tasting' },
                { time: '12:30 PM', item: 'Visit a local medieval village & second wine estate' },
                { time: '1:30 PM', item: 'Homemade farm-to-table lunch at Bertrand\'s family home' },
                { time: '3:00 PM', item: 'Final tastings & time to purchase wines' },
                { time: '3:30 PM', item: 'Return to Montpellier (~4:00 PM arrival)' },
            ],
            included: ['Round-trip transport from central Montpellier', 'Guided visits to two family wine estates', 'Tastings of 6+ wines across the estates', 'Medieval village walk', 'Homemade farm-to-table lunch with wine pairings'],
            notes: 'Space is limited to 25 guests — first come, first served. The €95 per guest covers transport, all tastings, and lunch. Wear comfortable shoes suitable for vineyard walking.',
        }
    },
];

// ─── Event Detail Modal ──────────────────────────────────────────────────────

interface EventDetailModalProps {
    event: typeof WEEKEND_EVENTS[number] | null;
    onClose: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
    if (!event?.detail) return null;
    const d = event.detail;
    const Icon = event.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center isolate">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden border border-white/10 max-h-[92vh] sm:max-h-[85vh] sm:mx-4"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-all"
                    >
                        <X size={16} />
                    </button>

                    {/* Hero image */}
                    <div className="relative w-full h-48 sm:h-56 shrink-0 overflow-hidden">
                        <img
                            src={d.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-5 right-5">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Icon size={14} className="text-white" />
                                </div>
                                <span className="text-[10px] font-body font-bold uppercase tracking-[0.3em] text-white/70">
                                    {event.day} · {event.date}
                                </span>
                            </div>
                            <h2 className="font-heading text-2xl font-semibold text-white leading-tight">{event.title}</h2>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 space-y-5">
                        {/* Venue & Address */}
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPinned size={16} className="text-med-terracotta" />
                            </div>
                            <div>
                                <p className="text-base font-body font-bold text-med-blue dark:text-white">{d.venue}</p>
                                <p className="text-[12px] font-body text-slate-400 dark:text-gray-500">{d.address}</p>
                                <a
                                    href={d.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-1 text-[11px] font-body font-bold text-med-terracotta hover:underline"
                                >
                                    <MapPin size={10} /> View on Map
                                    <ExternalLink size={8} />
                                </a>
                            </div>
                        </div>

                        {/* Time & Price pills */}
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-gray-800 border border-slate-200/60 dark:border-gray-700">
                                <Clock3 size={11} className="text-med-terracotta" />
                                <span className="text-[11px] font-body font-bold text-med-blue dark:text-white">{event.time}</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${event.price > 0 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200/60 dark:border-purple-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800'}`}>
                                <span className={`text-[11px] font-body font-bold ${event.price > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {event.price > 0 ? `€${event.price} per guest` : 'Included'}
                                </span>
                            </div>
                            {event.capacity && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800">
                                    <Users size={11} className="text-amber-600 dark:text-amber-400" />
                                    <span className="text-[11px] font-body font-bold text-amber-600 dark:text-amber-400">Limited to {event.capacity}</span>
                                </div>
                            )}
                        </div>

                        {/* Overview */}
                        <p className="text-[13px] font-body text-slate-600 dark:text-gray-300 leading-relaxed">
                            {d.overview}
                        </p>

                        {/* Dress Code */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Shirt size={13} className="text-med-terracotta" />
                                <span className="text-[11px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta">Dress Code</span>
                            </div>
                            <p className="text-[13px] font-body text-slate-600 dark:text-gray-300">{d.dressCode}</p>
                        </div>


                        {/* What's Included */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Check size={13} className="text-emerald-500" />
                                <span className="text-[11px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta">What's Included</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1.5">
                                {d.included.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                            <Check size={9} className="text-emerald-500" strokeWidth={3} />
                                        </div>
                                        <span className="text-[12px] font-body text-slate-600 dark:text-gray-300">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        {d.notes && (
                            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/40 dark:border-amber-800/40">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-[12px] font-body text-amber-700 dark:text-amber-300 leading-relaxed">{d.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const TRAVEL_MODES = [
    { value: 'Plane' as const, icon: PlaneTakeoff, label: 'Plane' },
    { value: 'Train' as const, icon: Train, label: 'Train' },
    { value: 'Car' as const, icon: Car, label: 'Car' },
];

// ─── Section Card ────────────────────────────────────────────────────────────

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`bg-[#1e293b]/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] border border-white/10 px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden flex flex-col h-full ${className}`}
    >
        {children}
    </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const EventLandingPage: React.FC = () => {
    const { user, submitRSVP, updateProfile, inviteToParty, removeFromParty, logout } = useUser();
    const { addNotification } = useNotification();

    const cutoff = useCountdown(RSVP_CUTOFF);
    const event = useCountdown(EVENT_DATE);

    const currentStatus = (user?.status as RSVPStatus) || 'Pending';
    const statusConfig = STATUS_CONFIG[currentStatus];
    const StatusIcon = statusConfig.icon;

    // ── RSVP Change State ──
    const [rsvpExpanded, setRsvpExpanded] = useState(false);
    const [isSavingRSVP, setIsSavingRSVP] = useState(false);
    const [rsvpJustSaved, setRsvpJustSaved] = useState(false);
    const [declineNote, setDeclineNote] = useState('');
    const [showDeclineNote, setShowDeclineNote] = useState(false);

    // ── Profile Edit State ──
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingEvents, setIsEditingEvents] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editEmail, setEditEmail] = useState(user?.email || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [editDietary, setEditDietary] = useState(user?.dietary || '');
    const [editNote, setEditNote] = useState(user?.note || '');
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // ── Party Member State ──
    const [addingMember, setAddingMember] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');

    // ── Travel Details State ──
    const [editArrivalDate, setEditArrivalDate] = useState(user?.travelDetails?.arrivalDate || '');
    const [editDepartureDate, setEditDepartureDate] = useState(user?.travelDetails?.departureDate || '');
    const [editArrivalMode, setEditArrivalMode] = useState<'Plane' | 'Train' | 'Car'>(user?.travelDetails?.arrivalMode || 'Plane');
    const [editArrivalNumber, setEditArrivalNumber] = useState(user?.travelDetails?.arrivalNumber || '');
    const [isSavingTravel, setIsSavingTravel] = useState(false);
    const [travelJustSaved, setTravelJustSaved] = useState(false);

    // ── Event Confirmations State ──
    const defaultConfirmations = useMemo(() => {
        const defaults: Record<string, boolean> = {};
        WEEKEND_EVENTS.forEach(e => { defaults[e.id] = true; });
        return defaults;
    }, [currentStatus]);
    const [eventConfirms, setEventConfirms] = useState<Record<string, boolean>>(
        user?.eventConfirmations || defaultConfirmations
    );
    const [isSavingEvents, setIsSavingEvents] = useState(false);
    const [eventsJustSaved, setEventsJustSaved] = useState(false);

    // ── Event Detail Modal State ──
    const [expandedEvent, setExpandedEvent] = useState<string | null>(WEEKEND_EVENTS[0]?.id || null);
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    // ── Getting There Help Request ──
    const [helpRequested, setHelpRequested] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<'Event' | 'RSVP' | 'Destination' | null>(null);
    const toggleDarkMode = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    // ── Welcome Toast (fires once) ──
    const hasWelcomed = useRef(false);
    useEffect(() => {
        if (!hasWelcomed.current && user?.name) {
            const key = `dashboard_welcomed_${user.email}`;
            if (!safeStorage.getItem(key)) {
                setTimeout(() => {
                    addNotification(`Welcome, ${user.name.split(' ')[0]}! You're all set for Bryan's 40th. 🎉`, 'success');
                    safeStorage.setItem(key, 'true');
                }, 800);
            }
            hasWelcomed.current = true;
        }
    }, [user?.name, user?.email, addNotification]);

    // Sync edit fields when user changes
    useEffect(() => {
        if (user) {
            setEditName(user.name);
            setEditEmail(user.email);
            setEditPhone(user.phone || '');
            setEditDietary(user.dietary || '');
            setEditNote(user.note || '');
            setEditArrivalDate(user.travelDetails?.arrivalDate || '');
            setEditDepartureDate(user.travelDetails?.departureDate || '');
            setEditArrivalMode(user.travelDetails?.arrivalMode || 'Plane');
            setEditArrivalNumber(user.travelDetails?.arrivalNumber || '');
            if (user.eventConfirmations) setEventConfirms(user.eventConfirmations);
        }
    }, [user?.name, user?.email, user?.phone, user?.dietary, user?.note, user?.travelDetails, user?.eventConfirmations]);

    // ── RSVP Handlers ──
    const handleRSVPChange = useCallback(async (newStatus: RSVPStatus) => {
        if (newStatus === currentStatus || isSavingRSVP || cutoff.isPast) return;
        setIsSavingRSVP(true);
        try {
            await submitRSVP({ status: newStatus, isConfirmed: newStatus === 'Confirmed' });
            addNotification(
                newStatus === 'Confirmed' ? "You're confirmed! We can't wait to see you." :
                newStatus === 'Declined' ? "Your RSVP has been updated. We'll miss you!" :
                'Your RSVP has been set to still exploring.',
                newStatus === 'Confirmed' ? 'success' : 'info'
            );
            setRsvpJustSaved(true);
            setRsvpExpanded(false);
            setTimeout(() => setRsvpJustSaved(false), 2500);
        } catch {
            addNotification('Failed to update RSVP. Please try again.', 'error');
        } finally {
            setIsSavingRSVP(false);
        }
    }, [currentStatus, isSavingRSVP, cutoff.isPast, submitRSVP, addNotification]);

    // ── Profile Handlers ──
    const handleSaveProfile = useCallback(async () => {
        const errors: Record<string, string> = {};
        if (!isValidName(editName)) errors.name = 'Name must be at least 2 characters.';
        if (!isValidEmail(editEmail)) errors.email = 'Please enter a valid email.';
        setProfileErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSavingProfile(true);
        try {
            await updateProfile({ name: editName, email: editEmail, phone: editPhone, dietary: editDietary, note: editNote });
            addNotification('Profile updated successfully!', 'success');
            setIsEditingProfile(false);
        } catch {
            addNotification('Failed to save profile. Please try again.', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    }, [editName, editEmail, editPhone, editDietary, editNote, updateProfile, addNotification]);

    // ── Party Handlers ──
    const handleAddMember = useCallback(() => {
        if (!newMemberName.trim()) return;
        inviteToParty(newMemberEmail.trim() || `guest-${Date.now()}@party.local`, newMemberName.trim());
        addNotification(`${newMemberName.trim()} added to your party!`, 'success');
        setNewMemberName('');
        setNewMemberEmail('');
        setAddingMember(false);
    }, [newMemberName, newMemberEmail, inviteToParty, addNotification]);

    // ── Travel Handlers ──
    const handleSaveTravel = useCallback(async () => {
        setIsSavingTravel(true);
        try {
            await updateProfile({
                travelDetails: {
                    arrivalDate: editArrivalDate,
                    departureDate: editDepartureDate,
                    arrivalMode: editArrivalMode,
                    arrivalNumber: editArrivalNumber,
                    accommodation: user?.travelDetails?.accommodation || '',
                    hub: user?.travelDetails?.hub,
                },
            });
            addNotification('Travel details saved!', 'success');
            setTravelJustSaved(true);
            setTimeout(() => setTravelJustSaved(false), 2500);
        } catch {
            addNotification('Failed to save travel details.', 'error');
        } finally {
            setIsSavingTravel(false);
        }
    }, [editArrivalDate, editDepartureDate, editArrivalMode, editArrivalNumber, user?.travelDetails, updateProfile, addNotification]);

    // ── Event Confirmation Handlers ──
    const toggleEvent = useCallback((eventId: string) => {
        setEventConfirms(prev => ({ ...prev, [eventId]: !prev[eventId] }));
    }, []);

    const handleSaveEventConfirmations = useCallback(async () => {
        setIsSavingEvents(true);
        try {
            await updateProfile({ eventConfirmations: eventConfirms });
            addNotification('Event selections saved!', 'success');
            setEventsJustSaved(true);
            setTimeout(() => setEventsJustSaved(false), 2500);
        } catch {
            addNotification('Failed to save event selections.', 'error');
        } finally {
            setIsSavingEvents(false);
        }
    }, [eventConfirms, updateProfile, addNotification]);

    const nonPrimaryMembers = useMemo(() =>
        (user?.partyMembers || []).filter(m => !m.isPrimary),
        [user?.partyMembers]
    );

    // Parse coupled names like "Brian & Daniela Johnson" into two distinct guests
    const parsedCouple = useMemo(() => {
        const name = user?.name || '';
        const coupleMatch = name.match(/^(.+?)\s+[&]\s+(.+?)\s+(\S+)$/i)
            || name.match(/^(.+?)\s+and\s+(.+?)\s+(\S+)$/i);
        if (coupleMatch) {
            return {
                isCouple: true,
                primary: `${coupleMatch[1]} ${coupleMatch[3]}`,
                secondary: `${coupleMatch[2]} ${coupleMatch[3]}`,
            };
        }
        return { isCouple: false, primary: name || 'You', secondary: null };
    }, [user?.name]);

    // Determine the displayed primary name — respects isPrimary flag from party or onboarding
    const displayPrimary = useMemo(() => {
        const primaryMember = (user?.partyMembers || []).find(m => m.isPrimary);
        if (primaryMember) return primaryMember.name;
        return parsedCouple.primary;
    }, [user?.partyMembers, parsedCouple]);

    const selectableEvents = useMemo(() =>
        WEEKEND_EVENTS.filter(evt => !(evt as any).locked),
        []
    );

    const attendingCount = useMemo(() =>
        selectableEvents.filter(evt => eventConfirms[evt.id] ?? true).length,
        [eventConfirms, selectableEvents]
    );

    const totalEventCost = useMemo(() => {
        const guestCount = parsedCouple.isCouple ? 2 : 1;
        return selectableEvents
            .filter(evt => eventConfirms[evt.id] ?? true)
            .reduce((sum, evt) => sum + (evt.price * guestCount), 0);
    }, [eventConfirms, parsedCouple, selectableEvents]);

    return (
        <div className="fixed inset-0 z-[100] flex w-full h-full overflow-hidden bg-med-sand dark:bg-[#111827] transition-colors duration-500">
            {/* Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
                .font-heading { font-family: 'Cormorant Garamond', serif; }
                .font-body    { font-family: 'Montserrat', sans-serif; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>


            <Blobs />

            {/* ────── Pane 1 (Master Navigation) ────── */}
            <motion.div
                animate={{
                    width: activeModal ? '25%' : '100%',
                    opacity: activeModal ? 0.4 : 1,
                    scale: activeModal ? 0.95 : 1
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full overflow-y-auto shrink-0 relative z-10 transition-all cursor-${activeModal ? 'pointer' : 'auto'}`}
                onClick={() => { if (activeModal) setActiveModal(null); }}
            >
                {activeModal && (
                    <div className="absolute inset-0 z-[60] bg-transparent" title="Tap to go back" />
                )}


            {/* ────── Sticky Header ────── */}
            <UnifiedHeader 
                appMenuItems={[
                    { label: isDark ? 'Light Mode' : 'Dark Mode', icon: isDark ? Sun : Moon, onClick: toggleDarkMode },
                    { label: 'Reload App', icon: RefreshCw, onClick: () => { localStorage.clear(); window.location.reload(); } },
                    { label: 'Sign Out', icon: LogOut, onClick: logout, danger: true }
                ]}
            />

            {/* ────── Main Content ────── */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 pb-16 pt-6 space-y-6">

                {/* ────── Welcome Header ────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center py-8"
                >

                    <h1
                        className="font-heading font-light text-med-blue dark:text-blue-100 leading-[0.95] tracking-tight"
                        style={{ fontSize: 'clamp(2.8rem, 10vw, 4.2rem)' }}
                    >
                        Bienvenue, <br />
                        <span className="italic text-med-terracotta dark:text-[#C25E3E]">{displayPrimary?.split(' ')[0] || 'Voyager'}.</span>
                    </h1>

                    {/* Dashboard Tiles */}
                    <div className="flex flex-col gap-4 mt-8 w-full max-w-lg mx-auto">
                        <button onClick={() => setActiveModal('RSVP')} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/70 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg hover:border-med-terracotta/40 transition-all text-left group">
                            <div className={`w-14 h-14 rounded-full ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <StatusIcon size={24} className={statusConfig.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-xl font-bold text-med-blue dark:text-white">Your RSVP</h3>
                                <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">{statusConfig.label}</p>
                                <p className="text-[11px] font-body font-bold text-med-terracotta mt-1">Party of {parsedCouple.isCouple ? 2 + nonPrimaryMembers.length : 1 + nonPrimaryMembers.length}</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors" />
                        </button>

                        <button onClick={() => setActiveModal('Event')} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/70 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg hover:border-med-terracotta/40 transition-all text-left group">
                            <div className="w-14 h-14 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Calendar size={24} className="text-med-terracotta" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-xl font-bold text-med-blue dark:text-white">The Event</h3>
                                <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">Bryan's 40th • Sep 18–20, 2026</p>
                                <p className="text-[11px] font-body font-bold text-med-terracotta mt-1">{attendingCount} events attending</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors" />
                        </button>

                        <button onClick={() => setActiveModal('Destination')} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/70 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg hover:border-med-terracotta/40 transition-all text-left group">
                            <div className="w-14 h-14 rounded-full bg-med-blue/10 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <MapPin size={24} className="text-med-blue dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-xl font-bold text-med-blue dark:text-white">The Destination</h3>
                                <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">Montpellier, France</p>
                                <p className="text-[11px] font-body font-bold text-med-blue dark:text-blue-400 mt-1">Travel & Accommodation</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors" />
                        </button>
                    </div>
                </motion.div>
            </div>
            </motion.div>

            {/* ────── Pane 2 (Detail View) ────── */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-0 bottom-0 w-[90%] md:w-[75%] lg:w-[75%] dark bg-[#1a202c] shadow-[-20px_0_40px_rgba(0,0,0,0.4)] rounded-l-[2.5rem] border-l border-white/10 z-20 overflow-hidden flex flex-col"
                    >
                        {/* Drag Handle for mobile dismiss */}
                        <div className="md:hidden absolute left-2 top-0 bottom-0 w-8 flex items-center justify-center opacity-50 z-30" onClick={() => setActiveModal(null)}>
                            <div className="w-1.5 h-16 bg-white/20 rounded-full" />
                        </div>
                        
                        {/* Elegant Header */}
                        <div className="sticky top-0 z-20 bg-[#1a202c]/90 backdrop-blur-md px-8 py-6 flex items-center justify-between border-b border-white/5">
                            <h2 className="font-heading text-3xl font-bold text-white tracking-tight">
                                {activeModal === 'RSVP' && 'Your RSVP & Party'}
                                {activeModal === 'Event' && 'The Event'}
                                {activeModal === 'Destination' && 'The Destination'}
                            </h2>
                            {/* Removed the X button to rely on spatial navigation */}
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 space-y-8 scrollbar-hide text-white">

                {activeModal === 'RSVP' && (
                <>
                {/* ══════════════════════════════════════════════════════════════
                    SECTION 1: RSVP STATUS + CHANGE TOOL
                ══════════════════════════════════════════════════════════════ */}
                <SectionCard>

                    <Eyebrow label="Your RSVP" onEdit={() => setRsvpExpanded(!rsvpExpanded)} isEditing={rsvpExpanded} editLabel="Edit RSVP" />

                    {/* Status display */}
                    <div className="my-auto">
                    <div className="flex items-center gap-4 mb-5">
                        <div className={`w-14 h-14 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center shadow-inner shrink-0`}>
                            <StatusIcon size={24} className={statusConfig.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-heading text-2xl font-medium ${statusConfig.color}`}>{statusConfig.label}</h3>
                            <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">{statusConfig.description}</p>
                        </div>
                        {rsvpJustSaved && (
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shrink-0"
                            >
                                <Check size={16} strokeWidth={3} />
                            </motion.div>
                        )}
                    </div>

                    {/* Summary stats */}
                    <div className="flex flex-wrap gap-3 mb-5">
                        {(user?.partyMembers || []).length > 1 && (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-med-sand/60 dark:bg-gray-800/40 rounded-xl">
                                <Users size={14} className="text-slate-400" />
                                <span className="text-sm font-body font-bold text-med-blue dark:text-white">{(user?.partyMembers || []).length} guests</span>
                                <span className="text-[10px] font-body text-slate-400 uppercase tracking-wider">confirmed</span>
                            </div>
                        )}

                    </div>

                    </div>

                    {/* Change RSVP toggle */}
                    <div className="mt-auto pt-4 w-full">
                    {!cutoff.isPast && rsvpExpanded && (
                        <>
                            <button
                                onClick={() => setRsvpExpanded(!rsvpExpanded)}
                                disabled={isSavingRSVP}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-body font-bold uppercase tracking-[0.2em] transition-all duration-300 group bg-slate-200 dark:bg-gray-700 text-slate-600 dark:text-gray-300`}
                            >
                                {isSavingRSVP ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        Cancel
                                        <ChevronDown size={14} className="transition-transform duration-300 rotate-180" />
                                    </>
                                )}
                            </button>

                            <AnimatePresence>
                                {rsvpExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="space-y-3 overflow-hidden pt-4"
                                    >
                                        {RSVP_OPTIONS.filter(o => o.status !== currentStatus).map((option) => {
                                            const Icon = option.icon;
                                            const isMultiGuest = (user?.partyMembers || []).length > 1;
                                            const displayLabel = option.status === 'Confirmed' && isMultiGuest ? (option.labelPlural || option.label) : option.label;
                                            return (
                                                <motion.button
                                                    key={option.status}
                                                    initial={{ opacity: 0, x: -16 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: option.status === 'Confirmed' ? 0 : 0.08 }}
                                                    onClick={() => {
                                                        if (option.status === 'Declined') {
                                                            setShowDeclineNote(true);
                                                        } else {
                                                            setShowDeclineNote(false);
                                                            handleRSVPChange(option.status);
                                                        }
                                                    }}
                                                    disabled={isSavingRSVP}
                                                    className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] border-2 ${option.border} ${option.bg} hover:shadow-lg transition-all duration-300 group text-left active:scale-[0.98]`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl ${option.bg} border ${option.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                                        <Icon size={22} className={option.color} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={`font-heading text-lg ${option.color}`}>{displayLabel}</h4>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full border-2 ${option.border} flex items-center justify-center shrink-0`}>
                                                        <Check size={14} className={`${option.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}

                                        {/* Decline Note */}
                                        <AnimatePresence>
                                            {showDeclineNote && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 rounded-[1.5rem] border-2 border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 space-y-3">
                                                        <p className="text-xs font-body text-slate-500 dark:text-gray-400 leading-relaxed">
                                                            We're sorry to hear that! Want to send a note to the host?
                                                        </p>
                                                        <textarea
                                                            value={declineNote}
                                                            onChange={e => setDeclineNote(e.target.value)}
                                                            placeholder="Optional — share a message with the host..."
                                                            rows={3}
                                                            className="w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 text-sm font-body text-med-blue dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 outline-none focus:border-red-400 transition-colors resize-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => { setShowDeclineNote(false); setDeclineNote(''); }}
                                                                className="flex-1 py-2.5 rounded-xl text-[10px] font-body font-bold uppercase tracking-[0.2em] text-slate-400 border border-slate-200 dark:border-gray-700 hover:border-slate-300 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (declineNote.trim()) {
                                                                        await updateProfile({ declineNote: declineNote.trim() });
                                                                    }
                                                                    setShowDeclineNote(false);
                                                                    handleRSVPChange('Declined');
                                                                }}
                                                                disabled={isSavingRSVP}
                                                                className="flex-1 py-2.5 rounded-xl text-[10px] font-body font-bold uppercase tracking-[0.2em] text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-40"
                                                            >
                                                                {declineNote.trim() ? 'Send & Decline' : 'Confirm Decline'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                    </div>
                    {/* ── Details & Party (visible when editing) ── */}
                    <AnimatePresence>
                        {rsvpExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.35 }}
                                className="overflow-hidden"
                            >
                                {/* ── Your Details ── */}
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800">
                                    <Eyebrow label="Your Details" onEdit={() => setIsEditingProfile(!isEditingProfile)} isEditing={isEditingProfile} editLabel="Edit Details" />

                                    <AnimatePresence mode="wait">
                                        {!isEditingProfile ? (
                                            <motion.div
                                                key="view"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {/* Profile summary */}
                                                <div className="space-y-3 mb-4">
                                                    {[
                                                        { icon: User, label: 'Name', value: user?.name },
                                                        { icon: Mail, label: 'Email', value: user?.email },
                                                        { icon: Phone, label: 'Phone / WhatsApp', value: user?.phone || 'Not provided' },
                                                    ].map(({ icon: Icon, label, value }) => (
                                                        <div key={label} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                                                <Icon size={14} className="text-med-terracotta" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[10px] font-body text-slate-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
                                                                <p className="text-base font-body font-semibold text-med-blue dark:text-white truncate">{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="edit"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-4"
                                            >
                                                {/* Editable fields */}
                                                {[
                                                    { label: 'Full Name', icon: User, value: editName, setter: setEditName, type: 'text', error: profileErrors.name, placeholder: 'Your name' },
                                                    { label: 'Email', icon: Mail, value: editEmail, setter: setEditEmail, type: 'email', error: profileErrors.email, placeholder: 'email@example.com' },
                                                    { label: 'Phone / WhatsApp (Optional)', icon: Phone, value: editPhone, setter: setEditPhone, type: 'tel', error: undefined, placeholder: '+1 (555) 000-0000' },
                                                ].map(({ label, icon: Icon, value, setter, type, error, placeholder }) => (
                                                    <div key={label} className="space-y-1">
                                                        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                                            <Icon size={10} /> {label}
                                                        </label>
                                                        <input
                                                            type={type}
                                                            value={value}
                                                            onChange={e => setter(e.target.value)}
                                                            placeholder={placeholder}
                                                            className={`w-full bg-transparent border-b-2 ${error ? 'border-red-400' : 'border-slate-100 dark:border-gray-800 focus:border-med-terracotta'} px-1 py-3 text-base font-body font-medium text-med-blue dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 placeholder:text-base`}
                                                        />
                                                        {error && <p className="text-red-400 text-[11px] font-body font-bold uppercase tracking-wider">{error}</p>}
                                                    </div>
                                                ))}

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => { setIsEditingProfile(false); setProfileErrors({}); }}
                                                        className="flex-1 h-11 rounded-full border border-slate-200 dark:border-gray-700 text-[11px] font-body font-bold uppercase tracking-wider text-slate-400 hover:text-med-blue transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={isSavingProfile}
                                                        className="flex-1 h-11 rounded-full bg-med-terracotta text-white text-[11px] font-body font-bold uppercase tracking-wider disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ── Your Party ── */}
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <Eyebrow label="Your Party" />
                                        <span className="text-[11px] font-body text-slate-400 dark:text-gray-500 font-bold">
                                            {(() => {
                                                const primaryCount = parsedCouple.isCouple ? 2 : 1;
                                                const total = primaryCount + nonPrimaryMembers.length;
                                                return `${total} guest${total !== 1 ? 's' : ''}`;
                                            })()}
                                        </span>
                                    </div>

                                    {/* Primary guest */}
                                    <div className="flex items-center gap-3 py-3 px-4 rounded-[1.5rem] bg-med-terracotta/8 dark:bg-med-terracotta/10 border border-med-terracotta/20 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-med-terracotta/20 flex items-center justify-center shrink-0">
                                            <User size={14} className="text-med-terracotta" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-body font-semibold text-med-blue dark:text-white truncate">
                                                {displayPrimary} <span className="font-normal text-med-terracotta text-sm">(primary)</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Secondary guest for couples */}
                                    {parsedCouple.isCouple && parsedCouple.secondary && (
                                        <div className="flex items-center gap-3 py-3 px-4 rounded-[1.5rem] bg-med-terracotta/8 dark:bg-med-terracotta/10 border border-med-terracotta/20 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-med-terracotta/20 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-med-terracotta" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-body font-semibold text-med-blue dark:text-white truncate">
                                                    {parsedCouple.secondary} <span className="font-normal text-med-terracotta text-sm">(partner)</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Party members */}
                                    <AnimatePresence>
                                        {nonPrimaryMembers.map((m) => (
                                            <motion.div
                                                key={m.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-3 py-3 px-4 rounded-[1.5rem] bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 mb-2 overflow-hidden"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-med-blue/10 flex items-center justify-center shrink-0">
                                                    <User size={14} className="text-med-blue/60 dark:text-blue-300" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-body font-medium text-med-blue dark:text-white truncate">{m.name}</p>
                                                    {m.email && !m.email.includes('@party.local') && (
                                                        <p className="text-[11px] font-body text-slate-400 dark:text-gray-500 truncate">{m.email}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const updatedParty = (user?.partyMembers || []).map(p => ({
                                                            ...p,
                                                            isPrimary: p.id === m.id,
                                                        }));
                                                        submitRSVP({ partyMembers: updatedParty } as any);
                                                        addNotification(`${m.name} is now the primary guest.`, 'success');
                                                    }}
                                                    className="w-7 h-7 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center justify-center text-slate-300 hover:text-amber-500 transition-colors shrink-0"
                                                    title="Make primary guest"
                                                >
                                                    <Star size={13} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        removeFromParty(m.id);
                                                        addNotification(`${m.name} removed from your party.`, 'info');
                                                    }}
                                                    className="w-7 h-7 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors shrink-0"
                                                    title="Remove from party"
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
                                                    <p className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta">Add Guest</p>
                                                    <input
                                                        type="text"
                                                        placeholder="Full name"
                                                        value={newMemberName}
                                                        onChange={e => setNewMemberName(e.target.value)}
                                                        autoFocus
                                                        className="w-full bg-transparent border-b border-slate-100 dark:border-gray-700 py-2 text-base font-body text-med-blue dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email (optional)"
                                                        value={newMemberEmail}
                                                        onChange={e => setNewMemberEmail(e.target.value)}
                                                        className="w-full bg-transparent border-b border-slate-100 dark:border-gray-700 py-2 text-base font-body text-med-blue dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                                    />
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            onClick={() => { setAddingMember(false); setNewMemberName(''); setNewMemberEmail(''); }}
                                                            className="flex-1 h-10 rounded-full border border-slate-200 dark:border-gray-700 text-[11px] font-body font-bold uppercase tracking-wider text-slate-400 hover:text-med-blue transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleAddMember}
                                                            disabled={!newMemberName.trim()}
                                                            className="flex-1 h-10 rounded-full bg-med-terracotta text-white text-[11px] font-body font-bold uppercase tracking-wider disabled:opacity-40 transition-all active:scale-95"
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
                                                className="w-full mt-3 h-12 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-gray-700 hover:border-med-terracotta/40 flex items-center justify-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-gray-500 hover:text-med-terracotta transition-all"
                                            >
                                                <Plus size={13} /> Add Guest to Party
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </SectionCard>
                </>
                )}

                {activeModal === 'Event' && (
                <>
                <SectionCard>


                    <Eyebrow label="Events You're Attending" onEdit={() => setIsEditingEvents(!isEditingEvents)} isEditing={isEditingEvents} editLabel="Update Attendance" />

                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical connector line — hidden when details expanded */}
                        {!expandedEvent && <div className="absolute left-[27px] top-6 bottom-6 w-px bg-slate-100 dark:bg-gray-800" />}

                        <div className="space-y-3">
                            {WEEKEND_EVENTS.map((evt, i) => {
                                const Icon = evt.icon;
                                const isAttending = eventConfirms[evt.id] ?? true;
                                const isLocked = !!(evt as any).locked;
                                return (
                                    <React.Fragment key={evt.id}>
                                    <motion.button
                                        initial={{ opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.06 }}
                                        onClick={() => isLocked ? undefined : (isEditingEvents ? toggleEvent(evt.id) : setExpandedEvent(expandedEvent === evt.id ? null : evt.id))}
                                        disabled={isLocked}
                                        className={`w-full flex items-start gap-4 p-4 rounded-[1.5rem] border transition-all duration-300 text-left relative ${
                                            isLocked
                                                ? 'border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 opacity-50 cursor-default'
                                                : isAttending
                                                    ? `border-slate-200 dark:border-gray-700 bg-gradient-to-br ${evt.gradient} active:scale-[0.98]`
                                                    : 'border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 opacity-60 active:scale-[0.98]'
                                        }`}
                                    >
                                        {/* Chevron toggle */}
                                        {!isLocked && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedEvent(expandedEvent === evt.id ? null : evt.id); }}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 border border-slate-200/60 dark:border-gray-700 text-slate-400 hover:text-med-terracotta hover:border-med-terracotta/40 transition-all shadow-sm"
                                                title="View event details"
                                            >
                                                <span className="text-[9px] font-body font-bold uppercase tracking-wider">Details</span>
                                                <ChevronDown size={12} className={`transition-transform duration-300 ${expandedEvent === evt.id ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>
                                        )}
                                        {/* Timeline dot */}
                                        <div className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 mt-1 transition-all ${
                                            isLocked
                                                ? 'bg-slate-200 dark:bg-gray-700'
                                                : isAttending
                                                    ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                                                    : 'bg-slate-200 dark:bg-gray-700'
                                        }`}>
                                            {isLocked
                                                ? <Clock size={10} className="text-slate-400 dark:text-gray-500" />
                                                : isAttending
                                                    ? <Check size={12} className="text-white" strokeWidth={3} />
                                                    : <X size={10} className="text-slate-400 dark:text-gray-500" />
                                            }
                                        </div>

                                        {/* Calendar Badge */}
                                        <div className={`shrink-0 w-14 rounded-xl overflow-hidden border transition-all ${
                                            isAttending
                                                ? 'border-slate-200/80 dark:border-gray-700 shadow-sm'
                                                : 'border-slate-100 dark:border-gray-800 opacity-50'
                                        }`}>
                                            <div className={`text-[8px] font-body font-bold uppercase tracking-widest text-center py-0.5 ${
                                                isAttending
                                                    ? 'bg-med-terracotta text-white'
                                                    : 'bg-slate-300 dark:bg-gray-600 text-white'
                                            }`}>
                                                {evt.day}
                                            </div>
                                            <div className={`text-center py-1 ${
                                                isAttending
                                                    ? 'bg-white dark:bg-gray-800'
                                                    : 'bg-slate-50 dark:bg-gray-800/50'
                                            }`}>
                                                <div className={`text-base font-heading font-bold leading-none ${
                                                    isAttending ? 'text-med-blue dark:text-white' : 'text-slate-400 dark:text-gray-500'
                                                }`}>
                                                    {evt.date.split(' ')[1]}
                                                </div>
                                                <div className={`text-[8px] font-body font-semibold uppercase tracking-wider mt-0.5 ${
                                                    isAttending ? 'text-slate-400 dark:text-gray-500' : 'text-slate-300 dark:text-gray-600'
                                                }`}>
                                                    {evt.time}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-heading text-lg font-medium leading-tight transition-colors ${
                                                isAttending ? 'text-med-blue dark:text-white' : 'text-slate-400 dark:text-gray-500'
                                            }`}>
                                                {evt.title}
                                            </h4>


                                            {evt.inclusions && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {evt.inclusions.map((inc: any, idx: number) => {
                                                        const IncIcon = inc.icon;
                                                        return (
                                                            <span key={idx} className={`inline-flex items-center gap-1 text-[9px] font-body font-semibold uppercase tracking-wider px-2 py-1 rounded-full transition-colors ${isAttending ? 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400' : 'bg-slate-50 dark:bg-gray-800/50 text-slate-300 dark:text-gray-600'}`}>
                                                                <IncIcon size={10} />
                                                                {inc.label}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                    </motion.button>

                                    {/* Accordion Detail */}
                                    <AnimatePresence>
                                        {expandedEvent === evt.id && evt.detail && (() => {
                                            const d = evt.detail;
                                            return (
                                                <motion.div
                                                    key={`detail-${evt.id}`}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                                    className="overflow-hidden -mt-1"
                                                >
                                                    <div className="mx-2 mb-2 px-5 py-5 rounded-b-[1.5rem] bg-white dark:bg-gray-900 border-2 border-t-0 border-slate-100 dark:border-gray-800 space-y-4">
                                                        {/* Hero image(s) */}
                                                        {d.images ? (
                                                            <div className="relative w-full overflow-hidden rounded-2xl group">
                                                                <div
                                                                    id={`gallery-${evt.id}`}
                                                                    className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
                                                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
                                                                >
                                                                    {d.images.map((img: string, imgIdx: number) => (
                                                                        <div key={imgIdx} className="relative w-[85%] h-36 rounded-2xl overflow-hidden shrink-0 snap-center first:ml-0">
                                                                            <img src={img} alt={`${evt.title} ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {/* Left Arrow */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); const el = document.getElementById(`gallery-${evt.id}`); if (el) el.scrollBy({ left: -el.offsetWidth * 0.85, behavior: 'smooth' }); }}
                                                                    className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center text-slate-500 hover:text-med-terracotta transition-all opacity-0 group-hover:opacity-100 z-10"
                                                                >
                                                                    <ChevronLeft size={16} />
                                                                </button>
                                                                {/* Right Arrow */}
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); const el = document.getElementById(`gallery-${evt.id}`); if (el) el.scrollBy({ left: el.offsetWidth * 0.85, behavior: 'smooth' }); }}
                                                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center text-slate-500 hover:text-med-terracotta transition-all opacity-0 group-hover:opacity-100 z-10"
                                                                >
                                                                    <ChevronRight size={16} />
                                                                </button>
                                                                <div className="flex justify-center gap-1 mt-1">
                                                                    {d.images.map((_: string, dotIdx: number) => (
                                                                        <div key={dotIdx} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600" />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="relative w-full h-36 rounded-2xl overflow-hidden">
                                                                <img src={d.image} alt={evt.title} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                            </div>
                                                        )}

                                                        {/* Venue */}
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                                                                <MapPinned size={14} className="text-med-terracotta" />
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-body font-bold text-med-blue dark:text-white">{d.venue}</p>
                                                                <p className="text-[11px] font-body text-slate-400 dark:text-gray-500">{d.address}</p>
                                                                <a href={d.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 text-[11px] font-body font-bold text-med-terracotta hover:underline">
                                                                    <MapPin size={10} /> {d.linkLabel || 'View on Map'} <ExternalLink size={8} />
                                                                </a>
                                                                {(d as any).venueUrl && (
                                                                    <a href={(d as any).venueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 ml-3 text-[11px] font-body font-bold text-med-blue hover:underline">
                                                                        {(d as any).venueLinkLabel || 'Learn More'} <ExternalLink size={8} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Overview */}
                                                        <p className="text-[12px] font-body text-slate-600 dark:text-gray-300 leading-relaxed">{d.overview}</p>

                                                        {/* Cost & What's Included */}
                                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700/50 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0">
                                                                        <Wallet size={14} className="text-med-terracotta" />
                                                                    </div>
                                                                    <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta">Cost per guest</p>
                                                                </div>
                                                                <p className="text-lg font-body font-bold text-med-blue dark:text-white">{evt.price > 0 ? `€${evt.price}` : '€0'}</p>
                                                            </div>
                                                            <div className="border-t border-slate-100 dark:border-gray-700/50 pt-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Check size={12} className="text-med-terracotta" />
                                                                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta">What's Included</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {d.included.map((item, idx) => (
                                                                        <div key={idx} className="flex items-center gap-2">
                                                                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                                                                <Check size={8} className="text-emerald-500" strokeWidth={3} />
                                                                            </div>
                                                                            {typeof item === 'object' && item.link ? (
                                                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[11px] font-body text-med-terracotta hover:underline inline-flex items-center gap-1">
                                                                                    {item.text} <ExternalLink size={8} />
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-[11px] font-body text-slate-600 dark:text-gray-300">{typeof item === 'string' ? item : item.text}</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Notes */}
                                                        {d.notes && (
                                                            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/40 dark:border-amber-800/40">
                                                                <div className="flex items-start gap-2">
                                                                    <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                                                                    <p className="text-[11px] font-body text-amber-700 dark:text-amber-300 leading-relaxed">{d.notes}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}
                                    </AnimatePresence>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    {isEditingEvents && (
                        <button
                            onClick={handleSaveEventConfirmations}
                            disabled={isSavingEvents}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[11px] font-body font-bold uppercase tracking-[0.2em] transition-all duration-300 bg-white dark:bg-gray-800 text-med-blue dark:text-white border border-slate-200 dark:border-gray-700 hover:border-med-terracotta hover:text-med-terracotta shadow-sm hover:shadow-md disabled:opacity-40 active:scale-95 mt-6"
                        >
                            {isSavingEvents ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : eventsJustSaved ? (
                                <><Check size={14} strokeWidth={3} /> Saved!</>
                            ) : (
                                'Update Attendance'
                            )}
                        </button>
                    )}
                </SectionCard>


                {/* HIDDEN: Your Travel section (preserved for future use) */}
                {false && (<>
                <SectionCard>
                    <Eyebrow label="Your Travel" />

                    <p className="text-base font-body text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
                        Help us coordinate arrivals and plan logistics by sharing your travel dates.
                    </p>

                    {/* Arrival / Departure Dates */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                <CalendarDays size={10} /> Arrival
                            </label>
                            <input
                                type="date"
                                value={editArrivalDate}
                                onChange={e => setEditArrivalDate(e.target.value)}
                                min="2026-09-15"
                                max="2026-09-20"
                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta px-1 py-2.5 text-base font-body font-medium text-med-blue dark:text-white outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                                <CalendarDays size={10} /> Departure
                            </label>
                            <input
                                type="date"
                                value={editDepartureDate}
                                onChange={e => setEditDepartureDate(e.target.value)}
                                min="2026-09-17"
                                max="2026-09-25"
                                className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta px-1 py-2.5 text-base font-body font-medium text-med-blue dark:text-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Travel Mode */}
                    <div className="mb-5">
                        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta mb-3 block">
                            How are you arriving?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {TRAVEL_MODES.map(mode => {
                                const Icon = mode.icon;
                                const isActive = editArrivalMode === mode.value;
                                return (
                                    <button
                                        key={mode.value}
                                        onClick={() => setEditArrivalMode(mode.value)}
                                        className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200 ${
                                            isActive
                                                ? 'border-med-terracotta bg-med-terracotta/10 shadow-sm'
                                                : 'border-slate-100 dark:border-gray-700 hover:border-med-terracotta/30'
                                        }`}
                                    >
                                        <Icon size={20} className={isActive ? 'text-med-terracotta' : 'text-slate-400 dark:text-gray-500'} />
                                        <span className={`text-[11px] font-body font-bold uppercase tracking-wider ${isActive ? 'text-med-terracotta' : 'text-slate-400 dark:text-gray-500'}`}>
                                            {mode.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Flight / Train Number */}
                    <div className="space-y-1.5 mb-6">
                        <label className="text-[11px] font-body font-bold uppercase tracking-[0.3em] text-med-terracotta flex items-center gap-2">
                            {editArrivalMode === 'Car' ? <Car size={10} /> : editArrivalMode === 'Train' ? <Train size={10} /> : <PlaneTakeoff size={10} />}
                            {editArrivalMode === 'Car' ? 'Route / Notes' : `${editArrivalMode === 'Train' ? 'Train' : 'Flight'} Number (Optional)`}
                        </label>
                        <input
                            type="text"
                            value={editArrivalNumber}
                            onChange={e => setEditArrivalNumber(e.target.value)}
                            placeholder={editArrivalMode === 'Car' ? 'e.g. Driving from Barcelona' : editArrivalMode === 'Train' ? 'e.g. TGV 6235' : 'e.g. AF 7650'}
                            className="w-full bg-transparent border-b-2 border-slate-100 dark:border-gray-800 focus:border-med-terracotta px-1 py-2.5 text-base font-body font-medium text-med-blue dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700 placeholder:text-base"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveTravel}
                        disabled={isSavingTravel}
                        className="w-full h-12 rounded-full bg-med-terracotta text-white text-[11px] font-body font-bold uppercase tracking-[0.2em] disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-med-terracotta/20"
                    >
                        {isSavingTravel ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : travelJustSaved ? (
                            <><Check size={14} strokeWidth={3} /> Saved!</>
                        ) : (
                            'Save Travel Details'
                        )}
                    </button>
                </SectionCard>
                </>)}
                {/* END HIDDEN: Your Travel section */}
                </>
                )}

                {activeModal === 'Destination' && (
                <>
                {currentStatus !== 'Declined' && (<>
                <SectionCard>
                    <Eyebrow label="Getting There" rightContent={
                        <button
                            onClick={() => {
                                if (!helpRequested) {
                                    setShowHelpModal(true);
                                    setHelpRequested(true);
                                }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider transition-all ${
                                helpRequested
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-default'
                                    : 'bg-med-terracotta/10 text-med-terracotta hover:bg-med-terracotta/20 active:scale-95 cursor-pointer'
                            }`}
                        >
                            {helpRequested ? 'Help Requested' : 'Request Help'}
                            {helpRequested ? <Check size={10} /> : <HelpCircle size={10} />}
                        </button>
                    } />

                    <div className="space-y-3">

                        {[
                            {
                                id: 'mpl',
                                icon: MapPin,
                                title: 'Direct to Montpellier (MPL)',
                                badge: 'Fastest & Easiest',
                                preview: 'Fly directly into Montpellier (MPL) for the quickest and easiest arrival.',
                                detail: <>The airport is well-connected to major European hubs like London, Amsterdam, Paris, and Madrid, making layovers a breeze no matter where you are flying from. Once you land, you are incredibly close to the action, grab an Uber or taxi right outside the terminal—you'll be at your hotel or Airbnb in the city center in just <span className="font-semibold text-med-blue dark:text-white">15 minutes</span>.</>,
                                links: [
                                    { href: 'https://www.google.com/travel/flights?q=Flights+to+Montpellier', icon: Plane, label: 'Search Flights' },
                                ],
                            },
                            {
                                id: 'cdg',
                                icon: PlaneTakeoff,
                                title: 'Via Paris (CDG)',
                                badge: 'Seamless Air-to-Rail Transfer',
                                preview: 'Fly into Paris and effortlessly transfer from your plane to the train in the same terminal. Watch the French countryside change from rolling green hills to sun soaked Mediterranean beaches on the 3.5 hour ride.',
                                detail: <>For the smoothest trip, book a direct TGV or OUIGO train from the airport station (Aéroport Charles de Gaulle 2 TGV) to Montpellier St-Roch or Montpellier Sud de France. The ride takes about <span className="font-semibold text-med-blue dark:text-white">3.5 to 4 hours</span>. IMPORTANT: Ensure your route is direct from the airport station to avoid a stressful transfer from the airport to central Paris.</>,
                                links: [
                                    { href: 'https://www.google.com/travel/flights?q=Flights+to+Paris', icon: Plane, label: 'Search Flights' },
                                    { href: 'https://www.thetrainline.com/', icon: Train, label: 'Find Train' },
                                ],
                            },
                            {
                                id: 'bcn',
                                icon: Train,
                                title: 'Via Barcelona (BCN)',
                                badge: 'Scenic Coastal Ride',
                                preview: 'Transit via Barcelona and marvel at the Mediterranean as your train winds between mountainous cliffs and sandy beaches for the short 3 hour journey.',
                                detail: <>Catch the local Renfe (Rodalies) commuter train from Terminal 2 directly to Barcelona Sants Station. From there, board your high-speed train to Montpellier Saint-Roch or Montpellier Sud de France. The highly scenic ride along the Mediterranean coast takes about <span className="font-semibold text-med-blue dark:text-white">3 hours</span>. NOTE: If your flight lands at Terminal 1, don't sweat it—just hop on the free airport shuttle bus over to Terminal 2 to catch your commuter train.</>,
                                links: [
                                    { href: 'https://www.google.com/travel/flights?q=Flights+to+Barcelona', icon: Plane, label: 'Search Flights' },
                                    { href: 'https://www.thetrainline.com/', icon: Train, label: 'Find Train' },
                                ],
                            },
                        ].map((route) => {
                            const RouteIcon = route.icon;
                            const isOpen = expandedRoute === route.id;
                            return (
                                <div
                                    key={route.id}
                                    className="rounded-[1.5rem] border border-slate-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/30 overflow-hidden transition-all duration-300"
                                >
                                    <button
                                        onClick={() => setExpandedRoute(isOpen ? null : route.id)}
                                        className="w-full flex items-start gap-4 p-4 text-left"
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0 mt-0.5">
                                                <RouteIcon size={18} className="text-med-terracotta" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="text-base font-body font-bold text-med-blue dark:text-white">{route.title}</h4>
                                                    <span className="text-[9px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-med-terracotta/10 text-med-terracotta">{route.badge}</span>
                                                </div>
                                                <p className="text-[12px] font-body text-slate-400 dark:text-gray-500 leading-relaxed">
                                                    {route.preview}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown size={16} className={`text-slate-400 shrink-0 mt-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 pl-[4.25rem]">
                                                    <p className="text-[12px] font-body text-slate-400 dark:text-gray-500 leading-relaxed">
                                                        {route.detail}
                                                    </p>
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        {route.links.map((link) => {
                                                            const LinkIcon = link.icon;
                                                            return (
                                                                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                                                                    onClick={e => e.stopPropagation()}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-[10px] font-body font-bold uppercase tracking-wider text-med-blue dark:text-white hover:border-med-terracotta/40 transition-colors">
                                                                    <LinkIcon size={10} /> {link.label}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                    </div>



                </SectionCard>

                {/* ══════════════════════════════════════════════════════════════
                    SECTION: WHERE TO STAY
                ══════════════════════════════════════════════════════════════ */}
                <SectionCard>
                    <Eyebrow label="Where to Stay" />

                    <div className="space-y-3">
                        {[
                            {
                                name: 'Hôtel Richer De Belleval',
                                stars: 5,
                                parties: 3,
                                subtitle: '~ €400 / night',
                                description: 'Luxury boutique hotel in the heart of Place de la Comédie',
                                walkToCenter: '5 min',
                                ridePickup: '1 min',
                                tramToCenter: '1 min',
                                url: 'https://www.expedia.com/Montpellier-Hotels-Hotel-Richer-De-Belleval.h70875679.Hotel-Information?chkin=2026-09-16&chkout=2026-09-22',
                                mapUrl: 'https://maps.google.com/?q=Hôtel+Richer+De+Belleval+Montpellier',
                            },
                            {
                                name: 'Hôtel Oceania Le Métropole',
                                stars: 4,
                                parties: 1,
                                subtitle: '~ €180 / night',
                                description: 'Classic 4-star hotel steps from the main train station',
                                walkToCenter: '3 min',
                                ridePickup: '1 min',
                                tramToCenter: '2 min',
                                url: 'https://www.expedia.com/Montpellier-Hotels-Hotel-Oceania-Le-Metropole-Montpellier.h25884.Hotel-Information?chkin=2026-09-16&chkout=2026-09-22',
                                mapUrl: 'https://maps.google.com/?q=Hôtel+Oceania+Le+Métropole+Montpellier',
                            },
                            {
                                name: 'Miranove',
                                stars: 3,
                                parties: 0,
                                subtitle: '~ €90 / night',
                                description: 'Modern apartment-style accommodations with full kitchens',
                                walkToCenter: '20 min',
                                ridePickup: '2 min',
                                tramToCenter: '10 min',
                                url: 'https://www.expedia.com/Montpellier-Hotels-AppartHotel-Marianne.h36016734.Hotel-Information?chkin=2026-09-16&chkout=2026-09-22',
                                mapUrl: 'https://maps.google.com/?q=Miranove+Montpellier',
                            },
                            {
                                name: 'JOST Hotel Montpellier',
                                stars: 3,
                                parties: 0,
                                subtitle: '~ €100 / night',
                                description: 'Lifestyle hotel near Saint-Roch station with rooftop pool & co-working',
                                walkToCenter: '10 min',
                                ridePickup: '2 min',
                                tramToCenter: '3 min',
                                url: 'https://www.expedia.com/Montpellier-Hotels-JOST-MONTPELLIER.h90915860.Hotel-Information?chkin=2026-09-16&chkout=2026-09-22',
                                mapUrl: 'https://maps.google.com/?q=JOST+Hotel+Montpellier',
                            },
                        ].map((hotel, i) => (
                            <motion.div
                                key={hotel.name}
                                initial={{ opacity: 0, x: -12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="p-4 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/30 hover:border-med-terracotta/40 hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-med-terracotta/20 transition-colors">
                                        <Building2 size={18} className="text-med-terracotta" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-body font-bold text-med-blue dark:text-white leading-snug flex items-center flex-wrap gap-1.5">
                                            {hotel.name} <span className="text-[11px] text-med-terracotta font-normal">{'★'.repeat(hotel.stars)}</span>
                                            {hotel.parties > 0 && <span className="text-[9px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-med-blue/10 text-med-blue dark:bg-white/10 dark:text-white">{hotel.parties} {hotel.parties === 1 ? 'party' : 'parties'} staying</span>}
                                        </p>
                                        <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta/70 mt-0.5">
                                            {hotel.subtitle}
                                        </p>
                                        <p className="text-[12px] font-body text-slate-400 dark:text-gray-500 mt-1 leading-relaxed">
                                            {hotel.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] font-body text-slate-400 dark:text-gray-500">
                                            <span className="inline-flex items-center gap-1"><MapPin size={9} className="text-med-terracotta" />{hotel.walkToCenter} walk</span>
                                            <span className="text-slate-200 dark:text-gray-700">·</span>
                                            <span className="inline-flex items-center gap-1"><Train size={9} className="text-med-terracotta" />{hotel.tramToCenter} tram</span>
                                            <span className="text-slate-200 dark:text-gray-700">·</span>
                                            <span className="inline-flex items-center gap-1"><Car size={9} className="text-med-terracotta" />{hotel.ridePickup} to pickup</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <a href={hotel.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-body font-bold text-med-terracotta hover:underline" onClick={e => e.stopPropagation()}>
                                                <MapPin size={10} /> View on Map <ExternalLink size={8} />
                                            </a>
                                            <a href={hotel.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-body font-bold text-med-blue hover:underline" onClick={e => e.stopPropagation()}>
                                                Book on Expedia <ExternalLink size={8} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </SectionCard>

                {/* ══════════════════════════════════════════════════════════════
                {/* WHERE TO EAT — hidden for now, restore by removing the false && wrapper */}
                {false && (
                <SectionCard>
                    <Eyebrow label="Where to Eat" />

                    <motion.a
                        href="https://guide.michelin.com/fr/fr/occitanie/montpellier/restaurants/1-etoile-michelin/bib-gourmand"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 p-4 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/30 hover:border-med-terracotta/40 hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0 group-hover:bg-med-terracotta/20 transition-colors">
                            <UtensilsCrossed size={18} className="text-med-terracotta" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-body font-bold text-med-blue dark:text-white leading-snug">
                                Michelin Guide — Montpellier
                            </p>
                            <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta/70 mt-0.5">
                                1-Star & Bib Gourmand
                            </p>
                            <p className="text-[12px] font-body text-slate-400 dark:text-gray-500 mt-1 leading-relaxed">
                                Browse starred restaurants and top-value picks in the area
                            </p>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors shrink-0" />
                    </motion.a>
                </SectionCard>
                )}

                {/* ══════════════════════════════════════════════════════════════
                    SECTION: GET TO KNOW MONTPELLIER
                ══════════════════════════════════════════════════════════════ */}
                <SectionCard>
                    <Eyebrow label="Get to Know Montpellier" />

                    <div className="space-y-3 mt-2">
                        {[
                            {
                                title: 'City Guide: Montpellier 2025',
                                source: 'Edible Reading',
                                description: 'Food, wine, and culture — a curated guide to the city',
                                url: 'https://ediblereading.com/2025/05/23/city-guide-montpellier-2025/',
                                icon: Compass,
                            },
                            {
                                title: 'Essential Guide to Montpellier',
                                source: 'The Good Life France',
                                description: 'History, neighborhoods, markets, and insider tips',
                                url: 'https://thegoodlifefrance.com/essential-guide-to-montpellier-southern-france/',
                                icon: Globe,
                            },

                            {
                                title: 'A Thousand Years of History',
                                source: 'Montpellier Tourism',
                                description: 'The official guide to Montpellier\'s rich and storied past',
                                url: 'https://www.montpellier-france.com/discover/a-thousand-years-of-history/',
                                icon: MapPinned,
                            },

                        ].map((link, i) => {
                            const Icon = link.icon;
                            return (
                                <motion.a
                                    key={link.title}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-start gap-4 p-4 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/30 hover:border-med-terracotta/40 hover:shadow-md transition-all duration-300 group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-med-terracotta/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-med-terracotta/20 transition-colors">
                                        <Icon size={18} className="text-med-terracotta" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-body font-bold text-med-blue dark:text-white leading-snug">
                                            {link.title}
                                        </p>
                                        <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-med-terracotta/70 mt-0.5">
                                            {link.source}
                                        </p>
                                        <p className="text-[12px] font-body text-slate-400 dark:text-gray-500 mt-1 leading-relaxed">
                                            {link.description}
                                        </p>
                                    </div>
                                    <ExternalLink size={14} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors shrink-0 mt-1" />
                                </motion.a>
                            );
                        })}
                    </div>
                </SectionCard>
                </>)}



                </>
                )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
                {/* Footer spacer */}
                <div className="py-6" />

            {/* ── Getting There Help Modal ── */}
            <AnimatePresence>
                {showHelpModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                        onClick={() => setShowHelpModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-gray-800"
                        >
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={16} className="text-slate-400" />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Check size={20} className="text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-body font-bold text-med-blue dark:text-white">Help Requested</h3>
                            </div>
                            <p className="text-[13px] font-body text-slate-500 dark:text-gray-400 leading-relaxed">
                                Your host has offered to help guests find the best route to Montpellier. We've notified them of your request so they should be in touch soon.
                            </p>
                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="mt-5 w-full py-2.5 rounded-2xl bg-med-terracotta text-white text-sm font-body font-bold uppercase tracking-wider hover:bg-med-terracotta/90 transition-colors"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
