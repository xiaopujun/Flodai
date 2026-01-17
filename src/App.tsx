import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, ConfigProvider, Input, Radio, Switch, Segmented } from 'antd';
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
import type { FlowNode, FlowEdge, TriggerNodeData, AINodeData, FileNodeData } from './types/flow';

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

  const hoverDetail = useMemo(() => {
    if (!uiStore.hoverDetailNodeId || !uiStore.hoverDetailPosition) return null;
    const node = workflowStore.nodes.find((item) => item.id === uiStore.hoverDetailNodeId);
    if (!node) return null;
    return {
      node,
      position: uiStore.hoverDetailPosition,
    };
  }, [uiStore.hoverDetailNodeId, uiStore.hoverDetailPosition, workflowStore.nodes]);

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

  const renderHoverDetailContent = (node: FlowNode) => {
    if (node.type === 'triggerNode') {
      const data = node.data as TriggerNodeData;
      const enabled = data.enabled ?? true;
      const mode = data.mode ?? 'manual';
      const modeText = mode === 'manual' ? '手动触发' : '定时触发（一次）';
      const statusText = enabled ? '已启用' : '已停用';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            {data.label || '触发器'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>模式</span>
            <span>{modeText}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>计划时间</span>
            <span>{data.scheduleTime || '未设置'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>状态</span>
            <span>{statusText}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.7 }}>初始变量</span>
            <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
              {data.initialPayload || '未设置'}
            </span>
          </div>
        </div>
      );
    }

    if (node.type === 'aiNode') {
      const data = node.data as AINodeData;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>AI 生成器</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>模型</span>
            <span>{data.model || '未选择'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.7 }}>系统 / 提示词</span>
            <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
              {data.prompt || '未设置'}
            </span>
          </div>
        </div>
      );
    }

    if (node.type === 'fileNode') {
      const data = node.data as FileNodeData;
      const mode = (data.mode as 'read' | 'write') || 'write';
      const modeText = mode === 'read' ? '读取' : '写入';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>文件系统</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ opacity: 0.7 }}>模式</span>
            <span>{modeText}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.7 }}>文件路径</span>
            <span style={{ wordBreak: 'break-all' }}>
              {data.path || '未设置'}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div style={{ fontSize: 13 }}>
        暂无可展示的节点详情。
      </div>
    );
  };

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

      {hoverDetail && uiStore.nodeDisplayMode === 'compact' && (
        <div
          className={styles.nodeDetailOverlay}
          style={{ left: hoverDetail.position.x + 12, top: hoverDetail.position.y + 12 }}
        >
          {renderHoverDetailContent(hoverDetail.node)}
        </div>
      )}
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(to bottom left, #fd5d93, #ec250d)', borderRadius: 4 }}></div>
          <h1>Flodai 工作台</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Segmented
            size="small"
            value={uiStore.nodeDisplayMode}
            onChange={(value) => uiStore.setNodeDisplayMode(value as 'compact' | 'detailed')}
            options={[
              { label: '精简', value: 'compact' },
              { label: '详细', value: 'detailed' },
            ]}
          />
          <Button ghost>撤销</Button>
          <Button
            type="primary"
            style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
            onClick={() => workflowStore.runAllEnabledTriggers()}
          >
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
            proOptions={{ hideAttribution: true }}
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
            {(() => {
              const selectedNode = workflowStore.nodes.find((node) => (node as any).selected);

              if (!selectedNode) {
                return (
                  <div style={{ marginTop: 20, color: '#fff' }}>
                    选择一个节点以编辑。
                  </div>
                );
              }

              if (selectedNode.type === 'triggerNode') {
                const data = selectedNode.data as TriggerNodeData;
                const enabled = data.enabled ?? true;
                const mode = data.mode ?? 'manual';

                return (
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>名称</span>
                      <Input
                        size="small"
                        value={data.label}
                        onChange={(e) =>
                          workflowStore.updateNodeData(selectedNode.id, { label: e.target.value })
                        }
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>启用</span>
                      <Switch
                        checked={enabled}
                        onChange={(checked) =>
                          workflowStore.updateNodeData(selectedNode.id, { enabled: checked })
                        }
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>触发模式</span>
                      <Radio.Group
                        size="small"
                        value={mode}
                        onChange={(e) =>
                          workflowStore.updateNodeData(selectedNode.id, { mode: e.target.value })
                        }
                      >
                        <Radio.Button value="manual">手动触发</Radio.Button>
                        <Radio.Button value="scheduleOnce">定时触发（一次）</Radio.Button>
                      </Radio.Group>
                    </div>

                    {mode === 'scheduleOnce' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>执行时间</span>
                        <Input
                          size="small"
                          placeholder="例如：2026-01-18 09:00"
                          value={data.scheduleTime || ''}
                          onChange={(e) =>
                            workflowStore.updateNodeData(selectedNode.id, { scheduleTime: e.target.value })
                          }
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>初始变量（JSON）</span>
                      <Input.TextArea
                        placeholder='例如：{"userId":"123","topic":"日报总结"}'
                        rows={4}
                        value={data.initialPayload || ''}
                        onChange={(e) =>
                          workflowStore.updateNodeData(selectedNode.id, { initialPayload: e.target.value })
                        }
                      />
                    </div>

                    <Button
                      type="primary"
                      size="small"
                      style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
                      onClick={() => workflowStore.runTrigger(selectedNode.id, 'manual')}
                    >
                      立即运行
                    </Button>
                  </div>
                );
              }

              return (
                <div style={{ marginTop: 20, color: '#fff' }}>
                  当前节点暂不支持属性编辑。
                </div>
              );
            })()}
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
            {uiStore.logs.map((log) => {
              const levelClass =
                log.level === 'success' ? `${styles.logLine} success` : `${styles.logLine} ${log.level}`;
              return (
                <div key={log.id} className={levelClass}>
                  {log.message}
                </div>
              );
            })}
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
