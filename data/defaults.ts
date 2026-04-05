
import { HotelCategory, DiningCategory, AgendaEvent, ExplorationItem, ActivityItem, InfoSection, CelebrationContent, GalleryContent, LandingContent } from '../types';

// --- HOTELS ---
export const DEFAULT_HOTEL_DATA: HotelCategory[] = [
  {
    id: 'romantic',
    title: 'Romantic',
    iconName: 'Heart',
    description: "Charming spots in L'Écusson.",
    hotels: [
      {
        name: "Grand Hôtel du Midi",
        image: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop", // Balcony Image
        gallery: [
            "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560185009-dddeb820c7b7?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 4,
        tag: "Place de la Comédie",
        priceLevel: 3,
        lat: 43.6085,
        lng: 3.8795,
        description: "Art Nouveau charm directly on the Place de la Comédie.",
        link: "https://www.grandhoteldumidi.com/",
        categoryId: 'romantic',
        fullDescription: "A historic institution in Montpellier, this Haussmann-style hotel sits proudly on the Place de la Comédie. Recently renovated with a 'Les Trois Graces' theme.",
        highlights: ["Directly on Place de la Comédie", "Art Nouveau architecture", "Next to the Opera House"],
        transportDetail: "2 min walk from Tram lines 1 & 2 (Comédie stop).",
        averageRate: "$175 - $240",
        baseRate: 200
      },
      {
        name: "Hôtel Oceania Le Métropole",
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 4,
        tag: "Near Gare St-Roch",
        priceLevel: 3,
        lat: 43.6052,
        lng: 3.8825,
        description: "19th-century grandeur with a hidden garden and pool.",
        link: "https://www.oceaniahotels.com/en/hotel/oceania-le-metropole-",
        categoryId: 'romantic',
        fullDescription: "Built in 1898, this prestigious hotel combines the grandeur of the Belle Époque with contemporary luxury. The hidden gem is its exotic garden.",
        highlights: ["Outdoor swimming pool", "Exotic inner garden", "Historic 19th-century building"],
        transportDetail: "2 min walk from Gare Saint-Roch.",
        averageRate: "$185 - $260",
        baseRate: 220
      }
    ]
  },
  {
    id: 'luxury',
    title: 'Luxury',
    iconName: 'Shield',
    description: "Unforgettable service.",
    hotels: [
      {
        name: "Hôtel Richer De Belleval",
        image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop", // Mansion Facade
        gallery: [
            "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512918760513-95f6929562eb?q=80&w=800&auto=format&fit=crop", // Interior Clock
            "https://images.unsplash.com/photo-1554647286-f365d7defc2d?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 5,
        tag: "Historic Center",
        priceLevel: 5,
        lat: 43.6118,
        lng: 3.8762,
        description: "Relais & Châteaux in a 17th-century mansion.",
        link: "https://www.hotel-richerdebelleval.com/",
        categoryId: 'luxury',
        fullDescription: "A masterpiece of heritage restoration. Formerly a 17th-century town hall, now a Relais & Châteaux property where art, history, and gastronomy collide.",
        highlights: ["Relais & Châteaux", "Michelin-starred dining", "17th-century frescoes"],
        transportDetail: "10 min walk from Gare Saint-Roch.",
        averageRate: "$380 - $600",
        baseRate: 450
      },
      {
        name: "Domaine de Verchant",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop", // Pool Image
        gallery: [
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1574643156929-51fa59890306?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"
        ],
        tag: "Castelnau-le-Lez",
        stars: 5,
        priceLevel: 5,
        lat: 43.6300,
        lng: 3.9300,
        description: "5-star spa and vineyard estate on the outskirts.",
        link: "https://www.domainedeverchant.com/en/",
        categoryId: 'luxury',
        fullDescription: "Nestled in 42 acres of vineyards, this 5-star hotel and spa offers the ultimate luxury escape. The design is fiercely modern.",
        highlights: ["21,500 sq ft Spa", "Michelin-plate dining", "Surrounded by vineyards"],
        transportDetail: "15 min taxi from City Center.",
        averageRate: "$330 - $550",
        baseRate: 400
      }
    ]
  },
  {
    id: 'budget',
    title: 'Value',
    iconName: 'Wallet',
    description: "Convenience on a budget.",
    hotels: [
      {
        name: "Best Western Plus Comedie",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"
        ],
        stars: 4,
        tag: "Gare Saint-Roch",
        priceLevel: 2,
        lat: 43.6045,
        lng: 3.8805,
        description: "Modern comfort and excellent value next to the station.",
        link: "https://www.bestwestern.fr/fr/hotel--Best-Western-Plus-Comedie-Saint-Roch-93630",
        categoryId: 'budget',
        fullDescription: "A stylish and contemporary choice for those prioritizing convenience. Located just steps from Gare Saint-Roch.",
        highlights: ["Near Gare Saint-Roch", "Modern Design", "Great Value"],
        transportDetail: "1 min walk from Gare Saint-Roch.",
        averageRate: "$110 - $160",
        baseRate: 130
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
        startTime: "18:00",
        durationHours: 4,
        time: "6:00 PM",
        title: "L'Apéro de Bienvenue",
        subtitle: "Sunset Welcome",
        location: "Promenade du Peyrou",
        description: "The weekend kicks off on a rooftop overlooking the Arceaux aqueduct. Think local wines, tapas, and golden hour vibes.",
        iconName: 'GlassWater',
        image: "https://images.unsplash.com/photo-1512403913063-e380f68288ce?q=80&w=800&auto=format&fit=crop", // Arc de Triomphe Image
        isOfficial: true
    },
    {
        id: 'vineyard',
        day: "Saturday",
        date: "2026-09-19",
        startTime: "11:00",
        durationHours: 5,
        time: "11:00 AM",
        title: "Tour du Vin",
        subtitle: "Vineyard Excursion",
        location: "Pic Saint-Loup",
        description: "A private shuttle whisks us to the Pic Saint-Loup for a tasting followed by a rustic lunch amongst the vines.",
        iconName: 'Wine',
        image: "https://images.unsplash.com/photo-1534234828563-02399873494a?q=80&w=800&auto=format&fit=crop",
        isOfficial: true
    },
    {
        id: 'gala',
        day: "Saturday",
        date: "2026-09-19",
        startTime: "19:30",
        durationHours: 6,
        time: "7:30 PM",
        title: "La Grande Fête",
        subtitle: "The 40th Birthday",
        location: "Private Chateau",
        description: "The main event. A black-tie dinner in a private folly followed by dancing under the stars.",
        iconName: 'Star',
        image: "https://images.unsplash.com/photo-1519225468359-2996bc017a1d?q=80&w=800&auto=format&fit=crop",
        isOfficial: true
    },
    {
        id: 'brunch',
        day: "Sunday",
        date: "2026-09-20",
        startTime: "11:30",
        durationHours: 3,
        time: "11:30 AM",
        title: "Le Brunch",
        subtitle: "Recovery & Farewell",
        location: "L'Écusson Garden",
        description: "A slow, restorative brunch to share stories from the night before. Fresh pastries and strong coffee.",
        iconName: 'Sun',
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop",
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
    title: "L'Art de Vivre",
    subtitle: "The Destination",
    quote: "I selected {config.destination} for its unique blend of charm and energy. A place where the sun shines and the rhythm of life is set by the clinking of glasses.",
    infoSections: [
      {
        id: 'overview',
        tabLabel: 'Overview',
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
            image: "https://images.unsplash.com/photo-1565099707216-43d939bd9273?q=80&w=800&auto=format&fit=crop" // Street Image
          },
          { 
            title: "Smart & Sexy", 
            iconName: 'GraduationCap', 
            desc: "It's home to the world's oldest med school. The vibe is intellectual but incredibly young and alive.",
            image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Street Art Soul", 
            iconName: 'Palette', 
            desc: "Look for the trompe-l'œil murals. The city respects its past but loves modern creativity.",
            image: "https://images.unsplash.com/photo-1545989253-02cc26577f88?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "La Douée", 
            iconName: 'Gem', 
            desc: "\"The Gifted One\"—that's the nickname. Beautiful, lucky, and endowed with charm. Fits the occasion, right?",
            image: "https://images.unsplash.com/photo-1522582324369-2dfc36bd9273?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },
      {
        id: 'atmosphere',
        tabLabel: 'Atmosphere',
        tabIcon: 'Sparkles',
        tabDesc: 'Vibrant Soul',
        title: 'What to Expect',
        description: "Montpellier buzzes with student energy while maintaining a slow, deliberate Mediterranean pace of life.",
        stats: [
            { label: "Metro Pop", value: "570k" },
            { label: "Under 30", value: "50%" }
        ],
        items: [
          { 
            title: "The SF Vibe", 
            iconName: 'Zap', 
            desc: "It's the 'San Francisco of France'—progressive, tech-forward, and full of trams. It feels familiar, just better.",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Terrace Culture", 
            iconName: 'Sun', 
            desc: "Life happens outside here. 300 days of sun means the plazas are basically living rooms.",
            image: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "The Soundtrack", 
            iconName: 'Music', 
            desc: "As the 'Electronic Capital', the beat never stops. Whether we hit a club or a lounge, the music scene is elite.",
            image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Endless Lunch", 
            iconName: 'Wine', 
            desc: "Lunch is sacred. Wine is cheaper than water. We are going to lean all the way into this.",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
          }
        ]
      },
      {
        id: 'climate',
        tabLabel: 'Climate',
        tabIcon: 'ThermometerSun',
        tabDesc: 'Indian Summer',
        title: 'The September Vibe',
        description: "L'Été Indien—summer crowds have vanished, but the sea is warm and vineyards turn gold.",
        stats: [
            { label: "Avg High", value: "80°F" },
            { label: "Avg Low", value: "65°F" }
        ],
        items: [
          { 
            title: "Beach Days", 
            iconName: 'Waves', 
            desc: "The sea is still warm from August. Bring a swimsuit, we might need a dip.",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Golden Hour", 
            iconName: 'Wine', 
            desc: "It's harvest season ('vendanges'). The vineyards turn gold and the light is unbelievable.",
            image: "https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "La Rentrée", 
            iconName: 'Music', 
            desc: "The city wakes up in September. Art festivals, open-air cinema, buzzing energy.",
            image: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Room to Breathe", 
            iconName: 'Sparkles', 
            desc: "The tourist crush is gone. We get the city to ourselves, like locals.",
            image: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?q=80&w=800&auto=format&fit=crop"
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
  appName: "September 18-20",
  destination: "Montpellier, France",
  occasion: "The 40th Birthday",
  heroImage: "https://images.unsplash.com/photo-1512403913063-e380f68288ce?q=80&w=1920&auto=format&fit=crop", // Arc de Triomphe Background
  videoUrl: "https://www.youtube.com/embed/bRbUJZTIcUw?autoplay=1&mute=1&controls=0&loop=1&playlist=bRbUJZTIcUw&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1&playsinline=1",
  welcomeMessage: "Forty Years In Good Company",
  enableAI: true,
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