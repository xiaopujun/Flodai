import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Segmented, Input, Button } from 'antd';
import { FileText, FolderOpen } from 'lucide-react';
import { useStore } from '../../../stores/RootStore';
import { BaseNode } from '../BaseNode';
import styles from './FileNode.module.less';

export interface FileNodeData extends Record<string, unknown> {
  path?: string;
  mode?: 'read' | 'write';
  content?: string;
}

export const FileNode = memo(({ data, selected, id }: NodeProps<ReactNode & { data: FileNodeData }>) => {
  const { workflowStore } = useStore();
  const mode = (data.mode as 'read' | 'write') || 'write';

  const handleModeChange = (value: string) => {
    workflowStore.updateNodeData(id, { mode: value });
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    workflowStore.updateNodeData(id, { path: e.target.value });
  };

  return (
    <BaseNode
      title="File System"
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
            { label: 'Read File', value: 'read' },
            { label: 'Write File', value: 'write' },
          ]}
          value={mode}
          onChange={handleModeChange}
          block
          style={{ marginBottom: 12 }}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>File Path</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <Input 
            value={data.path} 
            placeholder="/path/to/file.md" 
            size="small" 
            onChange={handlePathChange}
          />
          <Button icon={<FolderOpen size={14} />} size="small" />
        </div>
      </div>

      {mode === 'read' && (
        <div className={styles.inputGroup}>
          <label>Preview</label>
          <div className={styles.previewArea}>
            {data.content || '<No file loaded>'}
          </div>
        </div>
      )}
      
      {mode === 'write' && (
        <div className={styles.inputGroup}>
          <label>Status</label>
          <div style={{ fontSize: 12, color: 'var(--lc-text-secondary)' }}>
            Ready to write...
          </div>
        </div>
      )}
    </BaseNode>
  );
});
