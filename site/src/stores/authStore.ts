import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
  isAuth: boolean;
  user: User | null;
  isLoading: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
  setLoading: (loadingState: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuth: false,
  user: null,
  isLoading: true,

  setAuth(user) {
    set({ isAuth: true, user, isLoading: false });
  },

  setLoading(loadingState){
    set({isLoading: loadingState});
  },

  logout() {
    set({ isAuth: false, user: null, isLoading: false });
  },
}));
