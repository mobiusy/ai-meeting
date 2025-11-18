import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { QueryMeetingRoomDto } from './dto/query-meeting-room.dto';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class MeetingRoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    // 检查会议室名称和编号是否已存在
    const existingRoom = await this.prisma.meetingRoom.findFirst({
      where: {
        OR: [
          { name: createMeetingRoomDto.name },
          { code: createMeetingRoomDto.code }
        ]
      }
    });

    if (existingRoom) {
      throw new ConflictException('会议室名称或编号已存在');
    }

    return this.prisma.meetingRoom.create({
      data: {
        ...createMeetingRoomDto,
        equipment: createMeetingRoomDto.equipment || [],
        images: [],
        bookingRules: createMeetingRoomDto.bookingRules || {},
        status: createMeetingRoomDto.status as RoomStatus || RoomStatus.AVAILABLE,
      }
    });
  }

  async findAll(query: QueryMeetingRoomDto) {
    const { keyword, status, minCapacity, maxCapacity, location, floor, page = 1, limit = 10 } = query;
    
    const where: any = {};

    // 关键词搜索（名称、位置、描述）
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { location: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 容量范围筛选
    if (minCapacity) {
      where.capacity = { gte: minCapacity };
    }
    if (maxCapacity) {
      where.capacity = { ...where.capacity, lte: maxCapacity };
    }

    // 位置筛选
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // 楼层筛选
    if (floor) {
      where.floor = { contains: floor, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.meetingRoom.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.meetingRoom.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string) {
    const room = await this.prisma.meetingRoom.findUnique({
      where: { id }
    });

    if (!room) {
      throw new NotFoundException('会议室不存在');
    }

    return room;
  }

  async update(id: string, updateMeetingRoomDto: UpdateMeetingRoomDto) {
    // 检查会议室是否存在
    const existingRoom = await this.findOne(id);

    // 如果更新名称或编号，检查是否与其他会议室冲突
    if (updateMeetingRoomDto.name || updateMeetingRoomDto.code) {
      const conflictRoom = await this.prisma.meetingRoom.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateMeetingRoomDto.name ? { name: updateMeetingRoomDto.name } : {},
                updateMeetingRoomDto.code ? { code: updateMeetingRoomDto.code } : {}
              ]
            }
          ]
        }
      });

      if (conflictRoom) {
        throw new ConflictException('会议室名称或编号已存在');
      }
    }

    return this.prisma.meetingRoom.update({
      where: { id },
      data: {
        ...updateMeetingRoomDto,
        status: updateMeetingRoomDto.status as RoomStatus || undefined,
      }
    });
  }

  async remove(id: string) {
    // 检查会议室是否存在
    await this.findOne(id);

    // 检查是否有相关联的会议
    const meetingCount = await this.prisma.meeting.count({
      where: { roomId: id }
    });

    if (meetingCount > 0) {
      throw new ConflictException('该会议室已被使用，无法删除');
    }

    return this.prisma.meetingRoom.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: RoomStatus) {
    await this.findOne(id);

    return this.prisma.meetingRoom.update({
      where: { id },
      data: { status }
    });
  }

  async getAvailableRooms(startTime: Date, endTime: Date, capacity?: number) {
    // 获取指定时间范围内可用的会议室
    const busyRooms = await this.prisma.meeting.findMany({
      where: {
        AND: [
          { status: { not: 'CANCELLED' } },
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } }
                ]
              }
            ]
          }
        ]
      },
      select: { roomId: true }
    });

    const busyRoomIds = busyRooms.map(meeting => meeting.roomId);

    const where: any = {
      status: 'AVAILABLE',
      id: { notIn: busyRoomIds }
    };

    if (capacity) {
      where.capacity = { gte: capacity };
    }

    return this.prisma.meetingRoom.findMany({
      where,
      orderBy: { capacity: 'asc' }
    });
  }
}