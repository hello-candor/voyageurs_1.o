
import React from 'react';

export interface SegmentItem {
    id: string;
    label: string;
    icon?: React.ElementType;
    badge?: number | boolean | string;
}

interface SegmentedControlProps {
    items: SegmentItem[];
    selectedId: string;
    onChange: (id: string) => void;
    className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
    items, 
    selectedId, 
    onChange,
    className = ''
}) => {
    return (
        /* Added py-2 to ensure absolute positioned badges have vertical clearance and don't get clipped by overflow-x-auto */
        <div className={`bg-white/80 dark:bg-gray-800/80 p-1.5 border border-gray-100 dark:border-gray-700 rounded-full flex items-center gap-1 shadow-sm overflow-x-auto scrollbar-hide max-w-full relative ${className}`}>
            {items.map((item) => {
                const isActive = selectedId === item.id;
                const Icon = item.icon;
                
                return (
                    <button
                        key={item.id}
                        onClick={() => onChange(item.id)}
                        className={`
                            flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-med-blue/20 relative z-10
                            ${isActive 
                                ? 'bg-med-blue text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-med-blue dark:hover:text-blue-200 hover:bg-gray-50 dark:hover:bg-white/10'
                            }
                        `}
                    >
                        {Icon && (
                            <Icon 
                                size={14} 
                                className={`transition-colors ${isActive ? 'text-white' : 'text-med-terracotta/80 group-hover:text-med-terracotta'}`} 
                            />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">
                            {item.label}
                        </span>
                        
                        {/* Notification Badge - Adjusted z-index and position to ensure it's not hidden or clipped */}
                        {item.badge !== undefined && item.badge !== 0 && item.badge !== false && (
                            <span className={`absolute -top-1 -right-0.5 z-20 flex h-4 min-w-[16px] px-1.5 items-center justify-center rounded-full text-[7px] font-bold ring-2 transition-all ${
                                isActive 
                                ? 'bg-white text-med-blue ring-med-blue' 
                                : 'bg-med-terracotta text-white ring-white dark:ring-gray-800 animate-pulse'
                            }`}>
                                {typeof item.badge === 'number' || typeof item.badge === 'string' ? item.badge : ''}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
