# 🚀 Quick Start Guide

## 立即开始

### 1. 打开开发服务器

开发服务器已经在运行：
```
✅ http://localhost:3001
```

直接在浏览器中打开这个地址即可开始使用！

### 2. 测试功能

#### 主页 (http://localhost:3001)
- 查看落地页设计
- 点击 "Play Today's Puzzle" 进入游戏

#### 游戏页面 (http://localhost:3001/games/samurai)
- 查看 21×21 武士数独棋盘
- 测试以下功能：

**基本操作：**
- 点击单元格选中
- 使用键盘 1-9 填入数字
- 按 Backspace 清除数字
- 用方向键导航

**高级功能：**
- 点击 "Undo" 撤销操作
- 点击 "Redo" 重做操作
- 点击 "Conflicts" 切换冲突高亮
- 点击 "Pause" 暂停计时器
- 点击 "Reset" 重置棋盘（会确认）

**观察：**
- 实时计时器
- 进度条显示完成百分比
- 选中单元格时，相关行/列/宫格会高亮
- 冲突的数字会用红色标记
- 完成后会显示祝贺消息

---

## 📝 开发命令

如果需要重启或执行其他操作：

### 启动开发服务器
```bash
cd ~/Desktop/251027_web_数独_samuraisudoku
pnpm dev
```

### 运行测试
```bash
pnpm test:sudoku
```
应该看到 34 个测试全部通过 ✅

### 构建生产版本
```bash
pnpm build
```

### 代码检查
```bash
pnpm lint
```

---

## 🎮 游戏操作指南

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `1-9` | 填入数字 |
| `Backspace` / `Delete` / `0` | 清除数字 |
| `↑` `↓` `←` `→` | 移动选择 |

### 鼠标/触摸操作

| 操作 | 功能 |
|------|------|
| 点击单元格 | 选中/取消选中 |
| 点击操作按钮 | 执行对应功能 |

---

## 🏗️ 项目结构速览

```
├── app/                    # 页面路由
│   ├── page.tsx           # 首页
│   └── games/samurai/     # 游戏页面
│
├── components/sudoku/      # 游戏组件
│   ├── SamuraiBoard.tsx   # 棋盘
│   ├── Cell.tsx           # 单元格
│   ├── TimerDisplay.tsx   # 计时器
│   └── ActionBar.tsx      # 操作栏
│
├── lib/sudoku/            # 核心逻辑
│   ├── coordinates.ts     # 坐标系统
│   ├── engine.ts          # 游戏引擎
│   └── types.ts           # 类型定义
│
└── stores/                # 状态管理
    └── sudoku-store.ts    # Zustand store
```

---

## 🔍 测试坐标系统

坐标系统是整个项目的核心，已经过充分测试：

```bash
pnpm test:sudoku
```

**预期输出：**
```
✓ lib/sudoku/coordinates.test.ts (34 tests) 12ms
  ✓ Coordinate System (34)
    ✓ localToGlobal (6)
    ✓ globalToLocal (4)
    ✓ Overlap detection (5)
    ✓ Grid cells (3)
    ✓ Box cells (3)
    ✓ Row and Column cells (4)
    ✓ Affected cells (3)
    ✓ Validation (4)
    ✓ Position equality (2)

Test Files  1 passed (1)
Tests  34 passed (34)
```

---

## 🎨 主题切换

应用支持深浅色主题：

1. 打开浏览器开发者工具
2. 在 Console 中执行：
   ```javascript
   document.documentElement.classList.toggle('dark')
   ```
3. 或使用系统偏好设置

---

## 📱 响应式测试

在浏览器开发者工具中测试不同设备：

1. 打开 DevTools (F12)
2. 切换到设备模拟模式 (Ctrl/Cmd + Shift + M)
3. 测试不同屏幕尺寸：
   - 桌面 (1920×1080)
   - 平板 (768×1024)
   - 手机 (375×667)

---

## 🐛 常见问题

### 端口被占用
如果 3001 端口被占用，Next.js 会自动尝试下一个端口。

### 样式没有生效
1. 确保 Tailwind 配置正确
2. 重启开发服务器：
   ```bash
   Ctrl+C
   pnpm dev
   ```

### 测试失败
1. 确保依赖已安装：
   ```bash
   pnpm install
   ```
2. 清除缓存并重试：
   ```bash
   rm -rf node_modules .next
   pnpm install
   pnpm test:sudoku
   ```

---

## 📚 下一步

查看完整文档：
- [README.md](./README.md) - 项目概览
- [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) - 开发进度

---

**开发服务器**: http://localhost:3001 ✅
**状态**: 运行中 🟢
**阶段**: Phase 1 完成 ✅
