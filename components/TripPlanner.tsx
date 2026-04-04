
import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plane, Bed, Ticket, MapPin, Calculator, Loader2, 
    Check, ChevronRight, ArrowRight, Wallet, Info, Globe, Search, Users, Sparkles, Calendar, Train, Plus, Share2
} from 'lucide-react';
import { useTripPlanner, PlanItem } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { useAppConfig } from '../context/AppConfigContext';
import { Accommodation } from './Accommodation';
import { BookingAssistant } from './BookingAssistant';
import { getTripCostEstimate, TripEstimate, RouteOption } from '../services/geminiService';
import { useNotification } from '../context/NotificationContext';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';

interface TripPlannerProps {
  onTabChange?: (view: any) => void;
  initialTab?: PlanningTab;
  embedded?: boolean;
}

export type PlanningTab = 'travel' | 'lodging' | 'booking';

// --- Recommended Data ---
const REC_FLIGHTS = [
  {
    id: 'flight-cdg',
    type: 'flight' as const,
    title: 'Via Paris (CDG)',
    subtitle: 'The Seamless Hub',
    description: 'Fly into Charles de Gaulle (CDG). The high-speed TGV station is located directly beneath Terminal 2, offering a fast rail connection directly to  center.',
    cost: 950,
    image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop',
    badge: 'Primary Hub'
  },
  {
    id: 'flight-bcn',
    type: 'flight' as const,
    title: 'Via Barcelona (BCN)',
    subtitle: 'The Scenic Hub',
    description: 'Fly into Barcelona El Prat. Enjoy the Catalan coast on your way north. A great hub for guests coming from the Americas or Southern Europe.',
    cost: 850,
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop',
    badge: 'Popular'
  },
  {
    id: 'flight-mpl',
    type: 'flight' as const,
    title: 'Direct to MPL',
    subtitle: 'Maximum Convenience',
    description: 'Connect through a major European hub (like AMS, LGW, or FRA) to land directly at -Méditerranée, just 15 minutes from the city center.',
    cost: 1100,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    badge: 'Fastest'
  },
  {
    id: 'flight-wildcard',
    type: 'flight' as const,
    title: 'Regional Budget Hubs',
    subtitle: 'Maximum Savings',
    description: 'Fly into secondary hubs like Nîmes (FNI) or Marseille (MRS) using low-cost carriers. Often significant savings for flexible travelers.',
    cost: 650,
    image: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=800&auto=format&fit=crop',
    badge: 'Budget'
  }
];

export const TripPlanner: React.FC<TripPlannerProps> = ({ initialTab, embedded = false }) => {
  const { items, travelers, addToPlan, isInPlan, removeFromPlan, updateSettings, durationDays } = useTripPlanner();
  const { user, updateOfficialItinerary, updateTravelDetails } = useUser();
  const { addNotification } = useNotification();
  const { config } = useAppConfig();
  
  const [activeTab, setActiveTab] = useState<PlanningTab>(initialTab || 'travel');
  const [isSharing, setIsSharing] = useState(false);

  // Planning Journey Logic
  const planningStatus = useMemo(() => {
    const hasFlight = items.some(i => i.category === 'flight' || i.category === 'train');
    const hasHotel = items.some(i => i.category === 'hotel');
    return { hasFlight, hasHotel };
  }, [items]);

  // Quick Estimator State - Defaulted to 9/15/26 to 9/22/26 as requested
  const [origin, setOrigin] = useState(user?.travelDetails?.hub || '');
  const [destination, setDestination] = useState('MPL');
  const [startDate, setStartDate] = useState(user?.travelDetails?.arrivalDate || '2026-09-15');
  const [endDate, setEndDate] = useState(user?.travelDetails?.departureDate || '2026-09-22');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimates, setEstimates] = useState<TripEstimate | null>(null);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleEstimate = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!origin) return;
      setIsEstimating(true);
      
      const data = await getTripCostEstimate(origin, destination, 'any', startDate, endDate);
      setEstimates(data);
      setIsEstimating(false);
      
      // Update global user preference for origin
      if (user) {
          updateTravelDetails({
              ...user.travelDetails,
              hub: origin,
              arrivalDate: startDate,
              departureDate: endDate,
              arrivalMode: user.travelDetails?.arrivalMode || 'Plane',
              arrivalNumber: user.travelDetails?.arrivalNumber || '',
              accommodation: user.travelDetails?.accommodation || ''
          } as any);
      }
  };

  const handleShareItinerary = async () => {
      setIsSharing(true);
      
      // Serialize current state
      const data = { items, travelers, durationDays };
      try {
          const json = JSON.stringify(data);
          // Safe encoding for URL
          const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
              function toSolidBytes(match, p1) { return String.fromCharCode(parseInt(p1, 16)); }));
          
          const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
          const shareTitle = `My Trip Plan to ${config.appName}`;
          const shareText = `Check out my itinerary draft for ${travelers} people.`;

          if (navigator.share) {
              await navigator.share({
                  title: shareTitle,
                  text: shareText,
                  url: shareUrl
              });
              addNotification('Itinerary shared successfully!', 'success');
          } else {
              await navigator.clipboard.writeText(shareUrl);
              addNotification('Itinerary link copied to clipboard.', 'success');
          }
      } catch (e) {
          console.error('Error sharing', e);
          addNotification('Could not share itinerary.', 'error');
      } finally {
          setIsSharing(false);
      }
  };

  const getRouteImage = (id: string, existingImage?: string) => {
      if (existingImage) return existingImage;
      switch (id) {
          case 'via-paris':
          case 'flight-cdg':
              return "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop";
          case 'via-bcn':
          case 'flight-bcn':
              return "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop";
          case 'via-wildcard':
          case 'flight-wildcard':
              return "https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=800&auto=format&fit=crop";
          case 'fly-mpl':
          case 'flight-mpl':
          default:
              return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop";
      }
  };

  const handleSelectOption = (option: any) => {
    let bookingUrl = '';
    let secondaryBookingUrl: string | undefined = undefined;

    // Standard flight search
    const flightQuery = (originCity: string, destCity: string) => 
        `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(originCity)}%20to%20${encodeURIComponent(destCity)}%20on%20${startDate}%20returning%20${endDate}`;
    
    // Standard train search
    const trainQuery = (fromStation: string, toStation: string) => 
        `https://www.thetrainline.com/search?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}&outwardDate=${startDate}T10:00:00`;

    if (option.type === 'mixed') {
        if (option.id === 'via-paris') {
            bookingUrl = flightQuery(origin, 'CDG');
            secondaryBookingUrl = trainQuery('Paris Charles de Gaulle Airport', ' Saint-Roch');
        } else if (option.id === 'via-bcn') {
            bookingUrl = flightQuery(origin, 'BCN');
            secondaryBookingUrl = trainQuery('Barcelona Sants', ' Saint-Roch');
        }
    } else {
        // Fallback for direct flight or regional hubs
        const hubs: { [key: string]: string } = {
            'fly-mpl': 'MPL',
            'via-wildcard': 'MRS' // Default to Marseille for wildcard
        };
        const destHub = hubs[option.id] || 'MPL';
        bookingUrl = flightQuery(origin, destHub);
    }
    
    const item: PlanItem = {
        id: `travel-${option.id}-${Date.now()}`,
        category: option.type === 'mixed' ? 'flight' : option.type,
        name: option.title,
        baseCost: option.cost,
        cost: option.cost * travelers,
        pricingType: 'perPerson',
        details: option.description + (option.duration ? ` (${option.duration})` : ''),
        image: getRouteImage(option.id, option.image),
        bookingUrl: bookingUrl,
        secondaryBookingUrl: secondaryBookingUrl
    };
    
    addToPlan(item);
    
    updateOfficialItinerary({
        transport: {
            id: item.id,
            type: option.type === 'mixed' ? 'flight' : option.type,
            title: item.name,
            name: item.name,
            image: item.image || '',
            baseCost: item.baseCost
        }
    });
    
    addNotification(
        `${option.title} added to your plan.`, 
        'success'
    );
  };

  const displayOptions = estimates?.options || REC_FLIGHTS;

  return (
    <div className="flex flex-col h-full bg-med-sand dark:bg-slate-900">
        {/* Header - Compact on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 border-b border-gray-100 dark:border-white/5 pb-4 md:pb-6 shrink-0 p-4 md:p-14 md:pb-6">
            <div className="flex items-center gap-4">
                <h2 className="font-serif text-2xl md:text-3xl text-med-blue dark:text-white leading-none whitespace-nowrap">
                    Logistics <span className="italic text-med-terracotta">Manager</span>
                </h2>
                <button 
                    onClick={handleShareItinerary}
                    className="p-2 rounded-full bg-white dark:bg-gray-800 text-med-blue dark:text-blue-300 hover:text-med-terracotta transition-colors shadow-sm border border-gray-100 dark:border-gray-700"
                    title="Share Itinerary"
                >
                    {isSharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                </button>
            </div>
            
            <SegmentedControl 
                items={[
                    { id: 'travel', label: 'Travel', icon: Plane },
                    { 
                        id: 'lodging', 
                        label: 'Lodging', 
                        icon: Bed, 
                        badge: (planningStatus.hasFlight && !planningStatus.hasHotel) ? 'Next' : undefined 
                    },
                    { id: 'booking', label: 'Book Now', icon: Ticket, badge: items.length > 0 ? items.length : undefined },
                ]}
                selectedId={activeTab}
                onChange={(id) => setActiveTab(id as PlanningTab)}
            />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            
            {/* --- TRAVEL TAB (COMBINED) --- */}
            {activeTab === 'travel' && (
                <div className="p-4 md:p-14 animate-in fade-in duration-500">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                        
                        {/* Left Column: Parameters & Info */}
                        <div className="lg:w-1/3">
                            <div className="lg:sticky lg:top-12 space-y-6 md:space-y-8">
                                <div className="hidden md:block">
                                    <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Getting There</span>
                                    <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                                        Flight<br />
                                        <span className="italic text-med-terracotta">Gateway</span>
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                                        " is perfectly connected via major European flight hubs. Choose your gateway to the Mediterranean."
                                    </p>
                                </div>

                                {/* Origins Card: Integrated Dates */}
                                <div className="bg-white dark:bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-med-blue/10 dark:border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-med-terracotta/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                    
                                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-med-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-med-blue/20 shrink-0">
                                            <Globe size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-lg md:text-xl text-med-blue dark:text-white leading-tight">Where are you flying from?</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mt-1">Hub Routes & Pricing</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:gap-6 items-end">
                                        {/* Departure City */}
                                        <div className="space-y-2 group">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 group-focus-within:text-med-blue transition-colors">Departure Airport / City</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input 
                                                    type="text" 
                                                    value={origin}
                                                    onChange={(e) => setOrigin(e.target.value)}
                                                    placeholder="e.g. London, JFK..."
                                                    className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold text-med-blue dark:text-white outline-none border-2 border-transparent focus:border-med-blue transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Estimated Dates Row */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Estimated Travel Dates</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                    <input 
                                                        type="date" 
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-full pl-10 pr-2 py-3 md:py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-bold text-med-blue dark:text-white outline-none border-2 border-transparent focus:border-med-blue transition-all"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                    <input 
                                                        type="date" 
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-full pl-10 pr-2 py-3 md:py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-[10px] font-bold text-med-blue dark:text-white outline-none border-2 border-transparent focus:border-med-blue transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Travelers Count */}
                                        <div className="space-y-2 group">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1 group-focus-within:text-med-blue transition-colors">Party Size</label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <select 
                                                    value={travelers} 
                                                    onChange={(e) => updateSettings(parseInt(e.target.value), durationDays)} 
                                                    className="w-full pl-11 pr-4 py-3 md:py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold text-med-blue dark:text-white outline-none border-2 border-transparent focus:border-med-blue transition-all appearance-none cursor-pointer"
                                                >
                                                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Voyageur' : 'Voyageurs'}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                    <ChevronRight size={14} className="rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={handleEstimate}
                                            disabled={!origin || isEstimating}
                                            variant="action"
                                            fullWidth
                                            size="lg"
                                            className="mt-2 shadow-2xl"
                                        >
                                            {isEstimating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                            <span className="ml-2">{isEstimating ? 'Calculating...' : 'Find Routes'}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Route Results */}
                        <div className="lg:w-2/3 min-h-[500px]">
                            {isEstimating ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                                    <Loader2 size={48} className="text-med-terracotta animate-spin" />
                                    <p className="text-med-blue dark:text-blue-100 font-serif text-xl">Analyzing flight paths...</p>
                                    <p className="text-gray-400 text-xs uppercase tracking-widest">Checking CDG, BCN, and MPL Hubs</p>
                                </div>
                            ) : (
                                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-serif text-2xl md:text-3xl text-med-blue dark:text-white">
                                            {estimates ? `Routes from ${origin}` : 'Recommended Routes'}
                                        </h3>
                                        {!estimates && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                General Examples
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                                        {displayOptions.map((opt: any) => {
                                            const isSelected = isInPlan(`travel-${opt.id}`);
                                            const displayCost = opt.cost * travelers;

                                            return (
                                                <div 
                                                    key={opt.id}
                                                    onClick={() => handleSelectOption(opt)}
                                                    className={`group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 md:p-8 border-2 transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center hover:shadow-xl ${isSelected ? 'border-med-olive bg-med-olive/5' : 'border-gray-100 dark:border-gray-800 hover:border-med-blue/30'}`}
                                                >
                                                    {/* Image Thumbnail */}
                                                    <div className="relative w-full md:w-32 h-32 md:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md">
                                                        <img src={getRouteImage(opt.id, opt.image)} alt={opt.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className={`absolute inset-0 bg-med-blue/20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>
                                                        {isSelected && (
                                                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                                                <Check size={32} strokeWidth={3} className="drop-shadow-md" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            {opt.badge && (
                                                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${opt.badge === 'Recommended' ? 'bg-med-terracotta text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                                    {opt.badge}
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                {opt.type === 'flight' ? <Plane size={12} /> : <Train size={12} />}
                                                                {opt.type === 'mixed' ? 'Flight + Train' : 'Direct Flight'}
                                                            </div>
                                                        </div>
                                                        <h4 className="font-serif text-2xl text-med-blue dark:text-white mb-2">{opt.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-1 line-clamp-2">
                                                            {opt.description}
                                                        </p>
                                                        {opt.whyItIsUnique && (
                                                            <p className="text-xs text-med-terracotta italic mt-1">"{opt.whyItIsUnique}"</p>
                                                        )}
                                                    </div>

                                                    {/* Action & Price */}
                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-1 pl-4 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-8">
                                                        <div className="text-left md:text-right">
                                                            <span className="block font-serif text-3xl font-bold text-med-blue dark:text-white">${displayCost.toLocaleString()}</span>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Est. Total</span>
                                                        </div>
                                                        <button 
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${isSelected ? 'bg-med-olive text-white scale-110' : 'bg-white dark:bg-gray-800 text-gray-300 hover:text-med-blue hover:scale-110'}`}
                                                        >
                                                            {isSelected ? <Check size={20} /> : <Plus size={20} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- LODGING TAB --- */}
            {activeTab === 'lodging' && (
                <Accommodation onNavigateToBookNow={() => setActiveTab('booking')} />
            )}

            {/* --- BOOKING TAB --- */}
            {activeTab === 'booking' && (
                <BookingAssistant />
            )}
        </div>
    </div>
  );
};
