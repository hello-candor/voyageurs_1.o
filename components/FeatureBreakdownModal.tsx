
import React, { useState } from 'react';
import { X, Check, Minus, ChevronDown, Layout, Sparkles, DollarSign, Zap, Globe } from 'lucide-react';

interface FeatureBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureBreakdownModal: React.FC<FeatureBreakdownModalProps> = ({ isOpen, onClose }) => {
  const [openSections, setOpenSections] = useState<string[]>(['orchestration']);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const sections = [
    {
      id: 'orchestration',
      title: 'Orchestration',
      icon: Layout,
      features: [
        { name: 'Simultaneous Trips', leisure: '1 Trip', pro: '3 Trips', business: 'Unlimited' },
        { name: 'Visual Itinerary', leisure: true, pro: true, business: true },
        { name: 'Offline Access', leisure: false, pro: true, business: true }
      ]
    },
    {
      id: 'guest',
      title: 'Guest Journey',
      icon: Sparkles,
      features: [
        { name: 'Guest Capacity', leisure: '10', pro: '25', business: '100+' },
        { name: 'Céleste AI', leisure: 'Basic', pro: 'Advanced', business: 'Premium' },
        { name: 'Magic Links', leisure: true, pro: true, business: true }
      ]
    },
    {
      id: 'finance',
      title: 'Financials',
      icon: DollarSign,
      features: [
        { name: 'Expense Ledger', leisure: true, pro: true, business: true },
        { name: 'AI Receipt Scanning', leisure: false, pro: true, business: true }
      ]
    },
    {
      id: 'logistics',
      title: 'Logistics',
      icon: Zap,
      features: [
        { name: 'Flight Tracking', leisure: false, pro: true, business: true },
        { name: 'Push Broadcasts', leisure: false, pro: false, business: true }
      ]
    }
  ];

  const renderValue = (val: string | boolean, isPro: boolean) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check size={16} className={`mx-auto ${isPro ? 'text-med-terracotta' : 'text-med-blue/50'}`} strokeWidth={3} />
      ) : (
        <Minus size={16} className="mx-auto text-gray-200" />
      );
    }
    return <span className={`text-[10px] font-bold uppercase ${isPro ? 'text-med-terracotta' : 'text-gray-500'}`}>{val}</span>;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full max-w-[1000px] bg-[#FDFBF7] dark:bg-gray-900 shadow-2xl flex flex-col rounded-[2.5rem] overflow-hidden border border-white/10 max-h-[85vh]">
            <header className="px-10 py-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-med-blue text-white rounded-xl flex items-center justify-center shadow-lg"><Globe size={20} /></div>
                    <div>
                        <h2 className="font-heading text-2xl text-med-blue dark:text-white leading-none">Feature Matrix</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Capabilities Comparison</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-med-terracotta rounded-full transition-all"><X size={20}/></button>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 bg-med-sand dark:bg-gray-950 hide-scrollbar space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-2 px-4">
                    <div className="col-span-6"></div>
                    <div className="col-span-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Explorer</div>
                    <div className="col-span-2 text-center text-[10px] font-bold uppercase tracking-widest text-med-terracotta">Connoisseur</div>
                    <div className="col-span-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Artisan</div>
                </div>

                {sections.map(section => (
                    <div key={section.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <button onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-med-blue/5 rounded-xl text-med-blue dark:text-blue-300"><section.icon size={20} /></div>
                                <h3 className="font-heading text-xl text-med-blue dark:text-white">{section.title}</h3>
                            </div>
                            <ChevronDown size={20} className={`text-gray-300 transition-transform ${openSections.includes(section.id) ? 'rotate-180' : ''}`} />
                        </button>
                        {openSections.includes(section.id) && (
                            <div className="px-6 pb-6 space-y-1 animate-in slide-in-from-top-2">
                                {section.features.map((f, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 items-center py-4 border-t border-gray-50 dark:border-gray-800">
                                        <div className="col-span-6 text-sm font-bold text-med-blue dark:text-white">{f.name}</div>
                                        <div className="col-span-2 text-center">{renderValue(f.leisure, false)}</div>
                                        <div className="col-span-2 text-center">{renderValue(f.pro, true)}</div>
                                        <div className="col-span-2 text-center">{renderValue(f.business, false)}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
