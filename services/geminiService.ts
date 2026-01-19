
import { ChatSource, Type, ItinerarySuggestion } from "../types";
import { DEFAULT_HOTEL_DATA, DEFAULT_DINING_DATA, DEFAULT_AGENDA_DATA, DEFAULT_EXPLORATION_DATA, DEFAULT_ACTIVITY_DATA } from '../data/defaults';
import { GoogleGenAI, GenerateContentResponse, Content, Part } from "@google/genai";

// --- Internal Helper ---
const generateContent = async (params: { model: string, contents: any, config?: any }): Promise<any> => {
  try {
      // @google/genai-sdk: Always use process.env.API_KEY directly when initializing.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
          model: params.model,
          contents: params.contents,
          config: params.config
      });
      return response;
  } catch (e) {
      console.error("Gemini SDK Error:", e);
      throw e;
  }
};

// --- Simple Cache Implementation ---
const cache = new Map<string, any>();
const CACHE_LIMIT = 50;

const getFromCache = (key: string) => cache.get(key);
const setInCache = (key: string, value: any) => {
    if (cache.size >= CACHE_LIMIT) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, value);
};

// --- Retry Logic ---
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (error.message === "API Key Missing") throw error; 
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// --- Knowledge Base & App Topology ---

const APP_TOPOLOGY = `
[APP NAVIGATION & DEEP LINKS]
You have the power to navigate the user through the app. Use the exact markdown format [Link Label](app://route) when relevant.

1. **Logistics & Travel**: [Trip Planner](app://logistics)
   - Use for: Flights, trains, hotel bookings, arrival times.
2. **Schedule & Events**: [Agenda](app://calendar)
   - Use for: Timeline, event start times, dress codes, "what's happening next".
3. **People & Social**: [Guest Registry](app://registry)
   - Use for: Seeing who is coming, finding roommates, checking profiles.
4. **Money & Splitting**: [Shared Ledger](app://expenses)
   - Use for: Bills, who owes who, uploading receipts.
5. **RSVP & Status**: [RSVP](app://rsvp)
   - Use for: Confirming attendance, changing party size, dietary restrictions.
6. **Exploration**: [Activities](app://activities)
   - Use for: Restaurants, bars, beaches, vineyards, things to do.
7. **Maps**: [Global Map](app://map)
   - Use for: Orientation, distance, finding locations.
8. **Guide Book**: [Guide](app://guide)
   - Use for: Packing lists, etiquette, language tips, emergency numbers.

Example Usage:
- User: "When is the dinner?" -> Céleste: "The Welcome Dinner is Friday at 7 PM. Check the [Agenda](app://calendar)."
- User: "I paid for lunch." -> Céleste: "Great, you can log that in the [Shared Ledger](app://expenses)."
`;

const APP_KNOWLEDGE = `
[OFFICIAL ITINERARY DATA]
AGENDA:
${DEFAULT_AGENDA_DATA.map(e => `- ${e.day} ${e.time}: ${e.title} @ ${e.location} (${e.description})`).join('\n')}

DINING OPTIONS:
${DEFAULT_DINING_DATA.flatMap(c => c.restaurants.map(r => `- ${r.name} (${r.cuisine}, ${'$'.repeat(r.priceLevel)}): ${r.description}`)).join('\n')}

HOTEL OPTIONS:
${DEFAULT_HOTEL_DATA.flatMap(c => c.hotels.map(h => `- ${h.name} (${h.stars}*): ${h.description}`)).join('\n')}

ACTIVITIES:
${[...DEFAULT_EXPLORATION_DATA, ...DEFAULT_ACTIVITY_DATA].map(a => `- ${a.name} (${a.category}): ${a.description}`).join('\n')}
`;

const SYSTEM_INSTRUCTION = `
You are "Céleste", the intelligent concierge for Bryan's 40th Birthday in Montpellier (Sept 2026).
Your goal is to assist guests with both the *event logistics* and the *destination experience*.

RULES OF ENGAGEMENT:
1. **Intelligent Linking**: You MUST link to app sections using the [APP NAVIGATION] rules whenever a user asks about a feature (schedule, people, money, travel).
2. **Search Grounding**: If a user asks a question NOT in your [OFFICIAL ITINERARY DATA] (e.g., "What is the weather?", "History of the Aqueduct", "Train schedules from London"), you MUST use Google Search to find the answer.
3. **Context Awareness**: Use the provided user context (Name, RSVP status) to personalize answers. Don't tell a confirmed guest to RSVP.
4. **Tone**: Chic, helpful, slightly playful, but concise (under 100 words).

${APP_TOPOLOGY}

${APP_KNOWLEDGE}
`;

const HOST_SYSTEM_INSTRUCTION = `
You are the "Voyageurs Host Assistant". Your goal is to help the event organizer manage their event using the Voyageurs Host Console.

CAPABILITIES:
1. **Navigation Guidance**:
   - Dashboard: Overview of stats.
   - Guest List: Add, edit, delete, import guests.
   - Broadcast: Send messages to guests.
   - Experience Builder: Edit app content (Identity, Landing, Celebration, Gallery).
   - System: Toggle modules and AI.
2. **Data Insight**: Analyze the provided guest list JSON to answer specific questions about attendance, dietary needs, etc.
3. **Drafting**: Help write broadcast messages or content for the app.

CONTEXT:
You will be provided with a summary of the current event data.

TONE:
Efficient, precise, and executive.
`;

export const askConcierge = async (
    question: string, 
    plannerContext?: string, 
    imagePart?: { data: string; mimeType: string },
    history: { role: 'user' | 'model'; text: string }[] = []
): Promise<{ text: string; sources: ChatSource[] }> => {
  
  // Cache check for simple queries without images
  const canCache = history.length === 0 && !imagePart;
  const cacheKey = `chat:v2:${question}:${plannerContext || ''}`;
  
  if (canCache) {
      const cached = getFromCache(cacheKey);
      if (cached) return cached;
  }

  try {
    let finalPrompt = question;
    if (plannerContext) {
      finalPrompt = `[CURRENT USER CONTEXT: ${plannerContext}]\n\nUser Query: ${question}`;
    }

    const contents: Content[] = [];

    // History formatting
    history.forEach(msg => {
        contents.push({
            role: msg.role,
            parts: [{ text: msg.text } as Part]
        });
    });

    const currentParts: Part[] = [];
    if (imagePart) {
        currentParts.push({ 
            inlineData: { 
                data: imagePart.data, 
                mimeType: imagePart.mimeType 
            } 
        });
    }
    currentParts.push({ text: finalPrompt });
    
    contents.push({
        role: 'user',
        parts: currentParts
    });

    // Use Gemini 3 Flash Preview for superior reasoning & search grounding
    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION, 
        tools: [{ googleSearch: {} }] 
      },
    }));

    // @google/genai-sdk: Correctly access the text output from the response.
    const text = response.text;
    const sources: ChatSource[] = [];
    
    // Extract Grounding Metadata
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
            if (!sources.some(s => s.uri === chunk.web?.uri)) {
                sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            }
        }
      });
    }
    
    const result = { text: text || "I'm having a moment of silence. Please ask again.", sources };
    if (canCache) setInCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Concierge Error:", error);
    return { text: "I'm currently unable to reach my contacts in Montpellier. Please ensure the API Key is set.", sources: [] };
  }
};

export const askHostAssistant = async (
    question: string,
    eventContext: string,
    history: { role: 'user' | 'model'; text: string }[] = []
): Promise<{ text: string }> => {
    try {
        const prompt = `[EVENT DATA CONTEXT]\n${eventContext}\n\n[USER QUESTION]\n${question}`;
        
        const contents: Content[] = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text } as Part]
        }));
        
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        const response = await retryOperation<GenerateContentResponse>(() => generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: {
                systemInstruction: HOST_SYSTEM_INSTRUCTION,
            }
        }));

        return { text: response.text || "System parsing error." };
    } catch (e) {
        console.error("Host Assistant Error", e);
        return { text: "Unable to access host services." };
    }
};

export const coordinateGroupPlan = async (groupMembers: string[], interest: string, locationContext: string = "Montpellier"): Promise<string> => {
  try {
    const prompt = `Coordinate a joint plan for ${groupMembers.join(', ')} who are all interested in "${interest}" during the birthday weekend in ${locationContext}. 
    Suggest a specific meeting time, logistics (e.g. tram or carpool), and a small unique detail to make it special.
    Keep it elegant and helpful.`;

    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      // @google/genai-sdk: Updated model name.
      model: 'gemini-3-flash-preview',
      contents: prompt,
    }));

    // @google/genai-sdk: Correctly access the text output from the response.
    return response.text || "I'm thinking of the perfect plan. One moment...";
  } catch (error) {
    return "I'm unable to coordinate at this moment, but I suggest meeting at Place de la Comédie to discuss!";
  }
};

export const analyzeReceipt = async (base64Image: string, mimeType: string): Promise<{ amount: number; merchant: string; date: string; description: string }> => {
  try {
    const prompt = "Analyze this receipt. Extract total amount (number), merchant name, date (YYYY-MM-DD), and a short description (e.g., 'Dinner at [Merchant]'). Return JSON: { \"amount\": number, \"merchant\": \"string\", \"date\": \"string\", \"description\": \"string\" }";
    
    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      // @google/genai-sdk: Updated model name for multimodal tasks.
      model: 'gemini-3-flash-preview', // Flash is perfect for fast multimodal extraction
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: { 
        responseMimeType: "application/json"
      },
    }));

    // @google/genai-sdk: Correctly access the text output from the response.
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Receipt analysis failed", error);
    return { amount: 0, merchant: "Unknown Merchant", date: new Date().toISOString().split('T')[0], description: "Shared Expense" };
  }
};

export interface PlaceDetails {
  summary: string;
  rating: number;
  reviewSummary: string;
  address: string;
  location?: { lat: number; lng: number };
  imageUrl?: string;
  sources?: ChatSource[];
}

export const getPlaceDetails = async (placeName: string, locationContext: string = "Montpellier, France"): Promise<PlaceDetails | null> => {
  const cacheKey = `place:${placeName}:${locationContext}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    // Use 2.5 Flash with Google Maps Tool for accurate location data
    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Details for "${placeName}" in "${locationContext}". 
      Return ONLY JSON with these fields:
      summary (short description), rating (number), reviewSummary (what people say), address, location (lat/lng), imageUrl (if available).
      JSON Structure:
      { "summary": "...", "rating": number, "reviewSummary": "...", "address": "...", "location": { "lat": number, "lng": number }, "imageUrl": "..." }`,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
    }));
    
    const extractJSON = (input: string) => {
      const firstOpen = input.indexOf('{');
      const lastClose = input.lastIndexOf('}');
      return (firstOpen !== -1 && lastClose !== -1) ? input.substring(firstOpen, lastClose + 1) : null;
    };
    // @google/genai-sdk: Correctly access the text output from the response.
    const jsonStr = extractJSON(response.text || "");
    const details: PlaceDetails | null = jsonStr ? JSON.parse(jsonStr) : null;

    if (details) {
      const sources: ChatSource[] = [];
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({ title: chunk.web.title, uri: chunk.web.uri });
          }
          if (chunk.maps?.uri && chunk.maps?.title) {
            sources.push({ title: chunk.maps.title, uri: chunk.maps.uri });
          }
        });
      }
      details.sources = sources;
      setInCache(cacheKey, details);
    }
    return details;
  } catch (error) {
    console.error("Place Details Error:", error);
    return null;
  }
};

export const discoverMorePlaces = async (category: string, currentNames: string[]): Promise<string[]> => {
  try {
    const prompt = `Suggest 2 unique, highly photogenic locations or activities in or near Montpellier, France that fit the category "${category}".
    Do NOT suggest these places: ${currentNames.join(', ')}.
    Return ONLY a JSON array of strings with the names.`;
    
    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      model: 'gemini-3-flash-preview', // 3 Flash for better creative suggestions
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
      }
    }));
    
    // @google/genai-sdk: Correctly access the text output from the response.
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Discovery error", e);
    return [];
  }
};

export interface RouteOption {
  id: string;
  type: 'flight' | 'train' | 'mixed';
  title: string;
  description: string;
  whyItIsUnique: string;
  badge: string;
  cost: number;
  duration: string;
  route: string;
}

export interface TripEstimate {
  options: RouteOption[];
  notes: string;
}

export const getTripCostEstimate = async (originCity: string, destination: string, flightType: string, startDate: string, endDate: string): Promise<TripEstimate | null> => {
  const cacheKey = `estimate:${originCity}:${destination}:${startDate}:${endDate}:v3-flights-only-v5-flags`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Estimate travel options for 1 person from "${originCity}" to Montpellier, France (${startDate} to ${endDate}).
      Focus strictly on primary Flight Hubs as the primary method of reaching Europe.
      Provide 4 distinct options:
      1. Paris (CDG) Hub: Flight to Paris, then the seamless TGV train connection. Flag as "Recommended".
      2. Barcelona (BCN) Hub: Flight to Barcelona, followed by the Mediterranean coastal train. Flag as "Scenic".
      3. Direct/Connecting Flight (MPL Hub): Flight directly to Montpellier Méditerranée (MPL). Flag as "Fastest".
      4. Regional Hub (The Wildcard): Lowest price option to Marseille or Nîmes. Flag as "Cheapest".

      Return ONLY JSON:
      {
        "options": [
          {
            "id": "via-paris",
            "type": "mixed",
            "title": "Paris (CDG) Hub",
            "description": "Intl. Flight to CDG + TGV to Center",
            "whyItIsUnique": "string (Why this option is unique for this origin)",
            "badge": "string (one of: Recommended, Scenic, Fastest, Cheapest)",
            "cost": number (USD estimated total),
            "duration": "string (e.g. 14h)",
            "route": "JFK -> CDG -> MPL"
          }
          // ... other 3 options
        ],
        "notes": "string"
      }`,
      config: { 
          responseMimeType: "application/json"
      }
    }));
    // @google/genai-sdk: Correctly access the text output from the response.
    const result = JSON.parse(response.text || "{}");
    setInCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Trip Estimate Error", error);
    return { 
        options: [
            { id: "via-paris", type: "mixed", title: "Paris (CDG) Hub", description: "Standard estimate via CDG", whyItIsUnique: "The most robust connection network for global arrivals.", badge: "Recommended", cost: 1100, duration: "14h", route: `${originCity} -> CDG -> MPL` },
            { id: "via-bcn", type: "mixed", title: "Barcelona (BCN) Hub", description: "Standard estimate via BCN", whyItIsUnique: "A scenic coastal journey before the celebration begins.", badge: "Scenic", cost: 950, duration: "15h", route: `${originCity} -> BCN -> MPL` },
            { id: "fly-mpl", type: "flight", title: "Direct to MPL Hub", description: "Standard flight estimate", whyItIsUnique: "The quickest touch-down in the city center.", badge: "Fastest", cost: 1250, duration: "16h", route: `${originCity} -> MPL` },
            { id: "via-wildcard", type: "flight", title: "Regional Hub (Budget)", description: "Lowest price regional connection", whyItIsUnique: "Maximum savings for the savvy traveler.", badge: "Cheapest", cost: 650, duration: "18h", route: `${originCity} -> MRS -> MPL` }
        ],
        notes: "Estimation service unavailable." 
    };
  }
};

export const generateDraftItem = async (category: 'restaurant' | 'hotel' | 'activity' | 'event', query: string, destination: string): Promise<any> => {
    try {
        let schema: any;
        if (category === 'restaurant') {
            schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    cuisine: { type: Type.STRING },
                    priceLevel: { type: Type.INTEGER, description: "1 to 4" },
                    googleQuery: { type: Type.STRING }
                }
            };
        } else if (category === 'hotel') {
            schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    stars: { type: Type.INTEGER },
                    priceLevel: { type: Type.INTEGER, description: "1 to 5" },
                    tag: { type: Type.STRING }
                }
            };
        } else if (category === 'event') {
             schema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    description: { type: Type.STRING },
                    location: { type: Type.STRING },
                    durationHours: { type: Type.INTEGER }
                }
            };
        } else {
             schema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    baseCost: { type: Type.INTEGER },
                    locationQuery: { type: Type.STRING }
                }
            };
        }

        const prompt = `Generate a draft ${category} entry for "${query}" in ${destination}. 
        Keep descriptions engaging and under 25 words. 
        For events, assume a default duration if unknown.
        If the place doesn't exist, create a plausible placeholder.`;

        const response = await retryOperation<GenerateContentResponse>(() => generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        }));

        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Generate Draft Error", e);
        return null;
    }
};

export const generateEmailDraft = async (topic: string, audience: string, senderName: string): Promise<{ subject: string; body: string }> => {
    try {
        const prompt = `You are helping ${senderName} draft an email to guests attending a 40th birthday in Montpellier.
        Audience: ${audience}.
        Topic: "${topic}".
        Tone: Professional but warm, exciting, clear.
        Output ONLY JSON: { "subject": string, "body": string }`;

        const response = await retryOperation<GenerateContentResponse>(() => generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    }
                }
            }
        }));

        return JSON.parse(response.text || '{ "subject": "", "body": "" }');
    } catch (e) {
        console.error("Generate Email Error", e);
        return { subject: "Update regarding Montpellier", body: "Could not generate draft." };
    }
};

export const getItinerarySuggestions = async (interests: string[], timeOfDay: string, location: string): Promise<ItinerarySuggestion[]> => {
  try {
    const prompt = `Suggest 3 specific places or activities in ${location} suitable for "${timeOfDay}" related to these interests: ${interests.join(', ')}.
    Return ONLY a JSON array with these fields for each item:
    - name (string)
    - category (one of: 'dining', 'activity', 'nightlife', 'shopping')
    - description (short string, under 20 words)
    - duration (string, e.g. "2 hours")
    - estimatedCost (number, average cost in USD per person)
    
    Ensure real, existing places in ${location}.`;

    const response = await retryOperation<GenerateContentResponse>(() => generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    estimatedCost: { type: Type.NUMBER }
                }
            }
        }
      }
    }));

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Itinerary Suggestions Error", error);
    return [];
  }
};
