import re

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/HostAdmin.tsx', 'r') as f:
    content = f.read()

# Locate DashboardApp
start_idx = content.find("const DashboardApp = ({ allGuests, onLaunch, config }: any) => {")
if start_idx == -1:
    print("DashboardApp not found!")
    exit(1)

# Find the end of DashboardApp
# We'll look for the next component "const CommsApp = () => {"
end_idx = content.find("const CommsApp = () => {", start_idx)

if end_idx == -1:
    print("End of DashboardApp not found!")
    exit(1)

# We want to keep the comment "// GuestsApp is imported from './GuestsApp'" that is right before CommsApp
comment_idx = content.find("// GuestsApp is imported from './GuestsApp'", start_idx, end_idx)
if comment_idx != -1:
    end_idx = comment_idx

new_dashboard = """const DashboardApp = ({ allGuests, onLaunch, config }: any) => {
    const stats = useMemo(() => {
        const total = allGuests.reduce((acc: number, g: any) => acc + (g.guestsCount || 1), 0);
        const confirmed = allGuests.filter((g: any) => g.status === 'Confirmed').reduce((acc: number, g: any) => acc + (g.guestsCount || 1), 0);
        const pending = allGuests.filter((g: any) => g.status === 'Pending').reduce((acc: number, g: any) => acc + (g.guestsCount || 1), 0);
        const declined = allGuests.filter((g: any) => g.status === 'Declined').reduce((acc: number, g: any) => acc + (g.guestsCount || 1), 0);
        return { total, confirmed, pending, declined };
    }, [allGuests]);

    const actionItems = useMemo(() => {
        const items = [];
        if (config.appName === "Voyageurs") items.push({ title: "Setup Event Identity", desc: "Customize your app name and look.", app: 'build', ctx: 'identity', icon: Palette, color: 'text-amber-400', bg: 'bg-amber-400/20' });
        if (config.content?.agenda?.length === 0) items.push({ title: "Create Itinerary", desc: "Add events to your schedule.", app: 'build', ctx: 'agenda', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/20' });
        if (allGuests.length < 5) items.push({ title: "Import Guest List", desc: "Add your VIPs to the app.", app: 'guests', ctx: null, icon: Users, color: 'text-pink-400', bg: 'bg-pink-400/20' });
        if (stats.pending > 0) items.push({ title: `${stats.pending} Pending RSVPs`, desc: "Follow up with guests.", app: 'guests', ctx: null, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/20' });
        return items;
    }, [config, allGuests.length, stats.pending]);

    const recentActivity = [
        { id: 1, type: 'rsvp', text: 'Sarah Connor confirmed RSVP.', time: '2 mins ago', icon: Check, color: 'text-emerald-400' },
        { id: 2, type: 'dietary', text: 'John Doe added dietary requirement: Vegan.', time: '1 hr ago', icon: Utensils, color: 'text-amber-400' },
        { id: 3, type: 'invite', text: 'Invites sent to 45 guests.', time: '3 hrs ago', icon: Send, color: 'text-blue-400' },
        { id: 4, type: 'rsvp', text: 'Michael Scott declined RSVP.', time: '5 hrs ago', icon: X, color: 'text-red-400' },
        { id: 5, type: 'system', text: 'Event Itinerary was updated.', time: '1 day ago', icon: Calendar, color: 'text-gray-400' },
    ];

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto scrollbar-hide text-white w-full max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-serif text-white leading-[1.1] mb-2 drop-shadow-md tracking-tight text-3xl md:text-5xl">
                        Control Center
                    </h2>
                    <p className="text-blue-200/80 font-light text-sm md:text-lg tracking-wide">{config.appName} Overview</p>
                </div>
                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-lg">
                    Host Console
                </div>
            </div>

            {/* Bento Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20">

                {/* ── Quick Actions ── */}
                <div className="md:col-span-2 xl:col-span-2 bg-black/40 hover:bg-black/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 transition-all group flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                    <h3 className="font-serif text-xl mb-4 text-white relative z-10">Quick Actions</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 h-full">
                        {[
                            { label: 'Guests', icon: Users, app: 'guests', color: 'text-pink-400', bg: 'bg-pink-500/20' },
                            { label: 'Broadcast', icon: Radio, app: 'communications', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
                            { label: 'Identity', icon: Fingerprint, app: 'build', ctx: 'identity', color: 'text-amber-400', bg: 'bg-amber-500/20' },
                            { label: 'System', icon: Settings, app: 'setup', color: 'text-gray-300', bg: 'bg-gray-500/20' }
                        ].map(action => (
                            <button
                                key={action.label}
                                onClick={() => onLaunch(action.app, action.ctx)}
                                className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all"
                            >
                                <div className={`p-3 rounded-full ${action.bg} ${action.color}`}>
                                    <action.icon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Stats Widget ── */}
                <div className="md:col-span-1 xl:col-span-1 bg-black/40 hover:bg-black/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 transition-all flex flex-col relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] -mr-10 -mb-10 pointer-events-none" />
                    <h3 className="font-serif text-xl mb-4 text-white">Headcount</h3>
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-serif font-bold text-white leading-none">{stats.total}</span>
                            <span className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Total</span>
                        </div>
                        
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                                <span className="text-emerald-400 flex items-center gap-1"><Check size={12}/> Confirmed ({stats.confirmed})</span>
                                <span className="text-white/40">{Math.round((stats.confirmed / (stats.total || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden flex">
                                <div className="bg-emerald-400 h-full transition-all duration-1000" style={{ width: `${(stats.confirmed / (stats.total || 1)) * 100}%` }} />
                                <div className="bg-orange-400 h-full transition-all duration-1000 delay-300" style={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }} />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-wider font-bold">
                                <span>{stats.pending} Pending</span>
                                <span>{stats.declined} Declined</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Recent Activity Feed ── */}
                <div className="md:col-span-3 xl:col-span-1 xl:row-span-2 bg-black/40 hover:bg-black/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 transition-all flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-xl text-white">Recent Activity</h3>
                        <History size={16} className="text-white/30" />
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide min-h-[200px]">
                        {recentActivity.map((item, idx) => (
                            <div key={item.id} className="flex gap-3 relative">
                                {idx !== recentActivity.length - 1 && (
                                    <div className="absolute top-8 bottom-[-16px] left-[15px] w-px bg-white/10" />
                                )}
                                <div className={`w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 z-10 ${item.color}`}>
                                    <item.icon size={14} />
                                </div>
                                <div>
                                    <p className="text-sm text-white/90">{item.text}</p>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Action Items / Alerts ── */}
                <div className="md:col-span-2 xl:col-span-2 bg-black/40 hover:bg-black/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 transition-all flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="font-serif text-xl text-white flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-400" /> Action Items
                        </h3>
                        <span className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white/70">
                            {actionItems.length} Pending
                        </span>
                    </div>
                    
                    <div className="flex-1 space-y-2 relative z-10">
                        {actionItems.length > 0 ? (
                            actionItems.map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => onLaunch(item.app, item.ctx)}
                                    className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left"
                                >
                                    <div className={`p-2.5 rounded-lg ${item.bg} ${item.color}`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white">{item.title}</p>
                                        <p className="text-[10px] text-white/50">{item.desc}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-white/20" />
                                </button>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                                    <Check size={20} />
                                </div>
                                <p className="text-sm text-white/80 font-medium">You're all caught up!</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">No pending action items.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Budget Summary ── */}
                <div className="md:col-span-1 xl:col-span-1 bg-black/40 hover:bg-black/50 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl p-6 transition-all flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[60px] -ml-10 -mt-10 pointer-events-none" />
                    <h3 className="font-serif text-xl mb-4 text-white flex items-center gap-2">
                        <DollarSign size={18} className="text-purple-400" /> Budget
                    </h3>
                    
                    <div className="flex-1 flex flex-col justify-center">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total Spent</span>
                        <div className="text-4xl font-serif font-bold text-white mb-4">$12,450</div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                <span className="text-white/60">Target: $20,000</span>
                                <span className="text-purple-400">62%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000" style={{ width: '62%' }} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
"""

content = content[:start_idx] + new_dashboard + content[end_idx:]

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/HostAdmin.tsx', 'w') as f:
    f.write(content)
