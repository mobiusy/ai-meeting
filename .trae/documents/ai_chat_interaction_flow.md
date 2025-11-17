# AI对话界面 - 交互流程设计

## 1. 对话界面架构

### 界面布局
```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI会议助手                    [传统表单] [清空] [帮助]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  对话历史区域                                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ AI: 您好！我是会议助手，可以帮您预约会议。请告诉我 │   │
│  │     您的需求，比如："明天下午2点开个1小时的项目评审" │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ 正在输入...                                          │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  输入区域                                                    │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ 输入您的需求...                                   │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │ │  发送  │ │ 语音   │ │ 模板   │ │ 表情   │       │   │
│  │ └────────┘ └────────┘ └────────┘ └────────┘       │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 2. 对话状态管理

### 状态定义
```typescript
interface ChatState {
  messages: Message[];
  currentState: 'idle' | 'listening' | 'thinking' | 'responding' | 'error';
  context: ChatContext;
  slotFilling: SlotFillingState;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'suggestion' | 'error' | 'success';
  metadata?: MessageMetadata;
}

interface ChatContext {
  userId: string;
  conversationId: string;
  currentIntent: string;
  filledSlots: Record<string, any>;
  pendingSlots: string[];
  alternatives: Alternative[];
}
```

## 3. 多轮对话流程

### 3.1 初始状态
```
用户: 打开AI预约
AI: 您好！我是会议助手，可以帮您预约会议。请告诉我您的需求，
    比如："明天下午2点开个1小时的项目评审"
```

### 3.2 信息收集流程
```
用户: 明天下午2点需要开个项目评审会议，大概10个人参加

AI处理过程:
1. 意图识别: book_meeting
2. 实体提取: 
   - 时间: 明天14:00
   - 会议类型: 项目评审
   - 人数: 10人
3. 槽位状态检查:
   ✓ 时间 (部分)
   ✓ 会议类型
   ✓ 人数
   ✗ 时长
   ✗ 设备需求
   ✗ 参会人员

AI回复:
"好的！我来帮您安排项目评审会议。我需要了解一些详细信息：
 • 会议预计时长？
 • 是否需要投影设备？
 • 参会人员具体有哪些？"
```

### 3.3 冲突检测与替代方案
```
用户: 时长1小时，需要投影仪

AI处理:
1. 槽位更新:
   - 时长: 1小时
   - 设备: 投影仪
2. 冲突检测:
   - 查询明天14:00-15:00可用会议室
   - 发现A101、B205已被占用
3. 生成替代方案:
   - 14:30-15:30 (A101空闲)
   - 15:00-16:00 (B205空闲)
   - 后天14:00-15:00 (全部空闲)

AI回复:
"检测到时间冲突，推荐以下时间段：
 🕐 明天14:30-15:30 (推荐) - A101可用
 🕐 明天15:00-16:00 - B205可用  
 🕐 后天14:00-15:00 - 多间可选
您希望选择哪个时间？"
```

## 4. 消息类型设计

### 4.1 文本消息
```typescript
const textMessage: Message = {
  id: 'msg_001',
  role: 'assistant',
  content: '好的！我来帮您安排项目评审会议。',
  timestamp: new Date(),
  type: 'text'
};
```

### 4.2 建议消息
```typescript
const suggestionMessage: Message = {
  id: 'msg_002', 
  role: 'assistant',
  content: '检测到时间冲突，推荐以下时间段：',
  timestamp: new Date(),
  type: 'suggestion',
  metadata: {
    suggestions: [
      { time: '14:30-15:30', room: 'A101', reason: '推荐' },
      { time: '15:00-16:00', room: 'B205', reason: '可选' },
      { time: '后天14:00-15:00', room: '多间可选', reason: '备选' }
    ]
  }
};
```

### 4.3 错误消息
```typescript
const errorMessage: Message = {
  id: 'msg_003',
  role: 'assistant', 
  content: '抱歉，我没有理解您的意思。请重新描述您的需求。',
  timestamp: new Date(),
  type: 'error',
  metadata: {
    errorType: 'intent_not_recognized',
    helpText: '您可以这样说："明天下午2点开个1小时的项目评审"'
  }
};
```

## 5. 槽位填充策略

### 5.1 槽位定义
```typescript
const meetingSlots = {
  required: ['title', 'time', 'duration', 'attendees'],
  optional: ['room', 'equipment', 'description', 'recurrence'],
  alternatives: ['alternative_times', 'alternative_rooms']
};
```

### 5.2 填充策略
```typescript
class SlotFillingStrategy {
  // 主动询问缺失信息
  askForMissingSlot(slot: string): string {
    const questions = {
      duration: '会议预计时长？',
      attendees: '参会人员具体有哪些？',
      equipment: '需要什么设备吗？（投影、视频等）',
      room: '有会议室偏好吗？'
    };
    return questions[slot] || '请提供更多信息';
  }

  // 智能推荐
  suggestAlternatives(context: ChatContext): Alternative[] {
    // 基于历史偏好、可用性等推荐
    return this.generateSmartAlternatives(context);
  }

  // 信息确认
  confirmInformation(filledSlots: Record<string, any>): string {
    return `请确认会议信息：
            标题：${filledSlots.title}
            时间：${filledSlots.time}
            时长：${filledSlots.duration}
            人数：${filledSlots.attendees.length}人`;
  }
}
```

## 6. 智能推荐算法

### 6.1 时间推荐
```typescript
class TimeRecommendationEngine {
  recommendTimes(request: TimeRequest): TimeSlot[] {
    const preferences = this.analyzePreferences(request);
    const availability = this.checkAvailability(request);
    const conflicts = this.detectConflicts(request);
    
    return this.generateRecommendations(preferences, availability, conflicts);
  }

  private analyzePreferences(request: TimeRequest): TimePreference {
    // 分析用户历史偏好
    // 考虑工作时间段、会议时长偏好等
    return {
      preferredHours: [9, 10, 14, 15, 16],
      durationFlexibility: 30, // 分钟
      dayFlexibility: 1 // 天
    };
  }
}
```

### 6.2 会议室推荐
```typescript
class RoomRecommendationEngine {
  recommendRooms(request: RoomRequest): RoomOption[] {
    const requirements = this.analyzeRequirements(request);
    const availableRooms = this.getAvailableRooms(request.timeSlot);
    
    return this.rankRooms(requirements, availableRooms);
  }

  private rankRooms(requirements: RoomReq, rooms: Room[]): RoomOption[] {
    return rooms.map(room => ({
      ...room,
      score: this.calculateScore(room, requirements),
      reasons: this.generateReasons(room, requirements)
    })).sort((a, b) => b.score - a.score);
  }
}
```

## 7. 异常处理流程

### 7.1 无法理解用户意图
```
用户: 随便来个会议
AI: 抱歉，我没有理解您的具体需求。
    您可以这样说："明天下午2点开个1小时的项目评审"
    或者告诉我：会议时间、参与人数、会议主题
```

### 7.2 系统错误处理
```
用户: 预约明天下午的会议
AI: 抱歉，系统暂时无法处理您的请求。
    错误信息：数据库连接超时
    建议：您可以稍后再试，或切换到传统表单预约
```

### 7.3 权限检查失败
```
用户: 预约大会议室
AI: 抱歉，您当前权限无法预约大型会议室。
    您的权限：标准员工
    需要权限：部门经理或以上
    建议：请联系您的上级协助预约
```

## 8. 安全与过滤

### 8.1 输入过滤
```typescript
class InputFilter {
  sanitizeInput(input: string): string {
    // 移除潜在危险字符
    const sanitized = input
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 500); // 长度限制
    
    return sanitized;
  }

  detectInjection(input: string): boolean {
    const patterns = [
      /system\s*:/i,
      /ignore\s*previous/i,
      /disregard\s*all/i,
      /bypass\s*security/i
    ];
    
    return patterns.some(pattern => pattern.test(input));
  }
}
```

### 8.2 敏感信息检测
```typescript
class SensitiveDataDetector {
  detectSensitiveInfo(text: string): DetectionResult {
    const patterns = {
      phone: /\d{3}-\d{3}-\d{4}/g,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      ssn: /\d{3}-\d{2}-\d{4}/g,
      creditCard: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g
    };

    const findings = Object.entries(patterns)
      .map(([type, regex]) => ({
        type,
        matches: text.match(regex) || []
      }))
      .filter(result => result.matches.length > 0);

    return {
      hasSensitiveData: findings.length > 0,
      findings,
      sanitizedText: this.maskSensitiveData(text, findings)
    };
  }
}
```

## 9. 上下文切换设计

### 9.1 切换到传统表单
```typescript
interface ContextSwitch {
  preserveContext(from: ChatContext): FormData {
    return {
      title: from.filledSlots.title,
      time: from.filledSlots.time,
      duration: from.filledSlots.duration,
      attendees: from.filledSlots.attendees,
      equipment: from.filledSlots.equipment,
      room: from.filledSlots.room,
      source: 'ai_chat'
    };
  }

  restoreContext(formData: FormData): Partial<ChatContext> {
    return {
      filledSlots: {
        title: formData.title,
        time: formData.time,
        duration: formData.duration,
        // ... 其他字段
      },
      currentIntent: 'book_meeting',
      returnFromForm: true
    };
  }
}
```

### 9.2 切换确认对话框
```
用户点击"切换到传统表单"
┌─────────────────────────────────────┐
│ 切换到传统表单？                    │
│                                     │
│ 当前已填写信息将被保留：            │
│ ✓ 会议时间：明天14:30-15:30         │
│ ✓ 会议时长：1小时                    │
│ ✓ 参会人数：10人                    │
│                                     │
│ [取消]            [确认切换]        │
└─────────────────────────────────────┘
```

## 10. 性能优化

### 10.1 消息缓存
```typescript
class MessageCache {
  private cache = new Map<string, CachedMessage>();
  
  cacheMessage(message: Message): void {
    this.cache.set(message.id, {
      ...message,
      cachedAt: Date.now()
    });
  }

  getCachedMessage(id: string): Message | null {
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.cachedAt < 300000) { // 5分钟
      return cached;
    }
    return null;
  }
}
```

### 10.2 流式响应
```typescript
class StreamingResponse {
  async *streamResponse(prompt: string): AsyncGenerator<string> {
    const response = await this.llmClient.streamChat(prompt);
    
    for await (const chunk of response) {
      yield chunk.content;
      // 实时更新UI
      this.updateUI(chunk.content);
    }
  }
}
```

## 11. 用户引导设计

### 11.1 首次使用引导
```
第1步：介绍功能
"欢迎使用AI会议助手！我可以帮您：
 • 快速预约会议室
 • 智能推荐时间
 • 检测冲突并提供替代方案"

第2步：使用示例
"试试看这样说：
 '明天下午2点开个1小时的项目评审'"

第3步：提示技巧
"小贴士：
 • 尽量具体描述时间和需求
 • 我可以理解自然语言
 • 随时可以切换到传统表单"
```

### 11.2 帮助系统
```typescript
class HelpSystem {
  getHelp(topic?: string): HelpContent {
    const helpTopics = {
      'time-format': '时间格式说明',
      'voice-input': '语音输入指南', 
      'slot-filling': '如何提供完整信息',
      'alternatives': '替代方案说明'
    };

    return {
      title: helpTopics[topic] || '使用帮助',
      content: this.generateHelpContent(topic),
      examples: this.getExamples(topic),
      relatedTopics: this.getRelatedTopics(topic)
    };
  }
}
```

## 12. 无障碍设计

### 12.1 键盘导航
```typescript
class KeyboardNavigation {
  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Enter':
          if (e.ctrlKey) this.sendMessage();
          break;
        case 'Escape':
          this.cancelCurrentInput();
          break;
        case 'ArrowUp':
          this.navigateHistory('up');
          break;
        case 'ArrowDown':
          this.navigateHistory('down');
          break;
      }
    });
  }
}
```

### 12.2 屏幕阅读器支持
```typescript
class ScreenReaderSupport {
  announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}
```

---

*这份AI对话界面交互流程设计确保了用户能够自然、高效地完成会议预约，同时提供了丰富的智能辅助和异常处理能力*