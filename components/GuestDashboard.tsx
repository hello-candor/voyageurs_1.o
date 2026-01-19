
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
                {activeTab === 'overview' && <HubOverview onTabChange={handleTabChange} />}
                {activeTab === 'calendar' && <SeptemberCalendar />}
                {activeTab === 'rsvp' && <HubRSVP />}
                {activeTab === 'logistics' && <TripPlanner onTabChange={handleTabChange} />}
                {activeTab === 'activities' && <Activities />}
                {activeTab === 'expenses' && <ExpenseTracker />}
                {activeTab === 'registry' && <HubConnections />}
                {activeTab === 'guide' && <EssentialsToolkit />}
                {activeTab === 'profile' && <GuestProfile />}
            </div>
        )}
    </div>
  );
};
