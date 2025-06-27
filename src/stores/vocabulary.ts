import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dexieStorage from './storage';

export interface VocabularyStore {
  words: string[];
  addWord: (word: string) => void;
  deleteWord: (word: string) => void;
  updateWords: (words: string[]) => void;
}

export const useVocabularyStore = create<VocabularyStore>()(
  persist(
    (set) => ({
      words: [],
      addWord: (word) =>
        set((state) => ({
          words: [...new Set([...state.words, word])],
        })),
      deleteWord: (word) =>
        set((state) => ({
          words: state.words.filter((w) => w !== word),
        })),
      updateWords: (words) =>
        set({
          words: [...new Set(words)],
        }),
    }),
    {
      name: 'vocabulary-storage',
      storage: createJSONStorage(() => dexieStorage),
    },
  ),
);
