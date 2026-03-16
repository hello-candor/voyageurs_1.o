
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const provider = new GoogleAuthProvider();

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

    // Mock Validation Logic for legacy password
    const isValid = (
        password === 'BRYAN' || 
        (
            password.length > 5 && 
            (
                password.toLowerCase().includes('montpellier') || 
                password.includes('admin')
            )
        )
    );

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
  loginWithGoogle: async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // Handle specific errors like popup closed by user
      if (error.code === 'auth/popup-closed-by-user') {
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
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
  
  /**
   * Legacy logout function, now points to the new unified logout.
   */
  logoutHost: async (): Promise<void> => {
    return authService.logout();
  }
};
