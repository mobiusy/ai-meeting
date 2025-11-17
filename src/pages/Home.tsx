import { useAuthStore } from '@/stores/auth'
import { Card, Row, Col, Statistic } from 'antd'
import { CalendarOutlined, TeamOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'

export default function Home() {
  const { user } = useAuthStore()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          欢迎回来，{user?.name}！
        </h1>
        <p className="text-gray-600">
          {user?.role === 'ADMIN' && '管理员'}
          {user?.role === 'MANAGER' && '部门经理'}
          {user?.role === 'EMPLOYEE' && '员工'}
          {user?.role === 'GUEST' && '访客'}
          工作台
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="今日会议"
              value={3}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="可用会议室"
              value={5}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="待确认邀请"
              value={2}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mt-8">
        <Card title="快速操作" className="shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <CalendarOutlined className="text-2xl text-blue-600 mb-2" />
              <div className="text-blue-800 font-medium">预约会议</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <TeamOutlined className="text-2xl text-green-600 mb-2" />
              <div className="text-green-800 font-medium">查看会议室</div>
            </button>
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-center transition-colors">
              <ClockCircleOutlined className="text-2xl text-yellow-600 mb-2" />
              <div className="text-yellow-800 font-medium">我的日程</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <UserOutlined className="text-2xl text-purple-600 mb-2" />
              <div className="text-purple-800 font-medium">个人设置</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}