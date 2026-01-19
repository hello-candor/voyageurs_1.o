
import React, { useState } from 'react';
import { Plane, Train, MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LocationData {
  id: string;
  icon: React.ElementType;
  name: string;
  detail: string;
  color: string;
  bg: string;
  lat: number;
  lng: number;
}

const LOCATIONS: LocationData[] = [
  {
    id: 'mpl',
    icon: Plane,
    name: "Montpellier–Méditerranée (MPL)",
    detail: "15 min drive to center",
    color: "text-med-terracotta",
    bg: "bg-med-terracotta/10 dark:bg-med-terracotta/20",
    lat: 43.5763,
    lng: 3.9631
  },
  {
    id: 'st-roch',
    icon: Train,
    name: "Gare Saint-Roch",
    detail: "City Center (TGV/TER)",
    color: "text-med-blue dark:text-blue-300",
    bg: "bg-med-blue/10 dark:bg-blue-500/20",
    lat: 43.6046,
    lng: 3.8806
  },
  {
    id: 'sud-de-france',
    icon: Train,
    name: "Gare Sud de France",
    detail: "Outskirts (High-speed TGV)",
    color: "text-med-olive dark:text-green-400",
    bg: "bg-med-olive/10 dark:bg-green-500/20",
    lat: 43.5937,
    lng: 3.9288
  },
  {
    id: 'comedie',
    icon: MapPin,
    name: "Place de la Comédie",
    detail: "Main Meeting Point",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-500/20",
    lat: 43.6085,
    lng: 3.8795
  }
];

export const LocationMap: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const focusLocation = (id: string, lat: number, lng: number) => {
    setActiveId(id);
    // Open in new tab since we can't embed the map reliably without a valid key for Maps JS API
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <div className="pb-32 pt-12 relative z-10 overflow-hidden w-full transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-med-blue/5 dark:bg-blue-500/5 rounded-full blur-3xl -ml-32 pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-med-terracotta/5 dark:bg-orange-500/5 rounded-full blur-3xl -mr-32 pointer-events-none"></div>

      <div className="w-[90%] md:w-[85%] lg:w-[80%] mx-auto relative z-20">
        
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            
            {/* Main Map Container */}
            <div className="lg:w-3/4 relative group">
                {/* 'Map' Label Badge */}
                <div className="absolute -top-6 left-8 bg-white dark:bg-gray-800 px-6 py-2 rounded-t-xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] border-t border-x border-gray-100 dark:border-gray-700 flex items-center gap-2 z-10 transition-colors duration-300">
                    <Navigation size={16} className="text-med-terracotta" />
                    <span className="font-serif font-bold text-med-blue dark:text-blue-100 tracking-wide">Orientation</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-[2rem] rounded-tl-none shadow-2xl shadow-med-blue/15 dark:shadow-black/30 border border-med-terracotta/20 dark:border-gray-700 h-full min-h-[400px] lg:min-h-[500px] transition-all duration-500 hover:shadow-med-blue/20 dark:hover:shadow-black/50">
                    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {/* Static Map Image Fallback */}
                        <div 
                            className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Montpellier_OpenStreetMap.png/1200px-Montpellier_OpenStreetMap.png')] bg-cover bg-center filter grayscale-[0%] contrast-[1] dark:grayscale-[20%] dark:invert-[.05] dark:brightness-[0.9] transition-all duration-1000"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-black/20 pointer-events-none">
                            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center gap-2 max-w-xs text-center border border-white/50 dark:border-gray-700">
                                <span className="font-serif font-bold text-med-blue dark:text-white text-lg">Interactive Map</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Select a location from the list to view it on Google Maps.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Legend */}
            <div className="lg:w-1/4">
                <div className="lg:sticky lg:top-28 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg shadow-med-blue/5 dark:shadow-black/20 border border-white/60 dark:border-gray-700 backdrop-blur-sm transition-colors duration-300">
                    <h3 className="font-serif text-xl text-med-blue dark:text-blue-100 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Key Locations</h3>
                    
                    <div className="space-y-4">
                        {LOCATIONS.map((loc) => (
                            <button 
                                key={loc.id} 
                                onClick={() => focusLocation(loc.id, loc.lat, loc.lng)}
                                className={`w-full flex items-start gap-4 p-2 rounded-xl text-left transition-all duration-300 border-2 ${
                                    activeId === loc.id 
                                    ? 'bg-white dark:bg-gray-700 border-med-terracotta shadow-md transform -translate-x-1' 
                                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                            >
                                <div className={`p-3 rounded-xl shrink-0 transition-colors duration-300 ${loc.bg} ${activeId === loc.id ? 'bg-med-blue text-white' : ''}`}>
                                    <loc.icon size={20} className={`${activeId === loc.id ? 'text-white' : loc.color} transition-colors duration-300`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm leading-tight mb-1 group-hover:text-med-blue dark:group-hover:text-blue-300 transition-colors">{loc.name}</h4>
                                        <ExternalLink size={10} className="text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">{loc.detail}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic font-sans leading-relaxed text-center">
                            "Montpellier is a 15-minute city. Everything you need is often just a short walk or tram ride away."
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
