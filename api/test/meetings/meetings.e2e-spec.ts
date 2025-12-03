import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { TestApp } from '../utils/test-app'
import { TestAuth } from '../utils/test-auth'
import { MockFactory } from '../utils/mock-factory'

describe('MeetingsController (e2e)', () => {
  let app: INestApplication
  let authHeader: string
  let adminHeader: string
  let userId: string
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
    const { user, token } = await TestAuth.createAuthenticatedUser()
    authHeader = `Bearer ${token}`
    userId = user.id
    const admin = await TestAuth.createAuthenticatedUser({ role: 'ADMIN', email: 'admin@example.com' })
    adminHeader = `Bearer ${admin.token}`
    const roomResp = await request(app.getHttpServer())
      .post('/meeting-rooms')
      .set('Authorization', adminHeader)
      .send(MockFactory.createMeetingRoom())
      .expect(201)
    roomId = roomResp.body.data.id
  })

  it('应该成功创建会议', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()
    const resp = await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', authHeader)
      .send({ title: '测试会议', startTime: start, endTime: end, roomId, participants: [userId] })
      .expect(201)
    expect(resp.body.meeting).toBeDefined()
    expect(resp.body.meeting.title).toBe('测试会议')
  })

  it('应该拒绝创建当房间时间冲突', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()
    await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', authHeader)
      .send({ title: '第一次会议', startTime: start, endTime: end, roomId })
      .expect(201)
    const resp = await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', authHeader)
      .send({ title: '第二次会议', startTime: start, endTime: end, roomId })
      .expect(409)
    expect(resp.body).toBeDefined()
  })

  it('应该可取消会议', async () => {
    const start = new Date(Date.now() + 3600000).toISOString()
    const end = new Date(Date.now() + 7200000).toISOString()
    const created = await request(app.getHttpServer())
      .post('/meetings')
      .set('Authorization', authHeader)
      .send({ title: '待取消会议', startTime: start, endTime: end, roomId })
      .expect(201)
    const id = created.body.meeting.id
    const cancelResp = await request(app.getHttpServer())
      .post(`/meetings/${id}/cancel`)
      .set('Authorization', authHeader)
      .expect(201)
    expect(cancelResp.body.status).toBe('CANCELLED')
  })
})
