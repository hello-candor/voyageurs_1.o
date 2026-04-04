
import React, { useState, useEffect } from 'react';
import { X, LayoutDashboard, Compass, Users, Ticket, Settings, Sparkles, BookOpen, LogOut, ChevronRight, UserCircle2, Calendar, Receipt, Map as MapIcon, Calculator, MessageCircle, Binoculars, HelpCircle } from 'lucide-react';
import { GuestDashboard } from './GuestDashboard';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useChat } from '../context/ChatContext';
import { useAppConfig } from '../context/AppConfigContext';
import { HubView } from './HubLayout';

interface DashboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HubView;
  onOpenMap?: () => void;
  onOpenEstimator?: () => void;
}

// HubTab is now aliased to HubView for consistency across files
export type HubTab = HubView;

export const DashboardDrawer: React.FC<DashboardDrawerProps> = ({ isOpen, onClose, initialTab, onOpenMap, onOpenEstimator }) => {
  const [activeTab, setActiveTab] = useState<HubTab>('rsvp');
  const { user, logout } = useUser();
  const { items } = useTripPlanner();
  const { unreadTotal } = useChat();
  const { config } = useAppConfig();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialTab) {
        setActiveTab(initialTab);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isModuleEnabled = (id: string) => {
      const mod = config.modules.find(m => m.id === id);
      return mod ? mod.isEnabled : true;
  };

  const navItems: { id?: HubTab; icon: any; label: string; badge?: number; group: 'experience' | 'logistics' | 'community' | 'tools'; action?: () => void }[] = [
    { id: 'rsvp', icon: Ticket, label: 'RSVP Status', group: 'experience' },
    { id: 'guide', icon: BookOpen, label: 'Voyageur Guide', group: 'experience' },
    { id: 'logistics', icon: Compass, label: 'Planning Hub', badge: items.length > 0 ? items.length : undefined, group: 'experience' },
    { id: 'activities', icon: Binoculars, label: 'Experiences', group: 'experience' },
    { id: 'calendar', icon: Calendar, label: 'The Calendar', group: 'experience' },
    
    { id: 'registry', icon: Users, label: 'Guest Registry', group: 'community' },
    { id: 'profile', icon: UserCircle2, label: 'My Profile', group: 'community' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: unreadTotal > 0 ? unreadTotal : undefined, group: 'community' },

    { id: 'expenses', icon: Receipt, label: 'Shared Ledger', group: 'logistics' },
    { icon: Calculator, label: 'Estimator', group: 'tools', action: onOpenEstimator },
  ];

  // Filter items
  const filteredNavItems = navItems.filter(item => {
      // Profile is always core
      if (item.id === 'profile') return true;
      // Tools without ID (like Estimator) check their group mapping manually or are always enabled if group is
      if (!item.id && item.label === 'Estimator') return isModuleEnabled('logistics');
      return item.id ? isModuleEnabled(item.id) : true;
  });

  const isUnlocked = !!user;

  return (
    <div className="fixed inset-0 z-[200] flex animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-med-blue/40 backdrop-blur-md pointer-events-none" />

      <div className="relative w-full h-full bg-med-sand dark:bg-gray-950 flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in slide-in-from-right-8 duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
        
        {isUnlocked && (
            <aside className="hidden md:flex w-80 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col shrink-0 z-20 relative overflow-hidden animate-in slide-in-from-left-4 duration-500">
                <div className="p-8 pb-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-med-blue text-white rounded-2xl flex items-center justify-center shadow-xl shadow-med-blue/20 rotate-3 transition-transform hover:rotate-0 duration-500 cursor-pointer shrink-0"
                        >
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="font-serif text-2xl text-med-blue dark:text-white leading-none">September 18-20</h2>
                            <p className="text-[10px] text-med-terracotta uppercase tracking-[0.3em] font-bold mt-1"></p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-3 shadow-sm">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700" />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-med-blue dark:text-white truncate">{user.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Verified Voyageur</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-8 overflow-y-auto scrollbar-hide">
                    <div>
                        <p className="px-5 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">The Experience</p>
                        <div className="space-y-1">
                            {filteredNavItems.filter(i => i.group === 'experience').map((item) => (
                                <button
                                    key={item.id || item.label}
                                    onClick={() => item.action ? item.action() : (item.id && setActiveTab(item.id))}
                                    className={`w-full group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                                        item.id && activeTab === item.id 
                                        ? 'bg-med-blue text-white shadow-xl shadow-med-blue/20 translate-x-1' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <item.icon size={18} className={item.id && activeTab === item.id ? 'text-white scale-110' : 'text-med-terracotta opacity-60 group-hover:opacity-100'} />
                                    <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                                    {item.badge && (
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-med-terracotta text-white'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-5 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">Community</p>
                        <div className="space-y-1">
                            {filteredNavItems.filter(i => i.group === 'community').map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => item.id && setActiveTab(item.id)}
                                    className={`w-full group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative ${
                                        item.id && activeTab === item.id 
                                        ? 'bg-med-blue text-white shadow-xl translate-x-1' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <item.icon size={18} className={item.id && activeTab === item.id ? 'text-white scale-110' : 'text-med-terracotta opacity-60 group-hover:opacity-100'} />
                                    <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                                    {item.badge && (
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold ${activeTab === item.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-5 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">Tools & Reference</p>
                        <div className="space-y-1">
                            {filteredNavItems.filter(i => i.group === 'logistics' || i.group === 'tools').map((item) => (
                                <button
                                    key={item.id || item.label}
                                    onClick={() => item.action ? item.action() : (item.id && setActiveTab(item.id))}
                                    className={`w-full group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 relative ${
                                        item.id && activeTab === item.id 
                                        ? 'bg-med-blue text-white shadow-xl translate-x-1' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <item.icon size={18} className={item.id && activeTab === item.id ? 'text-white scale-110' : 'text-med-terracotta opacity-60 group-hover:opacity-100'} />
                                    <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <button 
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-med-blue rounded-2xl transition-all text-[10px] font-bold uppercase tracking-widest border border-transparent"
                    >
                        <X size={16} /> Close Hub
                    </button>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-red-50/50 dark:bg-red-900/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all text-[10px] font-bold uppercase tracking-widest border border-transparent group"
                    >
                        <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" /> Sign Out
                    </button>
                </div>
            </aside>
        )}

        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            <header className="md:hidden flex items-center justify-between p-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-med-blue text-white rounded-xl flex items-center justify-center rotate-3">
                        <Sparkles size={18} />
                    </div>
                    <h2 className="font-serif text-xl text-med-blue dark:text-white">{isUnlocked ? "September 18-20" : 'Setup'}</h2>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400"><X size={24} /></button>
            </header>

            <main className="flex-1 overflow-y-auto bg-med-sand dark:bg-gray-950 p-4 md:p-12 pb-32 md:pb-12 scroll-smooth">
                <div className={`max-w-6xl mx-auto w-full transition-all duration-700 ${!isUnlocked ? 'flex flex-col items-center justify-center min-h-[70vh]' : ''}`}>
                    <GuestDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </main>

            {isUnlocked && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 px-2 py-3 flex justify-around items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-4 duration-500">
                    {filteredNavItems.slice(0,5).map(item => (
                        <button key={item.label} onClick={() => item.action ? item.action() : (item.id && setActiveTab(item.id))} className={`flex flex-col items-center gap-1.5 p-2 ${item.id && activeTab === item.id ? 'text-med-terracotta' : 'text-gray-400'}`}>
                            <div className="relative">
                                <item.icon size={20} />
                                {item.badge && item.badge > 0 && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />}
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>

        <div className="hidden md:flex absolute top-6 right-8 z-50">
             <button 
                onClick={onClose}
                className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur hover:bg-white dark:hover:bg-gray-700 text-gray-50 dark:text-gray-300 rounded-full transition-all shadow-xl border border-white/20 active:scale-95 group"
                aria-label="Close Hub"
             >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
             </button>
        </div>
      </div>
    </div>
  );
};
