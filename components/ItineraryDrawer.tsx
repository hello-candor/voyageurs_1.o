
import React from 'react';
import { X, Calculator, ShoppingBag } from 'lucide-react';
import { TripPlanner } from './TripPlanner';
import { useTripPlanner } from '../context/TripPlannerContext';

interface ItineraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ItineraryDrawer: React.FC<ItineraryDrawerProps> = ({ isOpen, onClose }) => {
  const { totalCost, items } = useTripPlanner();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[140] bg-med-blue/20 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[150] w-full md:w-[480px] bg-med-sand dark:bg-gray-900 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) flex flex-col border-l border-white/20 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-med-terracotta/10 rounded-lg text-med-terracotta">
                    <Calculator size={20} />
                </div>
                <div>
                    <h3 className="font-serif text-xl text-med-blue dark:text-white leading-none">Trip Estimator</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
                        Total: ${totalCost.toLocaleString()}
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto">
                <TripPlanner embedded={true} />
            </div>
        </div>
      </div>
    </>
  );
};
