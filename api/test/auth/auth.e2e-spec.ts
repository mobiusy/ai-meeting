import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestApp } from '../utils/test-app';
import { TestAuth } from '../utils/test-auth';
import { MockFactory } from '../utils/mock-factory';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
  });

  describe('用户注册 (POST /auth/register)', () => {
    it('应该成功注册新用户', async () => {
      const userData = MockFactory.createUser({
        email: 'newuser@example.com',
        name: '新用户'
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('用户注册成功');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.password).toBeUndefined(); // 密码不应返回
    });

    it('应该失败注册当邮箱已存在', async () => {
      const userData = MockFactory.createUser({
        email: 'existing@example.com'
      });

      // 先注册一个用户
      await TestAuth.register(userData);

      // 尝试用相同的邮箱再次注册
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(500); // 或者其他适当的错误码

      expect(response.body).toBeDefined();
    });

    it('应该失败注册当数据验证失败', async () => {
      const invalidData = {
        email: 'invalid-email', // 无效的邮箱格式
        name: '', // 空名称
        password: '123' // 密码太短
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });

  describe('用户登录 (POST /auth/login)', () => {
    it('应该成功登录已注册用户', async () => {
      const userData = MockFactory.createUser({
        email: 'testuser@example.com',
        password: 'TestPassword123'
      });

      // 先注册用户
      await TestAuth.register(userData);

      // 然后尝试登录
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.access_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.role).toBe('EMPLOYEE');
    });

    it('应该失败登录当邮箱不存在', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123'
        })
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('应该失败登录当密码不正确', async () => {
      const userData = MockFactory.createUser({
        email: 'testuser@example.com',
        password: 'CorrectPassword123'
      });

      // 先注册用户
      await TestAuth.register(userData);

      // 然后尝试用错误的密码登录
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('应该失败登录当请求数据不完整', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com'
          // 缺少密码字段
        })
        .expect(401);

      expect(response.body).toBeDefined();
    });
  });

  describe('JWT Token验证', () => {
    it('应该访问受保护的API当提供有效的JWT token', async () => {
      // 创建已认证的用户
      const { token } = await TestAuth.createAuthenticatedUser();

      // 尝试访问受保护的端点（例如用户列表）
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('应该拒绝访问当JWT token无效', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('应该拒绝访问当没有提供JWT token', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(401);

      expect(response.body).toBeDefined();
    });
  });
});