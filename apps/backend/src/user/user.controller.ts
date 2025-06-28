import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateDifyConfigDto } from './dto/update-dify-config.dto';
import { AuthUser, IAuthUser } from '../auth/decorators/user.decorator';

@ApiTags('用户模块')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前登录用户的信息' })
  @ApiResponse({ status: 200, description: '返回当前用户信息' })
  getProfile(@AuthUser() user: IAuthUser) {
    return user;
  }

  @Patch('me/dify-config')
  @ApiOperation({ summary: '更新当前用户的 Dify 配置' })
  @ApiResponse({ status: 200, description: 'Dify 配置更新成功' })
  updateDifyConfig(
    @AuthUser() user: IAuthUser,
    @Body() updateDifyConfigDto: UpdateDifyConfigDto,
  ) {
    return this.userService.updateDifyConfig(user.id, updateDifyConfigDto);
  }
}
