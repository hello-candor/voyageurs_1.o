
import React, { useState, useEffect } from 'react';
import { Star, Heart, Shield, Wallet, X, Check, ChevronRight, MapPin, Plus, Trash2 } from 'lucide-react';
import { getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useAppConfig } from '../context/AppConfigContext';
import { useNotification } from '../context/NotificationContext';
import { Hotel } from '../types';
import { Button } from './Button';

// Icon mapping for dynamic data
const ICON_MAP: Record<string, any> = {
    Heart, Shield, Wallet
};

interface AccommodationProps {
    onNavigateToBookNow?: () => void;
}

export const Accommodation: React.FC<AccommodationProps> = ({ onNavigateToBookNow }) => {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('romantic');
  const [realTimeDetails, setRealTimeDetails] = useState<PlaceDetails | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  
  const { user, updateOfficialItinerary, updateTravelDetails } = useUser();
  const { config } = useAppConfig();
  const { addToPlan, removeFromPlan, isInPlan, travelers, durationDays } = useTripPlanner();
  const { addNotification } = useNotification();
  const HOTEL_DATA = config.content.accommodation;

  const handleHotelSelect = async (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setActiveGalleryIndex(0);
    setRealTimeDetails(null);
    const details = await getPlaceDetails(hotel.name, "Montpellier, France");
    setRealTimeDetails(details);
  };

  useEffect(() => {
    if (selectedHotel) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedHotel]);

  const category = HOTEL_DATA.find(c => c.id === activeCategory);

  const handleConfirmHotel = (e: React.MouseEvent, hotel: Hotel) => {
    e.stopPropagation();
    const hotelId = `hotel-${hotel.name.replace(/\s+/g, '-').toLowerCase()}`;
    const isAlreadyOfficial = user?.officialItinerary?.hotel?.name === hotel.name || isInPlan(hotelId);
    
    if (isAlreadyOfficial) {
        updateOfficialItinerary({ hotel: undefined });
        updateTravelDetails({ ...user?.travelDetails, accommodation: '' } as any);
        removeFromPlan(hotelId);
    } else {
        // Update profile
        updateOfficialItinerary({
            hotel: { name: hotel.name, image: hotel.image, baseRate: hotel.baseRate }
        });
        updateTravelDetails({ ...user?.travelDetails, accommodation: hotel.name } as any);
        
        // Calculate initial total cost based on duration and party size
        const rooms = Math.ceil(travelers / 2);
        const totalStayCost = hotel.baseRate * durationDays * rooms;

        // Add to global bookings list
        addToPlan({
            id: hotelId,
            category: 'hotel',
            name: hotel.name,
            baseCost: hotel.baseRate,
            cost: totalStayCost, 
            pricingType: 'hotel',
            details: `${hotel.stars}* • ${hotel.tag} (${durationDays} nights)`,
            image: hotel.image,
            bookingUrl: hotel.link
        });

        // Trigger Notification
        addNotification(
            `${hotel.name} added to your plan.`, 
            'success'
        );
    }
  };

  return (
    <div className="p-8 md:p-14 animate-in fade-in duration-500">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="lg:w-1/3">
                <div className="lg:sticky lg:top-12 space-y-8">
                    <div>
                        <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Lodging Selection</span>
                        <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                            Official<br />
                            <span className="italic text-med-terracotta">Stays</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                            "Your home in the heart of the Écusson or amidst the surrounding vines."
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {HOTEL_DATA.map((cat) => {
                            const Icon = ICON_MAP[cat.iconName || 'Shield'] || Shield;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-4 p-5 rounded-2xl transition-all border text-left ${activeCategory === cat.id ? 'bg-white dark:bg-gray-800 text-med-blue border-med-blue shadow-lg -translate-x-1' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-med-terracotta/30'}`}
                                >
                                    <div className={`p-3 rounded-xl shrink-0 ${activeCategory === cat.id ? 'bg-med-blue text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-[11px] uppercase tracking-wider">{cat.title}</span>
                                        <span className="text-[9px] opacity-60 leading-tight block font-medium">{cat.description}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="lg:w-2/3 min-h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {category?.hotels.map((hotel, idx) => {
                        const hotelId = `hotel-${hotel.name.replace(/\s+/g, '-').toLowerCase()}`;
                        const isOfficial = user?.officialItinerary?.hotel?.name === hotel.name || isInPlan(hotelId);
                        return (
                            <div 
                                key={idx}
                                onClick={() => handleHotelSelect(hotel)}
                                className={`bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border transition-all duration-300 group cursor-pointer relative flex flex-col h-full hover:shadow-xl ${isOfficial ? 'border-med-olive ring-2 ring-med-olive' : 'border-gray-100 dark:border-gray-800'}`}
                            >
                                <div className="h-56 md:h-64 relative overflow-hidden shrink-0">
                                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                                    <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-xs flex gap-1 shadow-md">
                                        {[...Array(hotel.stars)].map((_, i) => <Star key={i} size={10} className="fill-med-terracotta text-med-terracotta" />)}
                                    </div>
                                    {isOfficial && (
                                        <div className="absolute top-6 right-6 bg-med-olive text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 shadow-lg z-20"><Check size={14} strokeWidth={4} /> Official Stay</div>
                                    )}
                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                        <h3 className="font-serif text-3xl leading-none">{hotel.name}</h3>
                                        <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">{hotel.tag}</p>
                                    </div>
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 flex-grow italic">"{hotel.description}"</p>
                                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-serif font-bold text-3xl text-med-blue dark:text-white">${hotel.baseRate}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Avg. Nightly</span>
                                        </div>
                                        
                                        <div className="relative group/tooltip">
                                            <div 
                                                onClick={(e) => handleConfirmHotel(e, hotel)}
                                                className={`p-3 rounded-xl transition-all ${isOfficial ? 'bg-med-olive text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-med-blue group-hover:text-white'}`}
                                            >
                                                {isOfficial ? <Check size={20} strokeWidth={3} /> : <Plus size={20} />}
                                            </div>
                                            
                                            {!isOfficial && (
                                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-med-blue text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10 dark:border-gray-200 translate-y-1 group-hover/tooltip:translate-y-0">
                                                    Add to Plan
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedHotel && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-med-blue/60 dark:bg-gray-950/80 backdrop-blur-md p-4 transition-opacity duration-300" onClick={() => setSelectedHotel(null)}>
                    <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-auto max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300 border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedHotel(null)} className="absolute top-6 right-6 z-30 p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 bg-white/20 backdrop-blur-md"><X size={24} /></button>
                        
                        <div className="h-64 md:h-auto md:w-2/5 relative shrink-0 bg-gray-100">
                            <img src={selectedHotel.gallery?.[activeGalleryIndex] || selectedHotel.image} alt={selectedHotel.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden"></div>
                            <div className="absolute bottom-6 left-6 md:hidden text-white font-serif text-3xl font-bold">{selectedHotel.name}</div>
                            {selectedHotel.gallery && selectedHotel.gallery.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                                    {selectedHotel.gallery.map((_, i) => (
                                        <button key={i} onClick={(e) => { e.stopPropagation(); setActiveGalleryIndex(i); }} className={`w-2 h-2 rounded-full transition-all ${i === activeGalleryIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-white dark:bg-gray-900">
                            <div className="mb-10 hidden md:block">
                                <h2 className="font-serif text-4xl md:text-5xl text-med-blue dark:text-white leading-tight mb-4">{selectedHotel.name}</h2>
                                <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span className="flex items-center gap-1"><Star size={14} className="fill-med-terracotta text-med-terracotta" /> {selectedHotel.stars}-Star</span>
                                    <span>•</span>
                                    <span>{selectedHotel.tag}</span>
                                </div>
                            </div>
                            <div className="space-y-10">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base font-medium italic">"{realTimeDetails?.summary || selectedHotel.fullDescription}"</p>
                                
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-med-blue dark:text-white mb-4">Highlights</h4>
                                    <ul className="space-y-3">
                                        {selectedHotel.highlights?.map((h, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                <Check size={14} className="text-med-olive mt-0.5 shrink-0" strokeWidth={3} /> {h}
                                            </li>
                                        ))}
                                        {selectedHotel.transportDetail && (
                                            <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin size={14} className="text-med-terracotta mt-0.5 shrink-0" /> {selectedHotel.transportDetail}
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <Button 
                                        onClick={(e) => handleConfirmHotel(e, selectedHotel)} 
                                        variant={(user?.officialItinerary?.hotel?.name === selectedHotel.name || isInPlan(`hotel-${selectedHotel.name.replace(/\s+/g, '-').toLowerCase()}`)) ? 'success' : 'primary'}
                                        fullWidth
                                    >
                                        {(user?.officialItinerary?.hotel?.name === selectedHotel.name || isInPlan(`hotel-${selectedHotel.name.replace(/\s+/g, '-').toLowerCase()}`)) ? 'Selected' : 'Add to Bookings'}
                                    </Button>
                                    <a href={selectedHotel.link} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                        <Button variant="secondary" fullWidth>Direct Booking</Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};