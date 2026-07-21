import re

file_path = 'components/EventLandingPage.tsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
    "const [expandedRoute, setExpandedRoute] = useState<string | null>(null);",
    "const [expandedRoute, setExpandedRoute] = useState<string | null>(null);\n    const [activeModal, setActiveModal] = useState<'Event' | 'RSVP' | 'Destination' | null>(null);"
)

pattern = re.compile(r'                    \{\/\* Event mini-info cards \*\/\}.*?(?=                </motion\.div>)', re.DOTALL)

replacement_tiles = """                    {/* Dashboard Tiles */}
                    <div className="flex flex-col gap-4 mt-8 w-full max-w-lg mx-auto">
                        <button onClick={() => setActiveModal('Event')} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/70 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg hover:border-med-terracotta/40 transition-all text-left group">
                            <div className="w-14 h-14 rounded-full bg-med-terracotta/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Calendar size={24} className="text-med-terracotta" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-xl font-bold text-med-blue dark:text-white">Event Details</h3>
                                <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">Bryan's 40th • Sep 18–20, 2026</p>
                                <p className="text-[11px] font-body font-bold text-med-terracotta mt-1">{attendingCount} events attending</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors" />
                        </button>

                        <button onClick={() => setActiveModal('RSVP')} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/70 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg hover:border-med-terracotta/40 transition-all text-left group">
                            <div className={`w-14 h-14 rounded-full ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <StatusIcon size={24} className={statusConfig.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-xl font-bold text-med-blue dark:text-white">Your RSVP</h3>
                                <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">{statusConfig.label}</p>
                                <p className="text-[11px] font-body font-bold text-med-terracotta mt-1">Party of {parsedCouple.isCouple ? 2 + nonPrimaryMembers.length : 1 + nonPrimaryMembers.length}</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors" />
                        </button>

                        <button onClick={() => setActiveModal('Destination')} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/70 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-700 backdrop-blur-sm hover:shadow-lg hover:border-med-terracotta/40 transition-all text-left group">
                            <div className="w-14 h-14 rounded-full bg-med-blue/10 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <MapPin size={24} className="text-med-blue dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-xl font-bold text-med-blue dark:text-white">Destination</h3>
                                <p className="text-sm font-body text-slate-500 dark:text-gray-400 mt-0.5">Montpellier, France</p>
                                <p className="text-[11px] font-body font-bold text-med-blue dark:text-blue-400 mt-1">Travel & Accommodation</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 dark:text-gray-600 group-hover:text-med-terracotta transition-colors" />
                        </button>
                    </div>\n"""

content = pattern.sub(replacement_tiles, content)

modal_start_code = """
                {/* ── Modals Wrapper ── */}
                <AnimatePresence>
                    {activeModal && (
                        <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-6 isolate">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)} />
                            <motion.div initial={{ opacity: 0, y: '100%', scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: '100%', scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-2xl bg-med-sand dark:bg-gray-900 shadow-2xl flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border border-white/20 h-[90vh]">
                                <div className="sticky top-0 z-20 bg-med-sand/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-gray-800/50">
                                    <h2 className="font-heading text-2xl font-bold text-med-blue dark:text-white">
                                        {activeModal === 'Event' && 'Event Details'}
                                        {activeModal === 'RSVP' && 'Your RSVP & Party'}
                                        {activeModal === 'Destination' && 'Destination & Travel'}
                                    </h2>
                                    <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-gray-800 flex items-center justify-center text-slate-500 hover:text-med-terracotta hover:bg-slate-200 transition-all"><X size={16} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 pb-20 space-y-6">

                {activeModal === 'RSVP' && (
                <>
"""

content = content.replace(
    "                {/* ══════════════════════════════════════════════════════════════\n                    SECTION 1: RSVP STATUS + CHANGE TOOL\n                ══════════════════════════════════════════════════════════════ */}",
    modal_start_code + "                {/* ══════════════════════════════════════════════════════════════\n                    SECTION 1: RSVP STATUS + CHANGE TOOL\n                ══════════════════════════════════════════════════════════════ */}"
)

event_split_code = """
                </SectionCard>
                </>
                )}

                {activeModal === 'Event' && (
                <>
                <SectionCard>
"""

content = content.replace("""                    {/* ── Events Divider ── */}
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-800" />""", event_split_code)

destination_start_code = """
                </SectionCard>
                </>
                )}

                {activeModal === 'Destination' && (
                <>
"""
content = content.replace(
    "                {/* ══════════════════════════════════════════════════════════════\n                    SECTION: TRAVEL DETAILS\n                ══════════════════════════════════════════════════════════════ */}",
    destination_start_code + "                {/* ══════════════════════════════════════════════════════════════\n                    SECTION: TRAVEL DETAILS\n                ══════════════════════════════════════════════════════════════ */}"
)

modal_end_code = """
                </>
                )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
"""
content = content.replace(
    "                {/* Footer spacer */}",
    modal_end_code + "                {/* Footer spacer */}"
)

with open(file_path, 'w') as f:
    f.write(content)
print("Fix3 applied")
