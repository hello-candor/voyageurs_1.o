
import React from 'react';
import { HeartHandshake, VolumeX, Store, Clock, Coffee, ShieldCheck, Utensils, GlassWater } from 'lucide-react';

export const EtiquetteGuide: React.FC = () => {
  const rules = [
    {
      icon: HeartHandshake,
      title: "The Holy \"Bonjour\"",
      category: "Interaction",
      description: "It is not just a greeting; it is permission to speak. Entering a shop without saying it is considered aggressive.",
      critical: true
    },
    {
      icon: Utensils,
      title: "Fork & Knife",
      category: "Dining",
      description: "Keep your hands on the table (not in your lap). Do not switch the knife and fork hands while eating.",
      critical: false
    },
    {
      icon: VolumeX,
      title: "Volume Control",
      category: "Public Space",
      description: "French conversations are discreet. Being the loudest table in the restaurant draws judgement, not admiration.",
      critical: false
    },
    {
      icon: GlassWater,
      title: "Water & Wine",
      category: "Dining",
      description: "Water is free ('carafe d'eau'). Wine is poured by the host. Do not refill your own glass before offering to others.",
      critical: false
    },
    {
      icon: Store,
      title: "Boutique Manners",
      category: "Shopping",
      description: "Greet the vendor. Ask before unfolding clothes. Treat the shop like the owner's living room.",
      critical: false
    },
    {
      icon: Clock,
      title: "The Check",
      category: "Service",
      description: "The waiter will not bring the bill until you ask ('L'addition, s'il vous plaît'). It is considered rude to rush you.",
      critical: false
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Context / Philosophy Card */}
            <div className="lg:w-1/3">
                <div className="bg-med-blue text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-xl sticky top-4">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-med-terracotta/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-4">Culture Code</span>
                        <h3 className="font-serif text-4xl mb-6 leading-none">Savoir<br/><span className="italic text-white/50">Vivre</span></h3>
                        
                        <p className="text-blue-100/80 text-sm leading-relaxed mb-8 font-medium">
                            "The art of living." French etiquette isn't about stiff rules; it's about mutual respect and recognizing the humanity of the other person.
                        </p>

                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2 text-med-terracotta">
                                <ShieldCheck size={18} />
                                <span className="font-bold text-xs uppercase tracking-wider">Pro Tip</span>
                            </div>
                            <p className="text-xs text-white/90 leading-relaxed">
                                When addressing strangers, always append "Monsieur" or "Madame" to your greeting. It smooths every interaction instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rules Grid */}
            <div className="lg:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rules.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="group bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-med-blue/30 transition-all duration-300 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${item.critical ? 'bg-med-terracotta text-white shadow-md shadow-med-terracotta/20' : 'bg-med-blue/5 dark:bg-blue-900/20 text-med-blue dark:text-blue-200 group-hover:bg-med-blue group-hover:text-white'}`}>
                                    <item.icon size={20} strokeWidth={item.critical ? 2.5 : 2} />
                                </div>
                                <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                    {item.category}
                                </span>
                            </div>
                            
                            <h4 className="font-serif text-xl text-med-blue dark:text-white mb-2 group-hover:text-med-terracotta transition-colors">{item.title}</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
