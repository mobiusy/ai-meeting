import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { TestApp } from '../utils/test-app'
import { TestAuth } from '../utils/test-auth'
import { MockFactory } from '../utils/mock-factory'

describe('Meetings Approval (e2e)', () => {
  let app: INestApplication
  let adminHeader: string
  let userHeader: string
  let roomId: string

  beforeAll(async () => {
    const { app: testApp } = await TestApp.createApp()
    app = testApp
    TestAuth.setApp(app)
  })

  afterAll(async () => {
    await TestApp.closeApp()
  })

  beforeEach(async () => {
    await TestApp.cleanDatabase()
    const admin = await TestAuth.createAuthenticatedUser({ role: 'ADMIN' })
    adminHeader = `Bearer ${admin.token}`
    const user = await TestAuth.createAuthenticatedUser({ role: 'EMPLOYEE' })
    userHeader = `Bearer ${user.token}`
    const roomResp = await request(app.getHttpServer())
      .post('/meeting-rooms')
      .set('Authorization', adminHeader)
      .send({ ...MockFactory.createMeetingRoom(), needApproval: true })
      .expect(201)
    roomId = roomResp.body.data.id
  })

  it('创建需要审批的会议并通过审批', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()
    const created = await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', userHeader)
      .send({ title: '审批会议', startTime: start, endTime: end, roomId })
      .expect(201)
    expect(created.body.approvalRequired).toBe(true)
    expect(created.body.meeting.status).toBe('PENDING_APPROVAL')

    const id = created.body.meeting.id
    const approved = await request(app.getHttpServer())
      .post(`/meetings/${id}/approve`)
      .set('Authorization', adminHeader)
      .expect(201)
    expect(approved.body.status).toBe('SCHEDULED')
  })

  it('审批拒绝后状态为取消', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()
    const created = await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', userHeader)
      .send({ title: '审批拒绝会议', startTime: start, endTime: end, roomId })
      .expect(201)
    const id = created.body.meeting.id
    const rejected = await request(app.getHttpServer())
      .post(`/meetings/${id}/reject`)
      .set('Authorization', adminHeader)
      .expect(201)
    expect(rejected.body.status).toBe('CANCELLED')
  })
})
