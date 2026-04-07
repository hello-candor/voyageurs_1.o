import React, { useState } from 'react';
import { PlanItem } from '../context/TripPlannerContext';
import { ChevronRight, ChevronLeft, Plane, Bed, Car, Ticket } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DeckCarouselProps {
    items: PlanItem[];
    onFocusItem?: (item: PlanItem) => void;
}

export const DeckCarousel: React.FC<DeckCarouselProps> = ({ items, onFocusItem }) => {
    const [activeIndex, setActiveIndex] = useState(Math.floor(items.length / 2));
    const { theme } = useTheme();

    if (items.length === 0) return null;

    const handleNext = () => setActiveIndex(Math.min(items.length - 1, activeIndex + 1));
    const handlePrev = () => setActiveIndex(Math.max(0, activeIndex - 1));

    const getIcon = (cat: string) => {
        switch(cat) {
            case 'flight': return <Plane size={24} />;
            case 'hotel': return <Bed size={24} />;
            case 'rental': return <Car size={24} />;
            default: return <Ticket size={24} />;
        }
    };

    return (
        <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-visible my-12 pointer-events-auto">
            {/* Nav controls */}
            <div className="absolute inset-y-0 left-0 xl:left-12 flex items-center z-50 pointer-events-none">
                <button 
                    onClick={handlePrev} 
                    disabled={activeIndex === 0}
                    className={`pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md shadow-lg border border-white/5 text-white transition-all transform ${activeIndex === 0 ? 'opacity-0 scale-90' : 'opacity-100 hover:bg-white/20 hover:scale-110 active:scale-95'}`}
                >
                    <ChevronLeft size={32} />
                </button>
            </div>
            <div className="absolute inset-y-0 right-0 xl:right-12 flex items-center z-50 pointer-events-none">
                <button 
                    onClick={handleNext} 
                    disabled={activeIndex === items.length - 1}
                    className={`pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md shadow-lg border border-white/5 text-white transition-all transform ${activeIndex === items.length - 1 ? 'opacity-0 scale-90' : 'opacity-100 hover:bg-white/20 hover:scale-110 active:scale-95'}`}
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Deck Cards */}
            <div className="relative w-full max-w-[380px] h-full flex items-center justify-center -translate-y-4">
                {items.map((item, index) => {
                    const relativeIndex = index - activeIndex;
                    const distance = Math.abs(relativeIndex);
                    const sign = Math.sign(relativeIndex);
                    
                    let baseOffset = 0;
                    if (distance === 1) baseOffset = 180;
                    else if (distance === 2) baseOffset = 300;
                    else if (distance > 2) baseOffset = 300 + (distance - 2) * 80;
                    
                    const translateX = sign * baseOffset;
                    const scale = distance === 0 ? 1 : Math.max(0.6, 0.85 - distance * 0.1);
                    const zIndex = 50 - distance * 10;
                    const opacity = distance > 3 ? 0 : (distance === 0 ? 1 : 0.8);
                    const blur = distance === 0 ? '0px' : '8px';
                    const rotateY = sign * (distance === 0 ? 0 : 25); // Sleek 3D rotation forming the deck

                    return (
                        <div 
                            key={item.id}
                            onClick={() => {
                                if (distance === 0 && onFocusItem) onFocusItem(item);
                                else setActiveIndex(index);
                            }}
                            className={`absolute inset-0 m-auto w-[85vw] md:w-[380px] h-[60vh] max-h-[500px] rounded-[2rem] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer flex flex-col
                                ${theme === 'light' ? 'bg-white/90 shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-white/50' : 'bg-[#330046]/40 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/10 ring-1 ring-white/5'}
                            `}
                            style={{
                                transform: `translateX(${translateX}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                                zIndex,
                                opacity,
                                filter: `blur(${blur})`,
                                backdropFilter: 'blur(30px)'
                            }}
                        >
                            {/* Visual Header / Cover Image */}
                            <div className="relative w-full h-[60%] shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-10" />
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#508BC5] to-[#330046]" />
                                )}
                                
                                <div className="absolute top-6 left-6 z-20">
                                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
                                        {getIcon(item.category)}
                                        {item.category}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Card Body - Apple Wallet Style Ticket Info */}
                            <div className={`relative z-20 w-full flex-1 p-6 flex flex-col justify-between ${theme === 'light' ? 'bg-white/90 text-gray-800' : 'bg-black/40 text-white'}`}>
                                <div>
                                    <h3 className="font-serif text-3xl font-bold mb-2 leading-tight drop-shadow-sm">
                                        {item.name}
                                    </h3>
                                    <p className={`text-sm font-medium line-clamp-2 ${theme === 'light' ? 'text-gray-500' : 'text-white/60'}`}>
                                        {item.details || 'No additional details provided.'}
                                    </p>
                                </div>
                                
                                <div className={`flex justify-between items-end border-t pt-4 ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
                                    <div>
                                        <span className={`text-[10px] uppercase tracking-widest block mb-1 ${theme === 'light' ? 'text-gray-400' : 'text-white/40'}`}>Status</span>
                                        <span className={`font-bold text-xs uppercase tracking-wider ${item.bookingStatus === 'booked' ? 'text-med-olive drop-shadow-[0_0_8px_rgba(85,107,47,0.5)]' : 'text-med-terracotta'}`}>
                                            {item.bookingStatus === 'booked' ? 'Confirmed' : 'Draft'}
                                        </span>
                                    </div>
                                    <button className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg transition-transform hover:scale-105 active:scale-95 ${theme === 'light' ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}>
                                        Open App
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
