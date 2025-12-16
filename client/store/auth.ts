import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },
  
  setHydrated: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      set({ 
        token, 
        isAuthenticated: !!token,
        hydrated: true 
      });
    }
  },
}));