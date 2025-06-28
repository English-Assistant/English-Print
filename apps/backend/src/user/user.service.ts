import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma';
import { UpdateDifyConfigDto } from './dto/update-dify-config.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async create(
    data: Omit<
      User,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'courses'
      | 'papers'
      | 'vocabularies'
      | 'difyApiUrl'
      | 'difyApiToken'
    >,
  ): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateDifyConfig(
    userId: number,
    data: UpdateDifyConfigDto,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
