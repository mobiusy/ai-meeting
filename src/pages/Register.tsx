import { useState } from 'react'
import { Form, Input, Button, Card, message, Select } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'

interface RegisterForm {
  email: string
  name: string
  password: string
  confirmPassword: string
  departmentId?: string
}

const { Option } = Select

export default function Register() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          password: values.password,
          departmentId: values.departmentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '注册失败')
      }

      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">企业会议系统</h1>
          <p className="text-gray-600">创建新账户</p>
        </div>
        
        <Card className="shadow-lg">
          <Form
            name="register"
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
                prefix={<MailOutlined className="text-gray-400" />} 
                placeholder="请输入邮箱"
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="请输入姓名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="请确认密码"
              />
            </Form.Item>

            <Form.Item
              name="departmentId"
              label="部门"
              rules={[{ required: false }]}
            >
              <Select placeholder="选择部门（可选）">
                <Option value="tech">技术部</Option>
                <Option value="product">产品部</Option>
                <Option value="marketing">市场部</Option>
                <Option value="hr">人事部</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full"
                size="large"
              >
                注册
              </Button>
            </Form.Item>

            <div className="text-center">
              <span className="text-gray-600">已有账户？</span>
              <Link to="/login" className="text-blue-600 hover:text-blue-800 ml-1">
                立即登录
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  )
}