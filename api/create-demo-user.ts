// Demo用户数据脚本
// 用于创建演示账号

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始创建Demo用户...');

  // 检查是否已存在demo用户
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' }
  });

  if (existingUser) {
    console.log('Demo用户已存在:', {
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role
    });
    return;
  }

  // 创建Demo用户
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo用户',
      password: hashedPassword,
      role: 'ADMIN', // 设置为管理员角色，方便测试所有功能
    }
  });

  console.log('Demo用户创建成功:', {
    email: demoUser.email,
    name: demoUser.name,
    role: demoUser.role,
    createdAt: demoUser.createdAt
  });

  // 创建一些示例部门
  const departments = [
    { name: '技术部', description: '负责产品开发和技术架构' },
    { name: '市场部', description: '负责市场推广和品牌建设' },
    { name: '人事部', description: '负责人力资源管理' },
    { name: '财务部', description: '负责财务管理和预算控制' }
  ];

  for (const dept of departments) {
    const existingDept = await prisma.department.findUnique({
      where: { name: dept.name }
    });

    if (!existingDept) {
      const newDept = await prisma.department.create({
        data: dept
      });
      console.log(`创建部门: ${newDept.name}`);
    }
  }

  console.log('数据初始化完成！');
  console.log('\n登录信息:');
  console.log('邮箱: demo@example.com');
  console.log('密码: demo123');
  console.log('角色: ADMIN (管理员)');
}

main()
  .catch((e) => {
    console.error('数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });