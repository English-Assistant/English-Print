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
  Query,
} from '@nestjs/common';
import { PaperService } from './paper.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthUser, IAuthUser } from '../auth/decorators/user.decorator';
import { GenerationTask } from '../../generated/prisma';

@ApiTags('试卷模块')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('papers')
export class PaperController {
  constructor(private readonly paperService: PaperService) {}

  @Post(':id/generate')
  @ApiOperation({ summary: '为试卷异步生成内容' })
  @ApiResponse({ status: 202, description: '已接受生成请求，任务已加入队列' })
  @ApiResponse({ status: 404, description: '试卷未找到' })
  async generateContent(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GenerationTask> {
    // 业务逻辑已移至 PaperService
    return this.paperService.createGenerationTask(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: '创建新试卷' })
  @ApiResponse({ status: 201, description: '试卷创建成功' })
  create(@AuthUser() user: IAuthUser, @Body() createPaperDto: CreatePaperDto) {
    return this.paperService.create(user.id, createPaperDto);
  }

  @Get()
  @ApiOperation({ summary: '获取当前用户的所有试卷' })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: '根据课程ID筛选试卷',
  })
  @ApiResponse({ status: 200, description: '返回试卷列表' })
  findAll(@AuthUser() user: IAuthUser, @Query('courseId') courseId?: string) {
    const courseIdNum = courseId ? parseInt(courseId, 10) : undefined;
    return this.paperService.findAll(user.id, courseIdNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取特定试卷' })
  @ApiResponse({ status: 200, description: '返回指定试卷' })
  @ApiResponse({ status: 404, description: '试卷未找到' })
  async findOne(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const paper = await this.paperService.findOne(user.id, id);
    if (!paper) {
      throw new NotFoundException('试卷未找到');
    }
    return paper;
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新试卷信息' })
  @ApiResponse({ status: 200, description: '试卷更新成功' })
  @ApiResponse({ status: 404, description: '试卷未找到' })
  update(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    return this.paperService.update(user.id, id, updatePaperDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除试卷' })
  @ApiResponse({ status: 200, description: '试卷删除成功' })
  @ApiResponse({ status: 404, description: '试卷未找到' })
  remove(@AuthUser() user: IAuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.paperService.remove(user.id, id);
  }
}
