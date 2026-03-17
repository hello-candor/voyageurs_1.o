
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
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeApp === null) {
        setIsVisible(true);
    }
  }, [activeApp]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            const threshold = 60; // further reduced
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
    <div ref={dockRef} className="absolute bottom-2 left-0 right-0 z-[250] flex flex-col items-center justify-end pointer-events-none px-4">
      <div 
        className={`
            transition-all duration-300 cubic-bezier(0.16,1,0.3,1) origin-bottom
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}
        `}
      >
        <div className="relative">
            
            {activeStack === 'build' && (
                <div 
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1.5 transition-all duration-300 origin-bottom pointer-events-auto"
                >
                    {BUILD_STACK.map((sub, idx) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className="flex items-center gap-2 p-0.5 pr-2.5 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:bg-gray-800 transition-colors group animate-in slide-in-from-bottom-1 fade-in duration-300"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gray-800 border-white/5 shadow ${sub.color}`}>
                                <sub.icon size={10} />
                            </div>
                            <span className="text-[8px] font-semibold text-gray-300 group-hover:text-white uppercase tracking-wider whitespace-nowrap">{sub.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="pointer-events-auto flex items-center gap-4">
                <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 p-1 rounded-full shadow-2xl flex items-center gap-1 ring-1 ring-black/50">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeApp === item.id || activeStack === item.id;
                        return (
                            <button
                                key={item.id}
                                id={`host-dock-btn-${item.id}`}
                                onClick={() => handleItemClick(item.id, item.hasStack)}
                                title={item.label}
                                className={`
                                    group flex items-center justify-center
                                    w-9 h-9
                                    rounded-full transition-all duration-300 relative
                                    ${isActive ? 'bg-med-terracotta/80' : 'hover:bg-white/10'}
                                `}
                            >
                                <item.icon 
                                    size={16} 
                                    className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                                />
                                {item.hasStack && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-50" />}
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
