import React, { useState, useEffect } from 'react';
import { ArrowRight, X, CalendarCheck } from 'lucide-react';
import { safeStorage } from '../utils/storage';

export const RSVPPrompt: React.FC<{ onRSVP?: () => void }> = ({ onRSVP }) => {
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
        if (onRSVP) {
            onRSVP();
        } else {
            window.dispatchEvent(new Event('open_login'));
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="hidden lg:block fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-24 z-[310] max-w-xs animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl text-slate-800 dark:text-white rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 p-6 min-h-[200px] min-w-[240px] flex flex-col justify-center group">
                
                {/* Accent glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-med-terracotta/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-med-blue/20 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white rounded-full transition-all z-10"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col h-full relative z-10 p-2">
                    <div className="text-center w-full">
                        <h3 className="font-heading font-bold text-2xl leading-tight text-med-blue dark:text-white">Got An Invite?</h3>
                    </div>

                    <div className="flex flex-col w-full gap-2 mt-auto pt-6">
                        <button 
                            onClick={handleRSVP}
                            className="btn-terracotta w-full py-3.5 text-xs gap-2"
                        >
                            RSVP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
