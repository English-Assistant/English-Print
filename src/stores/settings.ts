import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dexieStorage from './storage';

interface SettingsState {
  apiUrl: string;
  apiToken: string;
  setSettings: (apiUrl: string, apiToken: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiUrl: '',
      apiToken: '',
      setSettings: (apiUrl, apiToken) => set({ apiUrl, apiToken }),
    }),
    {
      name: 'dify-api-settings', // unique name for the storage
      storage: createJSONStorage(() => dexieStorage),
    },
  ),
);
