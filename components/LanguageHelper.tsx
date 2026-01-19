
import React, { useState } from 'react';
import { MessageCircle, Coffee, Sparkles, Volume2, Info, MapPin, Utensils, HeartHandshake, Heart, AlertCircle, Play, Pause } from 'lucide-react';

interface Phrase {
    en: string;
    fr: string;
    pronunciation?: string;
    context?: string;
}

interface Category {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    phrases: Phrase[];
}

const CATEGORIES: Category[] = [
    {
        id: 'basics',
        title: 'Polite Essentials',
        description: "The magic words that open every door in France.",
        icon: HeartHandshake,
        color: 'text-med-blue',
        bg: 'bg-med-blue/10',
        phrases: [
          { en: "Hello / Good morning", fr: "Bonjour", pronunciation: "bon-zhoor" },
          { en: "Good evening", fr: "Bonsoir", pronunciation: "bon-swahr" },
          { en: "Goodbye", fr: "Au revoir", pronunciation: "oh-rev-wahr" },
          { en: "Please", fr: "S'il vous plaît", pronunciation: "seel-voo-play" },
          { en: "Thank you", fr: "Merci", pronunciation: "mehr-see" },
          { en: "Excuse me", fr: "Excusez-moi", pronunciation: "ex-kyoo-zay mwah" }
        ]
    },
    {
        id: 'dining',
        title: 'Dining & Wine',
        description: "Ordering like a local in the bistros.",
        icon: Utensils,
        color: 'text-med-terracotta',
        bg: 'bg-med-terracotta/10',
        phrases: [
          { en: "A table for two", fr: "Une table pour deux", pronunciation: "oon tah-bluh poor duh" },
          { en: "The menu, please", fr: "La carte, s'il vous plaît", pronunciation: "lah kart..." },
          { en: "A glass of wine", fr: "Un verre de vin", pronunciation: "uh ver duh van" },
          { en: "Water (Free/Tap)", fr: "Une carafe d'eau", pronunciation: "oon kah-raf doh" },
          { en: "The bill, please", fr: "L'addition, s'il vous plaît", pronunciation: "lah-dee-syon..." }
        ]
    },
    {
        id: 'social',
        title: 'Social & Flirting',
        description: "For the late nights at Gaspard.",
        icon: Sparkles,
        color: 'text-fuchsia-500',
        bg: 'bg-fuchsia-500/10',
        phrases: [
          { en: "Cheers!", fr: "Santé !", pronunciation: "san-tay" },
          { en: "You are charming", fr: "Vous êtes charmant(e)", pronunciation: "vooz et shar-man" },
          { en: "One more drink?", fr: "Encore un verre ?", pronunciation: "on-kor uh ver" },
          { en: "This place is great", fr: "C'est génial ici", pronunciation: "say zhay-nyal ee-see" }
        ]
    },
    {
        id: 'travel',
        title: 'Getting Around',
        description: "Navigating the tram and streets.",
        icon: MapPin,
        color: 'text-med-olive',
        bg: 'bg-med-olive/10',
        phrases: [
          { en: "Where is...?", fr: "Où est...?", pronunciation: "oo ay" },
          { en: "The train station", fr: "La gare", pronunciation: "lah gar" },
          { en: "I am lost", fr: "Je suis perdu", pronunciation: "zhuh swee pair-doo" },
          { en: "Entrance / Exit", fr: "Entrée / Sortie", pronunciation: "on-tray / sor-tee" }
        ]
    }
];

export const LanguageHelper: React.FC = () => {
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('basics');

  const handlePlay = (text: string, id: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; 
    utterance.rate = 0.8; 
    
    utterance.onstart = () => setPlayingPhrase(id);
    utterance.onend = () => setPlayingPhrase(null);
    utterance.onerror = () => setPlayingPhrase(null);

    window.speechSynthesis.speak(utterance);
  };

  const selectedCat = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Left Column: Context & Selection */}
        <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-12 space-y-8">
                <div>
                    <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Communication</span>
                    <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                        Speak<br />
                        <span className="italic text-med-terracotta">Like a Local</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                        "In France, attempting to speak the language is the highest form of politeness. Even a simple 'Bonjour' changes everything."
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`group flex items-center p-4 rounded-[2rem] transition-all duration-300 border text-left relative overflow-hidden ${
                                activeCategory === cat.id 
                                ? 'bg-white dark:bg-gray-800 border-med-blue/30 shadow-lg scale-[1.02]' 
                                : 'bg-transparent border-gray-100 dark:border-gray-800 hover:bg-white/50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            <div className={`p-3 rounded-2xl ${cat.bg} ${cat.color} mr-4 shrink-0 transition-transform group-hover:scale-110`}>
                                <cat.icon size={20} />
                            </div>
                            <div>
                                <h4 className={`font-serif text-lg leading-none mb-1 ${activeCategory === cat.id ? 'text-med-blue dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {cat.title}
                                </h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                    {cat.phrases.length} Phrases
                                </p>
                            </div>
                            {activeCategory === cat.id && (
                                <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${cat.bg.replace('/10', '')}`} />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Cards */}
        <div className="lg:w-2/3 min-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 key={activeCategory}">
                {selectedCat.phrases.map((phrase, idx) => {
                    const uniqueId = `${activeCategory}-${idx}`;
                    const isPlaying = playingPhrase === uniqueId;

                    return (
                        <div 
                            key={idx}
                            onClick={() => handlePlay(phrase.fr, uniqueId)}
                            className={`
                                group relative bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 
                                shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden
                                ${isPlaying ? 'ring-2 ring-med-terracotta border-transparent' : ''}
                            `}
                        >
                            {/* Background decoration */}
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 transition-opacity duration-500 ${selectedCat.bg} ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />

                            <div className="relative z-10 flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{phrase.en}</span>
                                <div className={`p-2 rounded-full transition-all duration-300 ${isPlaying ? 'bg-med-terracotta text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-med-blue'}`}>
                                    {isPlaying ? <Volume2 size={16} className="animate-pulse" /> : <Play size={16} fill="currentColor" />}
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="font-serif text-2xl md:text-3xl text-med-blue dark:text-white mb-2 leading-tight">
                                    {phrase.fr}
                                </p>
                                {phrase.pronunciation && (
                                    <p className="text-sm text-med-terracotta/80 font-medium italic">
                                        "{phrase.pronunciation}"
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {/* Pro Tip Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-med-blue to-blue-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden shadow-lg mt-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10 flex gap-6 items-center">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <Info size={24} />
                        </div>
                        <div>
                            <h4 className="font-serif text-2xl mb-2">Golden Rule</h4>
                            <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
                                Always say <strong>"Bonjour"</strong> when entering a shop or starting a conversation. It is not just a greeting; it is the key that unlocks good service in France.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
