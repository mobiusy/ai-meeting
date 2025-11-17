import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      message.success('登录成功')
      navigate('/')
    } catch (error) {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">企业会议系统</h1>
          <p className="text-gray-600">请登录您的账户</p>
        </div>
        
        <Card className="shadow-lg">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="请输入邮箱"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full"
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}