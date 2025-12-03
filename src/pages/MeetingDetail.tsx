import { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Space, Tag, message, List, Modal, Input } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { meetingsApi } from '@/services/meetingsApi'
import { Meeting } from '@/types/meeting'
import { useAuthStore } from '@/stores/auth'

export default function MeetingDetail() {
  const [loading, setLoading] = useState(false)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()

  useEffect(() => { if (id) load() }, [id])

  const load = async () => {
    try {
      setLoading(true)
      const resp = await meetingsApi.getById(id!)
      setMeeting(resp.data)
    } catch {} finally { setLoading(false) }
  }

  const cancel = async () => {
    try {
      const resp = await meetingsApi.cancel(id!)
      setMeeting(resp.data)
      message.success('会议已取消')
    } catch { message.error('取消失败') }
  }

  const approve = async () => {
    try {
      const resp = await meetingsApi.approve(id!)
      setMeeting(resp.data)
      message.success('审批已通过')
    } catch { message.error('审批失败') }
  }

  const reject = async () => {
    try {
      const resp = await meetingsApi.reject(id!, rejectReason)
      setMeeting(resp.data)
      setRejectOpen(false)
      setRejectReason('')
      message.success('已拒绝审批')
    } catch { message.error('拒绝失败') }
  }

  if (!meeting) return null

  return (
    <div className="p-6">
      <Card loading={loading}>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">会议详情</h1>
          <Space>
            <Button onClick={() => navigate(`/meetings/${id}/edit`)}>编辑</Button>
            <Button danger onClick={cancel}>取消会议</Button>
            {user?.role && (user.role === 'ADMIN' || user.role === 'MANAGER') && meeting.status === 'PENDING_APPROVAL' && (
              <>
                <Button type="primary" onClick={approve}>审批通过</Button>
                <Button onClick={() => setRejectOpen(true)}>审批拒绝</Button>
              </>
            )}
            <Button onClick={() => navigate('/meetings')}>返回列表</Button>
          </Space>
        </div>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="标题" span={2}>{meeting.title}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{meeting.startTime}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{meeting.endTime}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag>{meeting.status}</Tag></Descriptions.Item>
          {meeting.description && <Descriptions.Item label="描述" span={2}>{meeting.description}</Descriptions.Item>}
          {meeting.room?.name && <Descriptions.Item label="会议室" span={2}>{meeting.room.name}</Descriptions.Item>}
        </Descriptions>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">参会人</h2>
          <List
            bordered
            dataSource={meeting.participants || []}
            renderItem={(p) => <List.Item>{p.userId}</List.Item>}
          />
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">审批记录</h2>
          <List
            bordered
            dataSource={meeting.approvals || []}
            renderItem={(a) => <List.Item>{a.action} by {a.approverId} {a.reason ? `- ${a.reason}` : ''} at {a.createdAt}</List.Item>}
          />
        </div>
        <Modal title="审批拒绝" open={rejectOpen} onOk={reject} onCancel={() => setRejectOpen(false)} okText="确认拒绝" cancelText="取消">
          <Input.TextArea rows={3} placeholder="请输入拒绝理由（可选）" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </Modal>
      </Card>
    </div>
  )
}
