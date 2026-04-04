import React, { useState, useEffect } from 'react';
import { Wine, MapPin, Star, ArrowRight, Loader2, Compass, X, Image as ImageIcon, Check, Map as MapIcon, Info, Plus, Trash2, Ticket } from 'lucide-react';
import { getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { useTripPlanner } from '../context/TripPlannerContext';

interface Vineyard {
  id: string;
  name: string;
  description: string;
  image: string;
  distance: string;
  fullDescription: string;
  highlights: string[];
  bestFor: string;
  transportDetail: string;
  // New wine specific details
  signatureWine?: string;
  varietals?: string[];
  tastingNotes?: string;
}

export const VINEYARD_DATA: Vineyard[] = [
  {
    id: 'flaugergues',
    name: "Château de Flaugergues",
    description: "A magnificent 'Folie Montpelliéraine' located right within the city limits. Historic architecture meets exceptional wine.",
    image: "https://images.unsplash.com/photo-1572418343759-4f7f631df671?q=80&w=800&auto=format&fit=crop", 
    distance: "15 min tram/taxi",
    fullDescription: "An architectural gem and a working vineyard located uniquely within  itself. Flaugergues is one of the 'Folies'—grand summer houses built by wealthy merchants in the 18th century. It has been in the same family (Colbert) for generations. The gardens are classified as 'Remarkable', and the wines are a sophisticated expression of the Grés de  terroir.",
    highlights: ["18th-Century Architecture", "Classified French Gardens", "Within City Limits", "Excellent Restaurant (Folgues)"],
    bestFor: "History lovers & Lunch",
    transportDetail: "Accessible via Tram Line 1 (stop 'Place de France') then a short walk, or a 15-min Uber from the center.",
    signatureWine: "Cuvée Sommelière (Red)",
    varietals: ["Grenache", "Syrah", "Mourvèdre"],
    tastingNotes: "Elegant and structured with notes of ripe red fruits, garrigue spices, and a silky finish."
  },
  {
    id: 'hortus',
    name: "Domaine de l'Hortus",
    description: "The legend of the Pic Saint-Loup. Nestled between two cliffs, producing some of the region's most celebrated reds.",
    image: "https://images.unsplash.com/photo-1560342939-2c0c98ec8905?q=80&w=800&auto=format&fit=crop",
    distance: "35 min drive",
    fullDescription: "Located in the valley between the Pic Saint-Loup and the Hortus cliff, this estate is iconic. The Orliac family transformed wild scrubland into one of the Languedoc's most prestigious wineries. The dramatic scenery is matched only by the quality of their 'Grande Cuvée'—a complex, brooding Syrah-Mourvèdre blend.",
    highlights: ["Dramatic Cliffside Scenery", "Iconic Pic Saint-Loup Wines", "Family Owned", "hiking trails nearby"],
    bestFor: "Red Wine Aficionados & Scenery",
    transportDetail: "Car is essential. It is a beautiful drive north through the garrigue scrubland.",
    signatureWine: "Grande Cuvée Rouge",
    varietals: ["Syrah (Dominant)", "Mourvèdre", "Grenache"],
    tastingNotes: "Deep, complex nose of black fruits, liquorice, and roasted notes. Powerful yet velvety on the palate."
  },
  {
    id: 'daumas-gassac',
    name: "Mas de Daumas Gassac",
    description: "Often called the 'Lafite of the Languedoc'. A cult winery in the Gassac valley known for its unique terroir and aging potential.",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop",
    distance: "40 min drive",
    fullDescription: "In the 1970s, professors discovered that the soil here was identical to the best terroir in Burgundy. The Guibert family planted non-standard varieties (Cabernet Sauvignon in a land of Carignan) and created a 'Vin de Pays' that beat the First Growths of Bordeaux in blind tastings. It is a mythical place for wine geeks.",
    highlights: ["Cult Status Wines", "Unique Micro-climate", "Historical Cellar Tours", "River Valley Setting"],
    bestFor: "Wine Collectors & Geeks",
    transportDetail: "Car required. Located near the village of Aniane, close to Saint-Guilhem-le-Désert.",
    signatureWine: "Mas de Daumas Gassac Rouge",
    varietals: ["Cabernet Sauvignon (70%)", "Merlot", "Petit Verdot", "Rare Local Grapes"],
    tastingNotes: "A Bordeaux-style structure with Mediterranean warmth. Incredible aging potential, offering notes of cassis, leather, and truffle."
  },
  {
    id: 'puech-haut',
    name: "Château Puech-Haut",
    description: "Luxury, art, and the region's most famous premium Rosé. A grand estate that hosts the world's largest gigantic barrel collection.",
    image: "https://images.unsplash.com/photo-1594132865922-38e555776d75?q=80&w=800&auto=format&fit=crop",
    distance: "25 min drive",
    fullDescription: "Puech-Haut is the heavyweight champion of modern Languedoc luxury. The estate is immaculate, famous for its 'Bib'Art' (painted barrels by famous artists) and its omnipresent premium Rosé, Argali. The vibe is Provençal chic meets Languedoc generosity.",
    highlights: ["Painted Barrel Collection", "Premium Rosé", "Olive Oil Production", "Luxurious Grounds"],
    bestFor: "Rosé Lovers & Art Fans",
    transportDetail: "Car required. Located east of .",
    signatureWine: "Argali Rosé",
    varietals: ["Grenache", "Cinsault"],
    tastingNotes: "Pale, refreshing, and crisp. Aromas of citrus, white peach, and exotic fruits. Served in their iconic glass-stopper bottle."
  }
];

export const Vineyards: React.FC = () => {
  const [selectedVineyard, setSelectedVineyard] = useState<Vineyard | null>(null);
  const [realTimeDetails, setRealTimeDetails] = useState<PlaceDetails | null>(null);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const { addToPlan, removeFromPlan, isInPlan, items, travelers } = useTripPlanner();

  useEffect(() => {
    if (selectedVineyard) {
      document.body.style.overflow = 'hidden';
      setShowMap(false);
      const fetchData = async () => {
        setLoadingRealTime(true);
        setRealTimeDetails(null);
        const details = await getPlaceDetails(selectedVineyard.name, "Hérault, France");
        setRealTimeDetails(details);
        setLoadingRealTime(false);
      };
      fetchData();
    } else {
      document.body.style.overflow = 'unset';
      setRealTimeDetails(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedVineyard]);

  const handlePlanToggle = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!selectedVineyard) return;
      if (isInPlan(selectedVineyard.id)) {
          removeFromPlan(selectedVineyard.id);
      } else {
          // Estimate $30 per person for tasting/tour
          addToPlan({
              id: selectedVineyard.id,
              category: 'vineyard',
              name: selectedVineyard.name,
              baseCost: 30,
              cost: 30 * travelers,
              pricingType: 'perPerson',
              details: 'Tasting & Tour ($30/pp)'
          });
      }
  };

  const isAdded = selectedVineyard ? isInPlan(selectedVineyard.id) : false;
  const isBooked = selectedVineyard ? items.find(i => i.id === selectedVineyard.id)?.bookingStatus === 'booked' : false;
  const estimatedCost = 30 * travelers;

  return (
    <section id="vineyards" className="py-24 bg-med-sand dark:bg-slate-900 transition-colors duration-300">
      <div className="w-[90%] md:w-[80%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Context (Sticky) */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-28">
                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Terroir</span>
                <h2 className="font-serif text-4xl text-med-blue dark:text-blue-100 mb-8">The Languedoc Renaissance</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                   Once known for bulk table wine, the region surrounding  is now the most exciting wine frontier in France, offering complex Syrahs and mineral-rich whites.
                </p>
            </div>
          </div>

          {/* Right Column: Grid */}
          <div className="lg:w-2/3 space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {VINEYARD_DATA.map((vineyard, idx) => {
                    const isCardAdded = isInPlan(vineyard.id);
                    const planItem = items.find(i => i.id === vineyard.id);
                    const isCardBooked = planItem?.bookingStatus === 'booked';
                    const cardCost = 30 * travelers;

                    return (
                        <div 
                            key={idx}
                            onClick={() => setSelectedVineyard(vineyard)}
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
                                    src={vineyard.image} 
                                    alt={vineyard.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                
                                {/* Top Left Badge */}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur text-xs font-bold text-med-blue dark:text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border border-white/20">
                                    <MapPin size={12} className="text-med-terracotta"/>
                                    {vineyard.distance}
                                </div>
                                
                                {/* Status Badge */}
                                {isCardAdded && (
                                    <div className={`absolute top-4 right-4 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1 z-20 ${
                                        isCardBooked ? 'bg-emerald-600' : 'bg-med-blue'
                                    }`}>
                                        {isCardBooked ? <Ticket size={10} strokeWidth={3} /> : <Check size={10} strokeWidth={3} />}
                                        {isCardBooked ? 'Booked' : 'Planned'}
                                    </div>
                                )}

                                {/* Bottom Title Area */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-white font-serif text-2xl leading-tight line-clamp-2">{vineyard.name}</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-grow">
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                                    {vineyard.description}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className={`text-xl font-serif font-bold ${isCardBooked ? 'text-emerald-600' : isCardAdded ? 'text-med-blue' : 'text-med-blue dark:text-white'}`}>
                                            ${cardCost.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Tour</span>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isCardAdded) removeFromPlan(vineyard.id);
                                            else addToPlan({
                                                id: vineyard.id,
                                                category: 'vineyard',
                                                name: vineyard.name,
                                                baseCost: 30,
                                                cost: cardCost,
                                                pricingType: 'perPerson',
                                                details: 'Tasting & Tour'
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                                            isCardBooked
                                            ? 'bg-emerald-600 text-white shadow-md cursor-default'
                                            : isCardAdded 
                                                ? 'bg-med-blue text-white shadow-md' 
                                                : 'bg-white border border-med-blue text-med-blue hover:bg-med-blue hover:text-white shadow-sm'
                                        }`}
                                        disabled={isCardBooked}
                                    >
                                        {isCardBooked ? (
                                            <>Confirmed <Check size={14}/></>
                                        ) : isCardAdded ? (
                                            <>Remove <Trash2 size={14}/></>
                                        ) : (
                                            <>Add <Plus size={14}/></>
                                        )}
                                    </button>
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
      {selectedVineyard && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-med-blue/60 dark:bg-gray-950/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSelectedVineyard(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-[95%] h-[90%] max-w-4xl overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-300 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVineyard(null)}
              className="absolute top-6 right-6 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-md"
            >
              <X size={24} />
            </button>

            {/* Image/Map Side */}
            <div className="h-56 md:h-auto md:w-2/5 relative bg-gray-100 dark:bg-gray-800 group">
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
                        : encodeURIComponent(realTimeDetails?.address || selectedVineyard.name + ", Hérault France")
                    }&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full grayscale-[20%] contrast-[1.1] dark:invert-[.9] dark:grayscale-[.5] transition-all duration-500"
                    title="Vineyard Map"
                 ></iframe>
              ) : (
                  <>
                    <img 
                        src={realTimeDetails?.imageUrl || selectedVineyard.image} 
                        alt={selectedVineyard.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = selectedVineyard.image; }}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                     <div className="absolute bottom-4 left-4 md:hidden text-white">
                        <h2 className="font-serif text-3xl font-bold">{selectedVineyard.name}</h2>
                    </div>
                  </>
              )}
              
              {/* Toggle Button */}
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMap(!showMap);
                }}
                className="absolute bottom-4 right-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-med-blue dark:text-white shadow-lg border border-white/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                 {showMap ? (
                    <>
                        <ImageIcon size={14} /> View Photo
                    </>
                 ) : (
                    <>
                        <MapIcon size={14} /> View Map
                    </>
                 )}
              </button>
            </div>

            {/* Content Side */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-white dark:bg-gray-900">
              <div className="hidden md:block mb-8">
                 <h2 className="font-serif text-4xl text-med-blue dark:text-blue-100 mb-2">{selectedVineyard.name}</h2>
                 <div className="h-1 w-20 bg-med-terracotta rounded-full"></div>
              </div>

              {loadingRealTime && (
                  <div className="flex items-center gap-2 text-sm text-med-terracotta animate-pulse mb-6 bg-med-terracotta/5 p-2 rounded-lg w-max">
                      <Loader2 size={14} className="animate-spin"/> Checking vintage year...
                  </div>
              )}

              <div className="space-y-8">
                <div>
                   <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans text-sm md:text-base">
                     {realTimeDetails?.summary ? (
                         <span>{realTimeDetails.summary} <span className="text-xs text-med-terracotta font-bold ml-1 opacity-75">(Live Update)</span></span>
                     ) : (
                         selectedVineyard.fullDescription
                     )}
                   </p>
                </div>

                {/* Wine Profile Section */}
                {(selectedVineyard.signatureWine || selectedVineyard.varietals) && (
                    <div className="bg-med-blue/5 dark:bg-blue-900/20 p-5 rounded-xl border border-med-blue/10 dark:border-blue-800">
                        <h4 className="font-bold text-med-blue dark:text-blue-100 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Wine size={14} /> Wine Profile</h4>
                        <div className="space-y-3">
                            {selectedVineyard.signatureWine && (
                                <div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Signature Bottle</span>
                                    <span className="font-serif text-lg text-med-terracotta">{selectedVineyard.signatureWine}</span>
                                </div>
                            )}
                            {selectedVineyard.varietals && (
                                 <div>
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Key Varietals</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVineyard.varietals.map(v => (
                                            <span key={v} className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700">{v}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {selectedVineyard.tastingNotes && (
                                <div>
                                     <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Tasting Notes</span>
                                     <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{selectedVineyard.tastingNotes}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedVineyard.highlights && (
                  <div>
                    <h4 className="font-bold text-med-blue dark:text-blue-200 text-xs uppercase tracking-widest mb-3">Estate Highlights</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedVineyard.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-med-terracotta mt-1.5 shrink-0"></div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-8">
                    <div className="flex flex-col">
                        <span className={`text-2xl font-serif font-bold ${isBooked ? 'text-emerald-600' : isAdded ? 'text-med-blue' : 'text-med-terracotta'}`}>${estimatedCost.toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Est. Tour ({travelers} guests)</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto ml-auto">
                            <button 
                            onClick={handlePlanToggle}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all border ${
                                isBooked
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md cursor-default'
                                : isAdded 
                                    ? 'bg-med-blue text-white border-med-blue shadow-md' 
                                    : 'bg-white border-med-blue text-med-blue hover:bg-blue-50'
                            }`}
                            disabled={isBooked}
                        >
                            {isBooked ? (
                                <><Ticket size={14} strokeWidth={3}/> Confirmed</>
                            ) : isAdded ? (
                                <><Check size={14} strokeWidth={3}/> Selected</> 
                            ) : (
                                <>Add to Plan <Plus size={14}/></>
                            )}
                        </button>
                        <button 
                            className="flex-1 sm:flex-initial bg-med-terracotta text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#c56143] transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            Book Tour <ArrowRight size={14} />
                        </button>
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