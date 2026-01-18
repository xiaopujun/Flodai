import { useEffect, useState } from 'react';
import { Button, Dropdown, Form, Input, Modal, Select } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Store } from '@tauri-apps/plugin-store';
import openaiLogo from '../../../assets/image/model-openai.svg';
import deepseekLogo from '../../../assets/image/model-deepseek.svg';
import aliLogo from '../../../assets/image/model-qwen.svg';
import baiduLogo from '../../../assets/image/model-baidu.svg';
import genericLogo from '../../../assets/image/model-generic.svg';
import styles from '../Home.module.less';

type ModelConfig = {
  id: string;
  name: string;
  provider: string;
  apiBaseUrl: string;
  apiKey: string;
};

const MODELS_STORE_NAME = 'models.json';

const encryptText = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const salt = encoder.encode('flodai-models-salt');
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode('flodai-models-secret'),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv, 0);
  combined.set(encryptedBytes, iv.length);
  let binary = '';
  for (let i = 0; i < combined.length; i += 1) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
};

const decryptText = async (cipherText: string) => {
  const binary = atob(cipherText);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const encoder = new TextEncoder();
  const salt = encoder.encode('flodai-models-salt');
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode('flodai-models-secret'),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};

export function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [modelModalSubmitting, setModelModalSubmitting] = useState(false);
  const [modelForm] = Form.useForm<ModelConfig>();
  const [editingModelId, setEditingModelId] = useState<string | null>(null);

  const providerConfig: Record<
    string,
    {
      label: string;
      logo: string;
    }
  > = {
    deepseek: {
      label: 'DeepSeek',
      logo: deepseekLogo,
    },
    openai: {
      label: 'OpenAI / 兼容接口',
      logo: openaiLogo,
    },
    ali: {
      label: '阿里通义',
      logo: aliLogo,
    },
    baidu: {
      label: '百度文心',
      logo: baiduLogo,
    },
    custom: {
      label: '自定义',
      logo: genericLogo,
    },
  };

  const getProviderLabel = (value: string) => {
    const config = providerConfig[value];
    if (config) {
      return config.label;
    }
    return value;
  };

  const getProviderLogo = (value: string) => {
    const config = providerConfig[value];
    if (config) {
      return config.logo;
    }
    return genericLogo;
  };

  useEffect(() => {
    let canceled = false;

    const loadModels = async () => {
      try {
        const store = await Store.load(MODELS_STORE_NAME);
        const encrypted = await store.get<string>('models');
        if (!encrypted) {
          return;
        }
        const json = await decryptText(encrypted);
        const parsed = JSON.parse(json) as ModelConfig[];
        if (!canceled && Array.isArray(parsed)) {
          setModels(parsed);
        }
      } catch (error) {
        console.error('加载模型配置失败', error);
      }
    };

    loadModels();

    return () => {
      canceled = true;
    };
  }, []);

  const handleCreateModel = () => {
    modelForm.resetFields();
    setEditingModelId(null);
    setModelModalVisible(true);
  };

  const handleEditModel = (model: ModelConfig) => {
    setEditingModelId(model.id);
    modelForm.setFieldsValue({
      name: model.name,
      provider: model.provider,
      apiBaseUrl: model.apiBaseUrl,
      apiKey: model.apiKey,
    });
    setModelModalVisible(true);
  };

  const handleDeleteModel = (model: ModelConfig) => {
    Modal.confirm({
      title: '删除模型',
      content: '确定要删除该模型配置吗？此操作不可恢复。',
      okText: '删除',
      cancelText: '取消',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        const nextModels = models.filter((item) => item.id !== model.id);
        setModels(nextModels);
        const store = await Store.load(MODELS_STORE_NAME);
        const encrypted = await encryptText(JSON.stringify(nextModels));
        await store.set('models', encrypted);
        await store.save();
      },
    });
  };

  const handleSubmitModel = async () => {
    try {
      const values = await modelForm.validateFields();
      setModelModalSubmitting(true);
      let nextModels: ModelConfig[] = [];
      if (editingModelId) {
        nextModels = models.map((item) =>
          item.id === editingModelId
            ? {
              ...item,
              name: values.name,
              provider: values.provider,
              apiBaseUrl: values.apiBaseUrl,
              apiKey: values.apiKey,
            }
            : item
        );
      } else {
        const newModel: ModelConfig = {
          id: `${Date.now()}`,
          name: values.name,
          provider: values.provider,
          apiBaseUrl: values.apiBaseUrl,
          apiKey: values.apiKey,
        };
        nextModels = [...models, newModel];
      }
      setModels(nextModels);
      const store = await Store.load(MODELS_STORE_NAME);
      const encrypted = await encryptText(JSON.stringify(nextModels));
      await store.set('models', encrypted);
      await store.save();
      setModelModalVisible(false);
    } catch (error) {
      console.error('保存模型配置失败', error);
    } finally {
      setModelModalSubmitting(false);
    }
  };

  return (
    <section className={styles.modelsSection}>
      <div className={styles.modelsHeader}>
        <div className={styles.modelsHeaderText}>
          <div className={styles.modelsTitle}>模型管理</div>
          <div className={styles.modelsSubTitle}>配置与管理 Flodai 中使用的 AI 模型</div>
        </div>
        <Button
          type="primary"
          style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
          onClick={handleCreateModel}
        >
          添加模型
        </Button>
      </div>

      <div className={styles.modelsCard}>
        <div className={styles.modelsBody}>
          {models.length === 0 && (
            <div className={styles.modelsEmpty}>暂无已配置的模型，点击右上角添加模型。</div>
          )}
          {models.length > 0 && (
            <div className={styles.modelsCardGrid}>
              {models.map((item) => (
                <div key={item.id} className={styles.modelsCardItem}>
                  <div className={styles.modelsCardHeader}>
                    <div className={styles.modelsCardLogo}>
                      <img
                        src={getProviderLogo(item.provider)}
                        alt={getProviderLabel(item.provider)}
                        className={styles.modelsCardLogoImg}
                      />
                    </div>
                    <div className={styles.modelsCardMain}>
                      <div className={styles.modelsCardName}>{item.name}</div>
                      <div className={styles.modelsCardProvider}>
                        {getProviderLabel(item.provider)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.modelsCardMeta}>{item.apiBaseUrl}</div>
                  <div className={styles.modelsCardFooter}>
                    <div className={styles.modelsCardHint}>密钥已加密存储</div>
                    <div className={styles.modelsCardActionMenu}>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', label: '编辑模型' },
                            { key: 'delete', label: '删除模型' },
                          ],
                          onClick: ({ key }) => {
                            if (key === 'edit') {
                              handleEditModel(item);
                            }
                            if (key === 'delete') {
                              handleDeleteModel(item);
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modelModalVisible}
        title="添加模型"
        onCancel={() => setModelModalVisible(false)}
        onOk={handleSubmitModel}
        confirmLoading={modelModalSubmitting}
        okText="保存"
        cancelText="取消"
        centered
      >
        <div className={styles.modelsModalBody}>
          <div className={styles.modelsModalIntro}>
            <div className={styles.modelsModalTitle}>新增模型配置</div>
            <div className={styles.modelsModalDesc}>
              填写模型基础信息与调用凭证，Flodai 会为你安全加密保存。
            </div>
          </div>
          <Form
            form={modelForm}
            layout="vertical"
            initialValues={{ provider: 'openai' }}
            className={styles.modelsModalForm}
          >
            <div className={styles.modelsModalGrid}>
              <Form.Item
                name="name"
                label="模型名称"
                rules={[{ required: true, message: '请输入模型名称' }]}
              >
                <Input placeholder="例如：主用 GPT-4.1" />
              </Form.Item>
              <Form.Item
                name="provider"
                label="模型提供商"
                rules={[{ required: true, message: '请选择模型提供商' }]}
              >
                <Select
                  options={[
                    { label: 'DeepSeek', value: 'deepseek' },
                    { label: 'OpenAI / 兼容接口', value: 'openai' },
                    { label: '阿里通义', value: 'ali' },
                    { label: '百度文心', value: 'baidu' },
                    { label: '自定义', value: 'custom' },
                  ]}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="apiBaseUrl"
              label="接口地址"
              rules={[{ required: true, message: '请输入接口地址' }]}
            >
              <Input placeholder="例如：https://api.openai.com/v1" />
            </Form.Item>
            <Form.Item
              name="apiKey"
              label="密钥 / Token"
              rules={[{ required: true, message: '请输入密钥' }]}
            >
              <Input.Password placeholder="用于调用模型的私密密钥" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </section>
  );
}
