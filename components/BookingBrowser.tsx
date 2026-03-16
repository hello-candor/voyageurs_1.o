import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, Plane, Train, Hotel, ExternalLink, Globe, RefreshCw, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { PlanItem, useTripPlanner } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from './Button';

interface BookingBrowserProps {
    item: PlanItem;
    url: string;
    onClose: () => void;
}

export const BookingBrowser: React.FC<BookingBrowserProps> = ({ item, url, onClose }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [bookingReference, setBookingReference] = useState('');
    const [iframeLoaded, setIframeLoaded] = useState(false);
    
    const { markAsBooked } = useTripPlanner();
    const { addNotification } = useNotification();
    const { saveCoordinatedGroup, user, updateTravelDetails } = useUser();

    // Reset state when item changes
    useEffect(() => {
        setIsConfirming(false);
        setIframeLoaded(false);
    }, [item.id]);

    const handleSuccess = () => {
        markAsBooked(item.id, bookingReference);
        addNotification(`Booking confirmed for ${item.name}!`, 'success');
        
        if (user) {
            const currentTravel = user.travelDetails || {
                arrivalDate: '2026-09-17',
                departureDate: '2026-09-20',
                arrivalMode: 'Plane',
                arrivalNumber: '',
                accommodation: '',
                hub: ''
            };

            if (item.category === 'flight') {
                const hub = item.name.includes('from') ? item.name.split('from ')[1] : currentTravel.hub;
                updateTravelDetails({
                    ...currentTravel,
                    arrivalMode: 'Plane',
                    arrivalNumber: bookingReference,
                    hub: hub || currentTravel.hub
                });
            } else if (item.category === 'train') {
                updateTravelDetails({
                    ...currentTravel,
                    arrivalMode: 'Train',
                    arrivalNumber: bookingReference
                });
            } else if (item.category === 'hotel') {
                updateTravelDetails({
                    ...currentTravel,
                    accommodation: item.name
                });
            }

            saveCoordinatedGroup({
                interestId: item.id,
                name: item.name,
                members: [user.email]
            });
        }
        
        onClose();
    };

    let hostname = 'Secure Site';
    try {
        if (url) hostname = new URL(url).hostname;
    } catch (e) {}

    return (
        <div className="fixed inset-0 z-[300] flex flex-col justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={onClose} />

            {/* Browser Card */}
            <div className="relative flex flex-col overflow-hidden bg-white dark:bg-gray-900 w-full h-[95vh] rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-500 border-t border-white/20">
                
                {/* Browser Tool Bar */}
                <div className="h-16 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 z-20">
                    <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-1.5">
                            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* URL Bar Simulation */}
                        <div className="flex-1 max-w-xl flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner group">
                            <Lock size={12} className="text-green-500 shrink-0" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 select-none">https://</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{hostname}</span>
                            <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <RefreshCw size={12} className="text-gray-400 cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button 
                            variant={isConfirming ? "secondary" : "primary"} 
                            size="sm" 
                            onClick={() => setIsConfirming(!isConfirming)}
                            className="hidden md:flex"
                        >
                            {isConfirming ? "Return to Browser" : "Confirm Booking"}
                        </Button>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white dark:bg-gray-700 text-gray-500 hover:text-med-blue rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all" title="Open in new window">
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 flex relative overflow-hidden bg-gray-50 dark:bg-gray-950">
                    
                    {/* The Iframe Browser */}
                    <div className={`flex-1 relative transition-all duration-500 ${isConfirming ? 'scale-95 opacity-40 blur-sm pointer-events-none' : 'scale-100 opacity-100'}`}>
                        {!iframeLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10">
                                <Spinner size={32} className="animate-spin text-med-terracotta mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Opening Secure Connection...</p>
                                <p className="text-[10px] text-gray-400 mt-2 italic px-8 text-center">Redirecting you to the official reservation system for {item.name}.</p>
                            </div>
                        )}
                        <iframe 
                            src={url} 
                            className="w-full h-full border-none"
                            onLoad={() => setIframeLoaded(true)}
                            title="Booking Site"
                        />
                    </div>

                    {/* Side/Overlay Confirmation Panel */}
                    <div className={`
                        absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 z-30 flex flex-col
                        transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
                        ${isConfirming ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                        <div className="p-8 flex-1 overflow-y-auto space-y-8 scrollbar-hide">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-3xl text-med-blue dark:text-white">Did you secure it?</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Finalize Selection</p>
                                </div>
                                <button onClick={() => setIsConfirming(false)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-med-terracotta">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-med-olive/5 border border-med-olive/20 p-6 rounded-[2rem] flex items-start gap-4">
                                <div className="p-2.5 bg-med-olive text-white rounded-xl shadow-lg shadow-med-olive/20">
                                    <ShieldCheck size={24} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                    Inputting your confirmation details here will update your profile for the Host and enable coordinated transport features.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {(item.category === 'flight' || item.category === 'train') && (
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 group-focus-within:text-med-terracotta transition-colors">
                                            {item.category === 'flight' ? 'Flight Number' : 'Train Number'}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                                {item.category === 'flight' ? <Plane size={18}/> : <Train size={18}/>}
                                            </div>
                                            <input 
                                                autoFocus={isConfirming}
                                                type="text" 
                                                placeholder={item.category === 'flight' ? "e.g. AF1234" : "e.g. TGV 6044"}
                                                value={bookingReference}
                                                onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-med-terracotta rounded-2xl outline-none font-mono font-bold text-lg text-med-blue dark:text-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                )}

                                {item.category === 'hotel' && (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm text-med-terracotta">
                                            <Hotel size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Setting Address</p>
                                            <p className="text-sm font-bold text-med-blue dark:text-white">{item.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 space-y-3">
                                    <Button 
                                        onClick={handleSuccess}
                                        variant="success"
                                        fullWidth
                                        size="lg"
                                        disabled={(item.category === 'flight' || item.category === 'train') && bookingReference.length < 3}
                                    >
                                        <CheckCircle size={18} className="mr-2" /> Confirm & Sync Profile
                                    </Button>
                                    <Button 
                                        onClick={() => setIsConfirming(false)}
                                        variant="ghost"
                                        fullWidth
                                    >
                                        I'm still browsing
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Summary Widget in Panel */}
                        <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
                            <div className="flex items-center gap-4">
                                <img src={item.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                                <div>
                                    <p className="text-xs font-bold text-med-blue dark:text-white truncate max-w-[200px]">{item.name}</p>
                                    <p className="text-[9px] text-gray-400 uppercase tracking-widest">{item.category}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-sm font-bold text-med-blue dark:text-white">${item.cost.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Mobile Action Button */}
                    {!isConfirming && (
                        <div className="md:hidden absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full px-6">
                            <Button 
                                onClick={() => setIsConfirming(true)}
                                variant="action" 
                                fullWidth
                                size="lg"
                                className="shadow-2xl"
                            >
                                <ShieldCheck size={20} className="mr-2" /> Confirm Booking
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Spinner = ({ size, className }: { size: number, className?: string }) => (
    <RefreshCw size={size} className={`${className} animate-spin`} />
);