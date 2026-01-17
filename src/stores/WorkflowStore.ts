import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import { OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';
import type {
  FlowNode,
  FlowEdge,
  AINodeData,
  FileNodeData,
  TriggerNodeData,
  PythonScriptNodeData,
} from '../types/flow';

function formatTime(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export class WorkflowStore {
  rootStore: RootStore;
  
  nodes: FlowNode[] = [];

  edges: FlowEdge[] = [];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.startScheduler();
  }

  onNodesChange: OnNodesChange<FlowNode> = (changes) => {
    this.nodes = applyNodeChanges(changes, this.nodes);
  };

  onEdgesChange: OnEdgesChange<FlowEdge> = (changes) => {
    this.edges = applyEdgeChanges(changes, this.edges);
  };

  onConnect = (connection: Connection) => {
    this.edges = addEdge(connection, this.edges);
  };

  addNode(node: FlowNode) {
    this.nodes = [...this.nodes, node];
  }

  updateNodeData(
    id: string,
    data: Partial<AINodeData> | Partial<FileNodeData> | Partial<TriggerNodeData> | Partial<PythonScriptNodeData>,
  ) {
    this.nodes = this.nodes.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...data } } as FlowNode;
      }
      return node;
    });
  }

  runTrigger(id: string, source: 'manual' | 'schedule' = 'manual') {
    const node = this.nodes.find((n) => n.id === id && n.type === 'triggerNode');
    if (!node) return;

    const data = node.data as TriggerNodeData;
    const enabled = data.enabled ?? true;

    if (!enabled) {
      const time = formatTime(new Date());
      this.rootStore.uiStore.appendLog('info', `[${time}] 触发器「${data.label || '触发器'}」已停用，跳过执行。`);
      return;
    }

    const now = new Date();
    const time = formatTime(now);
    const mode = data.mode ?? 'manual';

    this.rootStore.uiStore.appendLog(
      'info',
      `[${time}] 触发器「${data.label || '触发器'}」已执行（模式：${source === 'manual' ? '手动' : '定时'}，配置：${
        mode === 'manual' ? '手动触发' : '定时触发'
      }）。`,
    );

    const rawPayload = (data.initialPayload || '').trim();

    if (rawPayload) {
      try {
        const parsed = JSON.parse(rawPayload);
        const preview = truncate(JSON.stringify(parsed), 120);
        this.rootStore.uiStore.appendLog('info', `初始变量：${preview}`);
      } catch (error) {
        this.rootStore.uiStore.appendLog(
          'error',
          `初始变量 JSON 解析失败，已忽略本次初始变量。`,
        );
      }
    }

    this.updateNodeData(id, { lastRunAt: now.toISOString() });
  }

  runAllEnabledTriggers() {
    const triggers = this.nodes.filter((node) => node.type === 'triggerNode');
    if (triggers.length === 0) {
      const time = formatTime(new Date());
      this.rootStore.uiStore.appendLog('info', `[${time}] 当前工作流中没有可用的触发节点。`);
      return;
    }

    triggers.forEach((node) => {
      const data = node.data as TriggerNodeData;
      const enabled = data.enabled ?? true;
      if (!enabled) return;
      this.runTrigger(node.id, 'manual');
    });
  }

  private startScheduler() {
    setInterval(() => {
      this.checkScheduledTriggers();
    }, 1000);
  }

  private checkScheduledTriggers() {
    const now = new Date();

    this.nodes.forEach((node) => {
      if (node.type !== 'triggerNode') return;

      const data = node.data as TriggerNodeData;
      const enabled = data.enabled ?? true;
      if (!enabled) return;

      if (data.mode !== 'scheduleOnce') return;
      if (!data.scheduleTime) return;

      const scheduled = new Date(data.scheduleTime.replace(' ', 'T'));
      if (Number.isNaN(scheduled.getTime())) return;

      if (data.lastRunAt) {
        const lastRun = new Date(data.lastRunAt);
        if (!Number.isNaN(lastRun.getTime()) && lastRun.getTime() >= scheduled.getTime()) {
          return;
        }
      }

      if (now.getTime() >= scheduled.getTime()) {
        this.runTrigger(node.id, 'schedule');
      }
    });
  }
}
