import React from 'react';
import { Mail, Lightbulb, Grid, DollarSign, BookOpen } from 'lucide-react';

interface MobileNavProps {
    onShowLogin?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onShowLogin }) => {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[400] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around px-2 py-3">
                <a href={`#philosophy`} className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${window.location.hash === '#philosophy' ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <Lightbulb size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">The Vision</span>
                </a>
                <a href={`#features`} className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${window.location.hash === '#features' ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <Grid size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">The Platform</span>
                </a>
                <button onClick={onShowLogin} className="flex flex-col items-center gap-1 flex-1 p-1 transition-colors text-med-terracotta dark:text-[#C25E3E]">
                    <Mail size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">RSVP</span>
                </button>
            </div>
        </div>
    );
};
