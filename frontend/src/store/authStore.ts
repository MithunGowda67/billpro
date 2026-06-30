import { create } from 'zustand';

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'BILLING_STAFF';
  companyId: number;
  companyName: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const u = localStorage.getItem('billing_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })(),
  token: localStorage.getItem('billing_token'),
  isAuthenticated: !!localStorage.getItem('billing_token'),

  login: (token, user) => {
    localStorage.setItem('billing_token', token);
    localStorage.setItem('billing_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('billing_token');
    localStorage.removeItem('billing_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
