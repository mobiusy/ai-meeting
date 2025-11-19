import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Mock PrismaService
const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  meetingRoom: {
    findUnique: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // 清除所有mock的调用记录
    jest.clearAllMocks();
  });

  describe('创建用户', () => {
    it('应该成功创建新用户', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: '测试用户',
        password: 'Test123456',
        role: Role.EMPLOYEE,
      };

      const mockCreatedUser = {
        id: 'test-user-id',
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBe(createUserDto.name);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      
      // 验证密码被正确加密
      const createCall = mockPrismaService.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe(createUserDto.password);
      expect(createCall.data.password).toMatch(/^\$2[aby]\$/); // bcrypt哈希格式
    });

    it('应该成功创建用户并关联部门', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: '测试用户',
        password: 'Test123456',
        role: Role.EMPLOYEE,
        departmentId: 'test-department-id',
      };

      const mockCreatedUser = {
        id: 'test-user-id',
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        departmentId: createUserDto.departmentId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.departmentId).toBe(createUserDto.departmentId);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('查找用户', () => {
    it('应该通过ID查找用户', async () => {
      const userId = 'test-user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: '测试用户',
        role: Role.EMPLOYEE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          departmentId: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });

    it('应该通过邮箱查找用户', async () => {
      const email = 'test@example.com';
      const mockUser = {
        id: 'test-user-id',
        email,
        name: '测试用户',
        password: 'hashed-password',
        role: Role.EMPLOYEE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.password).toBeDefined(); // findByEmail应该返回密码用于验证
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email }
      });
    });
  });

  describe('获取用户列表', () => {
    it('应该返回用户列表', async () => {
      const mockUsers = [
        {
          id: 'user1',
          email: 'user1@example.com',
          name: '用户1',
          role: Role.EMPLOYEE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          name: '用户2',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('更新用户', () => {
    it('应该成功更新用户信息', async () => {
      const userId = 'test-user-id';
      const updateData = {
        name: '更新后的用户名',
        role: Role.ADMIN,
      };

      const mockUpdatedUser = {
        id: userId,
        email: 'test@example.com',
        name: updateData.name,
        role: updateData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(userId, updateData);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateData.name);
      expect(result.role).toBe(updateData.role);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          departmentId: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });
  });

  describe('删除用户', () => {
    it('应该成功删除用户', async () => {
      const userId = 'test-user-id';
      const mockDeletedUser = {
        id: userId,
        email: 'test@example.com',
        name: '测试用户',
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await service.remove(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          departmentId: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });
  });
});