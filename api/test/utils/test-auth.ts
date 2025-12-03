import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { MockFactory } from './mock-factory';

export class TestAuth {
  private static app: INestApplication;
  private static authToken: string;

  static setApp(app: INestApplication) {
    this.app = app;
  }

  static async login(email = 'test@example.com', password = 'Test123456') {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    this.authToken = response.body.access_token;
    return this.authToken;
  }

  static getAuthHeader() {
    return `Bearer ${this.authToken}`;
  }

  static async register(userData = MockFactory.createUser()) {
    const response = await request(this.app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201);

    const body = response.body;
    if (body && body.data && !body.user) {
      body.user = body.data;
    }
    return body;
  }

  static async createAuthenticatedUser(overrides?: any) {
    const userData = MockFactory.createUser(overrides);
    const registerBody = await this.register(userData);
    const createdUser = registerBody?.data ?? registerBody?.user ?? registerBody;
    const token = await this.login(userData.email, userData.password);

    return {
      user: createdUser,
      token,
      authHeader: this.getAuthHeader()
    };
  }

  static async createAdminUser() {
    const adminData = MockFactory.createAdminUser();
    return this.createAuthenticatedUser(adminData);
  }
}
