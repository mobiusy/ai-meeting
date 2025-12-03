import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { UpdateMeetingDto } from './dto/update-meeting.dto'
import { QueryMeetingsDto } from './dto/query-meetings.dto'
import { NotificationService } from '../notifications/notification.service'

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService, private notify: NotificationService) {}

  private async hasRoomConflict(roomId: string, start: Date, end: Date, excludeId?: string) {
    const conflict = await this.prisma.meeting.findFirst({
      where: {
        roomId,
        status: { not: 'CANCELLED' },
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          { AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }] },
          { AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }] },
          { AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }] },
        ],
      },
    })
    return !!conflict
  }

  private async hasParticipantConflict(userIds: string[], start: Date, end: Date, excludeId?: string) {
    if (!userIds?.length) return false
    const conflicts = await this.prisma.meetingParticipant.findMany({
      where: {
        userId: { in: userIds },
        meeting: {
          status: { not: 'CANCELLED' },
          id: excludeId ? { not: excludeId } : undefined,
          OR: [
            { AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }] },
            { AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }] },
            { AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }] },
          ],
        },
      },
      select: { userId: true },
    })
    return conflicts.length > 0
  }

  private async buildSuggestions(start: Date, end: Date, capacity?: number) {
    const candidates = [30, 60].map(m => ({
      start: new Date(start.getTime() + m * 60000),
      end: new Date(end.getTime() + m * 60000),
    }))
    return { timeWindows: candidates, capacity }
  }

  async create(dto: CreateMeetingDto, creatorId: string) {
    const start = new Date(dto.startTime)
    const end = new Date(dto.endTime)
    if (start >= end) throw new ConflictException('时间不合法')

    const room = await this.prisma.meetingRoom.findUnique({ where: { id: dto.roomId } })
    if (!room) throw new NotFoundException('会议室不存在')

    const roomBusy = await this.hasRoomConflict(dto.roomId, start, end)
    const participantsBusy = await this.hasParticipantConflict(dto.participants ?? [], start, end)
    if (roomBusy || participantsBusy) {
      const suggestions = await this.buildSuggestions(start, end, room.capacity)
      throw new ConflictException({ message: '存在时间冲突', suggestions })
    }

    const approvalThreshold = parseInt(process.env.APPROVAL_THRESHOLD ?? '20')
    const approvalRequired = !!room.needApproval || ((dto.participants?.length ?? 0) >= approvalThreshold)

    const meeting = await this.prisma.meeting.create({
      data: {
        title: dto.title,
        description: dto.description,
        startTime: start,
        endTime: end,
        creatorId,
        roomId: dto.roomId,
        status: approvalRequired ? ('PENDING_APPROVAL' as any) : ('SCHEDULED' as any),
        participants: {
          create: (dto.participants ?? []).map(uid => ({ userId: uid })),
        },
      },
      include: { participants: true, room: true },
    })

    await this.notify.send(dto.participants ?? [], '会议创建', meeting.title)

    return { approvalRequired, meeting }
  }

  async findAll(query: QueryMeetingsDto) {
    const where: any = {}
    if (query.keyword) where.OR = [{ title: { contains: query.keyword, mode: 'insensitive' } }, { description: { contains: query.keyword, mode: 'insensitive' } }]
    if (query.status) where.status = query.status
    if (query.roomId) where.roomId = query.roomId
    if (query.creatorId) where.creatorId = query.creatorId
    if (query.startFrom || query.endTo) {
      where.AND = where.AND || []
      if (query.startFrom) where.AND.push({ endTime: { gte: new Date(query.startFrom) } })
      if (query.endTo) where.AND.push({ startTime: { lte: new Date(query.endTo) } })
    }
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { startTime: 'desc' } }),
      this.prisma.meeting.count({ where }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id }, include: { participants: true, room: true } })
    if (!meeting) throw new NotFoundException('会议不存在')
    const approvals = await this.approvals(id)
    return { ...(meeting as any), approvals }
  }

  async update(id: string, dto: UpdateMeetingDto, requesterId: string) {
    const existing = await this.findOne(id)
    if (existing.creatorId !== requesterId) throw new ForbiddenException()
    const start = dto.startTime ? new Date(dto.startTime) : existing.startTime
    const end = dto.endTime ? new Date(dto.endTime) : existing.endTime
    const roomId = dto.roomId ?? existing.roomId
    const participants = dto.participants ?? existing.participants.map(p => p.userId)
    const roomBusy = await this.hasRoomConflict(roomId, start, end, id)
    const participantsBusy = await this.hasParticipantConflict(participants, start, end, id)
    if (roomBusy || participantsBusy) {
      const suggestions = await this.buildSuggestions(start, end, existing.room?.capacity)
      throw new ConflictException({ message: '存在时间冲突', suggestions })
    }
    const updated = await this.prisma.meeting.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        startTime: start,
        endTime: end,
        roomId,
        participants: dto.participants ? {
          deleteMany: {},
          create: participants.map(uid => ({ userId: uid })),
        } : undefined,
      },
      include: { participants: true, room: true },
    })
    await this.notify.send(participants, '会议变更', updated.title)
    return updated
  }

  async cancel(id: string, requesterId: string) {
    const existing = await this.findOne(id)
    if (existing.creatorId !== requesterId) throw new ForbiddenException()
    const updated = await this.prisma.meeting.update({ where: { id }, data: { status: 'CANCELLED' } })
    await this.notify.send(existing.participants.map(p => p.userId), '会议取消', existing.title)
    return updated
  }

  async availability(startTime: Date, endTime: Date, capacity?: number) {
    const busyRooms = await this.prisma.meeting.findMany({
      where: {
        status: { not: 'CANCELLED' },
        OR: [
          { AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }] },
          { AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }] },
          { AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }] },
        ],
      },
      select: { roomId: true },
    })
    const busyIds = busyRooms.map(r => r.roomId)
    const where: any = { status: 'AVAILABLE', id: { notIn: busyIds } }
    if (capacity) where.capacity = { gte: capacity }
    const rooms = await this.prisma.meetingRoom.findMany({ where, orderBy: { capacity: 'asc' } })
    return { rooms }
  }

  async approve(id: string, approverRole: string, approverId: string) {
    if (!(approverRole === 'ADMIN' || approverRole === 'MANAGER')) throw new ForbiddenException()
    const existing = await this.findOne(id)
    if (existing.status !== ('PENDING_APPROVAL' as any)) throw new ConflictException('当前状态不可审批')
    const roomBusy = await this.hasRoomConflict(existing.roomId, existing.startTime, existing.endTime, id)
    const participantsBusy = await this.hasParticipantConflict(existing.participants.map(p => p.userId), existing.startTime, existing.endTime, id)
    if (roomBusy || participantsBusy) {
      const suggestions = await this.buildSuggestions(existing.startTime, existing.endTime, existing.room?.capacity)
      throw new ConflictException({ message: '存在时间冲突', suggestions })
    }
    const updated = await this.prisma.meeting.update({ where: { id }, data: { status: 'SCHEDULED' as any }, include: { participants: true } })
    try {
      await this.prisma.$executeRawUnsafe(
        'INSERT INTO "meeting_approvals" (id, action, reason, "createdAt", "meetingId", "approverId") VALUES ($1, $2::"ApprovalAction", $3, NOW(), $4, $5)',
        (await import('crypto')).randomUUID(),
        'APPROVED',
        null,
        id,
        approverId
      )
    } catch {}
    await this.notify.send(updated.participants?.map((p: any) => p.userId) ?? [], '会议审批通过', updated.title)
    return updated
  }

  async reject(id: string, approverRole: string, approverId: string, reason?: string) {
    if (!(approverRole === 'ADMIN' || approverRole === 'MANAGER')) throw new ForbiddenException()
    const existing = await this.findOne(id)
    if (existing.status !== ('PENDING_APPROVAL' as any)) throw new ConflictException('当前状态不可审批')
    const updated = await this.prisma.meeting.update({ where: { id }, data: { status: 'CANCELLED' as any }, include: { participants: true } })
    try {
      await this.prisma.$executeRawUnsafe(
        'INSERT INTO "meeting_approvals" (id, action, reason, "createdAt", "meetingId", "approverId") VALUES ($1, $2::"ApprovalAction", $3, NOW(), $4, $5)',
        (await import('crypto')).randomUUID(),
        'REJECTED',
        reason ?? null,
        id,
        approverId
      )
    } catch {}
    await this.notify.send(updated.participants?.map((p: any) => p.userId) ?? [], '会议审批拒绝', updated.title)
    return updated
  }

  async approvals(id: string) {
    try {
      const rows = await this.prisma.$queryRawUnsafe<any[]>(
        'SELECT id, action, reason, "meetingId", "approverId", "createdAt" FROM "meeting_approvals" WHERE "meetingId" = $1 ORDER BY "createdAt" DESC',
        id
      )
      return rows
    } catch {
      return []
    }
  }
}
