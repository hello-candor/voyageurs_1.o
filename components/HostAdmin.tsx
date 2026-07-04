
import React, { useState, useMemo, useEffect, Suspense, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, Guest } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useAppConfig, AppContent, AppConfig } from '../context/AppConfigContext';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { uploadImage } from '../services/storageService';
import { askHostAssistant } from '../services/geminiService';
import { safeStorage } from '../utils/storage';
import {
    LayoutDashboard, Users, Radio, Palette, Settings,
    Calendar, Utensils, Bed, Mountain, LogOut, X, Sun, Moon,
    Plus, Search, Edit, Trash2, Check, Upload, Image as ImageIcon,
    Loader2, Bell, MapPin, ChevronRight, Save, Filter, Lock,
    Download, List, LayoutGrid, Phone, Globe, MessageSquare, Info, UserCircle2,
    ArrowUpDown, ChevronUp, ChevronDown, Clock, Star, ExternalLink, ChefHat, Tag,
    Send, Mail, Smartphone, History, Timer, Trash, Copy, Layout, FileText, Quote, Sparkles,
    Film, Link, Terminal, Fingerprint, Camera, Layers, ArrowLeft, Instagram, Twitter, Facebook, DollarSign, Plane,
    MoreHorizontal, Eye, EyeOff, ArrowUp, ArrowDown, Columns, Hash, Code, Shield, Table as TableIcon, AlertTriangle,
    GlassWater, Wine, Zap, Scroll, GraduationCap, Gem, Waves, ThermometerSun, Umbrella, ShoppingBag, Music, Rainbow,
    Heart, Landmark, MessageCircle, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { Button } from './Button';
import { HostDock, AdminApp } from './HostDock';
import { WebOSCard } from './WebOSCard';
import { EmptyState } from './EmptyState';
import { SegmentedControl } from './SegmentedControl';
import { SlidingPaneLayout } from './SlidingPaneLayout';
import { WelcomeTour } from './WelcomeTour';
import { GuestsApp } from './GuestsApp';
import { Hero } from './Hero';
import { TheCelebration } from './TheCelebration';
import { Gallery } from './Gallery';
import { AgendaView } from './AgendaView';
import { PublicLogistics } from './PublicLogistics';


interface HostAdminProps {
    onSwitchToGuest?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

interface WindowInstance {
    id: string;
    app: AdminApp;
    title: string;
    key: number;
    props?: any;
}

interface CardStack {
    id: string;
    cards: WindowInstance[];
}

interface WebOSState {
    stacks: CardStack[];
    activeStackId: string | null;
}

type GuestFilter = 'All' | 'Confirmed' | 'Pending' | 'Declined';
type ViewMode = 'grid' | 'table';

const PREVIEW_ICON_MAP: Record<string, any> = {
    Calendar, GlassWater, Sun, Star, Clock, MapPin, Wine, Heart, Users, MessageCircle,
    Landmark, Mountain, Sparkles, Zap, Scroll, GraduationCap, Palette, Gem,
    Waves, ThermometerSun, Utensils, Moon, Umbrella, ShoppingBag, Music, Shield
};

function getAppTitle(app: AdminApp): string {
    switch (app) {
        case 'dashboard': return 'Command Center';
        case 'guests': return 'Guest List';
        case 'communications': return 'Broadcast';
        case 'build': return 'Experience Builder';
        case 'setup': return 'System Config';
        default: return 'App';
    }
}

const FieldEditor = ({ label, value, onChange, type = "text", className = "" }: any) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">{label}</label>
        {type === 'textarea' ? (
            <textarea
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-med-blue/20 focus:border-med-blue transition-all min-h-[80px] text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
        ) : type === 'number' ? (
            <input
                type="number"
                value={value || 0}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-med-blue/20 focus:border-med-blue transition-all text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
        ) : (
            <input
                type="text"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-med-blue/20 focus:border-med-blue transition-all text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
        )}
    </div>
);

const ImageFieldEditor = ({ label, value, onChange, className = "" }: any) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (file: File | undefined) => {
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'admin_uploads');
            onChange(url);
        } catch (e: any) {
            console.error("Upload failed", e);
            alert(`Upload failed: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={className}>
            <FieldEditor label={label} value={value} onChange={onChange} />
            <div className="mt-2 flex items-center gap-3">
                {value && (
                    <div className="relative group shrink-0">
                        <img src={value} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 dark:border-gray-700" alt="Preview" />
                        <div className="absolute inset-0 bg-black/10 rounded-lg ring-1 ring-inset ring-black/10" />
                    </div>
                )}
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900/50 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
                    {isUploading ? <Loader2 size={14} className="animate-spin text-med-terracotta" /> : <Upload size={14} className="text-gray-500" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{isUploading ? 'Uploading...' : 'Choose File'}</span>
                </label>
            </div>
        </div>
    );
};

const ArrayEditor = ({ label, items, onChange, itemRenderer, itemTemplate }: { label: string, items: any[], onChange: (val: any[]) => void, itemRenderer: (item: any, onChange: (val: any) => void) => React.ReactNode, itemTemplate: any }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const handleItemChange = (index: number, newValue: any) => {
        const newItems = [...items];
        newItems[index] = newValue;
        onChange(newItems);
    };

    const handleDelete = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
        if (expandedIndex === index) setExpandedIndex(null);
    };

    const handleAdd = () => {
        onChange([...items, { ...itemTemplate, id: `new-${Date.now()}` }]);
        setExpandedIndex(items.length); // Open the new item
    };

    // Helper to extract a display title for collapsed state
    const getItemTitle = (item: any) => {
        return item.title || item.name || item.label || item.id || "Untitled Item";
    };

    return (
        <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">{label} ({items.length})</label>
                <button onClick={handleAdd} className="text-[10px] font-bold uppercase tracking-wider text-med-blue hover:text-med-terracotta flex items-center gap-1">
                    <Plus size={12} /> Add
                </button>
            </div>

            <div className="space-y-2">
                {items.map((item, idx) => {
                    const isExpanded = expandedIndex === idx;
                    return (
                        <div key={idx} className={`bg-white dark:bg-gray-900 rounded-xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-med-blue/30 ring-1 ring-med-blue/10 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>

                            {/* Header / Summary */}
                            <div
                                className="flex items-center justify-between p-3 cursor-pointer bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1 rounded-md transition-transform duration-300 ${isExpanded ? 'rotate-90 text-med-blue' : 'text-gray-400'}`}>
                                        <ChevronRight size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{getItemTitle(item)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 animate-in slide-in-from-top-2 duration-200">
                                    {itemRenderer(item, (val) => handleItemChange(idx, val))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {items.length === 0 && (
                <div className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-400 mb-2">List is empty</p>
                    <Button size="sm" variant="secondary" onClick={handleAdd}>Add Item</Button>
                </div>
            )}
        </div>
    );
};

const HostSplitLayout = ({ children, preview, onSave, onPublish, isDirty, isPublishing }: any) => {
    const [scale, setScale] = useState(0.9);

    return (
        <div className="flex h-full flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Editor Pane */}
            <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 relative">
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </div>
                {/* Action Bar */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shrink-0 gap-4">
                    <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-green-500'}`} />
                        {isDirty ? 'Unsaved Changes' : 'All saved'}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onSave} disabled={!isDirty || isPublishing}>Save Draft</Button>
                        <Button variant="action" size="sm" onClick={onPublish} isLoading={isPublishing} loadingText="Publishing...">
                            {isPublishing ? 'Syncing...' : 'Publish Live'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Pane - Realistic iPhone Mockup */}
            <div className="hidden md:flex w-1/2 lg:w-[45%] bg-slate-100 dark:bg-[#0B0F17] flex-col items-center justify-center relative overflow-hidden border-l border-white/10 shadow-inner p-8">
                {/* ... Preview Container ... */}
                <div className="w-full h-full flex items-center justify-center">
                    {/* Simple placeholder for preview to save space in this output */}
                    <div className="w-[375px] h-[812px] bg-white dark:bg-black rounded-[3rem] border-[8px] border-gray-800 overflow-hidden relative shadow-2xl">
                        <div className="absolute top-0 left-0 right-0 h-8 bg-black z-50 rounded-b-2xl w-40 mx-auto" />
                        <div className="w-full h-full overflow-y-auto">
                            {preview}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const PreviewRouter = ({ tab, page, config, guests }: { tab: string, page: string, config: AppConfig, guests: Guest[] }) => {
    const { content, modules } = config;

    if (tab === 'experience') {
        switch (page) {
            case 'landing':
                return <Hero content={content.landing} appName={config.appName} />;
            case 'celebration':
                return <TheCelebration content={content.celebration} />;
            case 'gallery':
                return <Gallery content={content.gallery} />;
            default:
                return <div className="p-4 text-sm text-gray-500">Select a page to preview.</div>;
        }
    }

    switch (tab) {
        case 'agenda':
            return <div className="p-4"><AgendaView agenda={content.agenda} isPublicView={true} /></div>;
        case 'logistics':
            return <div className="p-4"><PublicLogistics /></div>;
        case 'rsvp':
            return (
                <div className="p-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-med-blue dark:text-white mb-2">RSVP Preview</p>
                        <p className="text-sm text-gray-500">Guest RSVP form is handled via the onboarding flow.</p>
                    </div>
                </div>
            );
        default:
            return <div className="p-4 text-sm text-gray-500">No preview available for this section.</div>;
    }
};

const DashboardApp = ({ allGuests, onLaunch, config }: any) => {
    const stats = useMemo(() => {
        const total = allGuests.reduce((acc: number, g: any) => acc + (g.guestsCount || 1), 0);
        const confirmed = allGuests.filter((g: any) => g.status === 'Confirmed').reduce((acc: number, g: any) => acc + (g.guestsCount || 1), 0);
        return { total, confirmed };
    }, [allGuests]);

    // Host Journey Steps
    const steps = [
        { id: 'setup', label: 'Identity', desc: 'Configure app name & visuals.', app: 'build', sub: 'identity', isComplete: config.appName !== "Voyageurs" },
        { id: 'content', label: 'Itinerary', desc: 'Build the agenda & activities.', app: 'build', sub: 'agenda', isComplete: config.content.agenda.length > 0 },
        { id: 'guests', label: 'Guest List', desc: 'Import or add your guests.', app: 'guests', isComplete: allGuests.length > 3 },
        { id: 'launch', label: 'Broadcast', desc: 'Send invites & welcome.', app: 'communications', isComplete: false },
    ];

    const activeStep = steps.find(s => !s.isComplete) || steps[steps.length - 1];

    return (
        <div className="p-8 h-full overflow-y-auto scrollbar-hide text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 
                      className="font-serif text-white leading-[1.1] mb-2 drop-shadow-md tracking-tight"
                      style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
                    >
                      Command Center
                    </h2>
                    <p className="text-blue-200/80 font-light text-lg tracking-wide">Event Overview</p>
                </div>
                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    Host Console
                </div>
            </div>

            {/* Journey Stepper Widget */}
            <div className="group relative overflow-hidden bg-black/40 hover:bg-black/50 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] shadow-2xl mb-8 transition-all duration-500">
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-med-blue/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

                <h3 className="font-serif text-2xl mb-8 text-white flex items-center gap-3 relative z-10">
                    <MapPin size={24} className="text-med-terracotta" /> Guest Journey
                </h3>

                <div className="flex justify-between items-center relative z-10">
                    {steps.map((step, idx) => {
                        const isActive = activeStep.id === step.id;
                        const isPast = step.isComplete;

                        return (
                            <div key={step.id} className="flex-1 flex flex-col items-center gap-4 relative group/step cursor-pointer" onClick={() => onLaunch(step.app, step.sub)}>
                                {/* Connecting Line */}
                                {idx < steps.length - 1 && (
                                    <div className="absolute top-5 left-[50%] w-full h-0.5 -z-10 bg-white/10">
                                        <div className={`h-full bg-med-olive transition-all duration-1000 ${isPast ? 'w-full' : 'w-0'}`} />
                                    </div>
                                )}

                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${isPast ? 'bg-med-olive border-med-olive text-white' :
                                        isActive ? 'bg-med-terracotta border-med-terracotta text-white scale-110 shadow-med-terracotta/40' :
                                            'bg-black/40 border-white/20 text-white/40'
                                    }`}>
                                    {isPast ? <Check size={16} strokeWidth={3} /> : <span className="text-sm font-bold">{idx + 1}</span>}
                                </div>

                                <div className="text-center">
                                    <span className={`block text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>{step.label}</span>
                                    <span className="hidden md:block text-[9px] text-white/40 max-w-[100px] leading-tight mx-auto">{step.desc}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/40 hover:bg-black/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-5 transition-all group">
                    <div className="p-4 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-4xl font-serif font-bold text-white mb-1">{stats.total}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Total Guests</span>
                    </div>
                </div>
                <div className="bg-black/40 hover:bg-black/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl flex items-center gap-5 transition-all group">
                    <div className="p-4 bg-med-olive/20 text-med-olive rounded-2xl border border-med-olive/20 group-hover:scale-110 transition-transform">
                        <Check size={28} />
                    </div>
                    <div>
                        <p className="text-4xl font-serif font-bold text-white mb-1">{stats.confirmed}</p>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Confirmed</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h3 className="text-lg font-serif text-white mb-4 pl-2">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Guest List', icon: Users, app: 'guests', color: 'text-pink-400' },
                    { label: 'Broadcast', icon: Radio, app: 'communications', color: 'text-cyan-400' },
                    { label: 'Global ID', icon: Fingerprint, app: 'build', ctx: 'identity', color: 'text-amber-400' },
                    { label: 'System', icon: Settings, app: 'setup', color: 'text-gray-300' }
                ].map(action => (
                    <button
                        key={action.label}
                        onClick={() => onLaunch(action.app as AdminApp, action.ctx)}
                        className="bg-black/40 hover:bg-black/50 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10 hover:border-white/30 shadow-lg hover:shadow-xl transition-all flex flex-col items-center gap-3 group"
                    >
                        <action.icon size={24} className={`${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// GuestsApp is imported from './GuestsApp'

const CommsApp = () => {
    return <div className="p-6">Communications Component Placeholder</div>;
};

const SetupApp = ({ config, updateConfig, toggleModule, toggleAI }: any) => {
    return <div className="p-6">Setup Component Placeholder</div>;
};

const BuilderApp = ({ subTab, setSubTab, page, setPage, config, updateContent, updateConfig, allGuests }: any) => {
    // ... [Builder App Logic Omitted for Brevity] ...
    return (
        <HostSplitLayout
            preview={<PreviewRouter tab={subTab} page={page} config={config} guests={allGuests} />}
            onSave={() => { }}
            onPublish={() => { }}
            isDirty={false}
            isPublishing={false}
        >
            <h2 className="text-3xl font-serif text-med-blue dark:text-white mb-6 capitalize">{subTab} Builder</h2>
            <div>Editor Placeholder</div>
        </HostSplitLayout>
    );
};

const HostAssistantModal = ({ onClose, context }: { onClose: () => void, context: string }) => {
    // ... [Assistant Logic Omitted] ...
    return <div className="absolute top-20 right-8 bg-white p-4 rounded-xl shadow-2xl">Assistant Placeholder</div>;
};

export const HostAdmin: React.FC<HostAdminProps> = ({ onSwitchToGuest, isOpen, onClose }) => {
    const { allGuests, addGuest, deleteGuest, bulkAddGuests, updateAnyGuest } = useUser();
    const { isHost, loginHost, logoutHost, isLoading: isAuthLoading, error: authError } = useAuth();
    const { config, updateConfig, toggleModule, toggleAI, updateContent } = useAppConfig();
    const { theme, toggleTheme } = useTheme();
    const { addNotification } = useNotification();

    const [webOS, setWebOS] = useState<WebOSState>({ stacks: [], activeStackId: null });
    const [isOverviewMode, setIsOverviewMode] = useState(false);
    const [password, setPassword] = useState('');

    const [builderTab, setBuilderTab] = useState('experience');
    const [builderPage, setBuilderPage] = useState('identity');
    const { stacks, activeStackId } = webOS;
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const isVisible = typeof isOpen !== 'undefined' ? isOpen : true;

    useEffect(() => {
        if (isHost) {
            const seen = safeStorage.getItem('host_tour_seen');
            if (!seen) {
                setTimeout(() => setIsTourOpen(true), 1000);
            }
        }
    }, [isHost]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && stacks.length > 0) {
                setIsOverviewMode(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [stacks.length]);


    const launchApp = useCallback((app: AdminApp, context?: any) => {
        // Dashboard Logic: Clear active stack to reveal the dashboard background
        if (app === 'dashboard') {
            setWebOS(prev => ({ ...prev, activeStackId: null }));
            setIsOverviewMode(false);
            return;
        }

        setIsOverviewMode(false);

        if (app === 'build') {
            if (context) {
                if (['identity', 'landing', 'celebration', 'gallery'].includes(context)) {
                    setBuilderTab('experience');
                    setBuilderPage(context);
                } else {
                    setBuilderTab(context);
                    setBuilderPage(''); // Reset page when switching to a non-experience tab
                }
            }
        }

        setWebOS(current => {
            const existingStack = current.stacks.find(s => s.cards.some(c => c.app === app));

            if (existingStack) {
                return { ...current, activeStackId: existingStack.id };
            }

            const timestamp = Date.now();
            const newStackId = `stack-${timestamp}`;
            const newStack: CardStack = {
                id: newStackId,
                cards: [{
                    id: `${app}-${timestamp}`,
                    app,
                    title: getAppTitle(app),
                    key: timestamp,
                    props: context
                }]
            };

            return {
                stacks: [...current.stacks, newStack],
                activeStackId: newStackId
            };
        });
    }, []);

    const closeCard = useCallback((stackId: string, cardId: string) => {
        setWebOS(prevWebOS => {
            const newStacks = prevWebOS.stacks.map(stack => {
                if (stack.id !== stackId) return stack;
                return { ...stack, cards: stack.cards.filter(c => c.id !== cardId) };
            }).filter(stack => stack.cards.length > 0);

            let newActiveStackId = prevWebOS.activeStackId;
            if (!newStacks.find(s => s.id === prevWebOS.activeStackId)) {
                newActiveStackId = newStacks.length > 0 ? newStacks[newStacks.length - 1].id : null;
            }

            return {
                stacks: newStacks,
                activeStackId: newActiveStackId
            };
        });
    }, []);

    const handleToggleOverview = useCallback(() => {
        if (stacks.length > 0) {
            setIsOverviewMode(prev => !prev);
        }
    }, [stacks]);

    const handleSignOut = async () => {
        await logoutHost();
        if (onClose) onClose();
    };

    const renderApp = (app: AdminApp, props?: any) => {
        switch (app) {
            // Dashboard is no longer rendered in a card, but if logic falls through, render it
            case 'dashboard':
                return <DashboardApp config={config} allGuests={allGuests} onLaunch={(a: AdminApp, c: any) => launchApp(a, c)} />;
            case 'guests':
                return <GuestsApp allGuests={allGuests} onAdd={addGuest} onBulkAdd={bulkAddGuests} onDelete={deleteGuest} onUpdateGuest={updateAnyGuest} />;
            case 'communications':
                return <CommsApp />;
            case 'build':
                return <BuilderApp allGuests={allGuests} subTab={builderTab} setSubTab={setBuilderTab} page={builderPage} setPage={setBuilderPage} config={config} updateContent={updateContent} updateConfig={updateConfig} />;
            case 'setup':
                return <SetupApp config={config} updateConfig={updateConfig} toggleModule={toggleModule} toggleAI={toggleAI} />;
            default: return null;
        }
    };

    if (!isVisible) return null;

    if (!isHost) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-950 z-[500] animate-in fade-in duration-500">
                <div className="w-full max-w-sm p-8 bg-gray-900 border border-gray-800 rounded-[2.5rem] shadow-2xl text-center">
                    <div className="w-20 h-20 bg-gray-800 text-med-terracotta rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-700">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-serif text-white mb-2">Host Access</h2>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">Secure Environment</p>
                    <form onSubmit={(e) => { e.preventDefault(); loginHost(password); }} className="space-y-4">
                        <input
                            type="password"
                            autoFocus
                            placeholder="Enter Passkey"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-gray-700 text-white rounded-xl py-4 px-6 outline-none focus:border-med-terracotta transition-all text-center text-lg font-bold tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-600"
                        />
                        {authError && <p className="text-red-500 text-xs font-bold">{authError}</p>}
                        <Button type="submit" fullWidth variant="action" isLoading={isAuthLoading}>Authenticate</Button>
                    </form>
                    <button onClick={onClose} className="mt-6 text-gray-500 hover:text-white text-xs underline">Return to Guest View</button>
                </div>
            </div>
        );
    }

    const activeStackIndex = activeStackId ? stacks.findIndex(s => s.id === activeStackId) : 0;
    const activeApp = activeStackId ? stacks.find(s => s.id === activeStackId)?.cards[0].app || null : null;

    return (
        <div className="absolute inset-0 bg-slate-950 font-sans overflow-hidden select-none">

            {/* Layer 0: Wallpaper Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-[1.2s] ease-out"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1512403913063-e380f68288ce?q=80&w=1920&auto=format&fit=crop')",
                        transform: isOverviewMode || stacks.length === 0 ? 'scale(1.1)' : 'scale(1.0) blur(20px)',
                        opacity: 0.6
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-med-blue/60 via-slate-900/80 to-black/90" />
            </div>

            {/* Layer 1: Dashboard (Background App) */}
            <div
                className={`
                absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-700
                ${stacks.length === 0 || isOverviewMode ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
            `}
            >
                <div className="w-full max-w-5xl h-full pt-20 pb-32">
                    <DashboardApp config={config} allGuests={allGuests} onLaunch={(a: AdminApp, c: any) => launchApp(a, c)} />
                </div>
            </div>

            <WelcomeTour
                isOpen={isTourOpen}
                onClose={() => {
                    setIsTourOpen(false);
                    safeStorage.setItem('host_tour_seen', 'true');
                }}
                type="host"
            />

            {/* Layer 2: Top Bar */}
            <div id="host-top-bar" className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 z-50 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-med-terracotta backdrop-blur-md">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <h1 className="text-white font-serif text-xl leading-none">Voyageurs Admin</h1>
                        <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-1">Host Console</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 pointer-events-auto relative">
                    <button
                        id="host-exit-btn"
                        onClick={onSwitchToGuest || onClose}
                        className="flex items-center justify-center p-2 md:px-4 md:py-2 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-md transition-all group"
                        title="Return to Guest View"
                    >
                        <Eye size={16} className="md:mr-2" />
                        <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">Guest Hub</span>
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    <button onClick={() => setIsAssistantOpen(!isAssistantOpen)} className={`p-3 rounded-full transition-all backdrop-blur-md ${isAssistantOpen ? 'bg-med-blue text-white' : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-med-terracotta'}`}>
                        <Sparkles size={18} />
                    </button>
                    <button onClick={toggleTheme} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-full text-white transition-all backdrop-blur-md">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    <button onClick={handleSignOut} className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full text-red-400 hover:text-red-200 transition-all backdrop-blur-md" title="Sign Out">
                        <LogOut size={18} />
                    </button>

                    {isAssistantOpen && (
                        <HostAssistantModal onClose={() => setIsAssistantOpen(false)} context={`Event: ${config.appName}`} />
                    )}
                </div>
            </div>

            {/* Layer 3: Main App Stacks (Z-20) */}
            <div className={`relative z-20 w-full h-full flex flex-col items-center justify-start pt-24 pb-32 overflow-hidden transition-all duration-500 ${isOverviewMode ? 'scale-95' : ''}`}>
                <div
                    className="relative w-full md:w-[95vw] max-w-[1600px] h-full flex-shrink-0 mx-auto transition-transform duration-500"
                    style={{
                        transform: isOverviewMode ? `translateX(calc(50vw - 50% - ${activeStackIndex * 280}px))` : `translateX(0)`,
                        display: stacks.length === 0 ? 'none' : 'block'
                    }}
                >
                    {stacks.map((stack, stackIdx) => (
                        <div key={stack.id} className="absolute inset-0" style={{ zIndex: stack.id === activeStackId ? 100 : 0 }}>
                            {stack.cards.map((card, cardIdx) => (
                                <WebOSCard
                                    key={card.key}
                                    id={card.id}
                                    title={card.title}
                                    isActive={webOS.activeStackId === stack.id}
                                    isOverview={isOverviewMode}
                                    index={stackIdx}
                                    activeIndex={activeStackIndex}
                                    stackIndex={cardIdx}
                                    stackSize={stack.cards.length}
                                    onClose={() => closeCard(stack.id, card.id)}
                                    onFocus={() => {
                                        setIsOverviewMode(false);
                                        setWebOS(prev => ({ ...prev, activeStackId: stack.id }));
                                    }}
                                >
                                    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-med-terracotta" /></div>}>
                                        {renderApp(card.app, card.props)}
                                    </Suspense>
                                </WebOSCard>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Overview Pill */}
            <div className="absolute bottom-2 left-0 right-0 z-[500] flex justify-center pb-safe pointer-events-none">
                <motion.div
                    id="host-overview-pill"
                    className="pointer-events-auto w-36 h-2 md:w-48 md:h-2.5 bg-white/20 hover:bg-white/40 active:bg-white rounded-full cursor-pointer backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/10 transition-all duration-300"
                    onClick={handleToggleOverview}
                    whileTap={{ scale: 0.95 }}
                />
            </div>

            {/* Layer 4: Dock */}
            <div className="absolute bottom-0 left-0 right-0 z-[400]">
                <HostDock
                    activeApp={isOverviewMode ? null : activeApp}
                    onLaunchApp={launchApp}
                    onClose={onClose}
                    onLogout={handleSignOut}
                />
            </div>
        </div>
    );
};
