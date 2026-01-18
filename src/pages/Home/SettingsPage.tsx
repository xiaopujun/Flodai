import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { FolderKanban } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { Store } from '@tauri-apps/plugin-store';
import styles from './Home.module.less';

export function SettingsPage() {
  const CONFIG_STORE_NAME = 'config.json';
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
              <span className={styles.settingsWorkspaceValue}>{workspacePath || ''}</span>
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
  );
}
