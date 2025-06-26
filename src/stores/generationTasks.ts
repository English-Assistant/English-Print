import { create } from 'zustand';
import { usePaperStore, useVocabularyStore } from '@/stores';
import { runDifyWorkflow } from '@/apis/generation';
import { validateGeneratedPaperData } from '@/utils/schemaValidators';
import type { Paper } from '@/data/types/paper';
import type { GeneratedPaperData } from '@/data/types/generation';
import dayjs from 'dayjs';

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

export const useGenerationTaskStore = create<GenerationTaskStore>()(
  (set, get) => ({
    tasks: [],
    getTaskByPaperId: (paperId) => {
      return get().tasks.find((t) => t.paperId === paperId);
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
      const taskId = paper.id + '-' + Date.now();
      set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: taskId,
            paperId: paper.id,
            paperTitle: paper.title,
            courseId: paper.courseId,
            status: 'processing',
            startTime: Date.now(),
          },
        ],
      }));

      try {
        // 准备数据
        const allPapers = usePaperStore.getState().papers;
        const globalWords = useVocabularyStore.getState().words;

        // 重点：从所有其他试卷中收集单词，排除当前试卷
        const otherPaperWords = allPapers
          .filter((p) => p.id !== paper.id) // <-- 这是关键的改动
          .flatMap((p) => p.coreWords?.split(/[,\\s]+/) || [])
          .filter(Boolean);

        const uniqueWords = [...new Set([...otherPaperWords, ...globalWords])];

        const unit = `单元标题:
${paper.title}

- **核心单词**:
${paper.coreWords}

- **本节小故事**:
${paper.keySentences}`;

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
          listeningJson: result.listeningMaterial, // <-- 这里是修改的地方
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
);
