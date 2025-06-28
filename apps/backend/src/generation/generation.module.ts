import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DifyApiService } from './dify-api.service';
import { GenerationProcessor } from './generation.processor';
import { PrismaModule } from '../prisma/prisma.module';

const generationQueue = BullModule.registerQueue({
  name: 'generation',
});

@Module({
  imports: [generationQueue, PrismaModule],
  providers: [DifyApiService, GenerationProcessor],
  exports: [generationQueue, DifyApiService],
})
export class GenerationModule {}
