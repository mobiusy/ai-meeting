import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
  ) { }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prismaService),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      // 暂时禁用磁盘存储检查，因为在Docker容器中路径计算可能不准确
      // () => this.disk.checkStorage('storage', { path: '/app', threshold: 0.95 }),
    ]);
  }
}