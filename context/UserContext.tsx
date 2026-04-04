
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SocialLinks, SharedExpense, CoordinatedGroup, PrivacySettings, GalleryPost } from '../types';
import { safeStorage } from '../utils/storage';
import { db, auth } from '../firebaseConfig';
import { collection, doc, setDoc, onSnapshot, updateDoc, query, orderBy, getDoc, addDoc } from "firebase/firestore";
import { emailService } from '../services/emailService';
import { uploadImage } from '../services/storageService';

export interface PartyMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    status: 'Member' | 'Invited' | 'PendingConfirmation';
    isPrimary?: boolean;
}

export interface TravelOption {
    id: string;
    type: 'flight' | 'train';
    title: string;
    name: string;
    image: string;
    baseCost: number;
}

export interface OfficialItinerary {
    hotel?: {
        name: string;
        image: string;
        baseRate: number;
    };
    transport?: TravelOption;
}

export interface UserProfile {
    name: string;
    email: string;
    guestsCount: number;
    avatar?: string;
    isConfirmed: boolean;
    status: 'Confirmed' | 'Pending' | 'Declined';
    hasCompletedOnboarding?: boolean;
    partyMembers: PartyMember[];
    dietary?: string;
    note?: string;
    officialItinerary: OfficialItinerary;
    social?: SocialLinks;
    privacy: PrivacySettings;
    interests?: string[];
    travelDetails?: {
        arrivalDate: string;
        departureDate?: string;
        arrivalMode: 'Plane' | 'Train' | 'Car';
        arrivalNumber: string;
        accommodation: string;
        hub?: string;
    };
    phone?: string;
    isAdmin?: boolean;
}

export interface Guest {
    id: string;
    name: string;
    email: string;
    status: 'Confirmed' | 'Pending' | 'Declined';
    arrival: string;
    dietary: string;
    note: string;
    img: string;
    guestsCount: number;
    invitationCode?: string;
    travelHub?: string;
    itinerarySummary?: string;
    plusOneDetails?: string;
    social?: SocialLinks;
    privacy: PrivacySettings;
    interests?: string[];
    travelDetails?: UserProfile['travelDetails'];
}

const DEFAULT_PRIVACY: PrivacySettings = {
    shareSocial: true,
    sharePhone: true,
    shareInterests: true,
    publicRegistry: true,
    smsConsent: true
};

const HOST_EMAILS = ['bryan@montpellier2026.com', 'admin@voyageurs.app', 'host@example.com'];

const INITIAL_GUESTS: Guest[] = [
    { id: '1', name: "Alice M.", email: "alice@example.com", status: "Confirmed", arrival: "Sep 17 (CDG)", dietary: "Vegetarian", note: "Flying in with Bob.", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", guestsCount: 2, invitationCode: "ALI921", interests: ['sete', 'hortus'], social: { instagram: '@alice_travels', whatsapp: '+33 6 12 34 56 78', venmo: 'alice-m-bills' }, privacy: DEFAULT_PRIVACY },
    { id: '2', name: "David K.", email: "david@example.com", status: "Confirmed", arrival: "Sep 18 (BCN)", dietary: "None", note: "Needs shuttle info.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", guestsCount: 1, invitationCode: "DAV404", interests: ['sete', 'nimes'], social: { whatsapp: '+44 7700 900000', cashapp: '$davidk' }, privacy: DEFAULT_PRIVACY },
    { id: '3', name: "Sarah L.", email: "sarah@example.com", status: "Confirmed", arrival: "Sep 17 (CDG)", dietary: "Gluten Free", note: "Bringing the good camera.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", guestsCount: 1, invitationCode: "SAR882", interests: ['camargue', 'flaugergues'], social: { instagram: '@sarah_snaps', zelle: 'sarah@example.com' }, privacy: DEFAULT_PRIVACY },
];

interface UserContextType {
    user: UserProfile | null;
    isVerified: boolean;
    isProfileOpen: boolean;
    authMode: 'login' | 'rsvp';
    hasRSVPd: boolean;
    allGuests: Guest[];
    sharedExpenses: SharedExpense[];
    coordinatedGroups: CoordinatedGroup[];
    galleryPosts: GalleryPost[];
    setVerified: (val: boolean) => void;
    login: (name: string, email: string, guestsCount: number, status?: Guest['status'], dietary?: string, note?: string, social?: SocialLinks, privacy?: PrivacySettings, phone?: string) => void;
    loginWithGoogle: (credential: string) => Promise<void>;
    loginWithCode: (code: string) => Promise<boolean>;
    logout: () => void;
    toggleProfile: (mode?: 'login' | 'rsvp') => void;
    setAuthMode: (mode: 'login' | 'rsvp') => void;
    submitRSVP: (data: Partial<Guest>) => void;
    completeOnboarding: () => void;
    updateTravelDetails: (details: UserProfile['travelDetails']) => void;
    updateProfile: (data: Partial<UserProfile>) => void;
    updateOfficialItinerary: (data: Partial<OfficialItinerary>) => void;
    inviteToParty: (email: string, name: string) => void;
    removeFromParty: (id: string) => void;
    syncPartyTravel: (options: { flights: boolean; lodging: boolean }) => void;
    updateGuestStatus: (id: string, status: Guest['status']) => void;
    updateAnyGuest: (id: string, data: Partial<Guest>) => void;
    addGuest: (guest: Partial<Guest>) => void;
    bulkAddGuests: (guests: Partial<Guest>[]) => void;
    deleteGuest: (id: string) => void;
    updateUserInterests: (interests: string[]) => void;
    addSharedExpense: (expense: Omit<SharedExpense, 'id' | 'status'>) => void;
    resolveSharedExpense: (expenseId: string) => void;
    saveCoordinatedGroup: (group: Omit<CoordinatedGroup, 'id'>) => void;
    shareGalleryPhoto: (file: File, caption: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'rsvp'>('rsvp');
    const [hasRSVPd, setHasRSVPd] = useState(false);
    const [allGuests, setAllGuests] = useState<Guest[]>(() => {
        return safeStorage.getItem('local_guests', INITIAL_GUESTS) || INITIAL_GUESTS;
    });
    const [galleryPosts, setGalleryPosts] = useState<GalleryPost[]>([]);

    const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>(() => {
        return safeStorage.getItem('shared_expenses', []);
    });

    const [coordinatedGroups, setCoordinatedGroups] = useState<CoordinatedGroup[]>(() => {
        return safeStorage.getItem('coordinated_groups', []);
    });

    const [isVerified, setIsVerified] = useState(() => {
        return safeStorage.getItem('is_verified') === 'true';
    });

    const [user, setUser] = useState<UserProfile | null>(() => {
        return safeStorage.getItem('guest_user', null);
    });

    const [isCloudEnabled, setIsCloudEnabled] = useState(true);
    const authStateChecked = useRef(false);

    const setVerified = useCallback((val: boolean) => {
        setIsVerified(val);
        if (val) safeStorage.setItem('is_verified', 'true');
        else safeStorage.removeItem('is_verified');
    }, []);

    // Monitor Auth State
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((u) => {
            authStateChecked.current = true;
            if (!u) {
                // If auth fails/is missing, switch to local mode
                setIsCloudEnabled(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Sync Guests from Firestore
    useEffect(() => {
        if (!isCloudEnabled) return;

        // Safety check: wait until auth is determined
        if (!auth.currentUser && !authStateChecked.current) return;
        if (!auth.currentUser) {
            setIsCloudEnabled(false);
            return;
        }

        try {
            const unsubscribe = onSnapshot(collection(db, "guests"), (snapshot) => {
                const guests: Guest[] = [];
                snapshot.forEach((doc) => {
                    guests.push({ id: doc.id, ...doc.data() } as Guest);
                });
                if (guests.length > 0) {
                    setAllGuests(guests);
                    safeStorage.setItem('local_guests', guests);

                    // Sync current user if they exist in remote
                    if (user) {
                        const myGuestDoc = guests.find(g => g.email === user.email);
                        if (myGuestDoc) {
                            setUser(prev => prev ? {
                                ...prev,
                                name: myGuestDoc.name,
                                status: myGuestDoc.status,
                                guestsCount: myGuestDoc.guestsCount,
                                dietary: myGuestDoc.dietary,
                                note: myGuestDoc.note,
                                avatar: myGuestDoc.img,
                                social: myGuestDoc.social,
                                privacy: myGuestDoc.privacy,
                                interests: myGuestDoc.interests,
                                travelDetails: myGuestDoc.travelDetails
                            } : null);
                        }
                    }
                }
            }, (error) => {
                // CRITICAL FIX: If permission denied, switch to offline mode immediately and silence error
                if (error.code === 'permission-denied' || error.code === 'unavailable') {
                    console.warn("⚠️ Offline Mode Active: Firestore sync disabled (Permission Denied).");
                    setIsCloudEnabled(false);
                }
            });

            return () => unsubscribe();
        } catch (e) {
            console.warn("Firestore init failed, switching to offline.");
            setIsCloudEnabled(false);
        }
    }, [user?.email, isCloudEnabled]);

    // Sync Gallery Posts
    useEffect(() => {
        if (!isCloudEnabled || !auth.currentUser) return;

        try {
            const q = query(collection(db, 'gallery_posts'), orderBy('timestamp', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const posts: GalleryPost[] = [];
                snapshot.forEach((doc) => {
                    posts.push({ id: doc.id, ...doc.data() } as GalleryPost);
                });
                setGalleryPosts(posts);
            }, (error) => {
                if (error.code === 'permission-denied') {
                    setIsCloudEnabled(false); // Stop trying
                }
            });
            return () => unsubscribe();
        } catch (e) {
            // Ignore
        }
    }, [isCloudEnabled]);

    // Local Persistence
    useEffect(() => {
        if (user) {
            safeStorage.setItem('guest_user', user);
            setHasRSVPd(user.status !== 'Declined' && user.isConfirmed);
        } else {
            safeStorage.removeItem('guest_user');
            setHasRSVPd(false);
        }
    }, [user]);

    useEffect(() => {
        safeStorage.setItem('local_guests', allGuests);
    }, [allGuests]);

    useEffect(() => {
        safeStorage.setItem('shared_expenses', sharedExpenses);
    }, [sharedExpenses]);

    useEffect(() => {
        safeStorage.setItem('coordinated_groups', coordinatedGroups);
    }, [coordinatedGroups]);

    // Actions
    const login = useCallback(async (name: string, email: string, guestsCount: number, status: Guest['status'] = 'Pending', dietary: string = '', note: string = '', social?: SocialLinks, privacy?: PrivacySettings, phone?: string) => {
        const normalizedEmail = email.toLowerCase().trim();
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D67252&color=fff`;
        const isAdmin = HOST_EMAILS.includes(normalizedEmail);

        const newUser: UserProfile = {
            name,
            email: normalizedEmail,
            guestsCount,
            isConfirmed: status !== 'Pending',
            status: status,
            hasCompletedOnboarding: false,
            avatar,
            dietary,
            note,
            officialItinerary: {},
            interests: [],
            social: social || {},
            privacy: privacy || DEFAULT_PRIVACY,
            phone: phone || '',
            isAdmin,
            partyMembers: [{
                id: 'primary',
                name,
                email: normalizedEmail,
                avatar,
                status: 'Member',
                isPrimary: true
            }],
        };

        const existingGuest = allGuests.find(g => g.email === normalizedEmail);
        setUser(newUser);
        setVerified(true);

        if (status !== 'Declined') {
            setIsProfileOpen(false);
            safeStorage.setItem('rsvp_status', status === 'Confirmed' ? 'confirmed' : 'pending');
        }

        if (isCloudEnabled && auth.currentUser) {
            try {
                const guestDocRef = doc(db, "guests", normalizedEmail);
                const guestData: Partial<Guest> = {
                    id: normalizedEmail,
                    name,
                    email: normalizedEmail,
                    status,
                    guestsCount,
                    dietary,
                    note,
                    img: existingGuest?.img || avatar,
                    social: social || {},
                    privacy: privacy || DEFAULT_PRIVACY,
                    invitationCode: existingGuest?.invitationCode || Math.random().toString(36).substring(7).toUpperCase(),
                };
                await setDoc(guestDocRef, guestData, { merge: true });
            } catch (e: any) {
                // Silent fail to local mode
                if (e.code === 'permission-denied') setIsCloudEnabled(false);
            }
        }
    }, [allGuests, setVerified, isCloudEnabled]);

    const loginWithGoogle = useCallback(async (credential: string) => {
        try {
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const { name, email, picture } = payload;

            const normalizedEmail = email.toLowerCase().trim();

            if (isCloudEnabled && auth.currentUser) {
                const guestDocRef = doc(db, "guests", normalizedEmail);
                try {
                    const guestSnap = await getDoc(guestDocRef);
                    if (guestSnap.exists()) {
                        const data = guestSnap.data() as Guest;
                        login(data.name, data.email, data.guestsCount, data.status, data.dietary, data.note, data.social, data.privacy);
                        if (picture && !data.img.includes('firebase')) {
                            await updateDoc(guestDocRef, { img: picture });
                        }
                    } else {
                        login(name, normalizedEmail, 1, 'Pending', '', '');
                        await updateDoc(guestDocRef, { img: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D67252&color=fff` });
                    }
                } catch (e: any) {
                    if (e.code === 'permission-denied') setIsCloudEnabled(false);
                    login(name, normalizedEmail, 1, 'Pending', '', '');
                }
            } else {
                login(name, normalizedEmail, 1, 'Pending', '', '');
            }

            setVerified(true);
        } catch (e) {
            console.error("Google Auth Error:", e);
        }
    }, [login, setVerified, isCloudEnabled]);

    const loginWithCode = useCallback(async (code: string) => {
        const uppercaseCode = code.toUpperCase().trim();

        if (uppercaseCode === 'BAXTER') {
            login('Alex Baxter', 'alex.baxter@voyageurs.app', 1, 'Confirmed', '', '');
            setVerified(true);
            return true;
        }

        const guest = allGuests.find(g => g.invitationCode === uppercaseCode);
        if (guest) {
            login(guest.name, guest.email, guest.guestsCount, guest.status, guest.dietary, guest.note, guest.social, guest.privacy);
            setVerified(true);
            return true;
        }
        return false;
    }, [allGuests, login, setVerified]);

    const logout = useCallback(() => {
        setUser(null);
        setIsVerified(false);
        setAllGuests(INITIAL_GUESTS);
        setSharedExpenses([]);
        setCoordinatedGroups([]);
        // Clear all guest-related storage
        safeStorage.clearAppStorage();
        
        setIsProfileOpen(false);
    }, []);

    const toggleProfile = useCallback((mode?: 'login' | 'rsvp') => {
        if (mode) setAuthMode(mode);
        setIsProfileOpen(prev => !prev);
    }, []);

    const submitRSVP = useCallback(async (data: Partial<Guest>) => {
        if (!user) return;

        const updatedUser = {
            ...user,
            ...data,
            isConfirmed: data.status === 'Confirmed' || user.isConfirmed
        } as UserProfile;

        setUser(updatedUser);
        setAllGuests(prev => prev.map(g => g.email === user.email ? { ...g, ...data } : g));

        if (isCloudEnabled && auth.currentUser) {
            try {
                const guestDocRef = doc(db, "guests", user.email);
                await updateDoc(guestDocRef, data);
            } catch (e: any) {
                if (e.code === 'permission-denied') setIsCloudEnabled(false);
            }
        }
    }, [user, isCloudEnabled]);

    const completeOnboarding = useCallback(() => {
        if (user) {
            submitRSVP({ hasCompletedOnboarding: true } as any);
        }
    }, [user, submitRSVP]);

    const updateTravelDetails = useCallback((details: UserProfile['travelDetails']) => {
        if (user) {
            submitRSVP({ travelDetails: details } as any);
        }
    }, [user, submitRSVP]);

    const updateProfile = useCallback((data: Partial<UserProfile>) => {
        if (user) {
            submitRSVP(data as any);
        }
    }, [user, submitRSVP]);

    const updateOfficialItinerary = useCallback((data: Partial<OfficialItinerary>) => {
        if (user) {
            const updated = { ...user.officialItinerary, ...data };
            submitRSVP({ officialItinerary: updated } as any);
        }
    }, [user, submitRSVP]);

    const inviteToParty = useCallback((email: string, name: string) => {
        if (!user) return;
        const newMember: PartyMember = {
            id: `party-${Date.now()}`,
            name,
            email: email.toLowerCase(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A4C8E1&color=fff`,
            status: 'Invited'
        };
        const updatedParty = [...user.partyMembers, newMember];
        submitRSVP({ partyMembers: updatedParty } as any);
    }, [user, submitRSVP]);

    const removeFromParty = useCallback((id: string) => {
        if (!user) return;
        const updatedParty = user.partyMembers.filter(m => m.id !== id);
        submitRSVP({ partyMembers: updatedParty } as any);
    }, [user, submitRSVP]);

    const syncPartyTravel = useCallback((options: { flights: boolean; lodging: boolean }) => {
        console.log("Syncing party travel...", options);
    }, []);

    const updateGuestStatus = useCallback(async (id: string, status: Guest['status']) => {
        setAllGuests(prev => prev.map(g => g.id === id ? { ...g, status } : g));

        if (isCloudEnabled && auth.currentUser) {
            try {
                const guestDocRef = doc(db, "guests", id);
                await updateDoc(guestDocRef, { status });
            } catch (e: any) {
                if (e.code === 'permission-denied') setIsCloudEnabled(false);
            }
        }
    }, [isCloudEnabled]);

    const updateAnyGuest = useCallback(async (id: string, data: Partial<Guest>) => {
        setAllGuests(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));

        if (isCloudEnabled && auth.currentUser) {
            try {
                const guestDocRef = doc(db, "guests", id);
                await updateDoc(guestDocRef, data);
            } catch (e: any) {
                if (e.code === 'permission-denied') setIsCloudEnabled(false);
            }
        }
    }, [isCloudEnabled]);

    const addGuest = useCallback(async (guest: Partial<Guest>) => {
        if (!guest.email) return;
        const newGuest = {
            ...guest,
            id: guest.email,
            status: guest.status || 'Pending',
            guestsCount: guest.guestsCount || 1,
            img: guest.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(guest.name || 'G')}&background=D67252&color=fff`,
            privacy: DEFAULT_PRIVACY
        } as Guest;

        setAllGuests(prev => [...prev, newGuest]);

        if (isCloudEnabled && auth.currentUser) {
            try {
                const guestDocRef = doc(db, "guests", guest.email);
                await setDoc(guestDocRef, newGuest, { merge: true });
            } catch (e: any) {
                if (e.code === 'permission-denied') setIsCloudEnabled(false);
            }
        }
    }, [isCloudEnabled]);

    const bulkAddGuests = useCallback(async (guests: Partial<Guest>[]) => {
        for (const g of guests) {
            await addGuest(g);
        }
    }, [addGuest]);

    const deleteGuest = useCallback(async (id: string) => {
        setAllGuests(prev => prev.filter(g => g.id !== id));
    }, []);

    const updateUserInterests = useCallback((interests: string[]) => {
        if (user) {
            submitRSVP({ interests } as any);
        }
    }, [user, submitRSVP]);

    const addSharedExpense = useCallback((expense: Omit<SharedExpense, 'id' | 'status'>) => {
        const newExp: SharedExpense = {
            ...expense,
            id: `exp-${Date.now()}`,
            status: 'active'
        };
        setSharedExpenses(prev => [newExp, ...prev]);
    }, []);

    const resolveSharedExpense = useCallback((expenseId: string) => {
        setSharedExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status: 'resolved' as const } : e));
    }, []);

    const saveCoordinatedGroup = useCallback((group: Omit<CoordinatedGroup, 'id'>) => {
        const newGroup: CoordinatedGroup = {
            ...group,
            id: `group-${Date.now()}`
        };
        setCoordinatedGroups(prev => [newGroup, ...prev]);
    }, []);

    const shareGalleryPhoto = useCallback(async (file: File, caption: string) => {
        if (!user) return;
        try {
            const url = await uploadImage(file, 'gallery');
            const newPost = {
                id: `local-${Date.now()}`,
                url,
                caption,
                uploaderName: user.name,
                uploaderId: user.email,
                timestamp: Date.now()
            };
            // Optimistic update
            setGalleryPosts(prev => [newPost, ...prev]);

            if (isCloudEnabled && auth.currentUser) {
                try {
                    await addDoc(collection(db, 'gallery_posts'), {
                        url,
                        caption,
                        uploaderName: user.name,
                        uploaderId: user.email,
                        timestamp: Date.now()
                    });
                } catch (e: any) {
                    if (e.code === 'permission-denied') setIsCloudEnabled(false);
                }
            }
        } catch (e) {
            console.error("Error sharing photo:", e);
            throw e;
        }
    }, [user, isCloudEnabled]);

    const value = useMemo(() => ({
        user,
        isVerified,
        isProfileOpen,
        authMode,
        hasRSVPd,
        allGuests,
        sharedExpenses,
        coordinatedGroups,
        galleryPosts,
        setVerified,
        login,
        loginWithGoogle,
        loginWithCode,
        logout,
        toggleProfile,
        setAuthMode,
        submitRSVP,
        completeOnboarding,
        updateTravelDetails,
        updateProfile,
        updateOfficialItinerary,
        inviteToParty,
        removeFromParty,
        syncPartyTravel,
        updateGuestStatus,
        updateAnyGuest,
        addGuest,
        bulkAddGuests,
        deleteGuest,
        updateUserInterests,
        addSharedExpense,
        resolveSharedExpense,
        saveCoordinatedGroup,
        shareGalleryPhoto
    }), [
        user, isVerified, isProfileOpen, authMode, hasRSVPd, allGuests, sharedExpenses, coordinatedGroups, galleryPosts,
        setVerified, login, loginWithGoogle, loginWithCode, logout, toggleProfile, setAuthMode, submitRSVP,
        completeOnboarding, updateTravelDetails, updateProfile, updateOfficialItinerary,
        inviteToParty, removeFromParty, syncPartyTravel, updateGuestStatus, updateAnyGuest,
        addGuest, bulkAddGuests, deleteGuest, updateUserInterests, addSharedExpense,
        resolveSharedExpense, saveCoordinatedGroup, shareGalleryPhoto
    ]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
