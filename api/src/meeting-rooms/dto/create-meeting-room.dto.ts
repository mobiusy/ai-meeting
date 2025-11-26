import { IsString, IsInt, IsOptional, IsBoolean, Min, Max, IsArray, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ImageDto {
  @ApiProperty({ description: '图片URL', example: 'http://localhost:9000/meeting-system/images/xxx.jpg' })
  @IsUrl({ require_tld: false })
  url: string;

  @ApiProperty({ description: '图片名称', example: '城市实景.jpg' })
  @IsString()
  name: string;

  @ApiProperty({ description: '图片大小（字节）', example: 2550113 })
  @IsInt()
  size: number;

  @ApiProperty({ description: '图片类型', example: 'image/jpeg', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateMeetingRoomDto {
  @ApiProperty({ description: '会议室名称', example: '大会议室A' })
  @IsString()
  name: string;

  @ApiProperty({ description: '会议室编号', example: 'MR-001' })
  @IsString()
  code: string;

  @ApiProperty({ description: '容量', example: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  capacity: number;

  @ApiProperty({ description: '位置', example: '东区3楼' })
  @IsString()
  location: string;

  @ApiProperty({ description: '楼层', example: '3楼', required: false })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ description: '描述', example: '配备投影仪和音响设备', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '设备列表',
    example: [{ name: '投影仪', type: 'display', available: true }],
    required: false
  })
  @IsOptional()
  equipment?: any[];

  @ApiProperty({ description: '状态', example: 'AVAILABLE', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: '预订规则', example: { minAdvance: 1, maxAdvance: 30 }, required: false })
  @IsOptional()
  bookingRules?: any;

  @ApiProperty({ description: '最小预订时长（分钟）', example: 30, required: false })
  @IsOptional()
  @IsInt()
  @Min(15)
  minDuration?: number;

  @ApiProperty({ description: '最大预订时长（分钟）', example: 480, required: false })
  @IsOptional()
  @IsInt()
  @Max(1440)
  maxDuration?: number;

  @ApiProperty({ description: '是否需要审批', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  needApproval?: boolean;

  @ApiProperty({
    description: '图片列表',
    required: false,
    type: [ImageDto],
    example: [
      {
        url: 'http://localhost:9000/meeting-system/images/1764137253624-vgsw9f4vd7.jpg',
        name: '城市实景.jpg',
        size: 2550113,
        type: 'image/jpeg'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  images?: ImageDto[];
}
