import { PrismaClient } from '@prisma/client';

export class TestDatabase {
  private static prisma: PrismaClient;

  static getPrisma(): PrismaClient {
    if (!this.prisma) {
      // 使用测试数据库连接
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_TEST_URL || 'file:./test.db'
          }
        }
      });
    }
    return this.prisma;
  }

  static async cleanDatabase() {
    const prisma = this.getPrisma();
    
    // 按照依赖关系顺序清理数据
    await prisma.$executeRaw`DELETE FROM "meetings"`;
    await prisma.$executeRaw`DELETE FROM "meeting_rooms"`;
    await prisma.$executeRaw`DELETE FROM "users"`;
  }

  static async disconnect() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  static async createTestUser(data: any) {
    const prisma = this.getPrisma();
    return prisma.user.create({ data });
  }

  static async createTestMeetingRoom(data: any) {
    const prisma = this.getPrisma();
    return prisma.meetingRoom.create({ data });
  }

  static async createTestMeeting(data: any) {
    const prisma = this.getPrisma();
    return prisma.meeting.create({ data });
  }
}