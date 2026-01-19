
import React, { useMemo } from 'react';
import { Bell, Ticket, AlertCircle, MessageCircle, ChevronRight, Sparkles, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useChat } from '../context/ChatContext';
import { HubView } from './HubLayout';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: HubView) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, onNavigate }) => {
    const { user } = useUser();
    const { items } = useTripPlanner();
    const { threads } = useChat();

    // 1. Calculate Alerts
    const alerts = useMemo(() => {
        const list = [];

        // Critical: RSVP (Encouraging style)
        if (user?.status === 'Pending') {
            list.push({
                id: 'rsvp-req',
                priority: 'critical',
                title: "What's Next?",
                message: 'Confirm your attendance.',
                icon: Ticket,
                actionLabel: 'Complete RSVP',
                target: 'rsvp' as HubView,
                color: 'text-med-terracotta',
                bg: 'bg-med-terracotta/10'
            });
        }

        // Critical: Logistics (If confirmed but missing arrival)
        if (user?.status === 'Confirmed' && !user.travelDetails?.arrivalDate) {
            list.push({
                id: 'logistics-req',
                priority: 'critical',
                title: 'Arrival Details',
                message: 'Provide arrival info for shuttles.',
                icon: Ticket, // Using generic Ticket/Plane icon substitute
                actionLabel: 'Add Logistics',
                target: 'profile' as HubView,
                color: 'text-med-blue',
                bg: 'bg-med-blue/10'
            });
        }

        // Warning: Unsaved Trip Items
        const unsavedCount = items.filter(i => i.bookingStatus === 'planned').length;
        if (unsavedCount > 0) {
            list.push({
                id: 'unsaved-items',
                priority: 'warning',
                title: 'Unbooked Items',
                message: `${unsavedCount} items in plan not secured.`,
                icon: AlertCircle,
                actionLabel: 'Review Plan',
                target: 'logistics' as HubView,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10'
            });
        }

        // Info: Unread Messages
        const unreadThreads = threads.filter(t => 
            user && t.participants.includes(user.email) && 
            t.messages.some(m => !m.readBy.includes(user.email) && m.senderId !== user.email)
        );

        if (unreadThreads.length > 0) {
            list.push({
                id: 'unread-msgs',
                priority: 'info',
                title: 'New Messages',
                message: `${unreadThreads.length} unread conversation(s).`,
                icon: MessageCircle,
                actionLabel: 'Open Chat',
                target: 'messages' as HubView,
                color: 'text-green-400',
                bg: 'bg-green-500/10'
            });
        }

        return list;
    }, [user, items, threads]);

    const handleAction = (target: HubView) => {
        onNavigate(target);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-0 mt-4 w-72 md:w-80 bg-slate-950/95 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 z-[120] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell size={18} className="text-white" />
                        {alerts.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-med-terracotta rounded-full animate-pulse" />}
                    </div>
                    <h3 className="font-serif text-lg text-white">Notifications</h3>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                        <Check size={24} className="text-white mb-2" />
                        <p className="text-xs text-white">You're all caught up.</p>
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div 
                            key={alert.id} 
                            onClick={() => handleAction(alert.target)}
                            className="group flex flex-col gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-xl shrink-0 ${alert.bg} ${alert.color}`}>
                                    <alert.icon size={16} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-white leading-tight">{alert.title}</h4>
                                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{alert.message}</p>
                                </div>
                            </div>
                            {alert.actionLabel && (
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-med-terracotta transition-colors self-end">
                                    {alert.actionLabel} <ChevronRight size={10} />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer Tip */}
            {alerts.length === 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                        <Sparkles size={10} />
                        <span>Tip: Check the 'Agenda' for updates.</span>
                    </div>
                </div>
            )}
        </div>
    );
};
