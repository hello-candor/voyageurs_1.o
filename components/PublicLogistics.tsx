
import React from 'react';
import { Plane, Hotel, MapPin, ArrowRight, Star } from 'lucide-react';
import { DEFAULT_HOTEL_DATA } from '../data/defaults';
import { useUser } from '../context/UserContext';

export const PublicLogistics: React.FC = () => {
  const { toggleProfile, setAuthMode } = useUser();

  const handleJoin = () => {
      setAuthMode('rsvp');
      toggleProfile();
  };

  const featuredHotels = DEFAULT_HOTEL_DATA.flatMap(c => c.hotels).slice(0, 2);

  return (
    <section id="logistics" className="py-24 bg-[#FDFBF7] dark:bg-slate-900 transition-colors duration-300">
      <div className="w-[90%] md:w-[85%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Context */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-28">
                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Logistics</span>
                <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                    The<br />
                    <span className="italic text-med-terracotta">Journey</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium mb-8">
                    "Montpellier is the gateway to the French South. We have curated specific travel hubs and official accommodations to ensure your arrival is seamless."
                </p>
                <div className="hidden lg:block">
                    <button 
                        onClick={handleJoin}
                        className="group flex items-center gap-3 px-6 py-3 bg-med-blue text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-med-terracotta transition-all"
                    >
                        <span>Access Planner</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:w-2/3 space-y-16">
             
             {/* 1. Transport Hubs */}
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="font-serif text-2xl text-med-blue dark:text-white mb-6 flex items-center gap-3">
                    <Plane size={24} className="text-med-terracotta" /> Arrival Gateways
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                        <div className="mb-4 text-med-blue dark:text-blue-300"><Plane size={24} /></div>
                        <h4 className="font-serif text-lg text-med-blue dark:text-white mb-1">Paris (CDG)</h4>
                        <p className="text-[10px] uppercase tracking-widest text-med-terracotta font-bold mb-3">The Primary Hub</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Fly to CDG, then take the direct high-speed TGV from the airport station (3h 50m) to Montpellier St-Roch.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                        <div className="mb-4 text-med-blue dark:text-blue-300"><Plane size={24} /></div>
                        <h4 className="font-serif text-lg text-med-blue dark:text-white mb-1">Barcelona (BCN)</h4>
                        <p className="text-[10px] uppercase tracking-widest text-med-terracotta font-bold mb-3">The Scenic Route</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Fly to BCN, enjoy tapas, then take the coastal AVE train (3h) north across the border.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                        <div className="mb-4 text-med-blue dark:text-blue-300"><Plane size={24} /></div>
                        <h4 className="font-serif text-lg text-med-blue dark:text-white mb-1">Direct (MPL)</h4>
                        <p className="text-[10px] uppercase tracking-widest text-med-terracotta font-bold mb-3">Fastest</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Connect via London, Amsterdam or Paris Orly to land directly at Montpellier-Méditerranée.
                        </p>
                    </div>
                </div>
             </div>

             {/* 2. Official Hotels */}
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <h3 className="font-serif text-2xl text-med-blue dark:text-white mb-6 flex items-center gap-3">
                    <Hotel size={24} className="text-med-terracotta" /> Official Residence
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    {featuredHotels.map((hotel, idx) => (
                        <div key={idx} className="group relative bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="md:w-2/5 relative h-48 md:h-auto overflow-hidden">
                                    <img 
                                        src={hotel.image} 
                                        alt={hotel.name} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-med-blue dark:text-white shadow-sm flex items-center gap-1">
                                        <Star size={10} className="fill-med-terracotta text-med-terracotta" /> {hotel.stars} Stars
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-center">
                                    <h4 className="font-serif text-2xl text-med-blue dark:text-white mb-2">{hotel.name}</h4>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        <MapPin size={12} className="text-med-terracotta" /> {hotel.tag}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                                        {hotel.description}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                                        <div className="flex flex-col">
                                            <span className="font-serif font-bold text-xl text-med-blue dark:text-white">${hotel.baseRate}</span>
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Avg. Night</span>
                                        </div>
                                        <button onClick={handleJoin} className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta hover:text-med-blue transition-colors flex items-center gap-2">
                                            Reserve in App <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

          </div>
        </div>
      </div>
    </section>
  );
};
