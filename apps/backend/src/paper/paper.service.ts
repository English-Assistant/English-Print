import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { GenerationTask, Paper, Prisma } from '../../generated/prisma';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PaperService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('generation') private readonly generationQueue: Queue,
  ) {}

  async create(userId: number, createPaperDto: CreatePaperDto): Promise<Paper> {
    const { courseId, ...restData } = createPaperDto;

    // 验证课程是否存在且属于该用户
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, userId },
    });
    if (!course) {
      throw new ForbiddenException('指定的课程不存在或无权访问');
    }

    const data: any = {
      ...restData,
      user: { connect: { id: userId } },
      course: { connect: { id: courseId } },
    };

    return this.prisma.paper.create({ data });
  }

  async createGenerationTask(
    userId: number,
    paperId: number,
  ): Promise<GenerationTask> {
    // 首先，验证试卷是否存在且属于该用户
    const paper = await this.findOneOrFail(userId, paperId);

    const task = await this.prisma.generationTask.create({
      data: {
        paperId: paper.id,
        userId: userId,
        status: 'PENDING',
      },
    });

    // 将数据库任务ID加入队列
    await this.generationQueue.add(
      'generate-paper-content',
      { taskId: task.id }, // 传递数据库任务ID
      { jobId: task.id.toString() }, // 使用数据库ID作为jobId，方便跟踪
    );

    return task;
  }

  async findAll(userId: number, courseId?: number): Promise<Paper[]> {
    return this.prisma.paper.findMany({
      where: {
        userId,
        courseId,
      },
    });
  }

  async findOne(userId: number, id: number): Promise<Paper | null> {
    const paper = await this.prisma.paper.findUnique({
      where: { id },
    });
    if (!paper || paper.userId !== userId) {
      return null;
    }
    return paper;
  }

  async update(
    userId: number,
    id: number,
    updatePaperDto: UpdatePaperDto,
  ): Promise<Paper> {
    await this.findOneOrFail(userId, id);

    // 如果要更新 courseId, 需要额外验证课程的权限
    if (updatePaperDto.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: updatePaperDto.courseId, userId },
      });
      if (!course) {
        throw new ForbiddenException('要关联的目标课程不存在或无权访问');
      }
    }

    return this.prisma.paper.update({
      where: { id },
      data: updatePaperDto,
    });
  }

  async remove(userId: number, id: number): Promise<Paper> {
    await this.findOneOrFail(userId, id);
    return this.prisma.paper.delete({
      where: { id },
    });
  }

  private async findOneOrFail(userId: number, id: number): Promise<Paper> {
    const paper = await this.findOne(userId, id);
    if (!paper) {
      throw new NotFoundException('试卷未找到或无权访问');
    }
    return paper;
  }
}
