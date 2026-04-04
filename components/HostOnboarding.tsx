
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppConfig } from '../context/AppConfigContext';
import { DEFAULT_CONFIG } from '../data/defaults';
import { Button } from './Button';
import { ArrowRight, Sparkles, MapPin, Calendar, User, Mail, PenTool, Globe } from 'lucide-react';

interface HostOnboardingProps {
    onComplete: () => void;
}

export const HostOnboarding: React.FC<HostOnboardingProps> = ({ onComplete }) => {
    const { loginHostWithGoogle, firebaseUser, isLoading: authLoading } = useAuth();
    const { updateConfig } = useAppConfig();
    const [isFinishing, setIsFinishing] = useState(false);
    
    const [formData, setFormData] = useState({
        appName: "September 18-20",
        destination: "",
        occasion: "The 40th Birthday",
        hostName: "",
        hostEmail: ""
    });

    useEffect(() => {
        if (firebaseUser) {
            setFormData(prev => ({
                ...prev,
                hostName: firebaseUser.displayName || prev.hostName,
                hostEmail: firebaseUser.email || prev.hostEmail,
            }));
        }
    }, [firebaseUser]);

    const handleFinish = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!firebaseUser) {
            alert("Please sign in with Google first.");
            return;
        }

        setIsFinishing(true);

        try {
            // App config is the primary task here
            await updateConfig({
                appName: formData.appName,
                destination: formData.destination,
                occasion: formData.occasion,
                welcomeMessage: `Welcome to ${formData.destination}`,
                enableAI: true, // Default to enabled for hosts
                modules: DEFAULT_CONFIG.modules,
                // Associate the config with the host
                hostId: firebaseUser.uid,
            });
            
        } catch (error) {
            console.error("Onboarding configuration error:", error);
        } finally {
            setTimeout(() => {
                setIsFinishing(false);
                onComplete();
            }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-med-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-med-blue/20">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h2 className="font-serif text-3xl text-white mb-2">Host Setup</h2>
                    <p className="text-slate-400 text-sm">Let's configure your event experience.</p>
                </div>

                {!firebaseUser ? (
                    <div className="text-center">
                         <p className="text-slate-400 text-sm mb-6">To get started, please sign in with your Google account. This will be used to manage your event.</p>
                        <Button 
                            onClick={loginHostWithGoogle}
                            variant="secondary"
                            size="lg"
                            isLoading={authLoading}
                            loadingText="Redirecting..."
                        >
                           <Globe size={16} className="mr-2"/> Sign In with Google
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleFinish} className="space-y-6 animate-in fade-in duration-500">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2">Host Identity (from Google)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="text" readOnly value={formData.hostName} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white/70 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="email" readOnly value={formData.hostEmail} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white/70 cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2">Event Details</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">App Name</label>
                                <div className="relative">
                                    <PenTool size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" required value={formData.appName} onChange={(e) => setFormData({...formData, appName: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors" placeholder="e.g. September 18-20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="text" required value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors" placeholder="e.g. " />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Occasion</label>
                                    <div className="relative">
                                        <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="text" required value={formData.occasion} onChange={(e) => setFormData({...formData, occasion: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors" placeholder="e.g. Birthday Trip" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" fullWidth variant="action" size="lg" isLoading={isFinishing} loadingText="Finalizing Setup..." disabled={!formData.appName}>
                                Complete Setup <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
