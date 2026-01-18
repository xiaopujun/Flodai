import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot } from 'lucide-react';
import { useStore } from '../../../stores/RootStore';
import type { AINodeData, AINodeProps } from '../../../types/flow';
import styles from './AINode.module.less';

export const AINode = memo(({ id, data }: AINodeProps) => {
  const { uiStore } = useStore();
  const nodeData = data as AINodeData;
  const inputs = nodeData.inputs || [];
  const outputs = nodeData.outputs || [];
  const label = nodeData.name || '对话 AI';

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
      {inputs.map((port) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          style={{ background: '#fff' }}
        />
      ))}
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
        <Bot size={20} />
      </div>
      <div className={styles.compactLabel}>{label}</div>
    </div>
  );
});
