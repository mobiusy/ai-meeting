import { User, Role } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: Role;
  departmentId?: string;
  avatar?: string;
}

export class MockFactory {
  static createUser(overrides?: Partial<CreateUserData>): CreateUserData {
    return {
      email: 'test@example.com',
      name: '测试用户',
      password: 'Test123456',
      role: 'EMPLOYEE',
      ...overrides
    };
  }

  static createAdminUser(overrides?: Partial<CreateUserData>): CreateUserData {
    return {
      ...this.createUser(),
      email: 'admin@example.com',
      name: '管理员',
      role: 'ADMIN',
      ...overrides
    };
  }

  static createMeetingRoom(overrides?: any) {
    return {
      name: '测试会议室',
      code: 'TEST001',
      capacity: 10,
      location: '测试大楼1层',
      floor: '1F',
      status: 'AVAILABLE',
      equipment: [
        { name: '投影仪', type: 'PROJECTOR' },
        { name: '白板', type: 'WHITEBOARD' }
      ],
      description: '这是一个测试会议室',
      ...overrides
    };
  }

  static createMeeting(overrides?: any) {
    return {
      title: '测试会议',
      description: '这是一个测试会议',
      startTime: new Date(Date.now() + 3600000), // 1小时后
      endTime: new Date(Date.now() + 7200000),   // 2小时后
      status: 'SCHEDULED',
      roomId: 'test-room-id',
      organizerId: 'test-user-id',
      ...overrides
    };
  }

  static createAuthToken() {
    return {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJyb2xlIjoiRU1QTE9ZRUUiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0.test',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '测试用户',
        role: 'EMPLOYEE'
      }
    };
  }
}