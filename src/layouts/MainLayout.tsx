import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, message } from 'antd'
import { UserOutlined, LogoutOutlined, HomeOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/auth'
import { useEffect } from 'react'

const { Header, Content, Sider } = Layout

export default function MainLayout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleLogout = () => {
    logout()
    message.success('退出登录成功')
    navigate('/login')
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        个人资料
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  )

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/meetings',
      icon: <CalendarOutlined />,
      label: '会议管理',
      onClick: () => navigate('/meetings'),
    },
    {
      key: '/rooms',
      icon: <TeamOutlined />,
      label: '会议室',
      onClick: () => navigate('/rooms'),
    },
  ]

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm px-0">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-800 mr-8">企业会议系统</h1>
            <Menu
              mode="horizontal"
              selectedKeys={[window.location.pathname]}
              items={menuItems}
              className="border-b-0 flex-1"
            />
          </div>
          <div className="flex items-center">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="flex items-center cursor-pointer hover:bg-gray-100 px-3 py-2 rounded">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />} 
                  src={user?.avatar}
                  className="mr-2"
                />
                <span className="text-gray-700">{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Layout>
        <Content className="bg-gray-50 p-6">
          <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-120px)]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}