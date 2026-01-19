import React from 'react';
import { Footprints, TrainFront, Ticket, Map as MapIcon } from 'lucide-react';

export const CityMobility: React.FC = () => {
  return (
    <div className="mt-12">
        <h2 className="text-center font-serif text-3xl md:text-4xl text-med-blue mb-10">Once You Arrive</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* 1. WALKING */}
            <div className="bg-white p-8 rounded-xl border-t-4 border-med-olive shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-med-olive/10 text-med-olive rounded-full">
                        <Footprints size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-med-blue">Rule #1: We Walk</h3>
                        <p className="text-xs uppercase tracking-widest text-gray-400">Pedestrian Paradise</p>
                    </div>
                </div>
                
                <div className="prose text-gray-600 text-sm leading-relaxed flex-grow">
                    <p className="mb-4">
                        Montpellier is famously the <strong>"15-Minute City."</strong> The entire historic center (L'Écusson) is Europe's largest pedestrian zone. Cars are neither necessary nor useful here.
                    </p>
                    <p>
                        Pack comfortable shoes (loafers, white sneakers, or sandals). You will walk from your hotel to the café, from the café to the square, and from the square to dinner. It is the rhythm of life here.
                    </p>
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-med-blue uppercase mb-1">Walking Distances</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex justify-between"><span>Comédie to Peyrou:</span> <span>10 mins</span></li>
                        <li className="flex justify-between"><span>Station to Hotel:</span> <span>5-8 mins</span></li>
                        <li className="flex justify-between"><span>Bar to Bed:</span> <span>Hopefully short</span></li>
                    </ul>
                </div>
            </div>

            {/* 2. TRAMWAY */}
            <div className="bg-white p-8 rounded-xl border-t-4 border-blue-500 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <TrainFront size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-med-blue">For Distance: The Tram</h3>
                        <p className="text-xs uppercase tracking-widest text-gray-400">Designed by Christian Lacroix</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-600">
                        <span className="block font-bold text-med-blue text-xs">Line 1 (Blue)</span>
                        <span className="text-[10px] text-gray-500">Center ↔ Odysseum</span>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                        <span className="block font-bold text-med-blue text-xs">Line 4 (Gold)</span>
                        <span className="text-[10px] text-gray-500">Circular Historic Loop</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <Ticket size={14} />
                    <span>Download <strong>TaM M'Ticket</strong> app. Single ride: ~$1.75</span>
                </div>
            </div>

        </div>
    </div>
  );
};