import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserInfo {
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserInfo | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: UserInfo | null) => void;
  updateUser: (patch: Partial<UserInfo>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      updateUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        })),
      logout: () => set({ accessToken: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);