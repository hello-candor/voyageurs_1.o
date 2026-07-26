
import React, { useState, useEffect, useCallback, Suspense, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useChat } from '../context/ChatContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../utils/storage';
import { FloatingHubNav } from './FloatingHubNav';
import { HubOverview } from './HubOverview';
import { SearchOverlay } from './SearchOverlay';
import { HubRSVPCard } from './HubRSVPCard';
import { NotificationCenter } from './NotificationCenter';
import { WelcomeTour } from './WelcomeTour';
import { useNotification } from '../context/NotificationContext';
import { UnifiedHeader } from './UnifiedHeader';
import { X, Search, Map, Bell, GripHorizontal, Sun, Moon, UserCircle, LogOut, ChevronLeft, ChevronRight, HelpCircle, Lock, RefreshCw } from 'lucide-react';
import { PlanningTab } from './TripPlanner';
import { useGuidance } from '../hooks/useGuidance';

import { WebOSCard } from './WebOSCard';
import { Loader2 } from 'lucide-react';

// Lazy load heavy components
const GlobalMap = React.lazy(() => import('./GlobalMap').then(module => ({ default: module.GlobalMap })));
const SeptemberCalendar = React.lazy(() => import('./SeptemberCalendar').then(module => ({ default: module.SeptemberCalendar })));
const TripPlanner = React.lazy(() => import('./TripPlanner').then(module => ({ default: module.TripPlanner })));
const EssentialsToolkit = React.lazy(() => import('./EssentialsToolkit').then(module => ({ default: module.EssentialsToolkit })));
const HubConnections = React.lazy(() => import('./HubConnections').then(module => ({ default: module.HubConnections })));
const GuestProfile = React.lazy(() => import('./GuestProfile').then(module => ({ default: module.GuestProfile })));
const ExpenseTracker = React.lazy(() => import('./ExpenseTracker').then(module => ({ default: module.ExpenseTracker })));
const Activities = React.lazy(() => import('./Activities').then(module => ({ default: module.Activities })));
const ChatSystem = React.lazy(() => import('./ChatSystem').then(module => ({ default: module.ChatSystem })));
const FAQApp = React.lazy(() => import('./FAQApp').then(module => ({ default: module.FAQApp })));
const TravelHub = React.lazy(() => import('./TravelHub').then(module => ({ default: module.TravelHub })));
const JournalPage = React.lazy(() => import('./JournalPage').then(module => ({ default: module.JournalPage })));

export type HubView = 'overview' | 'rsvp' | 'messages' | 'logistics' | 'activities' | 'expenses' | 'registry' | 'guide' | 'profile' | 'calendar' | 'map' | 'detail' | 'faq';

function getAppTitle(view: HubView): string {
    switch (view) {
        case 'overview': return 'Journal';
        case 'rsvp': return 'RSVP';
        case 'messages': return 'Messages';
        case 'logistics': return 'Planner';
        case 'activities': return 'Experiences';
        case 'expenses': return 'Ledger';
        case 'registry': return 'Registry';
        case 'guide': return 'Guide';
        case 'profile': return 'Profile';
        case 'calendar': return 'Agenda';
        case 'map': return 'Map';
        case 'detail': return 'Details';
        case 'faq': return 'Help & FAQ';
        default: return 'App';
    }
}

interface HubLayoutProps {
    onSwitchToHost: () => void;
}

interface WindowInstance {
    id: string;
    view: HubView;
    title: string;
    key: number;
    props?: any;
}

interface CardStack {
    id: string;
    cards: WindowInstance[];
}

const WithPadding: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full min-h-full p-6 md:p-10 lg:p-12">
        {children}
    </div>
);

export const HubLayout: React.FC<HubLayoutProps> = ({ onSwitchToHost }) => {
    // OS State: Start empty to show Dashboard
    const [stacks, setStacks] = useState<CardStack[]>([]);
    const [activeStackId, setActiveStackId] = useState<string | null>(null);
    const [isOverviewMode, setIsOverviewMode] = useState(false);
    const [fullScreenStackId, setFullScreenStackId] = useState<string | null>(null);

    // Overlay States
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

    // App Specific Contexts
    const { user, isVerified, isProfileOpen, toggleProfile, logout } = useUser();
    const { isHost } = useAuth();
    const { items, focusedItem } = useTripPlanner();
    const { config } = useAppConfig();
    const { theme, toggleTheme } = useTheme();
    const { unreadTotal } = useChat();

    const notificationRef = useRef<HTMLDivElement>(null);

    // Initialization
    useEffect(() => {
        const tourSeen = safeStorage.getItem('tour_seen');
        if (!tourSeen && user) {
            const timer = setTimeout(() => setIsTourOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Close Menus on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationCenterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Automatic Stacking: Listen for TripPlanner focus events
    useEffect(() => {
        if (focusedItem) {
            launchApp('detail', { item: focusedItem }, true);
        }
    }, [focusedItem]);

    useEffect(() => {
        if (stacks.length === 0 && isOverviewMode) {
            setIsOverviewMode(false);
        }
    }, [stacks, isOverviewMode]);

    const totalAlerts = useMemo(() => {
        let count = 0;
        count += items.filter(i => i.bookingStatus === 'planned').length; // Unsaved items
        if (user?.status === 'Pending') count += 1;
        if (user?.status === 'Confirmed' && !user?.travelDetails?.arrivalDate) count += 1;
        count += unreadTotal;
        return count;
    }, [items, user, unreadTotal]);

    // Window Management Functions
    const launchApp = useCallback((view: HubView, context?: any, addToStack: boolean = false) => {
        setFullScreenStackId(null); // Always exit fullscreen when launching a new app
        setIsOverviewMode(false);

        setStacks(prev => {
            // If we want to add to current stack and there is an active one
            if (addToStack && activeStackId) {
                return prev.map(stack => {
                    if (stack.id === activeStackId) {
                        return {
                            ...stack,
                            cards: [...stack.cards, {
                                id: `${view}-${Date.now()}`,
                                view,
                                title: context?.item?.name || getAppTitle(view),
                                key: Date.now(),
                                props: context
                            }]
                        };
                    }
                    return stack;
                });
            }

            // Otherwise check if already exists
            const existingStackIndex = prev.findIndex(s => s.cards.some(c => c.view === view));
            if (existingStackIndex !== -1 && !addToStack) {
                setActiveStackId(prev[existingStackIndex].id);
                return prev;
            }

            // Create New Stack
            const newStackId = `stack-${Date.now()}`;
            const newStack: CardStack = {
                id: newStackId,
                cards: [{
                    id: `${view}-${Date.now()}`,
                    view,
                    title: getAppTitle(view),
                    key: Date.now(),
                    props: context
                }]
            };

            setActiveStackId(newStackId);
            return [...prev, newStack];
        });
    }, [activeStackId]);

    const closeCard = useCallback((stackId: string, cardId: string) => {
        setStacks(prev => {
            const newStacks = prev.map(stack => {
                if (stack.id !== stackId) return stack;
                return {
                    ...stack,
                    cards: stack.cards.filter(c => c.id !== cardId)
                };
            }).filter(stack => stack.cards.length > 0);

            if (stackId === fullScreenStackId) {
                setFullScreenStackId(null);
            }

            if (!newStacks.find(s => s.id === activeStackId)) {
                if (newStacks.length > 0) {
                    setActiveStackId(newStacks[newStacks.length - 1].id);
                } else {
                    setActiveStackId(null);
                }
            }
            return newStacks;
        });
    }, [activeStackId, fullScreenStackId]);

    const handleMinimize = () => {
        setIsOverviewMode(true);
        setFullScreenStackId(null);
    };

    const handleToggleFullScreen = (stackId: string) => {
        setFullScreenStackId(prev => {
            const newFullScreenId = prev === stackId ? null : stackId;
            if (newFullScreenId) {
                setIsOverviewMode(false);
                setActiveStackId(stackId);
            }
            return newFullScreenId;
        });
    };

    const handleCenterButton = useCallback(() => {
        if (stacks.length === 0) return;

        if (isOverviewMode) {
            setIsOverviewMode(false);
        } else {
            setIsOverviewMode(true);
            setFullScreenStackId(null); // Always exit fullscreen when entering overview
        }
    }, [isOverviewMode, stacks.length]);

    const activeStackIndex = activeStackId ? stacks.findIndex(s => s.id === activeStackId) : 0;

    const handlePrevStack = () => {
        if (activeStackIndex > 0) {
            setActiveStackId(stacks[activeStackIndex - 1].id);
        }
    };

    const handleNextStack = () => {
        if (activeStackIndex < stacks.length - 1) {
            setActiveStackId(stacks[activeStackIndex + 1].id);
        }
    };

    // App Content Renderer
    const renderAppContent = (view: HubView, props?: any) => {
        switch (view) {
            case 'overview': return <JournalPage />;
            case 'rsvp': return (
                <WithPadding>
                    <HubRSVPCard onComplete={() => launchApp('logistics')} />
                </WithPadding>
            );
            case 'messages': return <ChatSystem onNavigate={(v) => launchApp(v)} />;
            case 'calendar': return <WithPadding><SeptemberCalendar onOpenMap={() => launchApp('map')} /></WithPadding>;
            case 'expenses': return <WithPadding><ExpenseTracker /></WithPadding>;
            case 'registry': return <WithPadding><HubConnections /></WithPadding>;
            case 'guide': return <WithPadding><EssentialsToolkit onNavigate={(v) => launchApp(v)} initialTab="guides" /></WithPadding>;
            case 'faq': return <WithPadding><FAQApp onContact={() => launchApp('messages')} /></WithPadding>;
            case 'profile': return <WithPadding><GuestProfile /></WithPadding>;
            case 'logistics': return <TripPlanner initialTab={props?.tab || 'travel'} onTabChange={(v) => launchApp(v)} />;
            case 'activities': return <Activities initialItemId={props?.itemId} />;
            case 'map': return <GlobalMap />;
            case 'detail':
                if (props?.item) {
                    return (
                        <WithPadding>
                            <h2 className="text-2xl font-serif text-med-blue dark:text-white mb-4">{props.item.name}</h2>
                            <p className="text-gray-600 dark:text-gray-300">{props.item.details || props.item.description}</p>
                        </WithPadding>
                    );
                }
                return null;
            default: return null;
        }
    };

    const currentActiveView = useMemo(() => {
        const activeStack = stacks.find(s => s.id === activeStackId);
        if (!activeStack) return 'overview';
        return activeStack.cards[activeStack.cards.length - 1].view;
    }, [stacks, activeStackId]);

    useEffect(() => {
        const baseTitle = "Voyageurs RSVP";
        document.title = (currentActiveView === 'overview' && stacks.length === 0) 
            ? baseTitle 
            : `${getAppTitle(currentActiveView)} | ${baseTitle}`;
            
        const metaDescriptions: Partial<Record<HubView, string>> = {
            overview: "Your main journal and dashboard for the trip.",
            rsvp: "Manage your RSVP status and travel preferences.",
            messages: "Chat with other attendees and the host.",
            logistics: "Plan your travel options and accommodations.",
            activities: "Explore and vote on activities in Montpellier.",
            expenses: "Manage and split your trip expenses.",
            registry: "View the guest list and attendee profiles.",
            guide: "Essential toolkit and guides for your trip to France.",
            profile: "Manage your personal profile and privacy settings.",
            calendar: "View the day-by-day itinerary and event schedule.",
            map: "Explore interactive locations and venues.",
            detail: "View full details for items and events.",
            faq: "Find answers to frequently asked questions."
        };

        const desc = metaDescriptions[currentActiveView] || "Voyageurs - Elevated Group Travel. Plan and experience unforgettable trips together.";
        
        let metaDescriptionTag = document.querySelector('meta[name="description"]');
        if (!metaDescriptionTag) {
            metaDescriptionTag = document.createElement('meta');
            metaDescriptionTag.setAttribute('name', 'description');
            document.head.appendChild(metaDescriptionTag);
        }
        metaDescriptionTag.setAttribute('content', desc);
    }, [currentActiveView, stacks.length]);

    const isDashboardVisible = stacks.length === 0 || isOverviewMode;
    const isFullScreenActive = !!fullScreenStackId && !isOverviewMode;

    return (
        <div className="relative h-full w-full overflow-hidden bg-background font-sans select-none transition-colors duration-300">

            <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-700 ${theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#F5F2EB]'}`}>
                {/* Light Mode Gradients */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white/60 via-[#F5F2EB] to-[#F5F2EB] transition-opacity duration-700 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} />
                
                {/* Dark Mode Gradients */}
                <div className={`absolute inset-0 bg-gradient-to-br from-[#330046]/40 via-[#1A1A1A] to-[#1A1A1A] transition-opacity duration-700 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} />

                <div
                    className={`absolute inset-0 transition-all duration-[1.2s] ease-out`}
                    style={{
                        transform: isOverviewMode || stacks.length === 0 ? 'scale(1.1)' : 'scale(1.0)',
                    }}
                >
                    {/* Slate Blue Glow */}
                    <div className={`absolute top-[20%] left-[30%] w-[600px] h-[600px] bg-[#508BC5] rounded-full blur-[120px] transition-all duration-700 ${theme === 'dark' ? 'mix-blend-screen opacity-[0.15]' : 'mix-blend-multiply opacity-[0.1]'}`} />
                    {/* Warm Amber Glow */}
                    <div className={`absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-[#FFCDA6] rounded-full blur-[140px] transition-all duration-700 ${theme === 'dark' ? 'mix-blend-screen opacity-[0.10]' : 'mix-blend-multiply opacity-[0.2]'}`} />
                    {/* Dark Mode Specific Deep Charcoal Overlay Glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#330046] rounded-full blur-[160px] transition-opacity duration-700 mix-blend-screen ${theme === 'dark' ? 'opacity-40' : 'opacity-0'}`} />
                </div>
            </div>

            <div
                className={`
            absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-700
            ${isDashboardVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        `}
            >
                <HubOverview
                    onTabChange={(v) => launchApp(v)}
                    onOpenMap={() => launchApp('map')}
                    onOpenSearch={() => setIsSearchOpen(true)}
                    onOpenEstimator={() => launchApp('logistics', { tab: 'booking' })}
                />
            </div>

            <WelcomeTour isOpen={isTourOpen} onClose={() => { safeStorage.setItem('tour_seen', 'true'); setIsTourOpen(false); }} />
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(v) => launchApp(v)} />

            <UnifiedHeader 
                title={config.appName}
                subtitle={config.destination}
                className={isFullScreenActive ? 'opacity-0 -translate-y-full' : 'opacity-100'}
                appMenuItems={[
                    { label: 'My Profile', icon: UserCircle, onClick: () => launchApp('profile') },
                    { label: 'Help & FAQ', icon: HelpCircle, onClick: () => launchApp('faq') },
                    { label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', icon: theme === 'dark' ? Sun : Moon, onClick: toggleTheme },
                    ...(user?.isAdmin ? [{ label: 'Host Admin', icon: Lock, onClick: onSwitchToHost }] : []),
                    { label: 'Reset RSVP', icon: RefreshCw, onClick: () => { sessionStorage.clear(); localStorage.clear(); window.location.reload(); } },
                    { label: 'Sign Out', icon: LogOut, onClick: logout, danger: true }
                ]}
                menuHeader={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-med-blue flex items-center justify-center text-white shrink-0">
                            <span className="font-serif font-bold text-lg">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className={`text-sm font-bold truncate ${theme === 'light' ? 'text-med-blue' : 'text-white'}`}>{user?.name}</p>
                            <p className={`text-[10px] truncate ${theme === 'light' ? 'text-gray-500' : 'text-white/50'}`}>{user?.email}</p>
                        </div>
                    </div>
                }
                centerContent={
                    config.enableAI && (
                        <button id="hub-search-btn" onClick={() => setIsSearchOpen(true)} className={`flex items-center justify-center gap-3 transition-all px-4 md:px-6 h-full rounded-full border backdrop-blur-2xl shadow-2xl active:scale-95 group py-2 ${theme === 'light' ? 'bg-white/80 text-med-blue border-med-blue/20' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/30'}`}>
                            <Search size={16} className="group-hover:scale-110 transition-transform text-med-terracotta" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] hidden md:block">Ask Céleste</span>
                        </button>
                    )
                }
                rightContent={
                    <>
                        {isHost && (
                            <button
                                onClick={onSwitchToHost}
                                className="flex items-center justify-center h-full px-2 md:px-3 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 backdrop-blur-md transition-all group"
                                title="Return to Host Console"
                            >
                                <Lock size={14} className="md:mr-2" />
                                <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest">Admin</span>
                            </button>
                        )}
                        {user && user.status && (
                            <button 
                                onClick={() => launchApp('rsvp')}
                                className={`flex items-center justify-center h-full gap-1.5 px-3 rounded-full border text-[9px] font-bold uppercase tracking-widest backdrop-blur-md transition-all hidden md:flex hover:opacity-80 active:scale-95
                                ${user.status === 'Confirmed' ? (theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20') : ''}
                                ${user.status === 'Declined' ? (theme === 'light' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-500/10 text-red-400 border-red-500/20') : ''}
                                ${user.status === 'Pending' ? (theme === 'light' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20') : ''}
                            `}>
                                {user.status !== 'Confirmed' && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Pending' ? 'animate-pulse' : ''}
                                        ${user.status === 'Declined' ? (theme === 'light' ? 'bg-red-500' : 'bg-red-400') : ''}
                                        ${user.status === 'Pending' ? (theme === 'light' ? 'bg-amber-500' : 'bg-amber-400') : ''}
                                    `} />
                                )}
                                {user.status}
                            </button>
                        )}
                        <div className="relative h-full flex items-center" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                                className={`
                        h-full aspect-square flex items-center justify-center rounded-full transition-all duration-300 relative
                        ${isNotificationCenterOpen ? 'bg-white/10 text-white' : (theme === 'light' ? 'text-med-blue/60 hover:text-med-blue hover:bg-med-blue/5' : 'text-white/60 hover:text-white hover:bg-white/5')}
                    `}
                                title="Notifications"
                            >
                                <Bell size={18} />
                                {totalAlerts > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-med-terracotta rounded-full border-2 border-slate-900/50 animate-pulse" />
                                )}
                            </button>
                            {isNotificationCenterOpen && (
                                <NotificationCenter
                                    isOpen={isNotificationCenterOpen}
                                    onClose={() => setIsNotificationCenterOpen(false)}
                                    onNavigate={(v) => { launchApp(v); setIsNotificationCenterOpen(false); }}
                                />
                            )}
                        </div>
                        <button
                            onClick={() => launchApp('profile')}
                            className="flex items-center justify-center h-10 aspect-square rounded-full transition-all border bg-white/5 border-white/5 hover:bg-white/10 ml-2"
                        >
                            <img src={user?.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        </button>
                    </>
                }
            />

            <div className={`relative w-full h-full flex flex-col items-center justify-start z-20 pointer-events-none
          ${isFullScreenActive ? 'pt-0 pb-0' : 'pt-12 pb-16'}
      `}>
                {stacks.length > 1 && !isFullScreenActive && (
                    <>
                        <button
                            onClick={handlePrevStack}
                            disabled={activeStackIndex === 0}
                            className={`
                          absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all pointer-events-auto z-50
                          ${activeStackIndex === 0 || isOverviewMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                      `}
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={handleNextStack}
                            disabled={activeStackIndex === stacks.length - 1}
                            className={`
                          absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all pointer-events-auto z-50
                          ${activeStackIndex === stacks.length - 1 || isOverviewMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                      `}
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                <div
                    className={`
                flex-1 w-full flex items-center transition-transform duration-500 pointer-events-auto
                ${isOverviewMode ? 'cursor-grab active:cursor-grabbing' : ''}
                ${isFullScreenActive ? '!transform-none' : ''}
            `}
                    style={{
                        display: stacks.length === 0 ? 'none' : 'flex',
                        transform: isOverviewMode
                            ? `translateX(0)`
                            : `translateX(0)`
                    }}
                >
                    <div className={`relative ${isFullScreenActive ? 'w-full' : 'w-[95vw] md:w-[92vw] max-w-[1600px]'} h-full flex-shrink-0 mx-auto`}>
                        <AnimatePresence>
                            {stacks.map((stack, stackIdx) => {
                                if (isFullScreenActive && stack.id !== fullScreenStackId) return null;

                                return (
                                    <div key={stack.id} className="absolute inset-0" style={{ zIndex: stack.id === activeStackId ? (isFullScreenActive ? 150 : 100) : (isOverviewMode ? 1 : 0) }}>
                                        {stack.cards.map((card, cardIdx) => (
                                            <WebOSCard
                                                key={card.key}
                                                id={card.id}
                                                title={card.title}
                                                isActive={activeStackId === stack.id}
                                                isOverview={isOverviewMode}
                                                index={stackIdx}
                                                activeIndex={activeStackIndex}
                                                stackIndex={cardIdx}
                                                stackSize={stack.cards.length}
                                                onClose={() => closeCard(stack.id, card.id)}
                                                onFocus={() => { setActiveStackId(stack.id); setIsOverviewMode(false); setFullScreenStackId(null); }}
                                                onMinimize={handleMinimize}
                                                isFullScreen={fullScreenStackId === stack.id}
                                                onToggleFullScreen={() => handleToggleFullScreen(stack.id)}
                                            >
                                                <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 size={40} className="animate-spin text-med-terracotta" /></div>}>
                                                    {renderAppContent(card.view, card.props)}
                                                </Suspense>
                                            </WebOSCard>
                                        ))}
                                    </div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <FloatingHubNav
                activeView={currentActiveView}
                onViewChange={(v) => launchApp(v)}
                onOpenMap={() => launchApp('map')}
                forceVisible={stacks.length === 0}
                onSwitchToHost={onSwitchToHost}
                onToggleOverview={handleCenterButton}
                isOverviewOpen={isOverviewMode && stacks.length > 0}
            />

            <Suspense fallback={null}>
                <TravelHub
                    isOpen={isProfileOpen || (!!user && !user.hasCompletedOnboarding) || (isVerified && !user)}
                    onClose={toggleProfile}
                />
            </Suspense>
        </div>
    );
};
