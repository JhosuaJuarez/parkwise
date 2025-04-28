import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { User } from '@/lib/types';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { 
    data: user, 
    isLoading,
    refetch: refetchUser 
  } = useQuery<User | null>({
    queryKey: ['/api/user/current'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    retryOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: () => {
      refetchUser();
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    },
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/current'] });
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      setLocation('/login');
    }
  });
  
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };
  
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}