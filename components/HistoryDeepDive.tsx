
import React from 'react';
import { GraduationCap, Scroll, Shield, Milestone } from 'lucide-react';

export const HistoryDeepDive: React.FC = () => {
  return (
    <section className="py-20 bg-white border-t border-med-sand">
      <div className="w-[90%] md:w-[80%] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-med-terracotta/10 text-med-terracotta text-xs font-bold tracking-widest uppercase rounded-full mb-4">
              <Scroll size={14} />
              The Millennial Tapestry
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-med-blue mb-6 leading-tight">
              La Douée: <span className="italic text-med-olive">The Gifted One</span>
            </h2>
            <p className="text-gray-600 font-sans leading-relaxed mb-6">
              Unlike its neighbors Nîmes or Arles, Montpellier is not a child of Rome. It is a city born of the Middle Ages, rising in the 10th century under the Guilhem Lords. Its trajectory was defined not by conquest, but by commerce, intellect, and a remarkably secular spirit that welcomed diverse cultures long before the concept of internationalism existed.
            </p>
          </div>
          <div className="md:w-1/2 relative">
             <img 
              // Image: Cathédrale Saint-Pierre de Montpellier
              src="https://images.unsplash.com/photo-1565099707216-43d939bd9273?q=80&w=800&auto=format&fit=crop" 
              alt="Montpellier Cathedral" 
              className="rounded-lg shadow-xl w-full object-cover h-[400px]"
            />
            <div className="absolute -bottom-6 -left-6 bg-med-sand p-6 rounded-lg shadow-lg max-w-xs border border-med-terracotta/20 hidden md:block">
              <p className="font-serif text-med-blue italic text-lg">"A cross-pollination of knowledge that predated the Enlightenment by centuries."</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Medical School */}
          <div className="bg-med-sand/50 p-8 rounded-xl border border-med-blue/5 hover:border-med-blue/20 transition-colors">
            <div className="w-12 h-12 bg-med-blue text-white rounded-full flex items-center justify-center mb-6">
              <GraduationCap size={24} />
            </div>
            <h3 className="font-serif text-2xl text-med-blue mb-3">Western World's Oldest</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              The Faculty of Medicine was formalized in 1220, making it the oldest in the Western world still in operation. Legends like <strong>Rabelais</strong> and the astrologer <strong>Nostradamus</strong> once walked these halls (though Nostradamus was famously expelled).
            </p>
          </div>

          {/* L'Ecusson */}
          <div className="bg-med-sand/50 p-8 rounded-xl border border-med-blue/5 hover:border-med-blue/20 transition-colors">
            <div className="w-12 h-12 bg-med-terracotta text-white rounded-full flex items-center justify-center mb-6">
              <Shield size={24} />
            </div>
            <h3 className="font-serif text-2xl text-med-blue mb-3">The Shield (L'Écusson)</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              The historic center is named for its shield-like shape. A labyrinth of medieval streets that evolved from "hostals" to grand 18th-century <em>hôtels particuliers</em>—private mansions concealing immense wealth behind unassuming wooden doors.
            </p>
          </div>

          {/* Cultural Refuge */}
          <div className="bg-med-sand/50 p-8 rounded-xl border border-med-blue/5 hover:border-med-blue/20 transition-colors">
            <div className="w-12 h-12 bg-med-olive text-white rounded-full flex items-center justify-center mb-6">
              <Milestone size={24} />
            </div>
            <h3 className="font-serif text-2xl text-med-blue mb-3">A Sanctuary</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Within the core lies the 12th-century Mikvé, a Jewish ritual bath among the best preserved in Europe. It stands as a testament to the city's role as a historical refuge for diverse intellectual traditions and peaceful coexistence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
