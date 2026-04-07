import React from 'react';
import { Home, Lightbulb, Grid, DollarSign, BookOpen } from 'lucide-react';

export const MobileNav: React.FC = () => {
    const isJournal = window.location.pathname === '/journal';
    const baseUrl = isJournal ? '/' : '';

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[400] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around px-2 py-3">
                <a href={baseUrl || '#'} className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${!isJournal && window.location.hash === '' ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <Home size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                </a>
                <a href={`${baseUrl}#philosophy`} className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${window.location.hash === '#philosophy' ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <Lightbulb size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">About</span>
                </a>
                <a href={`${baseUrl}#features`} className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${window.location.hash === '#features' ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <Grid size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Features</span>
                </a>
                <a href={`${baseUrl}#pricing`} className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${window.location.hash === '#pricing' ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <DollarSign size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Pricing</span>
                </a>
                <a href="/journal" className={`flex flex-col items-center gap-1 flex-1 p-1 transition-colors ${isJournal ? 'text-med-blue dark:text-white' : 'text-slate-500 hover:text-med-blue dark:text-slate-400 dark:hover:text-white'}`}>
                    <BookOpen size={20} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Journal</span>
                </a>
            </div>
        </div>
    );
};
