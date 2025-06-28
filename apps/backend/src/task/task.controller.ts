import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser, IAuthUser } from '../auth/decorators/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GenerationTask, TaskStatus } from '../../generated/prisma';

@ApiTags('任务管理模块')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户的所有任务' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TaskStatus,
    description: '根据任务状态筛选',
  })
  @ApiResponse({ status: 200, description: '返回任务列表' })
  findAll(
    @AuthUser() user: IAuthUser,
    @Query('status') status?: TaskStatus,
  ): Promise<GenerationTask[]> {
    return this.taskService.findAll(user.id, status);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: '重试一个失败的任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '成功创建重试任务' })
  @ApiResponse({ status: 403, description: '只能重试失败的任务' })
  @ApiResponse({ status: 404, description: '原始任务未找到' })
  retry(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GenerationTask> {
    return this.taskService.retry(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '取消一个正在进行中的任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({ status: 200, description: '任务已取消' })
  @ApiResponse({ status: 403, description: '只能取消正在进行中的任务' })
  @ApiResponse({ status: 404, description: '任务未找到' })
  cancel(
    @AuthUser() user: IAuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GenerationTask> {
    return this.taskService.cancel(user.id, id);
  }
}
