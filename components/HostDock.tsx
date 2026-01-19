
import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, Users, Radio, Palette, Settings, 
    Calendar, Utensils, Bed, Mountain, Sparkles
} from 'lucide-react';

export type AdminApp = 'dashboard' | 'guests' | 'communications' | 'build' | 'setup';

interface HostDockProps {
  activeApp: AdminApp | null;
  onLaunchApp: (app: AdminApp, context?: any) => void;
  onClose?: () => void;
  onLogout?: () => void;
}

// Sub-app definitions for the "Build" stack reordered for Guest Journey
// Consolidated Identity, Landing, Celebration, Gallery into "Experience"
const BUILD_STACK = [
    { id: 'experience', label: 'Experience', icon: Sparkles, color: 'text-indigo-400' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, color: 'text-amber-400' },
    { id: 'dining', label: 'Dining', icon: Utensils, color: 'text-orange-400' },
    { id: 'hotels', label: 'Hotels', icon: Bed, color: 'text-blue-400' },
    { id: 'activities', label: 'Activities', icon: Mountain, color: 'text-cyan-400' },
];

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Command', icon: LayoutDashboard },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'build', label: 'Builder', icon: Palette, hasStack: true },
    { id: 'communications', label: 'Comms', icon: Radio },
    { id: 'setup', label: 'Config', icon: Settings },
];

export const HostDock: React.FC<HostDockProps> = ({ 
    activeApp, 
    onLaunchApp, 
    onClose, 
    onLogout 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Automatically show dock when no app is focused
  useEffect(() => {
    if (activeApp === null) {
        setIsVisible(true);
    }
  }, [activeApp]);

  // Mouse proximity logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            const threshold = 140; 
            const distanceToBottom = window.innerHeight - e.clientY;
            if (distanceToBottom < threshold || activeStack || activeApp === null) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            rafRef.current = null;
        });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeStack, activeApp]);

  useEffect(() => {
      const handleOutside = (e: MouseEvent) => {
          if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
              setActiveStack(null);
          }
      }
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleItemClick = (id: string, hasStack?: boolean) => {
      if (hasStack) {
          setActiveStack(prev => prev === id ? null : id);
      } else {
          onLaunchApp(id as AdminApp);
          setActiveStack(null);
      }
  };

  const handleSubItemClick = (subId: string) => {
      onLaunchApp('build', subId);
      setActiveStack(null);
  };

  return (
    <div ref={dockRef} className="absolute bottom-8 left-0 right-0 z-[250] flex flex-col items-center justify-end pointer-events-none px-4">
      <div 
        className={`
            transition-all duration-500 cubic-bezier(0.16,1,0.3,1) origin-bottom
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95'}
        `}
      >
        <div className="relative">
            
            {/* BUILDER STACK OVERLAY */}
            {activeStack === 'build' && (
                <div 
                    className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-3 transition-all duration-300 origin-bottom pointer-events-auto"
                >
                    {BUILD_STACK.map((sub, idx) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className="flex items-center gap-3 p-1 pr-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-xl hover:bg-gray-800 transition-colors group animate-in slide-in-from-bottom-2 fade-in duration-300"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 border border-white/5 shadow-lg ${sub.color}`}>
                                <sub.icon size={18} />
                            </div>
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wider whitespace-nowrap">{sub.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* MAIN DOCK */}
            <div className="pointer-events-auto flex items-center gap-4">
                
                <nav className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 p-3 rounded-[3.5rem] shadow-2xl flex items-end gap-2 md:gap-3 ring-1 ring-black/50">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeApp === item.id || activeStack === item.id;
                        
                        return (
                            <button
                                key={item.id}
                                id={`host-dock-btn-${item.id}`}
                                onClick={() => handleItemClick(item.id, item.hasStack)}
                                className={`
                                    group flex flex-col items-center justify-end gap-2
                                    min-w-[72px] pb-3 pt-3
                                    rounded-[2.5rem] transition-all duration-300 relative
                                    ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 relative
                                    ${isActive 
                                        ? `bg-med-terracotta text-white shadow-lg -translate-y-2 scale-110 shadow-med-terracotta/40` 
                                        : `bg-gray-800 text-gray-400 group-hover:text-white group-hover:bg-gray-700 group-hover:scale-105`
                                    }
                                `}>
                                    <item.icon 
                                        size={isActive ? 22 : 20} 
                                        strokeWidth={isActive ? 2.5 : 2} 
                                    />
                                    {item.hasStack && <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-50" />}
                                </div>
                                <span className={`
                                    text-[9px] font-bold uppercase tracking-wider leading-none transition-all duration-300
                                    ${isActive ? 'text-white translate-y-0' : 'text-gray-500 group-hover:text-gray-300'}
                                `}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
      </div>
    </div>
  );
};
