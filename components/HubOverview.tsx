
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Sparkles, Compass, ArrowRight, Calendar, Check,
    MapPin, PenTool, Users, Ticket, Binoculars
} from 'lucide-react';
import { HubView } from './HubLayout';
import { Button } from './Button';
import { useGuidance } from '../hooks/useGuidance';

interface HubOverviewProps {
  onTabChange: (tab: HubView) => void;
  onOpenMap?: () => void;
  onOpenSearch?: () => void;
  onOpenEstimator?: () => void;
}

export const HubOverview: React.FC<HubOverviewProps> = ({ 
    onTabChange
}) => {
  const { user } = useUser();
  const { config } = useAppConfig();
  const { items } = useTripPlanner();
  const { theme } = useTheme();
  const activeGuidance = useGuidance();
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number} | null>(null);
  const [previewStepId, setPreviewStepId] = useState<number | null>(null);

  useEffect(() => {
      const target = new Date('2026-09-18T18:00:00').getTime();
      const update = () => {
          const now = Date.now();
          const diff = target - now;
          if (diff > 0) {
              setTimeLeft({
                  d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              });
          }
      };
      update();
      const i = setInterval(update, 60000); 
      return () => clearInterval(i);
  }, []);

  // Calculate unique official agenda days
  const officialDays = useMemo(() => {
      const unique = new Map();
      config.content.agenda
          .filter(e => e.isOfficial)
          .forEach(e => {
              if (!unique.has(e.date)) {
                  unique.set(e.date, {
                      date: e.date,
                      dayName: e.day.substring(0, 3).toUpperCase(),
                      dayNum: e.date.split('-')[2]
                  });
              }
          });
      return Array.from(unique.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [config.content.agenda]);

  // --- STEPPER LOGIC ---
  const steps = useMemo(() => {
      if (!user) return [];
      
      const hasDraft = items.length > 0;
      const isConfirmed = user.status === 'Confirmed';
      const hasSocials = !!(user.social?.instagram || user.social?.whatsapp || user.avatar?.includes('firebase'));
      const hasBooking = items.some(i => i.bookingStatus === 'booked');
      const hasInterests = (user.interests || []).length > 0;

      return [
          { 
              id: 1, 
              label: 'Draft', 
              longLabel: 'Build Your Trip', 
              icon: PenTool, 
              target: 'logistics' as HubView, 
              isComplete: hasDraft,
              desc: "Dream with precision. Add flights, accommodations, and curated experiences to shape your ideal itinerary."
          },
          { 
              id: 2, 
              label: 'Confirm', 
              longLabel: 'Confirm Attendance', 
              icon: Check, 
              target: 'rsvp' as HubView, 
              isComplete: isConfirmed,
              desc: "Let the host know you're officially coming so we can reserve your spot."
          },
          { 
              id: 3, 
              label: 'Connect', 
              longLabel: 'Explore Registry', 
              icon: Users, 
              target: 'registry' as HubView, 
              isComplete: hasSocials,
              desc: "Browse the guest directory to see who is attending and find your travel companions."
          },
          { 
              id: 4, 
              label: 'Finalize', 
              longLabel: 'Finalize Bookings', 
              icon: Ticket, 
              target: 'logistics' as HubView, 
              isComplete: hasBooking,
              desc: "Secure your flights or hotel. Mark items as 'Booked' in the planner."
          },
          { 
              id: 5, 
              label: 'Explore', 
              longLabel: 'Craft Journey', 
              icon: Binoculars, 
              target: 'activities' as HubView, 
              isComplete: hasInterests,
              desc: "Browse curated experiences and save your favorites to build your itinerary."
          }
      ];
  }, [user, items]);

  const activeStepIndex = steps.findIndex(s => !s.isComplete);
  
  const actualCurrentStep = steps.length > 0 
      ? (activeStepIndex === -1 ? steps[steps.length - 1] : steps[activeStepIndex])
      : undefined;
      
  const isAllComplete = activeStepIndex === -1 && steps.length > 0;
  const showAllSetView = isAllComplete && !previewStepId && !activeGuidance;
  
  const currentBaseStep = previewStepId 
      ? steps.find(s => s.id === previewStepId) || actualCurrentStep
      : actualCurrentStep;

  const displayedStepFinal = !showAllSetView && activeGuidance && !previewStepId
      ? steps.find(s => s.target === activeGuidance.targetView) || currentBaseStep
      : currentBaseStep;

  // Badge Logic
  let badgeLabel = "Current Step";
  let badgeStyle = "bg-med-terracotta/20 text-med-terracotta border-med-terracotta/20";

  if (displayedStepFinal) {
      if (displayedStepFinal.isComplete) {
          badgeLabel = "Completed";
          badgeStyle = "bg-med-olive/20 text-med-olive border-med-olive/20";
      } else if (activeGuidance && displayedStepFinal.target === activeGuidance.targetView) {
          badgeLabel = "Priority";
          badgeStyle = "bg-med-terracotta/20 text-med-terracotta border-med-terracotta/20";
      } else if (actualCurrentStep && displayedStepFinal.id > actualCurrentStep.id) {
          badgeLabel = "Upcoming";
          badgeStyle = theme === 'dark' ? "bg-blue-500/20 text-blue-300 border-blue-500/20" : "bg-blue-100 text-blue-600 border-blue-200";
      }
  }

  const getAppName = (view: HubView) => {
      switch (view) {
          case 'logistics': return 'Planner';
          case 'rsvp': return 'RSVP';
          case 'profile': return 'Profile';
          case 'activities': return 'Experiences';
          case 'registry': return 'Registry';
          default: return 'App';
      }
  };

  if (!user || !displayedStepFinal) return null;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-6 md:p-12 text-primary overflow-y-auto scrollbar-hide">
        
        {/* Main Dashboard Container */}
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-center py-20">
            
            {/* 1. Welcome / Status / Stepper Widget */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
                <div>
                    <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl mb-2 drop-shadow-lg text-primary">
                        Bonjour, <span className="italic text-med-terracotta">{user.name.split(' ')[0]}</span>
                    </h1>
                    <p className={`text-lg md:text-xl font-light drop-shadow-md ${theme === 'light' ? 'text-med-blue/80' : 'text-blue-100/80'}`}>
                        {timeLeft ? `${timeLeft.d} days until .` : "Welcome to the Celebration."}
                    </p>
                </div>

                {/* JOURNEY STEPPER WIDGET */}
                <div className={`group relative overflow-hidden backdrop-blur-md border p-6 md:p-8 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-700 transition-all ${theme === 'light' ? 'bg-white/60 border-med-blue/10' : 'bg-black/40 border-white/10 hover:bg-black/50'}`}>
                    
                    {/* Background Layers */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522582324369-2dfc36bd9275?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-1000 ease-out" />
                    <div className={`absolute inset-0 bg-gradient-to-t transition-colors ${theme === 'light' ? 'from-white/40 via-transparent to-transparent' : 'from-black via-transparent to-transparent opacity-80'}`} />

                    <div className="relative z-10">
                        {/* Horizontal Progress Bar */}
                        <div className="relative flex justify-between items-center mb-10 px-2">
                            {/* Connecting Line */}
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 -z-10 rounded-full ${theme === 'light' ? 'bg-med-blue/10' : 'bg-white/10'}`}></div>
                            <div 
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-med-olive -z-10 transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${(Math.max(0, activeStepIndex === -1 ? 4 : activeStepIndex) / 4) * 100}%` }}
                            ></div>

                            {steps.map((step, idx) => {
                                const isActualActive = activeGuidance 
                                    ? step.target === activeGuidance.targetView
                                    : (actualCurrentStep && step.id === actualCurrentStep.id && !isAllComplete);
                                const isSelected = displayedStepFinal.id === step.id && !showAllSetView;
                                const isPast = step.isComplete;
                                
                                return (
                                    <div 
                                        key={step.id} 
                                        className="flex flex-col items-center gap-2 relative group/step cursor-pointer" 
                                        onClick={() => setPreviewStepId(step.id)}
                                    >
                                        <div 
                                            className={`
                                                w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                                                ${isPast 
                                                    ? 'bg-med-olive border-med-olive text-white' 
                                                    : isActualActive 
                                                        ? 'bg-med-terracotta border-med-terracotta text-white shadow-lg shadow-med-terracotta/40' 
                                                        : (theme === 'light' ? 'bg-white border-med-blue/30 text-med-blue/60' : 'bg-black/40 border-white/30 text-white/60')
                                                }
                                                ${isSelected ? 'scale-125 ring-2 ring-med-terracotta ring-offset-2 ring-offset-transparent' : 'scale-90 hover:scale-100'}
                                            `}
                                        >
                                            {isPast ? <Check size={16} strokeWidth={4} /> : <step.icon size={16} />}
                                            {isActualActive && !isPast && <div className="absolute inset-0 rounded-full border-2 border-med-terracotta animate-ping opacity-30"></div>}
                                        </div>
                                        <span 
                                            className={`
                                                absolute top-full mt-2 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300
                                                ${isSelected 
                                                    ? 'text-primary opacity-100 translate-y-0' 
                                                    : (theme === 'light' 
                                                        ? 'text-med-blue opacity-70 translate-y-0 group-hover/step:opacity-100' 
                                                        : 'text-white opacity-60 translate-y-0 group-hover/step:opacity-100'
                                                      )
                                                }
                                            `}
                                        >
                                            Step {step.id}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Active Step Details */}
                        <div className={`flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-t pt-6 ${theme === 'light' ? 'border-med-blue/10' : 'border-white/10'}`}>
                            <div className="flex-1">
                                <h3 className="text-2xl font-serif font-bold mb-1 flex flex-wrap items-center gap-3 text-primary">
                                    {showAllSetView ? "You're All Set!" : (!previewStepId && activeGuidance ? activeGuidance.title : displayedStepFinal.longLabel)}
                                    {showAllSetView ? (
                                        <span className="px-2 py-0.5 bg-med-olive/20 text-med-olive rounded text-[9px] font-sans font-bold uppercase tracking-widest border border-med-olive/20 flex items-center gap-1">
                                            <Sparkles size={10} /> Journey Ready
                                        </span>
                                    ) : (
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-widest border ${badgeStyle}`}>
                                            {badgeLabel}
                                        </span>
                                    )}
                                </h3>
                                <p className={`text-sm max-w-md leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-blue-100/70'}`}>
                                    {showAllSetView ? "Your itinerary is crafted and your spot is saved. See you in ." : (!previewStepId && activeGuidance ? activeGuidance.message : displayedStepFinal.desc)}
                                </p>
                            </div>
                            <Button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const target = showAllSetView ? 'logistics' : (!previewStepId && activeGuidance ? activeGuidance.targetView : displayedStepFinal.target);
                                    onTabChange(target as HubView); 
                                }}
                                variant={showAllSetView || displayedStepFinal.isComplete ? "primary" : "action"}
                                size="md"
                                className="shrink-0 shadow-xl"
                            >
                                {showAllSetView ? "Planner" : getAppName(!previewStepId && activeGuidance ? activeGuidance.targetView : displayedStepFinal.target)} <ArrowRight size={14} className="ml-2"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Quick Glance Widgets */}
            <div className="space-y-4">
                {/* Official Agenda Widget */}
                <div 
                    onClick={() => onTabChange('calendar')}
                    className={`group relative overflow-hidden backdrop-blur-md border p-6 rounded-[2rem] shadow-xl cursor-pointer transition-all duration-500 ${theme === 'light' ? 'bg-white/60 border-med-blue/10' : 'bg-black/40 border-white/10 hover:bg-black/50'}`}
                >
                    {/* Background Layers */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-1000 ease-out" />
                    <div className={`absolute inset-0 bg-gradient-to-t transition-colors ${theme === 'light' ? 'from-white/40 via-transparent to-transparent' : 'from-black via-transparent to-transparent opacity-80'}`} />

                    <div className="relative z-10">
                        <div className={`flex items-center justify-between mb-5 border-b pb-3 ${theme === 'light' ? 'border-med-blue/10' : 'border-white/10'}`}>
                            <div className="flex items-center gap-2 text-med-terracotta">
                                <Calendar size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Official Agenda</span>
                            </div>
                            <ArrowRight size={14} className={`${theme === 'light' ? 'text-med-blue/40' : 'text-white/40'} group-hover:text-primary transition-colors`} />
                        </div>
                        
                        <div className="flex justify-between gap-3">
                            {officialDays.map((day) => (
                                <div key={day.date} className={`flex-1 flex flex-col items-center rounded-2xl py-4 border transition-colors backdrop-blur-sm ${theme === 'light' ? 'bg-med-blue/5 border-med-blue/10 group-hover:border-med-blue/20' : 'bg-white/10 border-white/10 group-hover:border-white/20'}`}>
                                    <span className={`block text-[9px] font-bold uppercase leading-none mb-1.5 ${theme === 'light' ? 'text-med-blue/60' : 'text-white/60'}`}>{day.dayName}</span>
                                    <span className={`block text-2xl font-serif leading-none ${theme === 'light' ? 'text-med-blue' : 'text-white'}`}>{day.dayNum}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Destination Highlight Card */}
                <div 
                    onClick={() => onTabChange('guide')}
                    className={`group backdrop-blur-md border p-6 rounded-[2rem] shadow-xl cursor-pointer transition-all duration-500 relative overflow-hidden ${theme === 'light' ? 'bg-white/60 border-med-blue/10' : 'bg-black/40 border-white/10 hover:bg-black/50'}`}
                >
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-110 transition-transform duration-1000 ease-out" />
                    <div className={`absolute inset-0 bg-gradient-to-t transition-colors ${theme === 'light' ? 'from-white/40 via-transparent to-transparent' : 'from-black via-transparent to-transparent opacity-80'}`} />
                    
                    <div className="relative z-10">
                        <div className={`flex items-center justify-between mb-5 border-b pb-3 ${theme === 'light' ? 'border-med-blue/10' : 'border-white/10'}`}>
                            <div className="flex items-center gap-2 text-med-terracotta">
                                <MapPin size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Your Destination</span>
                            </div>
                            <ArrowRight size={14} className={`${theme === 'light' ? 'text-med-blue/40' : 'text-white/40'} group-hover:text-primary transition-colors`} />
                        </div>
                        <h3 className="font-serif text-2xl leading-tight text-primary mb-2"></h3>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${theme === 'light' ? 'text-gray-600' : 'text-white/70'}`}>
                            Discover the medieval streets, hidden courtyards, and why they call it "The Gifted One".
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};
