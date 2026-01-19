
import React from 'react';
import { X, Info } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center isolate p-4">
       <div 
        className="absolute inset-0 bg-med-blue/60 dark:bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
       ></div>
       
       <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 ease-out rounded-3xl overflow-hidden border border-white/10 max-h-[90vh]">
           <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-30 p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300"
            >
                <X size={24}/>
            </button>

          <div className="px-8 pt-10 pb-4 bg-white dark:bg-gray-900 z-20 shrink-0 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2 text-med-terracotta font-bold uppercase tracking-[0.2em] text-xs">
                <Info size={14} />
                <span>Company</span>
              </div>
              <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-tight">
                 About Voyageurs
              </h2>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-6 font-sans">
              
              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">The Art of Shared Discovery</h3>
                <p>
                  We believe that travel is an art form best practiced in good company. Voyageurs was born from a simple yet ambitious desire: to strip away the friction of group coordination so you can focus entirely on the connection.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">Our Philosophy: L'Art de Vivre</h3>
                <p className="mb-4">
                  Too often, the magic of a reunion, a wedding, or a getaway is diluted by the chaos of logistics—endless spreadsheets, fragmented group chats, and awkward expense splitting.
                </p>
                <p>
                  We built Voyageurs to be the antidote to that chaos. Inspired by the slow, deliberate pace of the Mediterranean lifestyle, our technology works quietly in the background. We are the digital concierge that handles the "how" so you can immerse yourself in the "now." We believe software should be elegant, unobtrusive, and centered around the human experience.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">Who We Are</h3>
                <p className="mb-4">
                  Voyageurs is the flagship product of Candor Digital Group, a design-forward technology studio based in Chicago, Illinois.
                </p>
                <p>
                  We combine Midwestern pragmatism with a global perspective. Our team consists of travelers, designers, and engineers who understand that the best journeys are defined not just by the destination, but by the people you share them with. We craft digital tools that feel as human as the experiences they support.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">The Experience</h3>
                <p>
                  From our AI concierge, Céleste, to our seamless collaborative ledgers, every feature is designed to foster harmony. Whether you are planning a 40th birthday in Montpellier, a corporate retreat in Tuscany, or a family reunion in the States, we are honored to be the invisible thread connecting your journey.
                </p>
              </section>

          </div>
       </div>
    </div>
  );
};
