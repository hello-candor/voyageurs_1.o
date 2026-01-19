import React, { useState, useRef } from 'react';
import { Sun, Wine, Users, ThermometerSun, Waves, Music, Sparkles, Landmark, Scroll, GraduationCap, Palette, Gem, Footprints, Zap } from 'lucide-react';
import { useAppConfig } from '../context/AppConfigContext';

// Helper to map string icon names to Lucide components
const ICON_MAP: Record<string, any> = {
    Sun, Wine, Users, ThermometerSun, Waves, Music, Sparkles, Landmark, Scroll, GraduationCap, Palette, Gem, Footprints, Zap
};

export const MontpellierInfo: React.FC = () => {
  const { config } = useAppConfig();
  const landingContent = config.content.landing;
  const SECTIONS = landingContent.infoSections;
  
  const [activeTabId, setActiveTabId] = useState<string>(SECTIONS[0]?.id || 'overview');
  const tabsRef = useRef<HTMLDivElement>(null);
  
  const currentSection = SECTIONS.find(s => s.id === activeTabId) || SECTIONS[0];

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    if (window.innerWidth < 1024 && tabsRef.current) {
        const offset = 90; 
        const elementPosition = tabsRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  if (!currentSection) return null;

  return (
    <section id="montpellier-info" className="py-16 md:py-24 bg-med-sand dark:bg-slate-900 relative transition-colors duration-300">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-med-lightBlue/10 rounded-full blur-[100px] -mr-32 -mt-32 mix-blend-multiply dark:mix-blend-normal dark:bg-med-lightBlue/5"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-med-terracotta/5 rounded-full blur-[100px] -ml-48 -mb-48 mix-blend-multiply dark:mix-blend-normal dark:bg-med-terracotta/5"></div>
        </div>

        <div className="w-[92%] md:w-[85%] mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* LEFT COLUMN */}
                <div className="lg:w-1/3">
                    <div className="lg:sticky lg:top-28">
                        <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs block mb-3">{landingContent.subtitle.replace('{config.destination}', config.destination)}</span>
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-med-blue dark:text-white mb-4 lg:mb-6 leading-none">
                            {config.destination}:<br/><span className="italic text-med-terracotta">{landingContent.title}</span>
                        </h2>
                        <div className="relative pl-6 border-l-4 border-med-terracotta/30 py-1 mb-6 lg:mb-8">
                            <p className="font-serif text-lg md:text-xl text-med-blue dark:text-blue-100 leading-relaxed italic">
                                "{landingContent.quote.replace('{config.destination}', config.destination)}"
                            </p>
                        </div>

                        {/* Desktop Tab Navigation */}
                        <div className="hidden lg:flex flex-col gap-3">
                            {SECTIONS.map((section) => {
                                const Icon = ICON_MAP[section.tabIcon] || Landmark;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => handleTabChange(section.id)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 border w-full text-left ${
                                            activeTabId === section.id
                                            ? 'bg-med-blue text-white border-med-blue shadow-lg -translate-y-1'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:border-med-blue/20'
                                        }`}
                                    >
                                        <div className={`p-3 rounded-xl shrink-0 ${activeTabId === section.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                            <Icon size={20} className={activeTabId === section.id ? 'text-white' : 'text-med-terracotta'} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-xs uppercase tracking-wider mb-1">{section.tabLabel}</span>
                                            <span className="text-[10px] opacity-70 leading-tight block">{section.tabDesc}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:w-2/3">
                    
                    {/* Mobile Fixed Tabs - Scrollable Pill List */}
                    <div ref={tabsRef} className="lg:hidden sticky top-0 z-30 bg-med-sand/95 dark:bg-slate-900/95 backdrop-blur-md -mx-[4%] px-[4%] py-3 mb-8 border-b border-med-terracotta/10 transition-all duration-300">
                        <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide snap-x">
                            {SECTIONS.map((section) => {
                                const Icon = ICON_MAP[section.tabIcon] || Landmark;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => handleTabChange(section.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 border whitespace-nowrap snap-center ${
                                            activeTabId === section.id
                                            ? 'bg-med-blue text-white border-med-blue shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        <Icon size={14} className={activeTabId === section.id ? 'text-white' : 'text-med-terracotta'} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{section.tabLabel}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div key={activeTabId} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-10">
                             <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between mb-6">
                                <div>
                                    <h3 className="font-serif text-3xl md:text-4xl text-med-blue dark:text-white mb-4">
                                        {currentSection.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base max-w-xl">
                                        {currentSection.description}
                                    </p>
                                </div>
                                
                                <div className="flex gap-4 shrink-0 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    {currentSection.stats.map((stat, i) => (
                                        <div key={i} className="px-5 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-med-terracotta/10 shadow-sm text-center min-w-[100px]">
                                            <span className="block font-bold text-xl md:text-2xl text-med-blue dark:text-white">{stat.value}</span>
                                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>

                        {/* Carousel Wrapper - Updated Snap/Scroll Physics & Padding */}
                        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory -mx-[4%] px-[4%] md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-x-visible scrollbar-hide scroll-pl-6">
                            {currentSection.items.map((item, idx) => {
                                const ItemIcon = ICON_MAP[item.iconName] || Sparkles;
                                return (
                                    <div key={idx} className="shrink-0 w-[280px] snap-center md:w-auto bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                                        <div className="h-48 md:h-56 relative overflow-hidden shrink-0">
                                            <img 
                                                src={item.image} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur p-2.5 rounded-xl shadow-sm border border-white/20 text-med-blue dark:text-white">
                                                <ItemIcon size={18} className="text-med-terracotta" />
                                            </div>
                                            <div className="absolute bottom-4 left-6 right-6 text-white">
                                                <h3 className="font-serif text-2xl leading-tight font-bold">{item.title}</h3>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                                            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed flex-grow">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};