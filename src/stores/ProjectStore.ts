import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';
import type { Project } from '../types/project';

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

export class ProjectStore {
  rootStore: RootStore;
  projects: Project[] = demoProjects;
  currentProject: Project | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setProjects(projects: Project[]) {
    this.projects = projects;
  }

  setCurrentProject(project: Project | null) {
    this.currentProject = project;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }
}
