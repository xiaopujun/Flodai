import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Dropdown, Form, Input, Modal } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import styles from '../Home.module.less';
import type { Project } from '../../../types/project';
import { useStore } from '../../../stores/RootStore';

export const ProjectsPage = observer(() => {
  const { projectStore } = useStore();
  const navigate = useNavigate();
  const [createProjectModalVisible, setCreateProjectModalVisible] = useState(false);
  const [createProjectSubmitting, setCreateProjectSubmitting] = useState(false);
  const [projectForm] = Form.useForm<{ name: string; description: string }>();

  const handleOpenProject = (project: Project) => {
    projectStore.setCurrentProject(project);
    navigate(`/editor/${project.id}`);
  };

  const handleDeleteProject = (projectId: string) => {
    const newProjects = projectStore.projects.filter((item) => item.id !== projectId);
    projectStore.setProjects(newProjects);
  };

  const handleDuplicateProject = (projectId: string) => {
    const source = projectStore.projects.find((p) => p.id === projectId);
    if (!source) return;
    const newProject: Project = {
      ...source,
      id: uuidv4(),
      name: `${source.name} (复制)`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    projectStore.setProjects([newProject, ...projectStore.projects]);
  };

  const handleCreateProject = (payload: { name: string; description: string }) => {
    const newProject: Project = {
      id: uuidv4(),
      name: payload.name,
      description: payload.description,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    projectStore.setProjects([newProject, ...projectStore.projects]);
    handleOpenProject(newProject);
  };

  const handleOpenCreateProjectModal = () => {
    projectForm.resetFields();
    setCreateProjectModalVisible(true);
  };

  const handleSubmitCreateProject = async () => {
    try {
      const values = await projectForm.validateFields();
      setCreateProjectSubmitting(true);
      handleCreateProject({
        name: values.name,
        description: values.description || '',
      });
      setCreateProjectModalVisible(false);
    } catch (error) {
      console.error('创建项目失败', error);
    } finally {
      setCreateProjectSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.topHeader}>
        <div className={styles.titleBlock}>
          <div className={styles.titleMain}>Flodai 项目控制台</div>
          <div className={styles.titleSub}>集中管理与分析所有工作流项目</div>
        </div>
        <Button
          type="primary"
          style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
          onClick={handleOpenCreateProjectModal}
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
          {projectStore.projects.map((project) => (
            <div
              key={project.id}
              className={styles.projectCard}
              onDoubleClick={() => handleOpenProject(project)}
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
                        handleDuplicateProject(project.id);
                      }
                      if (key === 'delete') {
                        handleDeleteProject(project.id);
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

      <Modal
        open={createProjectModalVisible}
        title="新建项目"
        onCancel={() => setCreateProjectModalVisible(false)}
        onOk={handleSubmitCreateProject}
        confirmLoading={createProjectSubmitting}
        okText="创建并进入编辑"
        cancelText="取消"
        centered
      >
        <div className={styles.modelsModalBody}>
          <div className={styles.modelsModalIntro}>
            <div className={styles.modelsModalTitle}>创建新的工作流项目</div>
            <div className={styles.modelsModalDesc}>
              为你的工作流起一个清晰的名字，并补充简要介绍，方便后续管理与查找。
            </div>
          </div>
          <Form form={projectForm} layout="vertical" className={styles.modelsModalForm}>
            <div className={styles.modelsModalGrid}>
              <Form.Item
                name="name"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="例如：日报生成助手" />
              </Form.Item>
              <Form.Item name="description" label="项目简介" rules={[]}>
                <Input placeholder="简要描述项目的用途与目标" />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
});
