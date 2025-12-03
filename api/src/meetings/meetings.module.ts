import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { MeetingsController } from './meetings.controller'
import { MeetingsService } from './meetings.service'
import { NotificationService } from '../notifications/notification.service'

@Module({
  imports: [PrismaModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, NotificationService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
