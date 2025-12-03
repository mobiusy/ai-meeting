import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateMeetingDto {
  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty()
  @IsDateString()
  startTime: string

  @ApiProperty()
  @IsDateString()
  endTime: string

  @ApiProperty()
  @IsString()
  roomId: string

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  participants?: string[]
}
