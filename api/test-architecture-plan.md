# 后端测试架构规划

## 1. 测试层次架构

```
api/
├── src/
│   ├── auth/
│   │   ├── auth.service.spec.ts      # 服务层单元测试
│   │   ├── auth.controller.spec.ts   # 控制器单元测试
│   │   └── strategies/
│   │       ├── jwt.strategy.spec.ts  # 策略单元测试
│   │       └── local.strategy.spec.ts
│   ├── users/
│   │   ├── users.service.spec.ts
│   │   └── users.controller.spec.ts
│   ├── meeting-rooms/
│   │   ├── meeting-rooms.service.spec.ts
│   │   └── meeting-rooms.controller.spec.ts
│   └── upload/
│       ├── upload.service.spec.ts
│       └── upload.controller.spec.ts
├── test/
│   ├── jest-e2e.json                 # 端到端测试配置
│   ├── auth/
│   │   ├── auth.e2e-spec.ts         # 认证端到端测试
│   │   └── auth-mock.data.ts        # 测试数据
│   ├── users/
│   │   ├── users.e2e-spec.ts
│   │   └── users-mock.data.ts
│   ├── meeting-rooms/
│   │   ├── meeting-rooms.e2e-spec.ts
│   │   └── meeting-rooms-mock.data.ts
│   └── utils/
│       ├── test-database.ts          # 测试数据库工具
│       ├── test-app.ts               # 测试应用工厂
│       └── test-auth.ts              # 认证测试工具
└── prisma/
    └── test.schema.prisma            # 测试数据库schema
```

## 2. 测试策略

### 2.1 单元测试（Unit Tests）
- **目标**：测试单个组件的功能
- **覆盖率目标**：> 80%
- **测试内容**：
  - Service层业务逻辑
  - Controller层请求处理
  - 工具函数和辅助方法
  - 数据验证逻辑

### 2.2 集成测试（Integration Tests）
- **目标**：测试模块间的协作
- **测试内容**：
  - 数据库操作
  - 外部服务调用
  - 认证授权流程
  - 错误处理机制

### 2.3 端到端测试（E2E Tests）
- **目标**：测试完整的API流程
- **测试内容**：
  - 完整的CRUD操作
  - 认证授权流程
  - 文件上传下载
  - 错误场景处理

## 3. 测试工具配置

### 3.1 Jest配置优化
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.module.ts",
      "!**/main.ts",
      "!**/node_modules/**"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapping": {
      "^@/(.*)$": "<rootDir>/$1"
    }
  }
}
```

### 3.2 端到端测试配置
```json
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".*\\.e2e-spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/../src/$1"
  }
}
```

## 4. 测试数据管理

### 4.1 Mock数据工厂
```typescript
// test/utils/mock-factory.ts
export class MockFactory {
  static createUser(overrides?: Partial<User>) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'EMPLOYEE',
      ...overrides
    };
  }

  static createMeetingRoom(overrides?: Partial<MeetingRoom>) {
    return {
      id: 'test-room-id',
      name: 'Test Room',
      code: 'TR001',
      capacity: 10,
      ...overrides
    };
  }
}
```

### 4.2 测试数据库
- 使用独立的测试数据库
- 每个测试套件前清理数据
- 支持事务回滚

## 5. 测试优先级

### 第一阶段：核心功能测试（高优先级）
1. **认证授权模块**
   - JWT token生成和验证
   - 用户登录注册
   - 角色权限控制

2. **用户管理模块**
   - 用户CRUD操作
   - 密码加密验证
   - 用户状态管理

### 第二阶段：业务功能测试（中优先级）
3. **会议室管理模块**
   - 会议室CRUD操作
   - 状态管理
   - 设备管理

4. **文件上传模块**
   - 文件上传功能
   - 文件类型验证
   - 存储管理

### 第三阶段：集成和边缘情况（低优先级）
5. **API集成测试**
   - 跨模块协作
   - 事务处理
   - 错误处理

6. **性能和边界测试**
   - 大量数据处理
   - 并发请求处理
   - 输入验证边界

## 6. 测试执行计划

### 6.1 本地开发
```bash
# 运行所有单元测试
npm run test

# 运行指定模块测试
npm run test -- --testPathPattern=auth

# 运行端到端测试
npm run test:e2e

# 生成覆盖率报告
npm run test:cov
```

### 6.2 CI/CD集成
- 每次提交触发单元测试
- 合并请求触发端到端测试
- 覆盖率阈值检查
- 测试报告生成

## 7. 测试最佳实践

### 7.1 命名规范
- 测试文件：`*.spec.ts`（单元测试），`*.e2e-spec.ts`（端到端测试）
- 测试描述：使用中文描述测试场景
- 方法命名：`should_xxx_when_xxx`

### 7.2 测试结构
```typescript
describe('AuthService', () => {
  let service: AuthService;
  
  beforeEach(async () => {
    // 测试前准备
  });

  afterEach(async () => {
    // 测试后清理
  });

  describe('用户登录', () => {
    it('应该成功登录当提供正确的邮箱和密码', async () => {
      // 测试逻辑
    });

    it('应该失败登录当提供错误的密码', async () => {
      // 测试逻辑
    });
  });
});
```

### 7.3 断言规范
- 使用明确的断言消息
- 测试边界条件
- 验证错误处理

## 8. 监控和维护

### 8.1 测试指标
- 测试覆盖率：> 80%
- 测试执行时间：< 5分钟
- 测试稳定性：> 95%

### 8.2 定期维护
- 每月审查测试用例
- 更新测试数据
- 优化测试性能
- 修复不稳定测试