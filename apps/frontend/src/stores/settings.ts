import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dexieStorage from './storage';

export interface SettingsState {
  apiUrl: string;
  apiToken: string;
  maxConcurrentTasks: number | null;
  setSettings: (
    apiUrl: string,
    apiToken: string,
    maxConcurrentTasks: number | null,
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiUrl: '',
      apiToken: '',
      maxConcurrentTasks: null,
      setSettings: (apiUrl, apiToken, maxConcurrentTasks) =>
        set({ apiUrl, apiToken, maxConcurrentTasks }),
    }),
    {
      name: 'dify-api-settings', // unique name for the storage
      storage: createJSONStorage(() => dexieStorage),
    },
  ),
);
