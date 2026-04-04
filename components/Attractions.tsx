import React, { useState, useEffect } from 'react';
import { DayTrip } from '../types';
import { X, MapPin, Star, Train, Compass, Map as MapIcon, Car, Image as ImageIcon, ExternalLink, Ticket } from 'lucide-react';
import { getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { useTripPlanner } from '../context/TripPlannerContext';
import { Button } from './Button';

interface AttractionsProps {
  trips: DayTrip[];
}

export const Attractions: React.FC<AttractionsProps> = ({ trips }) => {
  const [selectedTrip, setSelectedTrip] = useState<DayTrip | null>(null);
  const [realTimeDetails, setRealTimeDetails] = useState<PlaceDetails | null>(null);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { addToPlan, removeFromPlan, isInPlan, items, travelers } = useTripPlanner();

  useEffect(() => {
    if (selectedTrip) {
      document.body.style.overflow = 'hidden';
      setShowMap(false);
      const fetchData = async () => {
        setLoadingRealTime(true);
        setRealTimeDetails(null);
        const context = selectedTrip.id === 'sete' ? 'Sète, France' : 'Occitanie, France';
        const details = await getPlaceDetails(selectedTrip.name, context);
        setRealTimeDetails(details);
        setLoadingRealTime(false);
      };
      fetchData();
    } else {
      document.body.style.overflow = 'unset';
      setRealTimeDetails(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedTrip]);

  const handlePlanToggle = () => {
      if (!selectedTrip) return;
      if (isInPlan(selectedTrip.id)) {
          removeFromPlan(selectedTrip.id);
      } else {
          addToPlan({
              id: selectedTrip.id,
              category: 'activity',
              name: selectedTrip.name,
              baseCost: 20,
              cost: 20 * travelers,
              pricingType: 'perPerson',
              details: 'Transport & Entry Estimate',
              image: selectedTrip.image
          });
      }
  };

  const isAdded = selectedTrip ? isInPlan(selectedTrip.id) : false;
  const isBooked = selectedTrip ? items.find(i => i.id === selectedTrip.id)?.bookingStatus === 'booked' : false;
  const estimatedCost = 20 * travelers;

  return (
    <section id="daytrips" className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="w-[90%] md:w-[80%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Context (Sticky) */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-28">
                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Exploration</span>
                <h2 className="font-serif text-4xl text-med-blue dark:text-blue-100 mb-8">Beyond the City</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    is the gateway to Occitanie. Within an hour, you can be in a Roman arena, a wild marshland, or a medieval mountain village.
                </p>
            </div>
          </div>

          {/* Right Column: Grid */}
          <div className="lg:w-2/3 space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {trips.map((trip, idx) => {
                    const isCardAdded = isInPlan(trip.id);
                    const planItem = items.find(i => i.id === trip.id);
                    const isCardBooked = planItem?.bookingStatus === 'booked';
                    const cardCost = 20 * travelers;

                    return (
                        <div 
                            key={idx}
                            onClick={() => setSelectedTrip(trip)}
                            className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 group flex flex-col h-full cursor-pointer relative ${
                                isCardBooked 
                                ? 'border-emerald-600 ring-2 ring-emerald-600' 
                                : isCardAdded 
                                    ? 'border-med-blue ring-2 ring-med-blue' 
                                    : 'border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1'
                            }`}
                        >
                            <div className="h-64 relative overflow-hidden shrink-0">
                                <img 
                                    src={trip.image} 
                                    alt={trip.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                
                                {/* Status Badge */}
                                {isCardAdded && (
                                    <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1 z-20 ${
                                        isCardBooked ? 'bg-emerald-600' : 'bg-med-blue'
                                    }`}>
                                        {isCardBooked ? 'Booked' : 'Planned'}
                                    </div>
                                )}

                                {/* Top Left Badge */}
                                {!isCardAdded && (
                                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur text-xs font-bold text-med-blue dark:text-white px-3 py-1.5 rounded-lg shadow-sm border border-white/20">
                                        {trip.distance}
                                    </div>
                                )}

                                {/* Bottom Title Area */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-serif text-2xl leading-tight line-clamp-2">{trip.name}</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {trip.description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className={`text-xl font-serif font-bold ${isCardBooked ? 'text-emerald-600' : isCardAdded ? 'text-med-blue' : 'text-med-blue dark:text-white'}`}>
                                            ${cardCost.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Cost</span>
                                    </div>
                                    
                                    <Button 
                                        variant={isCardBooked ? 'success' : isCardAdded ? 'primary' : 'secondary'}
                                        size="sm"
                                        disabled={isCardBooked}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isCardAdded) removeFromPlan(trip.id);
                                            else addToPlan({
                                                id: trip.id,
                                                category: 'activity',
                                                name: trip.name,
                                                baseCost: 20,
                                                cost: cardCost,
                                                pricingType: 'perPerson',
                                                details: 'Transport & Entry Estimate',
                                                image: trip.image
                                            });
                                        }}
                                    >
                                        {isCardBooked ? 'Confirmed' : isCardAdded ? 'Remove' : 'Add'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTrip && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-med-blue/60 dark:bg-gray-950/80 backdrop-blur-md p-4 transition-opacity duration-300"
          onClick={() => setSelectedTrip(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-300 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedTrip(null)}
              className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-md"
            >
              <X size={24} />
            </button>

            {/* Image Side with Map Toggle */}
            <div className="h-56 md:h-auto md:w-2/5 relative bg-gray-100 dark:bg-gray-800">
              {showMap ? (
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://maps.google.com/maps?q=${
                    realTimeDetails?.location 
                      ? `${realTimeDetails.location.lat},${realTimeDetails.location.lng}`
                      : encodeURIComponent(realTimeDetails?.address || selectedTrip.name + ", France")
                  }&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full grayscale-[20%] contrast-[1.1] dark:invert-[.9] dark:grayscale-[.5] transition-all duration-500"
                  title="Attraction Map"
                ></iframe>
              ) : (
                <>
                  <img 
                    src={realTimeDetails?.imageUrl || selectedTrip.image} 
                    alt={selectedTrip.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = selectedTrip.image; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                  <div className="absolute bottom-4 left-4 md:hidden text-white">
                    <h2 className="font-serif text-3xl font-bold">{selectedTrip.name}</h2>
                  </div>
                </>
              )}
              
              {/* Toggle Map/Image Button */}
              {!loadingRealTime && (
                <div className="absolute bottom-4 right-4 z-20">
                    <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMap(!showMap);
                        }}
                    >
                        {showMap ? 'View Photo' : 'View Map'}
                    </Button>
                </div>
              )}
            </div>

            {/* Content Side */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="hidden md:block mb-8">
                 <h2 className="font-serif text-4xl text-med-blue dark:text-blue-100 mb-2">{selectedTrip.name}</h2>
                 <div className="h-1 w-20 bg-med-terracotta rounded-full"></div>
              </div>

              {loadingRealTime && (
                  <div className="flex items-center gap-2 text-sm text-med-terracotta animate-pulse mb-6 bg-med-terracotta/5 p-2 rounded-lg w-max">
                      Connecting...
                  </div>
              )}

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="bg-med-sand dark:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-med-blue dark:text-blue-200 text-xs font-bold uppercase tracking-wider border border-med-blue/10 dark:border-gray-700">
                   <MapPin size={14} />
                   {selectedTrip.distance}
                </div>
                {selectedTrip.bestFor && (
                  <div className="bg-med-olive/10 dark:bg-med-olive/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-med-olive dark:text-green-300 text-xs font-bold uppercase tracking-wider border border-med-olive/20">
                     <Star size={14} />
                     {selectedTrip.bestFor}
                  </div>
                )}
                {realTimeDetails?.rating && (
                     <div className="bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-green-800 text-xs font-bold uppercase tracking-wider border border-green-200">
                        <Star size={14} fill="currentColor"/>
                        {realTimeDetails.rating} / 5
                    </div>
                )}
              </div>

              <div className="space-y-8">
                <div>
                   <h4 className="font-bold text-med-blue dark:text-blue-200 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Compass size={14} /> Overview
                   </h4>
                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans text-sm md:text-base">
                     {realTimeDetails?.summary ? (
                         <span>{realTimeDetails.summary} <span className="text-xs text-med-terracotta font-bold ml-1 opacity-75">(Live Update)</span></span>
                     ) : (
                         selectedTrip.fullDescription || selectedTrip.description
                     )}
                   </p>
                </div>

                {realTimeDetails?.sources && realTimeDetails.sources.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-med-blue dark:text-blue-200 text-[10px] uppercase tracking-widest mb-2">Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {realTimeDetails.sources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2 py-1 rounded text-[10px] text-med-blue dark:text-blue-300 hover:text-med-terracotta transition-colors flex items-center gap-1 shadow-sm">
                          <ExternalLink size={10} /> {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTrip.highlights && (
                  <div>
                    <h4 className="font-bold text-med-blue dark:text-blue-200 text-xs uppercase tracking-widest mb-3">Key Highlights</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTrip.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-med-terracotta mt-1.5 shrink-0"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedTrip.transportDetail && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h4 className="font-bold text-med-blue dark:text-blue-200 text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                      {selectedTrip.id === 'camargue' || selectedTrip.id === 'st-guilhem' ? <Car size={14} /> : <Train size={14} />} Getting There
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {selectedTrip.transportDetail}
                    </p>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-8">
                    <div className="flex flex-col">
                        <span className={`text-2xl font-serif font-bold ${isBooked ? 'text-emerald-600' : isAdded ? 'text-med-blue' : 'text-med-terracotta'}`}>${estimatedCost.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Cost</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto ml-auto">
                        <Button
                            variant={isBooked ? 'success' : isAdded ? 'primary' : 'secondary'}
                            onClick={handlePlanToggle}
                            disabled={isBooked}
                            fullWidth
                        >
                            {isBooked ? 'Confirmed' : isAdded ? 'Selected' : 'Add to Plan'}
                        </Button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};