import React, { useState, useMemo } from 'react';
import { 
    HelpCircle, MessageCircle, ChevronRight, Search, 
    Sparkles, Layout, Shirt, Compass, HeartHandshake, 
    Wallet, Phone, Info, ArrowRight, ExternalLink, Bot,
    Users2, Utensils
} from 'lucide-react';
import { Button } from './Button';
import { SlidingPaneLayout } from './SlidingPaneLayout';
import { EmptyState } from './EmptyState';
import { useNotification } from '../context/NotificationContext';

interface FAQItem {
    id: string;
    category: string;
    icon: any;
    q: string;
    a: string;
    tags?: string[];
}

const FAQ_DATA: FAQItem[] = [
    {
        id: 'nav-1',
        category: 'App Guide',
        icon: Layout,
        q: "How do I navigate the app?",
        a: "Voyageurs uses a fluid, card-based spatial interface. Launch apps from the dock at the bottom. To view all open cards at once, tap the 'Center Pill' to enter Overview Mode. To close a card, simply swipe it upwards while in Overview.",
        tags: ['Navigation', 'Cards', 'Overview']
    },
    {
        id: 'dress-1',
        category: 'Dress Code',
        icon: Shirt,
        q: "What is the dress code for the weekend?",
        a: "We have three distinct vibes:\n\n1. Friday Welcome: 'Mediterranean Chic' (Linen, light colors, relaxed but sharp).\n2. Saturday Gala: 'Black Tie Creative' (Formal with a touch of personal flair).\n3. Sunday Brunch: Casual / Travel attire.",
        tags: ['Attire', 'Formal', 'Gala']
    },
    {
        id: 'trans-1',
        category: 'Logistics',
        icon: Compass,
        q: "How do I get around ?",
        a: "The historic center is strictly pedestrian and highly walkable. For longer distances, use the tramway network—look for the colorful cars designed by Christian Lacroix. Uber and Bolt are available for late-night returns to your hotel.",
        tags: ['Transport', 'Tram', 'Walking']
    },
    {
        id: 'gifts-1',
        category: 'Etiquette',
        icon: HeartHandshake,
        q: "Should I bring a gift?",
        a: "Your presence is the greatest gift we could ask for. Please do not feel obligated to bring anything. If you insist, we recommend saving your luggage space for local wine or treasures you find during your stay!",
        tags: ['Gifts', 'Policy']
    },
    {
        id: 'party-1',
        category: 'Guest List',
        icon: Users2,
        q: "Can I bring a guest or plus one?",
        a: "Please refer to your 'Identity' tab in the app. If your invitation includes a party size greater than one, you can add their details there. For any specific requests, please message the host directly.",
        tags: ['Guests', 'Plus One']
    },
    {
        id: 'diet-1',
        category: 'Dining',
        icon: Utensils,
        q: "How are dietary restrictions handled?",
        a: "French cuisine can be traditional, but we are working closely with our venues to ensure everyone is accommodated. Please ensure your specific needs (allergies, vegan, GF) are updated in your Profile settings so we can notify the chefs.",
        tags: ['Food', 'Allergies']
    },
    {
        id: 'emergency-1',
        category: 'Support',
        icon: Phone,
        q: "Who do I contact in an emergency?",
        a: "For immediate assistance during the weekend, you can use the 'Message Host' feature in this app to reach Bryan's team. For local emergency services in France, dial 112 from any phone.",
        tags: ['Emergency', 'Contact']
    },
    {
        id: 'cash-1',
        category: 'Financials',
        icon: Wallet,
        q: "Do I need to carry cash?",
        a: " is very card-friendly, and contactless payment (Apple Pay/Google Pay) is accepted almost everywhere. It's helpful to have 20-50 Euros in small bills for market stalls or small tips, but a card is usually sufficient.",
        tags: ['Money', 'Payment', 'Euros']
    }
];

interface FAQAppProps {
    onContact?: () => void;
}

export const FAQApp: React.FC<FAQAppProps> = ({ onContact }) => {
    const { addNotification } = useNotification();
    const [selectedItem, setSelectedItem] = useState<FAQItem | null>(null);
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        if (!search.trim()) return FAQ_DATA;
        const q = search.toLowerCase();
        return FAQ_DATA.filter(item => 
            item.q.toLowerCase().includes(q) || 
            item.a.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.tags?.some(t => t.toLowerCase().includes(q))
        );
    }, [search]);

    const categories = useMemo(() => {
        const cats = new Set(FAQ_DATA.map(i => i.category));
        return Array.from(cats);
    }, []);

    // --- Master View Component ---
    const MasterView = (
        <div className="flex flex-col h-full bg-med-sand dark:bg-gray-950">
            {/* Header */}
            <div className="p-8 pb-4 shrink-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                    <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-none whitespace-nowrap">
                        Common <span className="italic text-med-terracotta">Questions</span>
                    </h2>
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-med-terracotta transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search help..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:border-med-terracotta/30 outline-none transition-all dark:text-white shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 scrollbar-hide pb-32">
                {filteredItems.length === 0 ? (
                    <EmptyState 
                        icon={Search}
                        title="No results found"
                        message="Try searching for something else or contact the host directly."
                        actionLabel="Clear Search"
                        onAction={() => setSearch('')}
                    />
                ) : (
                    <div className="space-y-8">
                        {categories.map(cat => {
                            const catItems = filteredItems.filter(i => i.category === cat);
                            if (catItems.length === 0) return null;

                            return (
                                <div key={cat} className="space-y-3">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 ml-2">{cat}</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {catItems.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedItem(item)}
                                                className={`
                                                    group w-full flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-2xl border transition-all text-left
                                                    ${selectedItem?.id === item.id 
                                                        ? 'border-med-blue bg-blue-50/30 dark:bg-blue-900/10' 
                                                        : 'border-gray-100 dark:border-gray-800 hover:border-med-blue/20 hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`p-2 rounded-xl shrink-0 transition-colors ${selectedItem?.id === item.id ? 'bg-med-blue text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-med-blue'}`}>
                                                        <item.icon size={18} />
                                                    </div>
                                                    <span className={`text-sm font-bold truncate ${selectedItem?.id === item.id ? 'text-med-blue dark:text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-med-blue'}`}>
                                                        {item.q}
                                                    </span>
                                                </div>
                                                <ChevronRight size={16} className={`shrink-0 transition-all ${selectedItem?.id === item.id ? 'text-med-blue translate-x-1' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    // --- Detail View Component ---
    const DetailView = selectedItem && (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 animate-in slide-in-from-right duration-300">
            <div className="p-8 md:p-12 space-y-10 overflow-y-auto flex-1 scrollbar-hide">
                
                {/* Header Icon Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-med-blue/5 dark:bg-blue-900/10 rounded-[2rem] flex items-center justify-center text-med-blue dark:text-blue-300 mb-6 border border-med-blue/10 dark:border-blue-800">
                        <selectedItem.icon size={32} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-med-terracotta mb-4">{selectedItem.category}</span>
                    <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-tight max-w-sm">
                        {selectedItem.q}
                    </h2>
                </div>

                {/* Answer Content */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-med-blue/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <p className="text-gray-600 dark:text-gray-300 leading-loose text-base md:text-lg font-serif italic relative z-10">
                        "{selectedItem.a}"
                    </p>
                </div>

                {/* Tags & Related */}
                {selectedItem.tags && (
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Related Topics</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedItem.tags.map(tag => (
                                <span key={tag} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contextual Action Card */}
                <div className="p-6 rounded-3xl bg-med-blue text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3">
                            <Bot size={20} className="text-med-terracotta" />
                            <h4 className="font-serif text-xl">Need more detail?</h4>
                        </div>
                        <p className="text-xs text-blue-100 leading-relaxed">
                            Céleste, our AI concierge, has real-time access to the full event itinerary and local city data.
                        </p>
                        <Button 
                            variant="action" 
                            size="sm" 
                            fullWidth 
                            className="text-[9px]"
                            onClick={() => {
                                // Logic to trigger concierge search with current question could go here
                                addNotification("Ask Céleste is launching...", "info");
                            }}
                        >
                            Ask Céleste About This <ArrowRight size={12} className="ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Contact Bar */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-4">
                <Button 
                    onClick={onContact} 
                    variant="secondary" 
                    fullWidth 
                    size="lg" 
                    className="flex items-center gap-2"
                >
                    <MessageCircle size={18} /> Message Host
                </Button>
            </div>
        </div>
    );

    return (
        <SlidingPaneLayout 
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            master={MasterView}
            detail={DetailView}
            title={selectedItem?.q || "Help & Support"}
            subtitle={selectedItem?.category || "Voyageurs Guide"}
        />
    );
};
