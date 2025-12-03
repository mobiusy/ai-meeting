import { useEffect, useState } from 'react'
import { Table, Button, Card, Input, Select, Space, message, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { meetingsApi } from '@/services/meetingsApi'
import { Meeting, MeetingStatus } from '@/types/meeting'
import { useMeetingStore } from '@/stores/meeting'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

export default function Meetings() {
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchParams, setSearchParams] = useState<{ keyword?: string; status?: MeetingStatus | ''; roomId?: string; creatorId?: string; timeRange?: any[] }>({ keyword: '', status: '', roomId: undefined, creatorId: '', timeRange: undefined })
  const [rooms, setRooms] = useState<any[]>([])
  const navigate = useNavigate()
  const { meetings, setMeetings } = useMeetingStore()

  useEffect(() => { fetchData() }, [pagination.current, pagination.pageSize, searchParams])
  useEffect(() => { loadRooms() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const startFrom = searchParams.timeRange?.[0]?.toDate?.() ? searchParams.timeRange[0].toDate().toISOString() : searchParams.timeRange?.[0]?.toISOString?.()
      const endTo = searchParams.timeRange?.[1]?.toDate?.() ? searchParams.timeRange[1].toDate().toISOString() : searchParams.timeRange?.[1]?.toISOString?.()
      const resp = await meetingsApi.getList({ page: pagination.current, pageSize: pagination.pageSize, keyword: searchParams.keyword || undefined, status: searchParams.status || undefined, roomId: searchParams.roomId || undefined, creatorId: searchParams.creatorId || undefined, startFrom, endTo } as any)
      if (resp.success) {
        setMeetings(resp.data.list)
        setPagination({ ...pagination, total: resp.data.total })
      }
    } catch { message.error('获取会议列表失败') } finally { setLoading(false) }
  }

  const loadRooms = async () => {
    try {
      const res = await (await import('@/services/meetingRoomApi')).meetingRoomApi.getList({ page: 1, pageSize: 100 })
      if (res.success) setRooms(res.data.list)
    } catch {}
  }

  const handleTableChange = (p: any) => { setPagination({ ...pagination, current: p.current, pageSize: p.pageSize }) }
  const handleSearch = (keyword: string) => { setSearchParams({ ...searchParams, keyword }); setPagination({ ...pagination, current: 1 }) }
  const handleStatusChange = (status: MeetingStatus | '') => { setSearchParams({ ...searchParams, status }); setPagination({ ...pagination, current: 1 }) }
  const handleRoomChange = (roomId?: string) => { setSearchParams({ ...searchParams, roomId }); setPagination({ ...pagination, current: 1 }) }
  const handleCreatorChange = (e: any) => { setSearchParams({ ...searchParams, creatorId: e.target.value }); setPagination({ ...pagination, current: 1 }) }
  const handleTimeChange = (range: any) => { setSearchParams({ ...searchParams, timeRange: range }); setPagination({ ...pagination, current: 1 }) }

  const columns: ColumnsType<Meeting> = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
    { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '操作', key: 'action', render: (_, record) => (
      <Space size="small">
        <Button type="link" onClick={() => navigate(`/meetings/${record.id}`)}>查看</Button>
        <Button type="link" onClick={() => navigate(`/meetings/${record.id}/edit`)}>编辑</Button>
      </Space>
    ) },
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">会议管理</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/meetings/new')}>新建会议</Button>
        </div>

        <div className="flex gap-4 mb-4">
          <Search placeholder="搜索会议标题或描述" allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} style={{ width: 300 }} />
          <Select placeholder="选择状态" allowClear style={{ width: 180 }} onChange={handleStatusChange}>
            <Option value="SCHEDULED">已安排</Option>
            <Option value="IN_PROGRESS">进行中</Option>
            <Option value="COMPLETED">已完成</Option>
            <Option value="CANCELLED">已取消</Option>
          </Select>
          <Select placeholder="选择会议室" allowClear style={{ width: 220 }} onChange={handleRoomChange}>
            {rooms.map((r) => (<Option key={r.id} value={r.id}>{r.name}</Option>))}
          </Select>
          <Input placeholder="发起人ID" allowClear onChange={handleCreatorChange} style={{ width: 200 }} />
          <RangePicker showTime onChange={handleTimeChange} />
        </div>

        <Table columns={columns} dataSource={meetings} rowKey="id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条` }} onChange={handleTableChange} />
      </Card>
    </div>
  )
}
