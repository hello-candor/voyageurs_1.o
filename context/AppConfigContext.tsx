
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safeStorage } from '../utils/storage';
import { HotelCategory, DiningCategory, AgendaEvent, ExplorationItem, ActivityItem, AppTheme, LandingContent, CelebrationContent, GalleryContent } from '../types';
import { DEFAULT_HOTEL_DATA, DEFAULT_DINING_DATA, DEFAULT_AGENDA_DATA, DEFAULT_EXPLORATION_DATA, DEFAULT_ACTIVITY_DATA, DEFAULT_LANDING_CONTENT, DEFAULT_CELEBRATION_DATA, DEFAULT_GALLERY_CONTENT, DEFAULT_CONFIG as STATIC_DEFAULT } from '../data/defaults';
import { db, auth } from '../firebaseConfig';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export interface AppModule {
  id: string;
  label: string;
  isEnabled: boolean;
  description?: string; 
}

export interface AppContent {
    accommodation: HotelCategory[];
    dining: DiningCategory[];
    agenda: AgendaEvent[];
    exploration: ExplorationItem[]; 
    activities: ActivityItem[];
    landing: LandingContent;
    celebration: CelebrationContent;
    gallery: GalleryContent;
}

export interface AppConfig {
  id: string; 
  appName: string;
  destination: string;
  occasion: string;
  heroImage: string; 
  videoUrl?: string; 
  welcomeMessage: string;
  enableAI: boolean; 
  hubUnlocked: boolean;
  modules: AppModule[];
  content: AppContent;
  theme: AppTheme;
}

interface AppConfigContextType {
  config: AppConfig;
  allTrips: AppConfig[];
  createTrip: (name: string, destination: string) => void;
  setActiveTrip: (id: string) => void;
  deleteTrip: (id: string) => void;
  updateConfig: (data: Partial<AppConfig>) => Promise<void>;
  updateContent: (key: keyof AppContent, data: any) => Promise<void>;
  toggleModule: (moduleId: string) => void;
  toggleAI: () => void;
  updateTheme: (data: Partial<AppTheme>) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local state for immediate UI feedback
  const [trips, setTrips] = useState<AppConfig[]>(() => {
    return safeStorage.getItem('voyageur_trips', [STATIC_DEFAULT]) || [STATIC_DEFAULT];
  });

  const [activeTripId, setActiveTripId] = useState<string>(() => {
    return safeStorage.getItem('voyageur_active_trip', 'default') || 'default';
  });

  const [isCloudEnabled, setIsCloudEnabled] = useState(true);

  const activeConfig = trips.find(t => t.id === activeTripId) || trips[0] || STATIC_DEFAULT;

  // Monitor Auth State
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsCloudEnabled(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- FIREBASE SYNC ---
  useEffect(() => {
      if (!isCloudEnabled || !auth.currentUser) return;

      // Subscribe to the active trip in Firestore
      const tripDocRef = doc(db, 'trips', activeTripId);
      
      const unsubscribe = onSnapshot(tripDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
              const remoteData = docSnapshot.data() as AppConfig;
              // Update local state with remote data
              setTrips(prev => {
                  const exists = prev.find(t => t.id === remoteData.id);
                  const updated = exists 
                    ? prev.map(t => t.id === remoteData.id ? { ...t, ...remoteData } : t)
                    : [...prev, remoteData];
                  
                  // Update local storage backup
                  safeStorage.setItem('voyageur_trips', updated);
                  return updated;
              });
          } else {
              // If doc doesn't exist in Firebase yet (first load of a new trip), create it
              setDoc(tripDocRef, activeConfig, { merge: true }).catch(err => {
                  if (err.code === 'permission-denied') {
                      setIsCloudEnabled(false);
                  }
              });
          }
      }, (error) => {
          if (error.code === 'permission-denied' || error.code === 'unavailable') {
              // FAIL-SAFE: If permission is denied, assume backend is not configured and switch to offline mode.
              console.warn("⚠️ Firestore unavailable/denied. Switching to Offline/Demo Mode.");
              setIsCloudEnabled(false);
          } else {
              console.error("Error syncing app config:", error);
          }
      });

      return () => unsubscribe();
  }, [activeTripId, isCloudEnabled]);

  // Persist active trip ID locally
  useEffect(() => {
    safeStorage.setItem('voyageur_active_trip', activeTripId);
    document.title = "Bryan's 40th - Sept 18-20";
  }, [activeTripId, activeConfig]);

  const updateTripsLocally = (updater: (prev: AppConfig[]) => AppConfig[]) => {
      setTrips(prev => {
          const newState = updater(prev);
          safeStorage.setItem('voyageur_trips', newState);
          return newState;
      });
  };

  const createTrip = (name: string, destination: string) => {
      const baseConfig = JSON.parse(JSON.stringify(STATIC_DEFAULT));
      const newTrip: AppConfig = {
          ...baseConfig,
          id: `trip-${Date.now()}`,
          appName: name,
          destination: destination,
          welcomeMessage: `Welcome to ${destination}`,
      };
      
      updateTripsLocally(prev => [...prev, newTrip]);
      setActiveTripId(newTrip.id);
      
      if (isCloudEnabled && auth.currentUser) {
          const tripDocRef = doc(db, 'trips', newTrip.id);
          setDoc(tripDocRef, newTrip).catch(() => setIsCloudEnabled(false));
      }
  };

  const deleteTrip = (id: string) => {
      if (trips.length <= 1) {
          alert("Cannot delete the last trip.");
          return;
      }
      updateTripsLocally(prev => prev.filter(t => t.id !== id));
      if (activeTripId === id) {
          setActiveTripId(trips[0].id);
      }
  };

  const setActiveTrip = (id: string) => {
      setActiveTripId(id);
  };

  const updateConfig = async (data: Partial<AppConfig>) => {
    updateTripsLocally(prev => prev.map(t => t.id === activeTripId ? { ...t, ...data } : t));
    
    if (isCloudEnabled && auth.currentUser) {
        try {
            const tripDocRef = doc(db, 'trips', activeTripId);
            await updateDoc(tripDocRef, data);
        } catch (e: any) {
            console.error("Failed to save config to cloud:", e);
            if (e.code === 'permission-denied') setIsCloudEnabled(false);
        }
    }
  };

  const updateContent = async (key: keyof AppContent, data: any) => {
      updateTripsLocally(prev => prev.map(t => t.id === activeTripId ? {
          ...t,
          content: {
              ...t.content,
              [key]: data
          }
      } : t));

      if (isCloudEnabled && auth.currentUser) {
          try {
              const tripDocRef = doc(db, 'trips', activeTripId);
              await updateDoc(tripDocRef, {
                  [`content.${key}`]: data
              });
          } catch (e: any) {
              console.error("Failed to save content to cloud:", e);
              if (e.code === 'permission-denied') setIsCloudEnabled(false);
          }
      }
  };

  const updateTheme = async (data: Partial<AppTheme>) => {
      updateTripsLocally(prev => prev.map(t => t.id === activeTripId ? {
          ...t,
          theme: { ...t.theme, ...data }
      } : t));

      if (isCloudEnabled && auth.currentUser) {
          try {
            const tripDocRef = doc(db, 'trips', activeTripId);
            await updateDoc(tripDocRef, {
                [`theme`]: { ...activeConfig.theme, ...data }
            });
        } catch (e: any) { 
            console.error(e); 
            if (e.code === 'permission-denied') setIsCloudEnabled(false);
        }
      }
  };

  const toggleModule = async (moduleId: string) => {
    const updatedModules = activeConfig.modules.map(m => 
        m.id === moduleId ? { ...m, isEnabled: !m.isEnabled } : m
    );
    
    updateTripsLocally(prev => prev.map(t => t.id === activeTripId ? { ...t, modules: updatedModules } : t));

    if (isCloudEnabled && auth.currentUser) {
        try {
            const tripDocRef = doc(db, 'trips', activeTripId);
            await updateDoc(tripDocRef, { modules: updatedModules });
        } catch (e: any) { 
            console.error(e); 
            if (e.code === 'permission-denied') setIsCloudEnabled(false);
        }
    }
  };

  const toggleAI = async () => {
      const newVal = !activeConfig.enableAI;
      updateTripsLocally(prev => prev.map(t => t.id === activeTripId ? { ...t, enableAI: newVal } : t));
      
      if (isCloudEnabled && auth.currentUser) {
          try {
            const tripDocRef = doc(db, 'trips', activeTripId);
            await updateDoc(tripDocRef, { enableAI: newVal });
        } catch (e: any) { 
            console.error(e); 
            if (e.code === 'permission-denied') setIsCloudEnabled(false);
        }
      }
  };

  return (
    <AppConfigContext.Provider value={{ 
        config: activeConfig, 
        allTrips: trips,
        createTrip,
        setActiveTrip,
        deleteTrip,
        updateConfig, 
        updateContent, 
        toggleModule,
        toggleAI,
        updateTheme
    }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
