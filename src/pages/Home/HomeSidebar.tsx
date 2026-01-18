import { FolderKanban, Settings2, Info, Cpu } from 'lucide-react';
import styles from './Home.module.less';

type MenuKey = 'projects' | 'models' | 'settings' | 'about';

type HomeSidebarProps = {
  activeMenu: MenuKey;
  onChange: (menu: MenuKey) => void;
};

export function HomeSidebar({ activeMenu, onChange }: HomeSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar} />
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>Flodai 管理员</div>
          <div className={styles.profileRole}>工作流控制台</div>
        </div>
      </div>

      <nav className={styles.navList}>
        <div
          className={`${styles.navItem} ${activeMenu === 'projects' ? styles.navItemActive : ''}`}
          onClick={() => onChange('projects')}
        >
          <div className={styles.navDot}>
            <FolderKanban size={16} />
          </div>
          <span>项目列表</span>
        </div>
        <div
          className={`${styles.navItem} ${activeMenu === 'models' ? styles.navItemActive : ''}`}
          onClick={() => onChange('models')}
        >
          <div className={styles.navDot}>
            <Cpu size={16} />
          </div>
          <span>模型管理</span>
        </div>
        <div
          className={`${styles.navItem} ${activeMenu === 'settings' ? styles.navItemActive : ''}`}
          onClick={() => onChange('settings')}
        >
          <div className={styles.navDot}>
            <Settings2 size={16} />
          </div>
          <span>系统设置</span>
        </div>
        <div
          className={`${styles.navItem} ${activeMenu === 'about' ? styles.navItemActive : ''}`}
          onClick={() => onChange('about')}
        >
          <div className={styles.navDot}>
            <Info size={16} />
          </div>
          <span>关于 Flodai</span>
        </div>
      </nav>
    </aside>
  );
}

