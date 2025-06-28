import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';

@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVocabularyDto: CreateVocabularyDto, userId: number) {
    return this.prisma.vocabulary.create({
      data: {
        ...createVocabularyDto,
        userId,
      },
    });
  }

  async findAll(userId: number, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.vocabulary.findMany({
        where: { userId },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.vocabulary.count({ where: { userId } }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number, userId: number) {
    return this.prisma.vocabulary.findFirst({
      where: { id, userId },
    });
  }

  async update(
    id: number,
    updateVocabularyDto: UpdateVocabularyDto,
    userId: number,
  ) {
    // 首先验证单词是否属于该用户
    const existing = await this.findOne(id, userId);
    if (!existing) {
      return null;
    }
    return this.prisma.vocabulary.update({
      where: { id },
      data: updateVocabularyDto,
    });
  }

  async remove(id: number, userId: number) {
    // 首先验证单词是否属于该用户
    const existing = await this.findOne(id, userId);
    if (!existing) {
      return null;
    }
    return this.prisma.vocabulary.delete({
      where: { id },
    });
  }
}
