import { create } from "zustand";
import {persist} from 'zustand/middleware'

export interface User {
  _id?: string;
  userName?: string;
  displayName?: string;
  email?: string;
  [key: string]: any;
}

interface AuthState {
  currentUser: User | null;
  setCurrentUser: (user: any) => void;
  removeCurrentUser: () => void;
  updateCurrentUser: (updatedUser: any) => void;
}

export const userAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user: any) => set({ currentUser: user }),
      removeCurrentUser: () => set({ currentUser: null }),
      updateCurrentUser: (updatedUser: any) => set({ currentUser: updatedUser }),
    }),
    {
      name: "user",
    }
  )
);
