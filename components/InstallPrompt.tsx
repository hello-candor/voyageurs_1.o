
import React, { useState, useEffect } from 'react';
import { Download, Share, X, PlusSquare } from 'lucide-react';
import { safeStorage } from '../utils/storage';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if previously dismissed
        const isDismissed = safeStorage.getItem('install_prompt_dismissed');
        if (isDismissed) return;

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

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:bottom-24 z-[300] max-w-xs animate-in slide-in-from-bottom-10 fade-in duration-700 ease-out">
            <div className="relative overflow-hidden bg-med-blue dark:bg-slate-800 text-white rounded-3xl shadow-2xl border border-white/10 dark:border-gray-700 p-5 group">
                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-2 text-white/40 hover:text-white rounded-full transition-all"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                    <div className="p-3 bg-white/10 rounded-2xl shadow-inner">
                        <Download size={24} className="text-white" />
                    </div>

                    <div>
                        <h3 className="font-bold text-lg leading-tight">Install App</h3>
                        <p className="text-xs text-white/70 mt-1">Add to home screen for offline access.</p>
                    </div>

                    {isIOS ? (
                        <div className="text-[10px] bg-white/10 rounded-xl p-3 w-full border border-white/5">
                            <p className="flex items-center justify-center gap-1.5 mb-2">
                                Tap <Share size={12} /> then <span className="font-bold">Add to Home Screen</span>
                            </p>
                            <div className="w-full h-0.5 bg-white/10 mb-2" />
                            <div className="flex items-center justify-center gap-1.5 opacity-70">
                                <PlusSquare size={12} /> <span className="font-bold">Add</span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-white text-med-blue dark:text-slate-900 hover:bg-med-terracotta hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95"
                        >
                            Install Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
