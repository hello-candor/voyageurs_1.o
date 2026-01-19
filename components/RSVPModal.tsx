
import React from 'react';
import { X, Ticket } from 'lucide-react';
import { HubRSVP } from './HubRSVP';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RSVPModal: React.FC<RSVPModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center isolate p-4">
       <div 
        className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
       ></div>
       
       <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 ease-out rounded-3xl overflow-hidden border border-white/10 max-h-[90vh]">
           <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-30 p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300"
            >
                <X size={24}/>
            </button>

          <div className="px-8 pt-10 pb-4 bg-white dark:bg-gray-900 z-20 shrink-0 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2 text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs">
                <Ticket size={14} />
                <span>Formal Invitation</span>
              </div>
              <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-tight">
                 Access Your Invitation
              </h2>
          </div>

          <div className="flex-1 overflow-y-auto bg-med-sand dark:bg-gray-900">
              <HubRSVP />
          </div>
       </div>
    </div>
  );
};
