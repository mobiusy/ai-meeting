import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock UsersService
const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // 清除所有mock的调用记录
    jest.clearAllMocks();
  });

  describe('用户验证', () => {
    it('应该成功验证正确的邮箱和密码', async () => {
      // 准备测试数据
      const email = 'test@example.com';
      const password = 'Test123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const mockUser = {
        id: 'test-user-id',
        email,
        name: '测试用户',
        password: hashedPassword,
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 设置mock行为
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // 执行测试
      const result = await service.validateUser(email, password);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.password).toBeUndefined(); // 密码不应该返回
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('应该验证失败当邮箱不存在', async () => {
      const email = 'nonexistent@example.com';
      const password = 'Test123456';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('应该验证失败当密码不正确', async () => {
      const email = 'test@example.com';
      const correctPassword = 'Test123456';
      const wrongPassword = 'WrongPassword';
      
      const hashedPassword = await bcrypt.hash(correctPassword, 10);
      const mockUser = {
        id: 'test-user-id',
        email,
        name: '测试用户',
        password: hashedPassword,
        role: 'EMPLOYEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(email, wrongPassword);

      expect(result).toBeNull();
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('用户登录', () => {
    it('应该成功登录并返回JWT token', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '测试用户',
        role: 'EMPLOYEE',
      };

      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockToken);
      expect(result.user).toEqual(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });

  describe('JWT Token生成', () => {
    it('应该生成包含用户信息的JWT token', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '测试用户',
        role: 'EMPLOYEE',
      };

      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toBeDefined();
      expect(result.access_token).toBe(mockToken);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });
  });
});