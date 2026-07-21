import re
import os

file_path = 'components/EventLandingPage.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add activeModal state
content = content.replace(
    "const [expandedRoute, setExpandedRoute] = useState<string | null>(null);",
    "const [expandedRoute, setExpandedRoute] = useState<string | null>(null);\n    const [activeModal, setActiveModal] = useState<'Event' | 'RSVP' | 'Destination' | null>(null);"
)

# 2. Replace the mini cards and all subsequent sections with the 3 large tiles and modals.
# Let's find the start of the mini cards:
start_marker = "                    {/* Event mini-info cards */}"
end_marker = "                {/* Footer spacer */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    exit(1)

# We will save the original sections because we need to move them into modals.
# But actually, the original sections are already neatly wrapped in <SectionCard> elements!
# Let's extract the RSVP section, Events section, Travel section.
# RSVP section starts at: {/* ══════════════════════════════════════════════════════════════\n                    SECTION 1: RSVP STATUS + CHANGE TOOL
# and ends at the next SectionCard or boundary.

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
                    </div>
                </motion.div>
"""

# Extract the existing sections to put in modals.
sections_content = content[start_idx:end_idx]

# RSVP Section extraction
rsvp_start = sections_content.find("SECTION 1: RSVP STATUS")
if rsvp_start != -1:
    rsvp_start = sections_content.rfind("<SectionCard>", 0, rsvp_start)
rsvp_end = sections_content.find("SECTION 2: TRAVEL DETAILS")
if rsvp_end != -1:
    rsvp_end = sections_content.rfind("<SectionCard>", 0, rsvp_end)

rsvp_section = sections_content[rsvp_start:rsvp_end]

# Event details was actually merged into RSVP section as "Events You're Attending". 
# Wait, let's just make the modals wrap the existing code blocks.
# It's easier if we just write the modals as components at the bottom of the file or dynamically render them.

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
                            <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 space-y-6">
"""

modal_wrapper_end = """
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
"""

# Let's rebuild the content
new_content = content[:start_idx] + replacement + modal_wrapper_start + """
                                {activeModal === 'Event' && (
                                    <>
                                        {/* Paste Event Section Here */}
                                        <SectionCard>
                                            <Eyebrow label="Events You're Attending" onEdit={() => setIsEditingEvents(!isEditingEvents)} isEditing={isEditingEvents} editLabel="Update Attendance" />
                                            {/* ... We need to extract the events part from the old rsvp_section ... */}
                                        </SectionCard>
                                    </>
                                )}
                                {activeModal === 'RSVP' && (
                                    <>
                                        {/* Paste RSVP Section Here */}
                                    </>
                                )}
                                {activeModal === 'Destination' && (
                                    <>
                                        {/* Paste Destination Section Here */}
                                    </>
                                )}
""" + modal_wrapper_end + content[end_idx:]

# The above string manipulation is complex because I need the actual inner code.
# I'll just write a simpler script to dump the old sections into a separate file for reference, then construct the replacement manually.
