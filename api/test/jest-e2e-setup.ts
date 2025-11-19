import { config } from 'dotenv';

// 加载测试环境变量
config({ path: '.env.test' });

beforeAll(async () => {
  // 设置测试环境
  process.env.NODE_ENV = 'test';
});

beforeEach(async () => {
  // 每个测试前可以添加清理逻辑
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // 测试完成后清理
  console.log('Cleaning up test environment...');
});