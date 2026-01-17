import type { NodeTypes } from '@xyflow/react';
import { AINode } from './AINode';
import { FileNode } from './FileNode';
import { TriggerNode } from './TriggerNode';

export const nodeTypes: NodeTypes = {
  aiNode: AINode,
  fileNode: FileNode,
  triggerNode: TriggerNode,
};

export { AINode, FileNode, TriggerNode };
export * from './BaseNode';
