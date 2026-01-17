import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Select, Input } from 'antd';
import { Bot, Sparkles } from 'lucide-react';
import { useStore } from '../../../stores/RootStore';
import { BaseNode } from '../BaseNode';
import styles from './AINode.module.less';

const { TextArea } = Input;

export interface AINodeData extends Record<string, unknown> {
  model?: string;
  prompt?: string;
  output?: string;
  isStreaming?: boolean;
}

export const AINode = memo(({ data, selected, id }: NodeProps<ReactNode & { data: AINodeData }>) => {
  const { workflowStore } = useStore();

  const handleModelChange = (value: string) => {
    workflowStore.updateNodeData(id, { model: value });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    workflowStore.updateNodeData(id, { prompt: e.target.value });
  };

  return (
    <BaseNode
      title="AI Generator"
      icon={<Bot size={16} />}
      selected={selected}
      headerStyle={{ background: 'var(--lc-primary-gradient)' }}
      handles={
        <>
          <Handle type="target" position={Position.Left} style={{ background: '#fff' }} />
          <Handle type="source" position={Position.Right} style={{ background: 'var(--lc-primary)' }} />
        </>
      }
    >
      <div className={styles.inputGroup}>
        <label>Model</label>
        <Select
          defaultValue="gpt-4o"
          value={data.model}
          style={{ width: '100%' }}
          options={[
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
            { value: 'local-llama3', label: 'Local: Llama 3 (8B)' },
          ]}
          onChange={handleModelChange}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>System / Prompt</label>
        <TextArea 
          placeholder="Enter instructions for the AI..." 
          autoSize={{ minRows: 3, maxRows: 6 }}
          value={data.prompt}
          onChange={handlePromptChange}
          variant="filled"
        />
      </div>

      <div className={styles.outputPreview}>
        <div className={styles.outputLabel}>
          <span>OUTPUT</span>
          {data.isStreaming && <Sparkles size={12} className="animate-spin" />}
        </div>
        <div className={styles.content}>
          {data.output || 'Waiting for execution...'}
        </div>
      </div>
    </BaseNode>
  );
});
