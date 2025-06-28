import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/user.decorator';
import { User } from '../../generated/prisma';

@ApiTags('单词管理 (Vocabulary)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @ApiOperation({ summary: '新增单词' })
  create(
    @Body() createVocabularyDto: CreateVocabularyDto,
    @AuthUser() user: User,
  ) {
    return this.vocabularyService.create(createVocabularyDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取单词列表（分页）' })
  findAll(
    @AuthUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true }))
    pageSize: number = 10,
  ) {
    return this.vocabularyService.findAll(user.id, page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个单词详情' })
  @ApiResponse({ status: 404, description: '单词不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number, @AuthUser() user: User) {
    const vocabulary = await this.vocabularyService.findOne(id, user.id);
    if (!vocabulary) {
      throw new NotFoundException(`单词 #${id} 不存在或不属于您`);
    }
    return vocabulary;
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新单词' })
  @ApiResponse({ status: 404, description: '单词不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
    @AuthUser() user: User,
  ) {
    const updated = await this.vocabularyService.update(
      id,
      updateVocabularyDto,
      user.id,
    );
    if (!updated) {
      throw new NotFoundException(`单词 #${id} 不存在或不属于您`);
    }
    return updated;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除单词' })
  @ApiResponse({ status: 404, description: '单词不存在' })
  async remove(@Param('id', ParseIntPipe) id: number, @AuthUser() user: User) {
    const deleted = await this.vocabularyService.remove(id, user.id);
    if (!deleted) {
      throw new NotFoundException(`单词 #${id} 不存在或不属于您`);
    }
    return {
      message: `单词 #${id} 已成功删除`,
      deletedId: id,
    };
  }
}
