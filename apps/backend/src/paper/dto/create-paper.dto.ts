import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreatePaperDto {
  @ApiProperty({
    example: '期中测试卷',
    description: '试卷标题',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 1,
    description: '关联的课程ID',
    required: true,
  })
  @IsInt()
  courseId: number;

  @ApiProperty({
    example: 'word1, word2, word3',
    description: '核心单词 (可选, 逗号分隔)',
    required: false,
  })
  @IsString()
  @IsOptional()
  coreWords?: string;

  @ApiProperty({
    example: 'This is a key sentence.\nThis is another key sentence.',
    description: '重点句型 (可选, 换行分隔)',
    required: false,
  })
  @IsString()
  @IsOptional()
  keySentences?: string;

  @ApiProperty({
    example: '这是一段备注信息',
    description: '备注 (可选)',
    required: false,
  })
  @IsString()
  @IsOptional()
  remark?: string;
}
