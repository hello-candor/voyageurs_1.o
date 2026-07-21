import React from 'react';

export const MarketingFooter: React.FC = () => {
    const year = new Date().getFullYear();
    
    return (
        <footer className="w-full py-4 mt-8 flex items-center justify-center opacity-70">
            <p className="text-[10px] sm:text-xs font-sans tracking-widest uppercase text-slate-500 dark:text-gray-400">
                &copy; {year} Voyageurs. All rights reserved.
            </p>
        </footer>
    );
};
