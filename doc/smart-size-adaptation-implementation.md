# 智能尺寸适配功能实现文档

## 功能概述

**功能名称**: 智能尺寸适配 (Smart Size Adaptation)  
**功能描述**: 当用户在Figma中选中一个frame时，插件自动检测该frame的尺寸，并据此调整桑基图的绘制尺寸，实现完美适配。  
**优先级**: P0 (最高优先级)  
**状态**: 待开发  

---

## 功能需求分析

### 用户场景
1. 用户在Figma中选中一个已存在的frame
2. 用户打开ChartDreamer插件
3. 插件自动检测并显示选中frame的尺寸信息
4. 用户输入桑基图数据并配置样式
5. 点击生成后，桑基图按照选中frame的尺寸进行绘制
6. 生成的图表完美适配frame，无需手动调整

### 技术需求
- 实时检测Figma中选中的frame
- 获取frame的精确尺寸信息
- 根据frame尺寸动态调整桑基图布局
- 提供清晰的视觉反馈和状态提示

---

## 实现步骤详解

### 步骤1：修改类型定义 (`src/types/sankey.types.ts`)

**任务描述**: 在TypeScript类型定义中添加frame尺寸相关的接口和字段

**具体修改**:
- 在 `ChartConfig` 接口中添加 `useFrameSize: boolean` 字段
- 在 `ChartConfig` 接口中添加 `frameSize?: FrameSize` 字段
- 新增 `FrameSize` 接口定义：
  ```typescript
  export interface FrameSize {
    width: number;
    height: number;
    x: number;
    y: number;
  }
  ```

**验收标准**: 
- [ ] 类型定义文件编译通过
- [ ] 新增字段类型正确
- [ ] 向后兼容性保持

---

### 步骤2：修改主线程逻辑 (`src/main.ts`)

**任务描述**: 在主线程中添加frame尺寸检测逻辑，修改渲染调用

**具体修改**:
- 在 `GENERATE_SANKEY` 事件处理中添加frame尺寸检测
- 添加frame选择验证逻辑（确保选中的是frame类型）
- 修改 `renderSankeyToFigma` 调用，传入检测到的frame尺寸
- 添加frame检测失败的错误处理

**核心代码逻辑**:
```typescript
// 检测选中的frame
const selectedFrame = figma.currentPage.selection.find(
  node => node.type === 'FRAME'
) as FrameNode | undefined;

if (selectedFrame) {
  const frameSize = {
    width: selectedFrame.width,
    height: selectedFrame.height,
    x: selectedFrame.x,
    y: selectedFrame.y
  };
  // 使用frame尺寸进行渲染
} else {
  // 使用默认尺寸或提示用户选择frame
}
```

**验收标准**:
- [ ] frame检测逻辑正确
- [ ] 错误处理完善
- [ ] 渲染调用参数正确

---

### 步骤3：修改UI组件 (`src/ui.tsx`)

**任务描述**: 在UI中添加frame检测状态显示和尺寸信息展示

**具体修改**:
- 在生成按钮上方添加frame检测状态显示组件
- 添加frame尺寸信息展示（宽度x高度）
- 修改生成请求，包含frame尺寸信息
- 添加frame选择提示和引导

**UI组件设计**:
```typescript
// Frame检测状态组件
const FrameDetectionStatus = () => {
  const [frameInfo, setFrameInfo] = useState<FrameSize | null>(null);
  
  // 检测frame并更新状态
  useEffect(() => {
    // 发送检测请求到主线程
    emit<DetectFrameHandler>('DETECT_FRAME');
  }, []);
  
  return (
    <Container>
      {frameInfo ? (
        <Banner icon={<IconCheck16 />} variant="success">
          已检测到Frame: {frameInfo.width} × {frameInfo.height}
        </Banner>
      ) : (
        <Banner icon={<IconWarning16 />} variant="warning">
          请选择一个Frame以启用智能尺寸适配
        </Banner>
      )}
    </Container>
  );
};
```

**验收标准**:
- [ ] frame状态显示正确
- [ ] 尺寸信息展示清晰
- [ ] 用户引导友好

---

### 步骤4：修改渲染器 (`src/utils/figmaRenderer.ts`)

**任务描述**: 修改渲染函数，支持根据frame尺寸动态调整图表绘制

**具体修改**:
- 修改 `renderSankeyToFigma` 函数签名，支持frame尺寸参数
- 根据传入的frame尺寸调整图表绘制比例
- 实现智能布局算法，确保图表在frame内完美适配
- 添加边距和缩放计算逻辑

**核心算法**:
```typescript
export async function renderSankeyToFigma(
  computedData: ComputedSankeyData,
  config: ChartConfig,
  options: RenderOptions & { frameSize?: FrameSize }
) {
  let targetWidth = options.width || 800;
  let targetHeight = options.height || 600;
  
  if (options.frameSize) {
    // 根据frame尺寸计算最佳图表尺寸
    const { width: frameWidth, height: frameHeight } = options.frameSize;
    const margin = 40; // 边距
    
    targetWidth = frameWidth - margin * 2;
    targetHeight = frameHeight - margin * 2;
    
    // 保持宽高比
    const aspectRatio = computedData.width / computedData.height;
    if (targetWidth / targetHeight > aspectRatio) {
      targetWidth = targetHeight * aspectRatio;
    } else {
      targetHeight = targetWidth / aspectRatio;
    }
  }
  
  // 使用计算后的尺寸进行渲染
  // ... 渲染逻辑
}
```

**验收标准**:
- [ ] 尺寸计算正确
- [ ] 图表适配frame
- [ ] 边距设置合理

---

### 步骤5：更新处理器 (`src/handlers/handlers.ts`)

**任务描述**: 修改事件处理器类型定义，支持frame尺寸信息传递

**具体修改**:
- 修改 `GenerateSankeyRequest` 类型，包含frame尺寸信息
- 新增 `DetectFrameHandler` 处理器，用于frame检测
- 更新相关的事件类型定义

**类型定义更新**:
```typescript
export interface GenerateSankeyRequest {
  data: string;
  format: DataFormat;
  config: ChartConfig;
  frameSize?: FrameSize; // 新增字段
}

export interface DetectFrameHandler {
  name: 'DETECT_FRAME';
  handler: () => void;
}

export interface FrameDetectedHandler {
  name: 'FRAME_DETECTED';
  handler: (frameSize: FrameSize | null) => void;
}
```

**验收标准**:
- [ ] 类型定义完整
- [ ] 事件处理器正确
- [ ] 数据传递正常

---

## 测试计划

### 单元测试
- [ ] Frame检测逻辑测试
- [ ] 尺寸计算算法测试
- [ ] 类型定义测试

### 集成测试
- [ ] UI与主线程通信测试
- [ ] 渲染器尺寸适配测试
- [ ] 完整流程测试

### 用户验收测试
- [ ] 选择不同尺寸frame的适配效果
- [ ] 无frame选择时的降级处理
- [ ] 用户体验流畅性测试

---

## 风险评估

### 技术风险
- **Figma API限制**: 确保frame检测API的兼容性
- **性能影响**: 实时检测可能影响插件响应速度
- **尺寸计算精度**: 复杂布局的尺寸适配算法

### 缓解措施
- 添加API兼容性检查
- 实现检测结果缓存机制
- 使用成熟的数学库进行尺寸计算

---

## 验收标准

### 功能完整性
- [ ] 能够检测Figma中选中的frame
- [ ] 正确获取frame尺寸信息
- [ ] 桑基图按照frame尺寸进行绘制
- [ ] 图表在frame内完美适配

### 用户体验
- [ ] 提供清晰的frame检测状态反馈
- [ ] 显示准确的尺寸信息
- [ ] 操作流程简单直观
- [ ] 错误提示友好明确

### 技术质量
- [ ] 代码结构清晰，易于维护
- [ ] 类型定义完整，编译无错误
- [ ] 错误处理完善，边界情况覆盖
- [ ] 性能表现良好，无明显延迟

---

## 后续优化方向

1. **智能布局算法**: 根据frame形状自动选择最佳布局方向
2. **多frame支持**: 支持同时选择多个frame进行批量适配
3. **预设尺寸模板**: 提供常用的frame尺寸预设
4. **实时预览**: 在frame选择变化时实时预览适配效果

---

## 相关文档

- [项目路线图](./roadmap.md)
- [产品需求文档](./prd.md)
- [Figma插件开发指南](./figma-plugin-import-guide.md)
- [代码规范指南](./markdownlint-config-guide.md)

---

**文档版本**: v1.0  
**创建日期**: 2025-01-27  
**最后更新**: 2025-01-27  
**负责人**: AI助手  
**状态**: 待实施 