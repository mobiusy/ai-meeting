import { IsOptional, IsString, IsInt } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class QueryMeetingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keyword?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  roomId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  creatorId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startFrom?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTo?: string

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10
}
