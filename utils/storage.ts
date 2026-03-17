
/**
 * Safe wrapper for localStorage to prevent app crashes in Private Mode
 * or when storage quota is exceeded.
 */
export const safeStorage = {
  getItem: <T>(key: string, fallback: T | null = null): T | null => {
    try {
      if (typeof window === 'undefined') return fallback;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.warn(`Error reading ${key} from storage:`, error);
      return fallback;
    }
  },

  setItem: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing ${key} to storage:`, error);
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing ${key} from storage:`, error);
    }
  },

  /**
   * Clear all app-related storage keys. Whitelist keeps persistent keys.
   * @param keys - Optional array of specific keys to clear. If not provided, clears all voyageur keys.
   */
  clearAppStorage: (keys?: string[]): void => {
    try {
      if (typeof window === 'undefined') return;

      // Define persistent keys that should NOT be cleared (theme preferences, etc.)
      const PERSISTENT_KEYS = ['theme', 'install_prompt_dismissed'];

      if (keys && keys.length > 0) {
        // Clear specific keys only
        keys.forEach(key => {
          if (!PERSISTENT_KEYS.includes(key)) {
            window.localStorage.removeItem(key);
          }
        });
      } else {
        // Clear all voyageur-related keys
        const keysToDelete = [
          'voyageur_trips',
          'voyageur_active_trip',
          'local_guests',
          'guest_user',
          'is_verified',
          'rsvp_status',
          'host_session',
          'shared_expenses',
          'coordinated_groups',
          'trip_planner_items',
          'trip_planner_travelers',
          'trip_planner_days',
          'host_tour_seen',
          'tour_seen',
          'guide_seen',
          'trip_initialized'
        ];

        keysToDelete.forEach(key => {
          if (!PERSISTENT_KEYS.includes(key)) {
            window.localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Error clearing app storage:', error);
    }
  }
};
