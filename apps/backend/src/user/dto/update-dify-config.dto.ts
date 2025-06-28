import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateDifyConfigDto {
  @ApiProperty({
    example: 'https://api.dify.ai/v1',
    description: 'Dify API 的 URL',
    required: false,
  })
  @IsUrl({}, { message: '请输入有效的 URL 格式' })
  @IsOptional()
  difyApiUrl?: string;

  @ApiProperty({
    example: 'app-xxxxxxxxxxxxxxxxx',
    description: 'Dify API 的密钥',
    required: false,
  })
  @IsString()
  @IsOptional()
  difyApiToken?: string;
}
