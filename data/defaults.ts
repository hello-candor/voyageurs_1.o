
import { HotelCategory, DiningCategory, AgendaEvent, ExplorationItem, ActivityItem, InfoSection, CelebrationContent, GalleryContent, LandingContent } from '../types';

// --- HOTELS ---
export const DEFAULT_HOTEL_DATA: HotelCategory[] = [
  {
    id: 'luxury',
    title: 'Luxury',
    iconName: 'Shield',
    description: "The crown jewels of Montpellier.",
    hotels: [
      {
        name: "Hôtel Richer De Belleval",
        image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512918760513-95f6929562eb?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 5,
        tag: "Historic Center",
        priceLevel: 5,
        lat: 43.6118,
        lng: 3.8762,
        description: "Relais & Châteaux in a 17th-century mansion.",
        link: "https://www.hotel-richerdebelleval.com/",
        categoryId: 'luxury',
        fullDescription: "A masterpiece of heritage restoration on the Place de la Canourgue. Michelin-starred dining and pure elegance.",
        highlights: ["Relais & Châteaux", "Michelin-starred dining", "17th-century frescoes"],
        transportDetail: "10 min walk from Gare Saint-Roch.",
        averageRate: "$380 - $600",
        baseRate: 450
      },
      {
        name: "Hôtel Oceania Le Métropole",
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 4,
        tag: "Near Gare St-Roch",
        priceLevel: 4,
        lat: 43.6052,
        lng: 3.8825,
        description: "19th-century grandeur with a hidden garden and pool.",
        link: "https://www.oceaniahotels.com/en/hotel/oceania-le-metropole-",
        categoryId: 'luxury',
        fullDescription: "Built in 1898, this prestigious hotel combines the grandeur of the Belle Époque with contemporary luxury.",
        highlights: ["Outdoor swimming pool", "Exotic inner garden", "Historic building"],
        transportDetail: "2 min walk from Gare Saint-Roch.",
        averageRate: "$185 - $260",
        baseRate: 220
      }
    ]
  },
  {
    id: 'lifestyle',
    title: 'Modern',
    iconName: 'Zap',
    description: "Vibrant and contemporary stays.",
    hotels: [
      {
        name: "JOST Hotel",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 4,
        tag: "Near Station",
        priceLevel: 3,
        lat: 43.6025,
        lng: 3.8845,
        description: "Hip, modern hotel with a rooftop pool and vibrant social club.",
        link: "https://jost-hotels.com/montpellier/",
        categoryId: 'lifestyle',
        fullDescription: "A lifestyle destination featuring a rooftop pool, food court, and cool events. Perfect for the modern traveler.",
        highlights: ["Rooftop Pool", "Food Court", "Modern Design"],
        transportDetail: "5 min walk from the station.",
        averageRate: "$120 - $180",
        baseRate: 150
      }
    ]
  },
  {
    id: 'value',
    title: 'Value',
    iconName: 'Wallet',
    description: "Comfortable and convenient.",
    hotels: [
      {
        name: "Aparthotel Adagio",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 3,
        tag: "Antigone",
        priceLevel: 2,
        lat: 43.6075,
        lng: 3.8895,
        description: "Modern serviced apartments in the striking Antigone district.",
        link: "https://www.adagio-city.com/",
        categoryId: 'value',
        fullDescription: "Spacious apartments with kitchens, located in the neoclassical Antigone neighborhood.",
        highlights: ["Kitchenettes", "Central Location", "Great Value"],
        transportDetail: "10 min walk to Place de la Comédie.",
        averageRate: "$90 - $140",
        baseRate: 110
      }
    ]
  }
];

// --- DINING ---
export const DEFAULT_DINING_DATA: DiningCategory[] = [
  {
    id: 'coffee',
    title: 'Coffee',
    iconName: 'Coffee',
    description: "Specialty brews & flat whites.",
    restaurants: [
      {
        name: "Coldrip",
        image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
        priceLevel: 1,
        cuisine: "Specialty Coffee",
        description: "The go-to spot for Australian-style flat whites.",
        googleQuery: "Coldrip Food Coffee Montpellier",
        fullDescription: "Montpellier's specialty coffee scene is growing, and Coldrip leads the pack.",
        highlights: ["Specialty Coffee", "Avocado Toast", "English Spoken"],
        signature: "Flat White & Banana Bread.",
        website: "https://www.instagram.com/coldrip_/",
        openingHours: "Mon-Fri: 8:00 AM – 4:00 PM, Sat-Sun: 10:00 AM – 5:00 PM",
        reservationLink: "",
        lat: 43.6092,
        lng: 3.8765
      }
    ]
  },
  {
    id: 'brunch',
    title: 'Brunch',
    iconName: 'Utensils',
    description: "Lazy weekends & savory plates.",
    restaurants: [
      {
        name: "Bonobo",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Brunch & Coffee",
        description: "The undisputed king of  brunch.",
        googleQuery: "Bonobo Montpellier",
        fullDescription: "You will wait in line, and it will be worth it. Bonobo brought the serious brunch game to Montpellier.",
        highlights: ["Best Brunch", "Hip Crowd", "Great Coffee"],
        signature: "Salted Caramel Pancakes.",
        website: "https://bonobo.fr/",
        openingHours: "Daily: 9:00 AM – 4:00 PM",
        lat: 43.6083,
        lng: 3.8771
      }
    ]
  },
  {
    id: 'dinner',
    title: 'Dinner',
    iconName: 'Moon',
    description: "Gastronomy & ambiance.",
    restaurants: [
      {
        name: "Le Jardin des Sens",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop", // Poolside Dining Image
        priceLevel: 4,
        cuisine: "1 Star • Haute Cuisine",
        description: "The Pourcel brothers' legendary return in a 17th-century setting.",
        googleQuery: "Le Jardin des Sens Montpellier",
        fullDescription: "Located within the sumptuous Hôtel Richer de Belleval, the Pourcel brothers have reclaimed their stars. This is Montpellier's most prestigious dining experience, blending history with avant-garde gastronomy.",
        highlights: ["Michelin Star", "Pourcel Brothers", "Historic Setting"],
        signature: "Pressed lobster with crystalized lemon.",
        website: "https://www.hotel-richerdebelleval.com/en/restaurant-jardin-des-sens",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        reservationLink: "https://www.hotel-richerdebelleval.com/en/restaurant-jardin-des-sens",
        lat: 43.6118,
        lng: 3.8762
      },
      {
        name: "Pastis Restaurant",
        image: "https://images.unsplash.com/photo-1550966871-3ed3c6227b3f?q=80&w=800&auto=format&fit=crop",
        priceLevel: 4,
        cuisine: "Gastronomic Bistro",
        description: "Daniel Lutrand's celebrated creative cuisine.",
        googleQuery: "Pastis Restaurant Montpellier",
        fullDescription: "Not to be confused with the casual 'Le Pastis', this is a serious gastronomic destination. Chef Daniel Lutrand serves inventive, visually stunning plates.",
        highlights: ["Michelin Guide", "Creative Plating", "Intimate"],
        signature: "Pigeon with seasonal garnish.",
        website: "https://www.pastis-restaurant.com/",
        openingHours: "Tue-Sat: 7:30 PM – 9:30 PM",
        reservationLink: "https://www.pastis-restaurant.com/reservation",
        lat: 43.6088,
        lng: 3.8778
      }
    ]
  }
];

// --- AGENDA ---
export const DEFAULT_AGENDA_DATA: AgendaEvent[] = [
    {
        id: 'welcome',
        day: "Friday",
        date: "2026-09-18",
        startTime: "19:30",
        durationHours: 4,
        time: "7:30 PM",
        title: "Welcome Party",
        subtitle: "L'Arbre Blanc Rooftop",
        location: "L'Arbre Blanc, Montpellier",
        description: "Join us for a welcome cocktail as we watch the sunset over the Lez from this architectural masterpiece.",
        iconName: 'GlassWater',
        image: "/assets/images/arbre_blanc_welcome_1775592709000.png",
        isOfficial: true
    },
    {
        id: 'vineyard',
        day: "Saturday",
        date: "2026-09-19",
        startTime: "10:30",
        durationHours: 5,
        time: "10:30 AM",
        title: "Wine Tour",
        subtitle: "Pic Saint-Loup Vineyards",
        location: "Pic Saint-Loup",
        description: "An optional morning tour and tasting in the most beautiful vineyards of the region.",
        iconName: 'Wine',
        image: "/assets/images/pic_st_loup_wine_1775592728604.png",
        isOfficial: true
    },
    {
        id: 'gala',
        day: "Saturday",
        date: "2026-09-19",
        startTime: "19:30",
        durationHours: 6,
        time: "7:30 PM",
        title: "The Celebration",
        subtitle: "MO.CO Montpellier Contemporain",
        location: "MO.CO, Montpellier",
        description: "The main event. A night of art, music, and local gastronomy in the heart of the city.",
        iconName: 'Star',
        image: "/assets/images/moco_main_event_1775592765525.png",
        isOfficial: true
    },
    {
        id: 'brunch',
        day: "Sunday",
        date: "2026-09-20",
        startTime: "12:00",
        durationHours: 3,
        time: "12:00 PM",
        title: "Farewell Brunch",
        subtitle: "Effet Mer Beach Club",
        location: "La Grande Motte",
        description: "Recovery brunch on the beach. Feet in the sand, salt in the air. A perfect end to the weekend.",
        iconName: 'Sun',
        image: "/assets/images/effet_mer_brunch_1775592776785.png",
        isOfficial: true
    }
];

// --- EXPLORATION & ACTIVITIES ---
export const DEFAULT_EXPLORATION_DATA: ExplorationItem[] = [
  {
    id: 'sete',
    category: 'activity',
    name: 'Sète',
    description: 'Known as the "Venice of Languedoc", famous for its canals, seafood, and the panoramic view from Mont Saint-Clair.',
    image: 'https://images.unsplash.com/photo-1582297773238-66236371720d?q=80&w=800&auto=format&fit=crop', 
    distance: '30 min train',
    fullDescription: "Sète is a fascinating island-city caught between the Mediterranean Sea and the Thau Lagoon.",
    highlights: ["Panoramic view from Mont Saint-Clair", "Eating 'Tielle Sétoise'", "Boat tours of the oyster beds"],
    bestFor: "Seafood lovers & Photographers",
    transportDetail: "Trains run every 20-30 minutes from Montpellier Saint-Roch.",
    entryCost: 20,
    lat: 43.4025,
    lng: 3.6961
  }
];

export const DEFAULT_ACTIVITY_DATA: ActivityItem[] = [
    {
        id: 'gaspard',
        category: 'nightlife',
        name: 'Gaspard',
        description: 'Intimate speakeasy-style cocktail bar.',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800&auto=format&fit=crop',
        tags: ['Cocktails', 'Speakeasy'],
        baseCost: 20,
        pricingType: 'perPerson',
        locationQuery: 'Gaspard Cocktail Bar Montpellier',
        priceLevel: 2,
        lat: 43.6085,
        lng: 3.8780
    }
];

// --- LANDING PAGE INFO ---
export const DEFAULT_LANDING_CONTENT: LandingContent = {
    title: "Voyageurs",
    subtitle: "September 18-20",
    quote: "Gathering my favorite people in a city that captures the heart. A weekend of art, wine, and the Mediterranean sun.",
    infoSections: [
      {
        id: 'overview',
        tabLabel: 'Vibe',
        tabIcon: 'Landmark',
        tabDesc: 'City Roots',
        title: 'A City of Contrasts',
        description: "Montpellier is a rare treasure born of the Middle Ages, rising from commerce and intellect rather than conquest.",
        stats: [
            { label: "Founded", value: "985 AD" },
            { label: "Sunshine", value: "300 Days" }
        ],
        items: [
          { 
            title: "Walking History", 
            iconName: 'Scroll', 
            desc: "We'll be walking on 1,000-year-old stones. The center is a pedestrian maze where getting lost is the whole point.",
            image: "https://images.unsplash.com/photo-1565099707216-43d939bd9273?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },
      {
        id: 'travel',
        tabLabel: 'Travel',
        tabIcon: 'Plane',
        tabDesc: 'Getting There',
        title: 'Your Route to MPL',
        description: "Montpellier is easily accessible via direct flights or high-speed TGV from major European hubs.",
        stats: [
            { label: "TGV from Paris", value: "3h 15m" },
            { label: "Direct Flights", value: "Daily" }
        ],
        items: [
          { 
            title: "Via Paris (CDG)", 
            iconName: 'Navigation', 
            desc: "Fly into Paris and take the TGV directly from the airport or Gare de Lyon to Montpellier Saint-Roch.",
            image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Via Barcelona (BCN)", 
            iconName: 'Navigation', 
            desc: "A great option for longer trips. Take the Renfe/SNCF train (3h) or a shuttle/bla-bla-car (3.5h).",
            image: "https://images.unsplash.com/photo-1583997051651-8255c48b7fca?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Direct to MPL", 
            iconName: 'Plane', 
            desc: "Flights from London, Amsterdam, Berlin, and Paris arrive daily at Montpellier-Méditerranée airport.",
            image: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800&auto=format&fit=crop"
          }
        ]
      }
    ]
};
export const DEFAULT_LANDING_INFO = DEFAULT_LANDING_CONTENT.infoSections;

// --- CELEBRATION (NEW) ---
export const DEFAULT_CELEBRATION_DATA: CelebrationContent = {
    title: "A Weekend To Remember",
    subtitle: "The Occasion",
    quote: "It is not the years in your life that count, but the life in your years. And the people you share them with.",
    tabs: [
        {
            id: 'reason',
            label: 'Why MPL',
            subtitle: 'Personal',
            iconName: 'Heart',
            title: 'The Joy of Life',
            quote: "Montpellier makes you realize just how great life can be—think golden skies, a vibrant buzz, and that feeling that you don't have to rush anywhere!",
            text: "For my 40th, I want to gather all my favorite people in a city that has always captured my imagination, in a country that stole my heart. They call Montpellier La Douée—The Gifted One—and it truly is. I really hope you’ll join me to celebrate great times, reconnect with one another, and enjoy the simple pleasures of life, the French way.",
            image: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 'guests',
            label: 'Atmosphere',
            subtitle: 'Expectations',
            iconName: 'MessageCircle',
            title: 'Feast & Friendship',
            quote: "The best memories are made gathered around a table.",
            text: "Expect long, lazy dinners that stretch into the night. Simple but exceptional seafood, local wines, and the warm Mediterranean breeze.",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop" // People Dining Image
        }
    ]
};

// --- GALLERY (NEW) ---
export const DEFAULT_GALLERY_CONTENT: GalleryContent = {
    title: "Capturing The Light",
    subtitle: "The Atmosphere",
    quote: "The south of France is defined by its unique light—the way it hits the limestone in the afternoon and the vineyards at sunset.",
    collections: [
        {
            id: '',
            title: "City",
            subtitle: "Exploration",
            description: "The historic heart, hidden courtyards, and grand promenades.",
            iconName: 'Landmark',
            images: [
                {
                    url: "https://images.unsplash.com/photo-1565099707216-43d939bd9273?q=80&w=1200&auto=format&fit=crop", // City Street Image
                    alt: "Narrow Streets",
                    caption: "Getting Lost",
                    description: "The best plan is no plan. We'll spend hours just wandering these medieval streets finding hidden bars.",
                    link: "https://www.montpellier-france.com/discover/the-essential/l-ecusson-historic-centre/"
                },
                {
                    url: "https://images.unsplash.com/photo-1512403913063-e380f68288ce?q=80&w=1200&auto=format&fit=crop",
                    alt: "Promenade",
                    caption: "Sunset Views",
                    description: "The Peyrou is where we'll watch the sun go down. It feels like you can see the entire world from here.",
                    link: "https://www.montpellier-france.com/discover/the-essential/promenade-du-peyrou/"
                }
            ]
        },
        {
            id: 'region',
            title: "Nature",
            subtitle: "Escapes",
            description: "From wild salt flats to Roman aqueducts and azure canals.",
            iconName: 'Mountain',
            images: [
                {
                    url: "https://images.unsplash.com/photo-1629834877771-5503b136814c?q=80&w=1200&auto=format&fit=crop",
                    alt: "Village",
                    caption: "Timeless",
                    description: "St-Guilhem feels like a movie set. We're going to feel very small and very peaceful here.",
                    link: "https://www.saintguilhem-valleeherault.fr/en/"
                },
                {
                    url: "https://images.unsplash.com/photo-1533519896016-522f67623912?q=80&w=1200&auto=format&fit=crop",
                    alt: "Wildlife",
                    caption: "Wild Side",
                    description: "The Camargue is wild—pink flamingos and salt flats. It's unlike anywhere else on earth.",
                    link: "https://www.camargue.fr/"
                }
            ]
        },
        {
            id: 'lifestyle',
            title: "Mood",
            subtitle: "The Good Life",
            description: "Gastronomy, viticulture, and the slow pleasure of the southern sun.",
            iconName: 'Wine',
            images: [
                {
                    url: "https://images.unsplash.com/photo-1523525227702-603400a42429?q=80&w=1200&auto=format&fit=crop",
                    alt: "Celebration",
                    caption: "The Squad",
                    description: "Bringing everyone together for a weekend of celebration, laughter, and memories in the south of France.",
                    link: "#"
                },
                {
                    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop",
                    alt: "Market",
                    caption: "Morning Ritual",
                    description: "Les Halles. We are going to eat so many oysters here. It's loud, chaotic, and delicious.",
                    link: "https://www.montpellier.fr/structure/1897/24-halles-castellane-structures.htm"
                },
                {
                    url: "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=1200&auto=format&fit=crop",
                    alt: "Vineyards",
                    caption: "Golden Hour",
                    description: "This light. This wine. This is what I want the whole weekend to feel like.",
                    link: "https://www.tourisme-picsaintloup.fr/en/savor/wines-and-local-products/"
                }
            ]
        }
    ]
};
export const DEFAULT_GALLERY_DATA = DEFAULT_GALLERY_CONTENT.collections; // Backward compatibility alias

// --- APP CONFIG ---
export const DEFAULT_CONFIG = {
  id: 'default',
  appName: "Voyageurs",
  destination: "Montpellier, France",
  occasion: "The 40th Birthday",
  heroImage: "/assets/images/arbre_blanc_welcome_1775592709000.png",
  videoUrl: "https://www.youtube.com/embed/bRbUJZTIcUw?autoplay=1&mute=1&controls=0&loop=1&playlist=bRbUJZTIcUw&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1",
  welcomeMessage: "Forty Years In Good Company",
  enableAI: true,
  hubUnlocked: false,
  modules: [
    { id: 'rsvp', label: 'RSVP Manager', isEnabled: true, description: "Allows guests to confirm attendance and dietary needs." },
    { id: 'messages', label: 'Chat System', isEnabled: true, description: "Group chat and direct messaging between guests." },
    { id: 'logistics', label: 'Trip Planner', isEnabled: true, description: "Travel bookings, hotel selection, and custom itineraries." },
    { id: 'calendar', label: 'Agenda', isEnabled: true, description: "The official schedule of events for the weekend." },
    { id: 'activities', label: 'Activities', isEnabled: true, description: "Curated lists of things to do, dining, and nightlife." },
    { id: 'guide', label: 'Guide Book', isEnabled: true, description: "Static content about the destination, etiquette, and packing." },
    { id: 'map', label: 'Global Map', isEnabled: true, description: "Interactive map showing all points of interest." },
    { id: 'registry', label: 'Guest Registry', isEnabled: true, description: "Directory of attending guests and interest matching." },
    { id: 'expenses', label: 'Expense Ledger', isEnabled: true, description: "Shared bill splitting and expense tracking." },
  ],
  content: {
      accommodation: DEFAULT_HOTEL_DATA,
      dining: DEFAULT_DINING_DATA,
      agenda: DEFAULT_AGENDA_DATA,
      exploration: DEFAULT_EXPLORATION_DATA,
      activities: DEFAULT_ACTIVITY_DATA,
      landing: DEFAULT_LANDING_CONTENT,
      celebration: DEFAULT_CELEBRATION_DATA,
      gallery: DEFAULT_GALLERY_CONTENT
  },
  theme: {
    primaryColor: '#355070',
    primaryLightColor: '#B4C6D8',
    backgroundColor: '#FDFBF7',
    accentColor: '#D67252',
    successColor: '#8A9A5B'
  }
};