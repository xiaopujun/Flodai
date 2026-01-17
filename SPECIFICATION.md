# Flodai - Technical Specification (v1.0)

## 1. Project Overview
**Flodai** is a desktop AI workflow automation tool for personal users. It features a node-based visual editor (Blueprints style) driven by a high-performance Rust backend.
- **License**: GPL
- **Target Audience**: Personal users, power users.

## 2. Technology Stack
- **Frontend**:
    - Framework: React 19 + TypeScript
    - Build Tool: Vite
    - UI Library: Ant Design 6.x
    - Styling: Sass / CSS Modules (No Tailwind)
    - State Management: **MobX**
    - Canvas Engine: React Flow (@xyflow/react)
    - I18n: i18next
    - Package Manager: **pnpm**
- **Backend**:
    - Core: Tauri v2 (Rust)
    - Async Runtime: Tokio (Supports parallel execution)
    - Database: SQLite (Optional Encryption via SQLCipher)
    - HTTP Client: Reqwest (Stream support)

## 3. Architecture

### 3.1 Execution Engine (Rust Backend Driven)
- **Logic**: The frontend is a UI renderer. The execution graph is serialized to JSON and sent to Rust.
- **Concurrency**: Parallel execution for branched nodes using Tokio tasks.
- **Streaming**: AI responses are streamed in real-time via Tauri Events (`AppHandle::emit`) to achieve "Typewriter" effect.

### 3.2 Data Protocol
- **Node Communication**: Strictly **JSON Objects**.
- **Plugin System**: **Path A (Independent Process)**. External scripts (Python/Node) are executed via Command Line, communicating via stdin/stdout JSON.

### 3.3 Data Storage
- **Local DB**: SQLite.
- **Privacy**: User configurable encryption (On/Off).
- **Import/Export**: Zip archive format (containing workflow JSON + assets).

## 4. Key Features (MVP)

### 4.1 Workflow Editor
- **Canvas**: Drag & Drop nodes.
- **Undo/Redo**: Supported for canvas structure changes (Nodes Add/Delete, Connections). Implemented via internal history stack in MobX.
- **Node Types**:
    - **Trigger**: Manual start.
    - **AI**: LLM Node (OpenAI + Local/Ollama).
    - **I/O**: File Read/Write (Markdown, TXT, PDF).
    - **Logic**: If/Else, Loop.
    - **Script**: Call external Python scripts.

### 4.2 UI/UX
- **Layout**: Left (Toolbar), Center (Canvas), Right (Inspector), Bottom (Global Console).
- **Console**: Global collapsible panel for logs, execution traces, and error details (Scheme B).
- **Update**: Auto-update check with manual confirmation dialog.
- **I18n**: Architecture ready, MVP includes Chinese (zh-CN).

## 5. Development Roadmap
- **Phase 1: Foundation**: Init Tauri + React + MobX + Antd. Setup i18n & Sass.
- **Phase 2: Editor UI**: Implement React Flow with custom nodes and MobX state binding.
- **Phase 3: Rust Engine**: Implement DAG scheduler and parallel execution logic.
- **Phase 4: AI & Streaming**: Integrate LLM APIs with frontend streaming display.
- **Phase 5: Plugins & System**: Implement external script execution and SQLite storage.
