# Markdownlint 配置指南

## 配置概述

本项目针对技术文档的特点，对 markdownlint 进行了优化配置，主要考虑了以下因素：

1. **技术文档特性**：包含大量代码块、中英文混合、技术术语
2. **项目结构**：包含任务列表、复杂标题层级、引用块
3. **开发体验**：平衡代码质量与开发效率

## 主要配置说明

### 已禁用的规则

| 规则 | 说明 | 原因 |
|------|------|------|
| MD014 | 禁止美元符号 | 代码块中常用 |
| MD018 | 标题后空格 | 允许无空格 |
| MD019 | 标题前空格 | 允许无空格 |
| MD020 | 标题后空格 | 允许无空格 |
| MD021 | 标题前空格 | 允许无空格 |
| MD022 | 标题周围空行 | 允许无空行 |
| MD023 | 标题缩进 | 允许缩进 |
| MD025 | 单一标题 | 允许多个一级标题 |
| MD027 | 列表标记后空格 | 允许无空格 |
| MD028 | 列表标记后空格 | 允许无空格 |
| MD031 | 列表项空行 | 允许无空行 |
| MD032 | 列表项空行 | 允许无空行 |
| MD034 | 裸URL | 允许裸URL |
| MD036 | 强调 | 允许强调 |
| MD037 | 强调 | 允许强调 |
| MD038 | 强调 | 允许强调 |
| MD039 | 强调 | 允许强调 |
| MD040 | 代码块 | 允许代码块 |
| MD041 | 首行标题 | 允许非一级标题开头 |
| MD042 | 链接 | 允许链接 |
| MD043 | 标题长度 | 允许长标题 |
| MD045 | 图片 | 允许图片 |
| MD047 | 文件结尾 | 允许无空行结尾 |
| MD051 | 链接 | 允许链接 |
| MD052 | 引用 | 允许引用 |
| MD053 | 链接 | 允许链接 |

### 自定义配置

| 规则 | 配置 | 说明 |
|------|------|------|
| MD013 | line_length: 120 | 行长度限制为120字符 |
| MD013 | code_blocks: false | 代码块不限制行长度 |
| MD013 | tables: false | 表格不限制行长度 |
| MD024 | siblings_only: true | 只检查同级标题重复 |
| MD024 | allow_different_nesting: true | 允许不同层级重复 |
| MD025 | level: 1 | 一级标题级别 |
| MD026 | punctuation: ".,;:!" | 允许的标点符号 |
| MD029 | style: "ordered" | 有序列表样式 |
| MD030 | ul_single: 1 | 单行无序列表空格数 |
| MD030 | ol_single: 1 | 单行有序列表空格数 |
| MD030 | ul_multi: 1 | 多行无序列表空格数 |
| MD030 | ol_multi: 1 | 多行有序列表空格数 |
| MD033 | allowed_elements | 允许的HTML元素 |
| MD035 | style: "---" | 分隔符样式 |
| MD044 | names | 允许的技术术语 |
| MD046 | style: "fenced" | 代码块样式 |
| MD048 | style: "backtick" | 行内代码样式 |
| MD049 | style: "emphasis" | 强调样式 |
| MD050 | style: "consistent" | 链接样式一致性 |

## 技术术语白名单

配置中包含了项目相关的技术术语白名单，避免误报：

- **框架/库**：React, Preact, TypeScript, D3.js, Three.js
- **工具**：Node.js, npm, esbuild, Vite, Vitest, Playwright
- **平台**：Figma, GitHub, Airtable, Google Sheets
- **服务**：Sentry, Google Analytics, Mixpanel
- **通讯工具**：Discord, Slack, Linear, Jira
- **项目相关**：ChartDreamer, Sankey

## 使用建议

1. **保存时检查**：配置为保存时自动检查
2. **忽略目录**：自动忽略 node_modules、dist、build 等目录
3. **代码块**：代码块内的内容不受行长度限制
4. **技术术语**：项目相关的技术术语已加入白名单

## 常见问题

### Q: 为什么禁用了一些规则？
A: 这些规则在技术文档中过于严格，会影响开发效率。我们选择了更实用的配置。

### Q: 如何添加新的技术术语？
A: 在 `.markdownlint.json` 的 `MD044.names` 数组中添加。

### Q: 如何临时忽略某个规则？
A: 在文档中添加 `<!-- markdownlint-disable MD013 -->` 注释。

## 更新日志

- 2025-08-12: 初始配置，针对技术文档优化
