import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Select, Input } from 'antd';
import { Bot, Sparkles } from 'lucide-react';
import { useStore } from '../../../stores/RootStore';
import { BaseNode } from '../BaseNode';
import type { AINodeData, AINodeProps } from '../../../types/flow';
import styles from './AINode.module.less';

const { TextArea } = Input;

export const AINode = memo(({ data, selected, id }: AINodeProps) => {
  const { workflowStore } = useStore();
  const nodeData = data as AINodeData;

  const handleModelChange = (value: string) => {
    workflowStore.updateNodeData(id, { model: value });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    workflowStore.updateNodeData(id, { prompt: e.target.value });
  };

  return (
    <BaseNode
      title="AI 生成器"
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
        <label>模型</label>
        <Select
          defaultValue="gpt-4o"
          value={nodeData.model}
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
        <label>系统 / 提示词</label>
        <TextArea 
          placeholder="请输入对 AI 的指令..." 
          autoSize={{ minRows: 3, maxRows: 6 }}
          value={nodeData.prompt}
          onChange={handlePromptChange}
          variant="filled"
        />
      </div>

      <div className={styles.outputPreview}>
        <div className={styles.outputLabel}>
          <span>输出</span>
          {nodeData.isStreaming && <Sparkles size={12} className="animate-spin" />}
        </div>
        <div className={styles.content}>
          {nodeData.output || '等待执行...'}
        </div>
      </div>
    </BaseNode>
  );
});
