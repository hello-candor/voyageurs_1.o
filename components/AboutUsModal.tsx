
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
                <span>Why We Exist</span>
              </div>
              <h2 className="font-serif text-3xl text-med-blue dark:text-white leading-tight">
                 Our Manifesto
              </h2>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-8 text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-6 font-sans">
              
              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">The Art of Shared Discovery</h3>
                <p>
                  Travel is more than the movement between places; it is a fundamental human language. It is a catalyst for discovery that strengthens our bonds, challenges our perspectives, and returns us home with a renewed sense of empathy and joy. When we explore together, we are not just witnessing the world—we are building a collective history.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">The Friction of Modern Travel</h3>
                <p>
                  Yet, the beauty of these moments is often fractured by the reality of coordinating them. We find ourselves drowning in a sea of disconnected group chats, endless spreadsheet tabs, and the persistent, low-level anxiety of logistics. This administrative noise acts as a barrier, pulling our attention away from the people beside us and toward the burden of keeping plans afloat.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">The Invisible Infrastructure</h3>
                <p>
                  Voyageurs exists to dissolve that friction. We have engineered an ecosystem designed to operate entirely in the background, serving as a silent, intuitive partner in your journey. By unifying your plans, shared ledgers, and communication into one fluid hub, we remove the "how" of travel entirely. Our technology is not meant to be a destination—it is meant to be the invisible thread that holds your experiences together.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-med-blue dark:text-white mb-2">Crafted for Connection</h3>
                <p>
                  By automating the logistics, we reclaim the space for what truly matters: presence. When the weight of coordination is lifted, you are free to exist fully in the moment with your group. Whether you are navigating a milestone reunion or orchestrating a quiet escape, Voyageurs provides the foundation upon which your shared story unfolds. We don’t just build tools for travel; we create the conditions for deeper connection.
                </p>
              </section>

          </div>
       </div>
    </div>
  );
};
