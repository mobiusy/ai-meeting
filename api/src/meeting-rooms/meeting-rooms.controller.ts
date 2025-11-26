import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ValidationPipe, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MeetingRoomsService } from './meeting-rooms.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { QueryMeetingRoomDto } from './dto/query-meeting-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('会议室管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meeting-rooms')
export class MeetingRoomsController {
  constructor(private readonly meetingRoomsService: MeetingRoomsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: '创建会议室' })
  @ApiResponse({ status: 201, description: '会议室创建成功' })
  @ApiResponse({ status: 409, description: '会议室名称或编号已存在' })
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomsService.create(createMeetingRoomDto);
  }

  @Get()
  @ApiOperation({ summary: '获取会议室列表' })
  @ApiResponse({ status: 200, description: '获取会议室列表成功' })
  findAll(@Query(ValidationPipe) query: QueryMeetingRoomDto) {
    return this.meetingRoomsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取会议室详情' })
  @ApiResponse({ status: 200, description: '获取会议室详情成功' })
  @ApiResponse({ status: 404, description: '会议室不存在' })
  findOne(@Param('id') id: string) {
    return this.meetingRoomsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: '更新会议室' })
  @ApiResponse({ status: 200, description: '会议室更新成功' })
  @ApiResponse({ status: 404, description: '会议室不存在' })
  @ApiResponse({ status: 409, description: '会议室名称或编号已存在' })
  update(
    @Param('id') id: string,
    @Body() updateMeetingRoomDto: UpdateMeetingRoomDto
  ) {
    return this.meetingRoomsService.update(id, updateMeetingRoomDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除会议室' })
  @ApiResponse({ status: 204, description: '会议室删除成功' })
  @ApiResponse({ status: 404, description: '会议室不存在' })
  @ApiResponse({ status: 409, description: '会议室已被使用，无法删除' })
  async remove(@Param('id') id: string) {
    await this.meetingRoomsService.remove(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: '更新会议室状态' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 404, description: '会议室不存在' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.meetingRoomsService.updateStatus(id, status as any);
  }

  @Get('available/list')
  @ApiOperation({ summary: '获取可用会议室列表' })
  @ApiResponse({ status: 200, description: '获取可用会议室列表成功' })
  getAvailableRooms(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('capacity') capacity?: string
  ) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const cap = capacity ? parseInt(capacity) : undefined;
    
    return this.meetingRoomsService.getAvailableRooms(start, end, cap);
  }
}
