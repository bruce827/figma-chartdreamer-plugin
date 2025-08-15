# Bug修复日志 - D3集成与Figma渲染

**日期**: 2025-08-12  
**阶段**: 第2.3步（D3集成）和第2.4步（渲染引擎）  
**影响范围**: D3-sankey库集成和Figma API渲染

## 第2.3步：D3集成问题

### 问题1：D3-sankey模块解析失败

#### 错误描述
```
error TS7016: Could not find a declaration file for module 'd3-sankey'
```

#### 解决方案
安装TypeScript类型定义：
```bash
npm i --save-dev @types/d3-sankey @types/d3-array @types/d3-shape
```

### 问题2：D3类型定义冲突

#### 错误描述
```
error TS2430: Interface 'D3Link' incorrectly extends interface 'SankeyLinkMinimal<D3Node, {}>'
Types of property 'source' are incompatible.
```

#### 原因分析
d3-sankey的TypeScript定义使用了复杂的泛型约束，与我们自定义的接口产生冲突。

#### 解决方案
1. 简化类型定义，不直接继承D3的类型：
```typescript
// 之前（错误）
interface D3Node extends D3SankeyNode<{}, {}> { ... }
interface D3Link extends D3SankeyLink<D3Node, {}> { ... }

// 之后（正确）
interface D3Node {
  id: string;
  name: string;
  value: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  // 其他必要属性
}
```

2. 使用 `any` 类型作为泛型参数：
```typescript
const sankeyGenerator = sankey<any, any>()
```

### 问题3：esbuild无法解析d3-sankey模块

#### 错误描述
```
error esbuild error: Could not resolve "d3-sankey"
```

#### 原因分析
esbuild的默认配置可能无法正确解析某些npm包的入口点。

#### 解决方案
1. 创建构建配置文件 `build-figma-plugin.main.js`：
```javascript
module.exports = function (buildOptions) {
  return {
    ...buildOptions,
    mainFields: ['module', 'main'],
    platform: 'neutral',
    external: []
  }
}
```

2. 更新 `build-figma-plugin.ui.js` 添加相同配置

### 问题4：sankeyNodeAlign函数未定义

#### 错误描述
初始实现中使用了不存在的 `sankeyNodeAlign` 函数。

#### 解决方案
移除该函数，使用默认的节点对齐方式：
```typescript
// 移除自定义对齐函数
const sankeyGenerator = sankey<any, any>()
  .nodeId((d: any) => d.id)
  .nodeWidth(nodeWidth)
  .nodePadding(nodePadding)
  .extent([[margin.left, margin.top], [innerWidth, innerHeight]]);
// 不再调用 .nodeAlign()
```

## 第2.4步：Figma渲染问题

### 问题1：路径生成格式错误

#### 原因分析
Figma的 `vectorPaths` API需要特定的SVG路径格式。

#### 解决方案
确保路径字符串格式正确：
```typescript
function generateLinkPath(source: any, target: any, link: any): string {
  const path = [
    `M ${x0} ${sy0}`,  // 移动到起点
    `C ${cx} ${sy0} ${cx} ${ty0} ${x1} ${ty0}`,  // 贝塞尔曲线
    `L ${x1} ${ty1}`,  // 直线
    `C ${cx} ${ty1} ${cx} ${sy1} ${x0} ${sy1}`,  // 返回曲线
    `Z`  // 闭合路径
  ].join(' ');
  return path;
}
```

### 问题2：文本对齐问题

#### 原因分析
Figma的文本对齐需要正确设置 `textAlignHorizontal` 和 `textAlignVertical`。

#### 解决方案
```typescript
text.textAlignHorizontal = 'CENTER';
text.textAlignVertical = 'CENTER';
// 调整文本框大小和位置
text.resize(nodeWidth - 8, nodeHeight);
text.x = node.x0 + offsetX + 4;
text.y = node.y0 + offsetY + (nodeHeight - text.height) / 2;
```

### 问题3：字体加载异步问题

#### 原因分析
Figma需要异步加载字体才能使用。

#### 解决方案
在渲染前加载所需字体：
```typescript
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
await figma.loadFontAsync({ family: "Inter", style: "Medium" });
```

### 问题4：颜色格式转换

#### 原因分析
Figma API使用RGB格式（0-1范围），而我们的配置使用十六进制颜色。

#### 解决方案
创建颜色转换函数：
```typescript
function hexToRGB(hex: string): RGB {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return { r, g, b };
}
```

## 数据流程验证

### CSV/TSV解析问题

#### 原因分析
CSV解析需要正确处理节点的自动提取。

#### 解决方案
从链接数据中自动提取节点：
```typescript
const nodeSet = new Set<string>();
for (const link of links) {
  nodeSet.add(link.source);
  nodeSet.add(link.target);
}
const nodes = Array.from(nodeSet).map(id => ({
  id,
  name: id,
  value: 0  // D3会自动计算
}));
```

## 性能优化

### 大数据集渲染

#### 建议
- 限制最大节点数和链接数
- 使用分组（Frame）管理图层
- 批量创建和添加节点

### 内存管理

#### 建议
- 避免在循环中创建大量临时对象
- 使用 `console.log` 时注意清理调试信息
- 渲染完成后释放计算数据

## 学到的经验

1. **TypeScript类型系统**：
   - 复杂的泛型继承可能导致类型冲突
   - 使用 `any` 类型作为逃生舱口是可以接受的
   - 接口定义应该保持简单和实用

2. **模块打包**：
   - esbuild需要正确配置才能处理某些npm包
   - `mainFields` 配置很重要
   - 构建配置文件提供了灵活性

3. **Figma API**：
   - 所有UI操作都是异步的
   - 颜色使用0-1的RGB值
   - 路径需要标准的SVG格式
   - 字体必须先加载才能使用

4. **D3集成**：
   - d3-sankey提供了强大的布局算法
   - 节点和链接的数据结构需要正确匹配
   - 布局计算是同步的，但渲染应该是异步的

## 成功标志

✅ D3-sankey成功集成并计算布局  
✅ 节点位置（x0, x1, y0, y1）正确计算  
✅ 链接宽度和路径正确生成  
✅ Figma成功渲染节点、链接和文本  
✅ 支持JSON/CSV/TSV三种数据格式  
✅ 颜色配置和主题切换正常工作  
✅ 生成的图表可以在Figma中正常显示和编辑

## 后续改进建议

1. **错误处理**：
   - 添加更详细的错误信息
   - 提供数据格式示例
   - 验证颜色格式

2. **性能优化**：
   - 实现虚拟化渲染
   - 添加进度条
   - 支持取消操作

3. **功能增强**：
   - 支持更多节点形状
   - 添加动画效果
   - 支持导出配置

## 相关文件

- `/src/utils/sankeyEngine.ts` - D3计算引擎
- `/src/utils/figmaRenderer.ts` - Figma渲染引擎
- `/src/main.ts` - 主线程集成
- `/build-figma-plugin.main.js` - 主线程构建配置
- `/build-figma-plugin.ui.js` - UI构建配置
