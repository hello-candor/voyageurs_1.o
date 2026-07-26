import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, RefreshCw, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
export interface AppMenuItem {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    danger?: boolean;
}

export interface MarketingHeaderProps {
    appMenuItems?: AppMenuItem[];
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
    appMenuItems = []
}) => {
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

    const defaultActions: AppMenuItem[] = [
        {
            label: 'Reset RSVP',
            icon: RefreshCw,
            onClick: () => resetRSVP()
        }
    ];

    const menuItems = appMenuItems.length > 0 ? appMenuItems : defaultActions;

    return (
        <div className="absolute top-6 left-0 right-0 z-[110] px-4 flex justify-center pointer-events-none">
            <nav className="w-full max-w-2xl mx-auto flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/95 backdrop-blur-xl border border-med-blue/10 dark:border-white/10 rounded-full shadow-lg transition-all duration-500 pointer-events-auto relative">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img
                        src="/assets/voyageurs-icon.png"
                        alt="Voyageurs"
                        className="h-8 w-8 object-contain dark:brightness-0 dark:invert"
                    />
                    <span className="text-[13px] font-body font-bold uppercase tracking-[0.3em] text-med-blue dark:text-white hidden sm:inline-block">
                        Voyageurs
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 hover:text-med-blue dark:hover:text-white transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center justify-center gap-1 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 transition-colors"
                        >
                            <User size={16} />
                        </button>
                        
                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className={`absolute top-full right-0 mt-3 w-48 rounded-2xl shadow-2xl border overflow-hidden ${theme === 'light' ? 'bg-white/95 border-gray-200' : 'bg-[#1a202c]/95 border-white/10 backdrop-blur-xl'}`}
                                >
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
                </div>
            </nav>
        </div>
    );
};
