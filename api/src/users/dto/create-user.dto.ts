import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '张三', description: '用户姓名' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'password123', description: '用户密码', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'ADMIN', description: '用户角色', required: false, enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ example: 'avatar.jpg', description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 'department-id', description: '部门ID', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;
}