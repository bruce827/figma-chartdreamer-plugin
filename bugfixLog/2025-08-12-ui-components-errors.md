# Bug修复日志 - UI组件构建错误

**日期**: 2025-08-12  
**阶段**: 第2.1步 - 构建UI组件（Build UI Components with Preact）  
**影响范围**: 所有UI组件的TypeScript编译

## 问题描述

在构建UI组件时遇到多个TypeScript编译错误，主要涉及：

1. JSX Fragment配置问题
2. 组件属性类型不匹配
3. 不支持的组件属性

## 错误详情

### 1. JSX Fragment错误

```
error TS17016: The 'jsxFragmentFactory' compiler option must be provided to use JSX fragments with the 'jsxFactory' compiler option.
```

**出现位置**:
- `ChartConfig.tsx`: 第108行
- `DataInput.tsx`: 第105行  
- `ui.tsx`: 第134, 144, 194行

### 2. 事件处理器类型错误

```
error TS2322: Type '(value: string) => void' is not assignable to type 'GenericEventHandler<HTMLInputElement>'
```

**出现位置**:
- `ChartConfig.tsx`: `SegmentedControl` 的 `onChange` 属性
- `DataInput.tsx`: `SegmentedControl` 的 `onChange` 属性

### 3. 不存在的组件属性

```
error TS2322: Property 'name' does not exist on type...
```

**出现位置**:
- `Textbox` 组件的 `name` 属性
- `TextboxMultiline` 组件的 `name` 属性
- `SegmentedControl` 组件的 `name` 属性
- `Dropdown` 组件的 `name` 属性

### 4. 不支持的属性

```
error TS2322: Property 'suffix' does not exist on type...
error TS2322: Property 'variant' does not exist on type...
```

**出现位置**:
- `Textbox` 组件的 `suffix` 属性（用于显示单位）
- `TextboxMultiline` 组件的 `variant` 属性（用于错误状态）

### 5. 导入错误

```
error TS2724: '@create-figma-plugin/ui' has no exported member named 'IconWarning32'
```

**实际导出**: `IconWarning16`

## 解决方案

### 1. 修复JSX Fragment配置

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "jsxFragmentFactory": "Fragment"
  }
}
```

**组件文件**:
```typescript
import { h, Fragment } from 'preact';
```

### 2. 修复事件处理器类型

将字符串参数改为事件对象：

```typescript
// 错误写法
const handleChange = useCallback((value: string) => {
  // ...
}, []);

// 正确写法
const handleChange = useCallback((event: any) => {
  const value = event.currentTarget.value;
  // ...
}, []);
```

### 3. 移除不支持的属性

移除所有 `name` 属性：
```typescript
// 错误
<Textbox name="nodeColor" ... />

// 正确
<Textbox ... />
```

### 4. 移除其他不支持的属性

- 移除 `Textbox` 的 `suffix` 属性
- 移除 `TextboxMultiline` 的 `variant` 属性

### 5. 修复图标导入

```typescript
// 错误
import { IconWarning32 } from '@create-figma-plugin/ui'

// 正确
import { IconWarning16 } from '@create-figma-plugin/ui'
```

## 根本原因分析

1. **API文档不准确**: 参考的组件属性可能基于旧版本或不同的UI库
2. **类型定义严格**: `@create-figma-plugin/ui` 的TypeScript类型定义非常严格
3. **Preact与React的差异**: 某些React模式在Preact中需要调整

## 预防措施

1. **查看类型定义**: 在使用组件前，先查看其TypeScript类型定义
2. **渐进式开发**: 先实现基础功能，再添加高级特性
3. **频繁构建测试**: 每添加一个组件就运行 `npm run build` 测试
4. **参考官方示例**: 优先参考 create-figma-plugin 的官方示例代码

## 学到的经验

1. **组件API限制**: `@create-figma-plugin/ui` 组件的API比较简洁，不支持很多HTML原生属性
2. **事件处理模式**: 事件处理器接收的是事件对象，不是直接的值
3. **Fragment使用**: 在Preact中使用Fragment需要正确配置和导入
4. **类型安全优先**: 虽然可以使用 `any` 类型绕过错误，但最好理解并修复类型问题

## 影响的文件

- `/src/components/ChartConfig.tsx`
- `/src/components/DataInput.tsx`
- `/src/components/ExampleSelector.tsx`
- `/src/ui.tsx`
- `/tsconfig.json`

## 修复状态

✅ **已完全修复** - 所有组件成功编译，`npm run build` 执行成功

## 相关命令

```bash
# 构建命令
npm run build

# 监视模式（开发时使用）
npm run watch
```
