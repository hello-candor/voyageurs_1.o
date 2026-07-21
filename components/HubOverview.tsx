
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Sparkles, Compass, ArrowRight, Calendar, Check,
    MapPin, PenTool, Users, Ticket, Binoculars
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HubView } from './HubLayout';
import { Button } from './Button';
import { useGuidance } from '../hooks/useGuidance';
import { DeckCarousel } from './DeckCarousel';

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

  // Shared card classes — Onyx webOS design system
  const cardBase = `rounded-[var(--onyx-card-radius)] p-8 border cursor-pointer hover:-translate-y-1 hover:scale-[1.01] ${
      theme === 'light'
          ? 'bg-white/95 border-t border-white/50 border-x border-b border-med-terracotta/10 shadow-[var(--onyx-shadow-card)]'
          : 'bg-[#1a202c]/92 backdrop-blur-[40px] border-t border-t-white/10 border-x border-b border-white/[0.06] shadow-[var(--onyx-shadow-card)]'
  }`;
  // Springy hover transition via inline style (Tailwind can't do custom cubic-bezier easily)
  const cardTransitionStyle = { transition: 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.15), box-shadow 0.3s ease, filter 0.3s ease' };

  const cardDivider = theme === 'light' ? 'border-med-terracotta/10' : 'border-white/[0.08]';

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-6 md:p-12 text-primary overflow-y-auto scrollbar-hide">
        
        <div className="max-w-5xl w-full space-y-10 py-16">

            {/* Welcome Header */}
            <div>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-1 text-primary">
                    Bonjour, <span className="italic text-med-terracotta">{user.name.split(' ')[0]}.</span>
                </h1>
                <p className={`text-base md:text-lg font-light italic ${theme === 'light' ? 'text-med-blue/80' : 'text-blue-100/80'}`}>
                    {timeLeft ? `${timeLeft.d} days until ${config.destination.split(',')[0]}.` : "Welcome to the Celebration."}
                </p>
            </div>

            {/* Deck Carousel — above the card grid */}
            {items.length > 0 && (
                <div className="w-full relative">
                    <DeckCarousel items={items} onFocusItem={() => onTabChange('logistics' as HubView)} />
                    <div className="text-center mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Journey Deck</span>
                    </div>
                </div>
            )}

            {/* Card Grid — 3 equal columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Journey Stepper Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40, delay: 0.1 }}
                    onClick={() => {
                        const target = showAllSetView ? 'logistics' : (!previewStepId && activeGuidance ? activeGuidance.targetView : displayedStepFinal.target);
                        onTabChange(target as HubView);
                    }}
                    className={`${cardBase} group flex flex-col`}
                    style={cardTransitionStyle}
                >
                    {/* Card Header — Onyx chrome */}
                    <div className={`flex items-center justify-between mb-6 border-b pb-4 ${cardDivider}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-med-terracotta shadow-[0_0_8px_#D67252]"></div>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Your Journey</span>
                        </div>
                        <ArrowRight size={14} className={`${theme === 'light' ? 'text-med-blue/30' : 'text-white/30'} group-hover:text-med-terracotta transition-colors`} />
                    </div>

                    {/* Compact Progress Dots */}
                    <div className="relative flex justify-between items-center mb-6 px-1">
                        {/* Connecting Line */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-px -z-10 rounded-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}></div>
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-med-olive -z-10 transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${(Math.max(0, activeStepIndex === -1 ? 4 : activeStepIndex) / 4) * 100}%` }}
                        ></div>

                        {steps.map((step) => {
                            const isActualActive = activeGuidance 
                                ? step.target === activeGuidance.targetView
                                : (actualCurrentStep && step.id === actualCurrentStep.id && !isAllComplete);
                            const isSelected = displayedStepFinal.id === step.id && !showAllSetView;
                            const isPast = step.isComplete;
                            
                            return (
                                <div 
                                    key={step.id} 
                                    className="flex flex-col items-center relative cursor-pointer" 
                                    onClick={(e) => { e.stopPropagation(); setPreviewStepId(step.id); }}
                                >
                                    <div 
                                        className={`
                                            w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                                            ${isPast 
                                                ? 'bg-med-olive border-med-olive text-white' 
                                                : isActualActive 
                                                    ? 'bg-med-terracotta border-med-terracotta text-white shadow-md shadow-med-terracotta/30' 
                                                    : (theme === 'light' ? 'bg-white border-gray-200 text-gray-400' : 'bg-gray-800 border-white/20 text-white/40')
                                            }
                                            ${isSelected ? 'scale-125 ring-2 ring-med-terracotta ring-offset-2 ring-offset-transparent' : 'hover:scale-110'}
                                        `}
                                    >
                                        {isPast ? <Check size={10} strokeWidth={4} /> : <step.icon size={10} />}
                                        {isActualActive && !isPast && <div className="absolute inset-0 rounded-full border-2 border-med-terracotta animate-ping opacity-30"></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Active Step Details — stacked vertically */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-serif font-bold mb-1 text-primary flex items-center gap-2 flex-wrap">
                            {showAllSetView ? "You're All Set!" : (!previewStepId && activeGuidance ? activeGuidance.title : displayedStepFinal.longLabel)}
                            {showAllSetView ? (
                                <span className="px-2 py-0.5 bg-med-olive/20 text-med-olive rounded text-[8px] font-sans font-bold uppercase tracking-widest border border-med-olive/20 inline-flex items-center gap-1">
                                    <Sparkles size={8} /> Ready
                                </span>
                            ) : (
                                <span className={`px-2 py-0.5 rounded text-[8px] font-sans font-bold uppercase tracking-widest border ${badgeStyle}`}>
                                    {badgeLabel}
                                </span>
                            )}
                        </h3>
                        <p className={`text-xs leading-relaxed mb-5 flex-1 ${theme === 'light' ? 'text-gray-500' : 'text-blue-100/60'}`}>
                            {showAllSetView ? "Your itinerary is crafted and your spot is saved." : (!previewStepId && activeGuidance ? activeGuidance.message : displayedStepFinal.desc)}
                        </p>
                        <Button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                const target = showAllSetView ? 'logistics' : (!previewStepId && activeGuidance ? activeGuidance.targetView : displayedStepFinal.target);
                                onTabChange(target as HubView); 
                            }}
                            variant={showAllSetView || displayedStepFinal.isComplete ? "primary" : "action"}
                            size="sm"
                            fullWidth
                        >
                            {showAllSetView ? "Planner" : getAppName(!previewStepId && activeGuidance ? activeGuidance.targetView : displayedStepFinal.target)} <ArrowRight size={12} className="ml-1.5"/>
                        </Button>
                    </div>
                </motion.div>

                {/* 2. Official Agenda Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40, delay: 0.2 }}
                    onClick={() => onTabChange('calendar')}
                    className={`${cardBase} group flex flex-col`}
                    style={cardTransitionStyle}
                >
                    {/* Card Header — Onyx chrome */}
                    <div className={`flex items-center justify-between mb-6 border-b pb-4 ${cardDivider}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-med-terracotta shadow-[0_0_8px_#D67252]"></div>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Official Agenda</span>
                        </div>
                        <ArrowRight size={14} className={`${theme === 'light' ? 'text-med-blue/30' : 'text-white/30'} group-hover:text-med-terracotta transition-colors`} />
                    </div>
                    
                    {/* Day Pills */}
                    <div className="flex justify-between gap-3 flex-1">
                        {officialDays.map((day) => (
                            <div key={day.date} className={`flex-1 flex flex-col items-center justify-center rounded-2xl py-5 border transition-colors ${theme === 'light' ? 'bg-med-sand/40 border-med-terracotta/10 group-hover:border-med-terracotta/20' : 'bg-white/[0.03] border-white/[0.08] group-hover:border-white/[0.15]'}`}>
                                <span className={`block text-[9px] font-bold uppercase leading-none mb-2 ${theme === 'light' ? 'text-med-blue/50' : 'text-white/50'}`}>{day.dayName}</span>
                                <span className={`block text-3xl font-serif leading-none ${theme === 'light' ? 'text-med-blue' : 'text-white'}`}>{day.dayNum}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* 3. Destination Card */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 40, delay: 0.3 }}
                    onClick={() => onTabChange('guide')}
                    className={`${cardBase} group flex flex-col`}
                    style={cardTransitionStyle}
                >
                    {/* Card Header — Onyx chrome */}
                    <div className={`flex items-center justify-between mb-6 border-b pb-4 ${cardDivider}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-med-terracotta shadow-[0_0_8px_#D67252]"></div>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Your Destination</span>
                        </div>
                        <ArrowRight size={14} className={`${theme === 'light' ? 'text-med-blue/30' : 'text-white/30'} group-hover:text-med-terracotta transition-colors`} />
                    </div>

                    {/* Destination Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-serif text-3xl leading-tight text-primary mb-3">{config.destination.split(',')[0]}</h3>
                        <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                            Discover the medieval streets, hidden courtyards, and why they call it "The Gifted One".
                        </p>
                    </div>
                </motion.div>

            </div>

        </div>
    </div>
  );
};
