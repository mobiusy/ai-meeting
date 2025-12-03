import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '@prisma/client'
import { MeetingsService } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'
import { QueryMeetingsDto } from './dto/query-meetings.dto'

@ApiTags('会议管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}

  @Post()
  @ApiOperation({ summary: '创建会议' })
  create(@Body() dto: CreateMeetingDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId)
  }

  @Get()
  @ApiOperation({ summary: '查询会议列表' })
  findAll(@Query() query: QueryMeetingsDto) {
    return this.service.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: '查询会议详情' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新会议' })
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto, @Request() req: any) {
    return this.service.update(id, dto, req.user.userId)
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消会议' })
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.service.cancel(id, req.user.userId)
  }

  @Get('availability')
  @ApiOperation({ summary: '会议可用会议室查询' })
  availability(@Query('startTime') startTime: string, @Query('endTime') endTime: string, @Query('capacity') capacity?: string) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const cap = capacity ? parseInt(capacity) : undefined
    return this.service.availability(start, end, cap)
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: '审批通过会议' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.service.approve(id, req.user.role, req.user.userId)
  }

  @Post(':id/reject')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: '审批拒绝会议' })
  reject(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    return this.service.reject(id, req.user.role, req.user.userId, reason)
  }
}
