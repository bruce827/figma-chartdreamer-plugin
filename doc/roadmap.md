好的，我们正式锁定 **React + Vite** 作为技术栈核心！这会让我们的开发体验变得非常流畅。

现在，我将为你量身定制一个基于这套技术栈的、更详细、更具操作性的开发路径大纲。你可以直接把它复制到你GitHub仓库的 `README.md` 或 `PROJECT.md` 文件中，作为你的开发清单。

---

### **项目：ChartDreamer (基于React + Vite)**
**GitHub仓库：`figma-chartdreamer-plugin`**

---

### **第一阶段：项目启航 (Phase 1: Project Ignition)**

**目标：建立一个坚实、现代化的React开发环境，并成功在Figma中运行你的第一个组件。**

*   **1.1. GitHub 仓库初始化 (GitHub Repo Init)**
    *   [x] 在GitHub上创建 `figma-chartdreamer-plugin` 公开仓库。
    *   [x] 添加 `README.md`, `.gitignore` (Node模板), 和 `MIT` 许可证。

*   **1.2. **关键步骤**: 使用Vite模板初始化项目 (Project Init with Vite)**
    *   [x] **执行建议**: 在GitHub上搜索 `figma plugin react vite template`，找到一个高星(star)且近期维护的模板。
    *   [x] 按照模板指南克隆并初始化项目。
        ```bash
        # 示例命令
        git clone [模板仓库地址] figma-chartdreamer-plugin
        cd figma-chartdreamer-plugin
        npm install
        ```
    *   [x] 运行 `npm run dev`，确保Vite开发服务器能正常启动。

*   **1.3. 里程碑：跑通 "Hello React Component"**
    *   [x] 在Figma桌面客户端中，通过 `manifest.json` 文件导入你本地的开发插件。
    *   [x] 修改模板中的 `App.tsx` (或类似入口组件)，添加一个按钮。
    *   [x] **关键点**: 为按钮添加 `onClick` 事件处理器。在这个处理器中，调用 `parent.postMessage({ pluginMessage: { type: 'notify', message: 'React component is running!' } }, '*')`。
    *   [x] 在 `code.ts` 中，确保 `figma.ui.onmessage` 逻辑能接收到这个消息并调用 `figma.notify()`。
    *   **验收标准**: 在Figma中点击插件UI里的按钮，Figma右下角成功弹出通知。

---

### **第二阶段：MVP核心功能实现 (Phase 2: MVP Core Feature Implementation)**

**目标：利用React的组件化和状态管理，构建桑基图生成器的核心功能。**

*   **2.1. 构建UI组件 (Build UI Components in React)**
    *   [ ] **状态管理**: 在 `App.tsx` 中，使用 `useState` 来管理用户输入和配置。
        ```javascript
        const [jsonInput, setJsonInput] = useState('');
        const [nodeColor, setNodeColor] = useState('#A1A1AA');
        const [linkColor, setLinkColor] = useState('#E5E7EB');
        ```
    *   [ ] **输入组件**: 创建一个 `JsonInput` 组件，其内部包含一个 `<textarea>`，它的值和 `onChange` 事件绑定到 `jsonInput` state。
    *   [ ] **配置组件**: 创建 `ColorPicker` 组件，用于修改 `nodeColor` 和 `linkColor` state。
    *   [ ] **动作组件**: 创建 `GenerateButton` 组件，它将在 `onClick` 时触发生成逻辑。

*   **2.2. 连接React UI与Figma核心 (Bridge React UI to Figma Core)**
    *   [ ] 在 `GenerateButton` 组件的 `onClick` 事件处理器中，将所有状态（`jsonInput`, `nodeColor`等）打包成一个对象。
    *   [ ] 通过 `parent.postMessage` 将这个对象发送到 `code.ts`。
        ```javascript
        // 在 GenerateButton.tsx 的 onClick 方法中
        parent.postMessage({
          pluginMessage: {
            type: 'generate-sankey',
            data: jsonInput,
            options: { nodeColor, linkColor }
          }
        }, '*');
        ```

*   **2.3. 集成D3计算引擎 (Integrate D3 Engine)**
    *   [ ] 在 `code.ts` 中，`npm install d3-sankey @types/d3-sankey`。
    *   [ ] 在 `figma.ui.onmessage` 的 `generate-sankey` 分支中，调用 `d3-sankey` 库，传入UI发送过来的数据，完成布局计算。
    *   [ ] **调试技巧**: 此时，先用 `console.log` 打印出D3计算出的 `nodes` 和 `links` 数组，确保数据结构正确。

*   **2.4. 渲染引擎：从数据到矢量图形 (The Render Engine)**
    *   [ ] 在 `code.ts` 中，创建 `drawSankey` 函数，接收D3的计算结果和颜色配置。
    *   [ ] **关键实现**:
        *   遍历 `nodes`，使用 `figma.createRectangle()` 绘制节点。
        *   遍历 `links`，使用 `figma.createVector()` 绘制链接路径。
        *   异步加载字体后，遍历 `nodes`，使用 `figma.createText()` 添加标签。
        *   最后，将所有图层用 `figma.group()` 编组。

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

---

### **第四阶段：发布与展望 (Phase 4: Launch & Vision)**

**目标：发布你的作品，并为它的未来建立清晰的路线图。**

*   **4.1. 高质量文档 (High-Quality Documentation)**
    *   [x] **更新 `README.md`**: 详细介绍插件功能，展示GIF动图，并特别提及项目使用了 **React, Vite, D3.js** 等技术栈。

*   **4.2. 发布到 Figma Community**
    *   [ ] 运行 `npm run build` 打包生产环境代码。
    *   [ ] 仔细检查 `manifest.json`，设计一个吸引人的插件图标。
    *   [ ] 遵循官方流程发布插件。

*   **4.3. 迭代路线图 (Iteration Roadmap in GitHub Issues)**
    *   [ ] 在GitHub仓库的 **Issues** 中，为未来的想法创建标签，如 `enhancement`, `new-feature`, `bug`。
    *   [ ] **v1.1**: 添加更多自定义选项（字体、圆角、渐变）。
    *   [ ] **v1.2**: 增加新的图表类型（如旭日图、关系图）。
    *   [ ] **v2.0**: 连接外部数据（Google Sheets / Airtable API）。
    *   [ ] **`feat/3d-explore` 分支**: 在一个独立的特性分支上，开始我们讨论过的 `Three.js` + 图片渲染的3D图表探索。

---

### **🎯 当前进度总结**

**✅ 已完成 (100%):**
- 第一阶段：项目启航 - 完全完成！
- React + Vite开发环境搭建
- TypeScript配置
- 基础UI组件
- Figma插件集成
- 开发服务器运行

**🔄 下一步 (准备开始):**
- 第二阶段：MVP核心功能实现
- 开始构建桑基图生成器的UI组件

这个大纲现在完全为你和你的技术栈量身打造。祝你编码愉快，享受从0到1创造的整个过程！