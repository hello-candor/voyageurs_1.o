import React, { useState, useRef } from 'react';
import { Calendar, GlassWater, Sun, Star, Clock, MapPin, Wine, Heart, MessageCircle, Quote } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';

// Helper to map string icon names to Lucide components
const ICON_MAP: Record<string, any> = {
    Calendar, GlassWater, Sun, Star, Clock, MapPin, Wine, Heart, MessageCircle
};

export const TheCelebration: React.FC = () => {
  const [mainTab, setMainTab] = useState<string>('reason');
  const tabsRef = useRef<HTMLDivElement>(null);
  const { config } = useAppConfig();
  
  const content = config.content.celebration;
  const events = config.content.agenda.filter(e => e.isOfficial);

  const handleMainTabChange = (tabId: string) => {
    setMainTab(tabId);
    if (window.innerWidth < 1024 && tabsRef.current) {
        const offset = 90; 
        const elementPosition = tabsRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const activeTabContent = content.tabs.find(t => t.id === mainTab);

  return (
    <section id="celebration" className="py-16 md:py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="w-[92%] md:w-[85%] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-28">
                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs block mb-3">{content.subtitle}</span>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-med-blue dark:text-white mb-4 lg:mb-6 leading-none">
                    {content.title.split(' ').slice(0, 2).join(' ')}<br />
                    <span className="italic text-med-terracotta">{content.title.split(' ').slice(2).join(' ')}</span>
                </h2>
                <div className="relative pl-6 border-l-4 border-med-terracotta/30 py-1 mb-6 lg:mb-8">
                    <p className="font-serif text-lg md:text-xl text-med-blue dark:text-blue-100 leading-relaxed italic">
                        "{content.quote}"
                    </p>
                </div>

                <div className="hidden lg:flex flex-col gap-3">
                    {content.tabs.map((tab) => {
                        const Icon = ICON_MAP[tab.iconName] || Heart;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleMainTabChange(tab.id)}
                                className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border w-full text-left ${
                                    mainTab === tab.id
                                    ? 'bg-med-blue text-white border-med-blue shadow-lg -translate-y-1'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-med-blue/20'
                                }`}
                            >
                                <div className={`p-3 rounded-xl shrink-0 ${mainTab === tab.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                    <Icon size={20} className={mainTab === tab.id ? 'text-white' : 'text-med-terracotta'} />
                                </div>
                                <div>
                                    <span className="block font-bold text-xs uppercase tracking-wider mb-1">{tab.label}</span>
                                    <span className="text-[10px] opacity-70 leading-tight block">{tab.subtitle}</span>
                                </div>
                            </button>
                        );
                    })}
                    {/* Hardcoded Festivities Tab Link */}
                    <button
                        onClick={() => handleMainTabChange('festivities')}
                        className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border w-full text-left ${
                            mainTab === 'festivities'
                            ? 'bg-med-blue text-white border-med-blue shadow-lg -translate-y-1'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-med-blue/20'
                        }`}
                    >
                        <div className={`p-3 rounded-xl shrink-0 ${mainTab === 'festivities' ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                            <Calendar size={20} className={mainTab === 'festivities' ? 'text-white' : 'text-med-terracotta'} />
                        </div>
                        <div>
                            <span className="block font-bold text-xs uppercase tracking-wider mb-1">The Plan</span>
                            <span className="text-[10px] opacity-70 leading-tight block">Calendar</span>
                        </div>
                    </button>
                </div>
            </div>
          </div>

          <div className="lg:w-2/3">
             {/* Mobile Fixed Tabs - Scrollable Pills */}
             <div ref={tabsRef} className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md -mx-[4%] px-[4%] py-3 mb-8 border-b border-med-terracotta/10 transition-all duration-300">
                <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide snap-x">
                    {content.tabs.map((tab) => {
                        const Icon = ICON_MAP[tab.iconName] || Heart;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleMainTabChange(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 border whitespace-nowrap snap-center ${
                                    mainTab === tab.id
                                    ? 'bg-med-blue text-white border-med-blue shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                <Icon size={14} className={mainTab === tab.id ? 'text-white' : 'text-med-terracotta'} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => handleMainTabChange('festivities')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 border whitespace-nowrap snap-center ${
                            mainTab === 'festivities'
                            ? 'bg-med-blue text-white border-med-blue shadow-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        <Calendar size={14} className={mainTab === 'festivities' ? 'text-white' : 'text-med-terracotta'} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">The Plan</span>
                    </button>
                </div>
             </div>

             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {activeTabContent && (
                     <div className="bg-med-sand dark:bg-gray-800 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                         <div className="relative z-10 space-y-6 lg:space-y-8">
                             <div className="flex gap-4 items-start">
                                 <Quote className="text-med-terracotta rotate-180 shrink-0 w-10 h-10 md:w-12 md:h-12" />
                                 <div>
                                     <h3 className="font-serif text-3xl text-med-blue dark:text-white mb-4">{activeTabContent.title}</h3>
                                     <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-serif text-xl italic">
                                         "{activeTabContent.quote}"
                                     </p>
                                 </div>
                             </div>
                             <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center border-t border-gray-100 dark:border-gray-700 pt-8">
                                 <img src={activeTabContent.image} alt={activeTabContent.title} className="w-full md:w-1/3 rounded-2xl shadow-md object-cover h-56 md:h-auto" />
                                 <div className="flex-1">
                                     <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                                         {activeTabContent.text}
                                     </p>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 {mainTab === 'festivities' && (
                    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory -mx-[4%] px-[4%] md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-x-visible scrollbar-hide scroll-pl-6">
                        {events.map((event, idx) => {
                            const EventIcon = ICON_MAP[event.iconName || 'Star'] || Star;
                            return (
                                <div key={idx} className="shrink-0 w-[280px] snap-center md:w-auto bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 group flex flex-col h-full hover:shadow-xl hover:border-med-blue/20">
                                    <div className="h-52 md:h-56 relative overflow-hidden shrink-0">
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold text-med-blue dark:text-white shadow-sm border border-white/20 flex items-center gap-2">
                                            <Clock size={12} className="text-med-terracotta"/> {event.day} • {event.time}
                                        </div>
                                        <div className="absolute bottom-4 left-6 right-6 text-white">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin size={12} className="text-med-lightBlue"/>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">{event.location}</span>
                                            </div>
                                            <h3 className="font-serif text-2xl leading-tight">{event.title}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                                        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed flex-grow italic">
                                            "{event.description}"
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};