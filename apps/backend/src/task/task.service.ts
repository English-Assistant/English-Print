import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TaskStatus } from '../../generated/prisma';
import type { GenerationTask } from '../../generated/prisma';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('generation') private readonly generationQueue: Queue,
  ) {}

  /**
   * 获取用户的所有任务
   * @param userId 用户ID
   * @param status 任务状态 (可选)
   */
  async findAll(
    userId: number,
    status?: TaskStatus,
  ): Promise<GenerationTask[]> {
    return await this.prisma.generationTask.findMany({
      where: {
        userId,
        status,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 重试一个失败的任务
   * @param userId 用户ID
   * @param taskId 任务ID
   */
  async retry(userId: number, taskId: number): Promise<GenerationTask> {
    const originalTask = await this.findTaskOrFail(userId, taskId);

    if (originalTask.status !== 'ERROR') {
      throw new ForbiddenException('只能重试失败的任务');
    }

    // 复用 PaperService 中的任务创建和入队逻辑
    const newTask = await this.prisma.generationTask.create({
      data: {
        paperId: originalTask.paperId,
        userId: userId,
        status: 'PENDING',
      },
    });

    await this.generationQueue.add(
      'generate-paper-content',
      { taskId: newTask.id },
      { jobId: newTask.id.toString() },
    );

    return newTask;
  }

  /**
   * 取消一个任务
   * @param userId 用户ID
   * @param taskId 任务ID
   */
  async cancel(userId: number, taskId: number): Promise<GenerationTask> {
    const task = await this.findTaskOrFail(userId, taskId);

    if (task.status !== 'PENDING' && task.status !== 'PROCESSING') {
      throw new ForbiddenException('只能取消正在排队或处理中的任务');
    }

    // 无论任务处于何种状态，我们都先更新数据库。
    // 这将作为处理器检查的"取消标志"。
    const updatedTask = await this.prisma.generationTask.update({
      where: { id: taskId },
      data: {
        status: 'CANCELLED',
        error: '任务被用户手动取消',
      },
    });

    const job = await this.generationQueue.getJob(taskId.toString());
    if (job) {
      // 如果作业正在等待处理，我们可以将其从队列中删除
      // 以防止它根本不运行。
      // 如果它处于活动状态，我们在这里做不了什么，但处理器会检查
      // `CANCELLED` 状态。
      if (job.isWaiting() || job.isDelayed()) {
        await job.remove();
      }
    }

    return updatedTask;
  }

  /**
   * 查找任务，如果不存在或不属于该用户则抛出异常
   */
  private async findTaskOrFail(
    userId: number,
    taskId: number,
  ): Promise<GenerationTask> {
    const task = await this.prisma.generationTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('任务不存在或无权访问');
    }

    return task;
  }
}
