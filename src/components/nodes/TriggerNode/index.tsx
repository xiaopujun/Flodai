import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlayCircle } from 'lucide-react';
import { BaseNode } from '../BaseNode';
import type { TriggerNodeData, TriggerNodeProps } from '../../../types/flow';
import styles from './TriggerNode.module.less';
import { useStore } from '../../../stores/RootStore';

function formatDateTime(value?: string): string {
  if (!value) return '从未执行';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (v: number) => v.toString().padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${m}-${d} ${h}:${mi}:${s}`;
}

export const TriggerNode = memo(({ data, selected, id }: TriggerNodeProps) => {
  const { uiStore } = useStore();
  const nodeData = data as TriggerNodeData;
  const label = nodeData.label || '触发器';
  const enabled = nodeData.enabled ?? true;
  const mode = nodeData.mode ?? 'manual';
  const scheduleTime = nodeData.scheduleTime;
  const lastRunAt = nodeData.lastRunAt;

  const modeText = mode === 'manual' ? '手动触发' : '定时触发';
  const scheduleText = mode === 'manual' ? '—' : scheduleTime || '未设置';
  const statusText = enabled ? '已启用' : '已停用';
  const compact = uiStore.nodeDisplayMode === 'compact';

  if (compact) {
    return (
      <div
        className={styles.compactNode}
        onPointerEnter={(event) => {
          const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
          uiStore.showNodeHoverDetail(id, {
            x: rect.right + 12,
            y: rect.top + rect.height / 2,
          });
        }}
        onPointerLeave={() => uiStore.hideNodeHoverDetail()}
      >
        <Handle type="source" position={Position.Right} style={{ background: '#fff' }} />
        <div className={styles.compactIcon}>
          <PlayCircle size={20} />
        </div>
        <div className={styles.compactLabel}>{label}</div>
      </div>
    );
  }

  return (
    <BaseNode
      title={label}
      icon={<PlayCircle size={16} />}
      selected={selected}
      headerStyle={{ background: 'var(--lc-success-gradient)' }}
      handles={
        <Handle type="source" position={Position.Right} style={{ background: 'var(--lc-success)' }} />
      }
    >
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>模式</span>
        <span className={styles.metaValue}>{modeText}</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>计划时间</span>
        <span className={styles.metaValue}>{scheduleText}</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>状态</span>
        <span className={styles.metaValue}>{statusText}</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>上次执行</span>
        <span className={styles.metaValue}>{formatDateTime(lastRunAt)}</span>
      </div>
    </BaseNode>
  );
});
