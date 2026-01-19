import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useUser } from './UserContext';
import { PlanItem, PlanCategory, PricingType } from '../types';

export type { PlanItem, PlanCategory, PricingType };

interface TripPlannerContextType {
  items: PlanItem[];
  travelers: number;
  durationDays: number;
  totalCost: number;
  pendingItem: PlanItem | null;
  focusedItem: PlanItem | null; // New: Item currently being inspected
  addToPlan: (item: PlanItem) => void;
  removeFromPlan: (id: string) => void;
  markAsBooked: (id: string, confirmation?: string) => void;
  isInPlan: (id: string) => boolean;
  updateSettings: (travelers: number, days: number) => void;
  clearPlan: () => void;
  clearPendingItem: () => void;
  focusItem: (item: PlanItem | null) => void; // New: Action to inspect item
}

const TripPlannerContext = createContext<TripPlannerContextType | undefined>(undefined);

// Helper to safely decode Base64 with Unicode
const safeDecode = (str: string) => {
  try {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    return null;
  }
};

export const TripPlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [pendingItem, setPendingItem] = useState<PlanItem | null>(null);
  const [focusedItem, setFocusedItem] = useState<PlanItem | null>(null);
  
  const [items, setItems] = useState<PlanItem[]>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sharedEncoded = params.get('share');
      if (sharedEncoded) {
        const jsonStr = safeDecode(sharedEncoded);
        if (jsonStr) {
          try {
            const data = JSON.parse(jsonStr);
            if (Array.isArray(data.items)) {
               return data.items.map((i: any) => ({
                ...i,
                baseCost: typeof i.baseCost === 'number' ? i.baseCost : (i.cost || 0),
                pricingType: i.pricingType || 'fixed',
                cost: typeof i.cost === 'number' ? i.cost : 0,
                bookingStatus: i.bookingStatus || 'planned'
              }));
            }
          } catch(e) {}
        }
      }

      const saved = localStorage.getItem('trip_planner_items');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.map((i: any) => ({
            ...i,
            baseCost: typeof i.baseCost === 'number' ? i.baseCost : (i.cost || 0),
            pricingType: i.pricingType || 'fixed',
            cost: typeof i.cost === 'number' ? i.cost : 0,
            bookingStatus: i.bookingStatus || 'planned'
          }));
        } catch (e) {
          console.error("Failed to parse trip planner items", e);
          return [];
        }
      }
    }
    return [];
  });

  const [travelers, setTravelers] = useState<number>(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const sharedEncoded = params.get('share');
        if (sharedEncoded) {
            const jsonStr = safeDecode(sharedEncoded);
            if (jsonStr) {
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.travelers) return data.travelers;
                } catch(e) {}
            }
        }
        return parseInt(localStorage.getItem('trip_planner_travelers') || '2');
    }
    return 2;
  });

  const [durationDays, setDurationDays] = useState<number>(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const sharedEncoded = params.get('share');
        if (sharedEncoded) {
            const jsonStr = safeDecode(sharedEncoded);
            if (jsonStr) {
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.durationDays) return data.durationDays;
                } catch(e) {}
            }
        }
        // Updated default to 8 days to match Sept 15th - Sept 22nd (inclusive)
        return parseInt(localStorage.getItem('trip_planner_days') || '8');
    }
    return 8;
  });

  // REACTIVE SYNC: Watch User Formal Details
  useEffect(() => {
      if (user) {
          // Sync Guest Count
          if (user.guestsCount && user.guestsCount !== travelers) {
              setTravelers(user.guestsCount);
          }

          // Sync Stay Duration if dates are provided
          if (user.travelDetails?.arrivalDate && user.travelDetails?.departureDate) {
              const start = new Date(user.travelDetails.arrivalDate);
              const end = new Date(user.travelDetails.departureDate);
              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
              
              if (diffDays !== durationDays) {
                  setDurationDays(diffDays);
              }
          }
      }
  }, [user?.guestsCount, user?.travelDetails?.arrivalDate, user?.travelDetails?.departureDate]);

  // Clean URL if we detected a share param
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('share')) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trip_planner_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('trip_planner_travelers', travelers.toString());
    localStorage.setItem('trip_planner_days', durationDays.toString());
  }, [travelers, durationDays]);

  // Recalculate costs when settings change
  useEffect(() => {
    setItems(prevItems => prevItems.map(item => {
        let newCost = item.cost;
        
        if (item.pricingType === 'perPerson') {
            newCost = item.baseCost * travelers;
        } else if (item.pricingType === 'hotel') {
            // Estimate 1 room per 2 people, minimum 1 room
            const rooms = Math.ceil(travelers / 2);
            newCost = item.baseCost * durationDays * rooms;
        } else if (item.pricingType === 'fixed') {
            newCost = item.baseCost;
        }
        
        if (newCost !== item.cost) {
            return { ...item, cost: newCost };
        }
        return item;
    }));
  }, [travelers, durationDays]);

  const addToPlan = (item: PlanItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, { ...item, bookingStatus: 'planned' }];
    });
    setPendingItem(item);
  };

  const removeFromPlan = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const markAsBooked = (id: string, confirmation?: string) => {
      setItems(prev => prev.map(i => i.id === id ? { ...i, bookingStatus: 'booked', bookingConfirmation: confirmation } : i));
  };

  const isInPlan = (id: string) => {
    return items.some(i => i.id === id);
  };

  const updateSettings = (newTravelers: number, newDays: number) => {
    setTravelers(newTravelers);
    setDurationDays(newDays);
  };

  const clearPlan = () => {
    setItems([]);
  };

  const clearPendingItem = () => {
    setPendingItem(null);
  };

  const focusItem = (item: PlanItem | null) => {
      setFocusedItem(item);
  }

  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

  const value = useMemo(() => ({
      items, 
      travelers, 
      durationDays, 
      totalCost, 
      pendingItem,
      focusedItem,
      addToPlan, 
      removeFromPlan, 
      markAsBooked,
      isInPlan, 
      updateSettings, 
      clearPlan, 
      clearPendingItem,
      focusItem
  }), [items, travelers, durationDays, totalCost, pendingItem, focusedItem]);

  return (
    <TripPlannerContext.Provider value={value}>
      {children}
    </TripPlannerContext.Provider>
  );
};

export const useTripPlanner = () => {
  const context = useContext(TripPlannerContext);
  if (context === undefined) {
    throw new Error('useTripPlanner must be used within a TripPlannerProvider');
  }
  return context;
};