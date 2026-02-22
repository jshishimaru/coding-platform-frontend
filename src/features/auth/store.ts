import { create } from 'zustand';
import { API_URL } from '@/config/env';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  rating: number;
  created_at: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* best-effort */ }
    }
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  restoreSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        localStorage.removeItem('token');
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
