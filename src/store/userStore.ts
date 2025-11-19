import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  language: 'ar' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  defaultLeverage: number;
  riskPerTrade: number;
}

interface UserState {
  userId: string;
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  setUserId: (id: string) => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'ar',
  notifications: true,
  soundEnabled: true,
  autoRefresh: true,
  defaultLeverage: 10,
  riskPerTrade: 2,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: 'user-1', // Default mock user
      preferences: DEFAULT_PREFERENCES,
      
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
      
      resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),
      
      setUserId: (id) => set({ userId: id }),
    }),
    {
      name: 'user-storage',
    }
  )
);
