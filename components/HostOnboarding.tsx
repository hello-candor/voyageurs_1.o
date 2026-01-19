
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAppConfig } from '../context/AppConfigContext';
import { DEFAULT_CONFIG } from '../data/defaults';
import { Button } from './Button';
import { ArrowRight, Sparkles, MapPin, Calendar, User, Mail, PenTool } from 'lucide-react';

interface HostOnboardingProps {
    onComplete: () => void;
}

export const HostOnboarding: React.FC<HostOnboardingProps> = ({ onComplete }) => {
    // Destructure login as updateUserProfile to match the logic flow
    const { login: updateUserProfile } = useUser();
    const { updateConfig } = useAppConfig();
    const [isFinishing, setIsFinishing] = useState(false);
    
    const [formData, setFormData] = useState({
        appName: "Bryan's 40th",
        destination: "Montpellier",
        occasion: "The 40th Birthday",
        hostName: "",
        hostEmail: ""
    });

    const handleFinish = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsFinishing(true);

        try {
            // 1. Create the Host User Profile
            // CRITICAL FIX: Added 'await' so this finishes before we proceed
            // updateUserProfile is an async function from UserContext (login)
            await updateUserProfile(
                formData.hostName, 
                formData.hostEmail, 
                1, 
                'Confirmed', 
                '', 
                '', 
                {}, 
                { shareSocial: true, sharePhone: true, shareInterests: true, publicRegistry: true }
            );

            // 2. Configure the App
            // We also await this to ensure config is saved before completion
            await updateConfig({
                appName: formData.appName,
                destination: formData.destination,
                occasion: formData.occasion,
                welcomeMessage: `Welcome to ${formData.destination}`,
                enableAI: true, // Default to enabled for hosts
                modules: DEFAULT_CONFIG.modules
            });
            
        } catch (error) {
            console.error("Onboarding configuration error:", error);
        } finally {
            // 3. Finish
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
                    <h2 className="font-serif text-3xl text-white mb-2">Event Setup</h2>
                    <p className="text-slate-400 text-sm">Configure your Voyageurs experience.</p>
                </div>

                <form onSubmit={handleFinish} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2">Host Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.hostName}
                                        onChange={(e) => setFormData({...formData, hostName: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors"
                                        placeholder="Jean Dupont"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                                <div className="relative">
                                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.hostEmail}
                                        onChange={(e) => setFormData({...formData, hostEmail: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors"
                                        placeholder="host@example.com"
                                    />
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
                                <input 
                                    type="text" 
                                    required
                                    value={formData.appName}
                                    onChange={(e) => setFormData({...formData, appName: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors"
                                    placeholder="e.g. Bryan's 40th"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.destination}
                                        onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors"
                                        placeholder="e.g. Montpellier"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Occasion</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.occasion}
                                        onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-med-blue outline-none transition-colors"
                                        placeholder="e.g. Birthday Trip"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="action" 
                            size="lg"
                            isLoading={isFinishing}
                            loadingText="Creating Hub..."
                            disabled={!formData.hostName || !formData.hostEmail || !formData.appName}
                        >
                            Initialize App <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
