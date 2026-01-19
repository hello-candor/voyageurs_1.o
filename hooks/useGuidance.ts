
import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { GUIDE_MESSAGES, GuideMessage } from '../data/guideMessages';

export const useGuidance = () => {
  const { user } = useUser();
  const { items } = useTripPlanner();

  const activeMessage = useMemo<GuideMessage | null>(() => {
    if (!user) return null;

    // 1. Planning First (If Pending and no items selected yet)
    if (user.status === 'Pending' && items.length === 0) {
        return GUIDE_MESSAGES.START_PLANNING;
    }

    // 2. RSVP (If Pending but has started planning OR explicitly priority)
    if (user.status === 'Pending') {
      return GUIDE_MESSAGES.MISSING_RSVP;
    }

    // 3. Arrival Logistics (If confirmed but missing arrival)
    if (user.status === 'Confirmed' && !user.travelDetails?.arrivalDate) {
      return GUIDE_MESSAGES.MISSING_ARRIVAL;
    }

    // 4. Lodging (If confirmed but no lodging)
    if (user.status === 'Confirmed' && !user.travelDetails?.accommodation && !user.officialItinerary?.hotel) {
      return GUIDE_MESSAGES.MISSING_LODGING;
    }

    // 5. Dietary (If empty or default)
    if (user.status === 'Confirmed' && (!user.dietary || user.dietary === 'None' || user.dietary === '')) {
       if (user.dietary === '') return GUIDE_MESSAGES.MISSING_DIETARY;
    }

    // 6. Profile Photo (If default avatar)
    if (user.avatar?.includes('ui-avatars.com')) {
      return GUIDE_MESSAGES.MISSING_PHOTO;
    }

    // 7. Socials (If missing main ones)
    if (!user.social?.instagram && !user.social?.whatsapp) {
      return GUIDE_MESSAGES.MISSING_SOCIALS;
    }

    // 8. Exploration (If plan is empty/low)
    if (items.length === 0) {
      return GUIDE_MESSAGES.EXPLORE_ACTIVITIES;
    }

    return null;
  }, [user, items]);

  return activeMessage;
};
