
import { HubView } from '../components/HubLayout';
import { Sparkles, Plane, Bed, Utensils, UserCircle2, Share2, CalendarCheck, Compass } from 'lucide-react';

export interface GuideMessage {
  id: string;
  priority: number;
  icon: any;
  title: string;
  message: string;
  actionLabel: string;
  targetView: HubView;
  color: string;
}

export const GUIDE_MESSAGES: Record<string, GuideMessage> = {
  START_PLANNING: {
    id: 'start_planning',
    priority: 110,
    icon: Compass,
    title: "Draft Your Trip",
    message: "Before you commit, explore the costs. Browse official hotels, flight estimates, and activities to build your budget.",
    actionLabel: "Start Planning",
    targetView: 'logistics',
    color: "bg-med-blue"
  },
  MISSING_RSVP: {
    id: 'missing_rsvp',
    priority: 100,
    icon: CalendarCheck,
    title: "Ready to Join?",
    message: "You've started your plan. Now, please confirm your attendance so we can reserve your place at the Gala.",
    actionLabel: "Confirm Attendance",
    targetView: 'rsvp',
    color: "bg-med-terracotta"
  },
  MISSING_ARRIVAL: {
    id: 'missing_arrival',
    priority: 90,
    icon: Plane,
    title: "The Arrival",
    message: "To coordinate your welcome shuttle, please provide your flight or train arrival details for Montpellier.",
    actionLabel: "Add Logistics",
    targetView: 'profile', // Opens profile where logistics are edited
    color: "bg-indigo-500"
  },
  MISSING_LODGING: {
    id: 'missing_lodging',
    priority: 80,
    icon: Bed,
    title: "Your Residence",
    message: "Where will you be waking up? Link your accommodation to sync with the party map and shuttle routes.",
    actionLabel: "Select Lodging",
    targetView: 'logistics',
    color: "bg-blue-600"
  },
  MISSING_DIETARY: {
    id: 'missing_dietary',
    priority: 70,
    icon: Utensils,
    title: "Culinary Notes",
    message: "From shellfish to gluten, please detail any allergies so the chefs can prepare your Gala experience.",
    actionLabel: "Update Preferences",
    targetView: 'profile',
    color: "bg-med-olive"
  },
  MISSING_SOCIALS: {
    id: 'missing_socials',
    priority: 60,
    icon: Share2,
    title: "Connect",
    message: "Help the group connect before the trip! Add your Instagram or WhatsApp to the guest registry.",
    actionLabel: "Edit Profile",
    targetView: 'profile',
    color: "bg-pink-500"
  },
  MISSING_PHOTO: {
    id: 'missing_photo',
    priority: 50,
    icon: UserCircle2,
    title: "Face to Name",
    message: "The Guest Registry is looking a bit mysterious. Upload a profile photo to help everyone recognize you.",
    actionLabel: "Upload Photo",
    targetView: 'profile',
    color: "bg-orange-500"
  },
  EXPLORE_ACTIVITIES: {
    id: 'explore_activities',
    priority: 40,
    icon: Sparkles,
    title: "Curate Your Trip",
    message: "Your itinerary has free time. Explore the 'Activities' tab to book vineyard tours or dinner spots.",
    actionLabel: "Explore Now",
    targetView: 'activities',
    color: "bg-fuchsia-500"
  }
};
