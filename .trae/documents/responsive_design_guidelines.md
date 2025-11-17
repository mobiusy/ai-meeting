# 响应式设计规范 - 企业级会议系统

## 1. 响应式断点系统

### 断点定义
```css
/* 移动优先断点系统 */
@media (min-width: 640px)  { /* sm: 手机横屏 */ }
@media (min-width: 768px)  { /* md: 平板竖屏 */ }
@media (min-width: 1024px) { /* lg: 平板横屏/小屏笔记本 */ }
@media (min-width: 1280px) { /* xl: 标准桌面 */ }
@media (min-width: 1536px) { /* 2xl: 大屏桌面 */ }
```

### 设备分类
| 断点 | 设备类型 | 屏幕宽度 | 主要特征 |
|------|----------|----------|----------|
| xs | 手机竖屏 | < 640px | 单列布局，触摸优先 |
| sm | 手机横屏 | 640-767px | 紧凑型布局 |
| md | 平板竖屏 | 768-1023px | 侧边栏可折叠 |
| lg | 平板横屏 | 1024-1279px | 双列布局 |
| xl | 桌面标准 | 1280-1535px | 完整三列布局 |
| 2xl | 大屏桌面 | ≥ 1536px | 宽屏优化布局 |

## 2. 布局适配策略

### 2.1 导航栏响应式
```css
/* 移动端导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  z-index: 50;
}

/* 桌面端导航 */
.desktop-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  padding: 16px;
  overflow-y: auto;
}

/* 响应式切换 */
@media (max-width: 767px) {
  .desktop-nav { display: none; }
  .mobile-nav { display: flex; }
  .main-content { margin-bottom: 64px; }
}

@media (min-width: 768px) {
  .desktop-nav { display: block; }
  .mobile-nav { display: none; }
  .main-content { margin-left: 240px; }
}
```

### 2.2 内容区域适配
```css
/* 基础容器 */
.container {
  width: 100%;
  padding: 0 16px;
  margin: 0 auto;
}

/* 响应式容器宽度 */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}
@media (min-width: 768px) {
  .container { max-width: 768px; }
}
@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}
@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

### 2.3 网格系统响应式
```css
/* 移动端单列 */
.grid-responsive {
  display: grid;
  gap: 16px;
}

/* 平板双列 */
@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面三列 */
@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 大屏四列 */
@media (min-width: 1280px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## 3. 组件响应式设计

### 3.1 会议室卡片适配
```css
/* 移动端卡片 */
.room-card-mobile {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 12px;
}

.room-card-mobile .room-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  margin-right: 16px;
  object-fit: cover;
}

.room-card-mobile .room-info {
  flex: 1;
}

.room-card-mobile .room-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 桌面端卡片 */
.room-card-desktop {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: all 0.2s ease;
}

.room-card-desktop:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.room-card-desktop .room-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.room-card-desktop .room-content {
  padding: 20px;
}
```

### 3.2 表单响应式
```css
/* 移动端表单 */
.form-group-mobile {
  margin-bottom: 20px;
}

.form-group-mobile label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group-mobile input,
.form-group-mobile select,
.form-group-mobile textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px; /* 防止iOS缩放 */
}

/* 桌面端表单 */
.form-row-desktop {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group-desktop {
  display: flex;
  flex-direction: column;
}

.form-group-desktop label {
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group-desktop input,
.form-group-desktop select,
.form-group-desktop textarea {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
```

### 3.3 按钮响应式
```css
/* 移动端按钮 */
.btn-mobile {
  padding: 14px 24px;
  font-size: 16px;
  border-radius: 8px;
  min-height: 48px; /* 触摸目标最小尺寸 */
  font-weight: 500;
}

.btn-mobile-primary {
  background: #3b82f6;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 桌面端按钮 */
.btn-desktop {
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-desktop:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

## 4. 特殊组件适配

### 4.1 AI对话界面响应式
```css
/* 移动端对话界面 */
.chat-container-mobile {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.chat-messages-mobile {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.chat-input-mobile {
  position: fixed;
  bottom: 64px; /* 考虑底部导航 */
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

/* 桌面端对话界面 */
.chat-container-desktop {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.chat-messages-desktop {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.chat-input-desktop {
  margin-top: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### 4.2 日历组件响应式
```css
/* 移动端日历 */
.calendar-mobile {
  font-size: 14px;
}

.calendar-mobile .calendar-header {
  padding: 12px 16px;
  font-size: 16px;
}

.calendar-mobile .calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e5e7eb;
}

.calendar-mobile .calendar-cell {
  background: white;
  padding: 8px 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 桌面端日历 */
.calendar-desktop {
  font-size: 16px;
  max-width: 400px;
}

.calendar-desktop .calendar-header {
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 600;
}

.calendar-desktop .calendar-grid {
  gap: 2px;
}

.calendar-desktop .calendar-cell {
  padding: 12px 8px;
  min-height: 48px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-desktop .calendar-cell:hover {
  background: #f3f4f6;
}
```

## 5. 性能优化

### 5.1 图片响应式
```html
<!-- 响应式图片 -->
<picture>
  <source media="(max-width: 640px)" srcset="room-mobile.jpg">
  <source media="(max-width: 1024px)" srcset="room-tablet.jpg">
  <img src="room-desktop.jpg" alt="会议室" loading="lazy">
</picture>

<!-- CSS背景图片响应式 -->
.responsive-bg {
  background-image: url('bg-mobile.jpg');
}

@media (min-width: 768px) {
  .responsive-bg {
    background-image: url('bg-tablet.jpg');
  }
}

@media (min-width: 1280px) {
  .responsive-bg {
    background-image: url('bg-desktop.jpg');
  }
}
```

### 5.2 资源懒加载
```typescript
// 图片懒加载
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};
```

### 5.3 触摸优化
```css
/* 触摸区域优化 */
.touch-optimized {
  min-height: 48px; /* iOS推荐最小触摸目标 */
  min-width: 48px;
}

/* 触摸反馈 */
.touch-feedback {
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease;
}

.touch-feedback:active {
  transform: scale(0.98);
}

/* 滚动优化 */
.scroll-optimized {
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}
```

## 6. 无障碍设计

### 6.1 可访问性响应式
```html
<!-- 响应式ARIA标签 -->
<nav role="navigation" aria-label="主导航">
  <!-- 移动端菜单按钮 -->
  <button class="md:hidden" 
          aria-label="打开菜单" 
          aria-expanded="false"
          aria-controls="mobile-menu">
    <span class="sr-only">菜单</span>
    ☰
  </button>
  
  <!-- 桌面端导航 -->
  <ul class="hidden md:flex" id="desktop-nav">
    <li><a href="/dashboard">仪表板</a></li>
    <li><a href="/meetings">会议</a></li>
    <li><a href="/rooms">会议室</a></li>
  </ul>
  
  <!-- 移动端导航 -->
  <ul class="md:hidden" id="mobile-menu" hidden>
    <li><a href="/dashboard">仪表板</a></li>
    <li><a href="/meetings">会议</a></li>
    <li><a href="/rooms">会议室</a></li>
  </ul>
</nav>
```

### 6.2 色彩对比度
```css
/* 确保足够的色彩对比度 */
.text-primary {
  color: #1e40af;
}

.bg-primary {
  background-color: #3b82f6;
  color: white; /* 确保对比度 ≥ 4.5:1 */
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .text-primary {
    color: #000080;
  }
  
  .border-gray-300 {
    border-color: #000;
  }
}
```

## 7. 测试清单

### 7.1 设备测试清单
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] MacBook Air (1280px)
- [ ] Desktop (1920px)

### 7.2 功能测试清单
- [ ] 触摸目标大小 ≥ 48px
- [ ] 文字可读性（字体大小 ≥ 14px）
- [ ] 横向/纵向旋转适配
- [ ] 键盘导航可用性
- [ ] 屏幕阅读器兼容性
- [ ] 加载性能（首屏 < 3秒）
- [ ] 交互响应时间 < 100ms

### 7.3 浏览器兼容性
- [ ] Chrome (最新版本)
- [ ] Safari (最新版本)
- [ ] Firefox (最新版本)
- [ ] Edge (最新版本)
- [ ] 微信内置浏览器
- [ ] 企业微信内置浏览器

---

*这份响应式设计规范确保了企业级会议系统在各种设备上都能提供优秀的用户体验*