# 🔍 ChartDreamer 插件开发 Bug 自查清单

> 本文档基于项目开发过程中的错误日志总结，用于编码过程中的bug预防和自查

## 📋 一、TypeScript 和类型相关

### ✅ 组件属性检查
- [ ] **使用前查看类型定义**：使用新组件前先查看其 TypeScript 类型定义，了解可用属性
- [ ] **不要假设API**：不要假设组件有某个属性，要实际验证
- [ ] **正确的事件处理器类型**：事件处理器接收的是事件对象，不是直接的值
  ```typescript
  // ❌ 错误
  onChange={(value: string) => {}}
  // ✅ 正确
  onChange={(event: any) => { const value = event.currentTarget.value }}
  ```

### ✅ 图标和UI组件
- [ ] **检查图标尺寸可用性**：不是所有图标都有16/24/32等所有尺寸
  - 常见错误：`IconChevronUp16` 不存在，只有 `IconChevronUp24`
  - 解决方案：使用文本符号（▲▼）或可用的图标尺寸
- [ ] **组件特定属性**：
  - `Text` 组件没有 `bold` 和 `muted` 属性，使用独立的 `<Bold>` 和 `<Muted>` 组件
  - `Textbox` 等输入组件可能不支持 `name`、`suffix`、`variant` 等属性
  - `SegmentedControl` 和 `Dropdown` 的事件处理要注意类型

### ✅ JSX Fragment 配置
- [ ] **Fragment 导入和配置**：
  ```typescript
  // tsconfig.json
  "jsxFragmentFactory": "Fragment"
  
  // 组件文件
  import { h, Fragment } from 'preact';
  ```
- [ ] **Preact 特有配置**：记住项目使用 Preact 而非 React

## 📦 二、模块和构建相关

### ✅ NPM 包和类型定义
- [ ] **安装类型定义**：使用第三方库时记得安装 `@types/*` 包
  ```bash
  npm i --save-dev @types/d3-sankey @types/d3-array @types/d3-shape
  ```
- [ ] **模板名称正确性**：使用 create-figma-plugin 时注意模板名称格式
  - 正确格式：`plugin/react-editor`、`widget/preact-rectangles`
  - 需要包含前缀 `plugin/` 或 `widget/`

### ✅ ESLint 配置
- [ ] **版本兼容性**：ESLint 9.x 使用新配置格式 `eslint.config.mjs`
- [ ] **Preact JSX pragma**：处理 `h` 未使用的警告
  ```javascript
  // ESLint 配置
  varsIgnorePattern: '^_|^h$'
  ```

### ✅ esbuild 构建配置
- [ ] **构建配置文件**：创建 `build-figma-plugin.main.js` 和 `build-figma-plugin.ui.js`
- [ ] **模块解析配置**：
  ```javascript
  mainFields: ['module', 'main'],
  platform: 'neutral'
  ```

## 🎨 三、Figma API 使用

### ✅ 颜色格式
- [ ] **RGB 格式**：Figma 使用 0-1 范围的 RGB 值，不是 0-255
  ```typescript
  function hexToRGB(hex: string): RGB {
    const r = parseInt(hex.substring(0, 2), 16) / 255; // 注意除以255
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  }
  ```

### ✅ 字体加载
- [ ] **异步加载字体**：使用前必须先加载
  ```typescript
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  ```

### ✅ 渐变和复杂样式
- [ ] **API 限制**：
  - 使用 `gradientTransform` 而不是 `gradientHandlePositions`
  - 渐变色需要 RGBA 格式（包含 alpha 通道）
  - 复杂渐变可能需要简化实现

### ✅ 路径和向量
- [ ] **SVG 路径格式**：确保路径字符串符合标准 SVG 格式
- [ ] **文本对齐**：正确设置 `textAlignHorizontal` 和 `textAlignVertical`

## 📐 四、布局和渲染

### ✅ Frame 尺寸和边距
- [ ] **足够的边距**：避免内容被裁切
  - 建议边距：top: 30, right: 40, bottom: 30, left: 30
  - Frame 额外空间：增加 30px paddingExtra
- [ ] **考虑额外元素**：
  - 阴影效果需要约 10px 额外空间
  - 文本可能溢出节点边界
  - 贝塞尔曲线控制点可能超出范围

### ✅ 坐标和偏移
- [ ] **避免双重偏移**：注意组偏移和元素偏移不要重复计算
- [ ] **正确的渲染偏移逻辑**：
  ```typescript
  const renderOffsetX = options.createFrame !== false ? 0 : startX;
  const renderOffsetY = options.createFrame !== false ? 0 : startY;
  ```

## 🔄 五、数据处理

### ✅ D3 集成
- [ ] **类型泛型处理**：复杂泛型可以使用 `any` 作为逃生舱
  ```typescript
  const sankeyGenerator = sankey<any, any>()
  ```
- [ ] **节点自动提取**：从链接数据中正确提取节点
- [ ] **数据结构匹配**：确保节点和链接的数据结构正确匹配

### ✅ 数据验证
- [ ] **格式验证**：JSON/CSV/TSV 格式实时验证
- [ ] **必需字段检查**：
  - JSON: 需要 nodes 和 links
  - CSV/TSV: 需要 source, target, value 列
- [ ] **数值有效性**：value 必须是正数

## ⚡ 六、性能优化

### ✅ React/Preact 优化
- [ ] **防抖处理**：输入验证使用防抖（建议 300-500ms）
- [ ] **React.memo**：防止不必要的重渲染
- [ ] **useMemo/useCallback**：缓存计算结果和回调函数

### ✅ 大数据处理
- [ ] **数据量限制**：
  - \>100 项显示性能警告
  - \>500 项显示严重警告
- [ ] **批量操作**：避免在循环中创建大量临时对象
- [ ] **内存管理**：渲染完成后释放计算数据

## 💾 七、存储和持久化

### ✅ 客户端存储
- [ ] **使用 StorageManager**：统一管理存储操作
- [ ] **存储键命名**：使用常量定义存储键
- [ ] **主线程处理**：存储操作在主线程执行（figma.clientStorage）

### ✅ 历史记录
- [ ] **限制数量**：保留最近 10 条记录
- [ ] **数据结构完整**：包含时间戳、配置、数据等完整信息
- [ ] **错误处理**：处理存储读写失败的情况

## 🛠️ 八、跨平台和环境

### ✅ Shell 命令兼容性
- [ ] **识别 Shell 类型**：PowerShell vs Bash
  - PowerShell 使用 `;` 而不是 `&&`
  - 命令可能不同（`dir` vs `ls`）
- [ ] **跨平台路径**：注意 Windows 和 Unix 路径差异

### ✅ 环境配置
- [ ] **Node 版本**：确保使用兼容的 Node.js 版本
- [ ] **依赖版本**：注意主版本更新的破坏性变更

## 🎯 九、用户体验

### ✅ 错误提示
- [ ] **友好的错误信息**：提供具体的错误描述和修复建议
- [ ] **视觉反馈**：使用颜色、图标区分不同状态
- [ ] **分层错误处理**：本地验证错误 vs 服务器错误

### ✅ 加载和反馈
- [ ] **加载状态**：显示 loading 指示器
- [ ] **成功/失败提示**：使用 Banner 或 Toast 提示
- [ ] **自动消失**：提示信息 3-5 秒后自动消失

## 📝 十、代码质量

### ✅ 命名和注释
- [ ] **清晰的变量名**：避免单字母变量（除了循环索引）
- [ ] **类型注解**：为复杂类型添加明确的类型定义
- [ ] **关键逻辑注释**：为复杂算法添加解释性注释

### ✅ 错误处理
- [ ] **try-catch 包裹**：异步操作使用 try-catch
- [ ] **空值检查**：处理可能的 null/undefined
- [ ] **边界条件**：处理空数组、零值等边界情况

## 🔧 调试技巧

1. **充分利用 TypeScript**：让类型系统帮助发现错误
2. **频繁构建测试**：每个小改动后运行 `npm run build`
3. **查看控制台**：Figma 插件的 console.log 输出在开发者工具中
4. **使用断点调试**：在浏览器开发者工具中设置断点
5. **保留错误日志**：记录和总结遇到的问题

## 📚 常见错误速查

| 错误类型 | 常见原因 | 快速解决 |
|---------|---------|---------|
| 组件属性不存在 | API 假设错误 | 查看类型定义 |
| 图标导入失败 | 尺寸不存在 | 使用可用尺寸或文本符号 |
| 类型不匹配 | 事件处理器类型错误 | 使用正确的事件对象 |
| 构建失败 | 模块解析问题 | 配置 esbuild |
| 渲染被裁切 | 边距不足 | 增加 Frame padding |
| 颜色显示错误 | RGB 格式问题 | 使用 0-1 范围 |
| 字体错误 | 未加载字体 | 先 loadFontAsync |
| 数据验证失败 | 格式或字段问题 | 检查必需字段 |

---

💡 **提示**：将此清单作为开发时的参考，可以大大减少调试时间和提高代码质量！

📅 **更新日期**：2025-08-14  
🔄 **版本**：v1.0.0
