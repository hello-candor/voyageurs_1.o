
import { 
  GoogleAuthProvider, 
  signInWithCredential,
  signOut,
  User
} from "firebase/auth";
import { auth } from "../firebaseConfig";

// Mock guest codes for demonstration
const GUEST_CODES = ['GUEST123', 'WELCOME', 'PARTY'];
const HOST_PASSCODES = ['BRYAN', 'BAXTER', 'QUINCY', 'MONTPELLIER_ADMIN'];

/**
 * Authentication Service
 * 
 * Handles both legacy password-based auth and Firebase Google Auth for hosts.
 */
export const authService = {
  /**
   * Simulates a secure host login using a password.
   * This is retained for legacy purposes.
   */
  loginHost: async (password: string): Promise<boolean> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Convert to uppercase for case-insensitive comparison
    const upperCasePassword = password.toUpperCase();
    
    // Check against the list of valid host passcodes
    const isValid = HOST_PASSCODES.includes(upperCasePassword);

    return isValid;
  },

  /**
   * Simulates creating a new host account with email/password.
   */
  createHostAccount: async (email: string, password: string): Promise<boolean> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would create the user record.
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
      // Handle specific errors like popup closed by user
      if ((error as any).code === 'auth/popup-closed-by-user') {
        return null;
      }
      throw error; // Rethrow other errors
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
   * Verifies a guest access code.
   */
  verifyGuestCode: async (code: string): Promise<boolean> => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    return GUEST_CODES.includes(code.toUpperCase());
  },

  /**
   * Legacy logout function, now points to the new unified logout.
   */
  logoutHost: async (): Promise<void> => {
    return authService.logout();
  }
};
