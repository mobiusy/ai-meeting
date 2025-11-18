import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMeetingRoomDto {
  @ApiProperty({ description: '搜索关键词（名称、位置、描述）', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: '状态筛选', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: '最小容量', required: false, example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minCapacity?: number;

  @ApiProperty({ description: '最大容量', required: false, example: 50 })
  @IsOptional()
  @IsInt()
  @Max(200)
  maxCapacity?: number;

  @ApiProperty({ description: '位置筛选', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '楼层筛选', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页条数', required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}