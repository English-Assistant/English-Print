import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateVocabularyDto {
  @ApiProperty({ description: '单词', example: 'hello' })
  @IsNotEmpty()
  @IsString()
  word: string;

  @ApiProperty({ description: '翻译', example: '你好' })
  @IsNotEmpty()
  @IsString()
  translation: string;

  @ApiProperty({ description: '音标', example: 'həˈləʊ', required: false })
  @IsOptional()
  @IsString()
  phonetic?: string;
}
