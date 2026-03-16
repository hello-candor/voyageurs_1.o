
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { safeStorage } from '../utils/storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType {
  isHost: boolean;
  firebaseUser: User | null; // Expose Firebase user state
  isLoading: boolean;
  error: string | null;
  loginHost: (password: string) => Promise<boolean>;
  loginHostWithGoogle: () => Promise<void>;
  signupHost: (email: string, password: string) => Promise<void>;
  logoutHost: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHost, setIsHost] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Unified session check
  useEffect(() => {
    // 1. Check for Firebase auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsHost(true);
        safeStorage.setItem('host_session', 'active_firebase');
      } else {
        // 2. If no Firebase user, check for legacy session
        const legacySession = safeStorage.getItem('host_session');
        if (legacySession === 'active') {
          setIsHost(true);
        } else {
          setIsHost(false);
          safeStorage.removeItem('host_session');
        }
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
  
  const loginHostWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.loginWithGoogle();
      if (user) {
        // State will be updated by onAuthStateChanged listener
      } else {
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
      // This can be enhanced to use Firebase email/password creation
      await authService.createHostAccount(email, password);
      setIsHost(true);
      safeStorage.setItem('host_session', 'active');
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logoutHost = useCallback(async () => {
    setIsLoading(true);
    await authService.logout(); // Universal logout
    // State updates will be handled by onAuthStateChanged
    safeStorage.removeItem('host_session');
    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({
    isHost,
    firebaseUser,
    isLoading,
    error,
    loginHost,
    loginHostWithGoogle,
    signupHost,
    logoutHost
  }), [isHost, firebaseUser, isLoading, error, loginHost, loginHostWithGoogle, signupHost, logoutHost]);

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
