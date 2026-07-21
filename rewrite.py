import re

file_path = 'components/EventLandingPage.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add activeModal state
content = content.replace(
    "const [expandedRoute, setExpandedRoute] = useState<string | null>(null);",
    "const [expandedRoute, setExpandedRoute] = useState<string | null>(null);\n    const [activeModal, setActiveModal] = useState<'Event' | 'RSVP' | 'Destination' | null>(null);"
)

# 2. Replace the mini cards
start_mini_cards = "                    {/* Event mini-info cards */}"
end_mini_cards = "                    </div>"

mini_cards_start_idx = content.find(start_mini_cards)
mini_cards_end_idx = content.find(end_mini_cards, mini_cards_start_idx) + len(end_mini_cards)

replacement = """                    {/* Dashboard Tiles */}
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
                    </div>"""

content = content[:mini_cards_start_idx] + replacement + content[mini_cards_end_idx:]

# Now, we wrap all SectionCards in the modal conditionally.
# We will just replace ALL `<SectionCard>` tags with `<div>` (since they're in a modal now, the SectionCard styling might be too much, but let's keep them as div to avoid changing the closing tags incorrectly).
# Wait, `<SectionCard>` closing tag is `</SectionCard>`. If we replace `<SectionCard>` with `<div>`, we MUST replace `</SectionCard>` with `</div>`.
content = content.replace("<SectionCard>", '<div className="p-4 sm:p-6">')
content = content.replace("</SectionCard>", "</div>")

# 3. Add the modal wrapper
start_sections = content.find("                {/* ══════════════════════════════════════════════════════════════")
end_sections = content.find("                {/* Footer spacer */}")

sections_content = content[start_sections:end_sections]

modal_wrapper_start = """
            {/* ── Modals ── */}
            <AnimatePresence>
                {activeModal && (
                    <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-6 isolate">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md"
                            onClick={() => setActiveModal(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-med-sand dark:bg-gray-900 shadow-2xl flex flex-col rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden border border-white/20 h-[90vh]"
                        >
                            <div className="sticky top-0 z-20 bg-med-sand/90 dark:bg-gray-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-gray-800/50">
                                <h2 className="font-heading text-2xl font-bold text-med-blue dark:text-white">
                                    {activeModal === 'Event' && 'Event Details'}
                                    {activeModal === 'RSVP' && 'Your RSVP & Party'}
                                    {activeModal === 'Destination' && 'Destination & Travel'}
                                </h2>
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-gray-800 flex items-center justify-center text-slate-500 hover:text-med-terracotta hover:bg-slate-200 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto pb-20">
"""

modal_wrapper_end = """
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
"""

# Let's split sections_content properly.
parts = sections_content.split('<div className="p-4 sm:p-6">')
# parts[0] is the comments before RSVP STATUS
# parts[1] is RSVP STATUS + Events You're Attending
# parts[2] is Travel Details
# parts[3] is Where to Stay
# parts[4] is Where to Eat
# parts[5] is Get to Know Montpellier

if len(parts) >= 2:
    # We must split parts[1] which contains both RSVP and Events.
    part1_split = parts[1].split("{/* ── Events Divider ── */}")
    
    rsvp_code = part1_split[0]
    events_code = part1_split[1] if len(part1_split) > 1 else ""
    
    # We need to make sure the closing </div> is matched properly.
    # parts[1] had a closing </div> for the RSVP SectionCard.
    # When we split it, the closing </div> is at the end of `events_code`.
    events_code = events_code.replace("</div>", "")
    
    # We need to close the div for rsvp manually since we split the content
    rsvp_code = rsvp_code + "</div>"
    events_code = '<div className="p-4 sm:p-6">' + events_code + "</div>"

    travel_code = '<div className="p-4 sm:p-6">' + parts[2] if len(parts) > 2 else ""
    stay_code = '<div className="p-4 sm:p-6">' + parts[3] if len(parts) > 3 else ""
    eat_code = '<div className="p-4 sm:p-6">' + parts[4] if len(parts) > 4 else ""
    know_code = '<div className="p-4 sm:p-6">' + parts[5] if len(parts) > 5 else ""

    modal_content = """
                                {activeModal === 'Event' && (
                                    <div className="space-y-6">
                                        """ + events_code + """
                                    </div>
                                )}
                                {activeModal === 'RSVP' && (
                                    <div className="space-y-6">
                                        <div className="p-4 sm:p-6">
                                        """ + rsvp_code + """
                                    </div>
                                )}
                                {activeModal === 'Destination' && (
                                    <div className="space-y-6">
                                        """ + travel_code + stay_code + eat_code + know_code + """
                                    </div>
                                )}
"""

    full_modal = modal_wrapper_start + modal_content + modal_wrapper_end
    
    final_content = content[:start_sections] + full_modal + content[end_sections:]
    
    with open(file_path, 'w') as f:
        f.write(final_content)
    print("Success")
else:
    print("Failed to parse sections")
