
import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useTripPlanner } from '../context/TripPlannerContext';
import { useAppConfig } from '../context/AppConfigContext';
import { GUIDE_MESSAGES, GuideMessage } from '../data/guideMessages';

export const useGuidance = () => {
  const { user } = useUser();
  const { items } = useTripPlanner();

  const { config } = useAppConfig();

  const activeMessage = useMemo<GuideMessage | null>(() => {
    if (!user) return null;

    let msg: GuideMessage | null = null;

    // 1. Planning First (If Pending and no items selected yet)
    if (user.status === 'Pending' && items.length === 0) {
        msg = GUIDE_MESSAGES.START_PLANNING;
    }

    // 2. RSVP (If Pending but has started planning OR explicitly priority)
    else if (user.status === 'Pending') {
      msg = GUIDE_MESSAGES.MISSING_RSVP;
    }

    // 3. Arrival Logistics (If confirmed but missing arrival)
    else if (user.status === 'Confirmed' && !user.travelDetails?.arrivalDate) {
      msg = GUIDE_MESSAGES.MISSING_ARRIVAL;
    }

    // 4. Lodging (If confirmed but no lodging)
    else if (user.status === 'Confirmed' && !user.travelDetails?.accommodation && !user.officialItinerary?.hotel) {
      msg = GUIDE_MESSAGES.MISSING_LODGING;
    }

    // 5. Dietary (If empty or default)
    else if (user.status === 'Confirmed' && (!user.dietary || user.dietary === 'None' || user.dietary === '')) {
       if (user.dietary === '') msg = GUIDE_MESSAGES.MISSING_DIETARY;
    }

    // 6. Profile Photo (If default avatar)
    else if (user.avatar?.includes('ui-avatars.com')) {
      msg = GUIDE_MESSAGES.MISSING_PHOTO;
    }

    // 7. Socials (If missing main ones)
    else if (!user.social?.instagram && !user.social?.whatsapp) {
      msg = GUIDE_MESSAGES.MISSING_SOCIALS;
    }

    // 8. Exploration (If plan is empty/low)
    else if (items.length === 0) {
      msg = GUIDE_MESSAGES.EXPLORE_ACTIVITIES;
    }

    if (!msg) return null;

    const dest = config?.destination ? config.destination.split(',')[0] : 'your destination';
    return {
        ...msg,
        message: msg.message.replace('{DESTINATION}', dest)
    };
  }, [user, items, config?.destination]);

  return activeMessage;
};
