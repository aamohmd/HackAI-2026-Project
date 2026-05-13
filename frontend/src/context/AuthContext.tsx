import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import type { User } from '../api/auth';
import { setAccessToken } from '@/shared/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initial authentication check: try to refresh the token on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { access_token } = await authApi.refresh();
        setAccessToken(access_token);
      } catch (error) {
        // If refresh fails, the user is not logged in
        setAccessToken(null);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  // Derive user data from React Query's 'profile' cache
  const { data: user, isLoading: isQueryLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getMe,
    // Only fetch if we've finished the initial token check
    enabled: !isInitializing,
    // Don't retry on 401s during the initial load
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const login = async (email: string, password: string) => {
    const { access_token } = await authApi.login(email, password);
    setAccessToken(access_token);
    // Invalidate and refetch to ensure we have the latest user data
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
    await queryClient.fetchQuery({ queryKey: ['profile'], queryFn: usersApi.getMe });
  };

  const register = async (email: string, password: string) => {
    await authApi.register(email, password);
    // After registration, log them in
    await login(email, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      // Clear all profile data from cache
      queryClient.setQueryData(['profile'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
    }
  };

  // Auth is loading if we are still checking the initial token
  // OR if we are fetching the profile for the first time
  const isLoading = isInitializing || (isQueryLoading && !user);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
