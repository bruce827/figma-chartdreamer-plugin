# 📝 开发错误记录 - 2025年8月11日

## 会话概述
- **日期**: 2025-08-11
- **项目**: ChartDreamer Figma Plugin
- **开发阶段**: 第一阶段 - 项目初始化和环境配置
- **主要任务**: 项目搭建、Hello React Component、代码规范配置

---

## 🐛 错误记录和解决方案

### 错误 1: 模板名称错误
**时间**: 项目初始化阶段
**错误描述**: 
使用错误的模板名称尝试创建项目
```bash
npm create figma-plugin@latest figma-chartdreamer -- --yes --template react-rect
```

**错误信息**:
```
error Template must be one of "plugin/hello-world", "plugin/preact-rectangles", ...
```

**根本原因**: 
- 没有先了解可用的模板选项
- 模板名称需要包含前缀 `plugin/` 或 `widget/`

**解决方案**:
使用正确的模板名称：
```bash
npm create figma-plugin@latest figma-chartdreamer -- --yes --template plugin/react-editor
```

**经验教训**: 
- 使用新工具前应先查看文档了解可用选项
- 注意命令行工具的错误提示，通常会列出有效选项

---

### 错误 2: Text 组件属性错误
**时间**: 实现 Hello React Component 时
**错误描述**:
错误地使用了不存在的 Text 组件属性 `bold` 和 `muted`
```tsx
<Text align="center" bold>  // ❌ 错误
<Text align="center" muted> // ❌ 错误
```

**错误信息**:
```
TypeScript error: Property 'bold' does not exist on type...
TypeScript error: Property 'muted' does not exist on type...
```

**根本原因**:
- 假设了组件API而没有查看实际的类型定义
- 混淆了不同UI库的API（可能受React Native或其他库影响）

**解决方案**:
使用独立的 Bold 和 Muted 组件：
```tsx
import { Bold, Muted } from '@create-figma-plugin/ui'

<Text align="center">
  <Bold>🎨 ChartDreamer Plugin</Bold>  // ✅ 正确
</Text>

<Text align="center">
  <Muted>点击按钮在 Figma 中显示通知</Muted>  // ✅ 正确
</Text>
```

**经验教训**:
- 使用新的组件库时应先查看其文档或类型定义
- TypeScript 的类型检查能帮助快速发现API使用错误

---

### 错误 3: ESLint 配置格式问题
**时间**: 配置代码规范时
**错误描述**:
创建了旧格式的 `.eslintrc.json` 配置文件，但 ESLint 9.x 需要新格式

**错误信息**:
```
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
From ESLint v9.0.0, the default configuration file is now eslint.config.js.
```

**根本原因**:
- ESLint 9.0 改变了配置文件格式
- 没有注意到版本变化带来的破坏性更新

**解决方案**:
1. 删除旧格式配置文件 `.eslintrc.json`
2. 创建新格式配置文件 `eslint.config.mjs`：
```javascript
export default [
  // 新格式使用数组导出配置
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    // ... 配置项
  }
]
```

**经验教训**:
- 安装新版本工具时要注意查看迁移指南
- 错误信息通常包含有用的链接和解决方案

---

### 错误 4: Preact JSX pragma 警告
**时间**: 运行 ESLint 时
**错误描述**:
ESLint 报告 `h` 被导入但未使用

**错误信息**:
```
'h' is defined but never used. Allowed unused vars must match /^_/u
```

**根本原因**:
- Preact 使用 `h` 作为 JSX 工厂函数
- 虽然代码中看不到显式使用，但 JSX 会被转译为 `h()` 调用
- ESLint 不知道这个隐式使用

**解决方案**:
方案1: 添加 JSX pragma 注释
```tsx
/** @jsx h */
import { h } from 'preact'
```

方案2: 在 ESLint 配置中忽略 `h` 变量
```javascript
'@typescript-eslint/no-unused-vars': [
  'warn',
  {
    varsIgnorePattern: '^_|^h$'  // 忽略 h 变量
  }
]
```

**经验教训**:
- JSX 的工作原理需要理解（会被转译）
- 不同的框架（React vs Preact）有不同的 JSX 处理方式

---

### 错误 5: PowerShell 命令语法错误
**时间**: 查看项目结构时
**错误描述**:
使用了 Bash 风格的命令连接符 `&&`

```powershell
cd figma-chartdreamer && dir  # ❌ PowerShell 不支持 &&
```

**错误信息**:
```
标记"&&"不是此版本中的有效语句分隔符。
```

**根本原因**:
- 混淆了不同 Shell 的语法
- PowerShell 使用分号 `;` 而不是 `&&`

**解决方案**:
使用 PowerShell 正确的语法：
```powershell
cd figma-chartdreamer; Get-ChildItem  # ✅ 正确
```

**经验教训**:
- 要注意用户使用的 Shell 类型（PowerShell vs Bash）
- 不同 Shell 有不同的命令和语法

---

## 📊 错误类型统计

| 错误类型 | 次数 | 严重程度 |
|---------|------|---------|
| API 使用错误 | 2 | 中 |
| 工具版本兼容性 | 1 | 中 |
| 框架特定知识 | 1 | 低 |
| Shell 语法错误 | 1 | 低 |

---

## 🎯 改进措施

### 1. 使用新工具前的准备
- ✅ 先查看官方文档
- ✅ 了解可用的选项和参数
- ✅ 查看版本更新日志

### 2. TypeScript 和类型系统
- ✅ 充分利用 TypeScript 的类型检查
- ✅ 查看组件的类型定义了解可用属性
- ✅ 使用 IDE 的智能提示功能

### 3. 工具版本管理
- ✅ 注意主版本更新（如 ESLint 8 → 9）
- ✅ 查看迁移指南
- ✅ 理解破坏性变更

### 4. 框架特定知识
- ✅ 理解 Preact vs React 的差异
- ✅ 了解 JSX 转译原理
- ✅ 掌握框架特定的最佳实践

### 5. 跨平台开发
- ✅ 识别用户的操作系统和 Shell
- ✅ 使用对应平台的正确命令
- ✅ 提供跨平台兼容的解决方案

---

## 💡 关键学习点

1. **create-figma-plugin 框架特点**:
   - 使用 Preact 而非 React（更轻量）
   - 自己的 UI 组件库系统
   - 特定的消息通信模式（emit/once）

2. **现代前端工具链**:
   - ESLint 9 使用新的配置格式
   - 工具版本升级可能带来破坏性变更
   - TypeScript 配置的重要性

3. **Figma 插件架构**:
   - 双线程模型（主线程 + UI 线程）
   - 消息通信机制
   - 开发和调试流程

---

## 📝 备注

本次会话虽然遇到了一些错误，但都是常见的开发问题，通过：
- 仔细阅读错误信息
- 查看相关文档
- 理解底层原理

都能够快速解决。这些经验将有助于后续开发的顺利进行。

---

> 记录人：AI Assistant  
> 记录时间：2025-08-11 23:17  
> 下次会话重点：开始第二阶段 MVP 核心功能实现
