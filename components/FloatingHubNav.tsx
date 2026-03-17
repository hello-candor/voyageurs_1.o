
import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, Calendar, Compass, Users, 
    Receipt, BookOpen, Ticket, Map, Globe, MessageCircle,
    CalendarDays, Binoculars, GripHorizontal, HelpCircle, Heart
} from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
import { HubView } from './HubLayout';
import { useUser } from '../context/UserContext';
import { useChat } from '../context/ChatContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useTheme } from '../context/ThemeContext';

interface FloatingHubNavProps {
  activeView: HubView;
  onViewChange: (view: HubView) => void;
  onOpenMap?: () => void;
  forceVisible?: boolean;
  onSwitchToHost?: () => void;
  onToggleOverview?: () => void;
  isOverviewOpen?: boolean;
}

// App Definition Map
const APP_DEFINITIONS: Record<string, any> = {
    'overview': { icon: LayoutDashboard, label: 'Journal', description: 'Overview & Timeline', color: 'bg-blue-600', textColor: 'text-blue-400', glow: 'shadow-blue-600/40' },
    'rsvp': { icon: Ticket, label: 'RSVP', description: 'Confirm Attendance', color: 'bg-orange-500', textColor: 'text-orange-400', glow: 'shadow-orange-500/40' },
    'logistics': { icon: Compass, label: 'Plan', description: 'Flights & Hotels', color: 'bg-cyan-500', textColor: 'text-cyan-400', glow: 'shadow-cyan-500/40' },
    'calendar': { icon: Calendar, label: 'Agenda', description: 'Official Schedule', color: 'bg-amber-500', textColor: 'text-amber-400', glow: 'shadow-amber-500/40' },
    'activities': { icon: Binoculars, label: 'Explore', description: 'Local Experiences', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/40' },
    'guide': { icon: BookOpen, label: 'Guide', description: 'Tips & Etiquette', color: 'bg-teal-500', textColor: 'text-teal-400', glow: 'shadow-teal-500/40' },
    'faq': { icon: HelpCircle, label: 'FAQ', description: 'Common Questions', color: 'bg-violet-500', textColor: 'text-violet-400', glow: 'shadow-violet-500/40' },
    'map': { icon: Map, label: 'Map', description: 'Interactive Atlas', color: 'bg-indigo-500', textColor: 'text-indigo-400', glow: 'shadow-indigo-500/40' },
    'registry': { icon: Users, label: 'Registry', description: 'Guest Directory', color: 'bg-rose-500', textColor: 'text-rose-400', glow: 'shadow-rose-500/40' },
    'expenses': { icon: Receipt, label: 'Ledger', description: 'Split Expenses', color: 'bg-emerald-500', textColor: 'text-emerald-400', glow: 'shadow-emerald-500/40' },
    'messages': { icon: MessageCircle, label: 'Messages', description: 'Group Chat', color: 'bg-green-500', textColor: 'text-green-400', glow: 'shadow-green-500/40' }
};

// Category Structure
const NAV_CATEGORIES = [
    { 
        id: 'planning', 
        label: 'Planning', 
        description: 'Logistics',
        icon: CalendarDays, 
        children: ['rsvp', 'logistics', 'calendar'],
        color: 'text-amber-400'
    },
    { 
        id: 'explore', 
        label: 'Explore', 
        description: 'Discover',
        icon: Globe, 
        children: ['activities', 'guide', 'map'],
        color: 'text-fuchsia-400'
    },
    { 
        id: 'connect', 
        label: 'Connect', 
        description: 'Community',
        icon: Heart, 
        children: ['registry', 'expenses'],
        color: 'text-rose-400'
    },
    { 
        id: 'messages', 
        label: 'Messages', 
        description: 'Chat',
        icon: MessageCircle, 
        target: 'messages',
        color: 'text-green-400'
    }
];

export const FloatingHubNav: React.FC<FloatingHubNavProps> = ({ 
    activeView, 
    onViewChange,
    onOpenMap,
    forceVisible = false,
    onSwitchToHost,
    onToggleOverview,
    isOverviewOpen
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  
  const { user } = useUser();
  const { unreadTotal } = useChat();
  const { config } = useAppConfig();
  const { theme } = useTheme();

  // Handle dock visibility
  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (isTouch) {
      // On touch devices, visibility is based on forceVisible prop
      setIsVisible(!!forceVisible);
      return; // No mouse listener needed
    }

    // --- Desktop logic ---
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const threshold = 100;
        const distanceToBottom = window.innerHeight - e.clientY;

        if (distanceToBottom < threshold || activeStack || forceVisible) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
        rafRef.current = null;
      });
    };

    // Set initial state based on props and add listener
    if (forceVisible || activeStack) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [forceVisible, activeStack]);

  // Click outside to close stack
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (navRef.current && !navRef.current.contains(event.target as Node)) {
              setActiveStack(null);
              // If on touch/mobile, close dock on outside click too
              if (window.matchMedia('(pointer: coarse)').matches) {
                  setIsVisible(false);
              }
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (category: typeof NAV_CATEGORIES[0]) => {
      if (category.target) {
          onViewChange(category.target as HubView);
          setActiveStack(null);
          // Auto close on mobile selection
          if (window.matchMedia('(pointer: coarse)').matches) setIsVisible(false);
      } else {
          setActiveStack(prev => prev === category.id ? null : category.id);
      }
  };

  const handleAppClick = (appId: string) => {
      if (appId === 'map' && onOpenMap) onOpenMap();
      else onViewChange(appId as HubView);
      setActiveStack(null);
      if (window.matchMedia('(pointer: coarse)').matches) setIsVisible(false);
  };

  const isModuleEnabled = (id: string) => {
      if (id === 'overview') return true;
      const mod = config.modules.find(m => m.id === id);
      return mod ? mod.isEnabled : true;
  };

  // Badge Logic
  const getCategoryBadge = (categoryId: string, children?: string[]) => {
      // Messages Badge
      if (categoryId === 'messages' && unreadTotal > 0) {
          return <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full border-2 border-gray-900 flex items-center justify-center">{unreadTotal}</div>;
      }
      
      // Planning Badge (RSVP)
      if (categoryId === 'planning' && user) {
          if (user.status === 'Pending') return <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-gray-900 animate-pulse" />;
      }

      return null;
  };

  // Gesture Handlers
  const handlePillDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Swipe Up -> Open Launcher (Dock)
      if (info.offset.y < -30) {
          setIsVisible(true);
      }
  };

  const handlePillTap = () => {
      if (onToggleOverview) onToggleOverview();
  };

  return (
    <>
        {/* Persistent Home Pill */}
        <div className="fixed bottom-2 left-0 right-0 z-[130] flex justify-center pb-safe pointer-events-none group">
            <motion.div 
                id="webos-home-pill"
                className={`relative w-20 h-1 md:w-28 md:h-1.5 rounded-full cursor-pointer pointer-events-auto backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] border transition-all duration-300 overflow-hidden
                    ${theme === 'light' 
                        ? 'bg-black/10 hover:bg-black/20 active:bg-black/30 border-black/10' 
                        : 'bg-white/20 hover:bg-white/40 active:bg-white border-white/10'
                    }
                `}
                whileTap={{ scale: 0.95, backgroundColor: theme === 'light' ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)" }}
                whileHover={{ scale: 1.05 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={handlePillDragEnd}
                onClick={handlePillTap}
                style={{ touchAction: 'none' }} // Prevent browser scrolling capture
            >
                {/* Flowing Trace Animation */}
                <motion.div 
                    className={`absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 ${theme === 'light' ? 'via-black/20' : 'via-white/50'}`}
                    initial={{ x: '-150%' }}
                    animate={{ x: '350%' }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        ease: "easeInOut", 
                        repeatDelay: 1.5 
                    }}
                />
            </motion.div>
        </div>

        {/* Navigation Dock */}
        <div ref={navRef} id="hub-navigation-dock" className="fixed bottom-8 left-0 right-0 z-[120] flex flex-col items-center justify-end pointer-events-none px-4 pb-safe">
        
        <div 
            className={`
                transition-all duration-700 cubic-bezier(0.16,1,0.3,1) origin-bottom
                ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95'}
            `}
        >
            <div className="relative">
                {/* STACKS OVERLAY */}
                {NAV_CATEGORIES.map((cat) => {
                    const isOpen = activeStack === cat.id;
                    if (!cat.children) return null;

                    const enabledChildren = cat.children.filter(id => isModuleEnabled(id));
                    if (enabledChildren.length === 0) return null;

                    return (
                        <div 
                            key={`${cat.id}-stack`}
                            className={`
                                absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-3
                                transition-all duration-300 origin-bottom
                                ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none translate-y-4'}
                            `}
                            style={{ 
                                left: `${(NAV_CATEGORIES.indexOf(cat)) * 84}px`, 
                                transform: `translateX(-50%) ${isOpen ? 'translateY(0)' : 'translateY(20px)'}`
                            }}
                        >
                            {enabledChildren.map((appId, idx) => {
                                const app = APP_DEFINITIONS[appId];
                                const isActive = activeView === appId && !isOverviewOpen;
                                return (
                                    <button
                                        key={appId}
                                        onClick={() => handleAppClick(appId)}
                                        className={`
                                            group flex items-center gap-4 p-1.5 pr-5 rounded-full backdrop-blur-xl border shadow-xl transition-all duration-300 text-left
                                            ${theme === 'light' 
                                                ? `border-black/10 ${isActive ? 'bg-black/5' : 'bg-white/90 hover:bg-gray-200'}`
                                                : `border-white/10 ${isActive ? 'bg-white/10' : 'bg-gray-900/90 hover:bg-gray-800'}`
                                            }
                                        `}
                                        style={{ transitionDelay: `${idx * 50}ms` }}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${app.color} text-white shadow-lg ${app.glow} shrink-0`}>
                                            <app.icon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap leading-none ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                                {app.label}
                                            </span>
                                            <span className={`text-[9px] font-medium whitespace-nowrap leading-none mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {app.description}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}

                {/* MAIN DOCK */}
                <div className="pointer-events-auto flex items-center gap-4">
                    <nav className={`backdrop-blur-2xl border p-2 rounded-[2.5rem] shadow-2xl flex items-end gap-3 md:gap-4 ring-1
                        ${theme === 'light' 
                            ? 'bg-white/80 border-black/10 ring-black/5' 
                            : 'bg-gray-900/80 border-white/10 ring-black/50'
                        }
                    `}>
                        {NAV_CATEGORIES.map((cat) => {
                            const isChildActive = cat.children?.includes(activeView as string);
                            const isTargetActive = cat.target === activeView;
                            const isActive = (isChildActive || isTargetActive || activeStack === cat.id) && !isOverviewOpen;
                            const isHovered = hoveredCategory === cat.id;
                            
                            if (cat.children && cat.children.filter(id => isModuleEnabled(id)).length === 0) return null;
                            if (cat.target && !isModuleEnabled(cat.target)) return null;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    onMouseEnter={() => setHoveredCategory(cat.id)}
                                    onMouseLeave={() => setHoveredCategory(null)}
                                    className={`
                                        group flex flex-col items-center justify-end gap-1.5
                                        min-w-[42px] md:min-w-[52px] 
                                        pb-2 pt-2 px-1
                                        rounded-[1.25rem] transition-all duration-300 relative
                                        ${isActive 
                                            ? (theme === 'light' ? 'bg-black/10' : 'bg-white/10')
                                            : (theme === 'light' ? 'hover:bg-black/5' : 'hover:bg-white/5')
                                        }
                                    `}
                                >
                                    {isHovered && !activeStack && (
                                        <div className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[9px] font-bold rounded-lg shadow-xl border whitespace-nowrap pointer-events-none animate-in fade-in slide-in-from-bottom-1 z-50
                                            ${theme === 'light' ? 'bg-white text-black border-black/10' : 'bg-gray-900 text-white border-white/10'}
                                        `}>
                                            {cat.description}
                                            <div className={`absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent ${theme === 'light' ? 'border-t-white' : 'border-t-gray-900'}`} />
                                        </div>
                                    )}

                                    <div className={`
                                        w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all duration-500 relative
                                        ${isActive 
                                            ? `shadow-lg -translate-y-1.5 scale-110 ${theme === 'light' ? 'bg-med-blue text-white' : 'bg-white text-med-blue'}`
                                            : `group-hover:scale-105 group-active:scale-95 ${theme === 'light' ? 'bg-gray-200 text-gray-700 group-hover:bg-gray-300' : `bg-gray-800 ${cat.color} group-hover:bg-gray-700`}`
                                        }
                                    `}>
                                        <cat.icon 
                                            size={isActive ? 16 : 14} 
                                            strokeWidth={isActive ? 2.5 : 2} 
                                            className="transition-all duration-300"
                                        />
                                        {isActive && (
                                            <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${theme === 'light' ? 'bg-med-blue shadow-[0_0_8px_#3B82F6]' : 'bg-white shadow-[0_0_8px_white]'}`} />
                                        )}
                                        {getCategoryBadge(cat.id, cat.children)}
                                    </div>
                                    <span className={`
                                        text-[6px] md:text-[7px] font-bold uppercase tracking-wider leading-none transition-all duration-300
                                        ${isActive ? (theme === 'light' ? 'text-black' : 'text-white') : (theme === 'light' ? 'text-gray-600 group-hover:text-black' : 'text-gray-400 group-hover:text-gray-200')}
                                    `}>
                                        {cat.label}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};
