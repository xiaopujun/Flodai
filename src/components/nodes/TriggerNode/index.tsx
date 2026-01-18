import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlayCircle } from 'lucide-react';
import type { TriggerNodeData, TriggerNodeProps } from '../../../types/flow';
import styles from './TriggerNode.module.less';
import { useStore } from '../../../stores/RootStore';

export const TriggerNode = memo(({ data, id }: TriggerNodeProps) => {
  const { uiStore } = useStore();
  const nodeData = data as TriggerNodeData;
  const label = nodeData.name || '触发器';
  const outputs = nodeData.outputs || [];

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
      {outputs.map((port) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          style={{ background: '#fff' }}
        />
      ))}
      <div className={styles.compactIcon}>
        <PlayCircle size={20} />
      </div>
      <div className={styles.compactLabel}>{label}</div>
    </div>
  );
});
