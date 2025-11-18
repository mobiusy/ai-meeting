// 简单的Demo用户创建脚本
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function createDemoUser() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'meeting_system',
    user: 'postgres',
    password: 'password',
  });

  try {
    await client.connect();
    console.log('已连接到数据库');

    // 检查demo用户是否已存在
    const checkResult = await client.query(
      'SELECT email, name, role FROM users WHERE email = $1',
      ['demo@example.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('Demo用户已存在:');
      console.log('邮箱:', checkResult.rows[0].email);
      console.log('姓名:', checkResult.rows[0].name);
      console.log('角色:', checkResult.rows[0].role);
      return;
    }

    // 创建demo用户
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const result = await client.query(
      `INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW()) 
       RETURNING email, name, role`,
      ['demo@example.com', 'Demo用户', hashedPassword, 'ADMIN']
    );

    console.log('Demo用户创建成功!');
    console.log('登录信息:');
    console.log('邮箱: demo@example.com');
    console.log('密码: demo123');
    console.log('角色: ADMIN');

  } catch (error) {
    console.error('创建用户失败:', error.message);
  } finally {
    await client.end();
  }
}

createDemoUser();