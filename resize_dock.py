import re

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/HostDock.tsx', 'r') as f:
    content = f.read()

# Replace BUILD_STACK rendering
old_build_stack = """                    {BUILD_STACK.map((sub, idx) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className="flex items-center gap-2 p-0.5 pr-2.5 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:bg-gray-800 transition-colors group animate-in slide-in-from-bottom-1 fade-in duration-300"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gray-800 border-white/5 shadow ${sub.color}`}>
                                <sub.icon size={10} />
                            </div>
                            <span className="text-[8px] font-semibold text-gray-300 group-hover:text-white uppercase tracking-wider whitespace-nowrap">{sub.label}</span>
                        </button>
                    ))}"""

new_build_stack = """                    {BUILD_STACK.map((sub, idx) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubItemClick(sub.id)}
                            className="flex items-center gap-2 p-1 pr-3 md:p-1.5 md:pr-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-lg hover:bg-gray-800 transition-colors group animate-in slide-in-from-bottom-1 fade-in duration-300"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-gray-800 border-white/5 shadow ${sub.color}`}>
                                <sub.icon className="w-3 h-3 md:w-4 md:h-4" />
                            </div>
                            <span className="text-[10px] md:text-xs font-semibold text-gray-300 group-hover:text-white uppercase tracking-wider whitespace-nowrap">{sub.label}</span>
                        </button>
                    ))}"""

content = content.replace(old_build_stack, new_build_stack)

# Replace NAV_ITEMS rendering
old_nav_items = """            <div className="pointer-events-auto flex items-center gap-4">
                <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 p-1 rounded-full shadow-2xl flex items-center gap-1 ring-1 ring-black/50">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeApp === item.id || activeStack === item.id;
                        return (
                            <button
                                key={item.id}
                                id={`host-dock-btn-${item.id}`}
                                onClick={() => handleItemClick(item.id, item.hasStack)}
                                title={item.label}
                                className={`
                                    group flex items-center justify-center
                                    w-9 h-9
                                    rounded-full transition-all duration-300 relative
                                    ${isActive ? 'bg-med-terracotta/80' : 'hover:bg-white/10'}
                                `}
                            >
                                <item.icon 
                                    size={16} 
                                    className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                                />
                                {item.hasStack && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-50" />}
                            </button>
                        );
                    })}
                </nav>
            </div>"""

new_nav_items = """            <div className="pointer-events-auto flex items-center gap-4">
                <nav className="bg-black/80 backdrop-blur-2xl border border-white/10 p-1 md:p-2 rounded-full shadow-2xl flex items-center gap-1 md:gap-2 ring-1 ring-black/50">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeApp === item.id || activeStack === item.id;
                        return (
                            <button
                                key={item.id}
                                id={`host-dock-btn-${item.id}`}
                                onClick={() => handleItemClick(item.id, item.hasStack)}
                                title={item.label}
                                className={`
                                    group flex items-center justify-center
                                    w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16
                                    rounded-full transition-all duration-300 relative
                                    ${isActive ? 'bg-med-terracotta/80' : 'hover:bg-white/10'}
                                `}
                            >
                                <item.icon 
                                    className={`w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                                />
                                {item.hasStack && <div className="absolute top-1 right-1 md:top-2 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full opacity-50" />}
                            </button>
                        );
                    })}
                </nav>
            </div>"""

content = content.replace(old_nav_items, new_nav_items)

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/HostDock.tsx', 'w') as f:
    f.write(content)

