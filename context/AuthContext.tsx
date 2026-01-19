
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { safeStorage } from '../utils/storage';

interface AuthContextType {
  isHost: boolean;
  isLoading: boolean;
  error: string | null;
  loginHost: (password: string) => Promise<boolean>;
  signupHost: (email: string, password: string) => Promise<void>;
  logoutHost: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const session = safeStorage.getItem('host_session');
    if (session === 'active') {
      setIsHost(true);
    }
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

  const logoutHost = useCallback(async () => {
    setIsLoading(true);
    await authService.logoutHost();
    setIsHost(false);
    safeStorage.removeItem('host_session');
    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({
    isHost,
    isLoading,
    error,
    loginHost,
    signupHost,
    logoutHost
  }), [isHost, isLoading, error, loginHost, signupHost, logoutHost]);

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
