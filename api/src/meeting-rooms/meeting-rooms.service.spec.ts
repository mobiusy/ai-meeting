import { Test, TestingModule } from '@nestjs/testing';
import { MeetingRoomsService } from './meeting-rooms.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RoomStatus } from '@prisma/client';
import { MockFactory } from '../../test/utils/mock-factory';

describe('MeetingRoomsService', () => {
  let service: MeetingRoomsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    meetingRoom: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    meeting: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingRoomsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MeetingRoomsService>(MeetingRoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('创建会议室', () => {
    it('应该成功创建会议室', async () => {
      const createDto = {
        name: '会议室A',
        code: 'ROOM-A',
        capacity: 20,
        location: '3楼东侧',
        floor: '3楼',
        description: '配备投影仪和音响设备',
        equipment: ['projector', 'speaker'],
        status: RoomStatus.AVAILABLE,
        bookingRules: { maxDuration: 120, advanceBooking: 24 },
      };

      const mockCreatedRoom = {
        id: 'room-1',
        ...createDto,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.meetingRoom.findFirst.mockResolvedValue(null);
      mockPrismaService.meetingRoom.create.mockResolvedValue(mockCreatedRoom);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.capacity).toBe(createDto.capacity);
      expect(mockPrismaService.meetingRoom.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: createDto.name },
            { code: createDto.code }
          ]
        }
      });
      expect(mockPrismaService.meetingRoom.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          equipment: createDto.equipment,
          images: [],
          bookingRules: createDto.bookingRules,
          status: createDto.status,
        }
      });
    });

    it('应该抛出冲突异常当会议室名称或编号已存在', async () => {
      const createDto = {
        name: '会议室A',
        code: 'ROOM-A',
        capacity: 20,
        location: '3楼东侧',
      };

      mockPrismaService.meetingRoom.findFirst.mockResolvedValue({
        id: 'existing-room',
        name: createDto.name,
        code: createDto.code,
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('会议室名称或编号已存在');
    });
  });

  describe('查询会议室列表', () => {
    it('应该返回会议室列表', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
      };

      const mockRooms = [
        {
          id: 'room-1',
          name: '会议室A',
          code: 'ROOM-A',
          capacity: 20,
          location: '3楼东侧',
          status: RoomStatus.AVAILABLE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'room-2',
          name: '会议室B',
          code: 'ROOM-B',
          capacity: 30,
          location: '3楼西侧',
          status: RoomStatus.OCCUPIED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.meetingRoom.findMany.mockResolvedValue(mockRooms);
      mockPrismaService.meetingRoom.count.mockResolvedValue(2);

      const result = await service.findAll(queryDto);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(mockPrismaService.meetingRoom.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      expect(mockPrismaService.meetingRoom.count).toHaveBeenCalledWith({ where: {} });
    });

    it('应该根据条件筛选会议室', async () => {
      const queryDto = {
        keyword: '会议室A',
        status: RoomStatus.AVAILABLE,
        minCapacity: 15,
        maxCapacity: 25,
        location: '3楼',
        floor: '3楼',
        page: 1,
        limit: 10,
      };

      const mockRooms = [
        {
          id: 'room-1',
          name: '会议室A',
          code: 'ROOM-A',
          capacity: 20,
          location: '3楼东侧',
          floor: '3楼',
          status: RoomStatus.AVAILABLE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.meetingRoom.findMany.mockResolvedValue(mockRooms);
      mockPrismaService.meetingRoom.count.mockResolvedValue(1);

      const result = await service.findAll(queryDto);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrismaService.meetingRoom.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: queryDto.keyword, mode: 'insensitive' } },
            { location: { contains: queryDto.keyword, mode: 'insensitive' } },
            { description: { contains: queryDto.keyword, mode: 'insensitive' } }
          ],
          status: queryDto.status,
          capacity: { gte: queryDto.minCapacity, lte: queryDto.maxCapacity },
          location: { contains: queryDto.location, mode: 'insensitive' },
          floor: { contains: queryDto.floor, mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('查询单个会议室', () => {
    it('应该返回会议室详情', async () => {
      const roomId = 'room-1';
      const mockRoom = {
        id: roomId,
        name: '会议室A',
        code: 'ROOM-A',
        capacity: 20,
        location: '3楼东侧',
        status: RoomStatus.AVAILABLE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(mockRoom);

      const result = await service.findOne(roomId);

      expect(result).toBeDefined();
      expect(result.id).toBe(roomId);
      expect(result.name).toBe('会议室A');
      expect(mockPrismaService.meetingRoom.findUnique).toHaveBeenCalledWith({
        where: { id: roomId }
      });
    });

    it('应该抛出未找到异常当会议室不存在', async () => {
      const roomId = 'non-existent-room';

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(null);

      await expect(service.findOne(roomId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(roomId)).rejects.toThrow('会议室不存在');
    });
  });

  describe('更新会议室', () => {
    it('应该成功更新会议室', async () => {
      const roomId = 'room-1';
      const updateDto = {
        name: '更新后的会议室A',
        capacity: 25,
        status: RoomStatus.OCCUPIED,
      };

      const mockExistingRoom = {
        id: roomId,
        name: '会议室A',
        code: 'ROOM-A',
        capacity: 20,
        status: RoomStatus.AVAILABLE,
      };

      const mockUpdatedRoom = {
        ...mockExistingRoom,
        ...updateDto,
        updatedAt: new Date(),
      };

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(mockExistingRoom);
      mockPrismaService.meetingRoom.findFirst.mockResolvedValue(null);
      mockPrismaService.meetingRoom.update.mockResolvedValue(mockUpdatedRoom);

      const result = await service.update(roomId, updateDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateDto.name);
      expect(result.capacity).toBe(updateDto.capacity);
      expect(mockPrismaService.meetingRoom.findUnique).toHaveBeenCalledWith({
        where: { id: roomId }
      });
      expect(mockPrismaService.meetingRoom.update).toHaveBeenCalledWith({
        where: { id: roomId },
        data: {
          ...updateDto,
          status: updateDto.status,
        }
      });
    });

    it('应该抛出冲突异常当更新名称或编号与其他会议室冲突', async () => {
      const roomId = 'room-1';
      const updateDto = {
        name: '会议室B',
      };

      const mockExistingRoom = {
        id: roomId,
        name: '会议室A',
        code: 'ROOM-A',
      };

      const mockConflictRoom = {
        id: 'room-2',
        name: '会议室B',
        code: 'ROOM-B',
      };

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(mockExistingRoom);
      mockPrismaService.meetingRoom.findFirst.mockResolvedValue(mockConflictRoom);

      await expect(service.update(roomId, updateDto)).rejects.toThrow(ConflictException);
      await expect(service.update(roomId, updateDto)).rejects.toThrow('会议室名称或编号已存在');
    });
  });

  describe('删除会议室', () => {
    it('应该成功删除会议室', async () => {
      const roomId = 'room-1';

      const mockExistingRoom = {
        id: roomId,
        name: '会议室A',
        code: 'ROOM-A',
      };

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(mockExistingRoom);
      mockPrismaService.meeting.count.mockResolvedValue(0);
      mockPrismaService.meetingRoom.delete.mockResolvedValue(mockExistingRoom);

      const result = await service.remove(roomId);

      expect(result).toBeDefined();
      expect(result.id).toBe(roomId);
      expect(mockPrismaService.meetingRoom.findUnique).toHaveBeenCalledWith({
        where: { id: roomId }
      });
      expect(mockPrismaService.meeting.count).toHaveBeenCalledWith({
        where: { roomId: roomId }
      });
      expect(mockPrismaService.meetingRoom.delete).toHaveBeenCalledWith({
        where: { id: roomId }
      });
    });

    it('应该抛出冲突异常当会议室有关联会议', async () => {
      const roomId = 'room-1';

      const mockExistingRoom = {
        id: roomId,
        name: '会议室A',
        code: 'ROOM-A',
      };

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(mockExistingRoom);
      mockPrismaService.meeting.count.mockResolvedValue(2);

      await expect(service.remove(roomId)).rejects.toThrow(ConflictException);
      await expect(service.remove(roomId)).rejects.toThrow('该会议室已被使用，无法删除');
    });
  });

  describe('更新会议室状态', () => {
    it('应该成功更新会议室状态', async () => {
      const roomId = 'room-1';
      const newStatus = RoomStatus.MAINTENANCE;

      const mockExistingRoom = {
        id: roomId,
        name: '会议室A',
        code: 'ROOM-A',
        status: RoomStatus.AVAILABLE,
      };

      const mockUpdatedRoom = {
        ...mockExistingRoom,
        status: newStatus,
        updatedAt: new Date(),
      };

      mockPrismaService.meetingRoom.findUnique.mockResolvedValue(mockExistingRoom);
      mockPrismaService.meetingRoom.update.mockResolvedValue(mockUpdatedRoom);

      const result = await service.updateStatus(roomId, newStatus);

      expect(result).toBeDefined();
      expect(result.status).toBe(newStatus);
      expect(mockPrismaService.meetingRoom.findUnique).toHaveBeenCalledWith({
        where: { id: roomId }
      });
      expect(mockPrismaService.meetingRoom.update).toHaveBeenCalledWith({
        where: { id: roomId },
        data: { status: newStatus }
      });
    });
  });

  describe('获取可用会议室', () => {
    it('应该返回指定时间范围内可用的会议室', async () => {
      const startTime = new Date('2024-01-01T09:00:00Z');
      const endTime = new Date('2024-01-01T10:00:00Z');
      const capacity = 20;

      const mockBusyMeetings = [
        { roomId: 'room-1' },
        { roomId: 'room-3' },
      ];

      const mockAvailableRooms = [
        {
          id: 'room-2',
          name: '会议室B',
          code: 'ROOM-B',
          capacity: 25,
          location: '3楼西侧',
          status: RoomStatus.AVAILABLE,
        },
        {
          id: 'room-4',
          name: '会议室D',
          code: 'ROOM-D',
          capacity: 30,
          location: '4楼东侧',
          status: RoomStatus.AVAILABLE,
        },
      ];

      mockPrismaService.meeting.findMany.mockResolvedValue(mockBusyMeetings);
      mockPrismaService.meetingRoom.findMany.mockResolvedValue(mockAvailableRooms);

      const result = await service.getAvailableRooms(startTime, endTime, capacity);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].capacity).toBeGreaterThanOrEqual(capacity);
      expect(mockPrismaService.meeting.findMany).toHaveBeenCalledWith({
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
      expect(mockPrismaService.meetingRoom.findMany).toHaveBeenCalledWith({
        where: {
          status: 'AVAILABLE',
          id: { notIn: ['room-1', 'room-3'] },
          capacity: { gte: capacity },
        },
        orderBy: { capacity: 'asc' }
      });
    });

    it('应该返回所有可用会议室当未指定容量要求', async () => {
      const startTime = new Date('2024-01-01T09:00:00Z');
      const endTime = new Date('2024-01-01T10:00:00Z');

      mockPrismaService.meeting.findMany.mockResolvedValue([]);
      mockPrismaService.meetingRoom.findMany.mockResolvedValue([]);

      await service.getAvailableRooms(startTime, endTime);

      expect(mockPrismaService.meetingRoom.findMany).toHaveBeenCalledWith({
        where: {
          status: 'AVAILABLE',
          id: { notIn: [] },
        },
        orderBy: { capacity: 'asc' }
      });
    });
  });
});