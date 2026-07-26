import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Moon, Sun, RefreshCw, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export interface AppMenuItem {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    danger?: boolean;
}

export interface UnifiedHeaderProps {
    title?: string;
    subtitle?: string;
    showAppMenu?: boolean;
    appMenuItems?: AppMenuItem[];
    menuHeader?: React.ReactNode;
    onLogoClick?: () => void;
    centerContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    className?: string;
}

export const UnifiedHeader = ({
    title = "Voyageurs",
    subtitle,
    showAppMenu = true,
    appMenuItems = [],
    menuHeader,
    onLogoClick,
    centerContent,
    rightContent,
    className = ""
}: UnifiedHeaderProps) => {
    const { theme, toggleTheme } = useTheme();
    const { resetRSVP } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Default global actions if none provided
    const defaultActions: AppMenuItem[] = [
        {
            label: theme === 'dark' ? 'Light Mode' : 'Dark Mode',
            icon: theme === 'dark' ? Sun : Moon,
            onClick: toggleTheme
        },
        {
            label: 'Reset RSVP',
            icon: RefreshCw,
            onClick: () => resetRSVP()
        }
    ];

    const menuItems = appMenuItems.length > 0 ? appMenuItems : defaultActions;

    return (
        <div className={`absolute top-0 left-0 right-0 z-[110] h-12 flex items-center justify-between px-4 md:px-6 pointer-events-none transition-all duration-300 ${className}`}>
            {/* LEFT: App Menu */}
            <div className="flex items-center gap-3 pointer-events-auto h-full py-1 relative" ref={menuRef}>
                <button 
                    onClick={() => {
                        if (showAppMenu) setIsMenuOpen(!isMenuOpen);
                        else if (onLogoClick) onLogoClick();
                    }}
                    className={`flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg transition-colors ${showAppMenu ? (theme === 'light' ? 'hover:bg-gray-100/50' : 'hover:bg-white/10') : ''}`}
                >
                    <img src="/assets/voyageurs-icon.png" alt="Voyageurs" className="w-6 h-6 md:w-7 md:h-7 object-contain drop-shadow-md" />
                    <div className="flex flex-col justify-center leading-none text-left">
                        <div className="flex items-center gap-1.5">
                            <span className={`font-serif font-bold text-sm md:text-base tracking-tight whitespace-nowrap transition-colors duration-500 drop-shadow-sm ${theme === 'light' ? 'text-med-blue' : 'text-white'}`}>
                                {title}
                            </span>
                            {showAppMenu && (
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''} ${theme === 'light' ? 'text-med-terracotta' : 'text-white/50'}`} />
                            )}
                        </div>
                        {subtitle && (
                            <span className={`text-[8px] uppercase tracking-[0.2em] font-sans hidden md:block mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-white/70'}`}>
                                {subtitle}
                            </span>
                        )}
                    </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`absolute top-[110%] left-0 mt-2 w-56 rounded-2xl shadow-2xl border overflow-hidden ${theme === 'light' ? 'bg-white/95 border-gray-200' : 'bg-[#1a202c]/95 border-white/10 backdrop-blur-xl'}`}
                        >
                            {menuHeader && (
                                <div className={`p-4 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/10'}`}>
                                    {menuHeader}
                                </div>
                            )}
                            <div className="py-2">
                                {menuItems.map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => { item.onClick(); setIsMenuOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wide transition-colors text-left
                                                ${item.danger 
                                                    ? 'text-red-500 hover:bg-red-500/10' 
                                                    : (theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-white/80 hover:bg-white/10 hover:text-white')
                                                }
                                            `}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CENTER */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto h-full">
                {centerContent}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 pointer-events-auto h-full py-1">
                {rightContent}
            </div>
        </div>
    );
};
