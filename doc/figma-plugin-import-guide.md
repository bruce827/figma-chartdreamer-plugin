# 📦 Figma 插件导入和测试指南

> 最后更新：2025-08-11
> 适用于：ChartDreamer 插件开发

## 🎯 快速开始

本文档说明如何在 Figma 桌面应用中导入和测试本地开发的插件。

---

## 📍 Step 1: 准备工作

### 构建插件
在终端中运行：
```bash
npm run build
```

### 获取 manifest.json 路径
Windows 路径示例：
```
C:\Users\Administrator\Desktop\github上的项目\figma-chartdreamer-plugin\figma-chartdreamer\manifest.json
```

---

## 📱 Step 2: 在 Figma 中导入插件

### 方法一：使用快捷键（推荐）

1. **打开 Figma 桌面应用**
   - ⚠️ 注意：必须使用桌面版，网页版不支持本地插件开发

2. **创建或打开任意设计文件**
   - 可以新建一个空白文件
   - 或打开已有的设计文件

3. **打开快速操作菜单**
   - Windows: 按 `Ctrl + /`
   - Mac: 按 `Cmd + /`

4. **搜索导入命令**
   - 英文版输入：`Import plugin from manifest`
   - 中文版输入：`从清单导入插件`

5. **选择 manifest.json 文件**
   - 在弹出的文件选择器中，导航到项目的 `figma-chartdreamer` 文件夹
   - 选择 `manifest.json` 文件
   - 点击"打开"

### 方法二：使用菜单

1. 在 Figma 中点击左上角 **菜单图标** (☰)
2. 选择 **Plugins** → **Development** → **Import plugin from manifest...**
3. 选择你的 `manifest.json` 文件

---

## 🚀 Step 3: 运行插件

导入成功后，有多种方式运行插件：

### 使用快捷键运行（最快）
1. 按 `Ctrl + /` (Windows) 或 `Cmd + /` (Mac)
2. 输入插件名称：`ChartDreamer`
3. 按回车运行

### 使用菜单运行
- 点击菜单 **Plugins** → **Development** → **ChartDreamer**

### 使用右键菜单
- 在画布上右键
- 选择 **Plugins** → **Development** → **ChartDreamer**

---

## ✅ Step 4: 测试插件功能

### 验证插件界面

插件运行后应该显示：
- **标题**：🎨 ChartDreamer Plugin
- **欢迎文字**：欢迎使用 ChartDreamer！
- **测试按钮**：点击测试 Hello React Component

### 测试通信功能

1. 点击"点击测试 Hello React Component"按钮
2. 应该在 Figma 右下角看到绿色通知：
   ```
   ✅ React component is running!
   ```
3. 这证明 UI 与主线程通信正常

---

## 🔄 开发时的便捷操作

### 热重载开发流程

1. **启动监视模式**
   ```bash
   npm run watch
   ```
   这会自动监视文件变化并重新构建

2. **修改代码后重新加载**
   - 代码会自动重新构建
   - 在 Figma 中按快捷键重新加载：
     - Windows: `Ctrl + Alt + P`
     - Mac: `Cmd + Option + P`
   - 插件会重新运行，加载最新代码

### 查看控制台日志

用于调试 `console.log` 输出：

1. 按 `Ctrl + /` 或 `Cmd + /`
2. 搜索并运行：
   - 英文版：`Show/Hide Console`
   - 中文版：`显示/隐藏控制台`
3. 控制台会显示在底部，可以看到所有日志输出

---

## 🛠️ 常见问题解决

### 问题 1：找不到 "Import plugin from manifest"

**原因**：使用了网页版 Figma
**解决**：
- 必须使用 **Figma 桌面版**
- 下载地址：https://www.figma.com/downloads/

### 问题 2：插件导入后没反应

**可能原因及解决方案**：
1. 检查 `manifest.json` 是否存在
2. 确认已运行 `npm run build`
3. 查看控制台是否有错误信息
4. 尝试重启 Figma

### 问题 3：代码修改后没更新

**解决步骤**：
1. 确保 `npm run watch` 正在运行
2. 等待终端显示构建完成
3. 使用 `Ctrl + Alt + P` 重新加载插件
4. 如果还不行，关闭插件窗口并重新运行

### 问题 4：插件窗口太小/太大

**调整方法**：
- 在 `main.ts` 中修改 `showUI` 参数：
  ```typescript
  showUI({ 
    height: 300,  // 调整高度
    width: 320,   // 调整宽度
    title: 'ChartDreamer' 
  })
  ```

---

## ⌨️ 快捷键总结

| 操作 | Windows | Mac | 说明 |
|-----|---------|-----|------|
| 快速操作菜单 | `Ctrl + /` | `Cmd + /` | 搜索并运行命令 |
| 重新运行插件 | `Ctrl + Alt + P` | `Cmd + Option + P` | 快速重载插件 |
| 关闭插件 | `Esc` | `Esc` | 关闭插件窗口 |
| 撤销操作 | `Ctrl + Z` | `Cmd + Z` | 撤销 Figma 操作 |

---

## 💡 开发小技巧

### 1. 固定插件到收藏

- 运行插件后，点击插件窗口标题栏的星号 ⭐
- 之后可以快速从收藏中运行
- 适合频繁测试的插件

### 2. 使用最近运行

- Figma 会记住最近运行的插件
- 通过 `Ctrl + /` 可以快速找到最近使用的插件
- 通常会出现在搜索结果顶部

### 3. 多窗口开发

- 可以同时打开多个 Figma 文件测试
- 每个文件可以独立运行插件实例
- 适合测试不同场景

### 4. 保持控制台开启

开发时建议始终开启控制台：
- 可以实时看到错误信息
- 方便调试 console.log 输出
- 监控插件性能

### 5. 使用开发文件

创建专门的测试文件：
- 准备各种测试场景
- 保存常用的测试数据
- 方便回归测试

---

## 📊 插件生命周期

了解插件的生命周期有助于调试：

1. **导入阶段**：Figma 读取 manifest.json
2. **运行阶段**：执行 main.ts 中的默认函数
3. **UI 加载**：创建 iframe 并加载 ui.js
4. **交互阶段**：UI 与主线程通过消息通信
5. **关闭阶段**：清理资源，关闭 iframe

---

## 🔍 调试技巧

### 主线程调试

在 `main.ts` 中：
```typescript
// 使用 console.log 调试
console.log('插件已启动')

// 查看 Figma API 对象
console.log('当前页面:', figma.currentPage)
```

### UI 线程调试

在 `ui.tsx` 中：
```typescript
// 调试状态变化
console.log('按钮被点击')

// 调试消息发送
console.log('发送消息:', messageData)
```

### 性能调试

```typescript
// 测量执行时间
console.time('操作名称')
// ... 执行操作
console.timeEnd('操作名称')
```

---

## 📚 相关资源

- [Figma 插件 API 文档](https://www.figma.com/plugin-docs/)
- [Create Figma Plugin 文档](https://yuanqing.github.io/create-figma-plugin/)
- [Figma 插件示例](https://github.com/figma/plugin-samples)
- [项目 GitHub 仓库](https://github.com/yourusername/figma-chartdreamer-plugin)

---

## 📝 笔记区

在这里记录你的开发笔记和遇到的问题：

```
// 示例笔记
- 2025-08-11: 成功导入插件并测试通信功能
- TODO: 实现数据输入界面
- BUG: 某些情况下通知不显示（已修复）
```

---

> 💡 提示：将此文档保存在项目中，方便随时查阅和更新。
