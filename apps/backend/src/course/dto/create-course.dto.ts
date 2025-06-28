import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    example: '新视野大学英语 1',
    description: '课程名称',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
    description: '课程封面图片的URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  cover?: string;
}
