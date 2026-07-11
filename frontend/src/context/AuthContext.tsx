'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAccessToken, getApiErrorMessage } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import type { AuthResponse, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, try to silently exchange the httpOnly refresh cookie
  // for a fresh access token, so a page reload doesn't log the user out.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        const me = await api.get('/auth/me');
        setUser(me.data.user);
        connectSocket(data.accessToken);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
      connectSocket(data.accessToken);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', {
        fullName,
        email,
        password,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      connectSocket(data.accessToken);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setAccessToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
