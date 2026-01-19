
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Bell, Ticket, Wallet, Sparkles, AlertCircle, UserCircle2, Check, ChevronDown } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';

interface HubNotificationsProps {
    isOpen?: boolean; 
    onClose?: () => void;
    onAction: (type: string) => void;
    pendingCount: number; 
}

export const HubNotifications: React.FC<HubNotificationsProps> = ({ onAction, pendingCount }) => {
    const [expanded, setExpanded] = useState(false);
    const { user } = useUser();
    const { items } = useTripPlanner();
    
    const [alerts, setAlerts] = useState<any[]>([]);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const generatedAlerts = [];
        
        if (user?.status === 'Pending') {
            generatedAlerts.push({
                id: 'rsvp-req',
                title: 'RSVP Required',
                message: 'Please confirm your attendance.',
                icon: Ticket,
                color: 'bg-amber-500',
                action: 'rsvp-alert'
            });
        }
        
        if (items.some(i => i.bookingStatus === 'planned')) {
             generatedAlerts.push({
                id: 'plan-pend',
                title: 'Itinerary Unsaved',
                message: `${items.filter(i => i.bookingStatus === 'planned').length} items need booking.`,
                icon: AlertCircle,
                color: 'bg-med-blue',
                action: 'planner-alert'
            });
        }

        // Add "System Nominal" message only if no urgent alerts exist AND it hasn't been dismissed explicitly
        if (generatedAlerts.length === 0) {
             generatedAlerts.push({
                id: 'welcome-msg',
                title: 'Status Nominal',
                message: 'All systems ready.',
                icon: Sparkles,
                color: 'bg-med-terracotta',
                action: null
            });
        }

        // Filter out any that have been dismissed by the user in this session
        const activeAlerts = generatedAlerts.filter(a => !dismissedIds.has(a.id));
        
        setAlerts(activeAlerts);
    }, [user, items, dismissedIds]);

    const handleDismiss = (id: string) => {
        setDismissedIds(prev => new Set(prev).add(id));
    };

    const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, id: string) => {
        if (info.offset.x > 50) { // Reduced swipe threshold for better responsiveness
            handleDismiss(id);
        }
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const handleAction = (alert: any) => {
        if (alert.action) onAction(alert.action);
        handleDismiss(alert.id);
    };

    if (alerts.length === 0) return null;

    // We only show the top one when collapsed
    const visibleAlerts = expanded ? alerts : [alerts[0]];
    const hiddenCount = alerts.length - 1;

    return (
        <div className="absolute top-24 right-0 left-0 md:left-auto md:right-4 z-[100] flex flex-col items-center md:items-end pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-2 w-[90vw] md:w-80">
                <AnimatePresence initial={false}>
                    {visibleAlerts.map((alert, index) => (
                        <motion.div
                            key={alert.id}
                            layout
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ 
                                opacity: 1, 
                                y: 0, 
                                scale: 1,
                                zIndex: 100 - index 
                            }}
                            exit={{ opacity: 0, x: 100 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, i) => handleSwipe(e, i, alert.id)}
                            onClick={toggleExpand}
                            className="relative cursor-pointer"
                        >
                            {/* Stacking Effect Cards (only on the first item if collapsed) */}
                            {!expanded && index === 0 && hiddenCount > 0 && (
                                <>
                                    <div className="absolute top-2 left-2 right-2 h-full bg-white/30 dark:bg-black/30 rounded-full blur-[2px] -z-10" />
                                    <div className="absolute top-3.5 left-4 right-4 h-full bg-white/10 dark:bg-black/10 rounded-full blur-[4px] -z-20" />
                                </>
                            )}

                            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-2xl border border-white/20 dark:border-gray-700 p-3 pr-4 rounded-full flex items-center gap-3 select-none">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 ${alert.color}`}>
                                    <alert.icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-med-blue dark:text-white truncate">{alert.title}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{alert.message}</p>
                                </div>
                                
                                {alert.action && expanded ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleAction(alert); }}
                                        className="p-2 bg-med-blue/10 hover:bg-med-blue text-med-blue hover:text-white rounded-full transition-colors"
                                    >
                                        <Check size={14} />
                                    </button>
                                ) : (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDismiss(alert.id); }}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-50 hover:opacity-100"
                                    >
                                        <X size={14} />
                                    </button>
                                )}

                                {!expanded && hiddenCount > 0 && (
                                    <div className="bg-med-terracotta text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        +{hiddenCount}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {expanded && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={toggleExpand}
                        className="self-center bg-black/20 hover:bg-black/40 text-white p-1 rounded-full backdrop-blur-md transition-colors"
                    >
                        <ChevronDown size={16} className="rotate-180" />
                    </motion.button>
                )}
            </div>
        </div>
    );
};
