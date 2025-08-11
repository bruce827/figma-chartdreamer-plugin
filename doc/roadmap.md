## 📊 ChartDreamer - Figma 数据可视化插件开发路线图

> 最后更新：2025-08-11
> 技术栈：**Preact + TypeScript + esbuild** (基于 create-figma-plugin)

### **项目概述**
**GitHub仓库：`figma-chartdreamer-plugin`**  
**目标：** 打造一个强大易用的 Figma 数据可视化插件，首期实现桑基图生成功能

---

### **第一阶段：项目启航 (Phase 1: Project Ignition)**

**目标：建立一个坚实、现代化的React开发环境，并成功在Figma中运行你的第一个组件。**

*   **1.1. GitHub 仓库初始化 (GitHub Repo Init)**
    *   [x] 在GitHub上创建 `figma-chartdreamer-plugin` 公开仓库。
    *   [x] 添加 `README.md`, `.gitignore` (Node模板), 和 `MIT` 许可证。

*   **1.2. 项目初始化 (Project Initialization)**
    *   [x] **技术选型**: 经过对比分析，选择了 `create-figma-plugin` 作为开发框架
        - 理由：最成熟稳定（1000+ stars）、官方推荐、完整工具链
        - 技术栈：Preact (轻量级 React) + TypeScript + esbuild
    *   [x] **项目创建**: 使用 `npm create figma-plugin@latest` 创建项目
        ```bash
        npm create figma-plugin@latest figma-chartdreamer -- --yes --template plugin/react-editor
        ```
    *   [x] **构建验证**: 运行 `npm run build` 成功生成插件文件

*   **1.4. 开发环境配置 (Development Environment Setup)**
    *   [x] **开发监视模式**: 配置 `npm run watch` 自动重新构建
    *   [x] **代码规范**: 配置 ESLint + Prettier，确保代码风格一致性
        - 安装并配置 ESLint 9.x 新格式配置
        - 配置 Prettier 代码格式化
        - 添加 lint 和 format 脚本命令
    *   [ ] **Git Hooks**: 设置 husky + lint-staged，提交前自动检查代码（待完成）
    *   [ ] **VS Code 配置**: 优化开发体验（待完成）
    *   [x] **TypeScript 配置**: 已有 `tsconfig.json`，类型检查正常工作

*   **1.3. 里程碑：跑通 "Hello React Component"**
    *   [x] 在Figma桌面客户端中，通过 `manifest.json` 文件导入本地开发插件
    *   [x] 修改 `ui.tsx` 创建简单的测试界面，包含标题和按钮
    *   [x] 实现 UI 与主线程通信：
        - UI 端：使用 `emit<HelloHandler>()` 发送消息
        - 主线程：使用 `once<HelloHandler>()` 接收消息并调用 `figma.notify()`
    *   [x] **验收完成**: 点击按钮成功在 Figma 中显示通知 "✅ React component is running!"

---

### **第二阶段：MVP核心功能实现 (Phase 2: MVP Core Feature Implementation)**

**目标：利用React的组件化和状态管理，构建桑基图生成器的核心功能。**

*   **2.0. 项目架构设计 (Project Architecture Design)**
    *   [ ] **目录结构规范**:
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
    *   [ ] **TypeScript 接口定义**: 创建核心数据结构接口
        ```typescript
        interface SankeyNode { id: string; name: string; value: number; }
        interface SankeyLink { source: string; target: string; value: number; }
        interface ChartConfig { nodeColor: string; linkColor: string; theme: 'light' | 'dark'; }
        ```
    *   [ ] **通信架构设计**: 使用 create-figma-plugin 的事件系统

*   **2.1. 构建UI组件 (Build UI Components with Preact)**
    *   [ ] **状态管理**: 使用 Preact 的 `useState` 管理用户输入和配置
        ```typescript
        const [jsonInput, setJsonInput] = useState('');
        const [nodeColor, setNodeColor] = useState('#A1A1AA');
        const [linkColor, setLinkColor] = useState('#E5E7EB');
        ```
    *   [ ] **输入组件**: 使用 `@create-figma-plugin/ui` 的 `Textbox` 组件
    *   [ ] **配置组件**: 创建颜色选择器组件
    *   [ ] **动作组件**: 使用 `Button` 组件触发生成逻辑

*   **2.2. 连接UI与Figma核心 (Bridge UI to Figma Core)**
    *   [ ] 使用 `emit` 函数发送消息到主线程
    *   [ ] 使用 `once` 或 `on` 函数接收主线程消息
        ```typescript
        // UI 端发送
        emit<GenerateSankeyHandler>('GENERATE_SANKEY', {
          data: jsonInput,
          options: { nodeColor, linkColor }
        });
        
        // 主线程接收
        once<GenerateSankeyHandler>('GENERATE_SANKEY', (data) => {
          // 处理生成逻辑
        });
        ```

*   **2.3. 集成D3计算引擎 (Integrate D3 Engine)**
    *   [ ] 在 `code.ts` 中，`npm install d3-sankey @types/d3-sankey`。
    *   [ ] 在 `figma.ui.onmessage` 的 `generate-sankey` 分支中，调用 `d3-sankey` 库，传入UI发送过来的数据，完成布局计算。
    *   [ ] **数据格式支持**: 实现多种输入格式解析器
        *   [ ] JSON 格式解析
        *   [ ] CSV/TSV 格式解析
        *   [ ] 提供3个示例数据模板
    *   [ ] **数据验证**: 添加输入数据完整性检查
    *   [ ] **调试技巧**: 此时，先用 `console.log` 打印出D3计算出的 `nodes` 和 `links` 数组，确保数据结构正确。

*   **2.4. 渲染引擎：从数据到矢量图形 (The Render Engine)**
    *   [ ] 在 `code.ts` 中，创建 `drawSankey` 函数，接收D3的计算结果和颜色配置。
    *   [ ] **关键实现**:
        *   遍历 `nodes`，使用 `figma.createRectangle()` 绘制节点。
        *   遍历 `links`，使用 `figma.createVector()` 绘制链接路径。
        *   异步加载字体后，遍历 `nodes`，使用 `figma.createText()` 添加标签。
        *   最后，将所有图层用 `figma.group()` 编组。

*   **2.5. 图表样式系统 (Chart Styling System)**
    *   [ ] **预设主题**: 实现深色/浅色/自定义主题切换
    *   [ ] **节点样式**: 支持矩形/圆角矩形/圆形节点
    *   [ ] **链接样式**: 实现直线/贝塞尔曲线/渐变效果
    *   [ ] **颜色方案**: 自动生成和谐配色方案
    *   [ ] **响应式布局**: 根据画布大小自动调整图表尺寸

---

### **第三阶段：打磨与交互优化 (Phase 3: Polish & Interactive Enhancements)**

**目标：利用React的能力，让插件变得智能、健壮且好用。**

*   **3.1. 智能错误处理 (Smart Error Handling)**
    *   [ ] 在 `JsonInput` 组件中，当用户停止输入时，用 `try-catch` 尝试 `JSON.parse`。
    *   [ ] 创建一个 `error` state，`const [error, setError] = useState(null);`。
    *   [ ] 如果解析失败，则 `setError('JSON格式错误')`，并在UI上渲染一个友好的错误提示组件。如果成功，则 `setError(null)`。

*   **3.2. 提升用户体验 (UX Enhancements)**
    *   [ ] **加载状态**: 创建 `isLoading` state。在点击生成按钮时设为 `true`，`code.ts` 完成绘图后可以回发一条消息将其设为 `false`。当 `isLoading` 为 `true` 时，按钮显示为禁用状态或展示一个Spinner。
    *   [ ] **UI美化**: 引入一个UI库来美化界面。
        *   **首选**: `figma-plugin-ds-react`，与Figma风格统一。
        *   **备选**: `shadcn/ui` + `Tailwind CSS`，可以打造更定制化的现代风格。
    *   [ ] **用户设置持久化**: 使用 `useEffect` Hook，在组件首次加载时从 `figma.clientStorage` 读取并设置颜色状态；在颜色状态变化时，将其存入 `clientStorage`。
    *   [ ] **历史记录**: 保存最近10次生成的配置
    *   [ ] **模板库**: 提供5个预设常用图表模板
    *   [ ] **撤销/重做**: 实现 Ctrl+Z/Ctrl+Y 支持
    *   [ ] **快捷键**: 定义常用操作快捷键

*   **3.3. 性能优化 (Performance Optimization)**
    *   [ ] **大数据处理**: 实现分页加载和虚拟滚动
    *   [ ] **渲染优化**: 使用 React.memo 和 useMemo 优化重渲染
    *   [ ] **防抖节流**: 对输入和颜色选择器添加防抖
    *   [ ] **Web Worker**: 将D3计算移至 Worker 线程
    *   [ ] **性能监控**: 添加渲染时间和内存使用监控

---

### **测试阶段：质量保证 (Testing Phase: Quality Assurance)**

**目标：确保插件的稳定性和可靠性。**

*   **测试体系构建 (Testing System)**
    *   [ ] **单元测试**: 使用 Vitest 测试核心函数，覆盖率 >80%
    *   [ ] **组件测试**: 使用 React Testing Library 测试UI组件
    *   [ ] **集成测试**: 测试 UI 与 Plugin 通信
    *   [ ] **E2E测试**: 使用 Playwright 测试完整用户流程
    *   [ ] **性能测试**: 确保处理1000+节点时保持流畅
    *   [ ] **错误边界**: 添加 React Error Boundaries

---

### **第四阶段：发布与展望 (Phase 4: Launch & Vision)**

**目标：发布你的作品，并为它的未来建立清晰的路线图。**

*   **4.1. 高质量文档 (High-Quality Documentation)**
    *   [ ] **更新 `README.md`**: 详细介绍插件功能，展示GIF动图，并特别提及项目使用了 **React, Vite, D3.js** 等技术栈。
    *   [ ] **API文档**: 使用 TypeDoc 生成代码文档
    *   [ ] **用户指南**: 创建详细的使用教程
    *   [ ] **视频教程**: 录制3-5分钟的功能演示
    *   [ ] **贡献指南**: 编写 CONTRIBUTING.md

*   **4.2. 分析与监控 (Analytics & Monitoring)**
    *   [ ] **使用分析**: 集成 Google Analytics 或 Mixpanel
    *   [ ] **错误追踪**: 配置 Sentry 错误监控
    *   [ ] **用户反馈**: 添加反馈收集表单
    *   [ ] **性能指标**: 监控加载时间和响应速度

*   **4.3. 发布到 Figma Community**
    *   [ ] 运行 `npm run build` 打包生产环境代码
    *   [ ] 仔细检查 `manifest.json`，设计一个吸引人的插件图标
    *   [ ] 准备插件描述和截图
    *   [ ] 遵循官方流程发布插件

*   **4.4. 迭代路线图 (Iteration Roadmap in GitHub Issues)**
    *   [ ] 在GitHub仓库的 **Issues** 中，为未来的想法创建标签，如 `enhancement`, `new-feature`, `bug`。
    *   [ ] **v1.1**: 添加更多自定义选项（字体、圆角、渐变）。
    *   [ ] **v1.2**: 增加新的图表类型（如旭日图、关系图）。
    *   [ ] **v2.0**: 连接外部数据（Google Sheets / Airtable API）。
    *   [ ] **`feat/3d-explore` 分支**: 在一个独立的特性分支上，开始我们讨论过的 `Three.js` + 图片渲染的3D图表探索。

*   **4.5. 长期维护计划 (Long-term Maintenance)**
    *   [ ] **依赖更新**: 每月检查并更新依赖包
    *   [ ] **API监控**: 跟踪 Figma API 更新
    *   [ ] **社区管理**: 建立 Discord/Slack 社区
    *   [ ] **版本发布**: 制定语义化版本规范
    *   [ ] **备份策略**: 定期备份用户反馈和使用数据

---

### **🎯 当前进度总结**

**✅ 已完成:**
- 第一阶段 1.1：GitHub 仓库初始化
- 第一阶段 1.2：项目初始化（使用 create-figma-plugin）
- 第一阶段 1.3：跑通 "Hello React Component" ✨
- 第一阶段 1.4：开发环境配置（ESLint + Prettier）✅

**🔄 准备开始:**
- 第二阶段：MVP核心功能实现

**📋 待开始:**
- 第二阶段：MVP核心功能实现
- 构建桑基图生成器的UI组件

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

*   **技术风险**
    *   **Figma API 限制**: 准备降级方案和缓存策略
    *   **性能瓶颈**: 设置性能预算，准备优化方案
    *   **浏览器兼容性**: 测试主流浏览器

*   **用户风险**
    *   **学习曲线**: 提供详细教程和示例
    *   **数据安全**: 明确数据处理策略，不存储用户数据
    *   **使用障碍**: 收集反馈，持续优化UI/UX

---

### **开发最佳实践 (Development Best Practices)**

*   **代码质量**
    *   [ ] 保持代码覆盖率 > 70%
    *   [ ] 每个 PR 必须通过 CI/CD 检查
    *   [ ] 定期进行代码审查

*   **文档规范**
    *   [ ] 每个函数都要有 JSDoc 注释
    *   [ ] 复杂逻辑必须有行内注释
    *   [ ] README 保持最新

*   **版本控制**
    *   [ ] 使用 Git Flow 工作流
    *   [ ] 遵循 Conventional Commits 规范
    *   [ ] 保护主分支，禁止直接推送

---

这个大纲现在包含了完整的开发生命周期，从架构设计到长期维护。祝你编码愉快，享受从0到1创造的整个过程！
