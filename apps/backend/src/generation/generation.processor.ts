import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DifyApiService } from './dify-api.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';

export interface IGenerationJobData {
  taskId: number;
}

interface DifyWorkflowOutput {
  output: string;
  [key: string]: any;
}

@Processor('generation')
export class GenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(GenerationProcessor.name);

  constructor(
    private readonly difyApiService: DifyApiService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<IGenerationJobData, any, string>): Promise<any> {
    const { taskId } = job.data;
    this.logger.log(`开始处理任务 #${taskId}, 名称: ${job.name}`);

    // 1. 将任务状态更新为 PROCESSING
    // 同时也获取任务关联的 paper 和 user 信息
    const taskWithRelations = await this.prisma.generationTask.findUnique({
      where: { id: taskId },
      include: { paper: true, user: true },
    });

    if (!taskWithRelations) {
      this.logger.error(`任务 #${taskId} 不存在，跳过处理。`);
      return;
    }

    // 检查点 1: 开始处理前检查是否已被取消
    if (taskWithRelations.status === 'CANCELLED') {
      this.logger.log(`任务 #${taskId} 在开始前已被取消，中止处理。`);
      return;
    }

    await this.prisma.generationTask.update({
      where: { id: taskId },
      data: { status: 'PROCESSING' },
    });

    const { paper, user } = taskWithRelations;

    try {
      if (!user || !paper) {
        throw new Error(`用户或试卷不存在`);
      }
      if (!user.difyApiUrl || !user.difyApiToken) {
        throw new Error(`用户 #${user.id} 未配置 Dify API`);
      }

      // 2. 调用 Dify 工作流
      const story =
        typeof paper.content === 'string'
          ? paper.content
          : JSON.stringify(paper.content);

      const inputs = {
        title: paper.title,
        current_words: paper.coreWords || '',
        story,
        previous_words: '', // TODO: 未来实现获取过往单词的逻辑
      };
      const outputs = (await this.difyApiService.runWorkflow(
        user.difyApiUrl,
        user.difyApiToken,
        inputs,
        `user-${user.id}`,
      )) as DifyWorkflowOutput;

      // 检查点 2: 在更新结果前再次检查任务状态
      const currentTaskStatus = await this.prisma.generationTask.findUnique({
        where: { id: taskId },
        select: { status: true },
      });

      if (currentTaskStatus?.status === 'CANCELLED') {
        this.logger.log(`任务 #${taskId} 在处理期间被取消，丢弃结果。`);
        return;
      }

      // 3. 将最终结果存入数据库
      let contentToStore: Prisma.InputJsonValue;
      try {
        contentToStore = JSON.parse(outputs.output) as Prisma.InputJsonValue;
      } catch {
        this.logger.warn(
          `任务 #${taskId} 的 Dify 输出不是有效的 JSON，将作为原始文本存储。`,
        );
        contentToStore = { raw: outputs.output };
      }

      await this.prisma.paper.update({
        where: { id: paper.id },
        data: { content: contentToStore },
      });

      await this.prisma.generationTask.update({
        where: { id: taskId },
        data: { status: 'SUCCESS', result: contentToStore },
      });

      this.logger.log(`任务 #${taskId} 处理完成`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.logger.error(
        `任务 #${taskId} 处理失败: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      // 在发生错误时更新任务状态
      await this.prisma.generationTask.update({
        where: { id: taskId },
        data: { status: 'ERROR', error: errorMessage },
      });
      throw error; // 让 BullMQ 知道任务失败了
    }
  }
}
