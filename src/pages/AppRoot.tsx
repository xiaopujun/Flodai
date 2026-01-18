import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Home } from './Home';
import { Editor } from './Editor';
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

export function AppRoot() {
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

  if (currentProject) {
    return <Editor currentProject={currentProject} onBackHome={handleBackHome} />;
  }

  return (
    <Home
      projects={projects}
      onOpenProject={handleOpenProject}
      onDeleteProject={handleDeleteProject}
      onDuplicateProject={handleDuplicateProject}
      onCreateProject={handleCreateProject}
    />
  );
}

