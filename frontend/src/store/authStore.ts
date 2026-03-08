import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,

      setAuth: (token, user) => {
        set({ token, user });
        localStorage.setItem('Zawjia_token', token);
        // Set cookie so Next.js middleware can check auth on the server side
        document.cookie = `Zawjia_token=${token}; path=/; SameSite=Lax`;
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      logout: () => {
        localStorage.removeItem('Zawjia_token');
        localStorage.removeItem('Zawjia_user');
        // Clear the middleware cookie
        document.cookie = 'Zawjia_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        set({ token: null, user: null });
      },

      isAuthenticated: () => Boolean(get().token && get().user),
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'Zawjia_auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
