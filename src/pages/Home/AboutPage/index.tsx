import styles from '../Home.module.less';

export function AboutPage() {
  return (
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
  );
}
