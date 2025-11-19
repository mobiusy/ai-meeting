import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestApp } from '../utils/test-app';
import { TestAuth } from '../utils/test-auth';
import { MockFactory } from '../utils/mock-factory';
import { Role } from '@prisma/client';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const { app: testApp } = await TestApp.createApp();
    app = testApp;
    TestAuth.setApp(app);
  });

  afterAll(async () => {
    await TestApp.closeApp();
  });

  beforeEach(async () => {
    await TestApp.cleanDatabase();
    
    // 创建普通用户和管理员用户
    const user = await TestAuth.createAuthenticatedUser();
    authToken = user.token;
    
    const admin = await TestAuth.createAuthenticatedUser({ role: 'ADMIN' });
    adminToken = admin.token;
  });

  describe('获取用户列表 (GET /users)', () => {
    beforeEach(async () => {
      // 创建一些测试用户
      const users = [
        { email: 'user1@example.com', name: '用户1', role: 'EMPLOYEE' },
        { email: 'user2@example.com', name: '用户2', role: 'MANAGER' },
        { email: 'user3@example.com', name: '用户3', role: 'ADMIN' },
      ];

      for (const user of users) {
        await TestAuth.register({
          email: user.email,
          name: user.name,
          password: 'TestPassword123',
          role: user.role as Role,
        });
      }
    });

    it('应该返回所有用户列表', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(4); // 包括之前创建的用户
    });

    it('应该失败当普通用户尝试访问', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toBeDefined();
    });

    it('应该失败当未认证', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(401);

      expect(response.body).toBeDefined();
    });
  });

  describe('获取当前用户信息 (GET /users/profile)', () => {
    it('应该返回当前用户信息', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.role).toBeDefined();
      expect(response.body.data.password).toBeUndefined(); // 密码不应返回
    });

    it('应该失败当未认证', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);

      expect(response.body).toBeDefined();
    });
  });

  describe('获取用户详情 (GET /users/:id)', () => {
    let userId: string;

    beforeEach(async () => {
      // 创建一个测试用户
      const userData = MockFactory.createUser({
        email: 'testuser@example.com',
        name: '测试用户',
      });

      const registerResponse = await TestAuth.register(userData);
      userId = registerResponse.user.id;
    });

    it('应该返回用户详情', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('testuser@example.com');
      expect(response.body.data.name).toBe('测试用户');
      expect(response.body.data.password).toBeUndefined();
    });

    it('应该失败当用户不存在', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toBeDefined();
    });

    it('应该失败当普通用户尝试访问其他用户信息', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toBeDefined();
    });
  });

  describe('更新用户 (PUT /users/:id)', () => {
    let userId: string;

    beforeEach(async () => {
      // 创建一个测试用户
      const userData = MockFactory.createUser({
        email: 'updateuser@example.com',
        name: '待更新用户',
      });

      const registerResponse = await TestAuth.register(userData);
      userId = registerResponse.user.id;
    });

    it('应该成功更新用户信息', async () => {
      const updateData = {
        name: '更新后的用户',
        role: 'MANAGER',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.role).toBe(updateData.role);
    });

    it('应该成功更新用户密码', async () => {
      const updateData = {
        password: 'NewPassword123',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);

      // 验证新密码可以登录
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'updateuser@example.com',
          password: 'NewPassword123',
        })
        .expect(201);

      expect(loginResponse.body.access_token).toBeDefined();
    });

    it('应该失败当普通用户尝试更新其他用户', async () => {
      const updateData = {
        name: '不应该更新的名称',
      };

      const response = await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toBeDefined();
    });

    it('应该失败当用户不存在', async () => {
      const updateData = {
        name: '不存在的用户',
      };

      const response = await request(app.getHttpServer())
        .put('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toBeDefined();
    });
  });

  describe('删除用户 (DELETE /users/:id)', () => {
    let userId: string;

    beforeEach(async () => {
      // 创建一个测试用户
      const userData = MockFactory.createUser({
        email: 'deleteuser@example.com',
        name: '待删除用户',
      });

      const registerResponse = await TestAuth.register(userData);
      userId = registerResponse.user.id;
    });

    it('应该成功删除用户', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);

      // 验证用户已被删除
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('应该失败当普通用户尝试删除其他用户', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toBeDefined();
    });

    it('应该失败当用户不存在', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toBeDefined();
    });
  });

  describe('用户权限和角色测试', () => {
    it('应该允许管理员访问所有用户端点', async () => {
      // 管理员应该能访问用户列表
      const listResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(listResponse.body.success).toBe(true);

      // 管理员应该能创建用户
      const userData = MockFactory.createUser({
        email: 'admincreated@example.com',
        name: '管理员创建的用户',
      });

      const createResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const newUserId = createResponse.body.data.id;

      // 管理员应该能更新用户
      const updateResponse = await request(app.getHttpServer())
        .put(`/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '更新后的名称' })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);

      // 管理员应该能删除用户
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/users/${newUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });

    it('应该限制普通用户访问管理功能', async () => {
      // 普通用户不应该能访问用户列表
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      // 普通用户不应该能访问其他用户信息
      const adminUser = await TestAuth.createAuthenticatedUser({ role: 'ADMIN' });
      await request(app.getHttpServer())
        .get(`/users/${adminUser.user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      // 普通用户不应该能更新其他用户
      await request(app.getHttpServer())
        .put(`/users/${adminUser.user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '不应该的更新' })
        .expect(403);

      // 普通用户不应该能删除其他用户
      await request(app.getHttpServer())
        .delete(`/users/${adminUser.user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('用户数据验证', () => {
    it('应该验证邮箱格式', async () => {
      const invalidEmails = [
        'invalid-email',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        'double@@email.com',
      ];

      for (const email of invalidEmails) {
        const userData = MockFactory.createUser({ email });

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body).toBeDefined();
      }
    });

    it('应该验证密码强度', async () => {
      const weakPasswords = [
        '123', // 太短
        'abc', // 太短
        'password', // 没有数字
        '12345678', // 没有字母
        'PASSWORD', // 没有小写字母
        'password', // 没有大写字母
      ];

      for (const password of weakPasswords) {
        const userData = MockFactory.createUser({ password });

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body).toBeDefined();
      }
    });

    it('应该验证用户角色', async () => {
      const invalidRoles = ['INVALID_ROLE', 'SUPER_ADMIN', 'GUEST'];

      for (const role of invalidRoles) {
        const userData = MockFactory.createUser({ role: role as any });

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body).toBeDefined();
      }
    });
  });
});