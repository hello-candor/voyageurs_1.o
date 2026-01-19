
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GuestProfile } from './GuestProfile';
import { useUser } from '../context/UserContext';

interface TravelHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TravelHub: React.FC<TravelHubProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center isolate p-4">
       {/* Backdrop */}
       <div 
        className="absolute inset-0 bg-med-blue/80 dark:bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in duration-500" 
        onClick={onClose}
       ></div>
       
       {/* Auth Modal Container */}
       <div className="relative w-full max-w-2xl bg-med-sand dark:bg-gray-900 shadow-2xl rounded-3xl overflow-hidden border border-white/10 ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
          
          {/* Close Button */}
           <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-50 p-2 text-gray-400 hover:text-med-terracotta hover:bg-white/50 dark:hover:bg-white/10 rounded-full transition-all"
            >
                <X size={24}/>
            </button>

          {/* Main Content Area - Reduced Padding */}
          <div className="p-4 md:p-8 overflow-y-auto max-h-[85vh]">
              <GuestProfile />
          </div>
       </div>
    </div>
  );
};
