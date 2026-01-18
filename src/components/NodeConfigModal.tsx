import { Modal, Button, Input, Radio, Switch } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/RootStore';
import type { FlowNode, TriggerNodeData } from '../types/flow';

interface NodeConfigModalProps {
  open: boolean;
  nodeId: string | null;
  onClose: () => void;
}

export const NodeConfigModal = observer(({ open, nodeId, onClose }: NodeConfigModalProps) => {
  const { workflowStore } = useStore();

  if (!open || !nodeId) {
    return null;
  }

  const node = workflowStore.nodes.find((item) => item.id === nodeId) as FlowNode | undefined;
  if (!node) {
    return null;
  }

  const incoming = workflowStore.edges.filter((edge) => edge.target === node.id);
  const outgoing = workflowStore.edges.filter((edge) => edge.source === node.id);
  const prevNodes = incoming
    .map((edge) => workflowStore.nodes.find((n) => n.id === edge.source) as FlowNode | undefined)
    .filter(Boolean) as FlowNode[];
  const nextNodes = outgoing
    .map((edge) => workflowStore.nodes.find((n) => n.id === edge.target) as FlowNode | undefined)
    .filter(Boolean) as FlowNode[];

  const title =
    node.type === 'triggerNode'
      ? '触发器'
      : '节点';

  return (
    <Modal
      open={open}
      title={`节点配置 · ${title}`}
      onCancel={onClose}
      footer={null}
      width={960}
      centered
    >
      <div style={{ display: 'flex', gap: 16, height: 420 }}>
        <div
          style={{
            width: 220,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            paddingRight: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--lc-text-secondary)', marginBottom: 4 }}>上一个节点的输出</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
            {prevNodes.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>暂无上游节点</div>
            )}
            {prevNodes.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: '#52c41a',
                  }}
                />
                <span style={{ fontSize: 12, color: '#fff' }}>{n.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" type="primary">
              菜单1
            </Button>
            <Button size="small">菜单2</Button>
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: 12,
              overflowY: 'auto',
            }}
          >
            {node.type === 'triggerNode' && (() => {
              const data = node.data as TriggerNodeData;
              const enabled = data.config.enabled ?? true;
              const mode = data.config.mode ?? 'manual';
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>名称</span>
                    <Input
                      size="small"
                      value={data.name}
                      onChange={(e) =>
                        workflowStore.updateNodeData(node.id, {
                          name: e.target.value,
                        } as Partial<TriggerNodeData>)
                      }
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>启用</span>
                    <Switch
                      checked={enabled}
                      onChange={(checked) =>
                        workflowStore.updateNodeData(node.id, {
                          config: {
                            ...data.config,
                            enabled: checked,
                          },
                        } as Partial<TriggerNodeData>)
                      }
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>触发模式</span>
                    <Radio.Group
                      size="small"
                      value={mode}
                      onChange={(e) =>
                        workflowStore.updateNodeData(node.id, {
                          config: {
                            ...data.config,
                            mode: e.target.value,
                          },
                        } as Partial<TriggerNodeData>)
                      }
                    >
                      <Radio.Button value="manual">手动触发</Radio.Button>
                      <Radio.Button value="scheduleOnce">定时触发（一次）</Radio.Button>
                    </Radio.Group>
                  </div>
                  {mode === 'scheduleOnce' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>执行时间</span>
                      <Input
                        size="small"
                        placeholder="例如：2026-01-18 09:00"
                        value={data.config.scheduleTime || ''}
                        onChange={(e) =>
                          workflowStore.updateNodeData(node.id, {
                            config: {
                              ...data.config,
                              scheduleTime: e.target.value,
                            },
                          } as Partial<TriggerNodeData>)
                        }
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>初始变量（JSON）</span>
                    <Input.TextArea
                      placeholder='例如：{"userId":"123","topic":"日报总结"}'
                      rows={4}
                      value={data.config.initialPayload || ''}
                      onChange={(e) =>
                        workflowStore.updateNodeData(node.id, {
                          config: {
                            ...data.config,
                            initialPayload: e.target.value,
                          },
                        } as Partial<TriggerNodeData>)
                      }
                    />
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    style={{ background: 'var(--lc-primary-gradient)', border: 'none' }}
                    onClick={() => workflowStore.runTrigger(node.id, 'manual')}
                  >
                    立即运行
                  </Button>
                </div>
              );
            })()}
            {node.type !== 'triggerNode' && (
              <div style={{ fontSize: 13, color: 'var(--lc-text-secondary)' }}>
                当前节点的属性配置暂未实现。
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            width: 220,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            paddingLeft: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--lc-text-secondary)', marginBottom: 4 }}>下一个节点的输入</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
            {nextNodes.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>暂无下游节点</div>
            )}
            {nextNodes.map((n) => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: '#faad14',
                  }}
                />
                <span style={{ fontSize: 12, color: '#fff' }}>{n.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
});

