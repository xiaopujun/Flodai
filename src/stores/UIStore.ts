import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

type ConsoleLogLevel = 'info' | 'success' | 'error';

interface ConsoleLogItem {
  id: string;
  level: ConsoleLogLevel;
  message: string;
}

export class UIStore {
  rootStore: RootStore;
  isConsoleOpen: boolean = true;
  sidebarWidth: number = 260;
  nodeDisplayMode: 'compact' | 'detailed' = 'detailed';

  logs: ConsoleLogItem[] = [
    { id: 'init-1', level: 'info', message: '[10:00:01] 系统已初始化。' },
    { id: 'init-2', level: 'success', message: '[10:00:02] Rust 后端已连接。' },
    { id: 'init-3', level: 'info', message: '[10:00:02] 准备执行工作流。' },
  ];

  hoverDetailNodeId: string | null = null;
  hoverDetailPosition: { x: number; y: number } | null = null;
  isDraggingNode: boolean = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  toggleConsole() {
    this.isConsoleOpen = !this.isConsoleOpen;
  }

  appendLog(level: ConsoleLogLevel, message: string) {
    const id = `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.logs.push({ id, level, message });
  }

  setNodeDisplayMode(mode: 'compact' | 'detailed') {
    this.nodeDisplayMode = mode;
  }

  showNodeHoverDetail(id: string, position: { x: number; y: number }) {
    this.hoverDetailNodeId = id;
    this.hoverDetailPosition = position;
  }

  hideNodeHoverDetail() {
    this.hoverDetailNodeId = null;
    this.hoverDetailPosition = null;
  }

  setIsDraggingNode(isDragging: boolean) {
    this.isDraggingNode = isDragging;
  }
}
