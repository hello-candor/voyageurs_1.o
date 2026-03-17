import re

with open('components/SearchOverlay.tsx', 'r') as f:
    content = f.read()

# Fix the submit button text color
content = content.replace(
    'bg-med-terracotta hover:bg-[#c56143] text-slate-800 dark:text-white',
    'bg-med-terracotta hover:bg-[#c56143] text-white'
)

# Fix input background and border
content = content.replace(
    'bg-white/10 border border-white/10',
    'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10'
)
content = content.replace(
    'focus:bg-white/20 focus:border-white/30',
    'focus:bg-slate-200 dark:focus:bg-white/20 focus:border-slate-300 dark:focus:border-white/30'
)

# Fix close button hover
content = content.replace(
    'bg-white/10 hover:bg-white/20 rounded-full',
    'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-full'
)

# Fix suggestion buttons
content = content.replace(
    'bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-all border border-transparent hover:border-white/10',
    'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl text-left transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10'
)

# Fix result container
content = content.replace(
    'bg-white/10 rounded-3xl p-8 border border-white/10',
    'bg-slate-50 dark:bg-white/10 rounded-3xl p-8 border border-slate-200 dark:border-white/10'
)

# Fix external link buttons
content = content.replace(
    'bg-black/20 hover:bg-black/40 rounded-lg text-xs text-blue-200',
    'bg-slate-200 dark:bg-black/20 hover:bg-slate-300 dark:hover:bg-black/40 rounded-lg text-xs text-blue-700 dark:text-blue-200'
)

# Fix ai response text color
content = content.replace(
    'text-lg leading-relaxed text-blue-50',
    'text-lg leading-relaxed text-slate-700 dark:text-blue-50'
)


with open('components/SearchOverlay.tsx', 'w') as f:
    f.write(content)
