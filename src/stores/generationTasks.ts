import { create } from 'zustand';
import { usePaperStore } from './papers';
import { useVocabularyStore } from './vocabulary';
import { runDifyWorkflow } from '@/apis/generation';
import { validateGeneratedPaperData } from '@/utils/schemaValidators';
import type { Paper } from '@/data/types/paper';
import type { GeneratedPaperData } from '@/data/types/generation';
import dayjs from 'dayjs';
import { createJSONStorage, persist } from 'zustand/middleware';
import dexieStorage from './storage';

type TaskStatus = 'processing' | 'success' | 'error';

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

interface GenerationTaskStore {
  tasks: GenerationTask[];
  startGeneration: (paper: Paper) => Promise<void>;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => Promise<void>;
  clearTask: (paperId: string) => void;
  getTaskByPaperId: (paperId: string) => GenerationTask | undefined;
}

export const useGenerationTaskStore = create(
  persist<GenerationTaskStore>(
    (set, get) => ({
      tasks: [],
      getTaskByPaperId: (paperId) => {
        const tasksForPaper = get().tasks.filter((t) => t.paperId === paperId);
        if (tasksForPaper.length === 0) return undefined;
        // 返回最新的任务
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
      },
      retryTask: async (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const paper = usePaperStore.getState().getPaperById(task.paperId);
        if (!paper) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: 'error', error: '找不到原始试卷' }
                : t,
            ),
          }));
          return;
        }

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));

        await get().startGeneration(paper);
      },
      startGeneration: async (paper) => {
        // 通过getTaskByPaperId获取最新的task
        const latestTask = get().getTaskByPaperId(paper.id);
        // 如果最新的任务正在运行中，则不执行任何操作
        if (latestTask && latestTask.status === 'processing') {
          return;
        }

        const taskId = `${paper.id}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newTask: GenerationTask = {
          id: taskId,
          paperId: paper.id,
          paperTitle: paper.title,
          courseId: paper.courseId,
          status: 'processing',
          startTime: Date.now(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        try {
          const allPapers = usePaperStore.getState().papers;
          const globalWords = useVocabularyStore.getState().words;
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
            updatedAt: dayjs().toISOString(),
          });
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'success',
                    endTime: Date.now(),
                    result,
                  }
                : t,
            ),
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '发生未知错误';
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: 'error',
                    error: errorMessage,
                    endTime: Date.now(),
                  }
                : t,
            ),
          }));
        }
      },
    }),
    {
      name: 'generation-tasks-storage',
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({
        ...state,
        tasks: state.tasks.filter(
          (task) => task.status === 'success' || task.status === 'error',
        ),
      }),
    },
  ),
);
