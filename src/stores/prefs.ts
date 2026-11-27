import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrefsState {
  onboarded: boolean;
  saved: string[]; // tour slugs
  lastUserId: string | null; // who used this phone last, so saved tours never carry over to someone else
  guideView: 'guide' | 'traveller'; // which side of the app an approved guide is looking at
  hydrated: boolean;
  setOnboarded: () => void;
  toggleSaved: (slug: string) => boolean;
  setGuideView: (v: 'guide' | 'traveller') => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      saved: [],
      lastUserId: null,
      guideView: 'guide',
      hydrated: false,
      setOnboarded: () => set({ onboarded: true }),
      setGuideView: (guideView) => set({ guideView }),
      toggleSaved: (slug) => {
        const has = get().saved.includes(slug);
        set({ saved: has ? get().saved.filter((s) => s !== slug) : [...get().saved, slug] });
        return !has;
      },
    }),
    {
      name: 'gidi.prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ onboarded: s.onboarded, saved: s.saved, lastUserId: s.lastUserId, guideView: s.guideView }),
      onRehydrateStorage: () => () => usePrefs.setState({ hydrated: true }),
    }
  )
);
