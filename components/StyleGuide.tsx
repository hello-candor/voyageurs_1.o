
import React from 'react';
import { Button } from './Button';
import { 
    Sparkles, MapPin, Calendar, ArrowRight, Check, 
    Heart, Shield, Wallet, Star 
} from 'lucide-react';

export const StyleGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-med-sand dark:bg-slate-950 p-8 md:p-16 transition-colors duration-300 font-sans">
        
        {/* Header */}
        <div className="mb-20">
            <h1 className="font-serif text-6xl text-med-blue dark:text-white mb-2">
                Voyageurs <span className="italic text-med-terracotta">Design System</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">
                V 7.0 • Mediterranean Chic
            </p>
        </div>

        {/* 1. TYPOGRAPHY */}
        <section className="mb-20 space-y-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">01. Typography</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-gray-400 mb-2">Display Serif (Cormorant Garamond)</p>
                        <h1 className="font-serif text-6xl text-med-blue dark:text-white leading-none">
                            L'Art de <span className="italic text-med-terracotta">Vivre</span>
                        </h1>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-2">Heading 2</p>
                        <h2 className="font-serif text-4xl text-med-blue dark:text-white">
                            The Guest Journey
                        </h2>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-2">Heading 3</p>
                        <h3 className="font-serif text-2xl text-med-blue dark:text-white">
                            Accommodation & Logistics
                        </h3>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-gray-400 mb-2">UI Label / Micro</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-med-terracotta">
                            Official Agenda
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-2">Body Text (Montserrat)</p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                             is famously the "15-Minute City." The entire historic center (L'Écusson) is Europe's largest pedestrian zone. Cars are neither necessary nor useful here. Pack comfortable shoes and prepare to wander.
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-2">Quote</p>
                        <p className="font-serif text-xl italic text-med-blue dark:text-blue-200">
                            "It is not the years in your life that count, but the life in your years."
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* 2. COLORS */}
        <section className="mb-20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">02. Color Palette</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-3">
                    <div className="h-24 w-full bg-med-blue rounded-2xl shadow-lg shadow-med-blue/20"></div>
                    <div>
                        <p className="font-bold text-med-blue dark:text-white">Med Blue</p>
                        <p className="text-xs text-gray-400">#1E4472</p>
                        <p className="text-[10px] text-gray-400 mt-1">Primary Brand</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-24 w-full bg-med-terracotta rounded-2xl shadow-lg shadow-med-terracotta/20"></div>
                    <div>
                        <p className="font-bold text-med-terracotta">Terracotta</p>
                        <p className="text-xs text-gray-400">#D67252</p>
                        <p className="text-[10px] text-gray-400 mt-1">Accent / Action</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-24 w-full bg-med-sand rounded-2xl border border-gray-200"></div>
                    <div>
                        <p className="font-bold text-gray-600 dark:text-gray-300">Sand</p>
                        <p className="text-xs text-gray-400">#F5F2EB</p>
                        <p className="text-[10px] text-gray-400 mt-1">Background</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-24 w-full bg-med-olive rounded-2xl shadow-lg shadow-med-olive/20"></div>
                    <div>
                        <p className="font-bold text-med-olive">Olive</p>
                        <p className="text-xs text-gray-400">#8A9A5B</p>
                        <p className="text-[10px] text-gray-400 mt-1">Success / Nature</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-24 w-full bg-med-lightBlue rounded-2xl"></div>
                    <div>
                        <p className="font-bold text-med-lightBlue">Light Blue</p>
                        <p className="text-xs text-gray-400">#AEC0D8</p>
                        <p className="text-[10px] text-gray-400 mt-1">Secondary</p>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. BUTTONS */}
        <section className="mb-20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">03. Actions</h2>
            
            <div className="flex flex-wrap gap-6 items-center">
                <Button variant="primary" size="lg">
                    Primary Button
                </Button>
                <Button variant="action" size="md">
                    Action Button
                </Button>
                <Button variant="secondary" size="md" icon={Calendar}>
                    Secondary
                </Button>
                <Button variant="outline" size="sm">
                    Outline
                </Button>
                <Button variant="ghost" size="sm">
                    Ghost Link
                </Button>
                <Button variant="success" size="md">
                    <Check size={16} className="mr-2"/> Success
                </Button>
                <button className="w-12 h-12 rounded-full bg-med-blue text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <Sparkles size={20} />
                </button>
            </div>
        </section>

        {/* 4. CARDS & SURFACES */}
        <section className="mb-20">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">04. Cards & Components</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Standard Card */}
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-med-blue/10 rounded-xl text-med-blue dark:text-blue-300">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl text-med-blue dark:text-white">Content Card</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtitle</p>
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                        Standard card container with <code>rounded-[2.5rem]</code> and subtle border. Used for features, lists, and details.
                    </p>
                    <div className="mt-auto">
                        <Button variant="secondary" fullWidth size="sm">View Details</Button>
                    </div>
                </div>

                {/* Interactive/Hover Card */}
                <div className="group bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                    <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-6 relative overflow-hidden">
                        <img 
                            src="https://images.unsplash.com/photo-1512403913063-e380f68288ce?q=80&w=800&auto=format&fit=crop" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Preview"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase text-med-blue shadow-sm">
                            New
                        </div>
                    </div>
                    <h3 className="font-serif text-2xl text-med-blue dark:text-white mb-2">Interactive Card</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Hover for elevation and image zoom effects.</p>
                    <div className="flex items-center gap-2 text-med-terracotta text-[10px] font-bold uppercase tracking-widest">
                        Explore <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Status/Notification Card */}
                <div className="space-y-4">
                    <div className="bg-med-blue text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <Wallet size={20} className="text-blue-200"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Total Estimate</span>
                            </div>
                            <p className="font-serif text-4xl font-bold">$1,250</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-l-4 border-l-med-olive border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-3">
                        <Check size={16} className="text-med-olive mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Success State</p>
                            <p className="text-[10px] text-gray-500">Operation completed successfully.</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>

    </div>
  );
};
