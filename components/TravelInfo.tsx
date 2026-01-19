import React, { useState, useRef } from 'react';
import { Plane, Train, MapPin, Check, Plus, Trash2, Clock, Car } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface TravelOption {
  id: string;
  type: 'flight' | 'train';
  title: string;
  subtitle: string;
  description: string;
  cost: number;
  duration?: string;
  image: string;
  badge?: string;
}

const FLIGHT_OPTIONS: TravelOption[] = [
  {
    id: 'flight-cdg',
    type: 'flight',
    title: 'Via Paris (CDG)',
    subtitle: 'The Seamless Route',
    description: 'Fly into Charles de Gaulle (CDG) Terminal 2. The TGV station is located directly beneath the terminal, offering a seamless high-speed rail connection to Montpellier.',
    cost: 950,
    image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=800&auto=format&fit=crop',
    badge: 'Recommended'
  },
  {
    id: 'flight-bcn',
    type: 'flight',
    title: 'Via Barcelona (BCN)',
    subtitle: 'The Scenic Route',
    description: 'Fly into Barcelona, enjoy tapas for lunch, then take the scenic coastal high-speed train north to Montpellier.',
    cost: 850,
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'flight-mpl',
    type: 'flight',
    title: 'Direct Arrival (MPL)',
    subtitle: 'Fastest Access',
    description: 'Connect through a European hub to land directly at Montpellier-Méditerranée. 15 minutes from the city center.',
    cost: 1100,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop'
  }
];

const TRAIN_OPTIONS: TravelOption[] = [
  {
    id: 'train-paris',
    type: 'train',
    title: 'TGV from Paris',
    subtitle: 'High Speed Rail',
    description: 'The TGV Inoui zooms through the French countryside at 200mph. A comfortable, smooth ride directly to Saint-Roch.',
    cost: 120,
    duration: '3h 50m',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb714c223?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'train-bcn',
    type: 'train',
    title: 'AVE from Barcelona',
    subtitle: 'Coastal Journey',
    description: 'The Renfe AVE glides along the Mediterranean coast. Watch the flamingos in the lagoons as you cross the border.',
    cost: 90,
    duration: '3h 05m',
    image: 'https://images.unsplash.com/photo-1535967727042-3a45fb229302?q=80&w=800&auto=format&fit=crop'
  }
];

const TravelCard: React.FC<{ option: TravelOption }> = ({ option }) => {
  const { user, updateOfficialItinerary } = useUser();
  const isSelected = user?.officialItinerary?.transport?.id === option.id;

  const handleSelect = () => {
    if (isSelected) {
        updateOfficialItinerary({ transport: undefined });
    } else {
        updateOfficialItinerary({
            transport: {
                id: option.id,
                type: option.type,
                name: option.title,
                title: option.title,
                image: option.image,
                baseCost: option.cost
            }
        });
    }
  };

  return (
    <div 
      onClick={handleSelect}
      className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 relative flex flex-col h-full cursor-pointer transform ${
        isSelected 
          ? 'border-med-olive ring-1 ring-med-olive' 
          : 'border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 hover:border-med-blue/30'
      }`}
    >
      <div className="h-48 relative overflow-hidden shrink-0">
          <img 
              src={option.image} 
              alt={option.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
          
          {option.badge && (
              <div className="absolute top-3 left-3 bg-med-terracotta text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  {option.badge}
              </div>
          )}

          {isSelected && (
              <div className="absolute top-3 right-3 bg-med-olive text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1 z-20 animate-in zoom-in duration-300">
                  <Check size={10} strokeWidth={4} /> Official Route
              </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                  {option.type === 'flight' && <Plane size={14} className="text-med-lightBlue"/>}
                  {option.type === 'train' && <Train size={14} className="text-med-lightBlue"/>}
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">{option.subtitle}</span>
              </div>
              <h3 className="font-serif text-2xl leading-tight">{option.title}</h3>
          </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
              {option.description}
          </p>

          {option.duration && (
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg w-max">
                  <Clock size={14} /> {option.duration} travel time
              </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex flex-col">
                  <span className={`text-xl font-serif font-bold ${isSelected ? 'text-med-olive' : 'text-med-blue dark:text-white'}`}>
                      ${option.cost.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Unit Est.</span>
              </div>
              
              <button 
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isSelected 
                      ? 'bg-med-olive text-white shadow-md' 
                      : 'bg-white border border-med-blue text-med-blue hover:bg-med-blue hover:text-white'
                  }`}
              >
                  {isSelected ? (
                      <>Deselect <Trash2 size={14}/></>
                  ) : (
                      <>Select Route <Plus size={14}/></>
                  )}
              </button>
          </div>
      </div>
    </div>
  );
};

export const TravelInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flight' | 'train'>('flight');
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'flight', label: 'The Flight', icon: Plane, subtitle: 'International connections' },
    { id: 'train', label: 'The Train', icon: Train, subtitle: 'High-speed rail' }
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024 && tabsRef.current) {
        const offset = 85; 
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = tabsRef.current.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        if (window.scrollY > offsetPosition) {
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
  };

  return (
    <section id="travel" className="py-24 bg-med-sand dark:bg-slate-900 transition-colors duration-300">
      <div className="w-[90%] md:w-[80%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
                <div className="lg:sticky lg:top-28">
                   <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs block mb-3">Logistics</span>
                   <h2 className="font-serif text-4xl text-med-blue dark:text-blue-100 mb-8">The Official Route</h2>
                   <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                     Select your preferred arrival route to finalize your official logistics. Most guests fly into Paris and connect via high-speed rail.
                   </p>

                   <div className="hidden lg:flex flex-col gap-3">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id as 'flight' | 'train')}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border w-full text-left ${
                            activeTab === tab.id
                              ? 'bg-med-blue text-white border-med-blue shadow-lg -translate-y-1'
                              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-med-blue/20'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                            <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-med-terracotta'} />
                          </div>
                          <div>
                            <span className="block font-bold text-xs uppercase tracking-wider mb-1">{tab.label}</span>
                            <span className="text-[10px] opacity-70 leading-tight block">
                                {tab.subtitle}
                            </span>
                          </div>
                        </button>
                      ))}
                   </div>
                </div>
            </div>

            <div className="lg:w-2/3 min-h-[500px]">
               {/* Mobile Fixed Grid Tabs - No Scroll */}
               <div ref={tabsRef} className="lg:hidden sticky top-[72px] z-30 bg-med-sand/95 dark:bg-slate-900/95 backdrop-blur-md -mx-4 px-4 py-3 mb-6 border-b border-med-terracotta/10">
                  <div className="grid grid-cols-2 gap-3">
                    {tabs.map((tab) => (
                        <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as 'flight' | 'train')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 border text-center ${
                            activeTab === tab.id
                            ? 'bg-med-blue text-white border-med-blue shadow-md'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent'
                        }`}
                        >
                        <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : 'text-med-terracotta'} />
                        <span className="block font-bold text-xs uppercase tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                  </div>
               </div>

               {activeTab === 'flight' && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-med-terracotta text-white flex items-center justify-center text-sm font-bold shadow-sm">1</div>
                          <h3 className="font-serif text-2xl text-med-blue dark:text-blue-100">Step 1: Choose Your Flight</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {FLIGHT_OPTIONS.map(opt => <TravelCard key={opt.id} option={opt} />)}
                      </div>
                   </div>
               )}

               {activeTab === 'train' && (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-med-terracotta text-white flex items-center justify-center text-sm font-bold shadow-sm">2</div>
                          <h3 className="font-serif text-2xl text-med-blue dark:text-blue-100">Step 2: Choose Your Train</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {TRAIN_OPTIONS.map(opt => <TravelCard key={opt.id} option={opt} />)}
                      </div>
                   </div>
               )}
            </div>
        </div>
      </div>
    </section>
  );
};