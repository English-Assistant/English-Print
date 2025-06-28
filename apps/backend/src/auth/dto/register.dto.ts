import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'testuser',
    description: '用户名',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'password123',
    description: '用户密码 (至少6位)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
