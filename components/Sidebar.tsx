
import React from 'react';
import { 
    LayoutDashboard, Ticket, Compass, Users, BookOpen, User, 
    ChevronLeft, ChevronRight, Sparkles, LogOut, Search,
    Moon, Sun, Receipt, Map as MapIcon, Calculator, Settings, Calendar, UserCircle2, Binoculars, HelpCircle
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { HubView } from './HubLayout';

interface SidebarProps {
  activeView: HubView;
  onViewChange: (view: HubView) => void;
  onOpenMap: () => void;
  onOpenEstimator: () => void;
  onOpenSearch: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  hideCollapse?: boolean;
}

interface NavItem {
    id?: HubView;
    icon: React.ElementType;
    label: string;
    color: string;
    action?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeView, 
    onViewChange, 
    onOpenMap,
    onOpenEstimator,
    onOpenSearch,
    isCollapsed, 
    onToggleCollapse, 
    hideCollapse 
}) => {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const sections: { label: string; items: NavItem[] }[] = [
    {
      label: 'Journey',
      items: [
        { id: 'rsvp', icon: Ticket, label: 'RSVP', color: 'text-med-terracotta' },
        { id: 'calendar', icon: Calendar, label: 'Agenda', color: 'text-med-terracotta' },
        { id: 'logistics', icon: Compass, label: 'Plan', color: 'text-med-olive' },
        { id: 'activities', icon: Binoculars, label: 'Explore', color: 'text-med-terracotta' },
      ]
    },
    {
      label: 'Community',
      items: [
        { id: 'registry', icon: Users, label: 'People', color: 'text-med-blue' },
        { id: 'profile', icon: UserCircle2, label: 'Profile', color: 'text-med-blue' },
      ]
    },
    {
      label: 'Tools',
      items: [
        { id: 'expenses', icon: Receipt, label: 'Ledger', color: 'text-med-terracotta' },
        { id: 'guide', icon: BookOpen, label: 'Guide', color: 'text-med-olive' },
        { id: 'faq', icon: HelpCircle, label: 'FAQ', color: 'text-med-blue' },
        { icon: Search, label: 'Search', color: 'text-med-terracotta', action: onOpenSearch },
        { icon: MapIcon, label: 'Map', color: 'text-med-blue', action: onOpenMap },
        { icon: Calculator, label: 'Estimator', color: 'text-med-olive', action: onOpenEstimator },
      ]
    }
  ];

  return (
    <aside 
      id="sidebar-menu"
      className={`hidden md:flex h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex-col z-50 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand */}
      <div className={`pt-8 pb-6 transition-all duration-500 ${isCollapsed ? 'px-4 items-center' : 'px-8'}`}>
          <div 
              onClick={() => onViewChange('rsvp')}
              className={`flex items-center gap-4 cursor-pointer group ${isCollapsed ? 'flex-col' : ''}`}
          >
            {isCollapsed ? (
              <img src="/assets/voyageurs-icon.png" alt="Voyageurs" className="w-10 h-10 object-contain drop-shadow-md" />
            ) : (
              <img src="/assets/voyageurs-logo.png" alt="Voyageurs" className="h-10 w-auto object-contain dark:brightness-90 animate-in fade-in slide-in-from-left-2 duration-700" />
            )}
          </div>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto scrollbar-hide py-4">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-4 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-2 opacity-80">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item, i) => {
                const isActive = item.id ? activeView === item.id : false;
                const handleClick = () => {
                    if (item.action) item.action();
                    else if (item.id) onViewChange(item.id);
                };

                return (
                  <button
                    key={`${idx}-${i}`}
                    id={item.id ? `nav-${item.id}` : undefined}
                    onClick={handleClick}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full group flex items-center gap-3 rounded-xl transition-all duration-300 relative ${
                      isCollapsed ? 'justify-center p-3' : 'px-4 py-3'
                    } ${
                      isActive 
                      ? 'bg-med-blue text-white shadow-lg shadow-med-blue/20 translate-x-1' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={20} className={isActive ? 'text-white' : `${item.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    {!isCollapsed && <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-6 border-t border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-black/20 ${isCollapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center py-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-med-blue dark:hover:text-blue-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!hideCollapse && (
                <button 
                    onClick={onToggleCollapse}
                    className="p-2.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-med-blue rounded-xl transition-all border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            )}
        </div>

        <div className={`p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 group ${isCollapsed ? 'justify-center p-2' : ''}`}>
             <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0 border border-gray-100 dark:border-gray-700" />
             {!isCollapsed && (
                 <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest truncate">Verified Guest</p>
                 </div>
             )}
             {!isCollapsed && (
                 <button onClick={logout} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" title="Sign Out">
                    <LogOut size={16} />
                 </button>
             )}
        </div>
      </div>
    </aside>
  );
};
