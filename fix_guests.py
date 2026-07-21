import re

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/GuestsApp.tsx', 'r') as f:
    content = f.read()

# 1. Fix dietaryMap sort
content = content.replace(
    "(a, b) => b[1] - a[1]",
    "(a, b) => (b[1] as number) - (a[1] as number)"
)

# 2. Add MessageCircle to imports
content = content.replace(
    "PartyPopper, HelpCircle, Frown, UserPlus, Plus, Trash2",
    "PartyPopper, HelpCircle, Frown, UserPlus, Plus, Trash2, MessageCircle"
)

# 3. Add React.FC to GuestRow
content = content.replace(
    "const GuestRow = ({ guest, isExpanded, isSelected, onToggle, onSelect, onEdit, onStatusChange }: {",
    "const GuestRow: React.FC<{\n    guest: Guest;\n    isExpanded: boolean;\n    isSelected: boolean;\n    onToggle: () => void;\n    onSelect: (selected: boolean) => void;\n    onEdit: () => void;\n    onStatusChange: (status: Guest['status']) => void;\n}> = ({ guest, isExpanded, isSelected, onToggle, onSelect, onEdit, onStatusChange }) => {"
)
content = content.replace(
    "    isSelected: boolean;\n    onSelect: (selected: boolean) => void;\n    onEdit: () => void;\n    onStatusChange: (status: Guest['status']) => void;\n}) => {",
    ""
)

with open('/Users/bryanespey/Sites/Voyageurs/voyageurs_1.o/components/GuestsApp.tsx', 'w') as f:
    f.write(content)
