# 自定义节点开发计划：打造“蓝图式”交互体验

基于您的需求（React Flow + Ant Design 6 + Less + MobX），我为您制定了以下分步开发计划。我们将采用 **"Base Node + 具体业务节点"** 的架构模式，确保所有节点风格统一且易于扩展。

## 核心架构设计

### 1. 目录结构规范
我们将新建 `src/components/nodes` 目录，集中管理所有节点逻辑：
```text
src/components/nodes/
├── BaseNode/           # [通用] 节点外壳（处理样式、选中态、通用头部）
├── AINode/             # [业务] AI生成节点（大模型调用、流式输出）
├── FileNode/           # [业务] 文件读写节点（路径选择、内容预览）
└── index.ts            # [注册] 节点类型注册表 (nodeTypes)
```

### 2. 数据流设计 (MobX)
React Flow 的 `data` 属性将作为 MobX Store 的一部分。
- **UI 状态**：输入框内容、下拉选择等直接绑定到 `WorkflowStore`。
- **运行时状态**：AI 的流式输出结果将实时更新到节点 data 中，触发组件重渲染实现“打字机”效果。

---

## 详细开发步骤

### 第一阶段：基础设施 (Base Node)
**目标**：确立 "Light Chaser Pro" 的视觉基调，实现类似于虚幻引擎蓝图的节点外壳。
1.  **创建 `BaseNode` 组件**：
    *   封装通用的 **Header**（支持自定义图标、标题、颜色）。
    *   封装通用的 **Body** 容器。
    *   统一管理 **Handle**（连接点）的样式，确保连接点在左/右侧垂直居中或按需排列。
2.  **样式实现 (`BaseNode.module.less`)**：
    *   实现深色磨砂玻璃背景 (`#1e1e2f`)。
    *   实现选中时的霓虹光晕效果 (`box-shadow` 配合 `--lc-accent-neon`)。
    *   集成 Ant Design 的 Token，确保字体和圆角一致。

### 第二阶段：AI 节点开发 (AI Node)
**目标**：实现核心的 AI 工作流节点，支持流式反馈展示。
1.  **UI 布局**：
    *   **输入区**：Prompt 文本域（支持变量插入提示）、模型选择下拉框 (Antd Select)。
    *   **配置区**：折叠面板，包含温度 (Temperature)、最大Token数等高级设置。
    *   **输出区**：**流式结果预览面板**。这是 MVP 的重点，我们将使用一个只读的文本区域，模拟打字机效果显示 `data.output` 的内容。
2.  **交互逻辑**：
    *   左侧 Handle：接收 `Context` (上下文) 或 `Trigger` (触发信号)。
    *   右侧 Handle：输出 `Result` (生成的内容)。

### 第三阶段：文件节点开发 (File Node)
**目标**：实现本地文件系统的交互能力。
1.  **UI 布局**：
    *   **模式切换**：读取文件 / 写入文件 (Segmented Controller)。
    *   **路径选择**：路径输入框 + "浏览" 按钮 (模拟调用 Tauri Dialog API)。
    *   **格式选择**：Markdown / JSON / Text。
2.  **交互逻辑**：
    *   **写入模式**：左侧接收内容输入，右侧输出成功/失败状态。
    *   **读取模式**：左侧接收触发信号，右侧输出读取到的文件内容。

### 第四阶段：注册与集成
**目标**：让 React Flow 识别并渲染这些新节点。
1.  **注册节点**：在 `src/components/nodes/index.ts` 中建立映射：
    ```typescript
    export const nodeTypes = {
      aiNode: AINode,
      fileNode: FileNode,
    };
    ```
2.  **更新 Store**：在 `WorkflowStore.ts` 中添加初始化数据，将默认节点替换为我们开发的 `aiNode` 和 `fileNode` 实例，以便启动即见效果。

## 验收标准
1.  **视觉**：节点风格符合 "Light Chaser Pro" 规范（深色、霓虹、圆角）。
2.  **交互**：可以拖拽节点，节点内的输入框可以正常输入并更新 Store 数据。
3.  **连接**：节点之间可以创建连线。

---
**您是否同意这个开发计划？** 如果同意，我将从**第一阶段：基础设施 (Base Node)** 开始执行。