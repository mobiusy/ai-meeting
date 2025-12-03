import { useEffect, useState } from 'react'
import { Form, Input, Button, Card, message, DatePicker, Select, Space, Alert } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { meetingsApi } from '@/services/meetingsApi'
import { meetingRoomApi } from '@/services/meetingRoomApi'
import { CreateMeetingData, UpdateMeetingData } from '@/types/meeting'

const { RangePicker } = DatePicker
const { Option } = Select

export default function MeetingForm() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [availability, setAvailability] = useState<{ count: number } | null>(null)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  useEffect(() => { loadRooms(); loadUsers(); if (isEdit) loadMeeting() }, [id, isEdit])

  const loadRooms = async () => {
    try {
      const resp = await meetingRoomApi.getList({ page: 1, pageSize: 100 })
      if (resp.success) setRooms(resp.data.list)
    } catch {}
  }

  const loadUsers = async () => {
    try {
      const api = await import('@/services/usersApi')
      const res = await api.usersApi.getList()
      if (res.success) setUsers(res.data)
    } catch {}
  }

  const loadMeeting = async () => {
    try {
      setLoading(true)
      const resp = await meetingsApi.getById(id!)
      const m = resp.data
      form.setFieldsValue({ title: m.title, description: m.description, roomId: m.roomId, timeRange: [new Date(m.startTime) as any, new Date(m.endTime) as any] })
    } catch { message.error('获取会议信息失败'); navigate('/meetings') } finally { setLoading(false) }
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const start = values.timeRange?.[0]?.toDate?.() ? values.timeRange[0].toDate().toISOString() : values.timeRange?.[0]?.toISOString?.()
      const end = values.timeRange?.[1]?.toDate?.() ? values.timeRange[1].toDate().toISOString() : values.timeRange?.[1]?.toISOString?.()
      const data: CreateMeetingData | UpdateMeetingData = { title: values.title, description: values.description, startTime: start, endTime: end, roomId: values.roomId, participants: values.participants }
      if (isEdit) {
        const resp = await meetingsApi.update(id!, data)
        if (resp.success) message.success('会议更新成功')
      } else {
        const resp = await meetingsApi.create(data as CreateMeetingData)
        if (resp.success) message.success('会议创建成功')
      }
      navigate('/meetings')
    } catch (error: any) {
      const suggestions = error?.response?.data?.suggestions
      if (error?.response?.status === 409 && suggestions?.timeWindows?.length) {
        const s = suggestions.timeWindows[0]
        form.setFieldsValue({ timeRange: [new Date(s.start) as any, new Date(s.end) as any] })
        message.info('检测到冲突，已为你应用建议时间窗口，请再次提交')
      } else {
        message.error(error?.response?.data?.message || '操作失败')
      }
    } finally { setLoading(false) }
  }

  const precheckAvailability = async () => {
    try {
      const values = form.getFieldsValue()
      const start = values.timeRange?.[0]?.toDate?.() ? values.timeRange[0].toDate().toISOString() : values.timeRange?.[0]?.toISOString?.()
      const end = values.timeRange?.[1]?.toDate?.() ? values.timeRange[1].toDate().toISOString() : values.timeRange?.[1]?.toISOString?.()
      if (!start || !end) { message.warning('请先选择时间范围'); return }
      const resp = await (await import('@/services/meetingsApi')).meetingsApi.getAvailability?.(start, end, values.participants?.length)
      if (resp?.success) setAvailability({ count: resp.data.rooms.length })
    } catch {}
  }

  return (
    <div className="p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-6">{isEdit ? '编辑会议' : '新建会议'}</h1>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入会议标题" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="请输入会议描述" />
          </Form.Item>
          <Form.Item label="时间范围" name="timeRange" rules={[{ required: true, message: '请选择时间范围' }]}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="会议室" name="roomId" rules={[{ required: true, message: '请选择会议室' }]}>
            <Select placeholder="请选择会议室">
              {rooms.map((r) => (
                <Option key={r.id} value={r.id}>{r.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="参会人" name="participants">
            <Select mode="multiple" placeholder="选择参会人（可选）" allowClear optionFilterProp="label">
              {users.map((u) => (<Option key={u.id} value={u.id} label={`${u.name}(${u.email})`}>{u.name}（{u.email}）</Option>))}
            </Select>
          </Form.Item>
          {availability && <Alert type="info" message={`该时间段可用会议室数量：${availability.count}`} showIcon className="mb-4" />}
          <Button onClick={precheckAvailability} className="mb-4">检查可用会议室</Button>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>{isEdit ? '更新' : '创建'}</Button>
              <Button onClick={() => navigate('/meetings')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
