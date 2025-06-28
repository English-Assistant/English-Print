import { create } from 'zustand';
import { usePaperStore } from './papers';
import { useVocabularyStore } from './vocabulary';
import { runDifyWorkflow } from '@/apis/generation';
import { validateGeneratedPaperData } from '@/utils/schemaValidators';
import type { Paper } from '@/data/types/paper';
import type { GeneratedPaperData } from '@/data/types/generation';
import { createJSONStorage, persist } from 'zustand/middleware';
import dexieStorage from './storage';
import { useSettingsStore } from './settings';

type TaskStatus = 'pending' | 'processing' | 'success' | 'error';

export interface GenerationTask {
  id: string;
  paperId: string;
  paperTitle: string;
  courseId?: string;
  status: TaskStatus;
  startTime: number;
  endTime?: number;
  error?: string;
  result?: GeneratedPaperData;
}

export interface GenerationTaskStore {
  tasks: GenerationTask[];
  startGeneration: (paper: Paper) => Promise<void>;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => Promise<void>;
  clearTask: (paperId: string) => void;
  getTaskByPaperId: (paperId: string) => GenerationTask | undefined;
  processQueue: () => void;
  _runTask: (task: GenerationTask) => Promise<void>;
}

export const useGenerationTaskStore = create<GenerationTaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      processQueue: () => {
        const { tasks, _runTask } = get();
        const { maxConcurrentTasks } = useSettingsStore.getState();
        const limit = maxConcurrentTasks ?? Infinity;

        const processingTasksCount = tasks.filter(
          (t) => t.status === 'processing',
        ).length;

        if (processingTasksCount >= limit) {
          return;
        }

        const pendingTask = tasks.find((t) => t.status === 'pending');
        if (pendingTask) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === pendingTask.id ? { ...t, status: 'processing' } : t,
            ),
          }));
          _runTask(pendingTask);
        }
      },

      _runTask: async (task) => {
        try {
          const allPapers = usePaperStore.getState().papers;
          const globalWords = useVocabularyStore.getState().words;
          const paper = allPapers.find((p) => p.id === task.paperId);
          if (!paper) {
            throw new Error('找不到原始试卷');
          }

          const otherPaperWords = allPapers
            .filter((p) => p.id !== paper.id)
            .flatMap((p) => p.coreWords?.split(/[,\\s]+/) || [])
            .filter(Boolean);
          const uniqueWords = [
            ...new Set([...otherPaperWords, ...globalWords]),
          ];
          const unit = `单元标题:\n${paper.title}\n\n- **核心单词**:\n${paper.coreWords}\n\n- **本节小故事**:\n${paper.keySentences}`;
          const payload = {
            words: uniqueWords.join(','),
            unit,
          };
          const result: GeneratedPaperData = await runDifyWorkflow(payload);
          const validationErrors = validateGeneratedPaperData(result);
          if (validationErrors.length > 0) {
            throw new Error(
              `AI返回的数据校验失败: ${validationErrors.join('; ')}`,
            );
          }
          usePaperStore.getState().updatePaper(paper.id, {
            preclass: result.preClassGuide,
            listeningJson: result.listeningMaterial,
            copyJson: result.copyExercise,
            examJson: result.examPaper,
            answerJson: result.examAnswers,
          });
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: 'success',
                    endTime: Date.now(),
                    result,
                  }
                : t,
            ),
          }));
        } catch (e) {
          const error = e as Error;
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: 'error',
                    error: error.message,
                    endTime: Date.now(),
                  }
                : t,
            ),
          }));
        } finally {
          get().processQueue();
        }
      },

      getTaskByPaperId: (paperId) => {
        const tasksForPaper = get().tasks.filter((t) => t.paperId === paperId);
        if (tasksForPaper.length === 0) return undefined;
        return tasksForPaper.sort((a, b) => b.startTime - a.startTime)[0];
      },

      clearTask: (paperId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.paperId !== paperId),
        }));
      },

      cancelTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'error',
                  error: '用户手动取消',
                  endTime: Date.now(),
                }
              : t,
          ),
        }));
        get().processQueue();
      },

      retryTask: async (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: 'pending', error: undefined } : t,
          ),
        }));

        get().processQueue();
      },

      startGeneration: async (paper) => {
        const latestTask = get().getTaskByPaperId(paper.id);
        if (
          latestTask &&
          (latestTask.status === 'processing' ||
            latestTask.status === 'pending')
        ) {
          return;
        }

        const taskId = `${paper.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newTask: GenerationTask = {
          id: taskId,
          paperId: paper.id,
          paperTitle: paper.title,
          courseId: paper.courseId,
          status: 'pending',
          startTime: Date.now(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        get().processQueue();
      },
    }),
    {
      name: 'generation-tasks-storage',
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        ...state,
        tasks: state.tasks.filter(
          (task) =>
            task.status === 'success' ||
            task.status === 'error' ||
            task.status === 'pending',
        ),
      }),
    },
  ),
);
