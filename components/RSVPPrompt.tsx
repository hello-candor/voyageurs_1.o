import React, { useState, useEffect } from 'react';
import { ArrowRight, X, CalendarCheck } from 'lucide-react';
import { safeStorage } from '../utils/storage';

export const RSVPPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Don't show if already confirmed or dismissed
        const isConfirmed = safeStorage.getItem('rsvp_confirmed');
        const isDismissed = safeStorage.getItem('rsvp_prompt_dismissed');
        
        if (isConfirmed || isDismissed) return;

        // Show after a short delay, before the install prompt (which is at 3s)
        const timer = setTimeout(() => setShowPrompt(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        safeStorage.setItem('rsvp_prompt_dismissed', 'true');
    };

    const handleRSVP = () => {
        setShowPrompt(false);
        window.dispatchEvent(new Event('open_login'));
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-24 z-[310] max-w-xs animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
            <div className="relative overflow-hidden bg-med-blue dark:bg-slate-800 text-white rounded-3xl shadow-2xl border border-white/10 dark:border-gray-700 p-5 min-h-[210px] min-w-[210px] flex flex-col justify-center group">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-2 text-white/40 hover:text-white rounded-full transition-all"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                    <div className="p-3 bg-white/10 rounded-2xl shadow-inner">
                        <CalendarCheck size={24} className="text-white" />
                    </div>

                    <div>
                        <h3 className="font-bold text-lg leading-tight">Join the Trip</h3>
                    </div>

                    <div className="flex flex-col w-full gap-2 pt-2 pb-2">
                        <button 
                            onClick={handleRSVP}
                            className="w-full bg-white text-med-blue dark:text-slate-900 hover:bg-med-terracotta hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            RSVP Now <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
