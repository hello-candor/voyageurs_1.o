
import React from 'react';
import { GuestProfile } from './GuestProfile';
import { HubOverview } from './HubOverview';
import { HubConnections } from './HubConnections';
import { HubRSVP } from './HubRSVP';
import { TripPlanner } from './TripPlanner';
import { EssentialsToolkit } from './EssentialsToolkit';
import { SeptemberCalendar } from './SeptemberCalendar';
import { ExpenseTracker } from './ExpenseTracker';
import { Activities } from './Activities';
import { useUser } from '../context/UserContext';
import { HubTab } from './DashboardDrawer';

interface GuestDashboardProps {
  activeTab?: HubTab;
  setActiveTab?: (tab: HubTab) => void;
}

// Helper function to get initials from a name
const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return names[0][0];
};

export const GuestDashboard: React.FC<GuestDashboardProps> = ({ activeTab = 'overview', setActiveTab }) => {
  const { user } = useUser();

  const handleTabChange = (tabId: HubTab) => {
    if (setActiveTab) setActiveTab(tabId);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 h-full">
        {!user ? (
            <div className="max-w-md mx-auto py-16">
                <GuestProfile />
            </div>
        ) : (
            <div className="w-full space-y-8 h-full">
                {/* Desktop Background Items */}
                <div className="hidden lg:block">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center space-x-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-white">Next Steps</h3>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-white">Official Agenda</h3>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-white">The Destination</h3>
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && <HubOverview onTabChange={handleTabChange} />}
                {activeTab === 'calendar' && <SeptemberCalendar />}
                {activeTab === 'rsvp' && <HubRSVP />}
                {activeTab === 'logistics' && <TripPlanner onTabChange={handleTabChange} />}
                {activeTab === 'activities' && <Activities />}
                {activeTab === 'expenses' && <ExpenseTracker />}
                {activeTab === 'registry' && <HubConnections />}
                {activeTab === 'guide' && <EssentialsToolkit />}
                {activeTab === 'profile' && 
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                            <span className="text-lg font-semibold">{getInitials(user.name)}</span>
                        </div>
                        <GuestProfile />
                    </div>
                }
            </div>
        )}
    </div>
  );
};
