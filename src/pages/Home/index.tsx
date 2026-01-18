import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Store } from '@tauri-apps/plugin-store';
import styles from './Home.module.less';
import { HomeSidebar } from './HomeSidebar';
import { ProjectsPage } from './ProjectsPage';
import { ModelsPage } from './ModelsPage';
import { SettingsPage } from './SettingsPage';
import { AboutPage } from './AboutPage';
import type { Project } from '../../types/project';

type HomeProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onCreateProject: (payload: { name: string; description: string }) => void;
};

export function Home({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
  onCreateProject,
}: HomeProps) {
  const CONFIG_STORE_NAME = 'config.json';
  type MenuKey = 'projects' | 'models' | 'settings' | 'about';
  const [activeMenu, setActiveMenu] = useState<MenuKey>('projects');
  const [workspacePath, setWorkspacePath] = useState('');

  useEffect(() => {
    let canceled = false;

    const loadWorkspace = async () => {
      try {
        const store = await Store.load(CONFIG_STORE_NAME);
        const savedPath = await store.get<string>('workspace.path');
        if (!canceled && savedPath) {
          setWorkspacePath(savedPath);
        }
      } catch (error) {
        console.error('加载工作区配置失败', error);
      }
    };

    loadWorkspace();

    return () => {
      canceled = true;
    };
  }, []);

  const handleSelectWorkspace = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (!selected || typeof selected !== 'string') return;
      setWorkspacePath(selected);

      const store = await Store.load(CONFIG_STORE_NAME);
      await store.set('workspace.path', selected);
      await store.save();
    } catch (error) {
      console.error('选择工作区目录失败', error);
    }
  };

  return (
    <div className={styles.homeRoot}>
      <HomeSidebar activeMenu={activeMenu} onChange={setActiveMenu} />

      <main className={styles.main}>
        {activeMenu === 'projects' && (
          <ProjectsPage
            projects={projects}
            onOpenProject={onOpenProject}
            onDeleteProject={onDeleteProject}
            onDuplicateProject={onDuplicateProject}
            onCreateProject={onCreateProject}
          />
        )}
        {activeMenu === 'models' && <ModelsPage />}
        {activeMenu === 'settings' && (
          <SettingsPage workspacePath={workspacePath} onSelectWorkspace={handleSelectWorkspace} />
        )}
        {activeMenu === 'about' && <AboutPage />}
      </main>
    </div>
  );
}
