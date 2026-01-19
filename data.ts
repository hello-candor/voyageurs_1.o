
import { Coffee, Sun, Utensils, CloudSun, Wine, Moon } from 'lucide-react';
import React from 'react';

// --- Interfaces ---
export interface Restaurant {
  name: string;
  image: string;
  priceLevel: number; // 1-4 scale
  cuisine: string;
  description: string;
  googleQuery: string;
  fullDescription?: string;
  highlights?: string[];
  signature?: string;
  website?: string;
  openingHours?: string;
  reservationLink?: string;
  lat?: number;
  lng?: number;
}

export interface DiningCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  restaurants: Restaurant[];
}

// --- Data ---
export const DINING_DATA: DiningCategory[] = [
  {
    id: 'coffee',
    title: 'Coffee',
    icon: Coffee,
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
        website: "https://www.instagram.com/coldrip_montpellier/",
        openingHours: "Mon-Fri: 8:00 AM – 4:00 PM, Sat-Sun: 10:00 AM – 5:00 PM",
        reservationLink: "",
        lat: 43.6092,
        lng: 3.8765
      },
      {
        name: "Café Bun",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop",
        priceLevel: 1,
        cuisine: "Specialty Coffee & Buns",
        description: "Minimalist aesthetic with serious extraction skills.",
        googleQuery: "Café Bun Montpellier",
        fullDescription: "A temple to caffeine in the Saint-Roch district. Their cinnamon buns are legendary.",
        highlights: ["V60 Filter", "Cinnamon Buns", "Minimalist Decor"],
        signature: "Filter Coffee & Cardamom Bun.",
        website: "https://www.cafebun.fr/",
        openingHours: "Tue-Sat: 8:30 AM – 5:30 PM",
        lat: 43.6061,
        lng: 3.8782
      },
      {
        name: "Napoleon Dynamite",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Coffee & Cookies",
        description: "Hip, retro-styled spot on Place de la Canourgue.",
        googleQuery: "Napoleon Dynamite Montpellier",
        fullDescription: "Located on the most beautiful square in Montpellier, this is the place to see and be seen while drinking excellent brew.",
        highlights: ["Terrace on Canourgue", "Homemade Cookies", "Retro Vibe"],
        signature: "Iced Latte on the terrace.",
        website: "https://www.instagram.com/napoleondynamitecafe/",
        openingHours: "Tue-Sun: 10:00 AM – 7:00 PM",
        lat: 43.6125,
        lng: 3.8760
      }
    ]
  },
  {
    id: 'breakfast',
    title: 'Breakfast',
    icon: Sun,
    description: "Bakeries & morning light.",
    restaurants: [
      {
        name: "Des Rêves et du Pain",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
        priceLevel: 1,
        cuisine: "Artisan Bakery",
        description: "Award-winning bakery in the historic shield. Essential morning stop.",
        googleQuery: "Des Rêves et du Pain Montpellier",
        fullDescription: "Winner of 'La Meilleure Boulangerie de France'. Their croissants are buttery perfection, and the ancient stone oven breads are legendary.",
        highlights: ["Award Winning", "Ancient Stone Oven", "Best Croissant"],
        signature: "Traditional Baguette & Pain au Chocolat.",
        website: "https://www.facebook.com/desrevesetdupain/",
        openingHours: "Tue-Sun: 7:30 AM – 7:30 PM",
        lat: 43.6105,
        lng: 3.8742
      },
      {
        name: "Maison b",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Patisserie & Salon",
        description: "Elegant pastries in a refined setting.",
        googleQuery: "Maison b Montpellier",
        fullDescription: "A modern salon de thé offering exquisite pastries that look like jewels. Perfect for a quiet, refined start to the day.",
        highlights: ["Visual Pastries", "Quiet Atmosphere", "Gourmet Hot Chocolate"],
        signature: "The 'Tarte Citron' revisited.",
        website: "https://maison-b-montpellier.fr/",
        openingHours: "Wed-Sun: 9:00 AM – 7:00 PM",
        lat: 43.6098,
        lng: 3.8785
      },
      {
        name: "Scholler",
        image: "https://images.unsplash.com/photo-1612203985729-70726954388c?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Historic Patisserie",
        description: "A Montpellier institution since 1962.",
        googleQuery: "Scholler Patisserie Montpellier",
        fullDescription: "The classic French patisserie experience. Their breakfast formulas are generous and steeped in tradition.",
        highlights: ["Traditional Cakes", "Central Location", "Family Owned"],
        signature: "Kougelhopf (Alsatian Brioche).",
        website: "https://www.scholler.fr/",
        openingHours: "Daily: 8:00 AM – 7:30 PM",
        lat: 43.6080,
        lng: 3.8810
      }
    ]
  },
  {
    id: 'brunch',
    title: 'Brunch',
    icon: Utensils,
    description: "Lazy weekends & savory plates.",
    restaurants: [
      {
        name: "Bonobo",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Brunch & Coffee",
        description: "The undisputed king of Montpellier brunch.",
        googleQuery: "Bonobo Montpellier",
        fullDescription: "You will wait in line, and it will be worth it. Bonobo brought the serious brunch game to Montpellier.",
        highlights: ["Best Brunch", "Hip Crowd", "Great Coffee"],
        signature: "Salted Caramel Pancakes.",
        website: "https://bonobomontpellier.fr/",
        openingHours: "Daily: 9:00 AM – 4:00 PM",
        lat: 43.6083,
        lng: 3.8771
      },
      {
        name: "Domaine de Biar",
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Farm-to-Table Brunch",
        description: "Grand Sunday brunch on an eco-responsible estate.",
        googleQuery: "Domaine de Biar Lavérune",
        fullDescription: "The perfect 'farewell' venue. Located just outside the city, this eco-estate focuses on slow food and permaculture. Their Sunday brunch is legendary.",
        highlights: ["Permaculture Garden", "Live Jazz", "Eco-Estate Setting"],
        signature: "The Sunday Brunch Buffet.",
        website: "https://domainedebiar.com/",
        openingHours: "Sun Brunch: 11:30 AM – 3:00 PM (Dinner Thu-Sat)",
        reservationLink: "https://domainedebiar.com/restaurant/",
        lat: 43.5852,
        lng: 3.8123
      },
      {
        name: "Toast",
        image: "https://images.unsplash.com/photo-1525351453337-07757b83870e?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Avocado & Eggs",
        description: "Colorful, healthy, and extremely photogenic plates.",
        googleQuery: "Toast Montpellier",
        fullDescription: "A cozy spot dedicated to the art of toast. From avocado smash to decadent french toast.",
        highlights: ["Vegetarian Friendly", "Cute Decor", "Fresh Juices"],
        signature: "Avocado Toast with Pomegranate.",
        website: "https://www.toast-montpellier.fr/",
        openingHours: "Tue-Sun: 10:00 AM – 3:00 PM",
        lat: 43.6078,
        lng: 3.8765
      },
      {
        name: "Les Demoiselles de Montpellier",
        image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Gluten-Free Salon",
        description: "A charming allergy-friendly tea salon.",
        googleQuery: "Les Demoiselles de Montpellier",
        fullDescription: "Famous for being 100% gluten-free and dairy-free without sacrificing taste. A haven for those with dietary restrictions.",
        highlights: ["100% Gluten Free", "Vegan Options", "Cozy Interior"],
        signature: "Savory Waffles.",
        website: "https://lesdemoisellesdemontpellier.fr/",
        openingHours: "Tue-Sat: 11:30 AM – 6:00 PM",
        lat: 43.6065,
        lng: 3.8790
      }
    ]
  },
  {
    id: 'lunch',
    title: 'Lunch',
    icon: CloudSun,
    description: "Sun-drenched terraces.",
    restaurants: [
      {
        name: "Le Petit Jardin",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Bistronomy & Garden",
        description: "A hidden sanctuary in the Écusson with views of the cathedral bell tower.",
        googleQuery: "Le Petit Jardin Montpellier",
        fullDescription: "A true hidden gem in the heart of the city. Le Petit Jardin offers two experiences: a gourmet restaurant for fine dining and a 'bistrot' for a more casual lunch.",
        highlights: ["Secret Garden Terrace", "Cathedral Views", "Seasonal Menu"],
        signature: "Roasted sea bass with fennel mousseline.",
        website: "https://www.lepetitjardin.fr/",
        openingHours: "Daily: 12:00 PM – 2:00 PM, 7:00 PM – 10:00 PM",
        reservationLink: "https://www.lepetitjardin.fr/en/book-a-table",
        lat: 43.6120,
        lng: 3.8745
      },
      {
        name: "Rosemarie",
        image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Mediterranean Kitchen",
        description: "A charming terrace spot that feels like grandma's kitchen.",
        googleQuery: "Rosemarie Montpellier",
        fullDescription: "Tucked away in a quiet square, Rosemarie focuses on 'cuisine de grand-mère' with a Mediterranean twist.",
        highlights: ["Hidden Terrace", "Ethical Sourcing", "Family Recipes"],
        signature: "Shared Mediterranean platter with homemade hummus.",
        website: "https://www.rosemarie.fr/",
        openingHours: "Tue-Sat: 12:00 PM – 2:00 PM, 7:00 PM – 10:00 PM",
        reservationLink: "https://www.rosemarie.fr/reservation",
        lat: 43.6095,
        lng: 3.8770
      },
      {
        name: "Terminal #1",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Bistro Chic",
        description: "The Pourcel brothers' iconic bistro in a converted wine warehouse.",
        googleQuery: "Terminal #1 Montpellier",
        fullDescription: "Founded by the Pourcel brothers, Terminal #1 is a vibrant, trendy spot located on the banks of the Lez river. The decor is industrial-chic.",
        highlights: ["Celebrity Chefs", "Industrial Design", "River Views"],
        signature: "Squid fricassée with chorizo.",
        website: "https://www.terminalpourcel.com/",
        openingHours: "Daily: 12:00 PM – 2:00 PM, 7:30 PM – 10:00 PM",
        reservationLink: "https://www.terminalpourcel.com/en/booking/",
        lat: 43.5992,
        lng: 3.8975
      },
      {
        name: "Les Halles Laissac",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
        priceLevel: 1,
        cuisine: "Food Market",
        description: "A circular covered market with diverse food stalls.",
        googleQuery: "Halles Laissac Montpellier",
        fullDescription: "For a casual, high-energy lunch, grab food from the various vendors (oysters, empanadas, cheese) and sit at the high tables in the center.",
        highlights: ["Diverse Options", "Local Vibe", "Affordable"],
        signature: "Oyster platter with white wine.",
        website: "https://www.montpellier.fr/4166-halles-laissac.htm",
        openingHours: "Tue-Sun: 8:00 AM – 2:00 PM",
        lat: 43.6055,
        lng: 3.8768
      },
      {
        name: "Burger et Blanquette",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "French Comfort",
        description: "Where burgers meet traditional French stew.",
        googleQuery: "Burger et Blanquette Montpellier",
        fullDescription: "A playful concept that executes both modern burgers and traditional blanquette de veau perfectly. Great terrace on the Esplanade.",
        highlights: ["Esplanade Terrace", "Generous Portions", "Fun Vibe"],
        signature: "The Classic Blanquette.",
        website: "https://www.burgeretblanquette.fr/",
        openingHours: "Daily: 12:00 PM – 2:30 PM, 7:00 PM – 10:30 PM",
        lat: 43.6102,
        lng: 3.8805
      }
    ]
  },
  {
    id: 'apero',
    title: 'Apero',
    icon: Wine,
    description: "Cocktails & golden hour.",
    restaurants: [
      {
        name: "Gaspard",
        image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Cocktail Bar",
        description: "Intimate, speakeasy-style cocktail mastery.",
        googleQuery: "Gaspard Cocktail Bar Montpellier",
        fullDescription: "Gaspard creates poetry in a glass. The menu changes regularly based on seasonal fruits and herbs.",
        highlights: ["Mixology", "Intimate Setting", "Seasonal Menu"],
        signature: "Ask for the 'Creation of the Day'.",
        openingHours: "Tue-Sat: 6:00 PM – 1:00 AM",
        lat: 43.6085,
        lng: 3.8780
      },
      {
        name: "Le Parfum",
        image: "https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Cocktails & Dim Sum",
        description: "Chic, dim-lit speakeasy vibe with Asian influences.",
        googleQuery: "Le Parfum Montpellier",
        fullDescription: "A feast for the senses. Le Parfum combines expert mixology with delicate Asian tapas.",
        highlights: ["Creative Cocktails", "Paper Lantern Decor", "Late Night Food"],
        signature: "The 'Geisha' cocktail and steamer baskets.",
        website: "https://www.barleparfum.com/",
        openingHours: "Tue-Sat: 6:00 PM – 1:00 AM",
        reservationLink: "https://www.barleparfum.com/reservation",
        lat: 43.6072,
        lng: 3.8791
      },
      {
        name: "Aperture",
        image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Photogenic Cocktails",
        description: "Minimalist, scientific approach to cocktails.",
        googleQuery: "Aperture Montpellier",
        fullDescription: "Led by award-winning bartenders, Aperture focuses on flavor extraction and minimalist presentation. The vibe is cool, concrete, and precise.",
        highlights: ["Award Winning", "Minimalist", "Flavor Forward"],
        signature: "Clarified Milk Punch.",
        website: "https://www.aperture-montpellier.com/",
        openingHours: "Tue-Sat: 6:00 PM – 1:00 AM",
        lat: 43.6068,
        lng: 3.8775
      },
      {
        name: "Le Discopathe",
        image: "https://images.unsplash.com/photo-1542296332-2e44a996aaad?q=80&w=800&auto=format&fit=crop",
        priceLevel: 1,
        cuisine: "Vinyl & Beer",
        description: "Craft beer and vinyl records store/bar.",
        googleQuery: "Le Discopathe Montpellier",
        fullDescription: "A favorite for music lovers. Sip on local craft beers while DJs spin vinyl in the corner. Very casual, very cool.",
        highlights: ["Vinyl DJ Sets", "Craft Beer", "Local Crowd"],
        signature: "Local IPA on tap.",
        website: "https://www.facebook.com/lediscopathe/",
        openingHours: "Tue-Sat: 5:00 PM – 1:00 AM",
        lat: 43.6090,
        lng: 3.8755
      },
      {
        name: "Les Mômes",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Lively Terrace",
        description: "The place to be for a loud, fun start to the night.",
        googleQuery: "Les Mômes Montpellier",
        fullDescription: "Located on the Place du Marché aux Fleurs, Les Mômes is energetic, loud, and fun. Great for groups and people watching.",
        highlights: ["Big Terrace", "DJ Sets", "Group Friendly"],
        signature: "Moscow Mule.",
        website: "https://lesmomes-montpellier.fr/",
        openingHours: "Tue-Sat: 10:00 AM – 1:00 AM",
        lat: 43.6100,
        lng: 3.8760
      }
    ]
  },
  {
    id: 'dinner',
    title: 'Dinner',
    icon: Moon,
    description: "Gastronomy & ambiance.",
    restaurants: [
      {
        name: "Reflet d'Obione",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        priceLevel: 4,
        cuisine: "1 Star • Organic Gastronomy",
        description: "Chef Laurent Cherchi's ode to nature. Sustainable, precise, and Michelin-starred.",
        googleQuery: "Reflet d'Obione Montpellier",
        fullDescription: "Reflet d'Obione is more than a restaurant; it is a philosophy. Awarded a Michelin Green Star alongside its Red Star, it focuses on hyper-local ingredients and sustainability without compromising on elegance.",
        highlights: ["Michelin Star", "Green Gastronomy", "Tasting Menus"],
        signature: "Cévennes onions with truffle.",
        website: "https://reflet-dobione.com/",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        reservationLink: "https://reflet-dobione.com/reservation/",
        lat: 43.6105,
        lng: 3.8752
      },
      {
        name: "Le Jardin des Sens",
        image: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=800&auto=format&fit=crop",
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
      },
      {
        name: "La Réserve Rimbaud",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800&auto=format&fit=crop",
        priceLevel: 4,
        cuisine: "1 Star • Riverfront",
        description: "Historic grandeur on the banks of the Lez. A Montpellier classic.",
        googleQuery: "La Réserve Rimbaud Montpellier",
        fullDescription: "Located in a stunning building by the river, La Réserve Rimbaud is an institution of Montpellier gastronomy. Chef Charles Fontès delivers timeless French cuisine with a modern touch.",
        highlights: ["River Terrace", "Michelin Star", "Valet Parking"],
        signature: "Blue Lobster from the Atlantic.",
        website: "https://reserve-rimbaud.com/",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        reservationLink: "https://reserve-rimbaud.com/reservation",
        lat: 43.6235,
        lng: 3.8890
      },
      {
        name: "Le Cénacle",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Michelin Recommended",
        description: "Refined dining in a historic 17th-century mansion.",
        googleQuery: "Le Cénacle Montpellier",
        fullDescription: "Hidden within the Hôtel Nord-Pinus, Le Cénacle offers a serene, elegant atmosphere. The cuisine is classic French with a light, modern touch, perfect for a romantic evening.",
        highlights: ["Michelin Recommended", "Historic Courtyard", "Romantic"],
        signature: "Rack of lamb with thyme flower.",
        website: "https://www.lecenaclemontpellier.fr/",
        openingHours: "Tue-Sat: 7:30 PM – 9:30 PM",
        lat: 43.6112,
        lng: 3.8760
      },
      {
        name: "Sensation",
        image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Creative Gastronomy",
        description: "Chef Romain Salamone's texture-focused creative kitchen.",
        googleQuery: "Restaurant Sensation Montpellier",
        fullDescription: "True to its name, Sensation focuses on the texture and mouthfeel of ingredients. It is a modern, intimate venue recognized by the Michelin Guide for its inventive approach.",
        highlights: ["Michelin Recommended", "Texture Focus", "Intimate"],
        signature: "Crispy soft-boiled egg with truffle.",
        website: "https://www.restaurant-sensation.com/",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        lat: 43.6300,
        lng: 3.8800
      },
      {
        name: "L'Artichaut",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Bib Gourmand • Market",
        description: "Precise, unpretentious gastronomy recognized for exceptional value.",
        googleQuery: "L'Artichaut Restaurant Montpellier",
        fullDescription: "Awarded a Bib Gourmand for its incredible value, L'Artichaut offers a market-fresh menu that changes daily. It's refined but relaxed, with a focus on pure flavors.",
        highlights: ["Michelin Bib Gourmand", "Intimate", "Seasonal"],
        signature: "Artichoke variations.",
        website: "https://www.lartichaut-restaurant.fr/",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        lat: 43.6092,
        lng: 3.8758
      },
      {
        name: "Anga",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Modern Bistronomy",
        description: "Minimalist setting, maximalist flavor.",
        googleQuery: "Anga Restaurant Montpellier",
        fullDescription: "Anga is the definition of modern Montpellier bistronomy. The menu is short, seasonal, and changes constantly. The atmosphere is relaxed but the food is serious.",
        highlights: ["Open Kitchen", "Great Value Lunch", "Natural Wines"],
        signature: "Seasonal Market Menu.",
        website: "https://anga-montpellier.fr/",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        lat: 43.6075,
        lng: 3.8788
      },
      {
        name: "Leclere",
        image: "https://images.unsplash.com/photo-1533777324565-a040eb52facd?q=80&w=800&auto=format&fit=crop",
        priceLevel: 4,
        cuisine: "1 Star • Market Menu",
        description: "Understated elegance where the market dictates the daily menu.",
        googleQuery: "Restaurant Leclere Montpellier",
        fullDescription: "Guillaume Leclere's cuisine is instinctive and centered around the product. The restaurant is small, intimate, and the menu is a surprise tasting journey.",
        highlights: ["Blind Tasting Menu", "Intimate Setting", "Michelin Star"],
        signature: "Daily Market Inspiration.",
        website: "https://restaurantleclere.com/",
        openingHours: "Mon-Fri: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        reservationLink: "https://restaurantleclere.com/reservation/",
        lat: 43.6082,
        lng: 3.8768
      },
      {
        name: "L'Arbre Blanc (L'Arbre)",
        image: "https://images.unsplash.com/photo-1678207606334-037352233c77?q=80&w=800&auto=format&fit=crop",
        priceLevel: 4,
        cuisine: "Panoramic Modern French",
        description: "Located at the top of the iconic 'L'Arbre Blanc'. Offers 360° views.",
        googleQuery: "L'Arbre Blanc Restaurant Montpellier",
        fullDescription: "Perched on the 17th floor of Sou Fujimoto's architectural marvel, L'Arbre offers a dining experience suspended between the city and the sky.",
        highlights: ["Rooftop Views (17th Floor)", "Iconic Architecture", "Cocktail Bar"],
        signature: "Blue lobster with coral butter.",
        website: "https://larbre-restaurant.fr/",
        openingHours: "Tue-Sat: 12:00 PM – 1:30 PM, 7:30 PM – 9:30 PM",
        reservationLink: "https://larbre-restaurant.fr/reserver",
        lat: 43.6025,
        lng: 3.8990
      },
      {
        name: "La Diligence",
        image: "https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Classic French",
        description: "Dining in a vaulted medieval stone setting.",
        googleQuery: "La Diligence Montpellier",
        fullDescription: "Set in a magnificent 13th-century vaulted cellar, La Diligence offers a trip back in time with classic, heavy French gastronomy.",
        highlights: ["Medieval Vaults", "Romantic", "Trolley Service"],
        signature: "Chateaubriand carved tableside.",
        website: "https://www.ladiligence.com/",
        openingHours: "Daily: 7:30 PM – 10:30 PM",
        lat: 43.6108,
        lng: 3.8772
      },
      {
        name: "Les Bains de Montpellier",
        image: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Mediterranean Patio",
        description: "Dining in the courtyard of a historic bathhouse.",
        googleQuery: "Les Bains de Montpellier",
        fullDescription: "A magical setting. As the name suggests, this restaurant is housed in the city's ancient public baths.",
        highlights: ["Historic Bathhouse", "Stunning Courtyard", "Fresh Fish"],
        signature: "Scallops with truffle risotto.",
        website: "https://les-bains-de-montpellier.com/",
        openingHours: "Tue-Sat: 12:00 PM – 2:00 PM, 7:30 PM – 10:30 PM",
        lat: 43.6090,
        lng: 3.8765
      },
      {
        name: "Chez Boris",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
        priceLevel: 2,
        cuisine: "Steakhouse & Wine Bar",
        description: "A lively, carnivorous institution in the Écusson.",
        googleQuery: "Chez Boris Montpellier",
        fullDescription: "Red meat, red wine, and a raucous atmosphere. Chez Boris is where locals go for a perfect 'côte de bœuf'.",
        highlights: ["Dry-Aged Beef", "Extensive Wine List", "Lively Vibe"],
        signature: "Aubrac Ribeye with homemade fries.",
        website: "https://www.chezboris.com/",
        openingHours: "Daily: 12:00 PM – 2:30 PM, 7:30 PM – 11:00 PM",
        lat: 43.6085,
        lng: 3.8795
      },
      {
        name: "Ébullition",
        image: "https://images.unsplash.com/photo-1550966871-3ed3c6227b3f?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Bib Gourmand • Creative",
        description: "Small, intimate, and bursting with creativity.",
        googleQuery: "Restaurant Ebullition Montpellier",
        fullDescription: "A tiny gem near Saint-Roch that has earned a Bib Gourmand for its exceptional price-to-quality ratio. The menu is a surprise tasting journey.",
        highlights: ["Bib Gourmand", "Surprise Menu", "Intimate"],
        signature: "Smoked eel with granny smith apple.",
        website: "https://www.restaurant-ebullition.fr/",
        openingHours: "Tue-Sat: 7:30 PM – 9:30 PM",
        lat: 43.6060,
        lng: 3.8770
      },
      {
        name: "La Maison de la Lozère",
        image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
        priceLevel: 3,
        cuisine: "Regional Gastronomy",
        description: "Authentic flavors of the Lozère region in a vaulted setting.",
        googleQuery: "Maison de la Lozère Montpellier",
        fullDescription: "An embassy for the Lozère region right in Montpellier. Famous for its authentic Aligot (cheesy mashed potatoes) served in a chic, vaulted dining room.",
        highlights: ["Authentic Aligot", "Michelin Recommended", "Regional Wines"],
        signature: "Sausage and Aligot.",
        website: "https://www.lozere-a-montpellier.com/",
        openingHours: "Tue-Sat: 12:00 PM – 2:00 PM, 7:30 PM – 9:30 PM",
        lat: 43.6115,
        lng: 3.8755
      }
    ]
  }
];
