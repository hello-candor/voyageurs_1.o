
import React, { useState, useEffect, useCallback, Suspense, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useChat } from '../context/ChatContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useAuth } from '../context/AuthContext';
import { FloatingHubNav } from './FloatingHubNav';
import { HubOverview } from './HubOverview';
import { HubRSVP } from './HubRSVP';
import { SearchOverlay } from './SearchOverlay';
import { NotificationCenter } from './NotificationCenter';
import { WelcomeTour } from './WelcomeTour';
import { useNotification } from '../context/NotificationContext';
import { X, Search, Map, Bell, GripHorizontal, Sun, Moon, UserCircle, LogOut, ChevronLeft, ChevronRight, HelpCircle, Lock } from 'lucide-react';
import { PlanningTab } from './TripPlanner';
import { useGuidance } from '../hooks/useGuidance';
import { WeatherWidget } from './WeatherWidget';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // App Specific Contexts
  const { user, isVerified, isProfileOpen, toggleProfile, logout } = useUser();
  const { isHost } = useAuth();
  const { items, focusedItem } = useTripPlanner();
  const { config } = useAppConfig();
  const { theme, toggleTheme } = useTheme();
  const { unreadTotal } = useChat();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
      const tourSeen = localStorage.getItem('tour_seen');
      if (!tourSeen && user) {
          const timer = setTimeout(() => setIsTourOpen(true), 1500);
          return () => clearTimeout(timer);
      }
  }, [user]);

  // Close Menus on click outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
              setIsUserMenuOpen(false);
          }
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

          // If we closed the active stack
          if (!newStacks.find(s => s.id === activeStackId)) {
              if (newStacks.length > 0) setActiveStackId(newStacks[newStacks.length - 1].id);
              else setActiveStackId(null); // Show dashboard
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
      case 'overview': return <div className="p-8 text-center">Journal View</div>; 
      case 'rsvp': return <HubRSVP onComplete={() => launchApp('logistics')} />;
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

  const isDashboardVisible = stacks.length === 0 || isOverviewMode;
  const isFullScreenActive = !!fullScreenStackId && !isOverviewMode;

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900 font-sans select-none">
      
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
      
      <WelcomeTour isOpen={isTourOpen} onClose={() => { localStorage.setItem('tour_seen', 'true'); setIsTourOpen(false); }} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(v) => launchApp(v)} />

      <div className={`fixed top-0 left-0 right-0 h-16 md:h-20 flex items-center justify-between px-4 md:px-10 z-[110] transition-all duration-700 pointer-events-none ${isFullScreenActive ? 'opacity-0 -translate-y-full' : 'opacity-100'}`}>
        <div className="flex items-center gap-4 text-white/90 pointer-events-auto">
            <div className="flex flex-col">
                <span className="font-serif italic text-2xl md:text-3xl leading-none block drop-shadow-md">{config.appName}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-sans hidden md:block">{config.destination}</span>
            </div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center pointer-events-auto">
          {config.enableAI && (
              <button id="hub-search-btn" onClick={() => setIsSearchOpen(true)} className="flex items-center gap-4 text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 md:px-8 py-2 md:py-3 rounded-full border border-white/10 hover:border-white/30 backdrop-blur-2xl shadow-2xl active:scale-95 group">
                <Search size={18} className="group-hover:scale-110 transition-transform text-med-terracotta" />
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] hidden md:block">Ask Céleste</span>
              </button>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-4 pointer-events-auto">
          
          {isHost && (
            <button 
                onClick={onSwitchToHost}
                className="flex items-center justify-center p-2 md:px-4 md:py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 backdrop-blur-md transition-all group mr-1 md:mr-0"
                title="Return to Host Console"
            >
                <Lock size={16} className="md:mr-2" />
                <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest">Admin</span>
            </button>
          )}

          <WeatherWidget />

          <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                className={`
                    p-2 md:p-3 rounded-full transition-all duration-300 relative
                    ${isNotificationCenterOpen ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
                title="Notifications"
              >
                 <Bell size={20} />
                 {totalAlerts > 0 && (
                     <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-med-terracotta rounded-full border-2 border-slate-900/50 animate-pulse" />
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
          
          <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-3 p-1 rounded-2xl transition-all border ${isUserMenuOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                    <img src={user?.avatar} alt="" className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-white/10 object-cover" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-slate-900/95 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 z-[120] overflow-hidden">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                        <div className="w-10 h-10 rounded-full bg-med-blue flex items-center justify-center text-white shrink-0">
                            <span className="font-serif font-bold text-lg">{user?.name?.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => { launchApp('profile'); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left"
                        >
                            <UserCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">My Profile</span>
                        </button>
                        <button 
                            onClick={() => { launchApp('faq'); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left"
                        >
                            <HelpCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Help & FAQ</span>
                        </button>
                        <button 
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                <span className="text-xs font-bold uppercase tracking-wider">Theme</span>
                            </div>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white/60">
                                {theme === 'dark' ? 'Light' : 'Dark'}
                            </span>
                        </button>
                        {user?.isAdmin && (
                             <button 
                                onClick={() => { setIsUserMenuOpen(false); onSwitchToHost(); }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-left"
                            >
                                <Lock size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Host Admin</span>
                            </button>
                        )}
                        <div className="h-px bg-white/10 my-2" />
                        <button 
                            onClick={() => { logout(); setIsUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-left"
                        >
                            <LogOut size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
                        </button>
                    </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className={`relative w-full h-full flex flex-col items-center justify-start z-20 pointer-events-none
          ${isFullScreenActive ? 'pt-0 pb-0' : 'pt-20 pb-32'}
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
                    ? `translateX(calc(50vw - 50% - ${activeStackIndex * 280}px))` 
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
                            ))}"
                        </div>
                    )})}
                </AnimatePresence>
              </div>
          </div>
      </div>

      <FloatingHubNav 
        activeView={currentActiveView} 
        onViewChange={(v) => launchApp(v)} 
        onOpenMap={() => launchApp('map')} 
        forceVisible={isOverviewMode || stacks.length === 0 || isFullScreenActive}
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
