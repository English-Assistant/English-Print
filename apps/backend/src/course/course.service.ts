import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from '../../generated/prisma';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        userId,
      },
    });
  }

  async findAll(userId: number): Promise<Course[]> {
    return this.prisma.course.findMany({
      where: { userId },
    });
  }

  async findOne(userId: number, id: number): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!course || course.userId !== userId) {
      return null;
    }
    return course;
  }

  async update(
    userId: number,
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.findOne(userId, id);
    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }
    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(userId: number, id: number): Promise<Course> {
    const course = await this.findOne(userId, id);
    if (!course) {
      throw new ForbiddenException('Course not found or access denied');
    }
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
