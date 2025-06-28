import { Module } from '@nestjs/common';
import { PaperService } from './paper.service';
import { PaperController } from './paper.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GenerationModule } from '../generation/generation.module';

@Module({
  imports: [PrismaModule, GenerationModule],
  controllers: [PaperController],
  providers: [PaperService],
})
export class PaperModule {}
