
import React, { useState, useEffect } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';
import { safeStorage } from '../utils/storage';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if previously dismissed or RSVP not confirmed
        const isDismissed = safeStorage.getItem('install_prompt_dismissed');
        const isRsvpConfirmed = safeStorage.getItem('rsvp_confirmed');
        if (isDismissed || !isRsvpConfirmed) return;

        // 1. Check for iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Check if already in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIosDevice && !isStandalone) {
            setIsIOS(true);
            // Show after a delay for iOS users to allow interaction first
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // 2. Check for Android/Desktop install event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt if not already installed and not dismissed
            if (!isStandalone && !isDismissed) {
                const timer = setTimeout(() => setShowPrompt(true), 3000); // 3s delay
                return () => clearTimeout(timer);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for RSVP confirmation to show prompt
        const handleRsvpChange = () => {
             // If RSVP just confirmed, wait for 3s to show prompt
             if (safeStorage.getItem('rsvp_confirmed') && !safeStorage.getItem('install_prompt_dismissed')) {
                 setTimeout(() => setShowPrompt(true), 3000);
             }
        };
        window.addEventListener('rsvp_changed', handleRsvpChange);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('rsvp_changed', handleRsvpChange);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        safeStorage.setItem('install_prompt_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="hidden lg:block fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-24 z-[300] max-w-xs animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
            <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl text-slate-800 dark:text-white rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/60 dark:border-white/10 p-6 min-h-[220px] min-w-[240px] flex flex-col justify-center group">
                
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-med-terracotta/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-med-blue/20 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white rounded-full transition-all z-10"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-2 relative z-10">
                    <div className="p-3 bg-med-terracotta/10 dark:bg-white/10 rounded-2xl shadow-inner text-med-terracotta dark:text-white ring-1 ring-med-terracotta/20 dark:ring-white/20">
                        <Download size={26} strokeWidth={1.5} />
                    </div>

                    <div>
                        <h3 className="font-heading text-2xl font-bold leading-tight text-med-blue dark:text-white">Get the App</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add to home screen for offline access.</p>
                    </div>

                    {isIOS ? (
                        <div className="text-[10px] bg-white/50 dark:bg-black/20 rounded-xl p-3 w-full border border-slate-200 dark:border-white/5">
                            <p className="flex items-center justify-center gap-1.5 mb-2 text-slate-600 dark:text-slate-300">
                                Tap <Share size={12} className="text-med-blue dark:text-white" /> then <span className="font-bold text-med-blue dark:text-white">Add to Home Screen</span>
                            </p>
                            <div className="w-full h-px bg-slate-200 dark:bg-white/10 mb-2" />
                            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
                                <PlusSquare size={12} /> <span className="font-bold">Add</span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-med-terracotta dark:bg-[#C25E3E] text-white hover:bg-[#bf6344] dark:hover:bg-[#a84e32] py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Install Now <Download size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
