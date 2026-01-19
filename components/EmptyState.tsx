
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    message,
    actionLabel,
    onAction,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px] animate-in fade-in zoom-in-95 duration-500 ${className}`}>
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100 dark:border-gray-700/50">
                <Icon size={32} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-xl text-med-blue dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed mb-8">
                {message}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="secondary" size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
