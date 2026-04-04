
import React, { useState, useEffect, useMemo } from 'react';
import {
    Train, Car, Footprints, MessageCircle, HeartHandshake,
    ShieldCheck, Phone, AlertCircle, Info, Map as MapIcon,
    Languages, BookOpen, Briefcase, Check, Sun, Zap, FileText, Sparkles, Printer, ArrowLeft, Clock,
    Square, HelpCircle, GripHorizontal, ArrowRight, Filter
} from 'lucide-react';
import { safeStorage } from '../utils/storage';
import { LanguageHelper } from './LanguageHelper';
import { EtiquetteGuide } from './EtiquetteGuide';
import { HubView } from './HubLayout';
import { SegmentedControl } from './SegmentedControl';

interface EssentialsToolkitProps {
    onNavigate?: (view: HubView) => void;
    initialTab?: 'guides' | 'mobility' | 'packing' | 'language' | 'etiquette';
}

const TRANSIT_OPTIONS = [
    {
        id: 'tram',
        title: 'Tramway',
        subtitle: 'The Colorful Network',
        icon: Train,
        desc: "'s tram system is designed by Christian Lacroix. It's the most efficient way to get around the metro area. Lines 1 (Blue) and 4 (Gold) circle the historic center.",
        tip: "Download 'TaM ' for tickets.",
        color: 'bg-blue-500'
    },
    {
        id: 'walk',
        title: 'Walking',
        subtitle: 'L\'Ecusson',
        icon: Footprints,
        desc: "The historic center is one of Europe's largest pedestrian zones. Most key locations (Comédie, Peyrou, Restaurants) are within a 15-minute walk.",
        tip: "Comfortable shoes are non-negotiable.",
        color: 'bg-med-terracotta'
    },
    {
        id: 'uber',
        title: 'Rideshare',
        subtitle: 'Uber & Bolt',
        icon: Car,
        desc: "Uber and Bolt are widely available. Pickups in the pedestrian zone are impossible, so set your pickup pin to the nearest accessible road (e.g. Blvd Jeu de Paume).",
        tip: "Wait times are low, even late at night.",
        color: 'bg-gray-800'
    }
];

const PACKING_LIST = [
    {
        category: 'Essentials',
        icon: FileText,
        color: 'text-med-blue',
        bg: 'bg-med-blue/10',
        items: [
            'Passport / ID',
            'Travel Insurance Details',
            'Power Adapter (Type E)',
            'Portable Charger'
        ]
    },
    {
        category: 'Wardrobe',
        icon: Sun,
        color: 'text-med-terracotta',
        bg: 'bg-med-terracotta/10',
        items: [
            'Linen / Breathable Fabrics',
            'Comfortable Walking Shoes',
            'Evening Outfit (Smart Casual)',
            'Swimwear (Beach/Pool)',
            'Sunglasses & Hat'
        ]
    },
    {
        category: 'Toiletries',
        icon: Sparkles,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        items: [
            'Sunscreen (High SPF)',
            'Moisturizer (Dry Heat)',
            'Personal Meds',
            'Blister Plasters (Just in case)'
        ]
    }
];

const BLOG_POSTS = [
    {
        id: 'drone-tour',
        title: "Cinematic ",
        category: "Visuals",
        excerpt: "Soar above the aqueducts and the coastline in this stunning 4K aerial film.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
        readTime: "3 min watch",
        author: "Drone Scapes",
        isFeatured: true,
        content: `
            <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 bg-black">
                <iframe 
                    src="https://www.youtube.com/embed/wZiCI3R1Bdg" 
                    title=" Cinematic" 
                    class="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                ></iframe>
            </div>
            <p>See  from a perspective few get to witness. This cinematic journey takes you over the St. Clement Aqueduct, the Place de la Comédie, and out to the shimmering Mediterranean coast.</p>
            <h4>Key Sights</h4>
            <ul>
                <li>The Arceaux Aqueduct at sunset</li>
                <li>The geometric beauty of Antigone</li>
                <li>The coastline near Palavas</li>
            </ul>
        `
    },
    {
        id: 'travel-guide',
        title: "The Ultimate City Guide",
        category: "Essential",
        excerpt: "Samuel and Audrey take you through the top attractions and local food spots.",
        image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=800&auto=format&fit=crop",
        readTime: "12 min watch",
        author: "Samuel and Audrey",
        content: `
            <div class="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8 bg-black">
                <iframe 
                    src="https://www.youtube.com/embed/6b5XziA5TD4" 
                    title=" Travel Guide" 
                    class="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                ></iframe>
            </div>
            <p>A comprehensive guide to visiting . From the historic Place de la Comédie to the Arc de Triomphe, explore the city's rich history and vibrant culture.</p>
            <h4>Highlights</h4>
            <ul>
                <li>Place de la Comédie & The Three Graces</li>
                <li>Promenade du Peyrou</li>
                <li>Local French pastries and dining</li>
            </ul>
        `
    },
    {
        id: 'coffee-guide',
        title: "Caffeine Culture: The Best Specialty Coffee",
        category: "Lifestyle",
        excerpt: "Where to find the best flat white in the historic center.",
        image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
        readTime: "3 min read",
        author: "Bryan",
        content: `
            <p>France hasn't historically been known for its specialty coffee scene (sorry, <em>café richard</em>), but  is leading a quiet revolution. Here are the spots where you can get a proper V60 or Flat White.</p>
            <h4>1. Coldrip</h4>
            <p>Located in the heart of the Écusson, this is arguably the best coffee in town. Australian style, perfect extraction.</p>
            <h4>2. Café Bun</h4>
            <p>Near Saint-Roch station. Their cinnamon buns are dangerous, and their espresso is dialed in perfectly.</p>
            <h4>3. Napoleon Dynamite</h4>
            <p>Best for ambiance. Sit on the terrace of Place de la Canourgue and watch the world go by.</p>
        `
    },
    {
        id: 'hidden-history',
        title: "Secret Courtyards of L'Écusson",
        category: "Culture",
        excerpt: "Pushing open the heavy wooden doors of the old town.",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop",
        readTime: "5 min read",
        author: "Céleste",
        content: `
            <p>'s true beauty is hidden. The medieval center is packed with <em>Hôtels Particuliers</em>—private mansions from the 17th and 18th centuries—concealed behind unassuming heavy doors.</p>
            <h4>How to Spot Them</h4>
            <p>Look for doors that seem slightly ajar during the day. If you see a courtyard, peek inside (respectfully). You'll find grand staircases and stone vaults.</p>
            <h4>Hôtel de Varennes</h4>
            <p>Located on Place Pétrarque, this is one of the few you can freely enter. It houses museums now, but the architecture remains stunning.</p>
        `
    },
    {
        id: 'wine-101',
        title: "Languedoc Wine: A Primer",
        category: "Gastronomy",
        excerpt: "Why this region is the most exciting wine frontier in France right now.",
        image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop",
        readTime: "4 min read",
        author: "The Sommelier",
        content: `
            <p>Forget Bordeaux. The Languedoc is where the innovation is happening. Once known for bulk wine, it's now the land of exciting, terroir-driven reds and crisp whites.</p>
            <h4>Pic Saint-Loup</h4>
            <p>The "King of the North" of . These wines are Syrah-dominant, spicy, and elegant. Look for <em>Domaine de l'Hortus</em>.</p>
            <h4>Grés de </h4>
            <p>Grown right around the city. These are powerful, sun-drenched wines with notes of garrigue (wild herbs). <em>Château de Flaugergues</em> is a prime example.</p>
        `
    }
];

export const EssentialsToolkit: React.FC<EssentialsToolkitProps> = ({ onNavigate, initialTab = 'guides' }) => {
    const [activeTab, setActiveTab] = useState<'mobility' | 'packing' | 'guides' | 'language' | 'etiquette'>(initialTab);
    const [guideFilter, setGuideFilter] = useState<string>('All');
    const [selectedPost, setSelectedPost] = useState<typeof BLOG_POSTS[0] | null>(null);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Mark guide as seen when component mounts
        safeStorage.setItem('guide_seen', 'true');
    }, []);

    const toggleItem = (item: string) => {
        setCheckedItems(prev => {
            const next = new Set(prev);
            if (next.has(item)) next.delete(item);
            else next.add(item);
            return next;
        });
    };

    const handlePrintPackingList = () => {
        const printContent = `
          <html>
            <head>
              <title> Packing List</title>
              <style>
                body { font-family: sans-serif; padding: 40px; color: #1E4472; max-width: 800px; margin: 0 auto; }
                h1 { font-family: serif; font-size: 32px; border-bottom: 2px solid #D67252; padding-bottom: 10px; margin-bottom: 30px; }
                .category { margin-bottom: 30px; page-break-inside: avoid; }
                .category-title { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; color: #D67252; letter-spacing: 2px; }
                ul { list-style-type: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                li { padding: 5px 0; display: flex; align-items: center; font-size: 14px; }
                .checkbox { width: 16px; height: 16px; border: 1px solid #ccc; margin-right: 12px; display: inline-block; border-radius: 4px; }
                .note { margin-top: 40px; padding: 20px; background: #f9f9f9; border-left: 4px solid #8A9A5B; font-size: 12px; line-height: 1.6; }
                .footer { margin-top: 50px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
              </style>
            </head>
            <body>
              <h1> 2026 — Packing List</h1>
              
              ${PACKING_LIST.map(group => `
                <div class="category">
                  <div class="category-title">${group.category}</div>
                  <ul>
                    ${group.items.map(item => `<li><span class="checkbox"></span>${item}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}

              <div class="note">
                <strong>Weather Note:</strong> September in  sees highs of 77°F (25°C) and lows of 59°F (15°C). It is generally sunny, but a light layer for evenings is recommended.
              </div>

              <div class="footer">September 18-20 Celebration • Voyageurs App</div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
        }
    };

    const filteredPosts = useMemo(() => {
        if (guideFilter === 'All') return BLOG_POSTS;
        return BLOG_POSTS.filter(p => p.category === guideFilter);
    }, [guideFilter]);

    const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-white/5 pb-6">
                <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-none whitespace-nowrap">
                    Voyageurs <span className="italic text-med-terracotta">Guide</span>
                </h2>

                <SegmentedControl
                    items={[
                        { id: 'guides', label: 'Insights', icon: BookOpen },
                        { id: 'mobility', label: 'Mobility', icon: MapIcon },
                        { id: 'packing', label: 'Packing', icon: Briefcase },
                        { id: 'language', label: 'Language', icon: Languages },
                        { id: 'etiquette', label: 'Etiquette', icon: HeartHandshake },
                    ]}
                    selectedId={activeTab}
                    onChange={(id) => { setActiveTab(id as any); setSelectedPost(null); }}
                />
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'mobility' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {TRANSIT_OPTIONS.map((opt, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full">
                                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-[100px] transition-transform group-hover:scale-110 pointer-events-none ${opt.color}`} />

                                    <div className="flex items-start gap-5 mb-6 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${opt.color}`}>
                                            <opt.icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <div className="pt-1">
                                            <h4 className="font-serif text-2xl text-med-blue dark:text-white leading-none mb-2">{opt.title}</h4>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta">{opt.subtitle}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8 flex-grow relative z-10">
                                        {opt.desc}
                                    </p>

                                    <div className="mt-auto bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex gap-3 relative z-10">
                                        <AlertCircle size={18} className="text-med-blue shrink-0 mt-0.5" />
                                        <p className="text-xs text-med-blue dark:text-blue-200 font-medium italic leading-relaxed">
                                            "{opt.tip}"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'packing' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column: Context */}
                            <div className="lg:w-1/3">
                                <div className="lg:sticky lg:top-4 bg-med-blue text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-xl">
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-med-terracotta/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

                                    <div className="relative z-10">
                                        <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-4">Preparation</span>
                                        <h3 className="font-serif text-4xl mb-6 leading-none">Travel<br /><span className="italic text-white/50">Ready</span></h3>

                                        <p className="text-blue-100/80 text-sm leading-relaxed mb-8 font-medium">
                                             in September is warm but breezy. Pack for sunny days and cooler evenings. Don't forget the power adapter.
                                        </p>

                                        <div className="space-y-4">
                                            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                                                <div className="flex items-center gap-3 mb-2 text-med-terracotta">
                                                    <Sun size={18} />
                                                    <span className="font-bold text-xs uppercase tracking-wider">Weather</span>
                                                </div>
                                                <p className="text-xs text-white/90 leading-relaxed">
                                                    Highs of 77°F (25°C). Lows of 59°F (15°C). Mostly sunny.
                                                </p>
                                            </div>

                                            <button
                                                onClick={handlePrintPackingList}
                                                className="w-full py-4 bg-white text-med-blue rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-med-terracotta hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                                            >
                                                <Printer size={16} /> Print Checklist
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Content */}
                            <div className="lg:w-2/3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {PACKING_LIST.map((group, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`p-3 rounded-xl ${group.bg} ${group.color}`}>
                                                    <group.icon size={20} />
                                                </div>
                                                <h4 className="font-serif text-xl text-med-blue dark:text-white">{group.category}</h4>
                                            </div>
                                            <ul className="space-y-4">
                                                {group.items.map((item, i) => {
                                                    const isChecked = checkedItems.has(item);
                                                    return (
                                                        <li
                                                            key={i}
                                                            className="flex items-start gap-3 group cursor-pointer select-none"
                                                            onClick={() => toggleItem(item)}
                                                        >
                                                            <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${isChecked
                                                                    ? 'bg-med-olive border-med-olive text-white'
                                                                    : 'border-gray-300 dark:border-gray-600 bg-transparent text-transparent group-hover:border-med-blue'
                                                                }`}>
                                                                <Check size={12} strokeWidth={3} className={`transform transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} />
                                                            </div>
                                                            <span className={`text-sm font-medium transition-colors duration-300 ${isChecked
                                                                    ? 'text-gray-400 line-through decoration-gray-300 dark:decoration-gray-700'
                                                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-med-blue dark:group-hover:text-white'
                                                                }`}>
                                                                {item}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'guides' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {selectedPost ? (
                            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl animate-in zoom-in-95 duration-500 relative">
                                <div className="h-80 relative">
                                    <img src={selectedPost.image} className="w-full h-full object-cover" alt={selectedPost.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    <button
                                        onClick={() => setSelectedPost(null)}
                                        className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all group"
                                    >
                                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    </button>

                                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                                        <div className="flex items-center gap-3 mb-4 text-xs font-bold uppercase tracking-widest opacity-80">
                                            <span className="bg-med-terracotta px-2 py-1 rounded text-white">{selectedPost.category}</span>
                                            <span>•</span>
                                            <span>{selectedPost.readTime}</span>
                                            <span>•</span>
                                            <span>By {selectedPost.author}</span>
                                        </div>
                                        <h2 className="font-serif text-4xl md:text-5xl leading-tight max-w-3xl">{selectedPost.title}</h2>
                                    </div>
                                </div>
                                <div className="p-8 md:p-12 md:px-20 prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 font-sans leading-loose text-base md:text-lg">
                                    <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Filter Bar */}
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setGuideFilter(cat)}
                                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${guideFilter === cat
                                                    ? 'bg-med-blue text-white border-med-blue shadow-md'
                                                    : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-med-blue/30'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPosts.map((post, index) => (
                                        <article
                                            key={post.id}
                                            onClick={() => setSelectedPost(post)}
                                            className={`group relative flex flex-col bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl cursor-pointer hover:-translate-y-1 duration-500 ${index === 0 && guideFilter === 'All' ? 'md:col-span-2 lg:col-span-2' : ''}`}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className={`relative overflow-hidden ${index === 0 && guideFilter === 'All' ? 'aspect-[2/1]' : 'aspect-[4/3]'}`}>
                                                <img
                                                    src={post.image}
                                                    className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                                                    alt={post.title}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-med-blue dark:text-white shadow-sm">
                                                    {post.category}
                                                </div>

                                                {/* Hero Title Overlay */}
                                                {(index === 0 && guideFilter === 'All') && (
                                                    <div className="absolute bottom-6 left-6 right-6 text-white">
                                                        <h3 className="font-serif text-3xl md:text-4xl leading-tight mb-2 group-hover:text-med-terracotta transition-colors">{post.title}</h3>
                                                        <p className="text-sm opacity-90 line-clamp-2 max-w-lg">{post.excerpt}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Standard Content Block (Hidden for hero card to avoid duplication, or styled differently) */}
                                            {!(index === 0 && guideFilter === 'All') && (
                                                <div className="flex flex-col flex-1 p-6 md:p-8">
                                                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                                                        <span className="text-med-terracotta">{post.author}</span>
                                                        <span>•</span>
                                                        <span>{post.readTime}</span>
                                                    </div>
                                                    <h3 className="font-serif text-2xl text-med-blue dark:text-white leading-tight mb-3 group-hover:text-med-terracotta transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                                        {post.excerpt}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-med-blue dark:text-white group/btn pt-4 border-t border-gray-100 dark:border-gray-800">
                                                        Read Story <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-med-terracotta" />
                                                    </div>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'language' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <LanguageHelper />
                    </div>
                )}

                {activeTab === 'etiquette' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EtiquetteGuide />
                    </div>
                )}
            </div>
        </div>
    );
};
