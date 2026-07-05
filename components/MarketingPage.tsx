
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronRight, Star, Plane, Plus, Heart, ArrowRight, 
  Smartphone, Wine, Sun, Umbrella, Landmark, Sparkles, 
  Shield, Sailboat, Lock, Mail, Briefcase, PartyPopper, 
  GraduationCap, Facebook, Twitter, Instagram, DollarSign, 
  ChevronDown, Compass, Anchor, Send, Bot, Check, 
  Binoculars, Quote, ExternalLink, Construction,
  RotateCw, RefreshCw, CalendarDays, ScanLine, Award, Network, WifiOff,
  Layout, Zap, CheckCircle,
  Moon, Users, User, Monitor, Tablet, Watch, FileText, MapPin, Wifi, BatteryFull, Hotel, Download, Map, SlidersHorizontal, Home, MessageSquare, ArrowUp, Delete, CheckCheck, Signal, Bell
} from 'lucide-react';
import { SiVenmo, SiZelle, SiCashapp } from 'react-icons/si';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';
import { AboutUsModal } from './AboutUsModal';
import { FeatureBreakdownModal } from './FeatureBreakdownModal';
import { OnboardingFlow } from './OnboardingFlow';

// --- Styles & Assets ---

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

    .font-heading { font-family: 'Cormorant Garamond', serif; }
    .font-body { font-family: 'Montserrat', sans-serif; }

    .perspective-1000 {
        perspective: 1000px;
    }
    .preserve-3d {
        transform-style: preserve-3d;
    }
    .backface-hidden {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
    }
    .rotate-y-180 {
        transform: rotateY(180deg);
    }
    .is-flipped {
        transform: rotateY(180deg);
    }

    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    @keyframes rsvp-pulse {
        0%, 100% { box-shadow: 0 0 8px rgba(194, 94, 62, 0.3), 0 0 20px rgba(194, 94, 62, 0.1); }
        50% { box-shadow: 0 0 12px rgba(194, 94, 62, 0.5), 0 0 30px rgba(194, 94, 62, 0.2); }
    }
    .rsvp-glow-btn {
        background: #C25E3E;
        animation: rsvp-pulse 2.5s ease-in-out infinite;
        transition: all 0.3s;
    }
    .rsvp-glow-btn:hover {
        background: #bf6344;
        box-shadow: 0 0 16px rgba(194, 94, 62, 0.6), 0 0 40px rgba(194, 94, 62, 0.25);
        animation: none;
    }
  `}</style>
);

const Logo = ({ className = "w-10 h-10" }) => (
  <img
    src="/assets/voyageurs-icon.png"
    alt="Voyageurs"
    className={`object-contain drop-shadow-md ${className}`}
  />
);

// --- Sub-components ---

const BentoCard = ({ children, className = "", isHero = false }: any) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return; 
        
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        
        cardRef.current.style.transition = 'none';
        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        
        cardRef.current.style.transition = 'transform 0.5s ease-out';
        cardRef.current.style.transform = `rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    };

    return (
        <div 
            className={`bento-card group relative h-full perspective-1000 ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                ref={cardRef}
                className={`bento-inner relative w-full h-full preserve-3d transition-transform duration-700 ease-out`}
            >
                <div className="bento-front absolute inset-0 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
};



export const MarketingPage = ({ onHostLoginSuccess, onShowLogin }: any) => {
    const { theme, toggleTheme } = useTheme();
    const [isAnnual, setIsAnnual] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistName, setWaitlistName] = useState('');
    const [waitlistConsent, setWaitlistConsent] = useState(false);
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
    const [waitlistLoading, setWaitlistLoading] = useState(false);
    const [celesteOpen, setCelesteOpen] = useState(false);
    const [comingSoonLink, setComingSoonLink] = useState<string | null>(null);

    const handleComingSoon = (linkName: string) => {
        setComingSoonLink(linkName);
        setTimeout(() => setComingSoonLink(null), 2000);
    };

    const handleWaitlistSubmit = async () => {
        if (!waitlistEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waitlistEmail) || !waitlistName || !waitlistConsent) return;
        setWaitlistLoading(true);
        try {
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
            const { db } = await import('../firebaseConfig');
            await addDoc(collection(db, 'waitlist'), { name: waitlistName, email: waitlistEmail, createdAt: serverTimestamp() });
            setWaitlistSubmitted(true);
        } catch (e) {
            console.warn('Waitlist submission failed:', e);
            setWaitlistSubmitted(true);
        } finally {
            setWaitlistLoading(false);
        }
    };

    const [messageLog, setMessageLog] = useState<{id: number, index: number, synced?: boolean, showAnswer?: boolean}[]>([{ id: 0, index: 0, synced: true, showAnswer: true }]);
    const [connectionStatus, setConnectionStatus] = useState('none');
    const [isTyping, setIsTyping] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [celesteTyping, setCelesteTyping] = useState(false);
    const [badgeIndex, setBadgeIndex] = useState(0);
    const [watchNotificationIndex, setWatchNotificationIndex] = useState(0);
    const badgeItems = [
        { icon: Users, heading: 'Social Connector', title: '14 Guests', subtitle: 'Confirmed & counting' },
        { icon: DollarSign, heading: 'Shared Ledger', title: 'Split Dinner', subtitle: '4 ways · €23 each' },
        { icon: Sparkles, heading: 'AI Concierge', title: 'Best coffee nearby?', subtitle: 'Coldrip, 3 min walk' },
        { icon: Wine, heading: 'Offline Access', title: 'Wine Tour', subtitle: 'Sun 10:30 AM · 4 going' },
    ];
    
    const watchNotifications = [
        {
            icon: <Plane size={8} className="text-med-terracotta" />,
            color: 'bg-med-terracotta/20',
            title: 'Time to leave',
            body: 'Your ride to the airport arrives in 15 mins.'
        },
        {
            icon: <MessageSquare size={8} className="text-blue-400" />,
            color: 'bg-blue-400/20',
            title: 'Message from Martin',
            body: 'I just got in the car, headed to you now.'
        },
        {
            icon: <MessageSquare size={8} className="text-blue-400" />,
            color: 'bg-blue-400/20',
            title: 'Message from Martin',
            body: "We're in the pickup zone, it's a white car."
        },
        {
            icon: <Plane size={8} className="text-purple-400" />,
            color: 'bg-purple-400/20',
            title: 'Boarding Pass',
            body: 'AirFrance MPL > CDG'
        }
    ];
    const celesteExamples = [
        { 
            q: "What's the dress code for Saturday?", 
            a: "Mediterranean Chic. Consider pairing a linen shirt with a blazer or stylish jacket, choose either upscale denim or tailored chinos, and remember no tennis shoes! Loafers or leather sneakers would work.",
            time: "10:14 AM"
        },
        { 
            q: "Is anyone in the group interested in going to the beach?", 
            a: "Yes! Victoria, Paul, and Jeremy all mentioned they'd love to go. The weather is perfect for it tomorrow afternoon.",
            time: "11:30 AM"
        },
        { 
            q: (
                <div className="flex flex-col gap-2">
                    <div className="bg-white/20 p-2 rounded-md flex items-center gap-2 text-xs border border-white/10">
                        <FileText size={14} /> dinner_receipt.jpg
                    </div>
                    <span>Add this to our ledger and split it with Victoria, Paul, Jeremy, and Erica.</span>
                </div>
            ), 
            a: "Got it! I've added the €145.00 receipt to the shared ledger and split it 5 ways (€29.00 each) between you, Victoria, Paul, Jeremy, and Erica.",
            time: "8:45 PM"
        },
        { 
            q: "Where are we supposed to meet for the wine tour?", 
            a: (
                <div className="flex flex-col gap-2">
                    <span>You're meeting at Place de la Comédie at 10:30 AM. It's a 10 minute walk. You can use the map for directions, even while we're offline.</span>
                    <div className="bg-white/40 dark:bg-black/20 p-2 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-white/10 relative overflow-hidden h-14 mt-1">
                        <div className="absolute inset-0 bg-med-lightBlue/20 dark:bg-blue-900/20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(100,150,200,0.2) 2px, transparent 2px)', backgroundSize: '8px 8px' }}></div>
                        <MapPin size={16} className="text-med-terracotta relative z-10 shrink-0" />
                        <span className="text-xs font-semibold relative z-10">Place de la Comédie</span>
                    </div>
                </div>
            ),
            time: "9:02 AM"
        },
        {
            q: "Is anyone else flying out tomorrow that I can share a ride to the airport?",
            a: "Yes, Martin is flying out in the morning. Would you like me to connect you?",
            time: "2:15 PM"
        },
        {
            q: null,
            a: "We're no longer connected to the internet but don't worry, we can continue chatting and you can still use the map for navigating. Once we're online again I'll sync all of our updates.",
            time: "2:45 PM",
            offline: true
        }
    ];

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isCancelled = false;
        
        const scheduleNextMessage = (currentIndex: number, currentId: number) => {
            if (isCancelled) return;
            const delay = Math.floor(Math.random() * (7000 - 2000 + 1)) + 2000;
            timeoutId = setTimeout(() => {
                if (isCancelled) return;
                const nextIndex = (currentIndex + 1) % celesteExamples.length;
                const nextId = currentId + 1;
                const nextMessageData = celesteExamples[nextIndex];
                
                const proceedWithAnswer = () => {
                    setCelesteTyping(true);
                    timeoutId = setTimeout(() => {
                        if (isCancelled) return;
                        setCelesteTyping(false);
                        setMessageLog(prev => prev.map(m => m.id === nextId ? { ...m, showAnswer: true } : m));
                        scheduleNextMessage(nextIndex, nextId);
                    }, 1500);
                };

                if (nextMessageData.q) {
                    setIsTyping(true);
                    
                    if (typeof nextMessageData.q === 'string') {
                        let charIndex = 0;
                        const text = nextMessageData.q;
                        const typeInterval = setInterval(() => {
                            if (isCancelled) {
                                clearInterval(typeInterval);
                                return;
                            }
                            setTypingText(text.substring(0, charIndex + 1));
                            charIndex++;
                            if (charIndex >= text.length) {
                                clearInterval(typeInterval);
                                timeoutId = setTimeout(() => {
                                    if (isCancelled) return;
                                    setTypingText('');
                                    setIsTyping(false);
                                    setMessageLog(prev => {
                                        const newLog = [...prev, { id: nextId, index: nextIndex, synced: false, showAnswer: false }];
                                        if (newLog.length > 2) newLog.shift();
                                        return newLog;
                                    });
                                    proceedWithAnswer();
                                }, 600);
                            }
                        }, 40);
                    } else {
                        timeoutId = setTimeout(() => {
                            if (isCancelled) return;
                            setIsTyping(false);
                            setMessageLog(prev => {
                                const newLog = [...prev, { id: nextId, index: nextIndex, synced: false, showAnswer: false }];
                                if (newLog.length > 2) newLog.shift();
                                return newLog;
                            });
                            proceedWithAnswer();
                        }, 2000);
                    }
                } else {
                    setMessageLog(prev => {
                        const newLog = [...prev, { id: nextId, index: nextIndex, synced: false, showAnswer: true }];
                        if (newLog.length > 2) newLog.shift();
                        return newLog;
                    });
                    scheduleNextMessage(nextIndex, nextId);
                }
            }, delay);
        };
        scheduleNextMessage(0, 0);

        const badgeInterval = setInterval(() => {
            setBadgeIndex(prev => (prev + 1) % badgeItems.length);
        }, 3000);
        
        const watchInterval = setInterval(() => {
            setWatchNotificationIndex(prev => (prev + 1) % watchNotifications.length);
        }, 4500);
        
        return () => { 
            isCancelled = true;
            clearTimeout(timeoutId); 
            clearInterval(badgeInterval); 
            clearInterval(watchInterval);
        };
    }, []);

    // Effect to sync messages
    useEffect(() => {
        if (messageLog.length === 0) return;
        const latestMsg = messageLog[messageLog.length - 1];
        
        if (!latestMsg.synced) {
            if (connectionStatus === 'none' || connectionStatus === 'up-to-date') {
                const timer = setTimeout(() => {
                    setMessageLog(prev => prev.map(m => ({ ...m, synced: true })));
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [messageLog, connectionStatus]);

    useEffect(() => {
        if (messageLog.length === 0) return;
        const latestMsg = messageLog[messageLog.length - 1];
        setConnectionStatus(prev => {
            if (celesteExamples[latestMsg.index].offline) return 'alert-offline';
            if (latestMsg.index === 0 && (prev === 'waiting' || prev === 'alert-offline')) return 'connected';
            if (latestMsg.index === 1 && prev === 'connected') return 'syncing';
            if (latestMsg.index === 2 && prev === 'syncing') return 'up-to-date';
            if (latestMsg.index === 3 && prev === 'up-to-date') return 'none';
            return prev;
        });
    }, [messageLog]);

    useEffect(() => {
        if (connectionStatus === 'alert-offline') {
            const timer = setTimeout(() => setConnectionStatus('waiting'), 4000);
            return () => clearTimeout(timer);
        }
    }, [connectionStatus]);

    // YouTube IFrame API for background video
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(tag, firstScript);

        (window as any).onYouTubeIframeAPIReady = () => {
            new (window as any).YT.Player('yt-bg-player', {
                videoId: 'bRbUJZTIcUw',
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    playlist: 'bRbUJZTIcUw',
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                },
                events: {
                    onReady: (event: any) => {
                        event.target.setPlaybackRate(0.5);
                        event.target.playVideo();
                    },
                    onStateChange: (event: any) => {
                        if (event.data === (window as any).YT.PlayerState.PLAYING) {
                            event.target.setPlaybackRate(0.5);
                        }
                    },
                },
            });
        };
    }, []);

    if (showOnboarding) {
        return (
            <div className="fixed inset-0 z-[1000] bg-white dark:bg-gray-900">
                <div className="fixed w-full z-[1001] top-6 px-4 flex justify-center">
                    <nav className="w-[90%] mx-auto flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/95 backdrop-blur-xl border border-med-blue/10 dark:border-white/10 rounded-full shadow-lg transition-all duration-500">
                        <div className="flex items-center gap-3">
                            <img
                              src="/assets/voyageurs-icon.png"
                              alt="Voyageurs"
                              className="h-8 w-8 object-contain dark:brightness-0 dark:invert"
                            />
                            <span className="text-[13px] font-body font-bold uppercase tracking-[0.3em] text-med-blue dark:text-white">Voyageurs</span>
                        </div>
                        <div className="flex items-center gap-2 pointer-events-auto">
                            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 hover:text-med-blue dark:hover:text-white transition-colors">
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                            <button onClick={onShowLogin} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 hover:text-med-blue dark:hover:text-white transition-colors">
                                <User size={16} />
                            </button>
                        </div>
                    </nav>
                </div>
                <OnboardingFlow />
            </div>
        );
    }

    const getBannerProps = (status) => {
        switch (status) {
            case 'alert-offline': return { text: "We're no longer connected to the internet. Don't worry, we can continue chatting and navigating. Once online, I'll sync our updates.", color: 'bg-red-500/95', icon: WifiOff, isAlert: true };
            case 'waiting': return { text: 'Waiting for Connection', color: 'bg-amber-500/95 dark:bg-amber-600/95', icon: WifiOff };
            case 'connected': return { text: 'Connected', color: 'bg-blue-500/95 dark:bg-blue-600/95', icon: Wifi };
            case 'syncing': return { text: 'Syncing...', color: 'bg-blue-500/95 dark:bg-blue-600/95', icon: RefreshCw, spin: true };
            case 'up-to-date': return { text: "You're up to date!", color: 'bg-emerald-500/95 dark:bg-emerald-600/95', icon: CheckCircle };
            default: return null;
        }
    };
    const banner = getBannerProps(connectionStatus);

    return (
        <div className="font-body bg-med-sand dark:bg-gray-950 text-slate-800 dark:text-slate-200 selection:bg-med-terracotta selection:text-white transition-colors duration-500 overflow-x-hidden">
            <Styles />
            
            <div className="fixed w-full z-[100] top-6 px-4 flex justify-center">
                <nav className="w-[90%] mx-auto flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/95 backdrop-blur-xl border border-med-blue/10 dark:border-white/10 rounded-full shadow-lg transition-all duration-500 relative">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div 
                          className="h-10 w-10 bg-slate-900 dark:bg-white group-hover:!bg-med-lightBlue transition-colors duration-300" 
                          style={{ 
                            WebkitMaskImage: "url('/assets/voyageurs-icon.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center",
                            maskImage: "url('/assets/voyageurs-icon.png')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center"
                          }}
                        />
                        <span className="text-[16px] font-body font-bold uppercase tracking-[0.3em] text-med-blue dark:text-white group-hover:!text-med-terracotta transition-colors duration-300">Voyageurs</span>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <button onClick={() => setShowAbout(true)} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">The Vision</button>
                        <a href="#features" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">The Platform</a>
                        <a href="#ecosystem" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors">The Ecosystem</a>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="group relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 hover:text-med-blue dark:hover:text-white transition-colors">
                                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                    {theme === 'dark' ? 'Light' : 'Dark'}
                                </div>
                            </button>

                        </div>
                        <div className="relative hidden lg:block">
                            <div className="absolute inset-[-4px] bg-med-terracotta rounded-full blur-md opacity-80 animate-pulse"></div>
                            <button onClick={onShowLogin} className="relative btn-terracotta px-6 py-2.5 text-[10px] sm:px-6 sm:py-2.5 sm:text-xs">
                                RSVP
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <section className="relative pt-48 pb-20 overflow-hidden min-h-screen flex flex-col justify-center md:justify-end md:pb-32">
                {/* YouTube Video Background */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-med-blue dark:bg-gray-950">
                    <div className="absolute inset-[-50%] w-[200%] h-[200%]">
                        <div id="yt-bg-player" className="w-full h-full" />
                    </div>
                    {/* Overlay hides play button & controls */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80 z-[1]" />
                </div>

                {/* Ambient glow behind hero */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-med-terracotta/20 rounded-full blur-[120px] opacity-40 mix-blend-screen pointer-events-none z-0" />

                <div className="w-[90%] mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center md:items-start justify-center min-h-screen pb-24 md:pb-32 pt-20">
                        <div className="max-w-5xl w-full text-center md:text-left animate-in slide-in-from-bottom-8 duration-1000 relative">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                                <Compass size={14} className="text-med-terracotta" />
                                <div className="h-px w-12 bg-med-terracotta"></div>
                            </div>
                            
                            <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-heading font-medium text-white mb-8 leading-[0.9] tracking-tight drop-shadow-xl text-center md:text-left">
                                Less coordinating, <br/>
                                <span className="italic text-med-terracotta">more connecting.</span>
                            </h1>
                            <p className="text-base sm:text-lg text-white/90 mb-10 max-w-2xl mx-auto md:mx-0 font-light leading-relaxed drop-shadow-md">
                                Everything you need to research, plan, book, and host your next event—<br/>
                                all-in-one place.
                            </p>

                            <div className="hidden md:flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <a href="#features" className="inline-flex items-center justify-center font-bold tracking-[0.2em] uppercase transition-all duration-300 font-body relative overflow-hidden group rounded-full active:scale-95 bg-white/10 text-white hover:bg-white/20 border border-white/20 px-8 py-3.5 text-xs shadow-xl backdrop-blur-md">
                                    Learn More
                                </a>
                                <a href="#waitlist" className="btn-terracotta px-8 py-3.5 text-xs shadow-xl">
                                    Start Planning
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 animate-bounce">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-white font-medium">Scroll</span>
                    <div className="w-px h-10 bg-gradient-to-b from-white to-transparent"></div>
                </div>
            </section>

            <section id="philosophy" className="py-24 bg-white dark:bg-[#1e293b] relative overflow-hidden">
                <div className="w-[90%] mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2 text-center lg:text-left order-2 lg:order-1">
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                                <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">The Vision</span>
                                <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E] lg:hidden"></div>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight mb-6 text-med-blue dark:text-blue-100">
                                L'Art de <span className="italic text-med-terracotta dark:text-[#C25E3E]">Vivre.</span>
                            </h2>
                            <p className="text-lg font-light leading-relaxed text-slate-600 dark:text-slate-400 mb-8">
                                Planning a journey shouldn't get in the way of experiencing it. Embracing L'Art de Vivre, Voyageurs gently absorbs the chaos of scattered chats and fragmented details. It’s less about organizing a trip and more about clearing the noise—so you can truly savor the moment and make the memories that matter.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={() => setShowAbout(true)} className="btn-glass-adaptive px-8 py-3.5 text-xs">
                                    Read Our Manifesto
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative h-[600px] w-full flex items-center justify-center order-1 lg:order-2 group">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-med-sand/50 dark:bg-med-blue/5 rounded-full blur-3xl -z-10"></div>
                            {/* Fan of 6 photos — polaroid style, vertically centered */}
                            <div className="absolute w-[66%] md:w-[60%] top-1/2 left-1/2 bg-white p-2 pb-10 md:p-3 md:pb-14 rounded-md shadow-2xl border border-gray-200 origin-bottom transition-all duration-500 ease-out cursor-pointer z-[5] -translate-x-1/2 -translate-y-1/2 -rotate-[30deg] group-hover:-rotate-[36deg] hover:!z-[50] hover:!scale-110 hover:!rotate-0 hover:!shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                                 <img src="https://images.unsplash.com/photo-1500313830540-7b6650a74fd0?q=80&w=2340&auto=format&fit=crop" alt="Place de la Comédie, Montpellier" className="w-full aspect-square object-cover rounded-sm" />
                            </div>
                            <div className="absolute w-[66%] md:w-[60%] top-1/2 left-1/2 bg-white p-2 pb-10 md:p-3 md:pb-14 rounded-md shadow-2xl border border-gray-200 origin-bottom transition-all duration-500 ease-out cursor-pointer z-[8] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] group-hover:-rotate-[22deg] hover:!z-[50] hover:!scale-110 hover:!rotate-0 hover:!shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                                 <img src="https://images.unsplash.com/photo-1474925558543-e7a5f06e733e?q=80&w=1170&auto=format&fit=crop" alt="Friends jumping" className="w-full aspect-square object-cover rounded-sm" />
                            </div>
                            <div className="absolute w-[66%] md:w-[60%] top-1/2 left-1/2 bg-white p-2 pb-10 md:p-3 md:pb-14 rounded-md shadow-2xl border border-gray-200 origin-bottom transition-all duration-500 ease-out cursor-pointer z-[11] -translate-x-1/2 -translate-y-1/2 -rotate-[6deg] group-hover:-rotate-[8deg] hover:!z-[50] hover:!scale-110 hover:!rotate-0 hover:!shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                                 <img src="https://images.unsplash.com/photo-1659882751335-43e664461e6d?q=80&w=735&auto=format&fit=crop" alt="Mediterranean street" className="w-full aspect-square object-cover rounded-sm" />
                            </div>
                            <div className="absolute w-[66%] md:w-[60%] top-1/2 left-1/2 bg-white p-2 pb-10 md:p-3 md:pb-14 rounded-md shadow-2xl border border-gray-200 origin-bottom transition-all duration-500 ease-out cursor-pointer z-[14] -translate-x-1/2 -translate-y-1/2 rotate-[6deg] group-hover:rotate-[8deg] hover:!z-[50] hover:!scale-110 hover:!rotate-0 hover:!shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                                 <img src="https://images.unsplash.com/photo-1690132007585-1ef4b16f49d3?q=80&w=2342&auto=format&fit=crop" alt="Philosophy Mood" className="w-full aspect-square object-cover rounded-sm" />
                            </div>
                            <div className="absolute w-[66%] md:w-[60%] top-1/2 left-1/2 bg-white p-2 pb-10 md:p-3 md:pb-14 rounded-md shadow-2xl border border-gray-200 origin-bottom transition-all duration-500 ease-out cursor-pointer z-[17] -translate-x-1/2 -translate-y-1/2 rotate-[18deg] group-hover:rotate-[22deg] hover:!z-[50] hover:!scale-110 hover:!rotate-0 hover:!shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                                 <img src="https://images.unsplash.com/photo-1619523439722-c27651e8e10e?q=80&w=2342&auto=format&fit=crop" alt="Mediterranean Lifestyle" className="w-full aspect-square object-cover rounded-sm" />
                            </div>
                            <div className="absolute w-[66%] md:w-[60%] top-1/2 left-1/2 bg-white p-2 pb-10 md:p-3 md:pb-14 rounded-md shadow-2xl border border-gray-200 origin-bottom transition-all duration-500 ease-out cursor-pointer z-[20] -translate-x-1/2 -translate-y-1/2 rotate-[30deg] group-hover:rotate-[36deg] hover:!z-[50] hover:!scale-110 hover:!rotate-0 hover:!shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
                                 <img src="/assets/wine-tour-pic-st-loup.jpg" alt="Wine tour in Pic Saint-Loup" className="w-full aspect-square object-cover rounded-sm" />
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-24 bg-med-sand dark:bg-gray-950 relative overflow-hidden">
                <div className="w-[90%] mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">The Platform</span>
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight text-med-blue dark:text-blue-100 mb-6">
                            Quietly <span className="italic text-med-terracotta dark:text-[#C25E3E]">Orchestrated.</span>
                        </h2>

                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)] md:auto-rows-[minmax(320px,auto)] grid-flow-row-dense">
                        <BentoCard className="md:col-span-1 md:row-span-2">
                            <div className="p-8 h-full flex flex-col justify-between">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Shared Ledger</p>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Frictionless Finance</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 max-w-md">
                                        Settle up, stress down. Snap a photo to instantly itemize receipts, transparently track group tabs, and export PDFs for your records with real-time multi-currency support.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-6">
                                        <div className="px-4 py-1.5 rounded-full bg-[#008CFF]/10 text-[#008CFF] font-bold text-xs tracking-tight border border-[#008CFF]/20 flex items-center gap-1.5">
                                            <SiVenmo size={14} /> Venmo
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full bg-[#741DF2]/10 text-[#741DF2] font-bold text-xs tracking-tight border border-[#741DF2]/20 flex items-center gap-1.5">
                                            <SiZelle size={14} /> Zelle
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full bg-[#00D632]/10 text-[#00D632] font-bold text-xs tracking-tight border border-[#00D632]/20 flex items-center gap-1.5">
                                            <SiCashapp size={14} /> Cash App
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard className="md:col-span-2 md:row-span-2">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-med-terracotta/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-12 z-0 pointer-events-none group/phone">
                                <div className="pointer-events-auto w-[280px] md:w-[320px] h-[550px] md:h-[600px] bg-slate-50 dark:bg-gray-950 rounded-[2.5rem] md:rounded-[3rem] border-[8px] md:border-[10px] border-slate-800 dark:border-gray-900 shadow-2xl overflow-hidden flex flex-col relative cursor-pointer" style={{ overflow: 'hidden' }}>
                                    {/* iPhone Notch */}
                                    <div className="absolute top-0 inset-x-0 h-5 md:h-6 bg-slate-800 dark:bg-gray-900 rounded-b-2xl md:rounded-b-3xl mx-auto w-24 md:w-28 z-20"></div>
                                    
                                    {/* iPhone Status Bar */}
                                    <div className="absolute top-1.5 inset-x-6 flex justify-between items-center z-10 text-[9px] text-slate-800 dark:text-gray-300 font-medium px-2">
                                        <span>{celesteExamples[messageLog[messageLog.length - 1]?.index || 0]?.time || '9:41 AM'}</span>
                                        <div className="flex gap-1 items-center">
                                            <Signal size={10} />
                                            {celesteExamples[messageLog[messageLog.length - 1]?.index || 0]?.offline ? 
                                                <WifiOff size={10} className="text-red-500" /> : 
                                                <Wifi size={10} />
                                            }
                                            <BatteryFull size={10} />
                                        </div>
                                    </div>
                                    
                                    {/* App Header */}
                                    <div className="absolute top-6 inset-x-0 z-30 flex items-center justify-between px-5 pb-3 pt-2 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
                                        <div className="w-8 h-8 rounded-full bg-med-terracotta flex items-center justify-center shadow-inner">
                                            <Sailboat size={16} className="text-white" />
                                        </div>
                                        <div className="font-bold text-sm text-slate-800 dark:text-gray-200">Céleste</div>
                                        <div className="w-8 h-8 flex items-center justify-center relative">
                                            <Bell size={16} className="text-slate-600 dark:text-gray-400" />
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none shadow-sm">2</span>
                                        </div>
                                    </div>

                                    {/* Connection Banner */}
                                    <div className="absolute top-20 inset-x-2 z-40 flex justify-center pointer-events-none">
                                        <AnimatePresence>
                                            {banner && (
                                                <motion.div
                                                    initial={{ y: -20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -20, opacity: 0 }}
                                                    className={`shadow-lg flex text-white font-semibold backdrop-blur-md ${banner.isAlert ? 'flex-col items-center gap-3 p-4 rounded-xl text-center text-xs mt-2 max-w-[90%] ' + banner.color : 'items-center gap-2 py-1.5 px-3 rounded-full text-[10px] ' + banner.color}`}
                                                >
                                                    <banner.icon size={banner.isAlert ? 24 : 12} className={banner.spin ? 'animate-spin' : ''} />
                                                    {banner.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex-1 p-3 md:p-4 flex flex-col justify-end pt-24 pb-[200px] md:pb-[220px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)] relative z-10">
                                        <div className="space-y-4 flex flex-col justify-end w-full">
                                            <AnimatePresence initial={false}>
                                                {messageLog.map((msg) => (
                                                    <motion.div
                                                        key={msg.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                                                        className="space-y-3 md:space-y-4 shrink-0"
                                                    >
                                                        {celesteExamples[msg.index].q && (
                                                            <div className="flex flex-col items-end pl-10 md:pl-12">
                                                                <div className="bg-med-blue text-white px-4 py-2 md:px-4 md:py-3 rounded-2xl rounded-tr-sm text-[10px] md:text-xs shadow-md text-left">
                                                                    {celesteExamples[msg.index].q}
                                                                </div>
                                                                <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-gray-500 mt-1 mr-1">{celesteExamples[msg.index].time}</span>
                                                            </div>
                                                        )}
                                                        {!celesteExamples[msg.index].offline && msg.showAnswer && (
                                                            <div className="flex flex-col items-start pr-10 md:pr-12">
                                                                <div className="bg-[#F5F2EB] dark:bg-gray-800 text-slate-700 dark:text-gray-100 px-4 py-2 md:px-4 md:py-3 rounded-2xl rounded-tl-sm text-[10px] md:text-xs shadow-sm border border-slate-100 dark:border-gray-700 flex items-start gap-2 md:gap-3 text-left">
                                                                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-med-terracotta mt-0.5 shrink-0" />
                                                                    <div>{celesteExamples[msg.index].a}</div>
                                                                </div>
                                                                <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-gray-500 mt-1 ml-1 flex items-center gap-1">
                                                                    {celesteExamples[msg.index].time}
                                                                    <CheckCheck size={12} strokeWidth={2.5} className={msg.synced ? "text-green-500" : "text-gray-400"} />
                                                                </span>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            <AnimatePresence>
                                                {celesteTyping && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex flex-col items-start pr-10 md:pr-12"
                                                    >
                                                        <div className="bg-[#F5F2EB] dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 dark:border-gray-700 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    
                                    {/* Bottom UI: Input, Keyboard, Nav */}
                                    <div className="absolute bottom-0 inset-x-0 z-30 bg-gray-50 dark:bg-gray-900 flex flex-col">
                                        {/* Input */}
                                        <div className="p-2 px-3 md:p-3 flex items-center gap-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 md:h-10 px-4 flex items-center text-xs md:text-sm border border-gray-200 dark:border-gray-700 overflow-hidden whitespace-nowrap text-ellipsis">
                                                {typingText ? (
                                                    <span className="text-slate-800 dark:text-gray-200">
                                                        {typingText}<span className="w-0.5 h-3 md:h-4 bg-med-blue inline-block ml-0.5 align-middle animate-pulse"></span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Message Céleste...</span>
                                                )}
                                            </div>
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${typingText ? 'bg-blue-600 shadow-md transform scale-105' : 'bg-med-blue'}`}>
                                                <ArrowUp size={16} className="text-white" strokeWidth={3} />
                                            </div>
                                        </div>
                                        
                                        <div className="grid transition-[grid-template-rows] duration-500 ease-in-out" style={{ gridTemplateRows: isTyping ? '1fr 0fr' : '0fr 1fr' }}>
                                            <div className="overflow-hidden">
                                                {/* Keyboard */}
                                                <div className="px-1 md:px-2 py-1.5 flex flex-col gap-0.5 md:gap-1 bg-[#D1D5DB] dark:bg-gray-800 pb-1.5">
                                                    <div className="flex justify-center gap-1 md:gap-1.5">
                                                        {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
                                                            <div key={k} className="w-[8.5%] h-7 md:h-8 bg-white dark:bg-gray-700 rounded flex items-center justify-center text-[10px] md:text-xs font-medium shadow-sm">{k}</div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-center gap-1 md:gap-1.5 px-3 md:px-4">
                                                        {['A','S','D','F','G','H','J','K','L'].map(k => (
                                                            <div key={k} className="w-[9.5%] h-7 md:h-8 bg-white dark:bg-gray-700 rounded flex items-center justify-center text-[10px] md:text-xs font-medium shadow-sm">{k}</div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-center gap-1 md:gap-1.5 px-1 md:px-2">
                                                        <div className="w-[12%] h-7 md:h-8 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center shadow-sm"><ArrowUp size={12} className="text-white"/></div>
                                                        {['Z','X','C','V','B','N','M'].map(k => (
                                                            <div key={k} className="w-[9.5%] h-7 md:h-8 bg-white dark:bg-gray-700 rounded flex items-center justify-center text-[10px] md:text-xs font-medium shadow-sm">{k}</div>
                                                        ))}
                                                        <div className="w-[12%] h-7 md:h-8 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center shadow-sm"><Delete size={12} className="text-white"/></div>
                                                    </div>
                                                    <div className="flex justify-center gap-1 md:gap-1.5 mt-0.5">
                                                        <div className="w-[20%] h-7 md:h-8 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center shadow-sm"><span className="text-[10px] text-white">123</span></div>
                                                        <div className="flex-1 h-7 md:h-8 bg-white dark:bg-gray-700 rounded flex items-center justify-center shadow-sm text-[10px] font-medium text-gray-400">space</div>
                                                        <div className="w-[20%] h-7 md:h-8 bg-med-blue rounded flex items-center justify-center shadow-sm text-[10px] font-medium text-white">return</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="overflow-hidden">
                                                {/* Bottom Nav */}
                                                <div className="flex justify-between items-center px-6 md:px-8 py-2 bg-white dark:bg-gray-950 pb-4 md:pb-5 border-t border-gray-200 dark:border-gray-800">
                                                    <div className="flex flex-col items-center gap-1 text-gray-400"><Home size={18}/><span className="text-[8px] md:text-[9px]">Home</span></div>
                                                    <div className="flex flex-col items-center gap-1 text-gray-400"><CalendarDays size={18}/><span className="text-[8px] md:text-[9px]">Itinerary</span></div>
                                                    <div className="flex flex-col items-center gap-1 text-med-terracotta"><Sparkles size={22}/><span className="text-[8px] md:text-[9px] font-bold">Céleste</span></div>
                                                    <div className="flex flex-col items-center gap-1 text-gray-400"><FileText size={18}/><span className="text-[8px] md:text-[9px]">Folio</span></div>
                                                    <div className="flex flex-col items-center gap-1 text-gray-400"><MessageSquare size={18}/><span className="text-[8px] md:text-[9px]">Chat</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10 pointer-events-none">
                                <div className="pointer-events-auto mb-auto md:w-[45%] md:pr-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Bot size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Your AI Concierge</p>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Meet Céleste</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 -ml-4 rounded-2xl">
                                        A concierge that knows your group. From suggesting the perfect wine pairing to finding a late-night pharmacy, Céleste provides context-aware guidance based on your specific itinerary and group.
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 -ml-4 rounded-2xl">
                                        Built with smart technology that understands travel, it remembers your group's dietary needs, budget limits, and favorite styles to give you the perfect answers.
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5">
                                            <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-med-terracotta mb-1">Local Intelligence</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Trained on curated regional data for bespoke recommendations.</div>
                                        </div>
                                        <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5">
                                            <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-med-terracotta mb-1">Smart Memory</div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Maintains context across the entire duration of your trip planning.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>



                        <BentoCard className="md:col-span-1">
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Binoculars size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Local Insights</p>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Curated Discovery</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                        Move beyond tourist traps. Access curated guides featuring authentic, hand-picked gems and verified reviews from over 500 local experts—no sponsored content.
                                    </p>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard className="md:col-span-2">
                            <div className="p-8 h-full flex flex-col md:flex-row gap-8 justify-between relative overflow-hidden">
                                <div className="z-10 w-full md:w-1/2 flex flex-col h-full">
                                    <div className="mb-auto">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                                <SlidersHorizontal size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Cross-Platform</p>
                                                <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Command Center</h3>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4 mb-8">
                                            Your entire trip ecosystem, optimized for every device and screen size. Automatically sync and download your itineraries, maps, and essential documents for reliable access even when you're off the grid—with no installs or updates required.
                                        </p>
                                        <div className="flex -space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm border-2 border-slate-50 dark:border-gray-900 flex items-center justify-center z-40 transform hover:-translate-y-2 transition-transform cursor-pointer">
                                                <Watch size={18} className="text-med-terracotta" />
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm border-2 border-slate-50 dark:border-gray-900 flex items-center justify-center z-30 transform hover:-translate-y-2 transition-transform cursor-pointer">
                                                <Smartphone size={18} className="text-blue-500" />
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm border-2 border-slate-50 dark:border-gray-900 flex items-center justify-center z-20 transform hover:-translate-y-2 transition-transform cursor-pointer">
                                                <Tablet size={18} className="text-purple-500" />
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm border-2 border-slate-50 dark:border-gray-900 flex items-center justify-center z-10 transform hover:-translate-y-2 transition-transform cursor-pointer">
                                                <Monitor size={18} className="text-emerald-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="z-10 w-full md:w-1/2 relative h-48 md:h-full min-h-[220px] flex items-center justify-center">
                                    <div className="w-[140px] h-[170px] bg-[#1c1c1e] rounded-[2rem] border-[4px] border-[#3a3a3c] shadow-xl relative overflow-hidden flex flex-col group-hover:-translate-y-2 transition-transform duration-500 ring-2 ring-black/20">
                                        {/* Watch screen */}
                                        <div className="flex-1 bg-black w-full flex flex-col p-3 relative">
                                            <div className="flex items-center justify-between text-med-terracotta mb-2">
                                                <span className="text-[7px] font-bold uppercase tracking-wider">Voyageurs</span>
                                                <Compass size={8} />
                                            </div>
                                            <div className="flex-1 relative overflow-hidden mt-auto">
                                                <AnimatePresence mode="wait">
                                                    <motion.div 
                                                        key={watchNotificationIndex}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ duration: 0.4 }}
                                                        className="absolute inset-0 flex flex-col justify-center gap-2 bg-[#2c2c2e] p-3 rounded-xl backdrop-blur-md border border-white/5"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${watchNotifications[watchNotificationIndex].color}`}>
                                                                {watchNotifications[watchNotificationIndex].icon}
                                                            </div>
                                                            <div className="text-[10px] font-bold text-white leading-none truncate">{watchNotifications[watchNotificationIndex].title}</div>
                                                        </div>
                                                        <div className="text-[9px] text-gray-300 leading-snug">{watchNotifications[watchNotificationIndex].body}</div>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </BentoCard>

                        <BentoCard className="md:col-span-2">
                            <div className="p-8 h-full flex flex-col md:flex-row gap-8 justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-med-terracotta/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="z-10 w-full md:w-1/2 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">End-to-End Booking</p>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Everything in One Place</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                        No more jumping between apps. Seamlessly book transportation, accommodations, excursions, and food—all centrally managed so you can focus on the memories, not the logistics.
                                    </p>
                                </div>
                                <div className="z-10 w-full md:w-1/2 relative min-h-[160px] flex items-center justify-center">
                                     <div className="grid grid-cols-2 gap-4 w-full">
                                         <div className="flex flex-col gap-2 p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5">
                                             <Plane size={20} className="text-med-terracotta" />
                                             <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-700 dark:text-gray-300">Transit</div>
                                             <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Live updates and group rates.</div>
                                         </div>
                                         <div className="flex flex-col gap-2 p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5">
                                             <Hotel size={20} className="text-blue-500" />
                                             <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-700 dark:text-gray-300">Stays</div>
                                             <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">From villas to boutique hotels.</div>
                                         </div>
                                         <div className="flex flex-col gap-2 p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5">
                                             <Compass size={20} className="text-purple-500" />
                                             <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-700 dark:text-gray-300">Excursions</div>
                                             <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Book group activities instantly.</div>
                                         </div>
                                         <div className="flex flex-col gap-2 p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/20 dark:border-white/5">
                                             <Wine size={20} className="text-emerald-500" />
                                             <div className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-700 dark:text-gray-300">Dining</div>
                                             <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Secure tables for large groups.</div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard className="md:col-span-1">
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Pre-Trip Chemistry</p>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Meaningful Connections</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                        Intelligent suggestions help your guests connect and find their tribe based on shared interests before departure. We analyze affinities to suggest room allocations and carpools—perfect for large retreats where not everyone knows each other.
                                    </p>
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </section>

            <section id="ecosystem" className="py-24 bg-white dark:bg-[#1e293b] relative overflow-hidden">
                <div className="w-[90%] mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">The Ecosystem</span>
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight text-med-blue dark:text-blue-100 mb-6">
                            Seamless <span className="italic text-med-terracotta dark:text-[#C25E3E]">Syncing.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
                        {/* Device & Offline */}
                        <BentoCard className="md:col-span-2">
                            <div className="p-8 h-full flex flex-col">
                                <div className="mb-auto">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                            <Monitor size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Cross-Device & Offline</p>
                                            <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Anywhere, Anytime</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mt-4">
                                        Voyageurs syncs flawlessly across your phone, tablet, and desktop. No data connection on the flight or at a remote villa? No problem. We store your critical itineraries and chats locally, so you're never disconnected from your group.
                                    </p>
                                </div>
                                <div className="flex justify-center items-end gap-4 mt-auto">
                                    <Monitor size={64} className="text-slate-300 dark:text-slate-700" />
                                    <Tablet size={48} className="text-slate-300 dark:text-slate-700" />
                                    <Smartphone size={32} className="text-slate-300 dark:text-slate-700" />
                                    <WifiOff size={40} className="text-med-terracotta ml-8 animate-pulse" />
                                </div>
                            </div>
                        </BentoCard>

                        {/* External Comms */}
                        <BentoCard className="md:col-span-1">
                            <div className="p-8 h-full flex flex-col">
                              <div className="mb-auto">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-med-sand dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">External Comms</p>
                                        <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">Beyond the App</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                                    For guests who prefer traditional methods, Voyageurs offers seamless solutions for emailing and texting groups entirely outside the app interface. No downloads required for them to stay in the loop.
                                </p>
                              </div>
                            </div>
                        </BentoCard>

                        {/* Integration Grid */}
                        <BentoCard className="md:col-span-1 md:row-span-2">
                            <div className="p-8 h-full flex flex-col bg-slate-900 text-white !rounded-[2.5rem]">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform">
                                        <Network size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Integrations</p>
                                        <h3 className="font-heading text-2xl text-white italic leading-none">Omni-Connected</h3>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">Communications</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Gmail', 'Outlook', 'WhatsApp', 'Messenger', 'Instagram'].map(app => (
                                                <span key={app} className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium bg-white/5">{app}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">Payments</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Venmo', 'Zelle', 'Cash App', 'PayPal', 'Stripe'].map(app => (
                                                <span key={app} className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium bg-white/5">{app}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">Booking</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Agoda', 'Expedia', 'Booking.com'].map(app => (
                                                <span key={app} className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium bg-white/5">{app}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">Experiences</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Viator', 'TripAdvisor'].map(app => (
                                                <span key={app} className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium bg-white/5">{app}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">eSIM</div>
                                        <div className="flex flex-wrap gap-2">
                                            {['Saily', 'AirAlo'].map(app => (
                                                <span key={app} className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium bg-white/5">{app}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Physical Concierge */}
                        <BentoCard className="md:col-span-2 md:row-span-2">
                            <div className="p-8 md:p-12 h-full flex flex-col relative overflow-hidden bg-med-sand dark:bg-gray-900">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-med-terracotta/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-med-blue/5 rounded-full blur-3xl -ml-20 -mb-20" />
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-12 h-full">
                                    {/* Text Content */}
                                    <div className="flex-1 md:flex-[1.1]">
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-med-terracotta shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Physical Concierge</p>
                                                <h3 className="font-heading text-2xl text-med-blue dark:text-white italic leading-none">White-Glove Service</h3>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
                                            Some moments deserve paper. Voyageurs offers an exclusive white-glove printing service. From Save the Dates and Invitations to RSVPs and Thank You cards—we'll print, address, and mail them directly to your guests on your behalf.
                                        </p>
                                    </div>

                                    {/* Card Illustrations */}
                                    <div className="flex-1 flex items-center justify-center py-2">
                                        <div className="relative flex items-end justify-center gap-0 w-full max-w-[280px] h-[180px] md:h-[200px]">
                                            {/* Save the Date - left tilted */}
                                            <div className="absolute left-0 bottom-2 w-24 h-32 md:w-28 md:h-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg -rotate-12 border border-slate-100 dark:border-gray-700 flex flex-col items-center justify-center p-3 transform transition-all duration-300 hover:rotate-0 hover:scale-110 hover:shadow-xl z-10">
                                                <div className="w-10 h-0.5 bg-slate-200 dark:bg-gray-600 rounded-full mb-1.5"></div>
                                                <div className="w-14 h-0.5 bg-slate-200 dark:bg-gray-600 rounded-full mb-3"></div>
                                                <div className="text-[9px] font-heading italic text-slate-400">Save the Date</div>
                                            </div>
                                            {/* You're Invited - center */}
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-28 h-36 md:w-32 md:h-40 bg-[#F5F2EB] dark:bg-gray-700 rounded-lg shadow-2xl z-20 border border-[#E5E0D5] dark:border-gray-600 flex flex-col items-center justify-center p-3 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                                                <div className="w-7 h-7 rounded-full border border-med-terracotta/30 flex items-center justify-center mb-3">
                                                    <div className="w-5 h-5 rounded-full border border-med-terracotta/20"></div>
                                                </div>
                                                <div className="text-[11px] font-heading font-medium text-med-blue dark:text-white">You're Invited</div>
                                            </div>
                                            {/* Thank You - right tilted */}
                                            <div className="absolute right-0 bottom-2 w-24 h-32 md:w-28 md:h-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg rotate-12 border border-slate-100 dark:border-gray-700 flex flex-col items-center justify-center p-3 transform transition-all duration-300 hover:rotate-0 hover:scale-110 hover:shadow-xl z-10">
                                                <div className="text-[9px] font-heading italic text-slate-400 mb-3">Thank You</div>
                                                <div className="w-12 h-0.5 bg-slate-200 dark:bg-gray-600 rounded-full mb-1.5"></div>
                                                <div className="w-9 h-0.5 bg-slate-200 dark:bg-gray-600 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                    </div>
                </div>
            </section>

            <section id="waitlist" className="py-24 bg-med-sand dark:bg-gray-950 relative overflow-hidden">
                <div className="w-[90%] mx-auto px-4 flex flex-col items-center relative z-10">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta dark:text-[#C25E3E]">THE MAIDEN VOYAGE</span>
                            <div className="h-px w-8 bg-med-terracotta dark:bg-[#C25E3E]"></div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-heading font-light leading-tight text-med-blue dark:text-white mb-6">
                            Embarking <span className="italic text-med-terracotta dark:text-[#C25E3E]">Soon.</span>
                        </h2>
                        <p className="text-lg font-light text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                            We're almost ready to welcome you on board! Join our early access list to be the first to experience a stress-free way to explore the world together.
                        </p>
                        <button onClick={() => { setShowWaitlist(true); setWaitlistSubmitted(false); setWaitlistEmail(''); setWaitlistName(''); setWaitlistConsent(false); }} className="btn-glass-adaptive px-10 py-4 text-[10px] sm:text-xs">
                            Unlock Early Access
                        </button>
                    </div>
                </div>
            </section>

            <footer className="bg-med-blue dark:bg-gray-950 pt-20 pb-10 border-t border-med-blue dark:border-slate-800 font-body">
                <div className="w-[90%] mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-16">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-3 group cursor-pointer mb-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                <div 
                                  className="h-10 w-10 bg-white dark:bg-white group-hover:!bg-med-terracotta transition-colors duration-300" 
                                  style={{ 
                                    WebkitMaskImage: "url('/assets/voyageurs-icon.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center",
                                    maskImage: "url('/assets/voyageurs-icon.png')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center"
                                  }}
                                />
                                <span className="text-[16px] font-body font-bold uppercase tracking-[0.3em] text-white group-hover:!text-med-terracotta transition-colors duration-300">Voyageurs</span>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={(e) => { e.preventDefault(); handleComingSoon('instagram'); }} className="relative w-10 h-10 rounded-full bg-white/10 dark:bg-gray-900 flex items-center justify-center text-white/60 hover:text-white dark:hover:text-white transition-colors border border-white/20 dark:border-slate-800">
                                    <Instagram size={18} />
                                    <AnimatePresence>
                                        {comingSoonLink === 'instagram' && (
                                            <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-700 text-med-blue dark:text-white text-[9px] uppercase tracking-wider font-bold py-1 px-2.5 rounded whitespace-nowrap pointer-events-none shadow-lg">Coming Soon</motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 text-center sm:text-left w-full md:w-auto pt-4 md:pt-0">
                            <div className="flex flex-col gap-4">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:text-white">Discover</div>
                                <div className="flex flex-col gap-3 text-sm font-light text-white/50 dark:text-slate-400">
                                    <button onClick={() => setShowAbout(true)} className="hover:text-med-terracotta transition-colors sm:text-left">The Vision</button>
                                    <a href="#features" className="hover:text-med-terracotta transition-colors sm:text-left">The Platform</a>
                                    <a href="#ecosystem" className="hover:text-med-terracotta transition-colors sm:text-left">The Ecosystem</a>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:text-white">Explore</div>
                                <div className="flex flex-col gap-3 text-sm font-light text-white/50 dark:text-slate-400">
                                    <button onClick={() => handleComingSoon('journals')} className="relative hover:text-med-terracotta transition-colors sm:text-left">
                                        Travel Journals
                                        <AnimatePresence>
                                            {comingSoonLink === 'journals' && (
                                                <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-1/2 sm:left-0 -translate-x-1/2 sm:-translate-x-0 mb-1 bg-white dark:bg-slate-700 text-med-blue dark:text-white text-[9px] uppercase tracking-wider font-bold py-1 px-2 rounded whitespace-nowrap pointer-events-none shadow-lg">Coming Soon</motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                    <button onClick={() => handleComingSoon('guides')} className="relative hover:text-med-terracotta transition-colors sm:text-left">
                                        Curated Guides
                                        <AnimatePresence>
                                            {comingSoonLink === 'guides' && (
                                                <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-1/2 sm:left-0 -translate-x-1/2 sm:-translate-x-0 mb-1 bg-med-blue dark:bg-slate-700 text-white text-[9px] uppercase tracking-wider py-1 px-2 rounded whitespace-nowrap pointer-events-none">Coming Soon</motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                    <button onClick={() => handleComingSoon('knowledge')} className="relative hover:text-med-terracotta transition-colors sm:text-left">
                                        Knowledge Base
                                        <AnimatePresence>
                                            {comingSoonLink === 'knowledge' && (
                                                <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-full left-1/2 sm:left-0 -translate-x-1/2 sm:-translate-x-0 mb-1 bg-med-blue dark:bg-slate-700 text-white text-[9px] uppercase tracking-wider py-1 px-2 rounded whitespace-nowrap pointer-events-none">Coming Soon</motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white dark:text-white">Connect</div>
                                <div className="flex flex-col gap-3 text-sm font-light text-white/50 dark:text-slate-400">
                                    <button onClick={onShowLogin} className="hover:text-med-terracotta transition-colors sm:text-left">RSVP</button>
                                    <button onClick={onShowLogin} className="hover:text-med-terracotta transition-colors sm:text-left">Login</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/15 dark:border-slate-800 pt-8 flex flex-col items-center gap-4 text-[10px] text-white/40 dark:text-slate-400 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setShowPrivacy(true)} className="hover:text-med-terracotta transition-colors">Privacy</button>
                            <button onClick={() => setShowTerms(true)} className="hover:text-med-terracotta transition-colors">Terms</button>
                        </div>
                        <p>© 2026 Candor Digital Group, LLC. All rights reserved.</p>
                    </div>
                </div>
            </footer>



            <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
            <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
            <AboutUsModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            <FeatureBreakdownModal isOpen={showFeatures} onClose={() => setShowFeatures(false)} />

            {/* Waitlist Modal */}
            <AnimatePresence>
                {showWaitlist && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                        onClick={() => setShowWaitlist(false)}
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-gray-800 p-10 text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowWaitlist(false)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 hover:text-med-blue dark:hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>

                            {waitlistSubmitted ? (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                                        <Check size={28} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-3xl font-heading font-light text-med-blue dark:text-white mb-3">You're on the list!</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">We'll notify you as soon as Voyageurs is ready for your next adventure.</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <div className="h-px w-8 bg-med-terracotta" />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta">Early Access</span>
                                        <div className="h-px w-8 bg-med-terracotta" />
                                    </div>
                                    <h3 className="text-3xl font-heading font-light text-med-blue dark:text-white mb-6">
                                        Join <span className="italic text-med-terracotta">Waitlist.</span>
                                    </h3>
                                    <div className="flex flex-col gap-4">
                                        <input
                                            type="text"
                                            value={waitlistName}
                                            onChange={e => setWaitlistName(e.target.value)}
                                            placeholder="Your Name"
                                            className="w-full px-5 py-3.5 rounded-full border-2 border-slate-200 dark:border-gray-700 bg-transparent text-med-blue dark:text-white text-sm font-body outline-none focus:border-med-terracotta dark:focus:border-med-terracotta transition-colors placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                        />
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="email"
                                                value={waitlistEmail}
                                                onChange={e => setWaitlistEmail(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleWaitlistSubmit()}
                                                placeholder="your@email.com"
                                                className="flex-1 px-5 py-3.5 rounded-full border-2 border-slate-200 dark:border-gray-700 bg-transparent text-med-blue dark:text-white text-sm font-body outline-none focus:border-med-terracotta dark:focus:border-med-terracotta transition-colors placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                            />
                                            <button
                                                onClick={handleWaitlistSubmit}
                                                disabled={waitlistLoading || !waitlistEmail || !waitlistName || !waitlistConsent}
                                                className="btn-glass-adaptive gap-2 px-6 py-3.5 text-xs whitespace-nowrap"
                                            >
                                                {waitlistLoading && <RefreshCw size={14} className="animate-spin" />}
                                                Submit
                                            </button>
                                        </div>
                                        <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={waitlistConsent}
                                                onChange={(e) => setWaitlistConsent(e.target.checked)}
                                                className="mt-0.5 rounded border-slate-300 text-med-terracotta focus:ring-med-terracotta"
                                            />
                                            <span>
                                                I agree to the <button onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="underline hover:text-med-terracotta">Terms of Service</button> and <button onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="underline hover:text-med-terracotta">Privacy Policy</button>.
                                            </span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
