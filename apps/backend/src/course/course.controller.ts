import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthUser, IAuthUser } from '../auth/decorators/user.decorator';

@ApiTags('课程模块')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: '创建新课程' })
  @ApiResponse({
    status: 201,
    description: '课程创建成功',
  })
  create(
    @AuthUser() user: IAuthUser,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.courseService.create(user.id, createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: '获取当前用户的所有课程' })
  @ApiResponse({ status: 200, description: '返回所有课程列表' })
  findAll(@AuthUser() user: IAuthUser) {
    return this.courseService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取特定课程' })
  @ApiResponse({ status: 200, description: '返回指定课程' })
  @ApiResponse({ status: 404, description: '课程未找到' })
  async findOne(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const course = await this.courseService.findOne(user.id, id);
    if (!course) {
      throw new NotFoundException('课程未找到');
    }
    return course;
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新课程信息' })
  @ApiResponse({
    status: 200,
    description: '课程更新成功',
  })
  @ApiResponse({ status: 404, description: '课程未找到' })
  update(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(user.id, id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除课程' })
  @ApiResponse({
    status: 200,
    description: '课程删除成功',
  })
  @ApiResponse({ status: 404, description: '课程未找到' })
  remove(@AuthUser() user: IAuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(user.id, id);
  }
}
