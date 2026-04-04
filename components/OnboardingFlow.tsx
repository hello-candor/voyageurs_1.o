
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { safeStorage } from '../utils/storage';
import { User, Mail, Users, ShieldCheck, Globe, Loader2, MapPin, Calendar, ArrowRight, Plane, Sparkles, Check, Crosshair, Phone } from 'lucide-react';
import { isValidEmail, isValidName } from '../utils/validation';
import { Button } from './Button';
import { debounce } from 'lodash';

import { twilioService } from '../services/twilioService';
import { emailService } from '../services/emailService';
import { zapierService } from '../services/zapierService';
import { stripeService } from '../services/stripeService';
import { bigQueryService } from '../services/bigQueryService';
import { abacusService } from '../services/abacusService';

const GOOGLE_CLIENT_ID = "436751288359-kg1n1timqtrdr1damc19fertgocs8paf.apps.googleusercontent.com";

type Step = 'welcome' | 'rsvp' | 'preferences' | 'identity';

interface Suggestion {
    airport_name: string;
    iata_code: string;
    city_name: string;
    country_name: string;
}

export const OnboardingFlow: React.FC = () => {
    const { user, login, loginWithGoogle, submitRSVP, completeOnboarding, updateTravelDetails } = useUser();
    const { updateSettings, durationDays } = useTripPlanner();
    const { addNotification } = useNotification();
    const { logoutHost } = useAuth();

    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [isFinishing, setIsFinishing] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form State
    const [preferences, setPreferences] = useState({
        origin: '',
        arrivalDate: '2026-09-15',
        departureDate: '2026-09-22',
        guests: 1,
        destination: 'Montpellier, France',
        rsvpStatus: 'Pending' as 'Confirmed' | 'Declined' | 'Pending'
    });

    const [identity, setIdentity] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        publicRegistry: user?.privacy?.publicRegistry ?? true,
        smsConsent: user?.privacy?.smsConsent ?? true
    });

    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`/api/places?query=${query}`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            setSuggestions(data.data || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            setSuggestions([]);
        }
    };

    const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), []);

    const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPreferences({ ...preferences, origin: value });
        debouncedFetch(value);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        const formattedLocation = `${suggestion.city_name}, ${suggestion.country_name} (${suggestion.iata_code})`;
        setPreferences({ ...preferences, origin: formattedLocation });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            addNotification("Geolocation is not supported by your browser.", "error");
            return;
        }

        setIsLocating(true);
        setShowSuggestions(false);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`/api/places?lat=${latitude}&lon=${longitude}`);
                if (!response.ok) throw new Error('Failed to find nearby airport.');
                const data = await response.json();

                if (data.data) {
                    const nearest = data.data;
                    const formatted = `${nearest.city_name}, ${nearest.country_name} (${nearest.iata_code})`;
                    setPreferences(prev => ({ ...prev, origin: formatted }));
                    addNotification("We've found your nearest major airport!", "success");
                } else {
                    addNotification("Could not determine a nearby airport.", "error");
                }
            } catch (error) {
                addNotification("Could not determine a nearby airport.", "error");
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            addNotification("Location access denied. Please enable it in your browser settings.", "error");
            setIsLocating(false);
        });
    };

    useEffect(() => {
        if (user) {
            setIdentity(prev => ({ ...prev, name: user.name, email: user.email }));
        }
    }, [user]);

    const validateIdentity = () => {
        const newErrors: Record<string, string> = {};
        if (!isValidName(identity.name)) newErrors.name = "Name must be at least 2 characters.";
        if (!isValidEmail(identity.email)) newErrors.email = "Please enter a valid email.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleGoogleLogin = () => {
        setIsAuthLoading(true);
        const fallbackTimer = setTimeout(() => {
            if (isAuthLoading) {
                setIsAuthLoading(false);
                addNotification("Google Sign-In unavailable. Please use manual entry.", "error");
            }
        }, 3500);

        try {
            if (!(window as any).google) {
                clearTimeout(fallbackTimer);
                addNotification("Google Sign-In is loading...", "info");
                setIsAuthLoading(false);
                return;
            }

            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                use_fedcm_for_prompt: false,
                callback: async (response: any) => {
                    clearTimeout(fallbackTimer);
                    await loginWithGoogle(response.credential);
                    setIsAuthLoading(false);
                }
            });
            (window as any).google.accounts.id.prompt();
        } catch (err) {
            clearTimeout(fallbackTimer);
            console.error(err);
            setIsAuthLoading(false);
        }
    };

    const handleFinish = async () => {
        if (!validateIdentity()) return;
        setIsFinishing(true);

        const privacy = {
            shareSocial: true,
            sharePhone: true,
            shareInterests: true,
            publicRegistry: identity.publicRegistry,
            smsConsent: identity.smsConsent
        };

        if (privacy.smsConsent && identity.phone) {
            twilioService.sendWelcomeSMS(identity.name, identity.phone).catch(e => console.warn('Welcome SMS failed:', e));
        }

        // Sync to Zapier for external tracking (Google Sheets, etc.)
        zapierService.syncNewRegistration({
            name: identity.name,
            email: identity.email,
            phone: identity.phone,
            status: preferences.rsvpStatus,
            guests: preferences.guests
        }).catch(e => console.warn('Zapier Sync failed:', e));

        // Sync to Stripe for customer management/billing
        stripeService.handleNewRegistration({
            name: identity.name,
            email: identity.email,
            phone: identity.phone,
            guests: preferences.guests
        }).catch(e => console.warn('Stripe Sync failed:', e));

        // Append Analytical Data to BigQuery
        bigQueryService.trackRegistration({
            name: identity.name,
            email: identity.email,
            phone: identity.phone,
            status: preferences.rsvpStatus,
            guests: preferences.guests
        }).catch(e => console.warn('BigQuery Append failed:', e));

        // Notify Abacus Console for central orchestration
        abacusService.notifyRegistration({
            name: identity.name,
            email: identity.email,
            phone: identity.phone,
            guests: preferences.guests
        }).catch(e => console.warn('Abacus Sync failed:', e));

        // Send Welcome Email via SendGrid
        emailService.sendTemplateEmail(identity.email, 'WELCOME', { 
            name: identity.name, 
            url: window.location.origin 
        }).catch(e => console.warn('Welcome Email failed:', e));

        if (user) {
            submitRSVP({
                status: preferences.rsvpStatus as 'Confirmed' | 'Declined' | 'Pending',
                guestsCount: preferences.guests,
                privacy,
                phone: identity.phone
            });
        } else {
            login(identity.name, identity.email, preferences.guests, preferences.rsvpStatus as any, '', '', {}, privacy, identity.phone);
        }

        setTimeout(() => {
            updateTravelDetails({
                arrivalDate: preferences.arrivalDate,
                departureDate: preferences.departureDate,
                arrivalMode: 'Plane',
                arrivalNumber: '',
                accommodation: '',
                hub: preferences.origin
            });

            const start = new Date(preferences.arrivalDate);
            const end = new Date(preferences.departureDate);
            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            updateSettings(preferences.guests, diffDays || durationDays);

            safeStorage.removeItem('tour_seen');
            completeOnboarding();
        }, 800);
    };

    const ProgressBar = ({ step }: { step: number }) => (
        <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-med-terracotta' : 'bg-gray-100 dark:bg-gray-800'}`} />
            ))}
        </div>
    );

    if (currentStep === 'welcome') {
        return (
            <div className="max-w-md mx-auto w-full py-8 px-6 flex flex-col justify-center min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ProgressBar step={1} />
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-med-blue text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3 mb-6">
                        <Sparkles size={32} />
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl text-med-blue dark:text-white leading-tight">
                        Bienvenue,<br />
                        <span className="italic text-med-terracotta">Voyageur.</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                        You are invited to join the digital companion for Bryan's 40th Birthday celebration.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                        Let's set up your profile to sync your logistics, connect with guests, and build your itinerary.
                    </p>
                    <div className="pt-8">
                        <Button onClick={() => setCurrentStep('rsvp')} size="lg" fullWidth>
                            Start Journey <ArrowRight size={16} className="ml-2" />
                        </Button>
                        <button 
                            onClick={logoutHost} 
                            className="mt-6 text-slate-500 hover:text-white text-xs underline"
                        >
                            Cancel and Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'rsvp') {
        return (
            <div className="max-w-md mx-auto w-full py-8 px-6 flex flex-col justify-center min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
                <ProgressBar step={1} />
                <div className="mb-8 text-center">
                    <h2 className="font-serif text-3xl text-med-blue dark:text-white mb-2">Can you make it?</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Bryan's 40th Birthday | Montpellier, France</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => {
                            setPreferences({ ...preferences, rsvpStatus: 'Confirmed' });
                            setCurrentStep('preferences');
                        }}
                        className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${preferences.rsvpStatus === 'Confirmed' ? 'border-med-terracotta bg-med-terracotta/5' : 'border-gray-100 dark:border-gray-800 hover:border-med-terracotta/30'}`}
                    >
                        <div className="text-left">
                            <p className="font-serif text-xl text-med-blue dark:text-white group-hover:text-med-terracotta transition-colors">I'll be there!</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ready for the adventure</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${preferences.rsvpStatus === 'Confirmed' ? 'bg-med-terracotta text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-300'}`}>
                            <Check size={20} />
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setPreferences({ ...preferences, rsvpStatus: 'Declined' });
                            setCurrentStep('identity');
                        }}
                        className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${preferences.rsvpStatus === 'Declined' ? 'border-red-400 bg-red-400/5' : 'border-gray-100 dark:border-gray-800 hover:border-red-400/30'}`}
                    >
                        <div className="text-left">
                            <p className="font-serif text-xl text-med-blue dark:text-white group-hover:text-red-400 transition-colors">Regretfully decline</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Can't make it this time</p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${preferences.rsvpStatus === 'Declined' ? 'bg-red-400 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-300'}`}>
                            <ShieldCheck size={20} />
                        </div>
                    </button>

                    <div className="pt-8">
                        <Button onClick={() => setCurrentStep('welcome')} variant="ghost" fullWidth>Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'preferences') {
        return (
            <div className="max-w-md mx-auto w-full py-8 px-6 flex flex-col justify-center min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
                <ProgressBar step={2} />
                <div className="mb-8">
                    <h2 className="font-serif text-3xl text-med-blue dark:text-white mb-2">Trip Details</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Help us customize your planner</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                            <MapPin size={12} /> Destination
                        </label>
                        <div className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-med-blue dark:text-gray-300 font-bold flex items-center justify-between">
                            {preferences.destination}
                            <Check size={16} className="text-med-olive" />
                        </div>
                    </div>

                    <div className="space-y-2 group relative">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-med-blue transition-colors">
                            <Plane size={12} /> Flying From
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={isLocating ? "Searching..." : "City or Airport (e.g. JFK)"}
                                value={preferences.origin}
                                onChange={handleOriginChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="w-full p-4 pr-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue focus:ring-4 focus:ring-med-blue/10 transition-all dark:text-white font-medium"
                                autoFocus
                                disabled={isLocating}
                            />
                            <button onClick={handleLocateMe} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-med-blue transition-colors" disabled={isLocating}>
                                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                            </button>
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                                <ul className="py-2">
                                    {suggestions.map((s, index) => (
                                        <li
                                            key={index}
                                            onMouseDown={() => handleSuggestionClick(s)}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                                        >
                                            {s.airport_name} ({s.iata_code}) - {s.city_name}, {s.country_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Arrival</label>
                            <input
                                type="date"
                                value={preferences.arrivalDate}
                                onChange={(e) => setPreferences({ ...preferences, arrivalDate: e.target.value })}
                                className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue dark:text-white text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1">Departure</label>
                            <input
                                type="date"
                                value={preferences.departureDate}
                                onChange={(e) => setPreferences({ ...preferences, departureDate: e.target.value })}
                                className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                            <Users size={12} /> Party Size
                        </label>
                        <select
                            value={preferences.guests}
                            onChange={e => setPreferences({ ...preferences, guests: parseInt(e.target.value) })}
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-med-blue dark:text-white appearance-none cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button onClick={() => setCurrentStep('rsvp')} variant="ghost" className="flex-1">Back</Button>
                        <Button onClick={() => setCurrentStep('identity')} variant="primary" className="flex-[2]">Next Step</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto w-full py-8 px-6 flex flex-col justify-center min-h-[500px] animate-in fade-in slide-in-from-right-8 duration-500">
            <ProgressBar step={preferences.rsvpStatus === 'Declined' ? 2 : 3} />
            <div className="mb-8">
                <h2 className="font-serif text-3xl text-med-blue dark:text-white mb-2">Create Profile</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your Digital Passport</p>
            </div>

            <div className="space-y-6">
                {!user && (
                    <div className="flex flex-col gap-3 mb-6">
                        <Button
                            onClick={handleGoogleLogin}
                            variant="secondary"
                            size="lg"
                            isLoading={isAuthLoading}
                            loadingText="Connecting..."
                        >
                            <Globe size={16} className="mr-2"/> Sign in with Google
                        </Button>
                        <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
                            <span className="relative bg-white dark:bg-gray-900 px-2 text-[9px] font-bold uppercase text-gray-400 tracking-wider">Or Manual Entry</span>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2 group">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 group-focus-within:text-med-blue transition-colors">
                            <User size={12} /> Full Name
                        </label>
                        <input
                            type="text"
                            value={identity.name}
                            onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                            className={`w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-med-terracotta/20 transition-all dark:text-white text-lg font-sans border ${errors.name ? 'border-red-500' : 'border-transparent'}`}
                            placeholder="Jean Dupont"
                        />
                        {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider pl-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 group-focus-within:text-med-blue transition-colors">
                            <Mail size={12} /> Email Address
                        </label>
                        <input
                            type="email"
                            value={identity.email}
                            onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                            className={`w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-med-terracotta/20 transition-all dark:text-white text-lg font-sans border ${errors.email ? 'border-red-500' : 'border-transparent'}`}
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-[9px] font-bold uppercase tracking-wider pl-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 group-focus-within:text-med-blue transition-colors">
                                <Phone size={12} /> Phone Number
                            </label>
                            <input
                                type="tel"
                                value={identity.phone}
                                onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-med-terracotta/20 transition-all dark:text-white text-lg font-sans border border-transparent"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-bold uppercase text-gray-400 tracking-widest ml-1">Settings & Privacy</label>
                            
                            <button
                                onClick={() => setIdentity({ ...identity, publicRegistry: !identity.publicRegistry })}
                                className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all border ${identity.publicRegistry ? 'bg-med-blue/5 border-med-blue/20 text-med-blue dark:text-blue-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent'}`}
                            >
                                <span className="flex items-center gap-2">{identity.publicRegistry ? <Globe size={14} /> : <ShieldCheck size={14} />} {identity.publicRegistry ? 'Public Registry' : 'Private Profile'}</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${identity.publicRegistry ? 'bg-med-blue' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${identity.publicRegistry ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                            </button>

                            <button
                                onClick={() => setIdentity({ ...identity, smsConsent: !identity.smsConsent })}
                                className={`w-full py-4 px-4 rounded-xl transition-all border text-left flex gap-3 ${identity.smsConsent ? 'bg-med-olive/5 border-med-olive/20' : 'bg-gray-50 dark:bg-gray-800 border-transparent'}`}
                            >
                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${identity.smsConsent ? 'bg-med-olive border-med-olive text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                    {identity.smsConsent && <Check size={14} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${identity.smsConsent ? 'text-med-olive' : 'text-gray-500'}`}>
                                        Enable SMS Updates
                                    </p>
                                    <p className="text-[10px] text-gray-400 leading-normal">
                                        I consent to receive automated text messages for celebration reminders and logistics updates. Msg & data rates may apply. Reply STOP to opt out.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button onClick={() => setCurrentStep(preferences.rsvpStatus === 'Declined' ? 'rsvp' : 'preferences')} variant="ghost" className="flex-1">Back</Button>
                    <Button
                        onClick={handleFinish}
                        variant={preferences.rsvpStatus === 'Declined' ? 'destructive' : 'action'}
                        size="lg"
                        className="flex-[2]"
                        isLoading={isFinishing}
                        loadingText={preferences.rsvpStatus === 'Declined' ? 'Processing...' : 'Creating...'}
                    >
                        {preferences.rsvpStatus === 'Declined' ? 'Decline RSVP' : 'Enter The Hub'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
