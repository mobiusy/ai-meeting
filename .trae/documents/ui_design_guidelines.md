# 企业级会议系统 - UI设计规范

## 设计理念
现代极简主义风格，注重用户体验和功能性，减少视觉干扰，提高操作效率。

## 1. 色彩系统

### 主色调
```css
/* 主要色彩 */
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* 主色 */
--primary-600: #2563EB;
--primary-700: #1D4ED8;
--primary-800: #1E40AF;  /* 深色主色 */
--primary-900: #1E3A8A;

/* 功能色彩 */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #06B6D4;

/* 中性色 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### 色彩应用规则
- **背景色**：使用灰色系，主内容区白色
- **主操作**：primary-500 蓝色
- **次要操作**：gray-600 深灰
- **成功状态**：success 绿色
- **警告状态**：warning 橙色
- **错误状态**：error 红色
- **禁用状态**：gray-400 浅灰

## 2. 字体系统

### 字体族
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
```

### 字号层级
```css
/* 标题 */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */

/* 字重 */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 行高
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## 3. 间距系统

```css
--space-0: 0;           /* 0px */
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;        /* 32px */
--space-10: 2.5rem;     /* 40px */
--space-12: 3rem;       /* 48px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
```

## 4. 圆角系统

```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius: 0.25rem;       /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* 圆形 */
```

## 5. 阴影系统

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

## 6. 组件规范

### 按钮规范
```css
/* 主要按钮 */
.btn-primary {
  background-color: var(--primary-500);
  color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-600);
  box-shadow: var(--shadow);
}

/* 次要按钮 */
.btn-secondary {
  background-color: white;
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}
```

### 输入框规范
```css
.input-base {
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input-base:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 卡片规范
```css
.card-base {
  background-color: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  padding: var(--space-6);
  transition: all 0.2s ease;
}

.card-base:hover {
  box-shadow: var(--shadow-lg);
}
```

## 7. 页面布局规范

### 网格系统
```css
/* 12列网格 */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
```

### 响应式断点
```css
/* 移动优先 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## 8. 关键页面设计

### 登录页面
- **布局**：居中卡片，简洁表单
- **色彩**：白色背景，蓝色主按钮
- **元素**：Logo、标题、输入框、按钮、忘记密码链接

### 主控制台
- **布局**：左侧导航 + 右侧内容
- **导航**：折叠式，图标+文字
- **内容**：卡片式展示关键数据
- **头部**：用户信息、通知、设置

### 会议预约页面
- **布局**：步骤式流程
- **表单**：分组清晰，渐进式展示
- **按钮**：主要操作突出，次要操作弱化
- **反馈**：实时验证，友好提示

### AI对话界面
- **布局**：类似聊天界面
- **气泡**：用户右对齐，AI左对齐
- **输入**：底部固定输入框
- **状态**：打字指示器，加载状态

## 9. 动画与交互

### 过渡动画
```css
.transition-all {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: background-color 0.2s ease, 
              border-color 0.2s ease, 
              color 0.2s ease;
}
```

### 悬停效果
- 按钮：颜色加深，阴影增强
- 卡片：轻微上浮，阴影扩大
- 链接：颜色变化，下划线出现

### 加载状态
- 骨架屏：灰色占位块
- 旋转图标：蓝色圆形加载器
- 进度条：蓝色渐变进度条

## 10. 可访问性

### 色彩对比
- 文本与背景对比度 ≥ 4.5:1
- 大字体对比度 ≥ 3:1
- 交互元素对比度 ≥ 3:1

### 键盘导航
- 可见的焦点指示器
- 合理的Tab顺序
- 键盘快捷键支持

### 屏幕阅读器
- 语义化HTML标签
- ARIA标签和属性
- 替代文本描述

## 11. 设计原则

1. **一致性**：保持视觉和交互的一致性
2. **简洁性**：去除不必要的装饰元素
3. **可用性**：优先考虑用户体验
4. **响应式**：适配各种设备尺寸
5. **性能**：优化加载速度和渲染性能

---

*本设计规范与Ant Design组件库配合使用，确保开发效率和视觉一致性*