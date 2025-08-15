# 📊 ChartDreamer - Figma 数据可视化插件开发路线图

> 最后更新：2025-08-13
> 技术栈：**Preact + TypeScript + esbuild** (基于 create-figma-plugin)

### **项目概述**
**GitHub仓库：`figma-chartdreamer-plugin`**  
**目标：** 打造一个强大易用的 Figma 数据可视化插件，首期实现桑基图生成功能

---

### **第一阶段：项目启航 (Phase 1: Project Ignition)**

**目标：建立一个坚实、现代化的React开发环境，并成功在Figma中运行你的第一个组件。**

* **1.1. GitHub 仓库初始化 (GitHub Repo Init)**
  * [x] 在GitHub上创建 `figma-chartdreamer-plugin` 公开仓库。
  * [x] 添加 `README.md`, `.gitignore` (Node模板), 和 `MIT` 许可证。

* **1.2. 项目初始化 (Project Initialization)**
  * [x] **技术选型**: 经过对比分析，选择了 `create-figma-plugin` 作为开发框架
        - 理由：最成熟稳定（1000+ stars）、官方推荐、完整工具链
        - 技术栈：Preact (轻量级 React) + TypeScript + esbuild
    *   [x] **项目创建**: 使用 `npm create figma-plugin@latest` 创建项目
        ```bash
        npm create figma-plugin@latest figma-chartdreamer -- --yes --template plugin/react-editor
        ```
    *   [x] **构建验证**: 运行 `npm run build` 成功生成插件文件

* **1.4. 开发环境配置 (Development Environment Setup)**
    *   [x] **开发监视模式**: 配置 `npm run watch` 自动重新构建
    *   [x] **代码规范**: 配置 ESLint + Prettier，确保代码风格一致性
        - 安装并配置 ESLint 9.x 新格式配置
        - 配置 Prettier 代码格式化
        - 添加 lint 和 format 脚本命令
    *   [ ] **Git Hooks**: 设置 husky + lint-staged，提交前自动检查代码（待完成）
    *   [ ] **VS Code 配置**: 优化开发体验（待完成）
    *   [x] **TypeScript 配置**: 已有 `tsconfig.json`，类型检查正常工作

* **1.3. 里程碑：跑通 "Hello React Component"**
    *   [x] 在Figma桌面客户端中，通过 `manifest.json` 文件导入本地开发插件
    *   [x] 修改 `ui.tsx` 创建简单的测试界面，包含标题和按钮
    *   [x] 实现 UI 与主线程通信：
        - UI 端：使用 `emit<HelloHandler>()` 发送消息
        - 主线程：使用 `once<HelloHandler>()` 接收消息并调用 `figma.notify()`
    *   [x] **验收完成**: 点击按钮成功在 Figma 中显示通知 "✅ React component is running!"

---

### **第二阶段：MVP核心功能实现 (Phase 2: MVP Core Feature Implementation)**

**目标：利用React的组件化和状态管理，构建桑基图生成器的核心功能。**

* **2.0. 项目架构设计 (Project Architecture Design)** ✅
    *   [x] **目录结构规范**:
        ```
        /figma-chartdreamer
          /src
            /components   # UI组件
            /handlers    # 消息处理器
            /utils       # 工具函数
            /types       # TypeScript 类型定义
            /hooks       # 自定义 Preact Hooks
            /styles      # 样式文件
          main.ts        # 插件主逻辑
          ui.tsx         # UI 入口
        ```
    *   [x] **TypeScript 接口定义**: 创建核心数据结构接口
        ```typescript
        interface SankeyNode { id: string; name: string; value: number; }
        interface SankeyLink { source: string; target: string; value: number; }
        interface ChartConfig { nodeColor: string; linkColor: string; theme: 'light' | 'dark'; }
        ```
    *   [x] **通信架构设计**: 使用 create-figma-plugin 的事件系统

* **2.1. 构建UI组件 (Build UI Components with Preact)** ✅
    *   [x] **状态管理**: 使用 Preact 的 `useState` 管理用户输入和配置
        ```typescript
        const [jsonInput, setJsonInput] = useState('');
        const [nodeColor, setNodeColor] = useState('#A1A1AA');
        const [linkColor, setLinkColor] = useState('#E5E7EB');
        ```
    *   [x] **输入组件**: 使用 `@create-figma-plugin/ui` 的 `TextboxMultiline` 组件
    *   [x] **配置组件**: 创建颜色选择器组件
    *   [x] **动作组件**: 使用 `Button` 组件触发生成逻辑
    *   [x] **示例数据选择器**: 创建了ExampleSelector组件和3个预设模板

* **2.2. 连接UI与Figma核心 (Bridge UI to Figma Core)** ✅
    *   [x] 使用 `emit` 函数发送消息到主线程
    *   [x] 使用 `once` 或 `on` 函数接收主线程消息
    *   [x] 实现了数据解析和验证功能
    *   [x] 实现了CSV/TSV/JSON格式解析
        ```typescript
        // UI 端发送
        emit<GenerateSankeyHandler>('GENERATE_SANKEY', {
          data: jsonInput,
          options: { nodeColor, linkColor }
        });
        
        // 主线程接收
        on<GenerateSankeyHandler>('GENERATE_SANKEY', (data) => {
          // 处理生成逻辑
        });
        ```

* **2.3. 集成D3计算引擎 (Integrate D3 Engine)** ✅
    *   [x] 在 `main.ts` 中，`npm install d3-sankey @types/d3-sankey`。
    *   [x] 在 `GENERATE_SANKEY` 事件处理中，调用 `d3-sankey` 库，传入UI发送过来的数据，完成布局计算。
    *   [x] **数据格式支持**: 实现多种输入格式解析器
        *   [x] JSON 格式解析
        *   [x] CSV/TSV 格式解析
        *   [x] 提供3个示例数据模板
    *   [x] **数据验证**: 添加输入数据完整性检查
    *   [x] **调试技巧**: 使用 `console.log` 打印出D3计算出的 `nodes` 和 `links` 数组，确保数据结构正确。

* **2.4. 渲染引擎：从数据到矢量图形 (The Render Engine)** ✅
    *   [x] 在 `main.ts` 中，创建 `renderSankeyToFigma` 函数，接收D3的计算结果和颜色配置。
    *   [x] **关键实现**:
        *   遍历 `nodes`，使用 `figma.createRectangle()` 绘制节点。
        *   遍历 `links`，使用 `figma.createVector()` 绘制链接路径。
        *   异步加载字体后，遍历 `nodes`，使用 `figma.createText()` 添加标签。
        *   最后，将所有图层用 `figma.createFrame()` 编组。
    *   [x] **额外实现**:
        *   贝塞尔曲线平滑链接
        *   节点圆角和阴影效果
        *   文本颜色自动适应
        *   自动缩放视图

* **2.5. 图表样式系统 (Chart Styling System)** ✅
    *   [x] **预设主题**: 实现深色/浅色/自定义主题切换
    *   [x] **节点样式**: 支持矩形/圆角矩形/圆形节点
    *   [x] **链接样式**: 实现直线/贝塞尔曲线/渐变效果
    *   [x] **颜色方案**: 自动生成和谐配色方案
    *   [x] **响应式布局**: 根据画布大小自动调整图表尺寸

---

### **第三阶段：打磨与交互优化 (Phase 3: Polish & Interactive Enhancements)**

**目标：利用React的能力，让插件变得智能、健壮且好用。**

* **3.1. 智能错误处理 (Smart Error Handling)** ✅
    *   [x] 在 `JsonInput` 组件中，当用户停止输入时，用 `try-catch` 尝试 `JSON.parse`。
    *   [x] 创建一个 `error` state，`const [error, setError] = useState(null);`。
    *   [x] 如果解析失败，则 `setError('JSON格式错误')`，并在UI上渲染一个友好的错误提示组件。如果成功，则 `setError(null)`。

* **3.2. 提升用户体验 (UX Enhancements)** ✅ (主要功能完成)
    *   [x] **加载状态**: 创建 `isLoading` state。在点击生成按钮时设为 `true`，`code.ts` 完成绘图后可以回发一条消息将其设为 `false`。当 `isLoading` 为 `true` 时，按钮显示为禁用状态或展示一个Spinner。
    *   [ ] **UI美化**: 引入一个UI库来美化界面。
        *   **首选**: `figma-plugin-ds-react`，与Figma风格统一。
        *   **备选**: `shadcn/ui` + `Tailwind CSS`，可以打造更定制化的现代风格。
    *   [x] **用户设置持久化**: 使用 `useEffect` Hook，在组件首次加载时从 `figma.clientStorage` 读取并设置颜色状态；在颜色状态变化时，将其存入 `clientStorage`。
    *   [x] **历史记录**: 保存最近10次生成的配置
    *   [x] **模板库**: 提供5个预设常用图表模板（已完成：能源流动、用户路径、预算分配、供应链流程、内容传播路径）
    *   [x] **撤销/重做**: 实现 Ctrl+Z/Ctrl+Y 支持，最多50步历史记录
    *   [x] **快捷键**: 定义常用操作快捷键（生成、清除、历史、格式化、加载示例等）

* **3.3. 性能优化 (Performance Optimization)** ⚠️ (部分完成)
    *   [x] **大数据处理**: 实现数据量警告和性能提示
    *   [x] **渲染优化**: 使用 React.memo 和 useMemo 优化重渲染
    *   [x] **防抖节流**: 对输入和颜色选择器添加防抖
    *   [ ] **Web Worker**: 将D3计算移至 Worker 线程（待实现）
    *   [x] **性能监控**: 添加渲染时间和内存使用监控

---

### **第四阶段：质量保证 (Phase 4: Quality Assurance)**

**目标：确保 v1.0 版本核心功能的稳定性和可靠性。**

* **4.1. 测试体系构建 (Testing System)**
    *   [ ] **单元测试**: 使用 Vitest 测试核心工具函数 (如 `sankeyEngine`, `validation`)。
    *   [ ] **组件测试**: 使用 React Testing Library 测试关键UI组件 (如 `DataInput`, `HistoryPanel`)。
    *   [ ] **集成测试**: 编写测试用例，覆盖UI与主线程的核心通信流程。
    *   [ ] **E2E 手动测试**: 根据 PRD 编写测试用例，在 Figma 中进行完整的用户流程测试。
    *   [ ] **性能基准测试**: 记录处理100、500、1000个节点时所需的时间和内存占用。
    *   [ ] **错误边界**: 为 React 组件添加 Error Boundaries，防止局部错误导致整个插件崩溃。

---

### **第五阶段：AI 赋能与体验增强 (v1.1)**

**目标：集成大语言模型（LLM），实现从自然语言到图表数据的生成，并进一步提升产品体验。**

* **5.1. AI 核心集成 (AI Core Integration)**
    *   [ ] **UI 设计**: 在数据输入区增加 "AI 生成" 模式切换，并设计一个新的 Prompt 输入组件。
    *   [ ] **API 通信**: 创建一个新的 `aiRequestHandler`，负责调用外部 AI 模型服务。
        *   设计请求和响应的数据结构。
        *   处理 API 调用时的加载和错误状态。
    *   [ ] **后端逻辑**: 在 `main.ts` 中处理来自 UI 的 AI 生成请求，调用 AI 服务，并将返回的数据填充回 UI 界面。

* **5.2. AI 辅助功能 (AI Helper Features)**
    *   [ ] **API Key 管理**: 
        *   创建一个独立的“设置”面板或模态框。
        *   使用 `figma.clientStorage` 安全地保存和读取用户的 API Key。
    *   [ ] **Prompt 优化**: 
        *   在 UI 中内置 3-5 个高质量的 Prompt 示例。
        *   设计一个机制，当 AI 返回错误时，向用户提供优化建议。
    *   [ ] **数据预览与编辑**: 确保 AI 生成的数据能被用户在渲染前方便地查看和修改。

* **5.3. 体验增强 (UX Enhancements)**
    *   [ ] **UI 美化**: 调研并引入 `figma-plugin-ds-react` 或 `shadcn/ui`，替换现有核心组件，统一视觉风格。
    *   [ ] **模板库**: 
        *   定义模板的数据结构。
        *   创建 5 个常用的桑基图模板（如用户流失分析、渠道来源等）。
        *   创建一个新的 `TemplateGallery` 组件来展示和加载模板。

---

### **🎯 当前进度总结**

**✅ 已完成:**
- **Phase 1**: 项目启航 ✅
- **Phase 2**: MVP核心功能实现 ✅

**🔄 正在进行:**
- **Phase 3**: 打磨与交互优化 ⚠️ (95% 完成)
  - 3.1 智能错误处理 ✅
  - 3.2 用户体验提升 ✅ (主要功能完成，仅UI美化待实现)
  - 3.3 性能优化 ⚠️ (核心优化完成，Web Worker待实现)
- **Phase 4**: v1.0 质量保证 (待开始)

**📋 待开始:**
- **Phase 5**: AI 赋能与体验增强 (v1.1)
- **Phase 6**: 发布与展望 (见 [`product_launch.md`](./product_launch.md))

### **📝 技术栈调整说明**

经过实际评估，我们选择了 **create-figma-plugin** 而非原计划的 Vite，主要原因：

1. **成熟度高**：1000+ stars，Figma 官方推荐
2. **工具链完整**：内置构建、类型检查、UI 组件库
3. **Preact 优势**：比 React 更轻量（3KB），API 几乎相同
4. **开发效率**：提供大量现成的 Figma 风格 UI 组件
5. **社区支持**：丰富的插件示例和文档

虽然使用 esbuild 而非 Vite，但构建速度依然很快，且更适合 Figma 插件的特殊需求。

---

### **风险管理 (Risk Management)**

**识别并应对潜在风险**

* **技术风险**
    *   **Figma API 限制**: 准备降级方案和缓存策略
    *   **性能瓶颈**: 设置性能预算，准备优化方案
    *   **浏览器兼容性**: 测试主流浏览器

* **用户风险**
    *   **学习曲线**: 提供详细教程和示例
    *   **数据安全**: 明确数据处理策略，不存储用户数据
    *   **使用障碍**: 收集反馈，持续优化UI/UX

---

### **开发最佳实践 (Development Best Practices)**

* **代码质量**
    *   [ ] 保持代码覆盖率 > 70%
    *   [ ] 每个 PR 必须通过 CI/CD 检查
    *   [ ] 定期进行代码审查

* **文档规范**
    *   [ ] 每个函数都要有 JSDoc 注释
    *   [ ] 复杂逻辑必须有行内注释
    *   [ ] README 保持最新

* **版本控制**
    *   [ ] 使用 Git Flow 工作流
    *   [ ] 遵循 Conventional Commits 规范
    *   [ ] 保护主分支，禁止直接推送

---

这个大纲现在包含了完整的开发生命周期，从架构设计到长期维护。祝你编码愉快，享受从0到1创造的整个过程！
