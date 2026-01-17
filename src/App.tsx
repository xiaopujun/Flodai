import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, ConfigProvider } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { RootStore, RootStoreContext, useStore } from './stores/RootStore';
import { appTheme } from './theme';
import styles from './App.module.less';
import './styles/global.less';
import { nodeTypes } from './components/nodes';
import { NodePalette } from './components/NodePalette';
import type { FlowNode, FlowEdge } from './types/flow';

// Instantiate RootStore once
const rootStore = new RootStore();

const Editor = observer(() => {
  const { workflowStore, uiStore } = useStore();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<FlowNode, FlowEdge> | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number; label: string } | null>(null);

  const enablePointerDrag = useMemo(() => {
    const w = window as unknown as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
    return Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const createNode = useCallback(
    (nodeType: string, label: string, position: { x: number; y: number }) => {
      const id = uuidv4();

      const node =
        nodeType === 'aiNode'
          ? ({
              id,
              type: 'aiNode',
              position,
              data: { model: 'gpt-4o', prompt: '', output: '', isStreaming: false },
            } as FlowNode)
          : nodeType === 'fileNode'
            ? ({
                id,
                type: 'fileNode',
                position,
                data: { mode: 'write', path: '', content: '' },
              } as FlowNode)
            : nodeType === 'triggerNode'
              ? ({
                  id,
                  type: 'triggerNode',
                  position,
                  data: { label },
                } as FlowNode)
              : nodeType === 'pythonScriptNode'
                ? ({
                    id,
                    type: 'pythonScriptNode',
                    position,
                    data: { label },
                  } as FlowNode)
                : ({
                    id,
                    type: 'triggerNode',
                    position,
                    data: { label },
                  } as FlowNode);

      workflowStore.addNode(node);
    },
    [workflowStore],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const raw =
        event.dataTransfer.getData('application/flodai-node') ||
        event.dataTransfer.getData('text/plain');

      const payload = raw ? (JSON.parse(raw) as { nodeType?: string; label?: string }) : {};
      const nodeType = payload.nodeType;
      const label = payload.label ?? '节点';

      if (!nodeType) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      createNode(nodeType, label, position);
    },
    [createNode, reactFlowInstance],
  );

  const startPointerDrag = useCallback(
    (payload: { nodeType: string; label: string }, event: React.PointerEvent) => {
      if (!enablePointerDrag) return;
      if (!reactFlowInstance) return;

      event.preventDefault();

      const onMove = (e: PointerEvent) => {
        setDragGhost({ x: e.clientX, y: e.clientY, label: payload.label });
      };

      const onUp = (e: PointerEvent) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);

        setDragGhost(null);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (!inside) return;

        const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
        createNode(payload.nodeType, payload.label, position);
      };

      setDragGhost({ x: event.clientX, y: event.clientY, label: payload.label });
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [createNode, enablePointerDrag, reactFlowInstance],
  );
  
  return (
    <div className={styles.container}>
      {dragGhost && (
        <div
          className={styles.dragGhost}
          style={{ left: dragGhost.x + 12, top: dragGhost.y + 12 }}
        >
          {dragGhost.label}
        </div>
      )}
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(to bottom left, #fd5d93, #ec250d)', borderRadius: 4 }}></div>
          <h1>Flodai 工作台</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button ghost>撤销</Button>
          <Button type="primary" style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}>
            运行工作流
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.main}>
        {/* Sidebar */}
        <aside className={styles.sidebar} style={{ width: uiStore.sidebarWidth }}>
          <NodePalette enablePointerDrag={enablePointerDrag} onStartDrag={startPointerDrag} />
        </aside>

        {/* Canvas */}
        <div className={styles.canvas} ref={canvasRef} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow<FlowNode, FlowEdge>
            nodes={toJS(workflowStore.nodes) as FlowNode[]}
            edges={toJS(workflowStore.edges) as FlowEdge[]}
            onNodesChange={workflowStore.onNodesChange}
            onEdgesChange={workflowStore.onEdgesChange}
            onConnect={workflowStore.onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            colorMode="dark"
          >
            <Background color="#333" gap={20} />
            <Controls style={{ fill: '#fff' }} />
            <MiniMap style={{ backgroundColor: '#27293d' }} nodeColor="#fd5d93" />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <aside className={styles.inspector}>
          <div style={{ padding: 20 }}>
            <h2 style={{ fontSize: 16, color: 'var(--lc-text-secondary)', margin: 0 }}>属性</h2>
            <div style={{ marginTop: 20, color: '#fff' }}>
              选择一个节点以编辑。
            </div>
          </div>
        </aside>
      </div>

      {/* Console Panel */}
      <div className={`${styles.console} ${!uiStore.isConsoleOpen ? styles.collapsed : ''}`}>
        <div className={styles.consoleHeader} onClick={() => uiStore.toggleConsole()}>
          <span>系统控制台</span>
          <div style={{ color: 'var(--lc-text-secondary)' }}>
            {uiStore.isConsoleOpen ? '▼' : '▲'}
          </div>
        </div>
        {uiStore.isConsoleOpen && (
          <div className={styles.consoleBody}>
            <div className={`${styles.logLine} info`}>[10:00:01] 系统已初始化。</div>
            <div className={`${styles.logLine} success`}>[10:00:02] Rust 后端已连接。</div>
            <div className={styles.logLine}>[10:00:02] 准备执行工作流。</div>
          </div>
        )}
      </div>
    </div>
  );
});

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <RootStoreContext.Provider value={rootStore}>
        <Editor />
      </RootStoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;
