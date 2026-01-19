import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { X, Search, Navigation, Plus, Check, MapPin, Hotel, Utensils, Wine, Mountain, Music, Car, Bus, Footprints, Smartphone, ArrowRight, Locate, Loader2, Calendar, Heart, Star, Bed, Umbrella, ShoppingBag, Rainbow, DollarSign, Filter, Sparkles, MessageCircle, Quote, ExternalLink, Tag } from 'lucide-react';
import { DEFAULT_HOTEL_DATA as HOTEL_DATA, DEFAULT_AGENDA_DATA as AGENDA_DATA } from '../data/defaults';
import { DINING_DATA } from '../data';
import { DAY_TRIPS, VINEYARD_DATA as EXPLORATION_VINEYARDS, LANDMARK_DATA } from './Exploration';
import { NIGHTLIFE_DATA, BEACH_DATA, SHOPPING_DATA, LGBT_DATA } from './Activities';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useUser } from '../context/UserContext';
import { getPlaceDetails, PlaceDetails } from '../services/geminiService';
import { Button } from './Button';

// Fix for Leaflet default icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Categories to Lucide Icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
    'Stay': Bed,
    'Dining': Utensils,
    'Vineyard': Wine,
    'Nightlife': Music,
    'Beach': Umbrella,
    'Shopping': ShoppingBag,
    'Activity': Mountain,
    'Agenda': Calendar
};

type CategoryType = 'All' | 'Agenda' | 'Stay' | 'Dining' | 'Vineyard' | 'Nightlife' | 'Beach' | 'Shopping' | 'Activity' | 'Favorites';

interface MapItem {
    id: string;
    name: string;
    category: CategoryType;
    subCategory?: string;
    lat: number;
    lng: number;
    image: string;
    description: string;
    rating?: number;
    priceLevel?: number;
    isFavorite?: boolean;
    isConfirmedStay?: boolean;
    isAgenda?: boolean;
    eventTime?: string;
    tags?: string[];
    isLGBTFriendly?: boolean;
}

// --- Custom Hook to Center Map ---
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
    }, [center, zoom, map]);
    return null;
};

// --- Click Handler for Background Dismiss ---
const MapEvents: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    useMapEvents({
        click: () => {
            onDismiss();
        },
    });
    return null;
};

export const GlobalMap: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.610769, 3.876716]); // Montpellier Center
  const [mapZoom, setMapZoom] = useState(13);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // Real-time details state
  const [realTimeDetails, setRealTimeDetails] = useState<PlaceDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Filters
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [isLGBTMode, setIsLGBTMode] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'price' | 'type' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { addToPlan, removeFromPlan, isInPlan, travelers } = useTripPlanner();
  const { user } = useUser();

  // Close dropdowns on click outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setOpenDropdown(null);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Place Details when item is selected
  useEffect(() => {
    if (selectedItem) {
        setIsLoadingDetails(true);
        setRealTimeDetails(null);
        // Determine context based on category if possible, or default
        const context = selectedItem.category === 'Vineyard' ? "Hérault, France" : "Montpellier, France";
        getPlaceDetails(selectedItem.name, context).then(data => {
            setRealTimeDetails(data);
            setIsLoadingDetails(false);
        });
    }
  }, [selectedItem]);

  // --- Data Aggregation ---
  const allLocations = useMemo(() => {
      const locs: MapItem[] = [];
      const userInterests = user?.interests || [];
      const confirmedHotelName = user?.officialItinerary?.hotel?.name;

      const isFav = (id: string) => userInterests.includes(id);

      // 1. Agenda Items (Manually mapped coordinates for specific venues)
      const agendaCoords: Record<string, [number, number]> = {
          'welcome': [43.6111, 3.8705], // Arceaux/Peyrou area
          'vineyard': [43.7935, 3.8432], // Hortus approx
          'gala': [43.6120, 3.9220], // Flaugergues
          'brunch': [43.6138, 3.8715] // Jardin des Plantes
      };

      AGENDA_DATA.forEach(evt => {
          const coords = agendaCoords[evt.id];
          if (coords) {
              locs.push({
                  id: evt.id,
                  name: evt.title,
                  category: 'Agenda',
                  subCategory: evt.day,
                  lat: coords[0],
                  lng: coords[1],
                  image: evt.image,
                  description: evt.description,
                  isAgenda: true,
                  eventTime: `${evt.day} • ${evt.time}`,
                  tags: ['Event']
              });
          }
      });

      // 2. Hotels
      HOTEL_DATA.forEach(cat => cat.hotels.forEach(h => {
          if (h.lat && h.lng) locs.push({ 
              id: h.name, 
              name: h.name, 
              category: 'Stay', 
              subCategory: cat.title,
              lat: h.lat, 
              lng: h.lng, 
              image: h.image, 
              description: h.description, 
              rating: h.stars, 
              priceLevel: h.priceLevel,
              isConfirmedStay: h.name === confirmedHotelName,
              isFavorite: isFav(h.name),
              tags: [h.tag || 'Hotel', cat.title]
          });
      }));

      // 3. Dining
      DINING_DATA.forEach(cat => cat.restaurants.forEach(r => {
          if (r.lat && r.lng) locs.push({ 
              id: r.name, 
              name: r.name, 
              category: 'Dining', 
              subCategory: cat.title,
              lat: r.lat, 
              lng: r.lng, 
              image: r.image, 
              description: r.description, 
              priceLevel: r.priceLevel,
              isFavorite: isFav(r.name),
              tags: [cat.title, r.cuisine]
          });
      }));

      // 4. Exploration
      [...DAY_TRIPS, ...EXPLORATION_VINEYARDS, ...LANDMARK_DATA].forEach(item => {
          if ((item as any).lat && (item as any).lng) locs.push({ 
              id: item.id, 
              name: item.name, 
              category: item.category === 'vineyard' ? 'Vineyard' : 'Activity', 
              subCategory: 'Explore',
              lat: (item as any).lat, 
              lng: (item as any).lng, 
              image: item.image, 
              description: item.description,
              isFavorite: isFav(item.id),
              tags: [(item as any).bestFor, item.category === 'vineyard' ? 'Wine' : 'Sightseeing']
          });
      });

      // 5. Activities (Nightlife, Beach, Shopping, LGBT)
      [...NIGHTLIFE_DATA, ...BEACH_DATA, ...SHOPPING_DATA, ...LGBT_DATA].forEach(item => {
          if (item.lat && item.lng) {
              let cat: CategoryType = 'Activity';
              if (item.category === 'nightlife') cat = 'Nightlife';
              else if (item.category === 'beaches') cat = 'Beach';
              else if (item.category === 'shopping') cat = 'Shopping';
              
              locs.push({ 
                  id: item.id, 
                  name: item.name, 
                  category: cat, 
                  subCategory: item.category,
                  lat: item.lat, 
                  lng: item.lng, 
                  image: item.image, 
                  description: item.description,
                  isFavorite: isFav(item.id),
                  priceLevel: item.priceLevel,
                  tags: item.tags,
                  isLGBTFriendly: item.isLGBTFriendly || item.category === 'lgbt'
              });
          }
      });

      return locs;
  }, [user]);

  // --- Derived Data for Filters ---
  const availableTags = useMemo(() => {
      const tags = new Set<string>();
      allLocations.forEach(item => {
          if (activeCategory === 'All' || item.category === activeCategory) {
              item.tags?.forEach(tag => tags.add(tag));
          }
      });
      return Array.from(tags).filter(t => !t.startsWith('$')).sort();
  }, [allLocations, activeCategory]);

  // --- Filtering ---
  const filteredLocations = useMemo(() => {
      return allLocations.filter(loc => {
          if (activeCategory === 'Favorites' && !loc.isFavorite) return false;
          if (activeCategory === 'Agenda' && !loc.isAgenda) return false;
          
          if (activeCategory !== 'All' && activeCategory !== 'Favorites' && activeCategory !== 'Agenda') {
              if (loc.category !== activeCategory) return false;
          }

          if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
          if (priceFilter && loc.priceLevel !== priceFilter) return false;
          if (tagFilter && !loc.tags?.includes(tagFilter)) return false;
          if (isLGBTMode && !loc.isLGBTFriendly) return false;

          return true;
      });
  }, [allLocations, activeCategory, searchQuery, priceFilter, tagFilter, isLGBTMode]);

  // Reset filters on category change
  useEffect(() => {
      setTagFilter(null);
      setPriceFilter(null);
  }, [activeCategory]);

  // --- Actions ---
  
  const handleCloseDetails = useCallback(() => {
      setSelectedItem(null);
      // We maintain filters/search when clicking away to allow browsing the filtered results
  }, []);

  const clearFilters = useCallback(() => {
      setSearchQuery('');
      setPriceFilter(null);
      setTagFilter(null);
      setIsLGBTMode(false);
  }, []);

  // --- Geolocation Handler ---
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const newPos: [number, number] = [latitude, longitude];
            setUserLocation(newPos);
            setMapCenter(newPos);
            setMapZoom(16);
            setIsLocating(false);
        },
        (error) => {
            console.error("Error retrieving location:", error);
            setIsLocating(false);
            alert("Unable to retrieve your location.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // --- Custom Marker Icon Generator ---
  const createCustomIcon = useCallback((item: MapItem, isSelected: boolean, isBooked: boolean) => {
      let iconColor = 'bg-med-blue';
      
      let IconComponent = CATEGORY_ICONS[item.category] || CATEGORY_ICONS['Activity'];
      
      // Base Colors
      if (item.category === 'Stay') iconColor = 'bg-blue-600';
      else if (item.category === 'Dining') iconColor = 'bg-med-terracotta';
      else if (item.category === 'Vineyard') iconColor = 'bg-purple-600';
      else if (item.category === 'Nightlife') iconColor = 'bg-indigo-600';
      else if (item.category === 'Beach') iconColor = 'bg-cyan-500';
      else if (item.category === 'Shopping') iconColor = 'bg-pink-500';
      else if (item.category === 'Agenda') iconColor = 'bg-med-terracotta';
      else iconColor = 'bg-emerald-600'; // Activity

      // Specific Icon Overrides
      if (item.isConfirmedStay) {
          iconColor = 'bg-med-olive';
          IconComponent = Bed;
      } else if (item.isAgenda) {
          iconColor = 'bg-med-terracotta';
          IconComponent = Calendar;
      }

      // Generate HTML string for the icon using React render to string
      const iconHtml = renderToStaticMarkup(
          <div className="flex items-center justify-center w-full h-full text-white">
              <IconComponent size={16} strokeWidth={2.5} />
          </div>
      );

      const animationClass = isSelected ? 'animate-subtle-pulse' : '';
      const sizeClass = isSelected ? 'w-14 h-14' : 'w-9 h-9';
      const zIndex = isSelected ? 'z-[1000]' : item.isAgenda ? 'z-[900]' : 'z-[100]';
      const border = isSelected ? 'border-4 border-white dark:border-gray-800' : 'border-2 border-white dark:border-gray-800';
      const shadow = isSelected ? 'shadow-2xl' : 'shadow-lg';

      // Badges
      let badges = '';
      if (item.isFavorite) {
          badges += `<div class="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm text-med-terracotta">${renderToStaticMarkup(<Heart size={10} fill="currentColor" />)}</div>`;
      } else if (isBooked) {
          badges += `<div class="absolute -top-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm text-med-olive">${renderToStaticMarkup(<Check size={10} strokeWidth={4} />)}</div>`;
      }

      const html = `
        <div class="relative flex items-center justify-center ${sizeClass} ${animationClass} rounded-full ${iconColor} ${border} ${shadow} transition-all transform hover:scale-110 ${zIndex}">
            ${badges}
            ${iconHtml}
        </div>
      `;

      return L.divIcon({
          html: html,
          className: 'bg-transparent',
          iconSize: isSelected ? [56, 56] : [36, 36],
          iconAnchor: isSelected ? [28, 56] : [18, 36],
      });
  }, []);

  const userIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-6 h-6">
            <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div>
            <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
        </div>
    `,
    className: 'bg-transparent',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const handleMarkerClick = (item: MapItem) => {
      setSelectedItem(item);
      setMapCenter([item.lat, item.lng]);
      setMapZoom(16);
      // We do NOT set the search query here, to allow browsing without narrowing the filter
  };

  const handlePlanToggle = () => {
      if (!selectedItem) return;
      if (isInPlan(selectedItem.id)) {
          removeFromPlan(selectedItem.id);
      } else {
          addToPlan({
              id: selectedItem.id,
              category: selectedItem.category === 'Dining' ? 'dining' : selectedItem.category === 'Stay' ? 'hotel' : 'activity',
              name: selectedItem.name,
              baseCost: 50, // Generic estimate for map adds
              cost: 50 * travelers,
              pricingType: 'perPerson',
              details: selectedItem.description,
              image: selectedItem.image
          });
      }
  };

  const filterCategories: CategoryType[] = ['All', 'Agenda', 'Favorites', 'Stay', 'Dining', 'Vineyard', 'Nightlife', 'Beach', 'Shopping', 'Activity'];
  const hasActiveFilters = !!searchQuery || !!priceFilter || !!tagFilter || isLGBTMode;

  return (
    <div className="w-full h-full relative flex flex-col animate-in fade-in duration-300">
      
      {/* 1. Header & Filters - Positioned absolutely over map for full bleed effect */}
      <div className="absolute top-0 left-0 right-0 z-[401] p-4 flex flex-col gap-4 pointer-events-none">
          
          {/* Top Bar with Filters */}
          <div className="flex flex-col gap-2 pointer-events-auto" ref={dropdownRef}>
              <div className="flex gap-2">
                  <div className="flex-1 min-w-[200px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 flex items-center px-4 py-3">
                      <Search className="text-gray-400 mr-3 shrink-0" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search locations..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none w-full text-sm font-medium text-med-blue dark:text-white placeholder:text-gray-400"
                      />
                      {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400" /></button>}
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                        <button 
                            onClick={() => setIsLGBTMode(!isLGBTMode)}
                            className={`p-3 rounded-2xl transition-all border shadow-lg ${
                                isLGBTMode 
                                ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 text-purple-600 border-purple-200 dark:text-white dark:border-white/20 backdrop-blur-xl' 
                                : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 border-white/20 dark:border-gray-700 hover:text-purple-500 backdrop-blur-xl'
                            }`}
                            title="LGBTQ+ Friendly Filter"
                        >
                            <Rainbow size={18} />
                        </button>

                        <div className="relative">
                            <button 
                                onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
                                className={`p-3 rounded-2xl transition-all border shadow-lg backdrop-blur-xl ${
                                    priceFilter 
                                    ? 'bg-med-blue text-white border-med-blue' 
                                    : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 border-white/20 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                                }`}
                                title="Price Filter"
                            >
                                <DollarSign size={18} />
                            </button>
                            {openDropdown === 'price' && (
                                <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-200">
                                    <button onClick={() => { setPriceFilter(null); setOpenDropdown(null); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500">Any Price</button>
                                    {[1, 2, 3, 4].map(p => (
                                        <button 
                                            key={p} 
                                            onClick={() => { setPriceFilter(p); setOpenDropdown(null); }} 
                                            className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 ${priceFilter === p ? 'text-med-blue dark:text-white' : 'text-gray-500'}`}
                                        >
                                            {'$'.repeat(p)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                                className={`p-3 rounded-2xl transition-all border shadow-lg backdrop-blur-xl ${
                                    tagFilter 
                                    ? 'bg-med-blue text-white border-med-blue' 
                                    : 'bg-white/90 dark:bg-gray-900/90 text-gray-400 border-white/20 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                                }`}
                                title="Type Filter"
                            >
                                <Filter size={18} />
                            </button>
                            {openDropdown === 'type' && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto">
                                    <button onClick={() => { setTagFilter(null); setOpenDropdown(null); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500">All Types</button>
                                    {availableTags.map(tag => (
                                        <button 
                                            key={tag} 
                                            onClick={() => { setTagFilter(tag); setOpenDropdown(null); }} 
                                            className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 ${tagFilter === tag ? 'text-med-blue dark:text-white' : 'text-gray-500'}`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                  </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 animate-in fade-in slide-in-from-top-2">
                      {priceFilter && (
                          <button onClick={() => setPriceFilter(null)} className="flex items-center gap-1 px-3 py-1.5 bg-med-blue text-white rounded-lg text-[10px] font-bold uppercase shadow-sm">
                              {'$'.repeat(priceFilter)} <X size={10} />
                          </button>
                      )}
                      {tagFilter && (
                          <button onClick={() => setTagFilter(null)} className="flex items-center gap-1 px-3 py-1.5 bg-med-blue text-white rounded-lg text-[10px] font-bold uppercase shadow-sm">
                              {tagFilter} <X size={10} />
                          </button>
                      )}
                      {isLGBTMode && (
                          <button onClick={() => setIsLGBTMode(false)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-[10px] font-bold uppercase shadow-sm">
                              LGBT Friendly <X size={10} />
                          </button>
                      )}
                      <button onClick={clearFilters} className="px-3 py-1.5 text-gray-500 hover:text-med-terracotta text-[10px] font-bold uppercase underline">
                          Clear All
                      </button>
                  </div>
              )}
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pointer-events-auto pb-2 px-1">
              {filterCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all whitespace-nowrap border flex items-center gap-2 ${
                        activeCategory === cat 
                        ? 'bg-med-blue text-white border-med-blue scale-105' 
                        : 'bg-white/90 dark:bg-gray-900/90 text-gray-500 dark:text-gray-400 border-white/20 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                  >
                      {cat === 'Agenda' && <Calendar size={12} />}
                      {cat === 'Favorites' && <Heart size={12} />}
                      {cat === 'Stay' && <Hotel size={12} />}
                      {cat === 'Dining' && <Utensils size={12} />}
                      {cat === 'Vineyard' && <Wine size={12} />}
                      {cat === 'Nightlife' && <Music size={12} />}
                      {cat === 'Beach' && <Umbrella size={12} />}
                      {cat === 'Shopping' && <ShoppingBag size={12} />}
                      {cat === 'Activity' && <Mountain size={12} />}
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      {/* 2. Map Container */}
      <div className="flex-1 relative z-0 w-full h-full">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="z-0"
          >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <ZoomControl position="bottomright" />
              <MapController center={mapCenter} zoom={mapZoom} />
              <MapEvents onDismiss={handleCloseDetails} />

              {/* User Location Marker */}
              {userLocation && (
                  <>
                    <Marker position={userLocation} icon={userIcon} zIndexOffset={1000} />
                    <Circle center={userLocation} radius={100} pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 1 }} />
                  </>
              )}

              {filteredLocations.map(item => {
                  const isBooked = isInPlan(item.id);
                  const isSelected = selectedItem?.id === item.id;
                  const icon = createCustomIcon(item, isSelected, isBooked);
                  
                  return (
                      <Marker 
                        key={item.id} 
                        position={[item.lat, item.lng]}
                        icon={icon}
                        eventHandlers={{
                            click: (e) => {
                                L.DomEvent.stopPropagation(e); // Prevent map click from firing
                                handleMarkerClick(item);
                            },
                        }}
                      />
                  );
              })}
          </MapContainer>
          
          {/* Locate Me Floating Button */}
          <button 
            onClick={handleLocateUser}
            disabled={isLocating}
            className="absolute bottom-32 right-4 z-[401] w-14 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 flex items-center justify-center text-med-blue dark:text-blue-300 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="animate-spin" size={24} /> : <Locate size={24} />}
          </button>
      </div>

      {/* 3. Detail Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseDetails}>
              <div 
                className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300 border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                  {/* Close Button */}
                  <button 
                    onClick={handleCloseDetails} 
                    className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                  >
                    <X size={20} />
                  </button>

                  {/* Left: Image/Visuals */}
                  <div className="md:w-2/5 h-64 md:h-auto relative bg-gray-100 dark:bg-gray-800 shrink-0">
                      <img 
                        src={realTimeDetails?.imageUrl || selectedItem.image} 
                        alt={selectedItem.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r" />
                      
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                          <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                  {selectedItem.category}
                              </span>
                              {selectedItem.priceLevel && (
                                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                      {'$'.repeat(selectedItem.priceLevel)}
                                  </span>
                              )}
                          </div>
                          <h3 className="font-serif text-3xl md:text-4xl leading-none mb-2">{selectedItem.name}</h3>
                          
                          {/* Rating Badge */}
                          {(realTimeDetails?.rating || selectedItem.rating) && (
                              <div className="flex items-center gap-1 text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={14} fill={i < Math.round(realTimeDetails?.rating || selectedItem.rating || 0) ? "currentColor" : "none"} strokeWidth={2} />
                                  ))}
                                  <span className="text-white text-xs font-bold ml-1">{realTimeDetails?.rating || selectedItem.rating}</span>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Right: Content & Details */}
                  <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
                      <div className="flex-1 overflow-y-auto p-8 space-y-8">
                          
                          {/* Loading State */}
                          {isLoadingDetails && (
                              <div className="flex items-center gap-3 text-med-terracotta bg-med-terracotta/5 p-4 rounded-xl border border-med-terracotta/10 animate-pulse">
                                  <Loader2 size={18} className="animate-spin" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Fetching live details from Google...</span>
                              </div>
                          )}

                          {/* Description / Summary */}
                          <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-med-blue dark:text-blue-200 mb-3 flex items-center gap-2">
                                  <Sparkles size={14} /> Overview
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base font-serif italic">
                                  "{realTimeDetails?.summary || selectedItem.description}"
                              </p>
                          </div>

                          {/* Google Reviews Highlight */}
                          {realTimeDetails?.reviewSummary && (
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                      <MessageCircle size={12} /> Guest Sentiment
                                  </h4>
                                  <div className="flex gap-4">
                                      <Quote size={24} className="text-med-terracotta/40 shrink-0" />
                                      <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {realTimeDetails.reviewSummary}
                                      </p>
                                  </div>
                              </div>
                          )}

                          {/* Address & Sources */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {realTimeDetails?.address && (
                                  <div>
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Address</h4>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">{realTimeDetails.address}</p>
                                  </div>
                              )}
                              
                              {realTimeDetails?.sources && realTimeDetails.sources.length > 0 && (
                                  <div>
                                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Links</h4>
                                      <div className="flex flex-wrap gap-2">
                                          {realTimeDetails.sources.slice(0,2).map((s, i) => (
                                              <a 
                                                key={i} 
                                                href={s.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-med-blue dark:text-blue-300 hover:text-med-terracotta transition-colors truncate max-w-full"
                                              >
                                                  <ExternalLink size={10} /> {s.title}
                                              </a>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-white dark:bg-gray-900 z-10">
                          <Button 
                            onClick={handlePlanToggle}
                            variant={isInPlan(selectedItem.id) ? "success" : "primary"}
                            fullWidth
                            size="lg"
                          >
                              {isInPlan(selectedItem.id) ? (
                                  <><Check size={16} className="mr-2" /> Added to Plan</>
                              ) : (
                                  <><Plus size={16} className="mr-2" /> Add to Trip</>
                              )}
                          </Button>
                          
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedItem.lat},${selectedItem.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                              <Button variant="secondary" fullWidth size="lg">
                                  <Navigation size={16} className="mr-2" /> Directions
                              </Button>
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};