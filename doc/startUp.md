# 快速开始

## 文档目的

本文档为AI助手提供项目开发的快速开始指南，确保AI在编码前了解项目背景、技术栈和开发规范。

## AI会话快速开始提要

### 1. 项目概览

- **项目名称**: ChartDreamer - Figma 数据可视化插件
- **技术栈**: Preact + TypeScript + create-figma-plugin
- **主要功能**: 桑基图生成器
- **开发状态**: 第一阶段已完成，进入第二阶段MVP开发

### 2. AI编码前必读文档

- **项目架构文档**: `doc/roadmap.md` - 了解整体开发计划和当前进度
- **技术选型说明**: `doc/template-comparison.md` - 了解为什么选择create-figma-plugin
- **Figma插件开发指南**: `doc/figma-plugin-import-guide.md` - 了解Figma插件开发流程
- **代码规范**: ESLint + Prettier配置，查看package.json中的scripts

### 3. 开发环境要求

- **Node.js**: 确保版本兼容性
- **Figma桌面客户端**: 用于插件测试
- **开发工具**: VS Code推荐配置
- **依赖管理**: npm包管理

### 4. AI编码注意事项

- **代码风格**: 严格遵循ESLint和Prettier规范
- **TypeScript**: 必须使用类型定义，避免any类型
- **组件架构**: 使用Preact的hooks和组件化开发
- **通信机制**: 理解UI线程与主线程的消息传递
- **Figma API**: 熟悉Figma插件API的使用限制

### 5. 当前开发重点

- **第二阶段目标**: 实现桑基图生成器的核心功能
- **优先级**: UI组件构建 → 数据处理 → Figma集成
- **测试要求**: 每个功能都需要在Figma中验证

### 6. 常见问题与解决方案

- **构建问题**: 参考package.json中的scripts
- **类型错误**: 查看types.ts文件
- **通信问题**: 参考main.ts和ui.tsx的现有实现

## 项目过程资产

- **Bug自查清单**: 每次编码完成后，首先查看 `bugChecklist.md` 文档进行自查，预防常见错误并寻找解决方案
- **Bugfix**:在出现问题时，永远先查找bugfixLog中是否有已经解决的方案,并在修复bug后主动记录log
- **任务执行**:尽可能按照每一个子节点的任务执行顺序执行，每个子节点都需要询问是否继续，并在执行完一个阶段任务后，主动提示是否要检查并更新roadmap
- **对话规则**: 永远按照roadmap中的实施路径执行，并在每个自任务做完后提示我是否继续
- **文档生成**: 遵循markdownlint-config-guide文档中的规则来生成md文档
