import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { GenerationModule } from '../generation/generation.module';

@Module({
  imports: [
    PrismaModule,
    // 注册名为 'generation' 的队列
    BullModule.registerQueue({
      name: 'generation',
    }),
    // 导入 GenerationModule 以便使用 DifyApiService
    GenerationModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
