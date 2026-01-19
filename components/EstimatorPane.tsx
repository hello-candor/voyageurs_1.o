
import React, { useState } from 'react';
import { X, Calculator, Check, Wallet, ArrowRight, Users, Calendar } from 'lucide-react';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';

interface EstimatorPaneProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EstimatorPane: React.FC<EstimatorPaneProps> = ({ isOpen, onClose }) => {
    const { items, travelers, durationDays, updateSettings } = useTripPlanner();
    const { user } = useUser();
    const [isSharing, setIsSharing] = useState(false);

    if (!isOpen) return null;

    // Filter items not in fixed cost categories for the "Wishlist" calculation
    const discoveryItems = items.filter(i => !['flight', 'train', 'hotel'].includes(i.category));
  
    // Cost Calculations
    const activityCost = discoveryItems.reduce((sum, i) => sum + i.cost, 0);
    const hotelCost = (user?.officialItinerary?.hotel?.baseRate || 0) * durationDays * Math.ceil(travelers / 2);
    const transportCost = (user?.officialItinerary?.transport?.baseCost || 0) * travelers;
    const totalFullEstimate = activityCost + hotelCost + transportCost;

    const handleShare = () => {
        const data = { items: discoveryItems, travelers, durationDays };
        try {
            const json = JSON.stringify(data);
            const encoded = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) { return String.fromCharCode(parseInt(p1, 16)); }));
            const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
            navigator.clipboard.writeText(url).then(() => {
                setIsSharing(true);
                setTimeout(() => setIsSharing(false), 2000);
            });
        } catch (e) { console.error("Error sharing plan", e); }
    };

    return (
        <>
            <div className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={onClose} />
            <div className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] z-[210] bg-white dark:bg-gray-950 shadow-2xl border-l border-white/20 flex flex-col animate-in slide-in-from-right duration-500 cubic-bezier(0.16, 1, 0.3, 1)">
                
                <header className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-med-blue text-white rounded-2xl shadow-xl">
                            <Calculator size={20} />
                        </div>
                        <div>
                            <h3 className="font-serif text-2xl text-med-blue dark:text-white">Estimator</h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Live Budgeting</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-300 hover:text-med-terracotta transition-colors">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    
                    {/* Settings Controls */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                <Users size={12} /> Party Size
                            </label>
                            <select 
                                value={travelers} 
                                onChange={(e) => updateSettings(parseInt(e.target.value), durationDays)} 
                                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl font-bold text-med-blue dark:text-white text-sm outline-none border border-transparent focus:border-med-terracotta/20 cursor-pointer transition-all"
                            >
                                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Voyageur' : 'Voyageurs'}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                                <Calendar size={12} /> Duration
                            </label>
                            <select 
                                value={durationDays} 
                                onChange={(e) => updateSettings(travelers, parseInt(e.target.value))} 
                                className="w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-xl font-bold text-med-blue dark:text-white text-sm outline-none border border-transparent focus:border-med-terracotta/20 cursor-pointer transition-all"
                            >
                                {[2,3,4,5,6,7,10,14].map(n => <option key={n} value={n}>{n} Days</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Main Cost Card */}
                    <div className="bg-med-blue text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-med-blue via-med-blue/90 to-med-blue/40" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
                        
                        <div className="relative z-10 text-center space-y-2 py-4">
                            <p className="text-blue-200 text-[9px] font-bold uppercase tracking-[0.4em]">Total Estimate</p>
                            <p className="font-serif text-5xl md:text-6xl font-bold leading-none tracking-tight">${totalFullEstimate.toLocaleString()}</p>
                            <p className="text-[10px] text-blue-200/60 font-medium">Approx. per person: ${Math.round(totalFullEstimate/travelers).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Cost Breakdown</h4>
                        
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-med-olive shadow-sm"><Wallet size={16} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-med-blue dark:text-white uppercase tracking-wider">Essentials</p>
                                        <p className="text-[9px] text-gray-400">Hotel & Transport</p>
                                    </div>
                                </div>
                                <span className="font-serif text-lg text-med-blue dark:text-white font-bold">${(hotelCost + transportCost).toLocaleString()}</span>
                            </div>
                            
                            <div className="h-px bg-gray-200 dark:bg-gray-800" />

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-med-terracotta shadow-sm"><Check size={16} /></div>
                                    <div>
                                        <p className="text-xs font-bold text-med-blue dark:text-white uppercase tracking-wider">Experiences</p>
                                        <p className="text-[9px] text-gray-400">Activities & Dining</p>
                                    </div>
                                </div>
                                <span className="font-serif text-lg text-med-blue dark:text-white font-bold">${activityCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>

                <footer className="p-8 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <button 
                        onClick={handleShare} 
                        className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 ${
                            isSharing ? 'bg-med-olive text-white' : 'bg-white text-med-blue hover:bg-med-terracotta hover:text-white'
                        }`}
                    >
                        {isSharing ? <><Check size={14} /> Link Copied</> : 'Share Estimate'}
                    </button>
                    <p className="text-[9px] text-center text-gray-400 italic">Estimates exclude flights unless selected in Planner.</p>
                </footer>
            </div>
        </>
    );
};
