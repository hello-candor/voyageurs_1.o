import re

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/GuestsApp.tsx', 'r') as f:
    content = f.read()

# 1. Update GuestRow props
content = content.replace(
    "const GuestRow = ({ guest, isExpanded, onToggle, onStatusChange }: {",
    "const GuestRow = ({ guest, isExpanded, isSelected, onToggle, onSelect, onEdit, onStatusChange }: {"
)
content = content.replace(
    "    onStatusChange: (status: Guest['status']) => void;\n}) => {",
    "    isSelected: boolean;\n    onSelect: (selected: boolean) => void;\n    onEdit: () => void;\n    onStatusChange: (status: Guest['status']) => void;\n}) => {"
)

# 2. Add checkbox to GuestRow header
row_header_start = content.find("                {/* Avatar */}")
checkbox_code = """                {/* Selection Checkbox */}
                <div 
                    onClick={(e) => { e.stopPropagation(); onSelect(!isSelected); }}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-white border-white text-black' : 'border-white/20 hover:border-white/40 text-transparent'}`}
                >
                    <Check size={14} strokeWidth={3} className="text-current" />
                </div>

"""
content = content[:row_header_start] + checkbox_code + content[row_header_start:]

# 3. Add Edit button to GuestRow expanded actions
row_actions = content.find("                            {/* Quick Actions */}")
edit_action = """                            {/* Quick Actions */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/8">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 mr-2">Set Status:</span>
                                    {(['Confirmed', 'Pending', 'Declined'] as const).map(s => {
                                        const cfg = STATUS_CONFIG[s];
                                        const Icon = cfg.icon;
                                        const isActive = guest.status === s;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => onStatusChange(s)}
                                                disabled={isActive}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
                                                    isActive
                                                        ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                                                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60'
                                                }`}
                                            >
                                                <Icon size={10} strokeWidth={3} />
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={onEdit}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-[9px] font-bold uppercase tracking-wider transition-all text-white/80"
                                >
                                    <Edit3 size={10} /> Edit Guest
                                </button>
                            </div>
"""
# Replace the existing Quick Actions block
end_of_quick_actions = content.find("                        </div>\n                    </motion.div>", row_actions)
content = content[:row_actions] + edit_action + content[end_of_quick_actions:]


# 4. Create GuestDrawer Component
drawer_code = """
// ─── Guest Drawer ────────────────────────────────────────────────────────────

const GuestDrawer = ({ isOpen, onClose, guest, onSave }: any) => {
    const [formData, setFormData] = useState<any>({});

    React.useEffect(() => {
        if (isOpen) {
            setFormData(guest || {
                name: '', email: '', status: 'Pending', dietary: '', note: '', guestsCount: 1,
                eventConfirmations: {}, travelDetails: {}
            });
        }
    }, [isOpen, guest]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md h-full bg-gray-900 border-l border-white/10 shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-serif text-white">{guest ? 'Edit Guest' : 'Add Guest'}</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-sm text-white/80">
                    <form id="guest-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Name</label>
                            <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Email</label>
                            <input required type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Status</label>
                                <select value={formData.status || 'Pending'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30 appearance-none">
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Declined">Declined</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Party Size</label>
                                <input type="number" min="1" value={formData.guestsCount || 1} onChange={e => setFormData({...formData, guestsCount: parseInt(e.target.value)})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Dietary Requirements</label>
                            <input type="text" value={formData.dietary || ''} onChange={e => setFormData({...formData, dietary: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30" placeholder="e.g. Vegetarian, Nut Allergy" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Notes</label>
                            <textarea value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30 min-h-[80px]" />
                        </div>
                        
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">Event Confirmations</h3>
                            <div className="space-y-2">
                                {WEEKEND_EVENTS.map(evt => {
                                    const attending = formData.eventConfirmations?.[evt.id] !== false;
                                    return (
                                        <label key={evt.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/5 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={attending} 
                                                onChange={e => setFormData({
                                                    ...formData, 
                                                    eventConfirmations: { ...formData.eventConfirmations, [evt.id]: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded bg-black/30 border border-white/20 accent-white"
                                            />
                                            <evt.icon size={14} className={evt.color} />
                                            <span className="text-sm font-medium">{evt.title}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </form>
                </div>
                <div className="p-6 border-t border-white/10 flex gap-3 bg-gray-900">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-white/60 hover:text-white transition-all">Cancel</button>
                    <button type="submit" form="guest-form" className="flex-1 px-4 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-all">Save Guest</button>
                </div>
            </motion.div>
        </div>
    );
};
"""
content = content.replace("// ─── Main Component ──────────────────────────────────────────────────────────", drawer_code + "\n// ─── Main Component ──────────────────────────────────────────────────────────")


# 5. GuestsApp modifications
guests_app_setup = """export const GuestsApp: React.FC<GuestsAppProps> = ({ allGuests, onAdd, onBulkAdd, onDelete, onUpdateGuest }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

    const editingGuest = editingGuestId ? allGuests.find(g => g.id === editingGuestId) : null;
"""
content = content.replace("export const GuestsApp: React.FC<GuestsAppProps> = ({ allGuests, onAdd, onBulkAdd, onDelete, onUpdateGuest }) => {\n    const [searchQuery, setSearchQuery] = useState('');\n    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');\n    const [sortField, setSortField] = useState<SortField>('name');\n    const [sortDir, setSortDir] = useState<SortDir>('asc');\n    const [expandedId, setExpandedId] = useState<string | null>(null);", guests_app_setup)

# 6. Bulk Actions and Save Logic
bulk_actions_logic = """
    const handleSelectAll = (filtered: Guest[]) => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(g => g.id));
        }
    };

    const handleBulkStatus = (status: Guest['status']) => {
        selectedIds.forEach(id => onUpdateGuest(id, { status } as any));
        setSelectedIds([]);
    };

    const handleBulkEvent = (eventId: string, attending: boolean) => {
        selectedIds.forEach(id => {
            const guest = allGuests.find(g => g.id === id);
            if (guest) {
                const ec = { ...(guest as any).eventConfirmations, [eventId]: attending };
                onUpdateGuest(id, { eventConfirmations: ec } as any);
            }
        });
        setSelectedIds([]);
    };
    
    const handleSaveGuest = (guestData: any) => {
        if (guestData.id) {
            onUpdateGuest(guestData.id, guestData);
        } else {
            onAdd({ ...guestData, id: `guest-${Date.now()}` });
        }
    };
"""
content = content.replace("    const handleStatusChange = useCallback((id: string, status: Guest['status']) => {\n        onUpdateGuest(id, { status } as any);\n    }, [onUpdateGuest]);", "    const handleStatusChange = useCallback((id: string, status: Guest['status']) => {\n        onUpdateGuest(id, { status } as any);\n    }, [onUpdateGuest]);\n" + bulk_actions_logic)


# 7. Update Header for Add Guest
header_replacement = """                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-serif text-white leading-none mb-1"
                            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                            Guest List
                        </h2>
                        <p className="text-white/40 text-xs uppercase tracking-widest">
                            {stats.total} guests · {stats.totalHeadcount} total headcount
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => exportToCSV(allGuests)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all"
                        >
                            <Download size={13} /> Export
                        </button>
                        <button
                            onClick={() => { setEditingGuestId(null); setIsDrawerOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg shadow-white/10"
                        >
                            <UserPlus size={13} /> Add Guest
                        </button>
                    </div>
                </div>"""
content = content.replace("                {/* ── Header ── */}\n                <div className=\"flex items-center justify-between\">\n                    <div>\n                        <h2 className=\"font-serif text-white leading-none mb-1\"\n                            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>\n                            Guest List\n                        </h2>\n                        <p className=\"text-white/40 text-xs uppercase tracking-widest\">\n                            {stats.total} guests · {stats.totalHeadcount} total headcount\n                        </p>\n                    </div>\n                    <button\n                        onClick={() => exportToCSV(allGuests)}\n                        className=\"flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition-all\"\n                    >\n                        <Download size={13} /> Export CSV\n                    </button>\n                </div>", "                {/* ── Header ── */}\n" + header_replacement)


# 8. Add Select All Checkbox to Search Bar and Sticky Action Bar
search_bar_replacement = """                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleSelectAll(filteredGuests)}
                        className={`hidden md:flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                            selectedIds.length === filteredGuests.length && filteredGuests.length > 0
                                ? 'bg-white text-black border-white' 
                                : 'bg-black/30 border-white/10 text-white/40 hover:text-white/80'
                        }`}
                        title="Select All"
                    >
                        <Check size={14} className={selectedIds.length === filteredGuests.length && filteredGuests.length > 0 ? 'opacity-100' : 'opacity-20'} />
                    </button>
                    <div className="flex-1 relative">"""
content = content.replace("                <div className=\"flex items-center gap-3\">\n                    <div className=\"flex-1 relative\">", search_bar_replacement)


# 9. GuestRow mapping with new props
guest_list_replacement = """                        filteredGuests.map(guest => (
                            <GuestRow
                                key={guest.id}
                                guest={guest}
                                isExpanded={expandedId === guest.id}
                                isSelected={selectedIds.includes(guest.id)}
                                onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)}
                                onSelect={(selected) => {
                                    if (selected) setSelectedIds([...selectedIds, guest.id]);
                                    else setSelectedIds(selectedIds.filter(id => id !== guest.id));
                                }}
                                onEdit={() => { setEditingGuestId(guest.id); setIsDrawerOpen(true); }}
                                onStatusChange={(status) => handleStatusChange(guest.id, status)}
                            />
                        ))"""
content = content.replace("""                        filteredGuests.map(guest => (
                            <GuestRow
                                key={guest.id}
                                guest={guest}
                                isExpanded={expandedId === guest.id}
                                onToggle={() => setExpandedId(expandedId === guest.id ? null : guest.id)}
                                onStatusChange={(status) => handleStatusChange(guest.id, status)}
                            />
                        ))""", guest_list_replacement)


# 10. Sticky Bulk Actions Bar and AnimatePresence for Drawer
footer_replacement = """                <div className="text-center py-4 text-[10px] text-white/20 uppercase tracking-widest pb-32">
                    Showing {filteredGuests.length} of {allGuests.length} guests
                </div>
            </div>

            {/* ── Sticky Bulk Actions ── */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 shadow-2xl rounded-2xl p-2 flex items-center gap-2 z-40"
                    >
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-white font-bold text-xs">
                            {selectedIds.length} Selected
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-1" />
                        
                        <div className="flex gap-1">
                            <button onClick={() => handleBulkStatus('Confirmed')} className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">Confirm</button>
                            <button onClick={() => handleBulkStatus('Declined')} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">Decline</button>
                        </div>
                        <div className="h-6 w-px bg-white/10 mx-1" />
                        
                        <div className="relative group">
                            <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
                                <Calendar size={12} /> Events
                            </button>
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/10 rounded-xl p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none group-hover:pointer-events-auto">
                                {WEEKEND_EVENTS.map(evt => (
                                    <div key={evt.id} className="flex gap-1 mb-1 last:mb-0">
                                        <button onClick={() => handleBulkEvent(evt.id, true)} className="flex-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-bold text-white text-left truncate flex items-center gap-1"><Check size={10}/> {evt.short}</button>
                                        <button onClick={() => handleBulkEvent(evt.id, false)} className="px-2 py-1.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded text-[9px] font-bold text-white"><X size={10}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => alert("Bulk messaging UI would open here")} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
                            <MessageCircle size={12} /> Message
                        </button>
                        
                        <button onClick={() => exportToCSV(allGuests.filter(g => selectedIds.includes(g.id)))} className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all">
                            <Download size={12} /> Export
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-1" />
                        <button onClick={() => setSelectedIds([])} className="p-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl transition-all">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                <GuestDrawer 
                    isOpen={isDrawerOpen} 
                    onClose={() => { setIsDrawerOpen(false); setEditingGuestId(null); }} 
                    guest={editingGuest}
                    onSave={handleSaveGuest}
                />
            </AnimatePresence>"""
content = content.replace("""                <div className="text-center py-4 text-[10px] text-white/20 uppercase tracking-widest">
                    Showing {filteredGuests.length} of {allGuests.length} guests
                </div>
            </div>""", footer_replacement)


with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/GuestsApp_updated.tsx', 'w') as f:
    f.write(content)

