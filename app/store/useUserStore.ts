import { create } from "zustand";
import { persist } from "zustand/middleware";

const sessionStorageWrapper = {
  getItem: (name: string) => {
    const item = sessionStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: unknown) => {
    sessionStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name);
  },
};

export type UserRole = "ADMIN" | "STAFF" | "INVESTOR";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  accessToken: string;
}

interface UserState {
  user: AuthUser | null;
  loadingUser: boolean;
  isAuthenticated: boolean;
  tokenRefreshed: boolean;

  setUser: (update: AuthUser | ((prev: AuthUser | null) => AuthUser)) => void;
  clearUser: () => void;
  toggleTokenRefreshed: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loadingUser: true,
      isAuthenticated: false,
      tokenRefreshed: false,

      toggleTokenRefreshed: () =>
        set((state) => ({ tokenRefreshed: !state.tokenRefreshed })),

      setUser: (update) =>
        set((state) => ({
          user: typeof update === "function" ? update(state.user) : update,
          loadingUser: false,
          isAuthenticated: true,
        })),

      clearUser: () =>
        set({ user: null, loadingUser: false, isAuthenticated: false }),
    }),
    {
      name: "elf-user-storage",
      storage: sessionStorageWrapper,
      // Only the flag is persisted — the actual token lives in memory only.
      // On a hard reload, isAuthenticated tells your auth initializer to
      // attempt a silent refresh to re-hydrate the user object.
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);