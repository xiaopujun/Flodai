import { ReactFlow, Controls, Background, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from 'antd';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../stores/RootStore';
import styles from './Editor.module.less';
import { nodeTypes } from '../../components/nodes';
import { NodePalette } from '../../components/NodePalette';
import { NodeConfigModal } from '../../components/NodeConfigModal';
import type {
  FlowNode,
  FlowEdge,
  TriggerNodeData,
  TriggerNodeConfig,
} from '../../types/flow';
import type { Project } from '../../types/project';

type EditorProps = {
  currentProject: Project;
  onBackHome: () => void;
};

export const Editor = observer(({ currentProject, onBackHome }: EditorProps) => {
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
    (_nodeType: string, label: string, position: { x: number; y: number }) => {
      const id = uuidv4();

      const baseName = label || '节点';

      const node: FlowNode = {
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
      };

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

      <NodeConfigModal
        open={Boolean(configNodeId)}
        nodeId={configNodeId}
        onClose={() => setConfigNodeId(null)}
      />

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
