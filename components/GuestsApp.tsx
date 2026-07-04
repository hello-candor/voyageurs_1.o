
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guest } from '../context/UserContext';
import {
    Users, Check, X, Clock, Search, Filter, Download,
    ChevronDown, ChevronUp, ChevronRight, User, Mail, Phone,
    MapPin, Plane, Train, Car, Utensils, StickyNote, Calendar,
    Star, Wine, Sun, GlassWater, ArrowUpDown, Edit3, Loader2,
    PartyPopper, HelpCircle, Frown, UserPlus, Plus, Trash2
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type SortField = 'name' | 'status' | 'dietary' | 'arrival' | 'guestsCount';
type SortDir = 'asc' | 'desc';
type StatusFilter = 'All' | 'Confirmed' | 'Pending' | 'Declined';

interface GuestsAppProps {
    allGuests: Guest[];
    onAdd: (guest: any) => void;
    onBulkAdd: (guests: any[]) => void;
    onDelete: (id: string) => void;
    onUpdateGuest: (id: string, data: Partial<Guest>) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEKEND_EVENTS = [
    { id: 'welcome', title: 'Welcome Party', icon: GlassWater, color: 'text-amber-400', bg: 'bg-amber-500/20', short: 'Welcome' },
    { id: 'vineyard', title: 'Wine Tour', icon: Wine, color: 'text-purple-400', bg: 'bg-purple-500/20', short: 'Wine' },
    { id: 'gala', title: 'The Celebration', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/20', short: 'Gala' },
    { id: 'brunch', title: 'Farewell Brunch', icon: Sun, color: 'text-cyan-400', bg: 'bg-cyan-500/20', short: 'Brunch' },
];

const STATUS_CONFIG = {
    Confirmed: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', label: 'Confirmed' },
    Pending:   { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', label: 'Pending' },
    Declined:  { icon: X, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Declined' },
};

// ─── Utility ─────────────────────────────────────────────────────────────────

function exportToCSV(guests: Guest[]) {
    const headers = ['Name', 'Email', 'Status', 'Dietary', 'Arrival', 'Party Size', 'Note', 'Welcome', 'Wine Tour', 'Gala', 'Brunch'];
    const rows = guests.map(g => {
        const ec = (g as any).eventConfirmations || {};
        return [
            g.name, g.email, g.status, g.dietary || '', g.arrival || '',
            g.guestsCount || 1, g.note || '',
            ec.welcome !== false ? 'Yes' : 'No',
            ec.vineyard !== false ? 'Yes' : 'No',
            ec.gala !== false ? 'Yes' : 'No',
            ec.brunch !== false ? 'Yes' : 'No',
        ];
    });

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyageurs-guest-list-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, onClick, isActive }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-200 text-left w-full group ${
            isActive
                ? 'bg-white/15 border-white/30 shadow-lg'
                : 'bg-black/30 border-white/10 hover:bg-black/40 hover:border-white/20'
        }`}
    >
        <div className={`p-2.5 rounded-xl ${color} bg-current/20 group-hover:scale-110 transition-transform`}>
            <Icon size={18} className="text-current" />
        </div>
        <div>
            <p className="text-2xl font-serif font-bold text-white leading-none">{value}</p>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">{label}</span>
        </div>
    </button>
);

// ─── Guest Row ───────────────────────────────────────────────────────────────

const GuestRow = ({ guest, isExpanded, onToggle, onStatusChange }: {
    guest: Guest;
    isExpanded: boolean;
    onToggle: () => void;
    onStatusChange: (status: Guest['status']) => void;
}) => {
    const status = STATUS_CONFIG[guest.status] || STATUS_CONFIG.Pending;
    const StatusIcon = status.icon;
    const ec = (guest as any).eventConfirmations || {};
    const td = (guest as any).travelDetails;

    return (
        <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
            isExpanded
                ? 'bg-black/50 border-white/20 shadow-xl'
                : 'bg-black/25 border-white/8 hover:bg-black/35 hover:border-white/15'
        }`}>
            {/* Row Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {guest.img ? (
                        <img src={guest.img} alt={guest.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={16} className="text-white/40" />
                    )}
                </div>

                {/* Name + Email */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{guest.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{guest.email}</p>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${status.bg} ${status.color} border ${status.border}`}>
                    <StatusIcon size={10} strokeWidth={3} />
                    {status.label}
                </div>

                {/* Dietary */}
                <div className="hidden md:block w-24 text-right">
                    <span className="text-[10px] text-white/40 font-medium truncate block">
                        {guest.dietary || '—'}
                    </span>
                </div>

                {/* Party Size */}
                <div className="hidden md:flex items-center gap-1 w-12 justify-center">
                    <Users size={11} className="text-white/30" />
                    <span className="text-xs text-white/50 font-bold">{guest.guestsCount || 1}</span>
                </div>

                {/* Event Dots */}
                <div className="hidden lg:flex items-center gap-1">
                    {WEEKEND_EVENTS.map(evt => {
                        const attending = ec[evt.id] !== false;
                        return (
                            <div
                                key={evt.id}
                                title={`${evt.title}: ${attending ? 'Yes' : 'No'}`}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                    attending ? evt.bg : 'bg-white/5'
                                }`}
                            >
                                <evt.icon size={10} className={attending ? evt.color : 'text-white/20'} />
                            </div>
                        );
                    })}
                </div>

                {/* Chevron */}
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight size={14} className="text-white/30" />
                </div>
            </button>

            {/* Expanded Detail Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-5 pt-1 border-t border-white/8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">

                                {/* Column 1: Contact & Profile */}
                                <div className="space-y-3">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Contact</h4>
                                    {[
                                        { icon: Mail, label: 'Email', value: guest.email },
                                        { icon: Utensils, label: 'Dietary', value: guest.dietary || 'None specified' },
                                        { icon: StickyNote, label: 'Notes', value: guest.note || 'No notes' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-start gap-2.5">
                                            <item.icon size={12} className="text-white/25 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</p>
                                                <p className="text-xs text-white/80">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Column 2: Travel Details */}
                                <div className="space-y-3">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Travel</h4>
                                    {td ? (
                                        <>
                                            {td.arrivalDate && (
                                                <div className="flex items-start gap-2.5">
                                                    <Calendar size={12} className="text-white/25 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[9px] text-white/30 uppercase tracking-wider">Dates</p>
                                                        <p className="text-xs text-white/80">
                                                            {new Date(td.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            {td.departureDate && ` → ${new Date(td.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-2.5">
                                                {td.arrivalMode === 'Train' ? <Train size={12} className="text-white/25 mt-0.5 shrink-0" /> :
                                                 td.arrivalMode === 'Car' ? <Car size={12} className="text-white/25 mt-0.5 shrink-0" /> :
                                                 <Plane size={12} className="text-white/25 mt-0.5 shrink-0" />}
                                                <div>
                                                    <p className="text-[9px] text-white/30 uppercase tracking-wider">Mode</p>
                                                    <p className="text-xs text-white/80">{td.arrivalMode || 'Not specified'}{td.arrivalNumber ? ` · ${td.arrivalNumber}` : ''}</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-xs text-white/30 italic">No travel details provided yet</p>
                                    )}
                                    {guest.arrival && !td?.arrivalDate && (
                                        <div className="flex items-start gap-2.5">
                                            <MapPin size={12} className="text-white/25 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[9px] text-white/30 uppercase tracking-wider">Arrival</p>
                                                <p className="text-xs text-white/80">{guest.arrival}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Column 3: Event Confirmations */}
                                <div className="space-y-3">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Events</h4>
                                    {WEEKEND_EVENTS.map(evt => {
                                        const attending = ec[evt.id] !== false;
                                        return (
                                            <div key={evt.id} className={`flex items-center gap-2.5 py-1.5 px-3 rounded-xl transition-all ${
                                                attending ? `${evt.bg} border border-white/5` : 'opacity-40'
                                            }`}>
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${attending ? 'bg-white/10' : ''}`}>
                                                    {attending
                                                        ? <Check size={10} className="text-emerald-400" strokeWidth={3} />
                                                        : <X size={10} className="text-white/30" />
                                                    }
                                                </div>
                                                <evt.icon size={12} className={attending ? evt.color : 'text-white/30'} />
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${attending ? 'text-white/80' : 'text-white/30'}`}>
                                                    {evt.title}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/8">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mr-2">Set Status:</span>
                                {(['Confirmed', 'Pending', 'Declined'] as const).map(s => {
                                    const cfg = STATUS_CONFIG[s];
                                    const Icon = cfg.icon;
                                    const isActive = guest.status === s;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => onStatusChange(s)}
                                            disabled={isActive}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                                                isActive
                                                    ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                                                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60'
                                            }`}
                                        >
                                            <Icon size={10} strokeWidth={3} />
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const GuestsApp: React.FC<GuestsAppProps> = ({ allGuests, onAdd, onBulkAdd, onDelete, onUpdateGuest }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // ── Stats ──
    const stats = useMemo(() => {
        const confirmed = allGuests.filter(g => g.status === 'Confirmed');
        const pending = allGuests.filter(g => g.status === 'Pending');
        const declined = allGuests.filter(g => g.status === 'Declined');

        const totalHeadcount = allGuests.reduce((acc, g) => acc + (g.guestsCount || 1), 0);
        const confirmedHeadcount = confirmed.reduce((acc, g) => acc + (g.guestsCount || 1), 0);

        // Dietary breakdown
        const dietaryMap: Record<string, number> = {};
        allGuests.filter(g => g.status !== 'Declined').forEach(g => {
            const d = (g.dietary || 'None').trim();
            if (d && d !== 'None') dietaryMap[d] = (dietaryMap[d] || 0) + 1;
        });

        // Per-event headcount (from confirmed/pending guests)
        const eventCounts: Record<string, number> = {};
        WEEKEND_EVENTS.forEach(e => { eventCounts[e.id] = 0; });
        allGuests.filter(g => g.status !== 'Declined').forEach(g => {
            const ec = (g as any).eventConfirmations || {};
            WEEKEND_EVENTS.forEach(evt => {
                if (ec[evt.id] !== false) eventCounts[evt.id] += (g.guestsCount || 1);
            });
        });

        return {
            total: allGuests.length,
            totalHeadcount,
            confirmed: confirmed.length,
            confirmedHeadcount,
            pending: pending.length,
            declined: declined.length,
            dietaryMap,
            eventCounts,
        };
    }, [allGuests]);

    // ── Filter + Sort ──
    const filteredGuests = useMemo(() => {
        let result = [...allGuests];

        // Status filter
        if (statusFilter !== 'All') {
            result = result.filter(g => g.status === statusFilter);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(g =>
                g.name.toLowerCase().includes(q) ||
                g.email.toLowerCase().includes(q) ||
                (g.dietary || '').toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA: any, valB: any;
            switch (sortField) {
                case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
                case 'status': valA = a.status; valB = b.status; break;
                case 'dietary': valA = (a.dietary || '').toLowerCase(); valB = (b.dietary || '').toLowerCase(); break;
                case 'arrival': valA = a.arrival || ''; valB = b.arrival || ''; break;
                case 'guestsCount': valA = a.guestsCount || 1; valB = b.guestsCount || 1; break;
                default: valA = a.name; valB = b.name;
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [allGuests, statusFilter, searchQuery, sortField, sortDir]);

    const toggleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }, [sortField]);

    const handleStatusChange = useCallback((id: string, status: Guest['status']) => {
        onUpdateGuest(id, { status } as any);
    }, [onUpdateGuest]);

    return (
        <div className="h-full overflow-y-auto scrollbar-hide text-white bg-gradient-to-b from-transparent to-black/20">
            <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-white leading-none mb-1"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                            Guest List
                        </h2>
                        <p className="text-white/40 text-xs uppercase tracking-widest">
                            {stats.total} guests · {stats.totalHeadcount} total headcount
                        </p>
                    </div>
                    <button
                        onClick={() => exportToCSV(allGuests)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all"
                    >
                        <Download size={13} /> Export CSV
                    </button>
                </div>

                {/* ── Status Filter Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        icon={Users}
                        label="All Guests"
                        value={stats.total}
                        color="text-blue-400"
                        isActive={statusFilter === 'All'}
                        onClick={() => setStatusFilter('All')}
                    />
                    <StatCard
                        icon={Check}
                        label="Confirmed"
                        value={stats.confirmed}
                        color="text-emerald-400"
                        isActive={statusFilter === 'Confirmed'}
                        onClick={() => setStatusFilter('Confirmed')}
                    />
                    <StatCard
                        icon={Clock}
                        label="Pending"
                        value={stats.pending}
                        color="text-amber-400"
                        isActive={statusFilter === 'Pending'}
                        onClick={() => setStatusFilter('Pending')}
                    />
                    <StatCard
                        icon={X}
                        label="Declined"
                        value={stats.declined}
                        color="text-red-400"
                        isActive={statusFilter === 'Declined'}
                        onClick={() => setStatusFilter('Declined')}
                    />
                </div>

                {/* ── Per-Event Headcounts ── */}
                <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-4">Headcount by Event</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {WEEKEND_EVENTS.map(evt => {
                            const Icon = evt.icon;
                            return (
                                <div key={evt.id} className={`flex items-center gap-3 p-3 rounded-xl ${evt.bg} border border-white/5`}>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Icon size={15} className={evt.color} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-serif font-bold text-white leading-none">{stats.eventCounts[evt.id]}</p>
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">{evt.short}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Dietary Breakdown ── */}
                {Object.keys(stats.dietaryMap).length > 0 && (
                    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                        <h3 className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-3">Dietary Requirements</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.dietaryMap).sort((a, b) => b[1] - a[1]).map(([diet, count]) => (
                                <div key={diet} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                    <Utensils size={10} className="text-med-terracotta" />
                                    <span className="text-[10px] font-bold text-white/70">{diet}</span>
                                    <span className="text-[10px] font-bold text-white/30">×{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Search + Sort Bar ── */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or dietary..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/25 outline-none focus:border-white/25 transition-all backdrop-blur-xl"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-xl p-1 backdrop-blur-xl">
                        {([
                            { field: 'name' as SortField, label: 'Name' },
                            { field: 'status' as SortField, label: 'Status' },
                            { field: 'guestsCount' as SortField, label: 'Party' },
                        ]).map(col => (
                            <button
                                key={col.field}
                                onClick={() => toggleSort(col.field)}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                                    sortField === col.field
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/40 hover:text-white/60'
                                }`}
                            >
                                {col.label}
                                {sortField === col.field && (
                                    sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Guest List ── */}
                <div className="space-y-2">
                    {filteredGuests.length === 0 ? (
                        <div className="text-center py-16 bg-black/20 rounded-2xl border border-white/5">
                            <Users size={32} className="text-white/15 mx-auto mb-3" />
                            <p className="text-white/30 text-sm font-medium">
                                {searchQuery || statusFilter !== 'All' ? 'No guests match your filters' : 'No guests added yet'}
                            </p>
                        </div>
                    ) : (
                        filteredGuests.map(guest => (
                            <GuestRow
                                key={guest.id}
                                guest={guest}
                                isExpanded={expandedId === guest.id}
                                onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)}
                                onStatusChange={(status) => handleStatusChange(guest.id, status)}
                            />
                        ))
                    )}
                </div>

                {/* ── Footer Summary ── */}
                <div className="text-center py-4 text-[10px] text-white/20 uppercase tracking-widest">
                    Showing {filteredGuests.length} of {allGuests.length} guests
                </div>
            </div>
        </div>
    );
};

export default GuestsApp;
