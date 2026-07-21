
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { safeStorage } from '../utils/storage';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  isHost: boolean;
  firebaseUser: User | null;
  isLoading: boolean;
  error: string | null;
  loginHost: (password: string) => Promise<boolean>;
  loginHostWithGoogle: (credential: string) => Promise<void>;
  signupHost: (email: string, password: string) => Promise<void>;
  loginHostWithEmail: (email: string, password: string) => Promise<boolean>;
  signupHostWithEmail: (email: string, password: string) => Promise<boolean>;
  loginHostWithGooglePopup: () => Promise<boolean>;
  logoutHost: () => Promise<void>;
  verifyGuestCode: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHost, setIsHost] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        // Check if this is a real (non-anonymous) user for host access
        if (!user.isAnonymous) {
          // Explicitly segment Host access to Bryan for the Montpellier trip
          const email = user.email?.toLowerCase();
          const isAuthorizedHost = email === 'bryan@candor.io' || email === 'bryan@2026.com';
          
          if (isAuthorizedHost) {
            setIsHost(true);
            safeStorage.setItem('host_session', 'active_firebase');
          } else {
            console.warn("Unauthorized host attempt by:", email);
            setIsHost(false);
            safeStorage.removeItem('host_session');
          }
        } else {
          // Anonymous user — check for legacy host session
          const legacySession = safeStorage.getItem('host_session');
          if (legacySession === 'active') {
            setIsHost(true);
          }
        }
      } else {
        // No user at all — sign in anonymously so Firestore queries work
        const legacySession = safeStorage.getItem('host_session');
        if (legacySession === 'active') {
          setIsHost(true);
        } else {
          setIsHost(false);
          safeStorage.removeItem('host_session');
        }
        // Trigger anonymous sign-in (the onAuthStateChanged callback
        // will fire again once it completes)
        signInAnonymously(auth).catch((err) => {
          console.warn('Anonymous sign-in failed:', err);
          setIsLoading(false);
        });
        return; // Don't set isLoading=false yet, wait for the anon sign-in callback
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginHost = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await authService.loginHost(password);
      if (success) {
        setIsHost(true);
        safeStorage.setItem('host_session', 'active');
        return true;
      } else {
        setError('Invalid credentials');
        return false;
      }
    } catch (err) {
      setError('Authentication failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginHostWithGoogle = useCallback(async (credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.loginWithGoogle(credential);
      if (!user) {
        setError('Google Sign-In was cancelled.');
      }
    } catch (err) {
      setError('Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupHost = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.createHostAccount(email, password);
      setIsHost(true);
      safeStorage.setItem('host_session', 'active');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginHostWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signInWithEmail(email, password);
      // onAuthStateChanged will fire and set isHost = true for non-anonymous users
      return true;
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found with this email.' :
                  err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
                  err.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.' :
                  'Sign-in failed. Please try again.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupHostWithEmail = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signUpWithEmail(email, password);
      // onAuthStateChanged will fire and set isHost = true for non-anonymous users
      return true;
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use' ? 'An account with this email already exists. Try signing in.' :
                  err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.' :
                  err.code === 'auth/invalid-email' ? 'Please enter a valid email address.' :
                  'Sign-up failed. Please try again.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginHostWithGooglePopup = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.signInWithGooglePopup();
      if (!user) {
        setError('Google Sign-In was cancelled.');
        return false;
      }
      return true;
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google Sign-In failed. Please try again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutHost = useCallback(async () => {
    setIsLoading(true);
    await authService.logout();
    // Clear all app storage on logout
    safeStorage.clearAppStorage();
    setIsHost(false);
    setIsLoading(false);
  }, []);

  const verifyGuestCode = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const isValid = await authService.verifyGuestCode(code);
      if (!isValid) {
        setError('Invalid guest code.');
      }
      return isValid;
    } catch (err) {
      setError('Guest verification failed.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    isHost,
    firebaseUser,
    isLoading,
    error,
    loginHost,
    loginHostWithGoogle,
    signupHost,
    loginHostWithEmail,
    signupHostWithEmail,
    loginHostWithGooglePopup,
    logoutHost,
    verifyGuestCode
  }), [isHost, firebaseUser, isLoading, error, loginHost, loginHostWithGoogle, signupHost, loginHostWithEmail, signupHostWithEmail, loginHostWithGooglePopup, logoutHost, verifyGuestCode]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
