
import React, { useState, useEffect, useRef } from 'react';
import { Utensils, Info, Coffee, Wine, Moon, Star, ExternalLink, X, Check, Sparkles, MapPin, Loader2, ChefHat, Clock, Plus, Trash2, ChevronRight, Sun, CloudSun } from 'lucide-react';
import { getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useAppConfig } from '../context/AppConfigContext';
import { Restaurant } from '../types';

const ICON_MAP: Record<string, any> = {
    Coffee, Sun, Utensils, CloudSun, Wine, Moon
};

export const DiningGuide: React.FC = () => {
  const { config } = useAppConfig();
  const DINING_DATA = config.content.dining;
  
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('dinner');
  const [realTimeDetails, setRealTimeDetails] = useState<PlaceDetails | null>(null);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const { addToPlan, removeFromPlan, isInPlan, travelers } = useTripPlanner();

  const handleSelect = async (restaurant: Restaurant) => {
      setSelectedRestaurant(restaurant);
      setRealTimeDetails(null);
      setLoadingRealTime(true);
      const data = await getPlaceDetails(restaurant.googleQuery, "Montpellier, France");
      setRealTimeDetails(data);
      setLoadingRealTime(false);
  };

  useEffect(() => {
    if (selectedRestaurant) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; }
  }, [selectedRestaurant]);

  const category = DINING_DATA.find(c => c.id === activeCategory);

  const handlePlanToggle = (e?: React.MouseEvent, restaurant?: Restaurant) => {
      if (e) e.stopPropagation();
      const target = restaurant || selectedRestaurant;
      if (!target) return;
      
      if (isInPlan(target.name)) {
          removeFromPlan(target.name);
      } else {
          const costPerPerson = [30, 60, 100, 180][target.priceLevel - 1] || 50;
          addToPlan({
              id: target.name,
              category: 'dining',
              name: target.name,
              baseCost: costPerPerson,
              cost: costPerPerson * travelers,
              pricingType: 'perPerson',
              details: 'Estimated Dinner',
              image: target.image
          });
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-12 space-y-8">
                <div>
                    <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Gastronomy</span>
                    <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                        The Culinary<br />
                        <span className="italic text-med-terracotta">Guide</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                        "In Montpellier, the table is sacred. Every terrace is an opportunity for connection, and every meal is a celebration of the terroir."
                    </p>
                </div>

                <div className="hidden lg:flex flex-col gap-2">
                    {DINING_DATA.map((cat) => {
                        const Icon = ICON_MAP[cat.iconName || 'Utensils'] || Utensils;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${activeCategory === cat.id ? 'bg-white dark:bg-gray-800 text-med-blue border-med-blue shadow-md -translate-x-1' : 'bg-transparent text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <div className={`p-2 rounded-lg shrink-0 ${activeCategory === cat.id ? 'bg-med-blue text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <Icon size={16} />
                                </div>
                                <span className="font-bold text-[11px] uppercase tracking-wider">{cat.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        <div className="lg:w-2/3 min-h-[600px]">
            <div className="lg:hidden sticky top-0 z-30 bg-med-sand/95 dark:bg-gray-900/95 backdrop-blur-md -mx-4 px-4 py-3 mb-6 flex gap-3 overflow-x-auto snap-x scrollbar-hide border-b border-med-terracotta/10">
                {DINING_DATA.map((cat) => {
                    const Icon = ICON_MAP[cat.iconName || 'Utensils'] || Utensils;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 border snap-center whitespace-nowrap ${activeCategory === cat.id ? 'bg-med-blue text-white border-med-blue shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent'}`}
                        >
                            <Icon size={14} />
                            <span className="font-bold text-[10px] uppercase tracking-wider">{cat.title}</span>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {category?.restaurants.map((restaurant, idx) => {
                    const isCardAdded = isInPlan(restaurant.name);
                    const cardCost = ([30, 60, 100, 180][restaurant.priceLevel - 1] || 50) * travelers;
                    return (
                        <div 
                            key={idx}
                            onClick={() => handleSelect(restaurant)}
                            className={`bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border transition-all duration-300 group flex flex-col h-full cursor-pointer relative hover:shadow-xl ${isCardAdded ? 'border-med-olive ring-2 ring-med-olive' : 'border-gray-100 dark:border-gray-800'}`}
                        >
                            <div className="h-56 md:h-64 relative overflow-hidden shrink-0">
                                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                                {isCardAdded && (
                                    <div className="absolute top-6 right-6 bg-med-olive text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 shadow-lg z-20"><Check size={14} strokeWidth={4} /> Selected</div>
                                )}
                                <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-med-blue shadow-md border border-white/20 flex gap-1">
                                    {[...Array(4)].map((_, i) => <span key={i} className={i < restaurant.priceLevel ? "text-med-terracotta" : "opacity-30 text-gray-400"}>$</span>)}
                                </div>
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ChefHat size={12} className="text-med-terracotta" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{restaurant.cuisine}</span>
                                    </div>
                                    <h3 className="font-serif text-3xl leading-none">{restaurant.name}</h3>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 flex-grow italic">"{restaurant.description}"</p>
                                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-serif font-bold text-3xl text-med-blue dark:text-white">${cardCost.toLocaleString()}</span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Est. Total ({travelers} Voyageurs)</span>
                                    </div>
                                    <div className={`p-3 rounded-xl transition-all ${isCardAdded ? 'bg-med-olive text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {selectedRestaurant && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-med-blue/60 dark:bg-gray-950/80 backdrop-blur-md p-4 transition-opacity duration-300" onClick={() => setSelectedRestaurant(null)}>
                <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-auto max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300 border border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelectedRestaurant(null)} className="absolute top-6 right-6 z-30 p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 bg-white/20 backdrop-blur-md"><X size={24} /></button>
                    <div className="h-56 md:h-auto md:w-2/5 relative shrink-0 bg-gray-100">
                        <img src={realTimeDetails?.imageUrl || selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden"></div>
                        <div className="absolute bottom-6 left-6 md:hidden text-white font-serif text-3xl font-bold">{selectedRestaurant.name}</div>
                    </div>
                    <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-white dark:bg-gray-900">
                        <div className="mb-10 hidden md:block">
                            <h2 className="font-serif text-4xl md:text-5xl text-med-blue dark:text-white leading-tight mb-4">{selectedRestaurant.name}</h2>
                            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1"><Info size={14} className="text-med-terracotta" /> {selectedRestaurant.cuisine}</span>
                                <span>•</span>
                                <span>Level {selectedRestaurant.priceLevel}/4</span>
                            </div>
                        </div>
                        <div className="space-y-10">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base font-medium italic">"{realTimeDetails?.summary || selectedRestaurant.fullDescription}"</p>
                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
                                <button onClick={(e) => handlePlanToggle(e)} className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-[10px] shadow-xl ${isInPlan(selectedRestaurant.name) ? 'bg-med-olive text-white shadow-med-olive/20' : 'bg-med-blue text-white hover:bg-med-terracotta'}`}>
                                    {isInPlan(selectedRestaurant.name) ? <><Check size={18} strokeWidth={4}/> On Plan</> : <><Plus size={18}/> Add to Wishlist</>}
                                </button>
                                <a href={selectedRestaurant.reservationLink || selectedRestaurant.website} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-med-blue transition-colors">Digital Concierge <ExternalLink size={16} /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
