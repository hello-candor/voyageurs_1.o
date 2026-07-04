
import React from 'react';

// @google/genai-sdk: Add Type enum for schema definitions
export enum Type {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
}

// --- GENERIC TYPES ---
export interface DayTrip {
  id: string;
  name: string;
  description: string;
  image: string;
  distance: string;
  fullDescription?: string;
  highlights?: string[];
  bestFor?: string;
  transportDetail?: string;
}

// --- CMS CONTENT TYPES ---

export interface AppTheme {
  primaryColor: string;      // med-blue
  primaryLightColor: string; // med-lightBlue
  backgroundColor: string;   // med-sand
  accentColor: string;       // med-terracotta
  successColor: string;      // med-olive
}

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface Hotel {
  name: string;
  image: string;
  gallery?: string[];
  stars?: number;
  tag?: string;
  description: string;
  link: string;
  priceLevel: number; // 1-5
  categoryId?: string; 
  lat: number;
  lng: number;
  fullDescription?: string;
  highlights?: string[];
  transportDetail?: string;
  averageRate?: string;
  baseRate: number;
  reviews?: Review[];
}

export interface HotelCategory {
  id: string;
  title: string;
  // icon is stored as string name in JSON, mapped in component
  iconName?: string; 
  description: string;
  hotels: Hotel[];
}

export interface Restaurant {
  name: string;
  image: string;
  priceLevel: number; // 1-4
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
  iconName?: string;
  description: string;
  restaurants: Restaurant[];
}

export interface AgendaEvent {
    id: string;
    day: string;
    date: string;
    time: string;
    startTime: string;
    durationHours: number;
    title: string;
    subtitle: string;
    location: string;
    description: string;
    iconName?: string; // e.g. 'GlassWater', 'Wine'
    image: string;
    isOfficial: boolean;
}

export interface ExplorationItem extends DayTrip {
  category: 'activity' | 'vineyard' | 'landmark';
  // Vineyard specific
  signatureWine?: string;
  varietals?: string[];
  tastingNotes?: string;
  // Landmark/Activity specific
  entryCost: number;
  lat?: number;
  lng?: number;
}

export interface ActivityItem {
    id: string;
    category: 'dining' | 'daytrips' | 'vineyards' | 'nightlife' | 'beaches' | 'shopping' | 'lgbt';
    name: string;
    description: string;
    image: string;
    tags: string[];
    priceLevel?: number;
    baseCost: number;
    pricingType: 'perPerson' | 'fixed';
    locationQuery: string;
    highlights?: string[];
    fullDescription?: string;
    link?: string;
    lat?: number;
    lng?: number;
    isLGBTFriendly?: boolean;
    transportDetail?: string;
}

export interface InfoSectionItem {
    title: string;
    desc: string;
    image: string;
    iconName: string;
}

export interface InfoSectionStat {
    label: string;
    value: string;
}

export interface InfoSection {
    id: string;
    tabLabel: string;
    tabIcon: string;
    tabDesc: string;
    title: string;
    description: string;
    stats: InfoSectionStat[];
    items: InfoSectionItem[];
}

export interface LandingContent {
    title: string;
    subtitle: string;
    quote: string;
    infoSections: InfoSection[];
}

// NEW TYPES FOR CELEBRATION & GALLERY
export interface CelebrationTab {
    id: string;
    label: string;
    subtitle: string;
    iconName: string;
    title: string;
    quote: string;
    text: string;
    image: string;
}

export interface CelebrationContent {
    title: string;
    subtitle: string;
    quote: string;
    tabs: CelebrationTab[];
}

export interface GalleryItem {
    url: string;
    alt: string;
    caption: string;
    description: string;
    link?: string;
}

export interface GalleryCollection {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    iconName: string;
    images: GalleryItem[];
}

export interface GalleryContent {
    title: string;
    subtitle: string;
    quote: string;
    collections: GalleryCollection[];
}

// --- USER & SYSTEM TYPES ---

export interface ChatSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  sources?: ChatSource[];
  image?: string;
  timestamp?: number;
}

export interface PrivacySettings {
  shareSocial: boolean;
  sharePhone: boolean;
  shareInterests: boolean;
  publicRegistry: boolean;
  smsConsent: boolean;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  whatsapp?: string;
  phone?: string;
  phoneFrench?: string;
  phoneUS?: string;
  phoneOther?: string;
  venmo?: string;
  cashapp?: string;
  zelle?: string;
}

export interface SharedExpense {
  id: string;
  payerId: string;
  payerName: string;
  amount: number;
  description: string;
  date: string;
  merchant?: string;
  category?: string;
  splitWithIds: string[];
  receiptUrl?: string;
  status: 'active' | 'resolved';
}

export interface CoordinatedGroup {
  id: string;
  interestId: string;
  name: string;
  members: string[];
}

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  scheduledFor?: number;
  readBy: string[];
  type: 'text' | 'system' | 'image';
  imageUrl?: string;
  sources?: ChatSource[];
}

export interface ChatThread {
  id: string;
  participants: string[];
  type: 'direct' | 'group' | 'broadcast';
  subject?: string;
  messages: InternalMessage[];
  updatedAt: number;
  lastMessagePreview: string;
}

export type PlanCategory = 'flight' | 'train' | 'hotel' | 'dining' | 'vineyard' | 'activity' | 'lifestyle' | 'nightlife' | 'beach' | 'shopping';

export type PricingType = 'perPerson' | 'fixed' | 'hotel';

export interface PlanItem {
  id: string; 
  category: PlanCategory;
  name: string;
  cost: number;
  baseCost: number;
  pricingType: PricingType;
  details?: string;
  image?: string;
  bookingStatus?: 'planned' | 'booked';
  bookingConfirmation?: string;
  bookingUrl?: string;
  secondaryBookingUrl?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    subtitle: string;
    start: Date;
    end: Date;
    type: 'official' | 'personal' | 'travel' | 'planning';
    location?: string;
    icon?: React.ElementType;
    cost?: number;
    pricingType?: PricingType;
}

export interface GalleryPost {
  id: string;
  url: string;
  caption: string;
  uploaderName: string;
  uploaderId: string;
  timestamp: number;
}

export interface ItinerarySuggestion {
  name: string;
  category: 'dining' | 'activity' | 'nightlife' | 'shopping';
  description: string;
  duration: string;
  estimatedCost: number;
}
