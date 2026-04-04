
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Wine, Landmark, Star, ArrowRight, Loader2, Compass, X, Image as ImageIcon, Check, Map as MapIcon, Plus, Trash2, Camera, Mountain, ChevronRight, Ticket, Navigation } from 'lucide-react';
import { getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { DayTrip } from '../types';

// --- Data Interfaces ---

export interface ExplorationItem extends DayTrip {
  category: 'activity' | 'vineyard' | 'landmark';
  // Vineyard specific
  signatureWine?: string;
  varietals?: string[];
  tastingNotes?: string;
  // Landmark/Activity specific
  entryCost: number;
  lat?: number;
  lng?: number;
}

// --- Data Sets ---

export const DAY_TRIPS: ExplorationItem[] = [
  {
    id: 'sete',
    category: 'activity',
    name: 'Sète',
    description: 'Known as the "Venice of Languedoc", famous for its canals, seafood, and the panoramic view from Mont Saint-Clair.',
    // Image: Sète Canals (Canal Royal)
    image: 'https://images.unsplash.com/photo-1582297773238-66236371720d?q=80&w=800&auto=format&fit=crop', 
    distance: '30 min train',
    fullDescription: "Sète is a fascinating island-city caught between the Mediterranean Sea and the Thau Lagoon. It is a gritty, authentic working fishing port.",
    highlights: ["Panoramic view from Mont Saint-Clair", "Eating 'Tielle Sétoise'", "Boat tours of the oyster beds"],
    bestFor: "Seafood lovers & Photographers",
    transportDetail: "Trains run every 20-30 minutes from  Saint-Roch.",
    entryCost: 20,
    lat: 43.4025,
    lng: 3.6961
  },
  {
    id: 'st-guilhem',
    category: 'activity',
    name: 'St-Guilhem-le-Désert',
    description: 'A medieval village nestled in a canyon, featuring the Abbey of Gellone and nearby Pont du Diable.',
    // Image: St Guilhem village view
    image: 'https://images.unsplash.com/photo-1629834877771-5503b136814c?q=80&w=800&auto=format&fit=crop',
    distance: '45 min drive',
    fullDescription: "Listed as one of the 'Most Beautiful Villages in France', St-Guilhem feels frozen in time.",
    highlights: ["Abbey of Gellone (804 AD)", "Hiking the 'Cirque de l'Infernet'", "Pont du Diable"],
    bestFor: "Hikers & History Buffs",
    transportDetail: "A car is recommended or the seasonal shuttle bus.",
    entryCost: 15,
    lat: 43.7336,
    lng: 3.5492
  },
  {
    id: 'camargue',
    category: 'activity',
    name: 'The Camargue',
    description: 'Wild marshland famous for pink flamingos, white horses, black bulls, and vast salt flats.',
    // Image: Camargue horses/marsh
    image: 'https://images.unsplash.com/photo-1533519896016-522f67623912?q=80&w=800&auto=format&fit=crop',
    distance: '45 min drive',
    fullDescription: "The Camargue is a natural park located in the Rhône delta. It is a wild, flat landscape of salt marshes.",
    highlights: ["Walled city of Aigues-Mortes", "Pink salt marshes", "Horseback riding"],
    bestFor: "Nature lovers & Adventure seekers",
    transportDetail: "Car is essential. Aim for Aigues-Mortes.",
    entryCost: 30,
    lat: 43.5592,
    lng: 4.4172
  },
  {
    id: 'nimes',
    category: 'activity',
    name: 'Nîmes',
    description: 'Roman history comes alive with the incredibly preserved Amphitheatre and the Maison Carrée temple.',
    // Image: Nimes Arena
    image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=800&auto=format&fit=crop',
    distance: '25 min train',
    fullDescription: "Nîmes was a major city of the Roman Empire. The Arena of Nîmes is arguably better preserved than the Colosseum.",
    highlights: ["The Arena (Amphitheatre)", "Maison Carrée", "Jardins de la Fontaine"],
    bestFor: "Roman History enthusiasts",
    transportDetail: "Frequent TER or TGV trains from  Saint-Roch.",
    entryCost: 25,
    lat: 43.8367,
    lng: 4.3601
  },
  {
    id: 'maguelone',
    category: 'activity',
    name: 'Maguelone Cathedral',
    description: 'Romanesque monument isolated on an island between marshes, vineyards, and the sea.',
    // Image: Maguelone / Coastal
    image: 'https://images.unsplash.com/photo-1548509923-279549301034?q=80&w=800&auto=format&fit=crop',
    distance: '7 miles from center',
    fullDescription: "Historically the seat of the medieval bishops of Maguelone, this fortress-like cathedral stands in isolation on a wooded island. A serene place for history and beach walks.",
    highlights: ["Romanesque Architecture", "Coastal Setting", "Peacocks on grounds"],
    bestFor: "History & Nature",
    transportDetail: "Accessible by bicycle path or seasonal shuttle.",
    entryCost: 0,
    lat: 43.5120,
    lng: 3.8820
  },
  {
    id: 'palavas',
    category: 'activity',
    name: 'Palavas-les-Flots',
    description: 'Traditional coastal resort with 4 miles of sandy beaches and a fishing harbor.',
    // Image: Palavas beach/canal
    image: 'https://images.unsplash.com/photo-1563297136-2244bbd99c6e?q=80&w=800&auto=format&fit=crop',
    distance: '6 miles from center',
    fullDescription: "Former fishing village situated at the mouth of the Lez river. It offers a classic French seaside experience with a funicular and lighthouse.",
    highlights: ["Sandy Beaches", "Fishing Harbor", "Transcanal (cable car)"],
    bestFor: "Beach Day",
    transportDetail: "Tram 3 to Pérols then Bus 131, or cycle along the Lez.",
    entryCost: 0,
    lat: 43.5288,
    lng: 3.9307
  }
];

export const VINEYARD_DATA: ExplorationItem[] = [
  {
    id: 'flaugergues',
    category: 'vineyard',
    name: "Château de Flaugergues",
    description: "A magnificent 'Folie Montpelliéraine' located right within the city limits. Historic architecture meets exceptional wine.",
    // Image: French Chateau Exterior
    image: 'https://images.unsplash.com/photo-1572418343759-4f7f631df671?q=80&w=800&auto=format&fit=crop', 
    distance: "15 min tram/taxi",
    fullDescription: "An architectural gem and a working vineyard located uniquely within  itself. Flaugergues is one of the 'Folies'—grand summer houses built by wealthy merchants in the 18th century. It has been in the same family (Colbert) for generations. The gardens are classified as 'Remarkable', and the wines are a sophisticated expression of the Grés de  terroir.",
    highlights: ["18th-Century Architecture", "Classified French Gardens", "Within City Limits", "Excellent Restaurant (Folgues)"],
    bestFor: "History lovers & Lunch",
    transportDetail: "Accessible via Tram Line 1 (stop 'Place de France') then a short walk, or a 15-min Uber from the center.",
    signatureWine: "Cuvée Sommelière (Red)",
    varietals: ["Grenache", "Syrah", "Mourvèdre"],
    entryCost: 30,
    lat: 43.6120,
    lng: 3.9220
  },
  {
    id: 'hortus',
    category: 'vineyard',
    name: "Domaine de l'Hortus",
    description: "The legend of the Pic Saint-Loup. Nestled between two cliffs, producing some of the region's most celebrated reds.",
    // Image: Pic Saint Loup Vines
    image: 'https://images.unsplash.com/photo-1534234828563-02399873494a?q=80&w=800&auto=format&fit=crop',
    distance: "35 min drive",
    fullDescription: "Located in the valley between the Pic Saint-Loup and the Hortus cliff, this estate is iconic. The Orliac family transformed wild scrubland into a prestige winery.",
    highlights: ["Dramatic Cliffside Scenery", "Iconic Pic Saint-Loup Wines", "Family Owned"],
    bestFor: "Red Wine Aficionados & Scenery",
    transportDetail: "Car is essential. Drive north through the garrigue.",
    signatureWine: "Grande Cuvée Rouge",
    varietals: ["Syrah (Dominant)", "Mourvèdre", "Grenache"],
    entryCost: 40,
    lat: 43.7935,
    lng: 3.8432
  },
  {
    id: 'daumas-gassac',
    category: 'vineyard',
    name: "Mas de Daumas Gassac",
    description: "Often called the 'Lafite of the Languedoc'. A cult winery in the Gassac valley known for unique terroir.",
    // Image: Vineyard Valley
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
    distance: "40 min drive",
    fullDescription: "In the 1970s, professors discovered that the soil here was identical to the best terroir in Burgundy. The Guibert family planted non-standard varieties creating a 'Vin de Pays' that beat the First Growths of Bordeaux.",
    highlights: ["Cult Status Wines", "Unique Micro-climate", "Historical Cellar Tours"],
    bestFor: "Wine Collectors & Geeks",
    transportDetail: "Car required. Near Aniane.",
    signatureWine: "Mas de Daumas Gassac Rouge",
    varietals: ["Cabernet Sauvignon", "Merlot", "Petit Verdot"],
    entryCost: 25,
    lat: 43.6825,
    lng: 3.5950
  },
  {
    id: 'puech-haut',
    category: 'vineyard',
    name: "Château Puech-Haut",
    description: "Luxury, art, and the region's most famous premium Rosé. Home to the giant barrel collection.",
    image: "https://images.unsplash.com/photo-1594132865922-38e555776d75?q=80&w=800&auto=format&fit=crop",
    distance: "25 min drive",
    fullDescription: "Puech-Haut is the heavyweight champion of modern Languedoc luxury. The estate is immaculate, famous for its 'Bib'Art' (painted barrels) and its omnipresent premium Rosé, Argali.",
    highlights: ["Painted Barrel Collection", "Premium Rosé", "Olive Oil Production"],
    bestFor: "Rosé Lovers & Art Fans",
    transportDetail: "Car required. East of .",
    signatureWine: "Argali Rosé",
    varietals: ["Grenache", "Cinsault"],
    entryCost: 20,
    lat: 43.6828,
    lng: 3.9785
  },
  {
    id: 'engarran',
    category: 'vineyard',
    name: "Château de l'Engarran",
    description: "A stunning 18th-century 'Folie' run by women for generations. Elegant wines in a historic setting.",
    // Image: Chateau gate/garden
    image: "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800&auto=format&fit=crop",
    distance: "20 min drive",
    fullDescription: "Located in Saint-Georges-d'Orques, this estate combines architectural beauty with viticultural excellence. The sculpted gardens and the 'Quetton Saint-Georges' bottle are iconic.",
    highlights: ["Women Winemakers", "18th Century Facade", "Park & Gardens"],
    bestFor: "Heritage & History",
    transportDetail: "Car or taxi recommended.",
    signatureWine: "La Lionne (Red)",
    varietals: ["Syrah", "Grenache", "Mourvèdre"],
    entryCost: 15,
    lat: 43.6055,
    lng: 3.8210
  },
  {
    id: 'haut-lirou',
    category: 'vineyard',
    name: "Domaine Haut-Lirou",
    description: "Adventure in the vines. Famous for their 4x4 vineyard tours up the slopes of the Pic Saint-Loup.",
    image: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=800&auto=format&fit=crop",
    distance: "30 min drive",
    fullDescription: "For those who want to get their boots dusty. This estate offers immersive tours taking you right up to the limestone cliffs of the Pic Saint-Loup.",
    highlights: ["4x4 Vineyard Tours", "Pic Saint-Loup Terroir", "Sunset Tastings"],
    bestFor: "Adventurers",
    transportDetail: "Car required.",
    signatureWine: "Le Coste",
    varietals: ["Syrah", "Grenache"],
    entryCost: 45,
    lat: 43.7220,
    lng: 3.8685
  },
  {
    id: 'saporta',
    category: 'vineyard',
    name: "Mas de Saporta",
    description: "The headquarters of Languedoc wine. A comprehensive tasting center representing the whole region.",
    // Image: Wine tasting room
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
    distance: "10 min drive",
    fullDescription: "Not a single estate, but the 'Maison des Vins'. It's the perfect place to start your journey, with hundreds of references from across the Languedoc available to taste and buy.",
    highlights: ["Hundreds of Wines", "Restaurant on site", "Easy Access"],
    bestFor: "Overview & Shopping",
    transportDetail: "Short taxi ride (Lattes).",
    signatureWine: "Regional Selection",
    varietals: ["All Languedoc Varietals"],
    entryCost: 10,
    lat: 43.5855,
    lng: 3.9050
  },
  {
    id: 'bas-aumelas',
    category: 'vineyard',
    name: "Château Bas d'Aumelas",
    description: "Medieval ruins meet modern organic winemaking. A fortress estate with a deep history.",
    // Image: Old stone ruins/castle
    image: "https://images.unsplash.com/photo-1569937756447-e24e526c4804?q=80&w=800&auto=format&fit=crop",
    distance: "35 min drive",
    fullDescription: "Owned by the d'Albenas family for centuries, this estate features the ruins of a medieval castle. They offer charming garden parties and rigorous organic wines.",
    highlights: ["Castle Ruins", "Organic Farming", "Garden Events"],
    bestFor: "Atmosphere",
    transportDetail: "Car required.",
    signatureWine: "Château Bas Rouge",
    varietals: ["Syrah", "Grenache"],
    entryCost: 20,
    lat: 43.6030,
    lng: 3.5955
  }
];

export const LANDMARK_DATA: ExplorationItem[] = [
  {
    id: 'comedie-landmark',
    category: 'landmark',
    name: "Place de la Comédie",
    description: "The oval heart of the city, dominated by the Opera house and the Three Graces fountain.",
    // Image: Comedie / Opera
    image: "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?q=80&w=800&auto=format&fit=crop", 
    distance: "City Center",
    fullDescription: "One of the largest pedestrian squares in Europe (known as 'L’oeuf'). It is the meeting point for everything and the heart of social life.",
    highlights: ["Opera Comédie", "Three Graces Fountain", "Haussmann Architecture"],
    bestFor: "People Watching",
    transportDetail: "Tram Lines 1 & 2 stop here.",
    entryCost: 0,
    lat: 43.6085,
    lng: 3.8795
  },
  {
    id: 'peyrou',
    category: 'landmark',
    name: "Promenade du Peyrou",
    description: "A royal esplanade with a statue of Louis XIV and views stretching to the Cévennes.",
    // Image: Peyrou / Louis XIV Statue
    image: "https://images.unsplash.com/photo-1512403913063-e380f68288ce?q=80&w=800&auto=format&fit=crop",
    distance: "5 min walk from Comédie",
    fullDescription: "A grand royal square designed as a majestic belvedere celebrating the French monarchy. Famous for its Sunday flea market and sunset views.",
    highlights: ["Panoramic Views", "Louis XIV Statue", "Water Tower"],
    bestFor: "Sunsets & Antiques",
    transportDetail: "Walk up Rue Foch.",
    entryCost: 0,
    lat: 43.6112,
    lng: 3.8708
  },
  {
    id: 'cathedrale-st-pierre',
    category: 'landmark',
    name: "Cathédrale Saint-Pierre",
    description: "Southern Gothic style cathedral with a fortress-like façade and massive porch.",
    // Image: Cathedral Facade
    image: "https://images.unsplash.com/photo-1565099707216-43d939bd9273?q=80&w=800&auto=format&fit=crop",
    distance: "Historic Center",
    fullDescription: "Built in 1364 by Pope Urban V, this is the only church in the historic area to survive the Wars of Religion. Its fortress-like appearance is unique.",
    highlights: ["Fortress Façade", "Massive Portico", "18th-century Organ"],
    bestFor: "Gothic Architecture",
    transportDetail: "Tram 4 (Peyrou - Arc de Triomphe).",
    entryCost: 0,
    lat: 43.6133,
    lng: 3.8735
  },
  {
    id: 'musee-fabre',
    category: 'landmark',
    name: "Musée Fabre",
    description: "One of France's largest fine arts collections, featuring European masters.",
    // Image: Museum Interior/Art
    image: "https://images.unsplash.com/photo-1549286699-b7b203c9497a?q=80&w=800&auto=format&fit=crop",
    distance: "Near Comédie",
    fullDescription: "Founded in 1825, this museum houses works by Rubens, David, Soulages, and more. It is considered one of the most prestigious art museums in Europe.",
    highlights: ["Soulages Wing", "European Masters", "Hôtel de Cabrières"],
    bestFor: "Art Lovers",
    transportDetail: "Tram 1 & 2 (Comédie).",
    entryCost: 9,
    lat: 43.6115,
    lng: 3.8805
  },
  {
    id: 'mikve',
    category: 'landmark',
    name: "Medieval Mikvé",
    description: "Exceptionally well-preserved 12th-century Jewish ritual bath located underground.",
    // Image: Stone Architecture / Underground
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop",
    distance: "Historic Center",
    fullDescription: "A testament to the importance of 's medieval Jewish community. This ritual bath is one of the best preserved in Europe.",
    highlights: ["Medieval History", "Jewish Heritage", "Underground Architecture"],
    bestFor: "History Tours",
    transportDetail: "Access via Tourist Office guided tours only.",
    entryCost: 12,
    lat: 43.6095,
    lng: 3.8770
  },
  {
    id: 'arbre-blanc-landmark',
    category: 'landmark',
    name: "L'Arbre Blanc",
    description: "The 'White Tree' tower with 193 cantilevered balconies.",
    // Image: L'Arbre Blanc
    image: "https://images.unsplash.com/photo-1678207606334-037352233c77?q=80&w=800&auto=format&fit=crop",
    distance: "Port Marianne",
    fullDescription: "A modern architectural 'Folie' designed by Sou Fujimoto. Awarded 'Building of the Year' in 2020.",
    highlights: ["Iconic Design", "Rooftop Bar", "Cantilevered Balconies"],
    bestFor: "Architecture Fans",
    transportDetail: "Tram 1 or 3 (Port Marianne).",
    entryCost: 0,
    lat: 43.6025,
    lng: 3.8990
  },
  {
    id: 'antigone',
    category: 'landmark',
    name: "Antigone District",
    description: "Neoclassical postmodern district inspired by Ancient Greece.",
    // Image: Antigone Architecture
    image: "https://images.unsplash.com/photo-1620037397753-936636733232?q=80&w=800&auto=format&fit=crop",
    distance: "East of Center",
    fullDescription: "Designed by Ricardo Bofill, this district features grand symmetrical plazas and columns, extending the city towards the Lez river.",
    highlights: ["Ricardo Bofill Design", "Grand Axis", "Place de l'Europe"],
    bestFor: "Urban Design",
    transportDetail: "Tram 1 (Antigone).",
    entryCost: 0,
    lat: 43.6075,
    lng: 3.8910
  },
  {
    id: 'jardin-plantes',
    category: 'landmark',
    name: "Jardin des Plantes",
    description: "France's oldest botanical garden, established in 1593.",
    // Image: Botanical Garden
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop",
    distance: "Historic Center",
    fullDescription: "Created for Henry IV, this garden served as a model for the one in Paris. It features historic greenhouses and a wishing tree.",
    highlights: ["Oldest in France", "Wishing Tree", "Historic Greenhouses"],
    bestFor: "Quiet Strolls",
    transportDetail: "Tram 4 (Albert 1er).",
    entryCost: 0,
    lat: 43.6138,
    lng: 3.8715
  },
  {
    id: 'arc-triomphe',
    category: 'landmark',
    name: "Porte du Peyrou",
    description: "Doric style triumphal arch honoring King Louis XIV.",
    // Image: Arc de Triomphe 
    image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=800&auto=format&fit=crop",
    distance: "Peyrou Entrance",
    fullDescription: "Built in 1693, this arch anchors the entrance to the Royal Place du Peyrou. You can climb to the top for a view.",
    highlights: ["Royal Entrance", "Panoramic View", "Louis XIV History"],
    bestFor: "Photo Ops",
    transportDetail: "Tram 4 (Peyrou).",
    entryCost: 5,
    lat: 43.6110,
    lng: 3.8720
  },
  {
    id: 'pierresvives',
    category: 'landmark',
    name: "Pierresvives",
    description: "Monolithic glass and concrete vessel designed by Zaha Hadid.",
    // Image: Modern Zaha Hadid architecture (generic modern building if exact unavailable, but finding close match)
    image: "https://images.unsplash.com/photo-1486744366881-5f13814694d6?q=80&w=800&auto=format&fit=crop",
    distance: "Alco District",
    fullDescription: "A stunning example of contemporary architecture housing the departmental archives and library. The design resembles a lying tree trunk.",
    highlights: ["Zaha Hadid Design", "Departmental Archives", "flowing lines"],
    bestFor: "Modern Architecture",
    transportDetail: "Bus access from center.",
    entryCost: 0,
    lat: 43.6265,
    lng: 3.8450
  }
];

export const Exploration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daytrips' | 'vineyards' | 'landmarks'>('daytrips');
  const [selectedItem, setSelectedItem] = useState<ExplorationItem | null>(null);
  const [realTimeDetails, setRealTimeDetails] = useState<PlaceDetails | null>(null);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const { addToPlan, removeFromPlan, isInPlan, travelers, items } = useTripPlanner();
  const { updateUserInterests, user } = useUser();

  const isAdded = selectedItem ? isInPlan(selectedItem.id) : false;
  const isBooked = selectedItem ? items.find(i => i.id === selectedItem.id)?.bookingStatus === 'booked' : false;

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
      setShowMap(false);
      const fetchData = async () => {
        setLoadingRealTime(true);
        setRealTimeDetails(null);
        const context = selectedItem.id === 'sete' ? 'Sète, France' 
                      : selectedItem.category === 'vineyard' ? 'Hérault, France'
                      : ', France';
        const details = await getPlaceDetails(selectedItem.name, context);
        setRealTimeDetails(details);
        setLoadingRealTime(false);
      };
      fetchData();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedItem]);

  // Update user interests in context whenever planner items change
  useEffect(() => {
      const explorationIds = items
        .filter(i => i.category === 'activity' || i.category === 'vineyard')
        .map(i => i.id);
      
      // Prevent infinite loop by checking equality
      if (user && JSON.stringify(user.interests) !== JSON.stringify(explorationIds)) {
          updateUserInterests(explorationIds);
      }
  }, [items, user, updateUserInterests]);

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
  };

  const handlePlanToggle = (e?: React.MouseEvent, item?: ExplorationItem) => {
      if (e) e.stopPropagation();
      const target = item || selectedItem;
      if (!target) return;
      
      if (isInPlan(target.id)) {
          removeFromPlan(target.id);
      } else {
          const cost = target.entryCost * travelers;
          addToPlan({ id: target.id, category: target.category === 'vineyard' ? 'vineyard' : 'activity', name: target.name, baseCost: target.entryCost, cost: cost, pricingType: target.entryCost > 0 ? 'perPerson' : 'fixed', image: target.image });
      }
  };

  const openDirections = () => {
      if (!selectedItem) return;
      const dest = selectedItem.lat && selectedItem.lng 
          ? `${selectedItem.lat},${selectedItem.lng}`
          : encodeURIComponent(selectedItem.name + ", France");
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const getActiveData = () => {
      switch(activeTab) {
          case 'vineyards': return VINEYARD_DATA;
          case 'landmarks': return LANDMARK_DATA;
          default: return DAY_TRIPS;
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* Context Column */}
        <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-12 space-y-8">
                <div>
                    <span className="text-med-terracotta font-bold uppercase tracking-[0.2em] text-[10px] block mb-2">Discovery</span>
                    <h2 className="font-serif text-4xl lg:text-5xl text-med-blue dark:text-white leading-none mb-6">
                        Southern<br />
                        <span className="italic text-med-terracotta">Expeditions</span>
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium italic mb-8">
                        "The soul of  lies in its surroundings. From the wild marshes of Camargue to the Roman temples of Nîmes."
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {[
                        { id: 'daytrips', label: 'Regional Trips', icon: Mountain, desc: 'Coast & Marshlands' },
                        { id: 'vineyards', label: 'Wine Terroir', icon: Wine, desc: 'Vineyard Excursions' },
                        { id: 'landmarks', label: 'City Heritage', icon: Landmark, desc: 'Historic Sights' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id as any)}
                            className={`flex items-center gap-4 p-5 rounded-2xl transition-all border text-left ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-med-blue border-med-blue shadow-lg -translate-x-1' : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800 hover:border-med-terracotta/30'}`}
                        >
                            <div className={`p-3 rounded-xl shrink-0 ${activeTab === tab.id ? 'bg-med-blue text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                <tab.icon size={18} />
                            </div>
                            <div>
                                <span className="block font-bold text-[11px] uppercase tracking-wider">{tab.label}</span>
                                <span className="text-[9px] opacity-60 leading-tight block font-medium">{tab.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content Column */}
        <div className="lg:w-2/3 min-h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {getActiveData().map((item) => {
                    const isItemAdded = isInPlan(item.id);
                    const isItemBooked = items.find(i => i.id === item.id)?.bookingStatus === 'booked';
                    
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedItem(item)} 
                            className={`bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-sm border transition-all duration-300 group flex flex-col h-full cursor-pointer relative hover:shadow-xl ${
                                isItemBooked 
                                ? 'border-emerald-600 ring-2 ring-emerald-600' 
                                : isItemAdded 
                                    ? 'border-med-olive ring-2 ring-med-olive' 
                                    : 'border-gray-100 dark:border-gray-800'
                            }`}
                        >
                            <div className="h-56 md:h-64 relative overflow-hidden shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                                <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/60 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-med-blue shadow-md border border-white/20 flex items-center gap-2">
                                    <MapPin size={12} className="text-med-terracotta"/>
                                    {item.distance}
                                </div>
                                {isItemAdded && (
                                    <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-2 shadow-lg z-20 ${
                                        isItemBooked ? 'bg-emerald-600 text-white' : 'bg-med-olive text-white'
                                    }`}>
                                        {isItemBooked ? <Ticket size={14} strokeWidth={4} /> : <Check size={14} strokeWidth={4} />}
                                        {isItemBooked ? 'Booked' : 'Selected'}
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <h3 className="font-serif text-3xl leading-none">{item.name}</h3>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8 flex-grow italic">"{item.description}"</p>
                                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className={`font-serif font-bold text-3xl ${isItemBooked ? 'text-emerald-600' : 'text-med-blue dark:text-white'}`}>
                                            {item.entryCost > 0 ? `$${(item.entryCost * travelers).toLocaleString()}` : 'Free'}
                                        </span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Est. Access Cost</span>
                                    </div>
                                    <div className={`p-3 rounded-xl transition-all ${isItemAdded ? (isItemBooked ? 'bg-emerald-600 text-white' : 'bg-med-olive text-white') : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Modal Logic standardized */}
        {selectedItem && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-med-blue/60 dark:bg-gray-950/80 backdrop-blur-md p-4 transition-opacity duration-300" onClick={() => setSelectedItem(null)}>
                <div className="bg-white dark:bg-gray-900 w-full max-w-5xl h-auto max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300 border border-white/10" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-30 p-2 text-gray-400 hover:text-med-terracotta hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-300 bg-white/20 backdrop-blur-md"><X size={24} /></button>
                    
                    {/* Image/Map Side */}
                    <div className="h-56 md:h-auto md:w-2/5 relative shrink-0 bg-gray-100 dark:bg-gray-800 group">
                        {showMap ? (
                            <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                src={`https://maps.google.com/maps?q=${
                                  selectedItem.lat && selectedItem.lng 
                                    ? `${selectedItem.lat},${selectedItem.lng}`
                                    : encodeURIComponent(selectedItem.name + ", France")
                                }&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                                className="w-full h-full grayscale-[20%] contrast-[1.1] dark:invert-[.9] dark:grayscale-[.5] transition-all duration-500"
                                title="Map"
                            />
                        ) : (
                            <>
                                <img src={realTimeDetails?.imageUrl || selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden"></div>
                                <div className="absolute bottom-6 left-6 md:hidden text-white font-serif text-3xl font-bold">{selectedItem.name}</div>
                            </>
                        )}
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }}
                            className="absolute bottom-4 right-4 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-med-blue dark:text-white shadow-lg border border-white/20 hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            {showMap ? <><ImageIcon size={14} /> Photo</> : <><MapIcon size={14} /> Map</>}
                        </button>
                    </div>

                    <div className="flex-1 p-8 md:p-14 overflow-y-auto bg-white dark:bg-gray-900">
                        <div className="mb-10 hidden md:block">
                            <h2 className="font-serif text-4xl md:text-5xl text-med-blue dark:text-white leading-tight mb-4">{selectedItem.name}</h2>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                                <MapPin size={14} className="text-med-terracotta" /> {selectedItem.distance}
                            </div>
                        </div>
                        
                        {loadingRealTime && (
                            <div className="flex items-center gap-2 text-sm text-med-terracotta animate-pulse mb-6 bg-med-terracotta/5 p-2 rounded-lg w-max">
                                <Loader2 size={14} className="animate-spin"/> Connecting to live data...
                            </div>
                        )}

                        <div className="space-y-10">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base font-medium italic">"{realTimeDetails?.summary || selectedItem.fullDescription || selectedItem.description}"</p>
                            
                            {selectedItem.highlights && (
                                <div>
                                    <h4 className="font-bold text-med-blue dark:text-blue-200 text-xs uppercase tracking-widest mb-3">Highlights</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedItem.highlights.map((highlight, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <div className="h-1.5 w-1.5 rounded-full bg-med-terracotta mt-1.5 shrink-0"></div>
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-gray-100 dark:border-gray-800">
                                <button 
                                    onClick={(e) => handlePlanToggle(e)}
                                    disabled={isBooked}
                                    className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-[10px] shadow-xl ${
                                        isBooked 
                                        ? 'bg-emerald-600 text-white shadow-emerald-600/20 cursor-default'
                                        : isAdded 
                                            ? 'bg-med-olive text-white shadow-med-olive/20' 
                                            : 'bg-med-blue text-white hover:bg-med-terracotta'
                                    }`}
                                >
                                    {isBooked ? (
                                        <><Ticket size={18} strokeWidth={4}/> Confirmed</>
                                    ) : isAdded ? (
                                        <><Check size={18} strokeWidth={4}/> On Plan</> 
                                    ) : (
                                        <><Plus size={18}/> Add to Wishlist</>
                                    )}
                                </button>
                                <button 
                                    onClick={openDirections}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-med-blue transition-colors"
                                >
                                    Get Directions <Navigation size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
