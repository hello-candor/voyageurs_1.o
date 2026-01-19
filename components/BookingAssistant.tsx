
import React, { useState } from 'react';
import { Check, Wallet, Trash2, ArrowRight, Plane, Train } from 'lucide-react';
import { useTripPlanner, PlanItem } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { BookingBrowser } from './BookingBrowser';
import { getPlaceDetails } from '../services/geminiService';
import { Button } from './Button';
// Import the missing EmptyState component
import { EmptyState } from './EmptyState';
// Fix: Import 'useNotification' hook to access 'addNotification'.
import { useNotification } from '../context/NotificationContext';

export const BookingAssistant: React.FC = () => {
    const { items, travelers, durationDays, updateSettings, totalCost, removeFromPlan } = useTripPlanner();
    const { user } = useUser();
    const [selectedBookingItem, setSelectedBookingItem] = useState<{ item: PlanItem, url: string } | null>(null);
    const { addNotification } = useNotification();

    const handleBookClick = (item: PlanItem, url: string | undefined) => {
        if (!url) {
            addNotification("No booking link available for this item.", "error");
            return;
        }
        setSelectedBookingItem({ item, url });
    };

    const bookedCount = items.filter(i => i.bookingStatus === 'booked').length;
    const progress = items.length > 0 ? (bookedCount / items.length) * 100 : 0;

    return (
        <div className="animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex-1 p-8 md:p-14 overflow-y-auto">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    {/* Left Column: Summary & Context */}
                    <div className="lg:w-1/3 space-y-8">
                            <div className="lg:sticky lg:top-12 space-y-8">
                            {/* Summary Card */}
                            <div>
                                <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Reservations</span>
                                <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                                    Booking<br />
                                    <span className="italic text-med-terracotta">Status</span>
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                                    "Secure your selections here. Our in-app browser handles the connection so you can sync details instantly."
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-med-blue/10 rounded-xl text-med-blue dark:text-blue-300">
                                            <Wallet size={18} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Est. Total</span>
                                    </div>
                                    <span className="px-3 py-1 bg-med-olive/10 text-med-olive text-[9px] font-bold uppercase tracking-widest rounded-full">
                                        {bookedCount} / {items.length} Secured
                                    </span>
                                </div>
                                <p className="text-4xl font-serif font-bold text-med-blue dark:text-white mb-4">
                                    ${totalCost.toLocaleString()}
                                </p>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-med-terracotta transition-all duration-1000" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            {/* Party Settings */}
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                                    <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Party Size</span>
                                    <select 
                                        value={travelers} 
                                        onChange={(e) => updateSettings(parseInt(e.target.value), durationDays)}
                                        className="bg-transparent text-med-blue dark:text-white font-bold text-xs outline-none text-right cursor-pointer"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guests</option>)}
                                    </select>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                                    <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</span>
                                    <select 
                                        value={durationDays} 
                                        onChange={(e) => updateSettings(travelers, parseInt(e.target.value))}
                                        className="bg-transparent text-med-blue dark:text-white font-bold text-xs outline-none text-right cursor-pointer"
                                    >
                                        {[2,3,4,5,6,7,8,10,14].map(n => <option key={n} value={n}>{n} Days</option>)}
                                    </select>
                                    </div>
                            </div>
                            </div>
                    </div>

                    {/* Right Column: List */}
                    <div className="lg:w-2/3 space-y-6">
                        {items.length === 0 ? (
                            <EmptyState 
                                icon={Wallet}
                                title="Your plan is empty"
                                message="Add travel, lodging, or activities from the exploration tabs to begin booking."
                            />
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="group bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.bookingStatus === 'booked' ? 'bg-med-olive' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-med-blue transition-colors'}`} />
                                    
                                    <div className="flex flex-col sm:flex-row items-center gap-6 pl-4">
                                        {/* Image */}
                                        <div className="relative w-full sm:w-24 h-24 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-2xl shadow-md" />
                                            {item.bookingStatus === 'booked' && (
                                                <div className="absolute inset-0 bg-med-olive/80 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                                                    <Check size={24} className="text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                <h4 className="font-serif text-xl text-med-blue dark:text-white truncate">{item.name}</h4>
                                                <span className="font-bold text-lg text-med-blue dark:text-white">${item.cost.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">{item.category}</span>
                                                <span className="truncate max-w-[200px]">{item.details}</span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <div className="shrink-0 w-full sm:w-auto flex items-center gap-2">
                                            {item.bookingStatus === 'planned' ? (
                                                <>
                                                    <Button 
                                                        onClick={() => removeFromPlan(item.id)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-10 h-10 text-gray-400 hover:text-red-500"
                                                        title="Remove from plan"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                    {item.secondaryBookingUrl ? (
                                                        <div className="flex gap-2 flex-1">
                                                            <Button
                                                                onClick={() => handleBookClick(item, item.bookingUrl)}
                                                                variant="primary"
                                                                size="sm"
                                                                className="flex-1"
                                                            >
                                                                <Plane size={14} className="mr-2" /> Flight
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleBookClick(item, item.secondaryBookingUrl)}
                                                                variant="secondary"
                                                                size="sm"
                                                                className="flex-1"
                                                            >
                                                                <Train size={14} className="mr-2" /> Train
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={() => handleBookClick(item, item.bookingUrl)}
                                                            variant="primary"
                                                            size="sm"
                                                            className="flex-1"
                                                        >
                                                            Book Now <ArrowRight size={14} className="ml-2" />
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full sm:w-auto px-6 py-3 border border-med-olive/30 text-med-olive bg-med-olive/5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                    Secured
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            
            {selectedBookingItem && (
                <BookingBrowser 
                    item={selectedBookingItem.item} 
                    url={selectedBookingItem.url} 
                    onClose={() => setSelectedBookingItem(null)} 
                />
            )}
        </div>
    );
};
