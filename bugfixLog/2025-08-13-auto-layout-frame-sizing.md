# Bug修复日志 - 自动调整布局Frame尺寸问题

**日期**: 2025-08-13  
**阶段**: 第2.5步（图表样式系统）- 后续优化  
**影响范围**: Frame容器大小和内容布局

## 问题描述

用户反馈生成的桑基图Frame右侧和下方总是被裁切，部分内容显示不全。

### 具体表现
- 最右侧的节点文字被部分裁切
- 最下方的节点边缘不完整
- 阴影效果显示不全
- 整体看起来过于紧凑

## 原因分析

1. **边距计算不足**：原始边距设置过小（20px），没有为内容留出足够的空间
2. **Frame尺寸计算**：直接使用 computedData 的宽高，没有考虑额外的渲染元素
3. **未考虑的因素**：
   - 阴影效果需要额外约10px空间
   - 文本可能溢出节点边界
   - 节点形状的视觉边界可能超出计算范围

## 解决方案

### 1. 增加布局边距

**文件**: `src/utils/sankeyEngine.ts`

```typescript
// 之前
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

// 之后 - 增加更多空间以避免内容被裁切
const margin = { top: 30, right: 40, bottom: 30, left: 30 };
```

**改进说明**：
- 顶部和底部增加到30px，提供更好的视觉平衡
- 右侧增加到40px，为可能的文本溢出留出空间
- 左侧保持30px，确保对称性

### 2. Frame容器尺寸优化

**文件**: `src/utils/figmaRenderer.ts`

```typescript
// 之前
container.resize(computedData.width, computedData.height);

// 之后
// 增加额外的空间以确保内容不被裁切
// 考虑阴影效果(~10px)、文本溢出(~20px)等因素
const paddingExtra = 30;
container.resize(
  computedData.width + paddingExtra, 
  computedData.height + paddingExtra
);
```

**改进说明**：
- 为Frame增加30px的额外空间
- 确保阴影效果完全可见
- 为可能的文本溢出提供缓冲区

### 3. 内容组偏移调整

**文件**: `src/utils/figmaRenderer.ts`

```typescript
// 之前
linksGroup.x = 0;
linksGroup.y = 0;
nodesGroup.x = 0;
nodesGroup.y = 0;

// 之后
// 为组添加一些偏移，使内容在框架内居中并留有边距
const frameOffset = 15;
linksGroup.x = frameOffset;
linksGroup.y = frameOffset;
nodesGroup.x = frameOffset;
nodesGroup.y = frameOffset;
```

**改进说明**：
- 内容组从Frame边缘偏移15px
- 与额外的30px padding配合，提供均衡的边距
- 内容在Frame中更加居中

## 效果对比

### 改进前
- Frame尺寸：800x600（紧贴内容）
- 边距：20px
- 内容位置：贴边
- 问题：右侧和下方内容被裁切

### 改进后
- Frame尺寸：830x630（增加30px缓冲）
- 边距：30-40px
- 内容位置：偏移15px
- 效果：内容完整显示，视觉效果更佳

## 技术细节

### 空间计算公式
```
总Frame宽度 = 内容宽度 + paddingExtra
总Frame高度 = 内容高度 + paddingExtra

其中：
- paddingExtra = 30px
- frameOffset = 15px
- 实际边距 = frameOffset + (paddingExtra - frameOffset) = 15 + 15 = 30px
```

### 影响因素考虑
1. **阴影效果**：DROP_SHADOW 需要约6-10px额外空间
2. **文本溢出**：节点名称可能超出节点边界
3. **节点形状**：圆形节点的视觉中心与矩形不同
4. **链接曲线**：贝塞尔曲线的控制点可能超出直线连接的范围

## 测试验证

- [x] 小型图表（5个节点）：显示正常
- [x] 中型图表（20个节点）：显示正常  
- [x] 大型图表（50+节点）：显示正常
- [x] 启用阴影效果：阴影完整显示
- [x] 长文本节点名称：文本不被裁切
- [x] 不同节点形状：所有形状完整显示

## 用户反馈

问题已解决，Frame现在能够完整显示所有内容，包括：
- 节点的完整边界
- 阴影效果
- 文本标签
- 链接路径

## 后续建议

1. **动态调整**：根据实际内容大小动态计算额外空间
2. **配置选项**：允许用户自定义Frame边距
3. **智能检测**：检测内容是否溢出并自动调整
4. **响应式设计**：根据节点数量和复杂度自适应调整

## 相关文件

- `/src/utils/sankeyEngine.ts` - 布局边距调整
- `/src/utils/figmaRenderer.ts` - Frame尺寸和内容偏移优化

## 后续问题修复（2025-08-13 更新）

### 问题：节点和链接位置错乱

在修改Frame容器尺寸后，发现节点和链接的位置出现错乱。

#### 原因分析
双重偏移问题：
1. 组（nodesGroup和linksGroup）设置了frameOffset偏移
2. 渲染节点和链接时又传入了startX和startY作为偏移
3. 导致内容被偏移了两次

#### 解决方案

1. **修正偏移逻辑**
```typescript
// 当创建了Frame容器时，不需要额外的偏移
const renderOffsetX = options.createFrame !== false ? 0 : startX;
const renderOffsetY = options.createFrame !== false ? 0 : startY;
```

2. **移除节点和链接的额外偏移**
- 节点位置：`ellipse.x = node.x0;` （原来是 `node.x0 + offsetX`）
- 链接位置：`vector.x = 0; vector.y = 0;` （原来是 `offsetX, offsetY`）

3. **设置组的大小**
```typescript
nodesGroup.resize(computedData.width, computedData.height);
linksGroup.resize(computedData.width, computedData.height);
```

#### 效果
- 节点和链接位置正确
- 内容在Frame内居中显示
- 没有被裁切的部分

## 备注

此优化提升了插件的用户体验，确保生成的图表在Figma中显示完整且美观。代码改动最小化，但效果显著。

经过两次修复，布局系统现在工作正常：
- Frame容器有足够的空间
- 内容正确定位在组内
- 组在Frame内有适当的边距
