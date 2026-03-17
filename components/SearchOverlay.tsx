
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Sparkles, Loader2, ArrowRight, ExternalLink, MapPin, Calendar, Utensils } from 'lucide-react';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { askConcierge } from '../services/geminiService';
import { HubView } from './HubLayout';
import { ChatSource } from '../types';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (view: HubView) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onNavigate }) => {
    const [query, setQuery] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<{ text: string; sources: ChatSource[] } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { items, travelers, durationDays } = useTripPlanner();
    const { user } = useUser();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setAiResponse(null);
        }
    }, [isOpen]);

    const handleAiSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim() || isAiLoading) return;
        
        setIsAiLoading(true);
        setAiResponse(null);
        
        const itineraryDetails = items.map(i => `${i.name} (${i.category})`).join(', ');
        const context = `
            User is planning a trip for ${travelers} people for ${durationDays} days.
            Current RSVP Status: ${user?.status || 'Unknown'}.
            Saved items: ${itineraryDetails || "None"}.
        `;
        
        try {
            const result = await askConcierge(query, context);
            setAiResponse(result);
        } catch (error) {
            console.error(error);
            setAiResponse({ text: "I'm having trouble connecting to the concierge network right now.", sources: [] });
        }
        
        setIsAiLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-white/95 dark:bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
            <div className="max-w-3xl mx-auto w-full p-6 md:p-12 flex flex-col h-full">
                <div className="flex justify-end mb-8">
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-slate-800 dark:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-10 text-center">
                    <h2 className="font-serif text-3xl md:text-4xl text-slate-800 dark:text-white mb-4">Ask Céleste</h2>
                    <p className="text-slate-600 dark:text-white/60 text-sm max-w-md">
                        Your AI concierge knows the entire itinerary, local secrets of Montpellier, and your personal travel plans.
                    </p>
                </div>

                <form onSubmit={handleAiSearch} className="relative w-full mb-10">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/40" size={24} />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Where is the welcome dinner? or Best coffee nearby?"
                        className="w-full bg-white/10 border border-white/10 rounded-[2rem] pl-16 pr-6 py-6 text-xl md:text-2xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:text-white/20 outline-none focus:bg-white/20 focus:border-white/30 transition-all font-serif"
                    />
                    <button 
                        type="submit"
                        disabled={!query.trim() || isAiLoading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-med-terracotta hover:bg-[#c56143] text-slate-800 dark:text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {aiResponse ? (
                        <div className="bg-white/10 rounded-3xl p-8 border border-white/10 animate-in slide-in-from-bottom-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-med-blue rounded-xl shrink-0 border border-white/10 shadow-lg">
                                    <Sparkles size={24} className="text-med-terracotta" />
                                </div>
                                <div className="space-y-6">
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-lg leading-relaxed text-blue-50">
                                            {aiResponse.text}
                                        </p>
                                    </div>
                                    
                                    {aiResponse.sources && aiResponse.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                                            {aiResponse.sources.map((source, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={source.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-xs text-blue-200 transition-colors"
                                                >
                                                    <ExternalLink size={10} /> {source.title}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                            {[
                                { icon: Calendar, text: "When is the Gala dinner?" },
                                { icon: MapPin, text: "How do I get to the hotel?" },
                                { icon: Utensils, text: "Best lunch spots in L'Écusson?" },
                                { icon: Sparkles, text: "What is the dress code?" }
                            ].map((suggestion, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => { setQuery(suggestion.text); handleAiSearch(); }}
                                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-all border border-transparent hover:border-white/10 group"
                                >
                                    <suggestion.icon size={20} className="text-slate-600 dark:text-white/60 group-hover:text-med-terracotta transition-colors" />
                                    <span className="text-slate-700 dark:text-white/80 font-medium">{suggestion.text}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
