import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrefsState {
  onboarded: boolean;
  saved: string[]; // tour slugs
  hydrated: boolean;
  setOnboarded: () => void;
  toggleSaved: (slug: string) => boolean;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      saved: [],
      hydrated: false,
      setOnboarded: () => set({ onboarded: true }),
      toggleSaved: (slug) => {
        const has = get().saved.includes(slug);
        set({ saved: has ? get().saved.filter((s) => s !== slug) : [...get().saved, slug] });
        return !has;
      },
    }),
    {
      name: 'gidi.prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ onboarded: s.onboarded, saved: s.saved }),
      onRehydrateStorage: () => () => usePrefs.setState({ hydrated: true }),
    }
  )
);
