import { useEffect, useState } from 'react';
import { Button, Dropdown } from 'antd';
import { FolderKanban, Settings2, Info, Cpu } from 'lucide-react';
import { MoreOutlined } from '@ant-design/icons';
import { open } from '@tauri-apps/plugin-dialog';
import { Store } from '@tauri-apps/plugin-store';
import { ModelManager } from './ModelManager';
import styles from './Home.module.less';

type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
};

type HomeProps = {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
};

export function Home({
  projects,
  onOpenProject,
  onDeleteProject,
  onDuplicateProject,
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
            className={`${styles.navItem} ${activeMenu === 'projects' ? styles.navItemActive : ''
              }`}
            onClick={() => setActiveMenu('projects')}
          >
            <div className={styles.navDot}>
              <FolderKanban size={16} />
            </div>
            <span>项目列表</span>
          </div>
          <div
            className={`${styles.navItem} ${activeMenu === 'models' ? styles.navItemActive : ''
              }`}
            onClick={() => setActiveMenu('models')}
          >
            <div className={styles.navDot}>
              <Cpu size={16} />
            </div>
            <span>模型管理</span>
          </div>
          <div
            className={`${styles.navItem} ${activeMenu === 'settings' ? styles.navItemActive : ''
              }`}
            onClick={() => setActiveMenu('settings')}
          >
            <div className={styles.navDot}>
              <Settings2 size={16} />
            </div>
            <span>系统设置</span>
          </div>
          <div
            className={`${styles.navItem} ${activeMenu === 'about' ? styles.navItemActive : ''
              }`}
            onClick={() => setActiveMenu('about')}
          >
            <div className={styles.navDot}>
              <Info size={16} />
            </div>
            <span>关于 Flodai</span>
          </div>
        </nav>
      </aside>

      <main className={styles.main}>
        {activeMenu === 'projects' && (
          <>
            <div className={styles.topHeader}>
              <div className={styles.titleBlock}>
                <div className={styles.titleMain}>Flodai 项目控制台</div>
                <div className={styles.titleSub}>集中管理与分析所有工作流项目</div>
              </div>
              <Button
                type="primary"
                style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
              >
                新建项目
              </Button>
            </div>

            <section className={styles.summaryRow}>
              <div className={`${styles.summaryCard} ${styles.summaryCardPrimary}`}>
                <div className={styles.summaryTitle}>运行中项目</div>
                <div className={styles.summaryNumber}>3</div>
                <div className={styles.summaryDesc}>当前正在执行的自动化工作流</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.summaryCardSecondary}`}>
                <div className={styles.summaryTitle}>最近活跃</div>
                <div className={styles.summaryNumber}>12</div>
                <div className={styles.summaryDesc}>过去 24 小时内被触发的项目</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.summaryCardPurple}`}>
                <div className={styles.summaryTitle}>待优化节点</div>
                <div className={styles.summaryNumber}>5</div>
                <div className={styles.summaryDesc}>存在性能或错误告警的节点</div>
              </div>
              <div className={`${styles.summaryCard} ${styles.summaryCardDanger}`}>
                <div className={styles.summaryTitle}>告警事件</div>
                <div className={styles.summaryNumber}>2</div>
                <div className={styles.summaryDesc}>需要关注的失败执行或超时</div>
              </div>
            </section>


            <section className={styles.projectSection}>
              <div className={styles.projectHeader}>
                <div className={styles.projectTitle}>项目列表</div>
                <div className={styles.projectHint}>双击项目卡片进入编辑页面</div>
              </div>
              <div className={styles.projectGrid}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={styles.projectCard}
                    onDoubleClick={() => onOpenProject(project)}
                  >
                    <div className={styles.projectName}>{project.name}</div>
                    <div className={styles.projectDescription}>{project.description}</div>
                    <div className={styles.projectMeta}>
                      <span>最近更新：{project.updatedAt}</span>
                    </div>
                    <div className={styles.projectActionMenu}>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'duplicate', label: '复制项目' },
                            { key: 'delete', label: '删除项目' },
                          ],
                          onClick: ({ key }) => {
                            if (key === 'duplicate') {
                              onDuplicateProject(project.id);
                            }
                            if (key === 'delete') {
                              onDeleteProject(project.id);
                            }
                          },
                        }}
                        trigger={['click']}
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<MoreOutlined />}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </Dropdown>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeMenu === 'models' && <ModelManager />}

        {activeMenu === 'settings' && (
          <section className={styles.settingsSection}>
            <div className={styles.settingsPageHeader}>
              <div className={styles.settingsPageTitle}>系统设置</div>
              <div className={styles.settingsPageSubTitle}>
                配置 Flodai 的工作区与全局运行环境
              </div>
            </div>
            <div className={styles.settingsContent}>
              <div className={styles.settingsMain}>
                <div className={styles.settingsCard}>
                  <div className={styles.settingsCardLeft}>
                    <div className={styles.settingsTitle}>工作区设置</div>
                    <div className={styles.settingsDescription}>
                      工作区用于存放所有 Flodai 项目的文件与输出结果。选择一个文件夹作为工作空间后，后续所有项目都会在该文件夹内进行读写操作。
                    </div>
                  </div>
                  <div className={styles.settingsCardRight}>
                    <span className={styles.settingsWorkspaceValue}>
                      {workspacePath || ''}
                    </span>
                    <Button
                      type="text"
                      shape="circle"
                      icon={<FolderKanban size={16} />}
                      onClick={handleSelectWorkspace}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeMenu === 'about' && (
          <section className={styles.aboutSection}>
            <div className={styles.aboutCard}>
              <div className={styles.aboutTitle}>关于 Flodai</div>
              <div className={styles.aboutSubTitle}>可视化 AI 工作流编排器</div>
              <div className={styles.aboutBody}>
                Flodai 致力于将复杂的 AI 能力、自动化脚本与外部服务链接在一起，
                通过节点式画布让复杂逻辑一目了然。你可以在这里组合触发器、AI 节点、
                文件节点以及后续的 Agent 节点，快速搭建属于自己的自动化工作流。
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
