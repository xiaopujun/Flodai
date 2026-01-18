import { Button } from 'antd';
import { FolderKanban } from 'lucide-react';
import styles from './Home.module.less';

type SettingsPageProps = {
  workspacePath: string;
  onSelectWorkspace: () => void;
};

export function SettingsPage({ workspacePath, onSelectWorkspace }: SettingsPageProps) {
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
                onClick={onSelectWorkspace}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

