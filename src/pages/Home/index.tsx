import { useState } from 'react';
import styles from './Home.module.less';
import { HomeSidebar } from './HomeSidebar';
import { ProjectsPage } from './ProjectsPage';
import { ModelsPage } from './ModelsPage';
import { SettingsPage } from './SettingsPage';
import { AboutPage } from './AboutPage';

export function Home() {
  type MenuKey = 'projects' | 'models' | 'settings' | 'about';
  const [activeMenu, setActiveMenu] = useState<MenuKey>('projects');

  const pageMap: Record<MenuKey, React.ReactNode> = {
    projects: <ProjectsPage />,
    models: <ModelsPage />,
    settings: <SettingsPage />,
    about: <AboutPage />,
  };

  return (
    <div className={styles.homeRoot}>
      <HomeSidebar activeMenu={activeMenu} onChange={setActiveMenu} />

      <main className={styles.main}>
        {pageMap[activeMenu]}
      </main>
    </div>
  );
}
