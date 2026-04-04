
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, X, Sparkles, Search, LayoutDashboard, GripHorizontal, Layers, ArrowRight, Users, Palette, Radio, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { HubView } from './HubLayout';

export type TourType = 'onboarding' | 'host';

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: (targetApp?: HubView) => void;
  type?: TourType;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ isOpen, onClose, type = 'onboarding' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const { user } = useUser();
  const observerRef = useRef<ResizeObserver | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentStep(0);
    } 
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, type]); // Reset when type changes

  const firstName = user?.name.split(' ')[0] || 'Voyageur';

  // Define steps for each tour type
  const stepsData = {
      onboarding: [
        {
            targetId: null,
            title: `Bienvenue, ${firstName}`,
            content: "Welcome to Voyageurs. A fluid, spatial workspace designed for your weekend in .",
            icon: Sparkles,
            position: 'center',
            color: 'text-med-terracotta',
            bg: 'bg-med-terracotta/10'
        },
        {
            targetId: 'hub-navigation-dock',
            title: "The Dock",
            content: "Your journey starts here. Launch apps to explore the agenda, manage logistics, or view the guest registry.",
            icon: LayoutDashboard,
            position: 'top',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            targetId: 'webos-home-pill', 
            title: "Overview Mode",
            content: "Tap the Center Pill to zoom out. This allows you to switch between active apps and organize your workspace.",
            icon: GripHorizontal,
            position: 'top',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            targetId: null, 
            title: "Smart Stacking",
            content: "Keep your workspace clean. Drag cards onto one another to create 'Stacks'—like grouping your flight booking with your hotel details.",
            icon: Layers,
            position: 'center',
            color: 'text-med-olive',
            bg: 'bg-med-olive/10'
        },
        {
            targetId: 'hub-search-btn',
            title: "Ask Céleste",
            content: "Your AI concierge is always available. Ask about the schedule, local history, or request a translation.",
            icon: Search,
            position: 'bottom',
            color: 'text-pink-500',
            bg: 'bg-pink-500/10'
        }
      ],
      host: [
        {
            targetId: null,
            title: "Mission Control",
            content: "Welcome to the Host Console. You have full control over the app content, guest list, and communications from this secure environment.",
            icon: LayoutDashboard,
            position: 'center',
            color: 'text-med-blue',
            bg: 'bg-med-blue/10'
        },
        {
            targetId: 'host-dock-btn-dashboard',
            title: "Command Center",
            content: "View high-level stats: total RSVPs, confirmed guests, and outstanding tasks.",
            icon: LayoutDashboard,
            position: 'top',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            targetId: 'host-dock-btn-guests',
            title: "Guest Manifest",
            content: "Add, edit, or remove guests. You can also bulk import via CSV or manage detailed profiles.",
            icon: Users,
            position: 'top',
            color: 'text-med-terracotta',
            bg: 'bg-med-terracotta/10'
        },
        {
            targetId: 'host-dock-btn-build',
            title: "Experience Builder",
            content: "The magic wand. Update the itinerary, change hotel details, or modify the travel guide in real-time.",
            icon: Palette,
            position: 'top',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            targetId: 'host-dock-btn-communications',
            title: "Broadcast Tower",
            content: "Send push notifications, emails, or update the news feed for all your guests instantly.",
            icon: Radio,
            position: 'top',
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            targetId: 'host-exit-btn',
            title: "Return to Earth",
            content: "Click here to exit Admin mode and view the app as your guests see it.",
            icon: LogOut,
            position: 'bottom-left',
            color: 'text-red-500',
            bg: 'bg-red-500/10'
        }
      ]
  };

  const steps = stepsData[type] || stepsData.onboarding;

  const updateRect = () => {
      const step = steps[currentStep];
      if (step.targetId) {
          const el = document.getElementById(step.targetId);
          if (el) {
              const r = el.getBoundingClientRect();
              setRect((prev) => {
                  if (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height) return prev;
                  return r;
              });
          } else {
              setRect(null); 
          }
      } else {
          setRect(null);
      }
  };

  useEffect(() => {
      if (!isOpen) return;
      
      requestAnimationFrame(updateRect);
      observerRef.current = new ResizeObserver(updateRect);
      observerRef.current.observe(document.body);
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);

      return () => {
          observerRef.current?.disconnect();
          window.removeEventListener('scroll', updateRect, true);
          window.removeEventListener('resize', updateRect);
      };
  }, [currentStep, isOpen]);

  const handleNext = () => {
      if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
      } else {
          onClose();
      }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isSpotlight = !!rect && !!currentStepData.targetId;

  // Smart Positioning: Calculates available space
  const margin = 24; // Margin from target element
  const viewportPadding = 32; // 2rem, padding from viewport edges

  let cardStyle: React.CSSProperties = {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90vw',
      maxWidth: '360px',
      zIndex: 10000,
  };

  if (isSpotlight && rect) {
      const isTopHalf = rect.top + rect.height / 2 < window.innerHeight / 2;
      
      if (isTopHalf) {
          // Place card BELOW target
          cardStyle.top = rect.bottom + margin; 
          cardStyle.bottom = undefined; // Reset
      } else {
          // Place card ABOVE target
          cardStyle.bottom = (window.innerHeight - rect.top) + margin;
          cardStyle.top = undefined; // Reset
      }
  } else {
      // Center of screen
      cardStyle.top = '50%';
      cardStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden font-sans">
      
      {/* 1. The Spotlight / Backdrop */}
      <AnimatePresence>
        {isSpotlight && rect ? (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 pointer-events-none"
            >
                {/* Dark Overlay with Cutout via CSS Box Shadow Ring trick */}
                <div 
                    className="absolute rounded-2xl transition-all duration-500 ease-out"
                    style={{
                        top: rect.top - 8,
                        left: rect.left - 8,
                        width: rect.width + 16,
                        height: rect.height + 16,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 4px rgba(255, 255, 255, 0.3)'
                    }}
                >
                    {/* Pulse Animation on the Highlight Ring */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-white/50 animate-pulse" />
                </div>
            </motion.div>
        ) : (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto" 
            />
        )}
      </AnimatePresence>

      {/* 2. The Floating Card */}
      <motion.div 
        className="pointer-events-auto"
        style={cardStyle}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl p-1 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative mx-auto max-h-[min(80vh,500px)] flex flex-col">
              
              {/* Content Container */}
              <div className="bg-white/50 dark:bg-black/20 rounded-[2rem] p-8 sm:p-10 relative overflow-y-auto flex-1 scrollbar-hide">
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${currentStepData.bg} ${currentStepData.color} ring-1 ring-white/20`}>
                          <currentStepData.icon size={24} />
                      </div>
                      <button 
                        onClick={() => onClose()} 
                        className="p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close Tour"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3 min-h-[100px]">
                      <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 
                              className="font-serif text-med-blue dark:text-white leading-[1.1] mb-3 tracking-tight"
                              style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}
                            >
                                {currentStepData.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-[clamp(0.875rem,2vw,1.1rem)] leading-relaxed font-medium">
                                {currentStepData.content}
                            </p>
                        </motion.div>
                      </AnimatePresence>
                  </div>

                  {/* Navigation Bar */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                      {/* Step Indicator */}
                      <div className="flex gap-1.5 items-center">
                          {steps.map((_, i) => (
                              <motion.div 
                                key={i} 
                                className={`h-1.5 rounded-full ${i === currentStep ? 'bg-med-terracotta' : 'bg-gray-300 dark:bg-gray-700'}`} 
                                animate={{ width: i === currentStep ? 24 : 6 }}
                              />
                          ))}
                      </div>
                      
                      <button 
                          onClick={handleNext}
                          className="bg-med-blue text-white pl-6 pr-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:bg-med-blue/90 hover:scale-105 transition-all flex items-center gap-2 active:scale-95 group border border-white/10"
                      >
                          {currentStep === steps.length - 1 ? 'Start' : 'Next'} 
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
      </motion.div>

    </div>
  );
};
