
import React from 'react';
import { MapPin, Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAppConfig } from '../context/AppConfigContext';

export const Hero: React.FC = () => {
  const { toggleProfile } = useUser();
  const { config } = useAppConfig();

  const handleScrollDown = () => {
    const infoSection = document.getElementById('-info');
    if (infoSection) {
        infoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative h-[100dvh] min-h-[600px] w-full overflow-hidden bg-med-blue" aria-label="Welcome Section">
      
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 w-full h-full">
        
        {/* Video Layer - Hidden on mobile for performance */}
        {config.videoUrl && (
            <div className="hidden md:block absolute inset-0 z-0 overflow-hidden">
                <div className="absolute inset-0 bg-black/10 z-10" />
                <video 
                    className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none opacity-80 [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden [&::-webkit-media-controls-panel]:hidden"
                    src={config.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    aria-hidden="true"
                    tabIndex={-1}
                />
            </div>
        )}

        {/* Fallback / Base Layer: High-Res Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center z-[-1] scale-105 animate-in fade-in duration-1000"
            style={{ 
                backgroundImage: `url('${config.heroImage}')`, 
                backgroundPosition: 'center 40%'
            }}
        />

        {/* Cinematic Overlays - Golden Hue for "L'Été Indien" vibes */}
        <div className="absolute inset-0 bg-med-blue/30 mix-blend-multiply pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-amber-200/10 pointer-events-none z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-med-blue via-med-blue/50 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-20 h-full flex flex-col justify-center md:justify-end pb-32 md:pb-24 px-6 md:px-16 w-full max-w-[1800px] mx-auto pointer-events-none">
          <div className="max-w-5xl animate-in slide-in-from-bottom-10 duration-1000 delay-300 pointer-events-auto">
            <div className="flex items-center gap-4 text-med-terracotta mb-6 md:mb-8 font-bold uppercase tracking-[0.3em] text-[10px] md:text-sm opacity-90">
                <span className="w-8 md:w-16 h-[2px] bg-med-terracotta shadow-lg"></span>
                <span className="drop-shadow-lg text-white md:text-med-terracotta">Une Invitation Spéciale</span>
            </div>
            
            <h1 className="flex flex-col gap-1 md:gap-3 mb-8 md:mb-10 drop-shadow-2xl">
                <span className="font-serif text-6xl md:text-8xl lg:text-[7.5rem] text-white leading-[0.85] tracking-tight">
                    {config.welcomeMessage.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="font-serif italic text-4xl md:text-6xl lg:text-[5.5rem] text-med-terracotta font-light leading-[0.9] ml-1 md:ml-3">
                    {config.welcomeMessage.split(' ').slice(2).join(' ')}
                </span>
            </h1>

            <p className="text-white/80 text-base md:text-xl max-w-xl leading-relaxed mb-12 font-sans font-light drop-shadow-lg border-l-2 border-white/30 pl-6">
                The {config.destination} adventure awaits. A weekend of celebration, culture, and connection.
            </p>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                {/* Event Logistics Badge */}
                <div className="flex items-center gap-4 md:gap-8 px-6 md:px-8 py-4 md:py-5 border border-white/10 rounded-full bg-white/5 backdrop-blur-3xl text-white/90 shadow-2xl transition-transform hover:scale-[1.02]">
                    <div className="flex flex-col items-start border-r border-white/20 pr-4 md:pr-8">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={10} className="text-med-terracotta" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-med-terracotta/90">Occasion</span>
                        </div>
                        <span className="text-sm md:text-base font-serif italic whitespace-nowrap">{config.appName}</span>
                    </div>
                    <div className="flex flex-col items-start border-r border-white/20 pr-4 md:pr-8">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={10} className="text-med-terracotta" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-med-terracotta/90">Dates</span>
                        </div>
                        <span className="text-sm md:text-base font-serif italic whitespace-nowrap">Sept 18—20, 2026</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-2 mb-1">
                            <MapPin size={10} className="text-med-terracotta" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-med-terracotta/90">Location</span>
                        </div>
                        <span className="text-sm md:text-base font-serif italic whitespace-nowrap">{config.destination}</span>
                    </div>
                </div>
            </div>
          </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-auto cursor-pointer" onClick={handleScrollDown}>
        <ChevronDown className="text-white/70 hover:text-white transition-colors" size={32} />
      </div>

    </section>
  );
};
