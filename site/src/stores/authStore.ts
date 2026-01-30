import { create } from 'zustand';

interface AuthState {
  isAuth: boolean;
  user: { id: string } | null;

  setAuth: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuth: false,
  user: null,

  setAuth(user) {
    set({ isAuth: true, user });
  },

  logout() {
    set({ isAuth: false, user: null });
  },
}));