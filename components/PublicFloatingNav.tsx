
import React, { useState, useEffect } from 'react';
import { 
    ArrowUp, MapPin, Calendar, Image, Ticket, Sparkles, Compass
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface PublicFloatingNavProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  onRSVP: () => void;
}

export const PublicFloatingNav: React.FC<PublicFloatingNavProps> = ({ 
    activeSection, 
    onNavigate,
    onRSVP
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { user, hasRSVPd } = useUser();
  
  const navItems = [
    { 
        id: 'montpellier-info', 
        icon: MapPin, 
        label: 'City', 
        color: 'bg-med-blue',
        glow: 'shadow-med-blue/40'
    },
    { 
        id: 'celebration', 
        icon: Calendar, 
        label: 'Events', 
        color: 'bg-med-terracotta',
        glow: 'shadow-med-terracotta/40'
    },
    { 
        id: 'gallery', 
        icon: Image, 
        label: 'Vibe', 
        color: 'bg-med-olive',
        glow: 'shadow-med-olive/40'
    },
    { 
        id: 'rsvp', 
        icon: Ticket, 
        label: user ? (hasRSVPd ? 'Hub' : 'Join') : 'Join', 
        isAction: true, 
        color: 'bg-fuchsia-600',
        glow: 'shadow-fuchsia-600/40'
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[140] w-full px-4 pointer-events-none flex justify-center">
      <div 
        className={`
            transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform
            ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}
        `}
      >
        <nav className="pointer-events-auto bg-gray-900/90 dark:bg-black/80 backdrop-blur-3xl border border-white/20 p-2 rounded-[2.5rem] shadow-2xl flex items-center gap-1.5 md:gap-2 ring-1 ring-black/10">
            {navItems.map((item) => {
                const isActive = !item.isAction && activeSection === item.id;
                
                return (
                    <button
                        key={item.id}
                        onClick={(e) => {
                            e.preventDefault();
                            if (item.isAction) onRSVP();
                            else onNavigate(item.id);
                        }}
                        className={`group flex flex-col items-center justify-center gap-1 min-w-[60px] md:min-w-[70px] py-2 rounded-[2rem] transition-all duration-300 relative
                            ${isActive ? 'scale-105' : 'active:scale-95'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-500 relative
                            ${isActive || item.isAction ? `${item.color} ${item.glow} text-white shadow-lg ring-2 ring-white/20 -translate-y-2` : 'bg-gray-800 dark:bg-white/10 text-gray-400 dark:text-white/40'}
                        `}>
                            {item.isAction && !user ? (
                                <Sparkles size={18} className="animate-pulse" />
                            ) : (
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            )}
                        </div>
                        
                        <span className={`
                            text-[9px] font-bold uppercase tracking-wider transition-all duration-300 leading-none
                            ${isActive ? 'text-white opacity-100 translate-y-0' : 'text-gray-400 opacity-0 -translate-y-2 absolute top-full mt-1'}
                        `}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
      </div>
    </div>
  );
};
