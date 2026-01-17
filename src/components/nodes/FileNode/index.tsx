import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Segmented, Input, Button } from 'antd';
import { FileText, FolderOpen } from 'lucide-react';
import { useStore } from '../../../stores/RootStore';
import { BaseNode } from '../BaseNode';
import type { FileNodeData, FileNodeProps } from '../../../types/flow';
import styles from './FileNode.module.less';

export const FileNode = memo(({ data, selected, id }: FileNodeProps) => {
  const { workflowStore } = useStore();
  const nodeData = data as FileNodeData;
  const mode = (nodeData.mode as 'read' | 'write') || 'write';

  const handleModeChange = (value: string) => {
    workflowStore.updateNodeData(id, { mode: value });
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    workflowStore.updateNodeData(id, { path: e.target.value });
  };

  return (
    <BaseNode
      title="文件系统"
      icon={<FileText size={16} />}
      selected={selected}
      headerStyle={{ background: 'var(--lc-info-gradient)' }}
      handles={
        <>
          <Handle type="target" position={Position.Left} id="in" style={{ background: '#fff' }} />
          <Handle type="source" position={Position.Right} id="out" style={{ background: 'var(--lc-info)' }} />
        </>
      }
    >
      <div className={styles.inputGroup}>
        <Segmented
          options={[
            { label: '读取', value: 'read' },
            { label: '写入', value: 'write' },
          ]}
          value={mode}
          onChange={handleModeChange}
          block
          style={{ marginBottom: 12 }}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>文件路径</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <Input 
            value={nodeData.path} 
            placeholder="例如：/path/to/file.md" 
            size="small" 
            onChange={handlePathChange}
          />
          <Button icon={<FolderOpen size={14} />} size="small" />
        </div>
      </div>

      {mode === 'read' && (
        <div className={styles.inputGroup}>
          <label>预览</label>
          <div className={styles.previewArea}>
            {nodeData.content || '<未加载文件>'}
          </div>
        </div>
      )}
      
      {mode === 'write' && (
        <div className={styles.inputGroup}>
          <label>状态</label>
          <div style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>
            准备写入...
          </div>
        </div>
      )}
    </BaseNode>
  );
});
