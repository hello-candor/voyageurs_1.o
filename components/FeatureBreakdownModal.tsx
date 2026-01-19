
import React, { useState } from 'react';
import { X, Check, Minus, ChevronDown, ChevronUp, Layout, Users, Zap, DollarSign, Globe, Shield, Sparkles, Info } from 'lucide-react';
import { Button } from './Button';

interface FeatureBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureRow {
  name: string;
  desc: string;
  leisure: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  features: FeatureRow[];
}

export const FeatureBreakdownModal: React.FC<FeatureBreakdownModalProps> = ({ isOpen, onClose }) => {
  const [openSections, setOpenSections] = useState<string[]>(['orchestration', 'guest-journey']);

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const sections: Section[] = [
    {
      id: 'orchestration',
      title: 'Orchestration & Planning',
      icon: Layout,
      features: [
        { name: 'Simultaneous Trips', desc: 'The number of active event workspaces you can manage at once.', leisure: '1 Trip', pro: '3 Trips', business: 'Unlimited' },
        { name: 'Visual Itinerary Builder', desc: 'Drag-and-drop interface for organizing events and timings.', leisure: true, pro: true, business: true },
        { name: 'Unlimited Attachments', desc: 'Link PDF tickets and notes directly to itinerary cards.', leisure: true, pro: true, business: true },
        { name: 'Itinerary Exports', desc: 'Export plans to PDF or sync with external calendar apps.', leisure: false, pro: true, business: true },
        { name: 'Offline Access', desc: 'Access maps and plans without a cellular connection.', leisure: false, pro: true, business: true }
      ]
    },
    {
      id: 'guest-journey',
      title: 'The Guest Journey',
      icon: Sparkles,
      features: [
        { name: 'Guest Capacity', desc: 'Maximum number of confirmed guests per trip.', leisure: 'Up to 10', pro: 'Up to 25', business: 'Up to 100' },
        { name: 'Céleste AI Concierge', desc: 'Gemini-powered contextual AI for guest questions.', leisure: 'Basic', pro: 'Advanced', business: 'Premium' },
        { name: 'Guest Matchmaker', desc: 'Social catalyst tools suggest connections based on interests.', leisure: true, pro: true, business: true },
        { name: 'Interactive Atlas', desc: 'Custom map points and neighborhood discovery guides.', leisure: true, pro: true, business: true },
        { name: 'Magic Links', desc: 'No-login entry for guests via encrypted unique links.', leisure: true, pro: true, business: true }
      ]
    },
    {
      id: 'logistics',
      title: 'Logistics & Intelligence',
      icon: Zap,
      features: [
        { name: 'Flight/Train Tracking', desc: 'Automated status updates for guest arrivals.', leisure: false, pro: true, business: true },
        { name: 'Real-time Arrival Alerts', desc: 'Push notifications when guests touch down or arrive.', leisure: false, pro: true, business: true },
        { name: '2-Way Calendar Sync', desc: 'Sync itinerary changes directly to guest phone calendars.', leisure: false, pro: true, business: true },
        { name: 'Custom Push Broadcasts', desc: 'Send urgent alerts or reminders to all guests at once.', leisure: false, pro: false, business: true }
      ]
    },
    {
      id: 'financials',
      title: 'Financial Governance',
      icon: DollarSign,
      features: [
        { name: 'Budget Estimator', desc: 'Predict costs for flights, hotels, and group meals.', leisure: true, pro: true, business: true },
        { name: 'Shared Expense Ledger', desc: 'Built-in "who owes who" tracking for group costs.', leisure: true, pro: true, business: true },
        { name: 'AI Receipt Scanning', desc: 'Snap photos of receipts to auto-itemize and split costs.', leisure: false, pro: true, business: true },
        { name: 'Automated Reconciliation', desc: 'One-click debt settlement calculation for groups.', leisure: false, pro: true, business: true }
      ]
    },
    {
      id: 'branding',
      title: 'Agency & Personal Branding',
      icon: Shield,
      features: [
        { name: 'Custom Event Domain', desc: 'Host your trip on a private URL (e.g. our-trip.com).', leisure: false, pro: false, business: true },
        { name: 'White-Label Portal', desc: 'Remove Voyageurs branding for a bespoke host look.', leisure: false, pro: false, business: true },
        { name: 'Team Collaboration', desc: 'Add secondary hosts with specific editor permissions.', leisure: false, pro: false, business: true },
        { name: 'Analytics Dashboard', desc: 'Insights on engagement and logistics completion.', leisure: false, pro: false, business: true }
      ]
    }
  ];

  const renderValue = (val: string | boolean, isPro: boolean = false) => {
    if (typeof val === 'boolean') {
      return val ? (
        <div className={`flex items-center justify-center w-6 h-6 rounded-full mx-auto ${isPro ? 'bg-med-terracotta/20 text-med-terracotta' : 'bg-med-blue/10 text-med-blue'}`}>
          <Check size={14} strokeWidth={3} />
        </div>
      ) : (
        <div className="flex items-center justify-center w-6 h-6 rounded-full mx-auto opacity-10">
          <Minus size={14} />
        </div>
      );
    }
    return <span className={`text-[10px] font-bold uppercase tracking-tight ${isPro ? 'text-med-terracotta' : 'text-gray-500 dark:text-gray-400'}`}>{val}</span>;
  };

  const renderCell = (rowName: string, tier: 'leisure' | 'pro' | 'business', value: string | boolean) => {
    let tooltipContent = '';
    
    // Custom logic for requested tooltips
    if (rowName === 'Simultaneous Trips') {
      if (tier === 'leisure') tooltipContent = 'Upgrade to Connoisseur';
      if (tier === 'pro') tooltipContent = 'Manage an additional 3 trips for just $10 per month.';
    }
    
    if (rowName === 'Guest Capacity') {
      if (tier === 'leisure') tooltipContent = 'Upgrade to Connoisseur';
      if (tier === 'pro') tooltipContent = 'Add 10 more guests for a one-time fee of $10.';
      if (tier === 'business') tooltipContent = 'Add more for as little as $10 per trip.';
    }

    const rendered = renderValue(value, tier === 'pro');

    if (tooltipContent) {
      return (
        <div className="relative group/tip flex items-center justify-center gap-1.5 cursor-help w-full">
          {rendered}
          <div className="text-gray-300 dark:text-gray-600 group-hover/tip:text-med-terracotta transition-colors">
             <Info size={10} strokeWidth={2.5} />
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-wide rounded-lg opacity-0 group-hover/tip:opacity-100 transition-all pointer-events-none z-[100] shadow-2xl border border-white/10 -translate-y-1 group-hover/tip:translate-y-0 flex items-center justify-center gap-2 w-40 whitespace-normal text-center leading-relaxed">
            {tooltipContent}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      );
    }
    
    return rendered;
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-end md:items-center justify-center isolate p-0 md:p-6 lg:p-12">
      <div 
        className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      <div className="relative w-full h-full max-w-[1400px] bg-[#FDFBF7] dark:bg-gray-950 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-500 ease-out md:rounded-[3rem] overflow-hidden border border-white/10">
        
        {/* Sticky Header */}
        <header className="px-8 md:px-12 py-8 bg-white dark:bg-gray-900 z-50 shrink-0 border-b border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-med-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-med-blue/20">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-none">Feature Breakdown</h2>
                <p className="text-xs text-gray-500 uppercase tracking-[0.3em] font-bold mt-2">Capabilities Comparison</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-med-terracotta hover:bg-white dark:hover:bg-gray-700 rounded-full transition-all border border-gray-100 dark:border-gray-700"
            >
              <X size={24}/>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 bg-med-sand dark:bg-gray-950 scrollbar-hide">
          <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {sections.map(section => (
              <div 
                key={section.id} 
                className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-all duration-500"
              >
                {/* Section Toggle */}
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-med-blue/5 dark:bg-blue-900/10 rounded-2xl text-med-blue dark:text-blue-300">
                      <section.icon size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-2xl text-med-blue dark:text-white">{section.title}</h3>
                  </div>
                  {openSections.includes(section.id) ? (
                    <ChevronUp className="text-gray-300" />
                  ) : (
                    <ChevronDown className="text-gray-300" />
                  )}
                </button>

                {/* Section Content */}
                {openSections.includes(section.id) && (
                  <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                    
                    {/* Tier Labels Inside Section */}
                    <div className="grid grid-cols-12 gap-4 items-end mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="col-span-6"></div> 
                        <div className="col-span-2 text-center flex flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Explorer</span>
                            <span className="text-xs font-serif italic text-med-blue dark:text-white">Leisure</span>
                        </div>
                        <div className="col-span-2 text-center flex flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-med-terracotta mb-1">Connoisseur</span>
                            <span className="text-xs font-serif italic text-med-terracotta">Professional</span>
                        </div>
                        <div className="col-span-2 text-center flex flex-col items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Artisan</span>
                            <span className="text-xs font-serif italic text-med-blue dark:text-white">Business</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                      {section.features.map((row, i) => (
                        <div key={i} className="grid grid-cols-12 gap-4 items-center py-5 border-t border-gray-50 dark:border-gray-800 first:border-0 group">
                          {/* Row Columns */}
                          <div className="col-span-6 mb-4 md:mb-0">
                            <h4 className="text-sm font-bold text-med-blue dark:text-white mb-1">{row.name}</h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">{row.desc}</p>
                          </div>
                          <div className="col-span-2 text-center">
                            {renderCell(row.name, 'leisure', row.leisure)}
                          </div>
                          <div className="col-span-2 text-center">
                            {renderCell(row.name, 'pro', row.pro)}
                          </div>
                          <div className="col-span-2 text-center">
                            {renderCell(row.name, 'business', row.business)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
