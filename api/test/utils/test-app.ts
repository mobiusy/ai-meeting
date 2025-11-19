import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

export class TestApp {
  private static app: INestApplication;
  private static prisma: PrismaService;

  static async createApp(): Promise<{ app: INestApplication; prisma: PrismaService }> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    this.prisma = moduleFixture.get<PrismaService>(PrismaService);

    await this.app.init();

    return { app: this.app, prisma: this.prisma };
  }

  static async cleanDatabase() {
    if (this.prisma) {
      // 清理所有测试数据，保持引用完整性
      await this.prisma.$executeRaw`DELETE FROM "meetings"`;
      await this.prisma.$executeRaw`DELETE FROM "meeting_rooms"`;
      await this.prisma.$executeRaw`DELETE FROM "users"`;
    }
  }

  static async closeApp() {
    if (this.app) {
      await this.app.close();
    }
  }

  static getApp(): INestApplication {
    return this.app;
  }

  static getPrisma(): PrismaService {
    return this.prisma;
  }
}