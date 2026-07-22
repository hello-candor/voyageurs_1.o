
import { 
  GoogleAuthProvider, 
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInAnonymously,
  User
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

// Host passcodes for admin access
const HOST_PASSCODES = ['BRYAN', 'BAXTER', 'QUINCY', '_ADMIN'];

// Event ID for guest lookups
const EVENT_ID = "voyageurs_2026";

/**
 * Authentication Service
 * 
 * Handles Firestore-backed guest code verification, legacy host passcode auth,
 * and Firebase Google Auth for hosts.
 */
export const authService = {
  /**
   * Host login using a password/passcode.
   */
  loginHost: async (password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const upperCasePassword = password.toUpperCase();
    return HOST_PASSCODES.includes(upperCasePassword);
  },

  /**
   * Creates a new host account (placeholder).
   */
  createHostAccount: async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Creating host account for ${email}`);
    return true;
  },

  /**
   * Initiates Google Sign-In and returns the user object.
   */
  loginWithGoogle: async (credential: string): Promise<User | null> => {
    try {
      const googleCredential = GoogleAuthProvider.credential(credential);
      const result = await signInWithCredential(auth, googleCredential);
      return result.user;
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      if ((error as any).code === 'auth/popup-closed-by-user') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Signs in a host using email and password via Firebase Auth.
   */
  signInWithEmail: async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  /**
   * Creates a new host account using email and password via Firebase Auth.
   */
  signUpWithEmail: async (email: string, password: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  /**
   * Initiates Google Sign-In via popup and returns the user object.
   */
  signInWithGooglePopup: async (): Promise<User | null> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error during Google popup sign-in:", error);
      if ((error as any).code === 'auth/popup-closed-by-user') {
        return null;
      }
      throw error;
    }
  },

  /**
   * Signs out the current user from Firebase.
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
  
  /**
   * Verifies a guest access code by looking up the document directly.
   * Document IDs match invitation codes, so no query needed.
   * Waits for auth to be ready (anonymous sign-in) before querying.
   * Returns the guest data if found, null otherwise.
   */
  verifyGuestCode: async (code: string): Promise<any | null> => {
    const clean = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const upperCode = [
      clean.slice(0, 3),
      clean.slice(3, 6),
      clean.slice(6)
    ].filter(Boolean).join('-');
    
    try {
      // Ensure we have an authenticated user before querying
      // (Firestore rules require auth != null)
      if (!auth.currentUser) {
        console.log('⏳ Waiting for anonymous auth before Firestore query...');
        try {
          await signInAnonymously(auth);
        } catch (authErr) {
          console.warn('Anonymous sign-in failed:', authErr);
        }
      }

      // Attempt the lookup
      const guestDocRef = doc(db, "events", EVENT_ID, "guests", upperCode);
      let guestSnap = await getDoc(guestDocRef);
      
      if (guestSnap.exists()) {
        return { id: guestSnap.id, ...guestSnap.data() };
      }

      // If not found, try one more time after a brief delay
      // (handles race condition where auth token isn't fully propagated)
      if (!guestSnap.exists() && auth.currentUser) {
        await new Promise(r => setTimeout(r, 500));
        guestSnap = await getDoc(guestDocRef);
        if (guestSnap.exists()) {
          return { id: guestSnap.id, ...guestSnap.data() };
        }
      }
      
      return null;
    } catch (error) {
      console.warn("Firestore guest code lookup failed, falling back to local:", error);
      return null;
    }
  },

  /**
   * Legacy logout function, now points to the new unified logout.
   */
  logoutHost: async (): Promise<void> => {
    return authService.logout();
  }
};

