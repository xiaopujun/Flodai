import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, ConfigProvider, Modal, Input, Radio, Switch, Select } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { RootStore, RootStoreContext, useStore } from './stores/RootStore';
import { appTheme } from './theme';
import styles from './App.module.less';
import './styles/global.less';
import { nodeTypes } from './components/nodes';
import { NodePalette } from './components/NodePalette';
import type {
  FlowNode,
  FlowEdge,
  TriggerNodeData,
  AINodeData,
  ConversationAIConfig,
  TriggerNodeConfig,
} from './types/flow';
import { Home } from './pages/Home';

type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
};

const demoProjects: Project[] = [
  {
    id: 'demo-1',
    name: '示例项目一：入门工作流',
    description: '用于体验触发器、AI 节点与文件节点的基础编排。',
    updatedAt: '2026-01-17',
  },
  {
    id: 'demo-2',
    name: '示例项目二：日报生成助手',
    description: '通过定时触发与 AI 节点自动生成团队日报草稿。',
    updatedAt: '2026-01-16',
  },
  {
    id: 'demo-3',
    name: '示例项目三：文件监控与同步',
    description: '监听本地文件变更并推送更新内容到下游系统。',
    updatedAt: '2026-01-15',
  },
];

const rootStore = new RootStore();

type EditorProps = {
  currentProject: Project;
  onBackHome: () => void;
};

const Editor = observer(({ currentProject, onBackHome }: EditorProps) => {
  const { workflowStore, uiStore } = useStore();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<FlowNode, FlowEdge> | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number; label: string } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);

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

  const playConnectSound = useCallback(() => {
    const AnyAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AnyAudioContext) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AnyAudioContext();
    }

    const context = audioContextRef.current;
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gainNode.gain.value = 0.08;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    oscillator.start(now);
    oscillator.stop(now + 0.12);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        workflowStore.deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [workflowStore]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const createNode = useCallback(
    (nodeType: string, label: string, position: { x: number; y: number }) => {
      const id = uuidv4();

      const baseName = label || '节点';

      const node: FlowNode =
        nodeType === 'aiNode'
          ? ({
            id,
            type: 'aiNode',
            position,
            data: {
              kind: 'conversationAI',
              name: baseName || '对话 AI',
              description: '',
              inputs: [
                {
                  id: `${id}-in`,
                  key: 'control',
                  label: '上游',
                  kind: 'control',
                },
              ],
              outputs: [
                {
                  id: `${id}-out`,
                  key: 'control',
                  label: '下游',
                  kind: 'control',
                },
              ],
              config: {
                modelId: '',
                systemPrompt: '',
                historyPolicy: 'none',
              } as ConversationAIConfig,
            } as AINodeData,
          } as FlowNode)
          : ({
            id,
            type: 'triggerNode',
            position,
            data: {
              kind: 'trigger',
              name: baseName || '触发器',
              description: '',
              inputs: [],
              outputs: [
                {
                  id: `${id}-out`,
                  key: 'next',
                  label: '下游',
                  kind: 'control',
                },
              ],
              config: {
                mode: 'manual',
                scheduleTime: undefined,
                initialPayload: '',
                enabled: true,
                lastRunAt: undefined,
              } as TriggerNodeConfig,
            } as TriggerNodeData,
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
      const enabled = data.config.enabled ?? true;
      const mode = data.config.mode ?? 'manual';
      const modeText = mode === 'manual' ? '手动触发' : '定时触发（一次）';
      const statusText = enabled ? '已启用' : '已停用';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
            {data.name || '触发器'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: 24 }}>
            <span style={{ opacity: 0.7 }}>模式</span>
            <span>{modeText}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: 24 }}>
            <span style={{ opacity: 0.7 }}>计划时间</span>
            <span>{data.config.scheduleTime || '未设置'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: 24 }}>
            <span style={{ opacity: 0.7 }}>状态</span>
            <span>{statusText}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.7 }}>初始变量</span>
            <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
              {data.config.initialPayload || '未设置'}
            </span>
          </div>
        </div>
      );
    }

    if (node.type === 'aiNode') {
      const data = node.data as AINodeData;
      const historyMode = (data.config.historyPolicy as 'none' | 'node') || 'none';
      const historyText = historyMode === 'node' ? '节点会话' : '无记忆';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>对话 AI</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: 24 }}>
            <span style={{ opacity: 0.7 }}>会话模型</span>
            <span>{data.config.modelId || '未选择'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', columnGap: 24 }}>
            <span style={{ opacity: 0.7 }}>记忆模式</span>
            <span>{historyText}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ opacity: 0.7 }}>系统消息 / 角色设定</span>
            <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
              {data.config.systemPrompt || '未设置'}
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

      {hoverDetail && uiStore.nodeDisplayMode === 'compact' && !uiStore.isDraggingNode && (
        <div
          className={styles.nodeDetailOverlay}
          style={{ left: hoverDetail.position.x + 12, top: hoverDetail.position.y + 12 }}
        >
          {renderHoverDetailContent(hoverDetail.node)}
        </div>
      )}

      {uiStore.nodeContextMenuVisible && uiStore.nodeContextMenuPosition && (
        <div
          className={styles.nodeContextMenu}
          style={{ left: uiStore.nodeContextMenuPosition.x, top: uiStore.nodeContextMenuPosition.y }}
        >
          <div
            className={styles.nodeContextMenuItem}
            onClick={() => {
              workflowStore.deleteSelectedElements();
              uiStore.hideNodeContextMenu();
            }}
          >
            删除节点
          </div>
        </div>
      )}
      {/* Header */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(to bottom left, #fd5d93, #ec250d)', borderRadius: 4 }}></div>
          <h1>Flodai 工作台 · {currentProject.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button ghost size="small" onClick={onBackHome}>
            返回首页
          </Button>
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
        <div
          className={styles.canvas}
          ref={canvasRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => uiStore.hideNodeContextMenu()}
        >
          <ReactFlow<FlowNode, FlowEdge>
            proOptions={{ hideAttribution: true }}
            nodes={toJS(workflowStore.nodes) as FlowNode[]}
            edges={toJS(workflowStore.edges) as FlowEdge[]}
            onNodesChange={workflowStore.onNodesChange}
            onEdgesChange={workflowStore.onEdgesChange}
            onConnect={(connection) => {
              workflowStore.onConnect(connection);
              playConnectSound();
            }}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            colorMode="dark"
            onNodeDragStart={() => uiStore.setIsDraggingNode(true)}
            onNodeDragStop={() => {
              uiStore.setIsDraggingNode(false);
              uiStore.hideNodeHoverDetail();
            }}
            onNodeDoubleClick={(_, node) => {
              setConfigNodeId(node.id);
            }}
            onNodeContextMenu={(event) => {
              event.preventDefault();
              uiStore.showNodeContextMenu({ x: event.clientX, y: event.clientY });
            }}
          >
            <Background color="#333" gap={20} />
            <Controls style={{ fill: '#fff' }} />
            <MiniMap style={{ backgroundColor: '#27293d' }} nodeColor="#fd5d93" />
          </ReactFlow>
        </div>

      </div>

      {configNodeId &&
        (() => {
          const node = workflowStore.nodes.find((item) => item.id === configNodeId) as FlowNode | undefined;
          if (!node) {
            return null;
          }
          const incoming = workflowStore.edges.filter((edge) => edge.target === node.id);
          const outgoing = workflowStore.edges.filter((edge) => edge.source === node.id);
          const prevNodes = incoming
            .map((edge) => workflowStore.nodes.find((n) => n.id === edge.source) as FlowNode | undefined)
            .filter(Boolean) as FlowNode[];
          const nextNodes = outgoing
            .map((edge) => workflowStore.nodes.find((n) => n.id === edge.target) as FlowNode | undefined)
            .filter(Boolean) as FlowNode[];
          const title =
            node.type === 'triggerNode'
              ? '触发器'
              : node.type === 'aiNode'
                ? '对话 AI'
                : '节点';
          return (
            <Modal
              open
              title={`节点配置 · ${title}`}
              onCancel={() => setConfigNodeId(null)}
              footer={null}
              width={960}
              centered
            >
              <div style={{ display: 'flex', gap: 16, height: 420 }}>
                <div
                  style={{
                    width: 220,
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    paddingRight: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--lc-text-secondary)', marginBottom: 4 }}>上一个节点的输出</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
                    {prevNodes.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>暂无上游节点</div>
                    )}
                    {prevNodes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: '#52c41a',
                          }}
                        />
                        <span style={{ fontSize: 12, color: '#fff' }}>{n.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" type="primary">
                      菜单1
                    </Button>
                    <Button size="small">菜单2</Button>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: 12,
                      overflowY: 'auto',
                    }}
                  >
                    {node.type === 'triggerNode' && (() => {
                      const data = node.data as TriggerNodeData;
                      const enabled = data.config.enabled ?? true;
                      const mode = data.config.mode ?? 'manual';
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>名称</span>
                            <Input
                              size="small"
                              value={data.name}
                              onChange={(e) =>
                                workflowStore.updateNodeData(node.id, {
                                  name: e.target.value,
                                } as Partial<TriggerNodeData>)
                              }
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>启用</span>
                            <Switch
                              checked={enabled}
                              onChange={(checked) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: {
                                    ...data.config,
                                    enabled: checked,
                                  },
                                } as Partial<TriggerNodeData>)
                              }
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>触发模式</span>
                            <Radio.Group
                              size="small"
                              value={mode}
                              onChange={(e) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: {
                                    ...data.config,
                                    mode: e.target.value,
                                  },
                                } as Partial<TriggerNodeData>)
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
                              value={data.config.scheduleTime || ''}
                                onChange={(e) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: {
                                    ...data.config,
                                    scheduleTime: e.target.value,
                                  },
                                } as Partial<TriggerNodeData>)
                                }
                              />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>初始变量（JSON）</span>
                            <Input.TextArea
                              placeholder='例如：{"userId":"123","topic":"日报总结"}'
                              rows={4}
                              value={data.config.initialPayload || ''}
                              onChange={(e) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: {
                                    ...data.config,
                                    initialPayload: e.target.value,
                                  },
                                } as Partial<TriggerNodeData>)
                              }
                            />
                          </div>
                          <Button
                            type="primary"
                            size="small"
                            style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
                            onClick={() => workflowStore.runTrigger(node.id, 'manual')}
                          >
                            立即运行
                          </Button>
                        </div>
                      );
                    })()}
                    {node.type === 'aiNode' && (() => {
                      const data = node.data as AINodeData;
                      const config = data.config;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>模型</span>
                            <Select
                              size="small"
                              value={config.modelId}
                              onChange={(value) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: { ...config, modelId: value },
                                } as Partial<AINodeData>)
                              }
                              options={[
                                { label: 'GPT-4o', value: 'gpt-4o' },
                                { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
                                { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                              ]}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>系统提示词 (System Prompt)</span>
                            <Input.TextArea
                              rows={6}
                              value={config.systemPrompt}
                              onChange={(e) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: { ...config, systemPrompt: e.target.value },
                                } as Partial<AINodeData>)
                              }
                              placeholder="设定 AI 的角色和行为..."
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>历史记录策略</span>
                            <Radio.Group
                              size="small"
                              value={config.historyPolicy}
                              onChange={(e) =>
                                workflowStore.updateNodeData(node.id, {
                                  config: { ...config, historyPolicy: e.target.value },
                                } as Partial<AINodeData>)
                              }
                            >
                              <Radio.Button value="none">无记忆</Radio.Button>
                              <Radio.Button value="node">节点级记忆</Radio.Button>
                            </Radio.Group>
                          </div>
                        </div>
                      );
                    })()}
                    {node.type !== 'triggerNode' && node.type !== 'aiNode' && (
                      <div style={{ fontSize: 13, color: 'var(--lc-text-secondary)' }}>
                        当前节点的属性配置暂未实现。
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: 220,
                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                    paddingLeft: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--lc-text-secondary)', marginBottom: 4 }}>下一个节点的输入</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
                    {nextNodes.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>暂无下游节点</div>
                    )}
                    {nextNodes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 999,
                            background: '#faad14',
                          }}
                        />
                        <span style={{ fontSize: 12, color: '#fff' }}>{n.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Modal>
          );
        })()}

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
  const [projects, setProjects] = useState<Project[]>(demoProjects);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleOpenProject = (project: Project) => {
    const state = { projectId: project.id };
    try {
      window.history.pushState(state, '', '/editor');
    } catch {
    }
    setCurrentProject(project);
  };

  const handleBackHome = () => {
    try {
      window.history.pushState({}, '', '/');
    } catch {
    }
    setCurrentProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((item) => item.id !== projectId));
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
      try {
        window.history.pushState({}, '', '/');
      } catch {
      }
    }
  };

  const handleDuplicateProject = (projectId: string) => {
    setProjects((prev) => {
      const source = prev.find((item) => item.id === projectId);
      if (!source) return prev;
      const copy: Project = {
        ...source,
        id: uuidv4(),
        name: `${source.name} - 副本`,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      const index = prev.findIndex((item) => item.id === projectId);
      if (index === -1) return [...prev, copy];
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const handleCreateProject = (payload: { name: string; description: string }) => {
    const newProject: Project = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description || '暂无描述',
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setProjects((prev) => [newProject, ...prev]);
    handleOpenProject(newProject);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/editor') {
        const historyState = window.history.state as { projectId?: string } | null;
        const targetId = historyState?.projectId;
        const project =
          projects.find((item) => item.id === targetId) || projects[0] || null;
        setCurrentProject(project);
      } else {
        setCurrentProject(null);
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [projects]);

  return (
    <ConfigProvider theme={appTheme}>
      <RootStoreContext.Provider value={rootStore}>
        {currentProject ? (
          <Editor currentProject={currentProject} onBackHome={handleBackHome} />
        ) : (
          <Home
            projects={projects}
            onOpenProject={handleOpenProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onCreateProject={handleCreateProject}
          />
        )}
      </RootStoreContext.Provider>
    </ConfigProvider>
  );
}

export default App;
